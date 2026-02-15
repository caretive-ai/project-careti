// CARETI MODIFICATION: Tauri - cline-core stdio 브릿지 구현
use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter, Manager, WebviewWindowBuilder, WebviewUrl};

// cline-core 프로세스 상태
struct ClineCoreProcess {
    child: Child,
    stdin: std::process::ChildStdin,
}

// 전역 상태: cline-core 프로세스 참조
struct AppState {
    cline_core: Mutex<Option<ClineCoreProcess>>,
}

// stdio 응답 형식
// webview는 is_streaming: false 로 스트림 종료를 판단
#[derive(Debug, Serialize, Deserialize, Clone)]
struct GrpcResponse {
    message: serde_json::Value,
    request_id: String,
    is_streaming: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct StdioResponse {
    #[serde(rename = "type")]
    msg_type: String,
    grpc_response: GrpcResponse,
}

/// cline-core 프로세스 시작
fn spawn_cline_core(app_handle: &AppHandle) -> Result<ClineCoreProcess, String> {
    // 개발 모드에서는 node로 직접 실행, 배포 시에는 번들된 바이너리 사용
    let cline_core_path = std::env::var("CLINE_CORE_PATH")
        .unwrap_or_else(|_| "node".to_string());

    // 하드코딩된 프로젝트 루트 경로 (개발용)
    // TODO: 배포 시에는 리소스 경로 사용
    let cline_core_script = std::env::var("CLINE_CORE_SCRIPT")
        .unwrap_or_else(|_| "/home/luke/dev/project-careti/dist-standalone/cline-core.js".to_string());

    println!("[Careti] Starting cline-core: {} {}", cline_core_path, cline_core_script);

    let mut child = if cline_core_path == "node" {
        Command::new(&cline_core_path)
            .arg(&cline_core_script)
            .arg("--stdio")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("Failed to spawn cline-core: {}", e))?
    } else {
        // 번들된 바이너리 직접 실행
        Command::new(&cline_core_path)
            .arg("--stdio")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("Failed to spawn cline-core: {}", e))?
    };

    let stdin = child.stdin.take()
        .ok_or_else(|| "Failed to get cline-core stdin".to_string())?;
    let stdout = child.stdout.take()
        .ok_or_else(|| "Failed to get cline-core stdout".to_string())?;

    // stdout 읽기 스레드 시작 - 응답을 webview로 전달
    let app_handle_clone = app_handle.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            match line {
                Ok(json_line) => {
                    if json_line.trim().is_empty() {
                        continue;
                    }
                    // JSON 줄만 파싱 시도, 나머지는 로그로 출력
                    let trimmed = json_line.trim_start();
                    if trimmed.starts_with('{') {
                        match serde_json::from_str::<StdioResponse>(&json_line) {
                            Ok(response) => {
                                if let Err(e) = app_handle_clone.emit("grpc_response", &response) {
                                    eprintln!("[Careti] Failed to emit grpc_response: {}", e);
                                }
                            }
                            Err(_) => {
                                // JSON이지만 StdioResponse 형식이 아닌 경우 (무시)
                            }
                        }
                    } else {
                        println!("[cline-core] {}", &json_line[..json_line.len().min(200)]);
                    }
                }
                Err(e) => {
                    eprintln!("[Careti] Error reading cline-core stdout: {}", e);
                    break;
                }
            }
        }
        println!("[Careti] cline-core stdout reader ended");
    });

    Ok(ClineCoreProcess { child, stdin })
}

