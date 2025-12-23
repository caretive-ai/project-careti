# 2025-12-23: 공지 다국어 번역 및 모델 리스트/README 업데이트

## 1. 목표
- 한국어 인앱 공지사항을 기준으로 다국어 번역을 동기화한다.
- 모델 리스트 생성 스크립트를 실행해 최신 모델 문서를 업데이트한다.
- README.md에서 최신 모델/이미지 모델/CLI 정식 지원을 전면 강조한다.

## 2. 작업 내용
- `webview-ui/src/caret/locale/en/announcement.json`
- `webview-ui/src/caret/locale/ja/announcement.json`
- `webview-ui/src/caret/locale/zh/announcement.json`
- `node caret-scripts/build/generate-support-model-list.js` 실행
- `caret-docs/development/support-model-list.mdx`, `caret-docs/development/support-model-list.en.mdx` 갱신
- `README.md` 주요 업데이트 섹션 및 모델 수(260) 반영
- `CHANGELOG.md`에 v0.4.2 항목 추가

## 3. 후속 확인
- 필요 시 한국어/다국어 CHANGELOG 추가 동기화 여부 검토
