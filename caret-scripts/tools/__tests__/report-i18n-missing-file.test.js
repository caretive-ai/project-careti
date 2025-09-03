// TDD Test for i18n missing file detection script
const fs = require("fs")
const path = require("path")

// Import the script we're going to create
const { findI18nMissingFiles } = require("../report-i18n-missing-file.js")

describe("report-i18n-missing-file.js", () => {
	const testComponentsDir = path.join(__dirname, "fixtures/components")

	beforeAll(() => {
		// Create test fixtures
		if (!fs.existsSync(testComponentsDir)) {
			fs.mkdirSync(testComponentsDir, { recursive: true })
		}

		// Create a component with hardcoded text (should be detected)
		fs.writeFileSync(
			path.join(testComponentsDir, "HardcodedComponent.tsx"),
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

		// Create a component with i18n (should NOT be detected)
		fs.writeFileSync(
			path.join(testComponentsDir, "I18nComponent.tsx"),
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

		// Create a component with mixed content (should be detected)
		fs.writeFileSync(
			path.join(testComponentsDir, "MixedComponent.tsx"),
			`
import React from 'react';
import { t } from '@/caret/utils/i18n';

const MixedComponent = () => {
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>Some hardcoded text here</p>
      <span>Cline wants to execute</span>
    </div>
  );
};

export default MixedComponent;
    `,
		)
	})

	afterAll(() => {
		// Cleanup test fixtures
		if (fs.existsSync(testComponentsDir)) {
			fs.rmSync(testComponentsDir, { recursive: true, force: true })
		}
	})

	test("should detect components with hardcoded text", async () => {
		const result = await findI18nMissingFiles(testComponentsDir)

		expect(result).toHaveProperty("missingFiles")
		expect(result.missingFiles).toContain(path.join(testComponentsDir, "HardcodedComponent.tsx"))
		expect(result.missingFiles).toContain(path.join(testComponentsDir, "MixedComponent.tsx"))
		expect(result.missingFiles).not.toContain(path.join(testComponentsDir, "I18nComponent.tsx"))
	})

	test("should provide detailed analysis for each file", async () => {
		const result = await findI18nMissingFiles(testComponentsDir)

		expect(result).toHaveProperty("analysis")
		expect(result.analysis).toBeInstanceOf(Array)

		const hardcodedFile = result.analysis.find((item) => item.file.endsWith("HardcodedComponent.tsx"))

		expect(hardcodedFile).toBeDefined()
		expect(hardcodedFile.hardcodedTexts).toContain("Hi, I'm Cline")
		expect(hardcodedFile.hardcodedTexts).toContain("What can I do for you?")
		expect(hardcodedFile.hardcodedTexts).toContain("Let's Go!")
	})

	test('should detect "Cline" brand references specifically', async () => {
		const result = await findI18nMissingFiles(testComponentsDir)

		const fileWithCline = result.analysis.find((item) => item.hardcodedTexts.some((text) => text.includes("Cline")))

		expect(fileWithCline).toBeDefined()
		expect(fileWithCline.brandReferences).toContain("Cline")
	})

	test("should categorize files by component type", async () => {
		const result = await findI18nMissingFiles(testComponentsDir)

		expect(result).toHaveProperty("categorized")
		expect(result.categorized).toHaveProperty("chat")
		expect(result.categorized).toHaveProperty("welcome")
		expect(result.categorized).toHaveProperty("settings")
		expect(result.categorized).toHaveProperty("common")
		expect(result.categorized).toHaveProperty("other")
	})

	test("should generate summary report", async () => {
		const result = await findI18nMissingFiles(testComponentsDir)

		expect(result).toHaveProperty("summary")
		expect(result.summary).toHaveProperty("totalFiles")
		expect(result.summary).toHaveProperty("missingI18nCount")
		expect(result.summary).toHaveProperty("i18nReadyCount")
		expect(result.summary.totalFiles).toBeGreaterThan(0)
		expect(result.summary.missingI18nCount).toBeGreaterThan(0)
	})
})
