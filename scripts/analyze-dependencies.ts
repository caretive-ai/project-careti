import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "glob";
import { resolve, relative, dirname } from "node:path";

interface Edge {
	from: string;
	to: string;
}

function isRelevant(file: string): boolean {
	return file.startsWith("src/core/api/") || file.startsWith("src/core/controller/") || file.startsWith("src/core/services/");
}

const files = globSync("src/**/*.{ts,tsx}", { nodir: true }).filter(isRelevant);
const edges: Edge[] = [];

for (const file of files) {
	const content = readFileSync(file, "utf-8");
	const dir = dirname(resolve(file));
	const matches = content.matchAll(/import[^\n]+from\s+['\"]([^'\"]+)['\"]/g);
	for (const match of matches) {
		const specifier = match[1];
		if (!specifier.startsWith(".")) continue;
		const absolute = resolve(dir, specifier);
		let target = relative(process.cwd(), absolute);
		if (!target.endsWith(".ts") && !target.endsWith(".tsx")) {
			target += ".ts";
		}
		edges.push({ from: file, to: target });
	}
}

const baseDir = "caret-docs/merging/v3.38.1";
writeFileSync(`${baseDir}/dependency-graph.json`, JSON.stringify(edges, null, 2));

const summaryLines: string[] = [
	"# Core Dependency Graph",
	"",
	`총 ${edges.length} 의존 관계`,
	"",
	"| From | To |",
	"| --- | --- |",
];
edges.slice(0, 500).forEach((edge) => {
	summaryLines.push(`| ${edge.from} | ${edge.to} |`);
});
if (edges.length > 500) {
	summaryLines.push(`| ... | ... | (총 ${edges.length}개) |`);
}
writeFileSync(`${baseDir}/dependency-graph.md`, summaryLines.join("\n"));

console.log(`의존성 ${edges.length}건을 분석했습니다.`);
