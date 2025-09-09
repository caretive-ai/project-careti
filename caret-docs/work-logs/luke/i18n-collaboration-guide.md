# AI 공동작업 지시서 - i18n 대량 번역 작업 프로젝트

## 🎯 작업 목표
**영어 완전체 기준 대량 번역 작업 - common.json 715라인 60개 섹션 완전 번역**

---

## 📋 현재 상황

### 작업 현황  
- **영어 common.json 완전체 확인됨** (715라인, 60개 섹션)
- **일본어/중국어 파일 초기화 완료** (동기화 대기)
- **Caret 고유기능 보존 확인됨** (mode.agent, settings.uiLanguage 등)
- **협업 시스템 설정 필요** (대량 번역 작업용)

### 대상 언어
- **en** (English) - 기준 언어
- **ja** (Japanese) - 검증 및 번역 필요 
- **zh** (Chinese) - 검증 및 번역 필요
- **ko** (Korean) - 검증 필요 (대부분 완료 추정)

### 대상 JSON 파일
```
webview-ui/src/caret/locale/[lang]/
├── common.json
├── welcome.json  
├── settings.json
├── chat.json (일부 언어)
├── history.json (일부 언어)
├── persona.json
├── models.json
├── announcement.json
├── validate-api-conf.json
└── rules.json (일부 언어)
```

---

## 🤖 AI 역할 분담

### AI-A: Japanese 전담
**담당 영역:**
- 모든 Japanese JSON 파일 검증 및 번역
- English 기준으로 누락 키 식별
- 번역 품질 일관성 확보

### AI-B: Chinese 전담  
**담당 영역:**
- 모든 Chinese JSON 파일 검증 및 번역
- English 기준으로 누락 키 식별
- 번역 품질 일관성 확보

### AI-C: 통합 관리자
**담당 영역:**
- Korean 검증 (필요 시)
- 작업 현황 추적 및 관리
- 품질 검증 및 최종 통합
- 진행률 모니터링

---

## 📝 작업 프로세스

### Step 1: 초기 설정
1. **누락 키 리스트 분석**
   ```bash
   # 누락 키 보고서 확인
   cat caret-scripts/i18n-missing-keys-report.md
   ```

2. **기준 파일 구조 파악**
   ```bash
   # English JSON 파일들 구조 확인
   ls webview-ui/src/caret/locale/en/
   ```

### Step 2: 개별 검증 작업

#### AI-A (Japanese) 작업 절차:
```bash
# 1. Japanese 파일 현황 확인
ls webview-ui/src/caret/locale/ja/

# 2. English와 비교하여 누락 키 식별
grep -r "특정키" webview-ui/src/caret/locale/en/
grep -r "특정키" webview-ui/src/caret/locale/ja/

# 3. 실제 사용처 확인
grep -r "t(\"특정키\"" webview-ui/src/

# 4. 누락 확인 시 번역 추가
```

#### AI-B (Chinese) 작업 절차:
```bash  
# 1. Chinese 파일 현황 확인
ls webview-ui/src/caret/locale/zh/

# 2. 동일한 검증 및 번역 프로세스
# (AI-A와 동일한 방법론 적용)
```

### Step 3: 품질 보증

#### 검증 기준:
1. **키 존재 여부**: English에 있는 키가 대상 언어에 있는가?
2. **사용처 확인**: 해당 키가 실제 코드에서 사용되는가?
3. **번역 품질**: 기존 번역 스타일과 일관성 있는가?
4. **구조 일치**: JSON 객체 구조가 동일한가?

#### 거짓양성 패턴:
- 키가 다른 네임스페이스에 존재하는 경우
- 스크립트가 잘못된 키를 생성한 경우  
- 키가 동적으로 생성되어 사용되는 경우

---

## 📊 진행률 추적

### 현황판 구조:
```markdown
# i18n-progress-status.md

## 전체 진행률: [완료수]/641

### Japanese (ja/) - AI-A 담당
- common.json: [완료수]/[전체수]
- welcome.json: [완료수]/[전체수]  
- settings.json: [완료수]/[전체수]
- 기타 파일들...

### Chinese (zh/) - AI-B 담당
- common.json: [완료수]/[전체수]
- welcome.json: [완료수]/[전체수]
- settings.json: [완료수]/[전체수]  
- 기타 파일들...

### 완료된 키 목록:
✅ [언어]/[파일]: [키명] - [담당AI]
✅ ja/common.json: apiKey.placeholder - AI-A
✅ zh/common.json: apiKey.placeholder - AI-B
```

### 검증 결과 기록 형식:
```json
{
  "key": "apiSetup.title",
  "namespace": "welcome",
  "language": "ja",
  "status": "missing|exists|false_positive",
  "translation_needed": true|false,
  "translation_added": "추가된 번역 내용",
  "verified_by": "AI-A",
  "notes": "추가 메모"
}
```

---

## ⚠️ 주의사항

### 필수 검증 사항:
1. **실사용 확인**: 키가 실제 코드에서 사용되는지 반드시 확인
2. **중복 검사**: 동일한 키가 다른 JSON 파일에 이미 존재하는지 확인  
3. **구조 보존**: 기존 JSON 파일의 구조와 형식 유지
4. **번역 일관성**: 기존 번역 스타일과 용어 통일

### 금지 사항:
- 스크립트 결과만 믿고 작업하기
- 검증 없이 대량 키 추가하기
- 기존 완료된 번역 덮어쓰기
- JSON 파일 구조 임의 변경

### 협업 규칙:
- 작업 전 현황판 업데이트
- 완료 시 즉시 상태 보고
- 의심스러운 경우 다른 AI와 상의
- 품질 문제 발견 시 즉시 공유

---

## 🔧 도구 및 명령어

### 검증 도구:
```bash
# 키 존재 확인
grep -r "키명" webview-ui/src/caret/locale/

# 실사용 확인  
grep -r "t(\"키명\"" webview-ui/src/

# JSON 유효성 검사
node -e "console.log(JSON.parse(require('fs').readFileSync('파일경로')))"

# 타입 체크
npm run check-types
```

### 진행률 업데이트:
```bash
# Git 커밋 (작업 단위별)
git add webview-ui/src/caret/locale/
git commit -m "feat: Add missing i18n keys for [언어] [파일명]"
```

---

## 🎯 성공 기준

### 최종 목표:
- **누락 키 0개**: 모든 실제 누락 키 해결
- **구조 일치**: 모든 언어의 JSON 구조 통일
- **품질 보증**: 번역 품질 일관성 확보
- **검증 완료**: 모든 키의 실사용 여부 확인

### 완료 조건:
1. 641개 키 전체 검증 완료
2. 실제 누락 키들 번역 추가 완료  
3. 거짓양성 키들 문서화 완료
4. 최종 타입 체크 통과
5. Git 커밋 및 문서 업데이트 완료