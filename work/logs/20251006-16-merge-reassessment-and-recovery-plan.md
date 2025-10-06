# Cline 병합 재점검 및 복구 계획

## 1. 배경
- 2025년 10월 6일자 Cline upstream 병합 작업이 컴파일 오류로 중단되었습니다.
- 오류 수정 과정에서 병합 상태가 손상되었을 가능성이 제기되어, 전체적인 재점검을 통해 현재 상태를 명확히 진단하고 복구 계획을 수립합니다.

## 2. 현재 병합 상태 종합 점검

| 단계 | 파일/작업 | 상태 | 비고 |
| --- | --- | --- | --- |
| **Phase 0** | 브랜치 생성 | ✅ 완료 | `feature/cline-merge-20251006` 브랜치에서 작업 중. |
| **Phase 1** | **기반 파일 병합** | | |
| | `proto/cline/models.proto` | ⚠️ 완료 (수정 필요) | Caret 고유 필드는 추가되었으나, `ApiProvider`의 `CARET` enum 값이 계획(`1000`)과 다른 `35`로 설정됨. **향후 충돌 위험.** |
| | `package.json` | ✅ 완료 | `vitest` 의존성 및 관련 스크립트가 올바르게 병합됨. |
| | `.github/workflows/` | ✅ 완료 | CI 워크플로우가 `vitest` 기반 테스트를 실행하도록 올바르게 수정됨. |
| **Phase 2** | **핵심 로직 병합** | | |
| | `src/extension.ts` | ❌ 미완료 | `CaretProviderWrapper` 등 핵심 아키텍처는 적용되었으나, 최신 Cline의 `getBinaryLocation` 관련 로직이 **누락됨.** |
| | 상태 관리 시스템 | ✅ 완료 | `ExtensionMessage.ts`, `state-keys.ts`, `state-helpers.ts`에 Caret 고유 상태가 올바르게 재적용됨. |
| **Phase 3** | **UI 및 기능 통합** | | |
| | `ChatTextArea.tsx` | ✅ 완료 | Caret의 `useInputHistory` 훅이 올바르게 재통합됨. |
| | 기타 UI 컴포넌트 | ❓ 미확인 | `SettingsView.tsx`, i18n 시스템 전반의 리팩토링 등은 중단으로 인해 진행되지 않았을 가능성이 높음. |

## 3. 중단 원인 분석
- **직접적인 원인**: `src/extension.ts` 파일 병합 시, 최신 Cline에 추가된 `getBinaryLocation` 함수와 이를 `HostProvider.initialize`에 전달하는 로직이 누락되었습니다.
- **결과**: 이로 인해 `HostProvider` 초기화 시점의 함수 시그니처가 맞지 않아 **컴파일 오류가 발생**했으며, 이 문제를 해결하는 과정에서 작업이 중단된 것으로 보입니다.
- **현재 상태 결론**: 코드가 복구 불가능하게 손상된 것은 아니나, **"병합이 불완전하게 완료된 상태"**입니다.

## 4. 남은 작업 및 복구 계획 (체크리스트)

### **Step 1: `src/extension.ts` 복구 (가장 시급)**
- [ ] `cline-latest/src/extension.ts`에서 `getBinaryLocation` 함수 전체를 복사하여 `src/extension.ts`에 추가합니다.
- [ ] `src/extension.ts`의 `setupHostProvider` 함수를 최신 Cline 버전과 동일하게 수정하여, `getBinaryLocation`을 `HostProvider.initialize`의 인자로 전달하도록 변경합니다.

### **Step 2: `proto/cline/models.proto` 수정**
- [ ] `ApiProvider` enum의 `CARET` 값을 `35`에서 `1000`으로 수정하여 향후 `upstream`과의 충돌을 방지합니다.
- [ ] `npm run protos` 명령을 실행하여 Protobuf 관련 타입 정의를 다시 생성합니다.

### **Step 3: 컴파일 및 잔여 오류 수정**
- [ ] `npm run compile` 명령을 실행합니다.
- [ ] 위의 두 단계 수정 후에도 남아있는 타입 오류가 있다면 모두 해결합니다.

### **Step 4: Phase 3 (UI 병합) 재개**
- [ ] 원본 계획에 따라 `webview-ui/src/components/settings/SettingsView.tsx` 등 주요 UI 컴포넌트의 병합을 진행합니다.
- [ ] Cline에서 새로 추가되거나 수정된 모든 `*.tsx` 컴포넌트에 Caret의 i18n 시스템(`t()` 함수)을 적용합니다.

### **Step 5: 최종 검증**
- [ ] `npm run test:webview`를 실행하여 모든 프론트엔드 테스트가 통과하는지 확인하고, 실패하는 테스트를 수정합니다.
- [ ] VS Code에서 익스텐션을 직접 실행하여 Caret의 핵심 기능(페르소나, 이중 프롬프트 모드, 계정, `.caretrules` 등)이 모두 정상 작동하는지 E2E 테스트를 수행합니다.
