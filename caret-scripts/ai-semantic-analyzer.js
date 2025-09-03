#!/usr/bin/env node

/**
 * AI-Powered Semantic Document Analyzer
 *
 * 핵심 아이디어:
 * 1. 원본 문서(MD/JSON) → AI가 시맨틱 요약 생성
 * 2. 두 시맨틱 요약을 비교
 * 3. 실제 의미론적 동등성 검증
 */

const fs = require("fs")
const path = require("path")

class AISemanticAnalyzer {
	constructor() {
		this.promptTemplate = {
			semantic_extraction: `
You are a semantic analyzer. Extract the core semantic meaning from the following document.
Create a structured summary that captures:

1. **Core Purpose**: What is the main goal/function?
2. **Key Capabilities**: List all major features/tools/actions
3. **Behavioral Rules**: Important constraints or guidelines
4. **Input/Output Patterns**: Expected inputs and outputs
5. **Domain Concepts**: Key technical or domain-specific concepts

Output in this JSON format:
{
  "core_purpose": "...",
  "capabilities": ["capability1", "capability2", ...],
  "rules": ["rule1", "rule2", ...],
  "io_patterns": {
    "inputs": ["..."],
    "outputs": ["..."]
  },
  "concepts": ["concept1", "concept2", ...]
}

Document to analyze:
---
{{DOCUMENT}}
---
`,
			semantic_comparison: `
Compare these two semantic documents and determine their equivalence:

Document A Semantics:
{{DOC_A}}

Document B Semantics:
{{DOC_B}}

Analyze:
1. Are the core purposes equivalent?
2. Do they provide the same capabilities?
3. Are the behavioral rules compatible?
4. Do they handle inputs/outputs similarly?
5. Do they cover the same domain concepts?

Output a detailed equivalence report in JSON:
{
  "overall_equivalence": 0-100,
  "purpose_match": 0-100,
  "capability_coverage": 0-100,
  "rule_compatibility": 0-100,
  "io_similarity": 0-100,
  "concept_overlap": 0-100,
  "missing_in_b": [...],
  "missing_in_a": [...],
  "conflicts": [...],
  "verdict": "EQUIVALENT|MOSTLY_EQUIVALENT|PARTIALLY_EQUIVALENT|NOT_EQUIVALENT"
}
`,
		}
	}

	/**
	 * Step 1: AI에게 문서의 시맨틱 요약을 요청
	 * 실제 구현시 OpenAI/Claude API 호출
	 */
	async extractSemantics(document, documentType) {
		console.log(`📝 Extracting semantics from ${documentType} document...`)

		// 실제로는 AI API 호출
		// const response = await callAIAPI(this.promptTemplate.semantic_extraction.replace('{{DOCUMENT}}', document))

		// 데모용 시뮬레이션
		return this.simulateSemanticExtraction(document, documentType)
	}

	/**
	 * Step 2: 두 시맨틱 문서 비교
	 */
	async compareSemantics(semanticsA, semanticsB) {
		console.log("🔍 Comparing semantic documents...")

		// 실제로는 AI API 호출
		// const prompt = this.promptTemplate.semantic_comparison
		//   .replace('{{DOC_A}}', JSON.stringify(semanticsA, null, 2))
		//   .replace('{{DOC_B}}', JSON.stringify(semanticsB, null, 2))
		// const response = await callAIAPI(prompt)

		// 데모용 시뮬레이션
		return this.simulateComparison(semanticsA, semanticsB)
	}

