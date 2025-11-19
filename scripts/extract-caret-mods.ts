import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { glob } from "glob";

interface CaretMod {
	file: string;
	kind: "comment" | "proto-field" | "caret-file";
	line: number;
	details: string;
}

const mods: CaretMod[] = [];

function run(cmd: string): string {
	return execSync(cmd, { encoding: "utf-8" });
}

try {
	const caretComments = run("git grep -n 'CARET MODIFICATION'");
	caretComments
		.split(/\r?\n/)
		.filter(Boolean)
		.forEach((line) => {
			const [file, lineNum, ...rest] = line.split(":");
			mods.push({
				file,
				kind: "comment",
				line: Number.parseInt(lineNum, 10),
				details: rest.join(":").trim(),
			});
		});
} catch (error) {
	// git grep may fail if no matches; ignore
}

const protoFiles = glob.sync("proto/**/*.proto");
for (const file of protoFiles) {
	const content = readFileSync(file, "utf-8");
	const lines = content.split(/\r?\n/);
	lines.forEach((text, index) => {
		const match = text.match(/=\s*(\d+)/);
		if (match) {
			const fieldNumber = Number.parseInt(match[1], 10);
			if (fieldNumber >= 1072) {
				mods.push({
					file,
					kind: "proto-field",
					line: index + 1,
					details: text.trim(),
				});
			}
		}
	});
}

const caretGlob = ["caret-src/**/*", ".caretrules/**/*", ".claude/**/*", "caret-docs/**/*"];
for (const pattern of caretGlob) {
	const files = glob.sync(pattern, { nodir: true });
	files.forEach((file) => {
		mods.push({ file, kind: "caret-file", line: 0, details: "caret asset" });
	});
}

const baseDir = "caret-docs/merging/v3.38.1";
writeFileSync(`${baseDir}/caret-mods.json`, JSON.stringify(mods, null, 2));

const summaryLines: string[] = [
	"# Caret Modifications Report",
	"",
	`총 ${mods.length} 항목`,
	"",
	"| 파일 | 종류 | 라인 | 세부 |",
	"| --- | --- | --- | --- |",
];
mods.slice(0, 500).forEach((mod) => {
	summaryLines.push(`| ${mod.file} | ${mod.kind} | ${mod.line} | ${mod.details.replace(/\|/g, '\\\|')} |`);
});
if (mods.length > 500) {
	summaryLines.push(`| ... | ... | ... | 나머지 ${mods.length - 500}개 항목은 JSON 참조 |`);
}
writeFileSync(`${baseDir}/caret-mods.md`, summaryLines.join("\n"));

console.log(`총 ${mods.length}개의 Caret 수정사항을 추출했습니다.`);