/// cline-core로 메시지 전송 (크래시 시 재시작 시도)
fn send_to_cline_core(state: &AppState, message: &str, app_handle: Option<&AppHandle>) -> Result<(), String> {
    let mut guard = state.cline_core.lock()
        .map_err(|e| format!("Failed to lock cline_core state: {}", e))?;

    if let Some(ref mut process) = *guard {
        // 프로세스가 아직 살아있는지 확인
        match process.child.try_wait() {
            Ok(Some(status)) => {
                // 프로세스가 종료됨 - 재시작 시도
                eprintln!("[Careti] cline-core process exited with status: {:?}", status);
                *guard = None; // 기존 프로세스 정리
                drop(guard); // 락 해제

                // 재시작 시도
                if let Some(handle) = app_handle {
                    return restart_cline_core(state, handle, message);
                } else {
                    return Err("cline-core process died and no app handle for restart".to_string());
                }
            }
            Ok(None) => {
                // 프로세스가 아직 실행 중
            }
            Err(e) => {
                eprintln!("[Careti] Failed to check cline-core status: {}", e);
            }
        }

        // 메시지 전송 시도
        match writeln!(process.stdin, "{}", message) {
            Ok(_) => {
                process.stdin.flush()
                    .map_err(|e| format!("Failed to flush cline-core stdin: {}", e))?;
                Ok(())
            }
            Err(e) => {
                eprintln!("[Careti] Failed to write to cline-core stdin: {}", e);
                // 쓰기 실패 - 프로세스가 죽었을 수 있음
                *guard = None;
                drop(guard);

                if let Some(handle) = app_handle {
                    return restart_cline_core(state, handle, message);
                } else {
                    return Err(format!("Failed to write to cline-core stdin: {}", e));
                }
            }
        }
    } else {
        // 프로세스가 없음 - 시작 시도
        drop(guard);
        if let Some(handle) = app_handle {
            return restart_cline_core(state, handle, message);
        }
        Err("cline-core process not running".to_string())
    }
}

/// cline-core 프로세스 재시작
fn restart_cline_core(state: &AppState, app_handle: &AppHandle, message: &str) -> Result<(), String> {
    eprintln!("[Careti] Attempting to restart cline-core...");

    match spawn_cline_core(app_handle) {
        Ok(process) => {
            let mut guard = state.cline_core.lock()
                .map_err(|e| format!("Failed to lock state for restart: {}", e))?;
            *guard = Some(process);
            eprintln!("[Careti] cline-core restarted successfully");
            drop(guard);

            // 재시작 후 잠시 대기 (초기화 시간)
            std::thread::sleep(std::time::Duration::from_millis(500));

            // 원래 메시지 다시 전송
            send_to_cline_core(state, message, None)
        }
        Err(e) => {
            Err(format!("Failed to restart cline-core: {}", e))
        }
    }
}

