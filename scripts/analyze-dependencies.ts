#!/usr/bin/env node

// @ts-nocheck
/**
 * analyze-dependencies.ts
 *
 * src/* 및 webview-ui/src/*의 상대 import를 스캔하여 카테고리간 의존 그래프를 만든다.
 * - 출력: `caret-docs/merging/v3.38.1/dependency-report.json` / `.md`
 * - 범위: src, webview-ui/src (node_modules, dist 등은 스킵)
 */

import { execSync } from "node:child_process"
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

const OUTPUT_DIR = process.env.OUT_DIR || "caret-docs/merging/v3.38.1"
const ROOT = process.cwd()
const SCAN_ROOTS = ["src", "webview-ui/src"]
const SKIP_DIRS = new Set([
	".git",
	"node_modules",
	"dist",
	"dist-standalone",
	"out",
	"build",
	"comparison",
	".changeset",
	".husky",
	"test-results",
	"tests-results",
	"docs",
])
const IMPORT_RE = /import[^'"]+from\s+['"]([^'"]+)['"]/g

function listFiles(dir) {
	const results = []
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (SKIP_DIRS.has(entry.name)) continue
		const full = join(dir, entry.name)
		if (entry.isDirectory()) {
			results.push(...listFiles(full))
		} else if (
			entry.isFile() &&
			(entry.name.endsWith(".ts") ||
				entry.name.endsWith(".tsx") ||
				entry.name.endsWith(".mts") ||
				entry.name.endsWith(".cts"))
		) {
			results.push(full)
		}
	}
	return results
}

function categoryFor(path) {
	const rel = relative(ROOT, path)
	if (rel.startsWith("webview-ui/src")) return "webview"
	if (rel.startsWith("src/core/controller")) return "controller"
	if (rel.startsWith("src/core/services")) return "services"
	if (rel.startsWith("src/core/providers") || rel.startsWith("src/providers")) return "provider"
	if (rel.startsWith("src/hosts")) return "hosts"
	if (rel.startsWith("src/shared") || rel.startsWith("src/utils")) return "shared"
	return "other"
}

function normalizeTarget(source, target) {
	if (!target.startsWith(".")) return null // 외부 모듈
	const base = dirname(source)
	const resolved = resolve(base, target)
	// 확장자가 없어도 경로만으로 카테고리 계산
	return resolved
}

function analyzeImports(file) {
	const content = readFileSync(file, "utf8")
	const imports = []
	let match
	while ((match = IMPORT_RE.exec(content)) !== null) {
		imports.push(match[1])
	}
	return imports
}

const edges = {}
const filesByCategory = {}
const details = []

for (const root of SCAN_ROOTS) {
	const absRoot = resolve(ROOT, root)
	try {
		statSync(absRoot)
	} catch {
		continue
	}
	const files = listFiles(absRoot)
	for (const file of files) {
		const fromCat = categoryFor(file)
		filesByCategory[fromCat] = (filesByCategory[fromCat] || 0) + 1
		const imports = analyzeImports(file)
		const resolvedTargets = imports.map((imp) => normalizeTarget(file, imp)).filter(Boolean)
		const toCats = new Set()
		for (const target of resolvedTargets) {
			const toCat = categoryFor(target)
			toCats.add(toCat)
			const key = `${fromCat}->${toCat}`
			edges[key] = (edges[key] || 0) + 1
		}
		details.push({ file: relative(ROOT, file), category: fromCat, to: [...toCats] })
	}
}

const meta = {
	generatedAt: new Date().toISOString(),
	repo: (() => {
		try {
			return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim()
		} catch {
			return ROOT
		}
	})(),
}

function ensureDir(path) {
	mkdirSync(path, { recursive: true })
}

function writeJson() {
	const target = `${OUTPUT_DIR}/dependency-report.json`
	ensureDir(dirname(target))
	const payload = { meta, edges, filesByCategory, details }
	writeFileSync(target, JSON.stringify(payload, null, 2))
	console.log(`[analyze-dependencies] JSON saved: ${target}`)
}

function writeMarkdown() {
	const target = `${OUTPUT_DIR}/dependency-report.md`
	ensureDir(dirname(target))
	const lines = [
		"# Dependency Report",
		"",
		`- generated: ${meta.generatedAt}`,
		`- repo: ${meta.repo}`,
		"",
		"## Category counts",
		...Object.entries(filesByCategory).map(([cat, count]) => `- ${cat}: ${count} files`),
		"",
		"## Edges (from -> to : count)",
		...Object.entries(edges).map(([edge, count]) => `- ${edge}: ${count}`),
	]
	writeFileSync(target, lines.join("\n"))
	console.log(`[analyze-dependencies] Markdown saved: ${target}`)
}

writeJson()
writeMarkdown()
console.log(`[analyze-dependencies] 완료: files=${details.length}, edges=${Object.keys(edges).length}`)
