import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type MergeStrategy =
	| "AUTO_ADOPT"
	| "AUTO_KEEP"
	| "SIMPLE_MERGE"
	| "COMPLEX_MERGE"
	| "PROTO_MERGE"
	| "UI_MERGE"
	| "MANUAL_REVIEW";

type Priority = "high" | "medium" | "low";

interface Classification {
	file: string;
	strategy: MergeStrategy;
	priority: Priority;
	notes: string[];
	presence: "upstream" | "caret" | "both";
}

const baseDir = "caret-docs/merging/v3.38.1";
const upstreamListPath = join(baseDir, "upstream-files.txt");
const caretListPath = join(baseDir, "caret-files.txt");
const outputJsonPath = join(baseDir, "file-classification.json");
const outputMarkdownPath = join(baseDir, "file-classification.md");

function loadList(path: string): Set<string> {
	const content = readFileSync(path, "utf-8");
	return new Set(
		content
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean),
	);
}

const upstreamSet = loadList(upstreamListPath);
const caretSet = loadList(caretListPath);
const union = new Set([...upstreamSet, ...caretSet]);

function classify(file: string): Classification {
	const inUpstream = upstreamSet.has(file);
	const inCaret = caretSet.has(file);
	const presence = inUpstream && inCaret ? "both" : inUpstream ? "upstream" : "caret";

	let strategy: MergeStrategy = presence === "upstream" ? "AUTO_ADOPT" : presence === "caret" ? "AUTO_KEEP" : "MANUAL_REVIEW";
	let priority: Priority = "medium";
	const notes: string[] = [];

	if (file.startsWith("proto/")) {
		strategy = "PROTO_MERGE";
		priority = "high";
		notes.push("Proto 필드/메시지 충돌 위험");
	} else if (file.startsWith("src/core/controller") || file.startsWith("src/core/api")) {
		strategy = presence === "both" ? "COMPLEX_MERGE" : strategy;
		priority = "high";
		notes.push("Controller/API 로직 변경");
	} else if (file.startsWith("src/core/hooks") || file.startsWith("src/core/prompts")) {
		strategy = "COMPLEX_MERGE";
		priority = "high";
		notes.push("Hooks/Prompt 시스템 영향");
	} else if (file.startsWith("webview-ui/")) {
		strategy = "UI_MERGE";
		priority = "high";
		notes.push("Webview + i18n 검증 필요");
	} else if (
		file.startsWith("scripts/") ||
		file.startsWith("caret-scripts/") ||
		file === "package.json" ||
		file === "pnpm-lock.yaml" ||
		file.startsWith(".vscode/") ||
		file.startsWith(".github/")
	) {
		strategy = "COMPLEX_MERGE";
		notes.push("Root/스크립트 설정");
	} else if (file.startsWith("docs/") || file.startsWith("caret-docs/") || file.startsWith(".caretrules") || file.startsWith(".claude")) {
		strategy = "MANUAL_REVIEW";
		priority = "low";
		notes.push("문서/정책");
	} else if (!inCaret && inUpstream) {
		strategy = "AUTO_ADOPT";
		priority = "low";
	} else if (inCaret && !inUpstream) {
		strategy = "AUTO_KEEP";
		priority = "low";
	}

	if (strategy === "COMPLEX_MERGE" && presence === "both") {
		notes.push("3-way 비교 필수");
	}

	if (notes.length === 0) {
		notes.push("-");
	}

	return { file, strategy, priority, notes, presence };
}

const classifications: Classification[] = Array.from(union)
	.sort()
	.map((file) => classify(file));

writeFileSync(outputJsonPath, JSON.stringify(classifications, null, 2));

const markdownLines: string[] = ["# v3.38.1 파일 분류", "", "| 파일 | 전략 | 우선순위 | 범주 | 비고 |", "| --- | --- | --- | --- | --- |"];
for (const entry of classifications) {
	markdownLines.push(
		`| ${entry.file} | ${entry.strategy} | ${entry.priority} | ${entry.presence} | ${entry.notes.join("<br>")} |`,
	);
}
writeFileSync(outputMarkdownPath, markdownLines.join("\n"));

console.log(`분류 완료: ${classifications.length} files`);
