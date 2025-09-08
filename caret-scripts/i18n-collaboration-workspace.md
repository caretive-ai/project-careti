# i18n 공동작업 워크스페이스

## 📊 실시간 진행률 추적

### 전체 진행 현황
- **총 누락 키**: 641개
- **완료된 키**: 3개  
- **진행률**: 0.5%
- **남은 작업**: 638개

---

## 👥 AI 작업 할당 현황

### 🇯🇵 AI-A: Japanese 담당
**할당 파일:**
- [ ] common.json (예상: ~150개 키)
- [ ] welcome.json (예상: ~50개 키)  
- [ ] settings.json (예상: ~100개 키)
- [ ] chat.json (예상: ~80개 키)
- [ ] persona.json (예상: ~30개 키)
- [ ] models.json (예상: ~40개 키)
- [ ] announcement.json (예상: ~20개 키)
- [ ] validate-api-conf.json (예상: ~15개 키)
- [ ] rules.json (예상: ~25개 키)

**현재 상태:**
✅ common.json: apiKey.placeholder, apiKey.getYourKeyAn, apiKey.getYourKeyA  
✅ common.json: rulesModal.tooltip.manageRulesWorkflows, rulesModal.ariaLabel.CaretRulesButton

### 🇨🇳 AI-B: Chinese 담당  
**할당 파일:**
- [ ] common.json (예상: ~150개 키)
- [ ] welcome.json (예상: ~50개 키)
- [ ] settings.json (예상: ~100개 키)  
- [ ] chat.json (예상: ~80개 키)
- [ ] persona.json (예상: ~30개 키)
- [ ] models.json (예상: ~40개 키)
- [ ] announcement.json (예상: ~20개 키)
- [ ] validate-api-conf.json (예상: ~15개 키)
- [ ] rules.json (예상: ~25개 키)

**현재 상태:**
✅ common.json: apiKey.placeholder, apiKey.getYourKeyAn, apiKey.getYourKeyA
✅ common.json: rulesModal.tooltip.manageRulesWorkflows, rulesModal.ariaLabel.CaretRulesButton

### 🔧 AI-C: 통합 관리자
**담당 업무:**
- [ ] Korean 검증 (필요 시)
- [ ] 작업 현황 모니터링
- [ ] 품질 교차 검증
- [ ] 최종 통합 작업
- [ ] 문서 업데이트

---

## 📝 작업 로그

### 2025-01-08 (Phase 3 부분 작업)
- **AI-C**: Japanese common.json에 apiKey 구조체 추가
- **AI-C**: Chinese common.json에 apiKey 구조체 추가  
- **AI-C**: 양쪽 언어에 rulesModal 구조 완성
- **발견**: apiSetup 키들이 실제로는 welcome.json에 이미 존재 (스크립트 거짓양성)
- **Git**: 커밋 b9d48b81 (부분 작업만 반영)

### 다음 작업 계획
- **AI-A**: Japanese 누락 키 체계적 검증 시작
- **AI-B**: Chinese 누락 키 체계적 검증 시작
- **AI-C**: 작업 현황 추적 및 품질 관리

---

## 🔍 검증 체크리스트

### 공통 검증 절차 (모든 AI 공통)

#### 1단계: 키 존재 확인
```bash
# English에 키가 있는지 확인
grep -r "대상키" webview-ui/src/caret/locale/en/

# 대상 언어에 키가 있는지 확인  
grep -r "대상키" webview-ui/src/caret/locale/[ja|zh]/
```

#### 2단계: 실사용 확인
```bash
# 코드에서 실제 사용되는지 확인
grep -r "t(\"대상키\"" webview-ui/src/
grep -r "t('대상키'" webview-ui/src/
```

#### 3단계: 네임스페이스 확인
```bash
# 다른 네임스페이스에 존재하는지 확인
grep -r "대상키" webview-ui/src/caret/locale/en/common.json
grep -r "대상키" webview-ui/src/caret/locale/en/settings.json
# ... 모든 JSON 파일 확인
```

#### 4단계: 번역 및 추가
- 실제 누락 확인 시에만 번역 작업 진행
- 기존 번역 스타일과 일관성 유지
- JSON 구조 및 형식 보존

### 거짓양성 판별 기준
- ❌ 키가 다른 JSON 파일에 이미 존재
- ❌ 키가 코드에서 실제로 사용되지 않음
- ❌ 스크립트가 잘못된 키 조합을 생성
- ❌ 동적 키 생성으로 인한 오탐

---

## 📋 결과 기록 템플릿

### 검증 결과 기록 (각 키마다 작성)
```
키: [키명]
파일: [대상파일명]  
언어: [ja/zh/ko]
상태: [missing/exists/false_positive]
검증자: [AI-A/AI-B/AI-C]
작업일: [YYYY-MM-DD]
메모: [추가 설명]

English 원본: "[영어 텍스트]"
번역 추가: "[번역된 텍스트]" (누락인 경우만)
```

### 완료 보고 형식
```
=== 작업 완료 보고 ===
담당자: AI-A
파일: ja/common.json  
처리 키 수: [수]
실제 누락: [수]
거짓양성: [수]
추가 번역: [수]
상태: 완료/진행중
다음 파일: [파일명]
```

---

## 🎯 품질 관리

### 번역 품질 기준
1. **용어 일관성**: 기존 번역에서 사용된 용어와 통일
2. **문체 일관성**: 기존 번역 스타일과 동일한 존댓말/반말 수준  
3. **길이 적정성**: 원문과 비슷한 길이 유지
4. **자연스러움**: 각 언어의 자연스러운 표현 사용

### 교차 검증 프로세스
- AI-A 작업 → AI-B가 품질 검토
- AI-B 작업 → AI-A가 품질 검토  
- 의견 불일치 시 AI-C가 최종 판단

### 최종 검증 항목
- [ ] 모든 키 검증 완료
- [ ] 번역 품질 검토 완료
- [ ] JSON 파일 유효성 확인  
- [ ] 타입 체크 통과
- [ ] Git 커밋 완료
- [ ] 문서 업데이트 완료

---

## 📞 소통 및 협업

### 진행 상황 공유
- 작업 시작 시: "AI-A: ja/common.json 작업 시작"
- 완료 시: "AI-A: ja/common.json 완료 - 실제 누락 15개, 거짓양성 35개"
- 문제 발견 시: "AI-A: 의심스러운 키 발견 - [키명], 검토 요청"

### 도움 요청 방법
- 판단이 어려운 경우 다른 AI에게 의견 요청
- 번역 품질 의심 시 교차 검토 요청  
- 기술적 문제 발견 시 즉시 공유

### 작업 완료 기준
모든 AI가 다음 사항에 동의할 때 프로젝트 완료:
1. 641개 키 모두 검증 완료
2. 실제 누락 키 모든 번역 완료
3. 품질 검증 완료  
4. 최종 테스트 통과