# Task #007: Proto 패키지 분리 작업

## 📋 **작업 개요**

### **목적**
- Cline 원본 proto 구조 복원으로 머징 용이성 극대화
- Caret 고유 기능을 별도 패키지로 분리하여 독립성 확보
- 향후 Cline 업스트림 동기화 시 충돌 최소화

### **배경**
현재 모든 proto 파일이 `package caret;`으로 변경되어 있어 Cline 원본과 구조가 달라짐. 
실제 분석 결과 Caret 추가 기능은 소수이므로 분리 작업이 충분히 가능함.

## 🎯 **작업 범위**

### **분석 완료된 Caret 고유 추가사항들:**

#### **1. state.proto 추가사항 (4개 항목)**
- `ChatbotAgentMode` enum (새로 추가)
- `ChatSettings` message (새로 추가)
- `UpdateSettingsRequest`에 추가 필드 4개:
  - `chat_settings` 
  - `ui_language`
  - `mcp_rich_display_enabled`
  - `chatbot_agent_separate_models_setting`
- `ApiConfiguration`에 `caret_api_key = 1000` 추가

#### **2. file.proto 추가사항 (2개 항목)**
- `toggleCaretRule` RPC 메서드
- `ToggleCaretRuleRequest` message

#### **3. ui.proto 추가사항 (1개 항목)**
- `ClineAsk` enum에 2개 값 추가:
  - `CHATBOT_MODE_RESPOND = 16`
  - `ASK_BROWSER_ACTION = 17`

## 📋 **5단계 실행 계획**

### **Phase 1: 준비 작업**
- [x] 현재 Caret 추가사항 완전 분석
- [x] 작업 문서 생성 및 계획 수립
- [ ] 백업 생성: 현재 proto 파일들 `.pre-separation` 백업

### **Phase 2: Cline Proto 복원**
- [ ] `cline-latest/proto/cline/` → `proto/cline/` 완전 대체
- [ ] 패키지명 `package cline;` 복원
- [ ] `java_package = "bot.cline.proto"` 복원

### **Phase 3: Caret 패키지 생성**
- [ ] `proto/caret/` 디렉토리 생성
- [ ] Caret 고유 기능들을 새 패키지로 분리:
  - `proto/caret/chat.proto` (ChatbotAgentMode, ChatSettings)
  - `proto/caret/rules.proto` (toggleCaretRule 관련)
  - `proto/caret/ui.proto` (CHATBOT_MODE_RESPOND 등)

### **Phase 4: 백엔드 수정**
- [ ] gRPC 서비스 등록 수정 (`cline.*` vs `caret.*`)
- [ ] 컨트롤러 코드에서 패키지 분리 반영
- [ ] Proto 생성 스크립트 업데이트
- [ ] 빌드 완전성 확인

### **Phase 5: 프론트엔드 수정**
- [ ] 웹뷰에서 gRPC 호출 부분 수정
- [ ] 패키지 분리에 따른 import 경로 업데이트
- [ ] 기능 동작 검증

## 🔧 **기술적 고려사항**

### **서비스 네임스페이스 구조:**
```
cline.StateService      # Cline 원본 상태 관리
cline.TaskService       # Cline 원본 태스크 관리
cline.FileService       # Cline 원본 파일 관리 (toggleCaretRule 제외)

caret.ChatService       # Caret 고유 채팅 모드 관리
caret.RulesService      # Caret 고유 룰 관리
caret.UIService         # Caret 고유 UI 확장

host.WorkspaceService   # 공통 인프라 (변경 없음)
host.WindowService      # 공통 인프라 (변경 없음)
```

### **마이그레이션 전략:**
1. **점진적 분리**: 서비스별로 단계적 분리
2. **백워드 호환성**: 기존 호출 코드에 alias 제공
3. **검증 단계**: 각 단계마다 빌드 및 기능 검증

## ⚠️ **위험 요소 및 대응**

### **주요 위험:**
1. **빌드 실패**: proto 생성 시 의존성 문제
2. **런타임 오류**: 서비스 등록명 불일치
3. **기능 손실**: 분리 과정에서 기능 누락

### **대응 방안:**
1. **단계별 백업**: 각 단계마다 작업 백업 생성
2. **즉시 검증**: 각 변경 후 즉시 빌드/테스트
3. **롤백 준비**: 문제 발생 시 즉시 이전 상태로 복원

## 📊 **성공 기준**

### **완료 조건:**
- [ ] 모든 proto 빌드 성공
- [ ] 백엔드 gRPC 서비스 정상 등록
- [ ] 프론트엔드 웹뷰 기능 정상 동작
- [ ] 기존 Caret 기능들 모두 정상 작동
- [ ] `npm run check-types` 통과

### **품질 기준:**
- [ ] Cline 원본과 동일한 proto 구조
- [ ] Caret 고유 기능의 명확한 분리
- [ ] 향후 머징 시 충돌 최소화 확인

## 📅 **예상 소요 시간**
- **Phase 1-2**: 1-2시간 (분석 및 복원)
- **Phase 3**: 2-3시간 (새 패키지 생성)
- **Phase 4**: 2-4시간 (백엔드 수정)
- **Phase 5**: 1-2시간 (프론트엔드 수정)
- **총 예상**: 6-11시간

## 🔄 **후속 작업**

### **완료 후 혜택:**
1. **머징 용이성**: Cline 업데이트 시 충돌 90% 감소 예상
2. **유지보수성**: Caret 고유 기능의 명확한 관리
3. **확장성**: 새로운 Caret 기능 추가 시 독립적 개발 가능

---

**작성자**: Alpha (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-01-23  
**최종 수정일**: 2025-01-23  
