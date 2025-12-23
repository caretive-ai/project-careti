# [공지] Caret v0.4.2 업데이트: Caret CLI 정식 배포와 계정/결제 안정화

Caret v0.4.2가 출시되었습니다. 이번 업데이트는 **비즈니스 관점에서 가장 중요한 흐름(정식 CLI 배포, Caret 계정·결제 안정화)**을 우선으로 개선했습니다.

## 핵심 업데이트 (우선순위 기준)

### 1. 최신 Gemmini3 pro/flash, GPT-5.2 지원
- 최신 모델들을 가장 빠르게 지원합니다.
- 총 지원 모델 지원 개수 : 343개 모델, 27개 Provider
- 지원 모델 : [모델 리스트](../development/support-model-list.en.md)

### 2. Caret 계정/크레딧/결제 경험 안정화
- Caret 사용자 전용 **계정 화면 분리**로 정보 확인이 쉬워졌습니다.
- **크레딧 잔액/사용 내역/결제 내역** 조회 흐름을 정리하고 갱신 안정성을 개선했습니다.
- 로그인 후 **프로필 사진 미표시** 문제를 해결했습니다.

### 3. 이미지 생성 기능 본격 지원
- **Gemini 3 Pro Image Preview / Gemini 3 Flash Preview** 모델을 통한 이미지 생성 지원.
- Caret 계정에서 **gemini-3-pro-image-preview(나노바나나 pro)** 모델 사용 가능.
- 생성 과정에서 **로딩/Thinking 메시지** 표시 및 **편집기 탭 열기** 지원.
- 이미지 생성 **비용/토큰 표시**가 정확히 반영되도록 개선했습니다.

### 4. 안정성 및 업스트림 반영
- ask 요청 레이스 경합을 해소해 작업 안정성을 높였습니다.
- **Cline v3.45.0** 버그 픽스를 체리픽으로 반영했습니다.

---

VS Code 마켓플레이스에서 Caret을 업데이트하고 새로운 기능을 바로 사용해 보세요.

**[Caret 업데이트하기 (VS Code Marketplace)](https://marketplace.visualstudio.com/items?itemName=caretive.caret)**
