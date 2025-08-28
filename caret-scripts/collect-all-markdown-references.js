const fs = require("fs")
const path = require("path")

const collectedPaths = new Set()
// .en 확장자를 제외하도록 정규식 수정
const markdownLinkRegex = /\(([^)]+\.(?:md|mdx|ko\.md|ja\.md|zh-cn\.md))\)/g

async function readFileContent(filePath) {
	try {
		return await fs.promises.readFile(filePath, "utf8")
	} catch (error) {
		// console.warn(`Warning: Could not read file ${filePath}. It might not exist or be inaccessible.`);
		return null
	}
}

async function findAndCollectReferences(filePath) {
	if (collectedPaths.has(filePath)) {
		return // Already processed
	}

	// .en이 포함된 파일은 처리하지 않음
	if (filePath.includes(".en.")) {
		return
	}

	collectedPaths.add(filePath)
	const content = await readFileContent(filePath)

	if (content) {
		let match
		while ((match = markdownLinkRegex.exec(content)) !== null) {
			const relativePath = match[1]
			// Resolve relative paths to absolute paths based on the current file's directory
			const resolvedPath = path.resolve(path.dirname(filePath), relativePath)
			// Normalize path to use forward slashes and remove redundant parts
			const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, "/")

			// Ensure the path is relative to the current working directory for consistency
			const relativeToCWD = path.relative(process.cwd(), normalizedPath).replace(/\\/g, "/")

			// .en이 포함된 경로를 명시적으로 제외
			if (!relativeToCWD.includes(".en.") && !collectedPaths.has(relativeToCWD)) {
				await findAndCollectReferences(relativeToCWD) // Recursively explore new path
			}
		}
	}
}

async function main() {
	const initialPathsFilePath = process.argv[2] // 임시 파일 경로를 인자로 받음
	if (!initialPathsFilePath) {
		console.error("Usage: node collect-all-markdown-references.js <initial_paths_file_path>")
		process.exit(1)
	}

	let initialPaths
	try {
		const initialPathsContent = fs.readFileSync(initialPathsFilePath, "utf8")
		initialPaths = JSON.parse(initialPathsContent)
	} catch (error) {
		console.error(`Error reading or parsing initial paths file ${initialPathsFilePath}:`, error)
		process.exit(1)
	}

	for (const p of initialPaths) {
		// Normalize initial paths as well
		const normalizedInitialPath = path.normalize(p).replace(/\\/g, "/")
		// .en이 포함된 초기 경로도 제외
		if (!normalizedInitialPath.includes(".en.")) {
			await findAndCollectReferences(normalizedInitialPath)
		}
	}

	console.log(JSON.stringify(Array.from(collectedPaths).sort(), null, 2))
}

main()
