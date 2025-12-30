#!/usr/bin/env node
// @ts-check
/**
 * extract-caret-mods.ts
 *
 * CARET 특화 변경을 자동 수집한다.
 * - CARET MODIFICATION 주석 위치
 * - proto 파일 내 1072+ 필드 (Caret 확장 필드)
 * - caret-src/ 및 .caret 자산 목록
 *
 * 출력:
 *  - `caret-docs/merging/v3.38.1/caret-mod-report.json`
 *  - `caret-docs/merging/v3.38.1/caret-mod-report.md`
 */

import { execSync } from "node:child_process"
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

const OUTPUT_DIR: string = process.env.OUT_DIR || "caret-docs/merging/v3.38.1"

function runOrEmpty(cmd: string): string {
	try {
		return execSync(cmd, { encoding: "utf8" }).trim()
	} catch (err: any) {
		// ripgrep은 매치가 없으면 exit 1을 반환한다. 이 경우 빈 문자열로 처리.
		if (err.status === 1 || err.code === "EPERM") return ""
		console.error(`[extract-caret-mods] command failed: ${cmd}`)
		console.error(err.stderr ? err.stderr.toString() : err.message)
		process.exit(1)
	}
}

type GrepHit = { file: string; line: number; text: string }

function parseRipgrep(raw: string): GrepHit[] {
	return raw
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [file, lineNum, ...rest] = line.split(":")
			return { file, line: Number(lineNum), text: rest.join(":").trim() }
		})
}

function listFiles(path: string): string[] {
	try {
		return execSync(`find ${path} -type f`, { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean)
	} catch (err: any) {
		if (err.status === 1) return []
		return []
	}
}

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true })
}

// 1) CARET MODIFICATION 주석 스캔
const caretModCmd = `rg --no-heading --line-number "CARET MODIFICATION" src webview-ui proto scripts caret-docs || true`
const caretModsFallbackCmd = `git grep -n "CARET MODIFICATION" -- src webview-ui proto scripts caret-docs || true`
let caretModsRaw = runOrEmpty(caretModCmd)
if (!caretModsRaw) {
	caretModsRaw = runOrEmpty(caretModsFallbackCmd)
}
const caretMods = caretModsRaw ? parseRipgrep(caretModsRaw) : []

// 2) proto 1072+ 필드 스캔
const protoRaw = runOrEmpty(`rg --no-heading --line-number "1072" proto || true`)
const proto1072 = protoRaw ? parseRipgrep(protoRaw) : []

// 3) caret-src 및 .caret 자산
const caretSrcFiles = existsSync("caret-src") ? listFiles("caret-src") : []
const caretRulesFiles = existsSync(".caret") ? listFiles(".caret") : []

const meta = {
	generatedAt: new Date().toISOString(),
	repo: runOrEmpty("git rev-parse --show-toplevel 2>/dev/null") || process.cwd(),
}

const payload = {
	meta,
	counts: {
		caretModification: caretMods.length,
		proto1072: proto1072.length,
		caretSrcFiles: caretSrcFiles.length,
		caretRulesFiles: caretRulesFiles.length,
	},
	caretModification: caretMods,
	proto1072,
	caretSrcFiles,
	caretRulesFiles,
}

ensureDir(dirname(`${OUTPUT_DIR}/caret-mod-report.json`))
writeFileSync(`${OUTPUT_DIR}/caret-mod-report.json`, JSON.stringify(payload, null, 2))

const mdLines = [
	"# CARET Modification Report",
	"",
	`- generated: ${meta.generatedAt}`,
	`- repo: ${meta.repo}`,
	"",
	`## Summary`,
	`- CARET MODIFICATION occurrences: ${caretMods.length}`,
	`- proto 1072+ occurrences: ${proto1072.length}`,
	`- caret-src files: ${caretSrcFiles.length}`,
	`- .caret files: ${caretRulesFiles.length}`,
	"",
	"## CARET MODIFICATION (file:line)",
	caretMods.length ? caretMods.map((m) => `- ${m.file}:${m.line} | ${m.text}`).join("\n") : "- none",
	"",
	"## Proto 1072+ (file:line)",
	proto1072.length ? proto1072.map((m) => `- ${m.file}:${m.line} | ${m.text}`).join("\n") : "- none",
	"",
	"## caret-src files",
	caretSrcFiles.length ? caretSrcFiles.map((f) => `- ${f}`).join("\n") : "- none",
	"",
	"## .caret files",
	caretRulesFiles.length ? caretRulesFiles.map((f) => `- ${f}`).join("\n") : "- none",
]

writeFileSync(`${OUTPUT_DIR}/caret-mod-report.md`, mdLines.join("\n"))
console.log(`[extract-caret-mods] 완료: caretMods=${caretMods.length}, proto1072=${proto1072.length}`)
