# CodeCenter 브랜드 전환 기능 분석 및 대응 계획

**작성일**: 2025-10-14
**목적**: Cline 업스트림 머징 후 CodeCenter 브랜드 전환 기능 복구 계획
**상태**: 📋 분석 완료 - 실행 대기

---

## 📋 1. 현황 분석

### 1.1 caret-b2b 프로젝트 구조

```
caret-b2b/
├── brands/
│   ├── caret/          # Caret 브랜드 (기본)
│   ├── cline/          # Cline 브랜드
│   └── codecenter/     # CodeCenter 브랜드 (B2B 고객용)
│       ├── brand-config.json         # 백엔드 매핑
│       ├── brand-config-front.json   # 프론트엔드 i18n 매핑
│       ├── package.json              # CodeCenter package.json
│       ├── feature-config.json       # 기능 설정
│       └── assets/                   # CodeCenter 애셋
│
└── tools/
    ├── brand-converter.js      # 통합 브랜드 변환 엔진
    ├── convert-backend.js      # 백엔드 변환 로직
    ├── convert-frontend.js     # 프론트엔드 i18n 변환 로직
    └── converter-utils.js      # 유틸리티
```

### 1.2 브랜드 변환 시스템 원리

**하이브리드 변환 방식 (블랙리스트 + 화이트리스트)**:

1. **블랙리스트 방식 (기본 변환)**
   - 전체 프로젝트에서 `"caret"` → `"codecenter"` 일괄 치환
   - **보호 대상**: `caret-scripts/`, `@caret/`, `*.proto` 등 핵심 파일
   - UI 텍스트, 브랜딩 요소 자동 변환

2. **화이트리스트 방식 (정밀 보정)**
   - `brand-config.json`의 `brand_mappings`에 정의된 파일별 매핑
   - GitHub URL, 회사명, 버전, VSCode 명령어 등 세부 보정
   - 누락/오변환 부분 정밀 수정

3. **백업/복구 시스템 (i18n 보호)**
   - `brand-config-front.json`의 `backup_and_restore_json` 사용
   - 변환 전 `providers.caret.*` 같은 보존 데이터 백업
   - 변환 후 원래 위치에 복구

### 1.3 현재 상태

```bash
🎯 현재 브랜드: caret (v0.3.0)
📋 사용 가능한 브랜드: caret, cline, codecenter
✅ brand-converter.js: 정상 작동 (최근 커밋: 2093e5c)
```

---

## 🔍 2. 머징 후 예상 문제점

### 2.1 파일 구조 변경

**머징으로 변경된 주요 파일들**:
- `src/extension.ts` - 확장 기능 진입점
- `src/core/prompts/system-prompt/` - 시스템 프롬프트 (JSON → TypeScript)
- `package.json` - 명령어, 메타데이터
- `webview-ui/` - React 프론트엔드
- `caret-src/` - Caret 전용 파일들 (신규)

**문제점**:
1. `brand-config.json`의 `file_paths` 매핑이 구버전 경로 참조
2. 새로 추가된 `caret-src/` 디렉토리는 매핑에 없음
3. 프롬프트 시스템 변경 (`caret-src/core/prompts/sections/*.json`)

### 2.2 명령어 매핑 변경

**현재 CodeCenter 매핑 (brand-config.json:58)**:
```json
"\"command\": \"caret.": "\"command\": \"codecenter."
```

**문제**: `package.json`의 명령어 구조가 변경되었을 가능성
- Cline 머징으로 새 명령어 추가
- 명령어 ID 변경
- 카테고리 재구성

### 2.3 프롬프트 시스템 변경

**이전**: Cline의 TypeScript 기반 프롬프트
**현재**: Caret의 JSON 기반 프롬프트 (`caret-src/core/prompts/sections/`)

**문제점**:
1. JSON 파일들이 `brand-config.json` 매핑에 없음
2. `CHATBOT_AGENT_MODES.json` 같은 Caret 전용 섹션
3. 프롬프트 용어 (`CHATBOT/AGENT` vs `PLAN/ACT`)

