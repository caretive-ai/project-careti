# t03 - 브랜딩 시스템 머징 작업

## 기능 개요
- **목적**: Cline 브랜딩을 Caret으로 완전 대체 
     * 브랜딩 교체된 소스 : /caret-main
  * 이미지 교체  텍스트 교체, 백앤드 교체 (Cline was) 
  * 스크립트를 통해 Cline 에서 특정 브랜드로 변경 했다가 다시 복구 가능한 스크립트 개발
    /caret-scripts/ 밑에 작성
   - 머징앞두고는 다시 뒤로 돌릴 수 있게 하고 다시 머징후 다시 변경하는 방식으로 진행하여 conflict를 최소화 하기
   - caret-asset/*.
   - caret-asset/brand.json 에 교체 할 파일들과 내용 기록
      * cline -> caret
        Cline -> Caret
        CLINE -> CARET
        클라인 -> 캐럿

## 📋 Caret 구현 가이드 준수 (Updated)

### **머징 전략 원칙 (merging-strategy-guide.md 기준)**
1. **Level 1 독립 모듈 권장**: `caret-scripts/`, `caret-assets/` 등 완전 분리
2. **Cline 원본 최소 수정**: 필요 시에만 백업 + CARET MODIFICATION 주석
3. **주석 표준**: `// CARET MODIFICATION: [간단한 설명]` 필수
4. **백업 규칙**: `{filename}-{extension}.cline` 형태로 백업 생성
5. **구조 유지**: Cline 원본 컴포넌트 구조와 패턴 최대한 유지

### **브랜딩 스크립트 개발 위치**
- **파일 위치**: `caret-scripts/brand-change.js` (Level 1 독립 모듈)
- **설정 파일**: `caret-assets/brand.json` (Level 1 독립 모듈)
- **주석 인식**: `// CARET MODIFICATION:` 주석 패턴 인식
- **테스트 방식**: git을 통한 변경사항 확인

## 🎯 통합 브랜딩 시스템 작업 순서

### **Step 1: 브랜딩 스크립트 구현**
- `caret-scripts/brand-change.js` 개발 (Level 1 독립 모듈)
- `caret-assets/brand.json` 읽어서 파일 변경 처리
- `// CARET MODIFICATION:` 주석 인식 시스템 포함
- `--direction=forward/reverse` 지원 (cline ↔ caret)

### **Step 2: VS Code 확장 메타데이터 브랜딩 테스트**
- cline → caret 변경 테스트
- caret → cline 복구 테스트
- git status로 변경사항 확인

### **Step 3: i18n 백엔드 메시지 매핑 시스템**
- 백엔드 하드코딩 메시지 조사 (`src/` 전체 "Cline wants" 등)
- `webview-ui/src/caret/locale/*/common.json`에 직접 매핑 추가
- 하드코딩 스트링을 i18n 키로 사용: `"Cline wants to open browser": "{{brand.appName}} wants to open browser"`
- 한국어/일본어/중국어 번역 작업
- 프론트엔드 변환 로직: `t(backendMessage) || backendMessage`

### **Step 4: 통합 테스트**
- 브랜딩 스크립트 + i18n 시스템 연동 테스트
- 모든 언어에서 브랜드명 정상 변환 확인

### **Step 5: 문서화**
- **f02-multilingual-i18n.mdx 수정**: 백엔드 메시지 매핑 시스템 추가
- **f03-branding-ui.mdx 생성**: 전체 브랜딩 시스템 설명 (f02 수준으로)

### **Step 6: 최종 완료**
- 전체 시스템 검증
- 문서 최종 업데이트
- 작업 완료 표기 및 커밋 푸시

## 현재 진행 상황
- ✅ 설계 및 계획 완료 (brand.json 생성, 아키텍처 확정)
- 🔄 **다음**: Step 1 브랜딩 스크립트 구현


# 피드백 1차
 - caret으로 완전히 전향 되었다고 하지만 요구한바가 안된 것 있음
 * 초기화 버튼 삭제로 완전한 확인의 어려움
   - cline 최신 버전은 초기화 버튼이 사라진것 같음. 어디있는지 알려주길 바람. 없어진거라면 이전 버전 caret-main 을 참고하여 부활 시켜 줄것
 * 룰과 워크프레이스 링크가 Cline 으로 되어있음. 모두 Caret, CaretRules로 변경필요.
   - 브랜딩 전환도 동일해야 함
 * 아이콘, 이미지 전환 안된 것으로 보임, cline그대로 보임 
 * about은 cline 그대로 임, 버전도 changelog-caret.md 참고하여 진행. 버전관리도 brand.json 처럼 관리할건지 같이 고민.
 * 페르소나와 각종 기능들이 붙을때 caret -> codecenter 등으로 역시 교체되야함. 이것도 고려할것. codecneter는 caretbot대신 codecenterbot이 템플릿이 다름
 