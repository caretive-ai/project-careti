# Next Session Plan (enable network first)

1) Ensure network/DNS works
- Check: `ping registry.npmjs.org` or `curl -I https://registry.npmjs.org`
- 현재 환경에서는 `registry.npmjs.org` DNS 조회가 `EAI_AGAIN`으로 실패해서 curl/ping 모두 되지 않음.

2) Install deps and regenerate protos (required for tsc)
- `pnpm install`
- `pnpm run protos`
- Then: `pnpm exec tsc --noEmit`
- `pnpm install`도 같은 DNS 문제로 의존성 다운로드가 실패했으니, 네트워크가 복구되면 다시 실행해야 함.

3) Phase B restart (small batches)
- Use 3-way diff commands (see attempt-2-master.md Section "3-Way 비교 실행 방법")
- Work in 5~10 file batches: Proto → Controller → Services/API → Webview
- After each batch: `pnpm exec tsc --noEmit` and tag checkpoint if clean

4) Scripts scaffolded (TODO to implement)
- scripts/classify-files.ts
- scripts/extract-careti-mods.ts
- scripts/analyze-dependencies.ts
- scripts/incremental-merge.sh
- scripts/compare-with-cline.mjs

5) State
- Branch: merge/cline-v3.38.1-attempt2 (clean)
- comparison/ (ignored) contains careti-main, cline-v3.38.1
- proto checked out from v3.38.1 + careti-main (clean)
- Doc updated: attempt-2-master.md (Phase B 재시작 지침 포함)
