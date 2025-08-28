const fs = require("fs")
const path = require("path")

function extractMarkdownPaths(obj, paths = new Set()) {
	// .en 확장자를 제외하도록 정규식 수정
	const markdownRegex = /[a-zA-Z0-9_./-]+?\.(md|mdx|ko\.md|ja\.md|zh-cn\.md)/g

	if (typeof obj === "string") {
		let match
		while ((match = markdownRegex.exec(obj)) !== null) {
			const fullPath = match[0]
			// .en이 포함된 경로를 명시적으로 제외
			if (
				!fullPath.includes(".en.") &&
				(fullPath.startsWith("caret-docs/") ||
					fullPath.startsWith("docs/") ||
					fullPath.startsWith("./") ||
					fullPath.startsWith("../") ||
					fullPath.match(/^[a-zA-Z0-9_-]+\.(md|mdx)$/))
			) {
				paths.add(fullPath)
			}
		}
	} else if (Array.isArray(obj)) {
		for (const item of obj) {
			extractMarkdownPaths(item, paths)
		}
	} else if (typeof obj === "object" && obj !== null) {
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				extractMarkdownPaths(obj[key], paths)
			}
		}
	}
	return paths
}

async function main() {
	const caretrulesFilePath = ".caretrules"
	const outputFilePath = process.argv[2] // 출력 파일 경로를 인자로 받음

	if (!outputFilePath) {
		console.error("Usage: node extract-markdown-paths.js <output_file_path>")
		process.exit(1)
	}

	try {
		const caretrulesContent = fs.readFileSync(caretrulesFilePath, "utf8")
		const caretrules = JSON.parse(caretrulesContent)
		const extractedPaths = extractMarkdownPaths(caretrules)

		// 결과를 파일에 직접 쓰기
		fs.writeFileSync(outputFilePath, JSON.stringify(Array.from(extractedPaths), null, 2), "utf8")
		console.log(`Successfully extracted paths to ${outputFilePath}`)
	} catch (error) {
		console.error(`Error processing files:`, error)
		process.exit(1)
	}
}

main()