	/**
	 * 데모용 시맨틱 추출 시뮬레이션
	 */
	simulateSemanticExtraction(document, documentType) {
		const lines = document.split("\n")
		const semantics = {
			core_purpose: "",
			capabilities: [],
			rules: [],
			io_patterns: { inputs: [], outputs: [] },
			concepts: [],
		}

		// 간단한 패턴 매칭으로 시맨틱 추출 시뮬레이션
		if (documentType === "workflow") {
			semantics.core_purpose = "Workflow for safe Cline file modification"

			// Instructions/steps 추출
			lines.forEach((line) => {
				if (line.includes("instruction") || line.includes("step")) {
					semantics.capabilities.push(line.trim())
				}
				if (line.includes("CARET MODIFICATION") || line.includes("backup")) {
					semantics.rules.push(line.trim())
				}
				if (line.includes("npm") || line.includes("git")) {
					semantics.io_patterns.inputs.push(line.trim())
				}
			})

			// 핵심 개념 추출
			const concepts = ["modification", "verification", "backup", "safety", "integration"]
			concepts.forEach((concept) => {
				if (document.toLowerCase().includes(concept)) {
					semantics.concepts.push(concept)
				}
			})
		} else if (documentType === "system_prompt") {
			semantics.core_purpose = "AI assistant system prompt with tool capabilities"

			// 도구 추출
			const toolMatches = document.match(/## \w+|"[\w_]+": \{/g) || []
			semantics.capabilities = toolMatches.map((t) => t.replace(/[#"{]/g, "").trim())

			// 규칙 추출
			if (document.includes("agent") || document.includes("AGENT")) {
				semantics.rules.push("agent_mode")
			}
			if (document.includes("chatbot") || document.includes("CHATBOT")) {
				semantics.rules.push("chatbot_mode")
			}

			// 파라미터 추출
			const paramMatches = document.match(/- \w+:|"[\w_]+": /g) || []
			semantics.io_patterns.inputs = paramMatches.slice(0, 5).map((p) => p.replace(/[-:"]/g, "").trim())

			// 개념 추출
			semantics.concepts = ["tools", "execution", "collaboration", "analysis"]
		}

		return semantics
	}

	/**
	 * 데모용 비교 시뮬레이션
	 */
	simulateComparison(semanticsA, semanticsB) {
		const result = {
			overall_equivalence: 0,
			purpose_match: 0,
			capability_coverage: 0,
			rule_compatibility: 0,
			io_similarity: 0,
			concept_overlap: 0,
			missing_in_b: [],
			missing_in_a: [],
			conflicts: [],
			verdict: "NOT_EQUIVALENT",
		}

		// 목적 비교
		result.purpose_match = this.calculateSimilarity(semanticsA.core_purpose, semanticsB.core_purpose)

		// 능력 비교
		const capA = new Set(semanticsA.capabilities)
		const capB = new Set(semanticsB.capabilities)
		const capIntersection = new Set([...capA].filter((x) => capB.has(x)))
		result.capability_coverage = Math.round((capIntersection.size / Math.max(capA.size, capB.size)) * 100)

		// 규칙 호환성
		const rulesA = new Set(semanticsA.rules)
		const rulesB = new Set(semanticsB.rules)
		const ruleIntersection = new Set([...rulesA].filter((x) => rulesB.has(x)))
		result.rule_compatibility = Math.round((ruleIntersection.size / Math.max(rulesA.size, rulesB.size)) * 100)

		// I/O 패턴
		const ioA = new Set([...semanticsA.io_patterns.inputs, ...semanticsA.io_patterns.outputs])
		const ioB = new Set([...semanticsB.io_patterns.inputs, ...semanticsB.io_patterns.outputs])
		const ioIntersection = new Set([...ioA].filter((x) => ioB.has(x)))
		result.io_similarity = Math.round((ioIntersection.size / Math.max(ioA.size, ioB.size)) * 100)

		// 개념 겹침
		const conceptsA = new Set(semanticsA.concepts)
		const conceptsB = new Set(semanticsB.concepts)
		const conceptIntersection = new Set([...conceptsA].filter((x) => conceptsB.has(x)))
		result.concept_overlap = Math.round((conceptIntersection.size / Math.max(conceptsA.size, conceptsB.size)) * 100)

		// 누락 항목
		result.missing_in_b = [...capA].filter((x) => !capB.has(x))
		result.missing_in_a = [...capB].filter((x) => !capA.has(x))

		// 전체 점수
		result.overall_equivalence = Math.round(
			result.purpose_match * 0.3 +
				result.capability_coverage * 0.25 +
				result.rule_compatibility * 0.2 +
				result.io_similarity * 0.15 +
				result.concept_overlap * 0.1,
		)

		// 판정
		if (result.overall_equivalence >= 95) {
			result.verdict = "EQUIVALENT"
		} else if (result.overall_equivalence >= 80) {
			result.verdict = "MOSTLY_EQUIVALENT"
		} else if (result.overall_equivalence >= 60) {
			result.verdict = "PARTIALLY_EQUIVALENT"
		} else {
			result.verdict = "NOT_EQUIVALENT"
		}

		return result
	}

	calculateSimilarity(textA, textB) {
		if (textA === textB) {
			return 100
		}

		const wordsA = new Set(textA.toLowerCase().split(/\W+/))
		const wordsB = new Set(textB.toLowerCase().split(/\W+/))
		const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)))

		return Math.round((intersection.size / Math.max(wordsA.size, wordsB.size)) * 100)
	}

	/**
	 * 메인 분석 함수
	 */
	async analyze(file1Path, file2Path, type1 = "auto", type2 = "auto") {
		console.log("🤖 AI-Powered Semantic Analysis")
		console.log("=".repeat(60))

		// 파일 읽기
		const content1 = fs.readFileSync(file1Path, "utf8")
		const content2 = fs.readFileSync(file2Path, "utf8")

		// 타입 자동 감지
		if (type1 === "auto") {
			type1 = this.detectDocumentType(content1, file1Path)
		}
		if (type2 === "auto") {
			type2 = this.detectDocumentType(content2, file2Path)
		}

		console.log(`📄 Document 1: ${path.basename(file1Path)} (${type1})`)
		console.log(`📄 Document 2: ${path.basename(file2Path)} (${type2})`)
		console.log()

		// Step 1: AI로 시맨틱 추출
		const semantics1 = await this.extractSemantics(content1, type1)
		const semantics2 = await this.extractSemantics(content2, type2)

		// 시맨틱 문서 저장 (검증용)
		const outputDir = path.dirname(file1Path)
		const semantic1Path = path.join(outputDir, `${path.basename(file1Path, path.extname(file1Path))}-semantic.json`)
		const semantic2Path = path.join(outputDir, `${path.basename(file2Path, path.extname(file2Path))}-semantic.json`)

		fs.writeFileSync(semantic1Path, JSON.stringify(semantics1, null, 2))
		fs.writeFileSync(semantic2Path, JSON.stringify(semantics2, null, 2))

		console.log(`💾 Semantic documents saved:`)
		console.log(`   - ${semantic1Path}`)
		console.log(`   - ${semantic2Path}`)
		console.log()

		// Step 2: 시맨틱 비교
		const comparison = await this.compareSemantics(semantics1, semantics2)

		// 결과 출력
		this.displayResults(comparison, path.basename(file1Path), path.basename(file2Path))

		// 비교 결과 저장
		const resultPath = path.join(outputDir, "ai-semantic-comparison.json")
		fs.writeFileSync(
			resultPath,
			JSON.stringify(
				{
					metadata: {
						timestamp: new Date().toISOString(),
						file1: file1Path,
						file2: file2Path,
						type1: type1,
						type2: type2,
					},
					semantics: {
						document1: semantics1,
						document2: semantics2,
					},
					comparison: comparison,
				},
				null,
				2,
			),
		)

		console.log(`\n📊 Full comparison report saved: ${resultPath}`)

		return comparison
	}

	detectDocumentType(content, filePath) {
		if (filePath.includes("workflow") || content.includes("step_1") || content.includes("## Step")) {
			return "workflow"
		}
		if (filePath.includes("prompt") || content.includes("You are") || content.includes("## Tools")) {
			return "system_prompt"
		}
		if (filePath.endsWith(".json")) {
			return "json_config"
		}
		return "document"
	}

	displayResults(comparison, file1Name, file2Name) {
		console.log("🎯 SEMANTIC EQUIVALENCE ANALYSIS RESULTS")
		console.log("=".repeat(60))

		console.log(`\n📊 Overall Equivalence: ${comparison.overall_equivalence}%`)
		console.log(`   Verdict: ${comparison.verdict}`)

		console.log("\n📈 Detailed Scores:")
		console.log(
			`   Purpose Match:        ${comparison.purpose_match}% ${comparison.purpose_match >= 90 ? "✅" : comparison.purpose_match >= 70 ? "⚠️" : "❌"}`,
		)
		console.log(
			`   Capability Coverage:  ${comparison.capability_coverage}% ${comparison.capability_coverage >= 90 ? "✅" : comparison.capability_coverage >= 70 ? "⚠️" : "❌"}`,
		)
		console.log(
			`   Rule Compatibility:   ${comparison.rule_compatibility}% ${comparison.rule_compatibility >= 90 ? "✅" : comparison.rule_compatibility >= 70 ? "⚠️" : "❌"}`,
		)
		console.log(
			`   I/O Similarity:       ${comparison.io_similarity}% ${comparison.io_similarity >= 90 ? "✅" : comparison.io_similarity >= 70 ? "⚠️" : "❌"}`,
		)
		console.log(
			`   Concept Overlap:      ${comparison.concept_overlap}% ${comparison.concept_overlap >= 90 ? "✅" : comparison.concept_overlap >= 70 ? "⚠️" : "❌"}`,
		)

		if (comparison.missing_in_b.length > 0) {
			console.log(`\n⚠️ Missing in ${file2Name}:`)
			comparison.missing_in_b.forEach((item) => console.log(`   - ${item}`))
		}

		if (comparison.missing_in_a.length > 0) {
			console.log(`\n⚠️ Missing in ${file1Name}:`)
			comparison.missing_in_a.forEach((item) => console.log(`   - ${item}`))
		}

		if (comparison.conflicts.length > 0) {
			console.log("\n❌ Conflicts detected:")
			comparison.conflicts.forEach((conflict) => console.log(`   - ${conflict}`))
		}

		console.log("\n💡 RECOMMENDATION:")
		switch (comparison.verdict) {
			case "EQUIVALENT":
				console.log("   ✅ Documents are semantically equivalent. Safe to use interchangeably.")
				break
			case "MOSTLY_EQUIVALENT":
				console.log("   ⚠️ Documents are mostly equivalent. Review minor differences before production use.")
				break
			case "PARTIALLY_EQUIVALENT":
				console.log("   ⚠️ Documents have significant differences. Careful review required.")
				break
			case "NOT_EQUIVALENT":
				console.log("   ❌ Documents are not semantically equivalent. Cannot be used interchangeably.")
				break
		}
	}
}

// CLI 사용
if (require.main === module) {
	const args = process.argv.slice(2)

	if (args.length < 2) {
		console.log("AI-Powered Semantic Document Analyzer")
		console.log("Uses AI to extract and compare semantic meaning of documents")
		console.log()
		console.log("Usage: node ai-semantic-analyzer.js <file1> <file2> [type1] [type2]")
		console.log()
		console.log("Types: workflow, system_prompt, json_config, document, auto (default)")
		console.log()
		console.log("Examples:")
		console.log("  node ai-semantic-analyzer.js workflow.md workflow.json")
		console.log("  node ai-semantic-analyzer.js cline-prompt.txt caret-prompt.json system_prompt system_prompt")
		console.log()
		console.log("Note: This is a simulation. Real implementation requires AI API integration.")
		process.exit(1)
	}

	const [file1, file2, type1 = "auto", type2 = "auto"] = args
	const analyzer = new AISemanticAnalyzer()

	analyzer.analyze(file1, file2, type1, type2).catch((error) => {
		console.error("❌ Analysis failed:", error.message)
		process.exit(1)
	})
}

module.exports = { AISemanticAnalyzer }
