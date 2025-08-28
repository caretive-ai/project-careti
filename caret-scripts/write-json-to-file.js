const fs = require("fs")

async function main() {
	const filePath = process.argv[2]
	const content = process.argv[3]

	if (!filePath || !content) {
		console.error("Usage: node write-json-to-file.js <file_path> <json_content>")
		process.exit(1)
	}

	try {
		fs.writeFileSync(filePath, content, { encoding: "utf8", flag: "w" })
		console.log(`Successfully wrote content to ${filePath}`)
	} catch (error) {
		console.error(`Error writing to file ${filePath}:`, error)
		process.exit(1)
	}
}

main()
