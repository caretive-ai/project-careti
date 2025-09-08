# 누락 키 체크리스트 템플릿

## 사용법
이 템플릿을 복사하여 각 AI가 담당 언어별로 체크리스트 생성

---

## 🇯🇵 Japanese 누락 키 체크리스트 (AI-A 전용)

### common.json 검증 결과
- [ ] `apiKey.placeholder` ✅ (완료 - 2025-01-08)
- [ ] `apiKey.getYourKeyAn` ✅ (완료 - 2025-01-08)  
- [ ] `apiKey.getYourKeyA` ✅ (완료 - 2025-01-08)
- [ ] `rulesModal.tooltip.manageRulesWorkflows` ✅ (완료 - 2025-01-08)
- [ ] `rulesModal.ariaLabel.CaretRulesButton` ✅ (완료 - 2025-01-08)
- [ ] `settings..label` ❌ (거짓양성 - 존재하지 않는 키)
- [ ] `settings..description` ❌ (거짓양성 - 존재하지 않는 키)
- [ ] `settings..options.caret` (검증 필요)
- [ ] `settings..options.Caret` (검증 필요)
- [ ] `settings..options.cline` (검증 필요)
- [ ] `settings.apiKey.placeholder` (검증 필요)
- [ ] `settings.apiKey.getYourKeyAn` (검증 필요)
- [ ] `settings.apiKey.getYourKeyA` (검증 필요)
- [ ] `settings.apiKey.label` (검증 필요)
- [ ] `settings.apiKey.helpText` (검증 필요)
- [ ] `settings.baseUrl.label` (검증 필요)
- [ ] `settings.baseUrl.placeholder` (검증 필요)
- [ ] `settings.modelSelector.label` (검증 필요)
- [ ] `settings.modelSelector.placeholder` (검증 필요)
- [ ] `settings.modelIdField.label` (검증 필요)
- [ ] ... (나머지 키들 계속 추가)

### welcome.json 검증 결과
- [ ] `apiSetup.backButton` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `apiSetup.title` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `apiSetup.description` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `apiSetup.instructions` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `apiSetup.supportLinks.llmList` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `apiSetup.supportLinks.geminiCredit` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `apiSetup.saveButton` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `apiSetup.help.title` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `apiSetup.help.button` ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] `welcome.quickWinsTitle` ❌ (거짓양성 - 영어에도 존재하지 않음)
- [ ] ... (나머지 키들)

### settings.json 검증 결과
- [ ] (스크립트 보고서의 설정 관련 키들 검증)
- [ ] ...

### chat.json 검증 결과  
- [ ] `mode.agent.label` ❌ (거짓양성 - common.json에 이미 존재)
- [ ] `mode.chatbot.label` ❌ (거짓양성 - common.json에 이미 존재)
- [ ] ...

### 기타 JSON 파일들
- [ ] persona.json 검증
- [ ] models.json 검증  
- [ ] announcement.json 검증
- [ ] validate-api-conf.json 검증
- [ ] rules.json 검증

---

## 🇨🇳 Chinese 누락 키 체크리스트 (AI-B 전용)

### common.json 검증 결과
- [ ] `apiKey.placeholder` ✅ (완료 - 2025-01-08)
- [ ] `apiKey.getYourKeyAn` ✅ (완료 - 2025-01-08)
- [ ] `apiKey.getYourKeyA` ✅ (완료 - 2025-01-08)  
- [ ] `rulesModal.tooltip.manageRulesWorkflows` ✅ (완료 - 2025-01-08)
- [ ] `rulesModal.ariaLabel.CaretRulesButton` ✅ (완료 - 2025-01-08)
- [ ] ... (나머지 키들 Japanese와 동일한 패턴으로 검증)

### welcome.json 검증 결과
- [ ] `apiSetup.*` 키들 ❌ (거짓양성 - welcome.json에 이미 존재)
- [ ] ... (나머지 키들)

### 기타 파일들
- [ ] settings.json, chat.json, 기타 파일들 검증

---

## 🇰🇷 Korean 누락 키 체크리스트 (AI-C 필요시)

### 검증 현황
- [ ] 대부분 완료 상태로 추정
- [ ] 필요 시 선별적 검증만 수행
- [ ] ...

---

## 📊 통계 및 현황

### Japanese (AI-A 담당)
- **완료된 키**: 5개
- **거짓양성 확인**: 15개  
- **검증 대기**: 약 300개
- **실제 누락 추정**: 약 100-150개

### Chinese (AI-B 담당)  
- **완료된 키**: 5개
- **거짓양성 확인**: 15개
- **검증 대기**: 약 300개
- **실제 누락 추정**: 약 100-150개

### Korean (AI-C 담당)
- **검증 필요**: 약 20개 (선별적)
- **대부분 완료**: 추정

---

## 📝 작업 기록 템플릿

### 개별 키 검증 기록
```
날짜: 2025-01-08
키: settings.modelSelector.label
파일: ja/settings.json
담당: AI-A

검증 결과:
1. English 존재: ✅ en/settings.json에 존재
2. Japanese 존재: ❌ ja/settings.json에 누락  
3. 실사용 확인: ✅ ModelSelector.tsx에서 사용
4. 판단: 실제 누락 - 번역 필요

번역 추가: "モデル選択"
상태: 완료
```

### 파일별 완료 보고
```
파일: ja/common.json
총 키 수: 150개
검증 완료: 150개  
실제 누락: 25개
거짓양성: 125개
번역 추가: 25개
상태: 완료
담당자: AI-A
완료일: 2025-01-08
```

---

## 🎯 다음 단계 액션

### AI-A 다음 할일
1. [ ] ja/common.json 나머지 키들 체계적 검증
2. [ ] ja/welcome.json 검증 시작
3. [ ] ja/settings.json 검증 계획

### AI-B 다음 할일  
1. [ ] zh/common.json 나머지 키들 체계적 검증
2. [ ] zh/welcome.json 검증 시작
3. [ ] zh/settings.json 검증 계획

### AI-C 다음 할일
1. [ ] 진행률 모니터링
2. [ ] 품질 교차 검증
3. [ ] 문서 업데이트 지속