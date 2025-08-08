# Task #006-4: 업스트림 병합 후 컴파일 에러 트리아지 및 수정 계획

- 작성일: 2025-08-08
- 상위 작업: [Task #006: 업스트림 병합 충돌 해결 계획](./006-upstream-merge-conflict-resolution-plan.md)
- 선행 작업: [006-1 타입 정의 병합](./006-1-resolve-type-definition-conflicts.md), [006-2 Controller 병합](./006-2-resolve-controller-conflicts.md), [006-3 Cline Account 타입 분석](./006-3-analyze-cline-account-changes.md)
- 목표: `npm run compile` 기준 현재 컴파일 실패 원인을 유형별로 분류하고, 단계적 수정 계획과 검증 절차를 수립한다.

---

## 1) 현재 상태

다음 명령 실행 결과, 다수의 TS 오류가 발생 중입니다.

```bash
npm run compile
```

주요 에러 그룹은 아래와 같습니다.

### A. WebviewProvider API 변경 반영 필요
- 증상:
  - `src/core/webview/index.ts`: `./getUri` 모듈 누락, 콜백 시그니처 불일치
  - `src/extension.ts`: `getActiveInstance`, `getWebview` 등이 존재하지 않는 API 사용
  - `hosts/*WebviewProvider.ts`: base `WebviewProvider`와의 호환성 오류 (private `disposables` 선언 불일치 등)
- 원인 가설: Upstream에서 `WebviewProvider` 구조/팩토리 인터페이스 시그니처가 변경됨

### B. ProtoBus/Host Bridge 생성물 경로/타입 불일치
- 증상:
  - `src/generated/hosts/*/protobus-services.ts`, `protobus-server-setup.ts`에서 `@core/controller/*` 경로 모듈을 찾지 못함
  - 중복 식별자(`openFile`) 및 `@generated/grpc-js` 내 `cline` export 미존재
- 원인 가설: Upstream의 proto 디렉토리 구조/서비스 구성 변경에 따른 코드 생성 템플릿/경로 매핑 불일치

### C. Proto conversion 대응 필요 (이름/위치 변경)
- 증상:
  - `src/shared/proto-conversions/cline-message.ts`: `CHATBOT_MODE_RESPOND`, `ASK_BROWSER_ACTION` 등 심볼 누락
  - `src/shared/proto-conversions/state/chat-settings-conversion.ts`: `@shared/proto/cline/state` 내 `ChatSettings`, `ChatbotAgentMode` 미존재
- 원인 가설: Upstream의 proto 메시지/enum 명칭 혹은 모듈 경로 변경

### D. 서비스 시그니처/타입 소소한 불일치
- 증상:
  - `AuthServiceMock`가 `AuthService` 시그니처와 불일치
  - 일부 파일의 `implicit any` 경고 (`detect-omission.ts`, `process-files.ts`, `TelemetryService.ts` 등)

### E. 설정/모델 타입 갭
- 증상:
  - `settings-conversion.ts`: `ApiConfiguration`에 `caretApiKey` 속성 없음
- 원인 가설: 모델/설정 스키마가 Upstream 기준으로 갱신됨

---

## 2) 수정 전략 (단계별)

### Phase A: WebviewProvider 동기화
- 작업:
  - Upstream의 `WebviewProvider` 최신 정의를 기준으로, `src/core/webview/index.ts`, `src/extension.ts`, `hosts/vscode/VscodeWebviewProvider.ts`, `hosts/external/ExternalWebviewProvider.ts`를 정렬
  - 제거된 API(`getWebview`, `getActiveInstance`) 호출부 교체
  - 누락된 유틸(`getUri`)은 Upstream 대응 모듈로 치환 또는 로컬 구현
- 결과: 확장 진입/웹뷰 초기화 경로의 타입 오류 해소

### Phase B: ProtoBus/Host Bridge 경로 재정렬
- 작업:
  - `scripts/build-proto.mjs` 템플릿/경로 매핑 점검 및 수정
  - 생성물의 import가 현 디렉토리 구조(`hosts/vscode/hostbridge/...`)와 일치하도록 조정
  - 중복 식별자/누락 export 정리 후 `npm run protos` 재생성
- 결과: `src/generated/hosts/*` 관련 컴파일 오류 제거

### Phase C: Proto conversion 업데이트
- 작업:
  - 최신 proto에서 변경(이름/위치)된 enum/메시지에 맞춰 `src/shared/proto-conversions/*` 갱신
  - `state` 관련 모듈 경로/타입 실체 재매핑
- 결과: 메시지/설정 변환 계층 컴파일 성공

### Phase D: 서비스 시그니처/타입 정합화
- 작업:
  - `AuthServiceMock` 시그니처를 `AuthService`에 맞게 수정
  - `implicit any` 경고 최소 수준으로 타입 보강
- 결과: 서비스/통합 보조 코드의 타입 오류 제거

### Phase E: 설정 스키마 반영
- 작업:
  - `ApiConfiguration` 최신 스키마에 맞춰 `settings-conversion.ts`에서 제거/대체
- 결과: 설정 변환 관련 오류 제거

---

## 3) 실행 순서 및 체크리스트

1. [ ] Phase A 적용 후 `npm run compile`
2. [ ] Phase B 적용 후 `npm run protos; npm run compile`
3. [ ] Phase C 적용 후 `npm run compile`
4. [ ] Phase D 적용 후 `npm run compile`
5. [ ] Phase E 적용 후 `npm run compile`
6. [ ] `npm run build:webview` 성공 확인
7. [ ] 핵심 통합 테스트: `npm run test:all && npm run caret:coverage`

---

## 4) 수용/보존 원칙
- Cline 구조/시그니처 변경은 가급적 수용하여 호환성 확보
- Caret 고유 기능(`// CARET MODIFICATION`)은 보존하되, 새로운 구조에 맞추어 최소 변경으로 재배치

---

## 5) 완료 기준 (Acceptance)
- `npm run compile` 무오류
- `npm run build:webview` 성공
- Upstream 웹뷰/HostBridge/ProtoBus 경로/타입 동작 일체 정상화
- 필수 테스트 통과 및 커버리지 리그레션 없음

---

## 6) 참고 (현 에러 샘플)
- `src/core/webview/index.ts`: TS2307, TS2345, TS7006
- `src/extension.ts`: TS2339, TS2345
- `src/generated/hosts/*`: TS2307, TS2300, TS2305
- `hosts/vscode/VscodeWebviewProvider.ts`: TS2415, TS4113/4114, TS2554
- `proto-conversions/*`: TS2339, TS2305
- 기타: `AuthServiceMock`, `TelemetryService`, `process-files` implicit any
