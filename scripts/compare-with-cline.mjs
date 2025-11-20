#!/usr/bin/env node
/**
 * compare-with-cline.mjs
 *
 * `git diff --name-status <clineRef>..HEAD` 결과를 검사해 삭제(D)된 파일이 없는지 확인한다.
 * - 기본 clineRef: v3.38.1 (CLINE_REF 환경변수로 변경 가능)
 * - exit 0: OK, exit 1: 삭제 감지
 */

import { execSync } from "node:child_process"

const CLINE_REF = process.env.CLINE_REF || "v3.38.1"

function run(cmd) {
	return execSync(cmd, { encoding: "utf8" }).trim()
}

let diff = ""
try {
	diff = run(`git diff --name-status ${CLINE_REF}..HEAD`)
} catch (err) {
	console.error(`[compare-with-cline] git diff 실패: ${CLINE_REF}..HEAD`)
	process.exit(1)
}

const lines = diff
	.split(/\r?\n/)
	.map((l) => l.trim())
	.filter(Boolean)

const deleted = lines.filter((l) => l.startsWith("D\t"))

if (deleted.length) {
	console.error(`[compare-with-cline] 삭제 감지 (${deleted.length}건)`)
	for (const line of deleted) {
		console.error(` - ${line}`)
	}
	process.exit(1)
}

console.log(`[compare-with-cline] OK: 삭제 없음 (${lines.length} changes vs ${CLINE_REF})`)
