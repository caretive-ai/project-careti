# Luke Yang - t03-3-2 Caret ↔ CodeCenter i18n 교체 작업

**작업 기간**: 예정  
**담당자**: Luke Yang  
**우선순위**: Medium  
**AI 어시스턴트**: Claude Code  
**상위 작업**: [t03-3 프론트엔드 i18n 및 상호이식 개선](./t03-3-프론트i18n및상호이식개선.md)

## 🎯 작업 목적

### **왜 이 작업이 필요한가?**
- t03-3-1에서 cline → caret i18n 변환 완료 후 필요
- caret과 codecenter는 모두 i18n을 사용하지만 브랜드명이 다름
- locale 파일 교체 방식으로 브랜드 전환 구현

### **작업 범위**
- **브랜드별 locale 폴더 관리**: caret/codecenter 각각의 locale 세트
- **파일 교체 스크립트**: 브랜드 전환 시 locale 폴더 전체 교체
- **백업/복원 시스템**: 안전한 브랜드 전환 보장

## 📋 작업 계획

### **Phase 1: locale 파일 브랜드 변환 준비** ⏸️ 대기
**목표**: caret과 codecenter의 locale 파일 세트 준비

#### **1-1. 현재 caret locale 파일 백업**
- [ ] webview-ui/src/caret/locale/ 전체 백업
- [ ] 30개 JSON 파일 (ko/en/ja/zh × 7 namespaces) 확인
- [ ] locale-caret/ 폴더로 백업

#### **1-2. codecenter locale 파일 생성**
- [ ] caret locale 파일 복사하여 codecenter 버전 생성
- [ ] "Caret" → "CodeCenter" 브랜드명 일괄 변경
- [ ] locale-codecenter/ 폴더에 저장

### **Phase 2: locale 교체 스크립트 개발** ⏸️ 대기
**목표**: 브랜드 전환을 위한 자동화 스크립트

#### **2-1. 교체 스크립트 구현**
- [ ] switch-brand-locale.js 스크립트 작성
- [ ] caret → codecenter locale 교체 기능
- [ ] codecenter → caret locale 교체 기능
- [ ] 백업 및 복원 메커니즘

#### **2-2. brand-converter.js와 연동**
- [ ] locale 교체를 brand-converter.js에 통합
- [ ] 백엔드 브랜드 변환과 동기화
- [ ] 일괄 변환 명령어 구현

### **Phase 3: 브랜드별 테스트 및 검증** ⏸️ 대기
**목표**: caret ↔ codecenter 완전 전환 검증

#### **3-1. Caret 브랜드 테스트**
- [ ] caret locale 파일로 전체 UI 확인
- [ ] 4개 언어 모두 "Caret" 표시 검증
- [ ] 기능 정상 동작 확인

#### **3-2. CodeCenter 브랜드 테스트**
- [ ] codecenter locale 파일로 전환
- [ ] 4개 언어 모두 "CodeCenter" 표시 검증
- [ ] 브랜드 전환 후 기능 정상 동작 확인

#### **3-3. 전환 안정성 테스트**
- [ ] 반복 전환 테스트 (caret ↔ codecenter)
- [ ] 빌드 안정성 확인
- [ ] 런타임 오류 없음 확인

## 🚨 주의사항

### **기술적 제약**
- **locale 파일 동기화**: caret과 codecenter locale 구조 일치 필수
- **빌드 안정성**: locale 교체 후 `npm run compile` 성공 확인
- **백업 필수**: 교체 전 항상 현재 locale 백업

### **품질 기준**
- **브랜드 일관성**: 모든 텍스트에서 브랜드명 통일
- **교체 완전성**: 누락된 파일 없이 전체 교체
- **복원 가능성**: 언제든 이전 브랜드로 복원 가능

## 📊 예상 결과

### **완성 후 상태**
- ✅ caret ↔ codecenter 완전 자동 전환
- ✅ locale 파일 교체로 즉시 브랜드 변경
- ✅ 4개 언어 모두에서 브랜드 일관성 유지
- ✅ brand-converter.js와 통합된 일괄 변환

### **성과 지표**
- **전환 시간**: 수초 내 완전 브랜드 전환
- **안정성**: 빌드 오류 0건
- **브랜드 호환성**: caret/codecenter 양방향 전환 지원

---

**작업 상태**: ⏸️ 대기중 (t03-3-1 완료 후 진행)