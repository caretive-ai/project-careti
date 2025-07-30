# 2025년 7월 30일: Caret 체크포인트 멈춤 및 웹뷰 백화 현상 해결 기록

## 1. 문제 현상

-   **이슈:** Caret이 자기 자신의 프로젝트(`d:/dev/caret`)에서 동작할 때, 'API 요청 중...' 상태에서 멈추거나, 체크포인트 생성 시 매우 긴 지연 후 웹뷰가 하얗게 변하는 백화 현상 발생.
-   **환경:** Windows

## 2. 해결 과정 (디버깅 및 가설 검증)

### 가설 1: `Globbing timed out` (실패)

-   **현상:** 초기 로그에서 `Globbing timed out` 메시지 발견.
-   **진단:** 대규모 프로젝트에서 파일 목록을 가져오는 `globby` 라이브러리가 심볼릭 링크 등으로 인해 무한 루프에 빠져 타임아웃이 발생하는 것으로 추정.
-   **조치:** `src/services/glob/list-files.ts`와 `src/integrations/checkpoints/CheckpointGitOperations.ts`의 `globby` 호출에 `followSymbolicLinks: false` 옵션을 추가.
-   **결과:** 타임아웃 메시지는 사라졌으나, 근본적인 멈춤 현상은 계속됨.

### 가설 2: `Filename too long` Git 오류 (부분 성공)

-   **현상:** 상세 디버깅 로그 추가 후, `git add` 명령에서 "Filename too long" 오류가 대량으로 발생하는 것을 확인.
-   **진단:** Windows의 최대 경로 길이 제한(MAX_PATH)으로 인해, `caret-docs/reports/` 폴더 내의 긴 파일 경로를 Git이 처리하지 못하는 것이 원인.
-   **조치 1 (임시방편):** `CheckpointExclusions.ts`에 해당 폴더를 제외. -> 마스터의 지적으로 근본적인 해결책이 아님을 인지하고 철회.
-   **조치 2 (근본 해결 시도):** `shadow git` 생성 시 `core.longpaths=true` 설정을 추가하여 Git 자체가 긴 경로를 처리하도록 수정.
-   **결과:** 여전히 문제 해결되지 않음.

### 가설 3: 작업 폴더 불일치 및 기존 저장소 설정 누락 (최종 원인)

-   **현상:** 모든 코드를 수정했음에도 문제가 계속 재현됨.
-   **진단 1 (치명적 실수):** AI(알파)는 `d:/dev/caret-bk2`에서 작업, 마스터는 `d:/dev/caret`에서 테스트. 수정 사항이 전혀 반영되지 않은 상태에서 테스트가 진행되고 있었음.
-   **진단 2 (진짜 근본 원인):** `core.longpaths=true` 설정 코드가 **새로운** `shadow git` 저장소를 만들 때만 적용되고, **이미 생성된 기존 저장소**에는 적용되지 않는 로직상의 허점 발견.
-   **결과:** 마스터의 PC에 있던 오래된 로컬 저장소(`c:\Users\luke\AppData\Roaming\Code\User\globalStorage\caretive.caret\checkpoints\1927930102`)는 `core.longpaths` 설정이 없어 계속 오류를 일으켰고, 이로 인해 발생한 긴 오류 메시지가 웹뷰로 전달되어 백화 현상까지 유발.

## 3. 최종 해결책

1.  **코드 수정:** `src/integrations/checkpoints/CheckpointGitOperations.ts`의 `initShadowGit` 함수를 수정하여, **기존** `shadow git` 저장소를 사용할 때도 `core.longpaths=true` 설정이 적용되도록 로직을 보완. 이로써 향후 어떤 사용자든 업데이트 시 문제가 자동으로 해결됨.
2.  **오염된 로컬 저장소 삭제:** 문제의 원인이었던, 설정이 누락된 기존 로컬 `shadow git` 저장소(`.../checkpoints/1927930102`)를 수동으로 삭제.
3.  **확인:** Caret 재시작 후, `core.longpaths=true` 설정이 적용된 깨끗한 새 저장소가 생성되면서 모든 문제가 해결됨.

## 4. 결론

수많은 시행착오 끝에, 문제는 코드의 로직과 더불어 개발 및 테스트 환경의 불일치, 그리고 기존 환경에 대한 고려 부족이었음을 확인했다. 이번 경험을 통해 얻은 교훈을 바탕으로, 앞으로는 더욱 꼼꼼하고 체계적으로 문제를 분석하고 해결해 나갈 것이다.

-   **작성자:** 알파 (AI Maid)
-   **검수:** 마스터