/// Proto bus message handler - webview에서 메시지 수신
#[tauri::command]
async fn proto_bus_message(
    app: AppHandle,
    message: String,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<String, String> {
    // webview 메시지를 cline-core로 전달
    // grpc_request_cancel → cancel_stream 형식 변환
    let forwarded = if let Ok(val) = serde_json::from_str::<serde_json::Value>(&message) {
        if val.get("type").and_then(|t| t.as_str()) == Some("grpc_request_cancel") {
            if let Some(request_id) = val.get("grpc_request_cancel")
                .and_then(|c| c.get("request_id"))
                .and_then(|r| r.as_str())
            {
                serde_json::json!({
                    "type": "cancel_stream",
                    "request_id": request_id
                }).to_string()
            } else {
                message.clone()
            }
        } else {
            message.clone()
        }
    } else {
        message.clone()
    };

    send_to_cline_core(&state, &forwarded, Some(&app))?;
    Ok(r#"{"type":"ack","sent":true}"#.to_string())
}

/// 스트림 취소 요청
#[tauri::command]
async fn cancel_stream(
    app: AppHandle,
    request_id: String,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let cancel_msg = serde_json::json!({
        "type": "cancel_stream",
        "request_id": request_id
    });

    send_to_cline_core(&state, &cancel_msg.to_string(), Some(&app))
}

/// cline-core 상태 확인
#[tauri::command]
async fn get_cline_core_status(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<bool, String> {
    let guard = state.cline_core.lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    Ok(guard.is_some())
}

// Legacy greet command (테스트용)
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Webview 진단 로그 - webview의 console.log를 터미널에서 확인
#[tauri::command]
fn diag_log(message: String) {
    println!("[WEBVIEW] {}", message);
}

/// 작업 폴더 선택 다이얼로그
#[tauri::command]
async fn select_workspace_folder(app: AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    use tokio::sync::oneshot;

    let (tx, rx) = oneshot::channel();

    app.dialog()
        .file()
        .set_title("작업 폴더 선택")
        .pick_folder(move |path| {
            let result = path.map(|p| p.to_string());
            let _ = tx.send(result);
        });

    rx.await.map_err(|e| format!("Dialog error: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Arc::new(AppState {
            cline_core: Mutex::new(None),
        }))
        .invoke_handler(tauri::generate_handler![
            greet,
            proto_bus_message,
            cancel_stream,
            get_cline_core_status,
            select_workspace_folder,
            diag_log
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();
            let state = app.state::<Arc<AppState>>();

            // cline-core 프로세스 시작
            match spawn_cline_core(&app_handle) {
                Ok(process) => {
                    let mut guard = state.cline_core.lock().unwrap();
                    *guard = Some(process);
                    println!("[Careti] cline-core started successfully");
                }
                Err(e) => {
                    eprintln!("[Careti] Failed to start cline-core: {}", e);
                    eprintln!("[Careti] Running without cline-core (dev mode)");
                }
            }

            // initialization_script: 매 페이지 로드 시 HTML 파싱 전에 실행됨.
            // eval()과 달리, devUrl에서 페이지가 교체되어도 유지됨.
            let bridge_script = r#"
                (function() {
                    if (window.__CARETI_BRIDGE_INITIALIZED__) return;
                    window.__CARETI_BRIDGE_INITIALIZED__ = true;

                    window.__is_standalone__ = true;
                    window.clineClientId = 'standalone-' + Date.now();

                    // standalonePostMessage: __TAURI_INTERNALS__.invoke 직접 사용
                    window.standalonePostMessage = async function(messageJson) {
                        try {
                            await window.__TAURI_INTERNALS__.invoke('proto_bus_message', { message: messageJson });
                        } catch (error) {
                            console.error('[standalonePostMessage] Error:', error);
                        }
                    };

                    window.cancelStream = async function(requestId) {
                        try {
                            await window.__TAURI_INTERNALS__.invoke('cancel_stream', { requestId: requestId });
                        } catch (error) {
                            console.error('[cancelStream] Error:', error);
                        }
                    };

                    window.selectWorkspaceFolder = async function() {
                        try {
                            var selected = await window.__TAURI_INTERNALS__.invoke('select_workspace_folder');
                            if (selected) {
                                var request = {
                                    type: 'grpc_request',
                                    grpc_request: {
                                        service: 'cline.WorkspaceService',
                                        method: 'setWorkspacePath',
                                        message: { path: selected },
                                        request_id: 'workspace-' + Date.now(),
                                        is_streaming: false
                                    }
                                };
                                await window.standalonePostMessage(JSON.stringify(request));
                                return selected;
                            }
                            return null;
                        } catch (error) {
                            console.error('[selectWorkspaceFolder] Error:', error);
                            return null;
                        }
                    };

                    console.log('[Careti] Bridge initialized, clientId=' + window.clineClientId);
                })();
            "#;

            // 메인 윈도우를 프로그래밍 방식으로 생성 (initialization_script 사용)
            let _main_window = WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::default(), // devUrl 또는 frontendDist 자동 사용
            )
            .title("Careti")
            .inner_size(368.0, 1024.0)
            .resizable(true)
            .initialization_script(bridge_script)
            .build()?;

            println!("[Careti] Main window created with initialization_script");

            // 아바타 윈도우 (기능 비활성화 상태이므로 생성은 선택적)
            // let _avatar_window = WebviewWindowBuilder::new(
            //     app,
            //     "avatar",
            //     WebviewUrl::App("/avatar".into()),
            // )
            // .title("Caret VTuber")
            // .inner_size(300.0, 400.0)
            // .transparent(true)
            // .decorations(false)
            // .always_on_top(true)
            // .skip_taskbar(true)
            // .resizable(true)
            // .initialization_script(bridge_script)
            // .build()?;

            Ok(())
        })
        .on_window_event(|window, event| {
            // 앱 종료 시 cline-core 프로세스 정리
            if let tauri::WindowEvent::Destroyed = event {
                let state: tauri::State<'_, Arc<AppState>> = window.state();
                let state_clone = (*state).clone();
                // Mutex guard를 명시적으로 드롭하여 라이프타임 문제 해결
                {
                    if let Ok(mut guard) = state_clone.cline_core.lock() {
                        if let Some(mut process) = guard.take() {
                            println!("[Careti] Terminating cline-core process...");
                            let _ = process.child.kill();
                        }
                    }
                };
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