### 2.4 i18n 구조 변경

**현재 경로**:
```
webview-ui/src/caret/locale/{ko,en,ja,zh}/*.json
```

**brand-config-front.json 참조**:
```json
"backup_and_restore_json": {
  "webview-ui/src/caret/locale/ko/settings.json": ["providers.caret.*"]
}
```

**문제**: 새로 추가된 JSON 파일이나 구조 변경 가능성

---

## 🎯 3. 대응 계획

### Phase 1: 현황 파악 (분석)

**목표**: CodeCenter 변환 시 어떤 파일들이 영향받는지 확인

```bash
# 1. Dry-run으로 변환 시뮬레이션
cd /Users/luke/dev/caret/caret-b2b
node tools/brand-converter.js codecenter --all --dry-run

# 2. 변경될 파일 목록 확인
# 3. 누락된 매핑 파악
```

**체크리스트**:
- [ ] `brand-config.json`의 `file_paths` 업데이트 필요성
- [ ] `caret-src/` 디렉토리 매핑 필요 여부
- [ ] 프롬프트 JSON 파일 매핑 필요 여부
- [ ] `package.json` 명령어 변경 확인
- [ ] i18n 파일 백업/복구 대상 확인

### Phase 2: 매핑 파일 업데이트

**2.1 brand-config.json 업데이트**

필요한 추가 매핑:
```json
"file_paths": {
  // 기존 매핑...

  // Caret 전용 파일 추가
  "caret-src/core/prompts/sections/CHATBOT_AGENT_MODES.json": "chatbot_agent_modes_json",
  "caret-src/core/prompts/sections/AGENT_BEHAVIOR_DIRECTIVES.json": "agent_behavior_json",
  "caret-src/shared/constants/PromptSystemConstants.ts": "prompt_constants_ts",

  // 머징으로 변경된 파일
  "src/core/prompts/system-prompt/index.ts": "system_prompt_index_ts"
}
```

**2.2 brand-config-front.json 업데이트**

i18n 백업/복구 대상 확인 및 추가:
```json
"backup_and_restore_json": {
  "webview-ui/src/caret/locale/ko/settings.json": ["providers.caret.*"],
  "webview-ui/src/caret/locale/en/settings.json": ["providers.caret.*"],
  "webview-ui/src/caret/locale/ja/settings.json": ["providers.caret.*"],
  "webview-ui/src/caret/locale/zh/settings.json": ["providers.caret.*"],

  // 새로 추가된 파일 있으면 추가
  "webview-ui/src/caret/locale/ko/announcement.json": ["*"]
}
```

### Phase 3: 브랜드 매핑 규칙 업데이트

**3.1 프롬프트 용어 매핑 추가**

CodeCenter는 Caret의 CHATBOT/AGENT 용어를 사용해야 하므로:
```json
"chatbot_agent_modes_json": {
  "CHATBOT MODE": "CODECENTER ASSISTANT MODE",
  "AGENT MODE": "CODECENTER EXECUTOR MODE"
}
```

**선택사항**: 아니면 그대로 CHATBOT/AGENT 유지

**3.2 새 명령어 매핑**

`package.json`의 변경된 명령어 확인 후 추가

### Phase 4: 테스트 및 검증

**4.1 Dry-run 테스트**
```bash
node tools/brand-converter.js codecenter --all --dry-run
```

**4.2 실제 변환 테스트 (별도 브랜치)**
```bash
# 안전한 테스트를 위해 별도 브랜치 생성
cd /Users/luke/dev/caret
git checkout -b test/codecenter-conversion

# 변환 실행
cd caret-b2b
node tools/brand-converter.js codecenter --all

# 검증
npm run compile
npm run test:all
```

**4.3 검증 항목**
- [ ] 컴파일 성공
- [ ] 확장 기능 로드 성공
- [ ] CodeCenter 브랜딩 정상 표시
- [ ] `providers.caret` i18n 보존 확인
- [ ] 프롬프트 시스템 정상 작동
- [ ] 명령어 팔레트 정상 작동

