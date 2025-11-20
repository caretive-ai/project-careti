#!/usr/bin/env node
// @ts-check
/**
 * classify-files.ts
 *
 * 3-way 변경 파일을 분류해 전략 매트릭스를 생성한다.
 * - 기본 비교: base(v3.35.0) vs cline(v3.38.1) vs caret(caret-main)
 * - 출력: JSON/Markdown (`caret-docs/merging/v3.38.1/classification.*`)
 *
 * 전략 예시:
 *  - AUTO_ADOPT: cline만 변경 → 그대로 채택
 *  - AUTO_KEEP: caret만 변경 → 유지
 *  - PROTO_MERGE: proto/ 경로, 양측 변경 → 3-way 필요
 *  - UI_MERGE: webview-ui/ 경로, 양측 변경 → 3-way 필요
 *  - COMPLEX_MERGE: 양측 변경 → 3-way 필요
 */

import { execSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

const BASE_REF: string = process.env.BASE_REF || "v3.35.0"
const CLINE_REF: string = process.env.CLINE_REF || "v3.38.1"
const CARET_REF: string = process.env.CARET_REF || "caret-main"
const OUTPUT_DIR: string = process.env.OUT_DIR || "caret-docs/merging/v3.38.1"

function run(cmd: string) {
	return execSync(cmd, { encoding: "utf8" }).trim()
}

function parseList(raw: string) {
	return raw
		.split(/\r?\n/)
		.map((s) => s.trim())
		.filter(Boolean)
}

function readListFile(path: string) {
	return existsSync(path) ? parseList(readFileSync(path, "utf8")) : []
}

function safeDiff(refA: string, refB: string, fallbackPath: string) {
	try {
		return parseList(run(`git diff --name-only ${refA}..${refB}`))
	} catch (err) {
		console.error(`[classify-files] git diff ${refA}..${refB} 실패, fallback 사용: ${fallbackPath}`)
		const list = readListFile(fallbackPath)
		if (list.length === 0) {
			console.error(`[classify-files] fallback(${fallbackPath}) 비어 있음. ref/tag 확인 필요.`)
			process.exit(1)
		}
		return list
	}
}

const clineDiff = safeDiff(BASE_REF, CLINE_REF, "caret-docs/merging/v3.38.1/upstream-files.txt")
const caretDiff = safeDiff(BASE_REF, CARET_REF, "caret-docs/merging/v3.38.1/caret-files.txt")

const clineSet = new Set(clineDiff)
const caretSet = new Set(caretDiff)
const union: string[] = Array.from(new Set([...clineDiff, ...caretDiff])).sort()

function category(file: string) {
	if (file.startsWith("proto/")) return "PROTO"
	if (file.startsWith("webview-ui/")) return "UI"
	if (file.startsWith("scripts/") || file.startsWith("cli/")) return "SCRIPT"
	if (file.startsWith("docs/") || file.startsWith("caret-docs/")) return "DOC"
	return "CORE"
}

function classify(file: string) {
	const inCline = clineSet.has(file)
	const inCaret = caretSet.has(file)
	const cat = category(file)

	if (inCline && inCaret) {
		if (cat === "PROTO") return { strategy: "PROTO_MERGE", reason: "proto 양측 변경" }
		if (cat === "UI") return { strategy: "UI_MERGE", reason: "webview 양측 변경" }
		return { strategy: "COMPLEX_MERGE", reason: "양측 변경 → 3-way 필요" }
	}
	if (inCline) {
		if (cat === "PROTO") return { strategy: "PROTO_MERGE", reason: "proto cline 변경" }
		return { strategy: "AUTO_ADOPT", reason: "cline-only 변경" }
	}
	if (inCaret) {
		if (cat === "UI") return { strategy: "AUTO_KEEP", reason: "webview caret-only" }
		return { strategy: "AUTO_KEEP", reason: "caret-only 변경" }
	}
	return { strategy: "MANUAL_REVIEW", reason: "변경 감지 안 됨" }
}

const entries = union.map((file: string) => {
	const { strategy, reason } = classify(file)
	return {
		file,
		strategy,
		category: category(file),
		reason,
	}
})

const stats: Record<string, number> = {}
for (const entry of entries) {
	stats[entry.strategy] = (stats[entry.strategy] || 0) + 1
}

const meta = {
	baseRef: BASE_REF,
	clineRef: CLINE_REF,
	caretRef: CARET_REF,
	generatedAt: new Date().toISOString(),
	total: entries.length,
}

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true })
}

function writeJson() {
	const target = `${OUTPUT_DIR}/classification.json`
	ensureDir(dirname(target))
	const payload = { meta, stats, entries }
	writeFileSync(target, JSON.stringify(payload, null, 2))
	console.log(`[classify-files] JSON saved: ${target}`)
}

function writeMarkdown() {
	const target = `${OUTPUT_DIR}/classification.md`
	ensureDir(dirname(target))
	const header = [
		"# File Strategy Matrix",
		"",
		`- baseRef: ${BASE_REF}`,
		`- clineRef: ${CLINE_REF}`,
		`- caretRef: ${CARET_REF}`,
		`- generated: ${meta.generatedAt}`,
		"",
		`| File | Strategy | Category | Reason |`,
		`| --- | --- | --- | --- |`,
	]
	const rows = entries.map((e) => `| ${e.file} | ${e.strategy} | ${e.category} | ${e.reason.replace(/\|/g, "\\|")} |`)
	const content = header.concat(rows).join("\n")
	writeFileSync(target, content)
	console.log(`[classify-files] Markdown saved: ${target}`)
}

writeJson()
writeMarkdown()
console.log(`[classify-files] 완료: total ${entries.length}, stats ${JSON.stringify(stats)}`)
