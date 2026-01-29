// CARETI MODIFICATION: Tauri - cline-core stdio 브릿지 구현
use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter, Manager};

// cline-core 프로세스 상태
struct ClineCoreProcess {
    child: Child,
    stdin: std::process::ChildStdin,
}

// 전역 상태: cline-core 프로세스 참조
struct AppState {
    cline_core: Mutex<Option<ClineCoreProcess>>,
}

// gRPC 요청 형식 (webview → Tauri → cline-core)
#[derive(Debug, Serialize, Deserialize)]
struct GrpcRequest {
    service: String,
    method: String,
    message: serde_json::Value,
    request_id: String,
    is_streaming: bool,
}

// stdio 요청 형식
#[derive(Debug, Serialize, Deserialize)]
struct StdioRequest {
    #[serde(rename = "type")]
    msg_type: String,
    grpc_request: GrpcRequest,
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

// webview로부터 받는 메시지 형식
#[derive(Debug, Deserialize)]
struct WebviewMessage {
    #[serde(rename = "type")]
    msg_type: Option<String>,
    grpc_request: Option<GrpcRequest>,
}

/// cline-core 프로세스 시작
fn spawn_cline_core(app_handle: &AppHandle) -> Result<ClineCoreProcess, String> {
    // 개발 모드에서는 node로 직접 실행, 배포 시에는 번들된 바이너리 사용
    let cline_core_path = std::env::var("CLINE_CORE_PATH")
        .unwrap_or_else(|_| "node".to_string());

    // 하드코딩된 프로젝트 루트 경로 (개발용)
    // TODO: 배포 시에는 리소스 경로 사용
    let cline_core_script = std::env::var("CLINE_CORE_SCRIPT")
        .unwrap_or_else(|_| "/home/luke/dev/project-careti-standalone/dist-standalone/cline-core.js".to_string());

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
                    println!("[cline-core→Tauri] {}", &json_line[..json_line.len().min(200)]);

                    // JSON 파싱 및 webview로 이벤트 발송
                    match serde_json::from_str::<StdioResponse>(&json_line) {
                        Ok(response) => {
                            if let Err(e) = app_handle_clone.emit("grpc_response", &response) {
                                eprintln!("[Careti] Failed to emit grpc_response: {}", e);
                            }
                        }
                        Err(e) => {
                            eprintln!("[Careti] Failed to parse cline-core response: {}", e);
                        }
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
    println!("[Tauri←webview] {}", &message[..message.len().min(200)]);

    // webview 메시지 파싱
    let parsed: WebviewMessage = serde_json::from_str(&message)
        .map_err(|e| format!("Failed to parse message: {}", e))?;

    // grpc_request가 있으면 stdio 형식으로 변환하여 cline-core로 전달
    if let Some(grpc_request) = parsed.grpc_request {
        let stdio_request = StdioRequest {
            msg_type: "grpc_request".to_string(),
            grpc_request,
        };

        let json = serde_json::to_string(&stdio_request)
            .map_err(|e| format!("Failed to serialize request: {}", e))?;

        send_to_cline_core(&state, &json, Some(&app))?;

        // 실제 응답은 grpc_response 이벤트로 전달됨
        Ok(r#"{"type":"ack","sent":true}"#.to_string())
    } else {
        // 기타 메시지 타입 처리
        Ok(r#"{"type":"ack","received":true}"#.to_string())
    }
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
            select_workspace_folder
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
                    // 개발 모드에서는 cline-core 없이도 앱 실행 허용
                    eprintln!("[Careti] Running without cline-core (dev mode)");
                }
            }

            // webview에 standalonePostMessage 브릿지 주입
            let main_window = app.get_webview_window("main").unwrap();
            main_window.eval(r#"
                (function() {
                    // CARETI: Standalone 모드 플래그 및 클라이언트 ID 설정
                    window.__is_standalone__ = true;
                    window.clineClientId = 'standalone-' + Date.now();
                    console.log('[Careti] Standalone mode initialized, clientId:', window.clineClientId);

                    // Tauri 이벤트 리스너 설정 - cline-core 응답 수신
                    if (window.__TAURI__) {
                        window.__TAURI__.event.listen('grpc_response', (event) => {
                            console.log('[Careti] grpc_response received:', event.payload);
                            // webview-ui의 메시지 핸들러로 전달
                            window.postMessage(event.payload, '*');
                        });
                    }

                    // standalonePostMessage 브릿지 설정
                    window.standalonePostMessage = async function(messageJson) {
                        try {
                            const response = await window.__TAURI__.core.invoke('proto_bus_message', { message: messageJson });
                            console.log('[standalonePostMessage] Ack:', response);
                        } catch (error) {
                            console.error('[standalonePostMessage] Error:', error);
                        }
                    };

                    // 스트림 취소 함수
                    window.cancelStream = async function(requestId) {
                        try {
                            await window.__TAURI__.core.invoke('cancel_stream', { requestId: requestId });
                            console.log('[cancelStream] Cancelled:', requestId);
                        } catch (error) {
                            console.error('[cancelStream] Error:', error);
                        }
                    };

                    // 작업 폴더 선택 함수 (Rust 커맨드 호출)
                    window.selectWorkspaceFolder = async function() {
                        try {
                            const selected = await window.__TAURI__.core.invoke('select_workspace_folder');
                            if (selected) {
                                console.log('[selectWorkspaceFolder] Selected:', selected);
                                // cline-core에 작업 폴더 변경 알림
                                const request = {
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

                    console.log('[Careti] Standalone bridge with streaming support initialized');
                })();
            "#).ok();

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
