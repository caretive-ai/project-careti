const fs = require("fs")

// Simple token counting approximation (GPT-like)
// Real tokenization would need tiktoken or similar library
function approximateTokenCount(text) {
	// Remove extra whitespace
	const cleanText = text.replace(/\s+/g, " ").trim()

	// Split by common delimiters
	const words = cleanText.split(/[\s\n\r\t.,;:!?(){}[\]"'`~@#$%^&*+=|\\/<>-]/)

	// Filter empty strings
	const validWords = words.filter((word) => word.length > 0)

	// Approximate: 1 token ≈ 0.75 words for technical content
	return Math.ceil(validWords.length / 0.75)
}

// Read files
const markdownContent = fs.readFileSync("./backup-protocol-markdown.md", "utf8")
const jsonContent = fs.readFileSync("./backup-protocol-json.json", "utf8")

// Count tokens
const markdownTokens = approximateTokenCount(markdownContent)
const jsonTokens = approximateTokenCount(jsonContent)

// Calculate savings
const savings = (((markdownTokens - jsonTokens) / markdownTokens) * 100).toFixed(1)

console.log("=== TOKEN EFFICIENCY COMPARISON ===")
console.log(`Markdown version: ~${markdownTokens} tokens`)
console.log(`JSON version:     ~${jsonTokens} tokens`)
console.log(`Token reduction:  ${markdownTokens - jsonTokens} tokens (${savings}% savings)`)
console.log("")

// Character count comparison
console.log("=== CHARACTER COUNT COMPARISON ===")
console.log(`Markdown characters: ${markdownContent.length}`)
console.log(`JSON characters:     ${jsonContent.length}`)
console.log(
	`Character reduction: ${markdownContent.length - jsonContent.length} chars (${(((markdownContent.length - jsonContent.length) / markdownContent.length) * 100).toFixed(1)}% savings)`,
)
