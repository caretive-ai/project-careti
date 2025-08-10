# 머징 검증 체크리스트

## 🔍 의심스러운 변경사항 발견 시 필수 검증 절차

### 1. 원본 비교 분석 (MANDATORY)

**🎯 목적**: 헷갈리기 쉬운 구조적 차이점을 명확히 구분

#### A. Cline 원본 vs Caret 현재 구조 비교
```bash
# 1. Cline 원본 파일 구조 확인
ls -la cline-latest/webview-ui/src/components/settings/

# 2. Caret 현재 파일 구조 확인  
ls -la webview-ui/src/components/settings/

# 3. 핵심 파일 직접 비교
diff cline-latest/webview-ui/src/components/settings/SettingsView.tsx webview-ui/src/components/settings/SettingsView.tsx

# 4. Import 구조 비교
head -30 cline-latest/webview-ui/src/components/settings/SettingsView.tsx
head -30 webview-ui/src/components/settings/SettingsView.tsx
```

#### B. 핵심 차이점 문서화
- **Cline 구조**: Section 기반 (`ApiConfigurationSection`, `GeneralSettingsSection`)
- **Caret 구조**: ApiOptions 기반 + Caret 특화 기능
- **Context 차이**: Cline은 `setApiConfiguration` 없음, Caret은 있음
- **Handlers 차이**: Cline은 Section별 처리, Caret은 `useApiConfigurationHandlers` 통합

### 2. 변경 전 필수 확인사항

#### A. 변경 이유 명확화
- [ ] **왜 이 변경이 필요한가?**
- [ ] **Cline 원본과 어떤 차이가 있는가?**
- [ ] **Caret 특화 기능에 영향은 없는가?**
- [ ] **기존 기능이 손상되지 않는가?**

#### B. 의존성 체크
- [ ] **import 경로가 올바른가?**
- [ ] **타입 정의가 일치하는가?**
- [ ] **함수 시그니처가 맞는가?**
- [ ] **Proto 정의와 일치하는가?**

### 3. 실수하기 쉬운 패턴들

#### A. Import 경로 실수
```typescript
// ❌ 잘못된 경우
import BrowserSettingsSection from "./BrowserSettingsSection"  // 루트에 있는 파일

// ✅ 올바른 경우  
import BrowserSettingsSection from "./sections/BrowserSettingsSection"  // sections 폴더
```

#### B. 함수 매개변수 순서 실수
```typescript
// ❌ 잘못된 경우
validateApiConfiguration(apiConfiguration, language)  // currentMode 빠짐

// ✅ 올바른 경우
validateApiConfiguration(apiConfiguration, currentMode, language)
```

#### C. Proto 필드명 실수
```typescript
// ❌ 잘못된 경우 - Proto에 없는 필드
mcpRichDisplayEnabled: true,
chatbotAgentSeparateModelsSetting: value,

// ✅ 올바른 경우 - Proto 정의와 일치
planActSeparateModelsSetting: value,
preferredLanguage: chatSettings?.preferredLanguage,
```

### 4. 검증 자동화 스크립트

#### A. 구조 차이 검사 스크립트
```bash
#!/bin/bash
# scripts/verify-merge-structure.sh

echo "🔍 Cline vs Caret 구조 차이 검사"

echo "📁 디렉토리 구조 비교:"
echo "--- Cline 원본 ---"
find cline-latest/webview-ui/src/components/settings -name "*.tsx" | sort

echo "--- Caret 현재 ---"  
find webview-ui/src/components/settings -name "*.tsx" | sort

echo "🔗 Import 패턴 검사:"
echo "--- SettingsView import 패턴 ---"
grep "^import.*from.*sections" cline-latest/webview-ui/src/components/settings/SettingsView.tsx || echo "Cline: sections import 없음"
grep "^import.*from.*sections" webview-ui/src/components/settings/SettingsView.tsx || echo "Caret: sections import 없음"
```

#### B. 타입 일치성 검사
```bash
#!/bin/bash
# scripts/verify-type-consistency.sh

echo "🔍 타입 일치성 검사"

echo "📋 Proto 필드 존재 여부:"
grep -r "mcpRichDisplayEnabled" proto/ || echo "❌ mcpRichDisplayEnabled는 Proto에 없음"
grep -r "chatbotAgentSeparateModelsSetting" proto/ || echo "❌ chatbotAgentSeparateModelsSetting는 Proto에 없음"
grep -r "planActSeparateModelsSetting" proto/ && echo "✅ planActSeparateModelsSetting 존재"
```

### 5. 머징 후 검증 체크리스트

#### A. 빌드 검증
- [ ] **TypeScript 에러 0개**
- [ ] **Warning 최소화**
- [ ] **Import 에러 없음**

#### B. 기능 검증  
- [ ] **Settings 탭 모두 정상 동작**
- [ ] **API Configuration 저장/로드 정상**
- [ ] **Caret 특화 기능 정상 (모드 토글, UI 언어 등)**
- [ ] **i18n 및 로깅 정상 동작**

#### C. 회귀 테스트
- [ ] **기존 Caret 기능 손상 없음**
- [ ] **새로운 Cline 기능 정상 적용**
- [ ] **성능 저하 없음**

### 6. 실수 발견 시 대응 절차

#### A. 즉시 중단
1. **현재 작업 commit**
2. **문제 상황 문서화**
3. **원본 비교 분석 재실행**

#### B. 올바른 복구
1. **Cline 원본 재확인**
2. **Caret 기존 구조 파악**  
3. **단계별 수정 (한 번에 하나씩)**
4. **각 단계별 빌드 테스트**

#### C. 검증 강화
1. **자동화 스크립트 실행**
2. **수동 체크리스트 재검토**
3. **다른 사람 리뷰 요청**

## 📋 머징 가이드 업데이트

**이 문서는 매번 실수할 때마다 업데이트되어야 함**
- 새로운 실수 패턴 추가
- 검증 스크립트 개선
- 체크리스트 보완

## 🚨 긴급 상황 대응

**"헷갈릴 때"의 황금 규칙**:
1. **일단 멈춰라**
2. **원본부터 다시 확인해라** 
3. **작은 단위로 나누어 진행해라**
4. **매 단계마다 검증해라**

---

**작성일**: 2025-01-21  
**작성자**: Alpha (AI Assistant)  
**목적**: 머징 과정에서의 구조적 실수 방지 및 품질 보장

