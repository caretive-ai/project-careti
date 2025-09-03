## 🌐 I18n 자동화 도구

### i18n 누락 파일 탐지 스크립트

프론트엔드 컴포넌트에서 하드코딩된 텍스트를 자동으로 탐지하고 i18n 적용이 필요한 파일을 분류하는 도구입니다.

#### 주요 기능
- **하드코딩 텍스트 자동 탐지**: 따옴표 안의 UI 텍스트 패턴 매칭
- **i18n 상태 분류**: Complete, Partial, None, Unnecessary, Uncertain로 분류
- **카테고리별 정리**: Account, Chat, Settings, Common 등 기능별 분류
- **체크리스트 생성**: 작업 진행용 markdown 체크리스트 자동 생성

#### 사용법
```bash
# caret-merging 프로젝트 루트에서 실행
cd caret-scripts/tools

# 상세 보고서 생성
node report-i18n-missing-file.js ../../webview-ui/src/components

# 체크리스트 생성 
node generate-checklist.js
```

#### 생성되는 보고서 파일
- `i18n-comprehensive-report.txt` - 상세 분석 보고서
- `i18n-checklist-report.md` - 작업용 체크리스트 (markdown)
- `i18n-detailed-report.json` - 원시 데이터 (JSON)

#### 탐지 패턴
```javascript
// UI 텍스트 패턴
/"([^"]{3,}[a-zA-Z][^"]*?)"/g    // 따옴표 문자열
/'([^']{3,}[a-zA-Z][^']*?)'/g    // 홑따옴표 문자열

// 제외 패턴
/^[a-z-]+$/          // CSS 클래스
/^[A-Z_]+$/          // 상수
/^https?:\/\//       // URL
```

#### 분류 기준
- **Complete**: i18n import + t() 사용 + 하드코딩 없음
- **Partial**: t() 일부 사용 + 하드코딩 일부 남음  
- **None**: i18n 미적용 + 하드코딩 텍스트 존재
- **Unnecessary**: 순수 로직/스타일링 컴포넌트
- **Uncertain**: 기타 애매한 케이스
