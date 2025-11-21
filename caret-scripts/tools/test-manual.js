// Manual test for report-i18n-missing-file.js
const fs = require("fs")
const path = require("path")
const { findI18nMissingFiles } = require("./report-i18n-missing-file.js")

// Create test fixtures
const testDir = path.join(__dirname, "test-fixtures")
if (!fs.existsSync(testDir)) {
	fs.mkdirSync(testDir, { recursive: true })
}

// Test fixture 1: Hardcoded component
fs.writeFileSync(
	path.join(testDir, "HardcodedComponent.tsx"),
	`
import React from 'react';

const HardcodedComponent = () => {
  return (
    <div>
      <h1>Hi, I'm Cline</h1>
      <p>What can I do for you?</p>
      <button>Let's Go!</button>
    </div>
  );
};

export default HardcodedComponent;
`,
)

// Test fixture 2: i18n component
fs.writeFileSync(
	path.join(testDir, "I18nComponent.tsx"),
	`
import React from 'react';
import { t } from '@/caret/utils/i18n';

const I18nComponent = () => {
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description')}</p>
      <button>{t('button.letsGo')}</button>
    </div>
  );
};

export default I18nComponent;
`,
)

// Run tests
async function runTests() {
	console.log("🧪 Running manual tests...\n")

	try {
		const result = await findI18nMissingFiles(testDir)

		// Test 1: Should detect hardcoded component
		const hasHardcoded = result.missingFiles.some((f) => f.includes("HardcodedComponent.tsx"))
		console.log(`✓ Test 1 - Detect hardcoded: ${hasHardcoded ? "PASS" : "FAIL"}`)

		// Test 2: Should NOT detect i18n component
		const hasI18n = result.missingFiles.some((f) => f.includes("I18nComponent.tsx"))
		console.log(`✓ Test 2 - Skip i18n component: ${!hasI18n ? "PASS" : "FAIL"}`)

		// Test 3: Should have analysis data
		console.log(`✓ Test 3 - Analysis data: ${result.analysis.length > 0 ? "PASS" : "FAIL"}`)

		// Test 4: Should detect "Cline" brand
		const hasClineBrand = result.analysis.some((a) => a.brandReferences.includes("Cline"))
		console.log(`✓ Test 4 - Detect Cline brand: ${hasClineBrand ? "PASS" : "FAIL"}`)

		console.log("\n📊 Test Results:")
		console.log(`   Total files: ${result.summary.totalFiles}`)
		console.log(`   Missing i18n: ${result.summary.missingI18nCount}`)
		console.log(`   i18n ready: ${result.summary.i18nReadyCount}`)

		console.log("\n📋 Analysis Details:")
		result.analysis.forEach((analysis) => {
			console.log(`   ${path.basename(analysis.file)}:`)
			console.log(`     - Hardcoded texts: ${analysis.hardcodedTexts.length}`)
			console.log(`     - Brand refs: ${analysis.brandReferences.join(", ") || "none"}`)
			console.log(`     - Example text: "${analysis.hardcodedTexts[0] || "none"}"`)
		})
	} catch (error) {
		console.error("❌ Test failed:", error.message)
	} finally {
		// Cleanup
		if (fs.existsSync(testDir)) {
			fs.rmSync(testDir, { recursive: true, force: true })
		}
	}
}

runTests()
