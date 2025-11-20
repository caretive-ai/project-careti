# Next Session Plan (npm 기준)

1) 네트워크/DNS 확인
- `ping registry.npmjs.org` 또는 `curl -I https://registry.npmjs.org`

2) 의존성 설치 및 프로토 생성
- `npm install`
- `npm run protos`
- `npm run tsc` (또는 `npm run compile`)로 타입/생성물 확인

3) Phase B 재시작 (소규모 배치)
- 3-way diff (base/cline/caret) 명령은 `caret-docs/merging/v3.38.1/attempt-2-master.md` 참조
- 5~10개 파일 배치로 Proto → Controller → Services/API → Webview 순서 처리
- 배치마다 `npm run tsc` 확인, 깨끗하면 체크포인트 태그 남김

4) 스크립트 뼈대(TODO 구현 필요)
- scripts/classify-files.ts
- scripts/extract-caret-mods.ts
- scripts/analyze-dependencies.ts
- scripts/incremental-merge.sh
- scripts/compare-with-cline.mjs

5) 현재 상태
- 브랜치: merge/cline-v3.38.1-attempt2 (clean)
- 비교 리포: comparison/{caret-main, cline-v3.38.1} (.gitignore)
- 문서: attempt-2-master.md 최신화(Phase B 재시작 지침 포함)
- 생성물 없음 → tsc 실패 중, npm install 이후 재시도 필요