### Phase 5: 문제 발생 시 복구 절차

**5.1 변환 롤백**
```bash
# Caret 브랜드로 복구
node tools/brand-converter.js caret --all

# 또는 Git 복구
git checkout .
git clean -fd
```

**5.2 문제 분석 및 수정**
1. 로그 확인
2. 매핑 파일 수정
3. 재테스트

---

## 📝 4. 실행 순서

### Step 1: 백업 생성
```bash
cd /Users/luke/dev/caret
git checkout -b backup/pre-codecenter-test
git push origin backup/pre-codecenter-test
```

### Step 2: Dry-run 분석
```bash
cd caret-b2b
node tools/brand-converter.js codecenter --all --dry-run > /tmp/codecenter-dryrun.log 2>&1
cat /tmp/codecenter-dryrun.log
```

### Step 3: 매핑 파일 분석 및 업데이트
- Dry-run 로그 검토
- 누락된 파일/매핑 식별
- `brand-config.json` 업데이트
- `brand-config-front.json` 업데이트

### Step 4: 테스트 브랜치에서 실제 변환
```bash
git checkout -b test/codecenter-conversion
cd caret-b2b
node tools/brand-converter.js codecenter --all
```

### Step 5: 검증
```bash
cd /Users/luke/dev/caret
npm run compile
npm run test:backend
npm run test:webview
```

### Step 6: 문제 수정 및 반복
- 문제 발견 시 매핑 수정
- 변환 롤백 후 재시도
- 완벽할 때까지 반복

---

## 🚨 5. 주의사항

### 5.1 절대 하지 말아야 할 것

❌ **메인 브랜치에서 직접 변환 실행**
- 반드시 별도 테스트 브랜치 사용

❌ **백업 없이 변환**
- Git 커밋 또는 브랜치 백업 필수

❌ **Dry-run 없이 실제 변환**
- 항상 dry-run으로 먼저 확인

❌ **수동으로 파일 편집**
- brand-converter.js 사용 필수
- 수동 편집은 추적 불가능

### 5.2 안전 체크리스트

변환 실행 전:
- [ ] Git 상태 클린
- [ ] 백업 브랜치 생성됨
- [ ] Dry-run 로그 검토 완료
- [ ] 매핑 파일 업데이트 완료
- [ ] 테스트 브랜치에서 실행

변환 실행 후:
- [ ] 컴파일 성공
- [ ] 테스트 통과
- [ ] 브랜딩 확인
- [ ] i18n 보존 확인
- [ ] 프롬프트 작동 확인

---

## 📊 6. 예상 작업 시간

| Phase | 작업 | 예상 시간 |
|-------|------|-----------|
| 1 | 현황 파악 (Dry-run 분석) | 30분 |
| 2 | 매핑 파일 업데이트 | 1시간 |
| 3 | 브랜드 규칙 업데이트 | 30분 |
| 4 | 테스트 및 검증 | 1시간 |
| 5 | 문제 수정 및 반복 | 1-2시간 |
| **합계** | | **4-5시간** |

---

## 🎯 7. 다음 단계

### 즉시 실행 가능한 작업

1. **Dry-run 분석**
   ```bash
   cd /Users/luke/dev/caret/caret-b2b
   node tools/brand-converter.js codecenter --all --dry-run
   ```

2. **변경될 파일 목록 확인**
   - 어떤 파일이 변환되는지
   - 어떤 파일이 누락되었는지
   - 매핑 추가가 필요한 파일

3. **매핑 파일 준비**
   - `brand-config.json` 업데이트 초안 작성
   - `brand-config-front.json` 검토

### 사용자 승인 후 진행

4. **테스트 브랜치 생성 및 변환 실행**
5. **검증 및 문제 수정**
6. **최종 확인 후 문서화**

---

**작성자**: Claude Code + Luke
**최종 업데이트**: 2025-10-14
