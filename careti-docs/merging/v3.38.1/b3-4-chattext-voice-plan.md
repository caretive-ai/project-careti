# B3-4 ChatTextArea/Voice 이식 계획

**작성자:** Codex  
**리뷰/보강:** Claude (Sonnet 4.5)  
**리뷰 일자:** 2025-11-21  
**원칙:** cline 베이스 + Careti 침습 (입력히스토리/i18n/브랜딩/페르소나 유지)

---

## 1. 범위
- `webview-ui/src/components/chat/ChatTextArea.tsx`
- `webview-ui/src/components/chat/VoiceRecorder.tsx`
- (참고) shadcn UI(`components/ui/button.tsx`, `components/ui/tooltip.tsx`, `lib/utils.ts`)는 이미 존재 → 신규 추가 불필요

---

## 2. 인프라 확인 ✅
- DictationServiceClient: `webview-ui/src/services/grpc-client.ts`에 정의
- 백엔드 서비스: `src/services/dictation/`, `src/core/controller/dictation/` 존재
- Proto: `proto/cline/dictation.proto` 존재
- PulsingBorder 패키지: `@paper-design/shaders-react` 설치(필요 시 사용)
- formatSeconds 유틸: `webview-ui/src/utils/format.ts`에 존재

---

## 3. 작업 체크리스트

### Step 1: VoiceRecorder.tsx 적용
- [ ] cline 버전 사용(파일 이미 추가됨), 스타일 최소 조정만

### Step 2: ChatTextArea.tsx 병합 (cline 기능 + Careti 침습)
- [ ] cline 녹음 상태/핸들러 블록 이식: 녹음/처리/시작 상태, 타이머, 에러 처리
- [ ] VoiceRecorder JSX 조건부 렌더: `dictationSettings?.dictationEnabled && !sendingDisabled`
- [ ] 전사 결과 반영 로직(`onTranscription`) 추가
- [ ] Careti 기능 유지: `useInputHistory`, i18n `t()`, Chatbot/Agent 라벨, 브랜드/모델 선택 UI
- [ ] 키 이벤트 충돌 검토: 슬래시/멘션/히스토리/Voice 입력이 공존하도록 확인

### Step 3: 테스트
- [ ] `npm run check-types`
- [ ] dictationEnabled=true → 버튼 노출, 녹음/전사/취소 동작 확인
- [ ] dictationEnabled=false → 버튼 미노출
- [ ] Careti 기능 회귀 테스트(입력 히스토리, i18n, 모델 선택)

---

## 4. Done 조건

- check-types 통과
- 음성 버튼이 dictationEnabled=true일 때 표시
- Careti 기능 회귀 없음 (입력 히스토리, i18n)
- 마스터 문서(B3-4) 진행 로그 업데이트

---

## 5. dictationSettings 구조 (참고)

```typescript
interface DictationSettings {
  dictationEnabled?: boolean   // 사용자 토글
  featureEnabled?: boolean     // 백엔드 feature flag
  dictationLanguage?: string   // 언어 설정
}
```

cline은 `dictationEnabled && featureEnabled` 둘 다 true일 때만 버튼 표시(기본값 false).
