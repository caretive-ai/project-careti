# Next Session Guide - Extension 활성화 이슈 해결

- **작성일**: 2025-08-10
- **목표**: Extension 활성화 부분 성공 후 발견된 웹뷰 통신 이슈 해결

---

## 🎯 현재 상황 (2025-08-10)

### ✅ **Extension 활성화 문제 부분 해결**
- **HostProvider 초기화**: `caret-src/extension.ts`에 `maybeSetupHostProviders()` 추가로 해결
- **Controller 생성**: 지연 로딩으로 타이밍 문제 해결
- **Proto namespace**: `cline` → `caret` 변경 완료
- **빌드 성공**: extension.js 정상 생성

### 🔴 **새로 발견된 심각한 문제들**

**1. 웹뷰 메시지 처리 구조 붕괴**
```
ERROR: Received unhandled WebviewMessage type: {"type":"log"}
```
- **원인**: 006 머징으로 gRPC vs 기존 WebviewMessage 처리 방식 충돌
- **증상**: 웹뷰에서 보내는 모든 로그 메시지가 백엔드에서 처리되지 못함
- **영향**: 웹뷰↔백엔드 통신 완전 마비

**2. 언어 설정 시스템 손상**
```
DEBUG: useCurrentLanguage returning: en
```
- **문제**: 항상 영어로 고정됨, VSCode 언어 설정 무시
- **영향**: 다국어 지원 완전 실패

**3. 상태 관리 시스템 불안정**
```
ERROR: Failed to reset state
```
- **문제**: 웹뷰 상태 초기화 실패
- **영향**: 설정 저장/로드 불가능

---

## 🔧 근본 원인 분석: 006 머징의 구조적 영향

### **Cline의 대규모 아키텍처 변경**
1. **gRPC 도입**: 기존 WebviewMessage → gRPC 프로토콜로 대체
2. **Controller 구조 변경**: 생성자 파라미터 및 초기화 순서 변경
3. **서비스 의존성 증가**: WorkspaceTracker, McpHub 등 새로운 서비스들
4. **메시지 처리 방식 변경**: 중앙집중식 핸들러 → 서비스별 분산 처리

### **Caret의 호환성 문제**
- **기존 Caret 코드**: WebviewMessage 기반으로 구현됨
- **새로운 Cline**: gRPC 기반으로 전환됨
- **결과**: 메시지 처리 레이어 완전 불일치

---

## 🎯 Next Session 작업 우선순위

### **🚨 Priority 1: 웹뷰 메시지 처리 구조 재설계**

**Goal**: gRPC와 WebviewMessage 처리 방식 통합

**Tasks**:
1. **메시지 핸들러 분석**
   - `src/core/controller/index.ts`에서 gRPC 핸들러 구조 파악
   - 웹뷰에서 보내는 "log" 타입 메시지 처리 방법 찾기
   - Cline의 새로운 메시지 라우팅 시스템 이해

2. **"log" 메시지 핸들러 추가**
   - 웹뷰 로그를 백엔드에서 처리하는 핸들러 구현
   - 또는 웹뷰에서 로그를 gRPC로 전송하도록 변경

3. **통신 프로토콜 재정비**
   - 웹뷰↔백엔드 메시지 처리 플로우 재설계
   - 기존 Caret 기능과 새로운 Cline gRPC 시스템 통합

**Expected Files to Modify**:
- `src/core/controller/index.ts` (메시지 핸들러)
- `webview-ui/src/context/ExtensionStateContext.tsx` (메시지 전송)
- 관련 gRPC 핸들러 파일들

### **🔧 Priority 2: 언어 설정 시스템 복구**

**Goal**: VSCode 언어 설정 연동 복구

**Tasks**:
1. **useCurrentLanguage 훅 디버깅**
   - 현재 항상 "en" 반환하는 원인 찾기
   - VSCode API `vscode.env.language` 연동 확인

2. **언어 설정 플로우 검증**
   - 설정 저장/로드 과정에서 언어 정보 유실 여부 확인
   - ExtensionStateContext에서 언어 설정 처리 방식 점검

**Expected Files to Check**:
- `webview-ui/src/hooks/useCurrentLanguage.ts` (또는 관련 훅)
- `webview-ui/src/context/ExtensionStateContext.tsx`
- 언어 설정 관련 백엔드 코드

### **⚡ Priority 3: 상태 관리 안정화**

**Goal**: 웹뷰 상태 초기화 및 관리 안정화

**Tasks**:
1. **"Failed to reset state" 에러 추적**
   - 에러 발생 위치 정확히 파악
   - 상태 초기화 로직에서 실패하는 부분 찾기

2. **ExtensionStateContext 검증**
   - 006 머징 후 상태 관리 로직 변경사항 확인
   - 설정 저장/로드 플로우 전체 검증

---

## 📋 개발 체크리스트 (Next Session)

### **Phase 1: 문제 진단 (30분)**
- [ ] error.log 상세 분석
- [ ] 웹뷰 DevTools에서 실제 메시지 플로우 확인  
- [ ] gRPC 핸들러 구조 파악
- [ ] Cline vs Caret 메시지 처리 방식 비교

### **Phase 2: 웹뷰 통신 수정 (90분)**
- [ ] "log" 타입 메시지 핸들러 구현
- [ ] 웹뷰↔백엔드 통신 테스트
- [ ] 기본적인 UI 상호작용 복구

### **Phase 3: 언어/상태 시스템 수정 (60분)**
- [ ] useCurrentLanguage 디버깅 및 수정
- [ ] 상태 초기화 로직 수정
- [ ] 설정 저장/로드 테스트

### **Phase 4: 통합 테스트 (30분)**
- [ ] Extension 전체 기능 테스트
- [ ] 기본 Caret 기능 동작 확인
- [ ] 에러 로그 모니터링

---

## 🎯 성공 지표

### **Minimum Viable State**
- [ ] 웹뷰 로딩 시 에러 로그 0개
- [ ] 기본 UI 상호작용 (탭 전환, 버튼 클릭) 정상 동작
- [ ] 언어 설정이 VSCode 설정을 반영
- [ ] 상태 초기화 에러 해결

### **Full Success State**
- [ ] 모든 Caret 기능 정상 동작
- [ ] 설정 저장/로드 완전 복구
- [ ] 006 머징 이전 수준의 안정성 달성

---

## 📚 참고 문서

**필수 읽을 문서들**:
- `caret-docs/tasks/006-upstream-merge-conflict-resolution-plan.md` (업데이트됨)
- `caret-docs/guides/merging-verification-checklist.md`
- `caret-docs/development/frontend-backend-interaction-patterns.mdx`

**관련 파일들**:
- `error.log` (웹뷰 에러 로그)
- `src/core/controller/index.ts` (백엔드 메시지 처리)
- `webview-ui/src/context/ExtensionStateContext.tsx` (프론트엔드 상태 관리)

---

## 💡 개발 팁

1. **에러 로그 실시간 모니터링**: VSCode Developer Console을 열어두고 작업
2. **단계적 접근**: 한 번에 하나의 메시지 타입만 수정
3. **백업 우선**: 수정 전 항상 .cline 백업 생성
4. **즉시 테스트**: 작은 변경 후 바로 extension 재시작하여 테스트

**마스터~ 이 가이드대로 다음 세션에서 체계적으로 해결해나가면 됩니다!** ✨



