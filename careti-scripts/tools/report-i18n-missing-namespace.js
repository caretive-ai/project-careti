const fs = require("fs")
const path = require("path")
const ts = require("typescript")

const I18N_CONFIG_PATH = path.join(__dirname, "../../webview-ui/src/caret/utils/i18n.ts")
const LOCALE_DIR_PATH = path.join(__dirname, "../../webview-ui/src/caret/locale")
const REPORT_PATH = path.join(__dirname, "../i18n-missing-namespace-report.md")

/**
 * i18n.ts 파일을 AST로 파싱하여 등록된 네임스페이스 목록을 추출합니다.
 * @returns {string[]} 등록된 네임스페이스 배열
 */
function getRegisteredNamespaces() {
	try {
		const i18nConfigFile = fs.readFileSync(I18N_CONFIG_PATH, "utf8")
		const sourceFile = ts.createSourceFile("i18n.ts", i18nConfigFile, ts.ScriptTarget.ES2015, true)

		let translationsNode = null
		ts.forEachChild(sourceFile, (node) => {
			if (ts.isVariableStatement(node)) {
				const declaration = node.declarationList.declarations[0]
				if (declaration.name.getText(sourceFile) === "translations") {
					translationsNode = declaration.initializer
				}
			}
		})

		if (!translationsNode || !ts.isObjectLiteralExpression(translationsNode)) {
			console.error("Could not find 'translations' object literal in i18n.ts")
			return []
		}

		const enProperty = translationsNode.properties.find((prop) => {
			return ts.isPropertyAssignment(prop) && prop.name.getText(sourceFile) === "en"
		})

		if (!enProperty || !ts.isPropertyAssignment(enProperty) || !ts.isObjectLiteralExpression(enProperty.initializer)) {
			console.error("Could not find 'en' property in translations object.")
			return []
		}

		const namespaces = enProperty.initializer.properties
			.map((prop) => {
				if (ts.isPropertyAssignment(prop) && prop.name) {
					return prop.name.getText(sourceFile).replace(/['"]/g, "")
				}
				return null
			})
			.filter(Boolean)

		return namespaces
	} catch (error) {
		console.error(`Error reading or parsing ${I18N_CONFIG_PATH}:`, error)
		return []
	}
}

function getLocaleNamespaces() {
	try {
		const languages = fs
			.readdirSync(LOCALE_DIR_PATH)
			.filter((file) => fs.statSync(path.join(LOCALE_DIR_PATH, file)).isDirectory())

		if (languages.length === 0) {
			console.error("No language directories found in locale folder.")
			return {}
		}

		const allNamespaces = {}
		languages.forEach((lang) => {
			const langDir = path.join(LOCALE_DIR_PATH, lang)
			const files = fs.readdirSync(langDir)
			allNamespaces[lang] = files.filter((file) => file.endsWith(".json")).map((file) => path.basename(file, ".json"))
		})
		return allNamespaces
	} catch (error) {
		console.error(`Error reading locale directories:`, error)
		return {}
	}
}

function findDiscrepancies(registered, localeNamespaces) {
	const registeredSet = new Set(registered)
	const enNamespaces = localeNamespaces["en"] || []
	const enSet = new Set(enNamespaces)

	const missingInI18n = enNamespaces.filter((ns) => !registeredSet.has(ns))
	const unusedInLocale = registered.filter((ns) => !enSet.has(ns))

	const missingLangFiles = {}
	const languages = Object.keys(localeNamespaces).filter((lang) => lang !== "en")

	enNamespaces.forEach((enNs) => {
		languages.forEach((lang) => {
			if (!localeNamespaces[lang].includes(enNs)) {
				if (!missingLangFiles[lang]) {
					missingLangFiles[lang] = []
				}
				missingLangFiles[lang].push(enNs)
			}
		})
	})

	return { missingInI18n, unusedInLocale, missingLangFiles }
}

function generateReport(discrepancies) {
	let reportContent = `# i18n 네임스페이스 및 파일 검증 보고서\n\n`
	reportContent += `**생성일:** ${new Date().toLocaleString()}\n\n`

	const { missingInI18n, unusedInLocale, missingLangFiles } = discrepancies
	let hasIssues = false

	if (missingInI18n.length > 0) {
		hasIssues = true
		reportContent += `## 🚨 \`i18n.ts\`에 등록 누락된 네임스페이스\n\n`
		reportContent += `다음 네임스페이스 파일이 \`en\` 폴더에 존재하지만, \`i18n.ts\`에 등록되지 않았습니다.\n\n`
		missingInI18n.forEach((ns) => {
			reportContent += `- \`${ns}\`\n`
		})
		reportContent += "\n"
	}

	if (unusedInLocale.length > 0) {
		hasIssues = true
		reportContent += `## ⚠️ \`en\` 폴더에 파일이 없는 네임스페이스\n\n`
		reportContent += `다음 네임스페이스는 \`i18n.ts\`에 등록되어 있지만, \`locale/en\` 폴더에 해당 JSON 파일이 없습니다.\n\n`
		unusedInLocale.forEach((ns) => {
			reportContent += `- \`${ns}\`\n`
		})
		reportContent += "\n"
	}

	const missingLangs = Object.keys(missingLangFiles)
	if (missingLangs.length > 0) {
		hasIssues = true
		reportContent += `## 🌐 언어별 누락된 네임스페이스 파일\n\n`
		reportContent += `\`en\` 폴더에는 존재하지만, 다른 언어 폴더에는 누락된 번역 파일입니다.\n\n`
		missingLangs.forEach((lang) => {
			if (missingLangFiles[lang].length > 0) {
				reportContent += `### \`${lang}\` 폴더에 누락된 파일:\n`
				missingLangFiles[lang].forEach((ns) => {
					reportContent += `- \`${ns}.json\`\n`
				})
				reportContent += "\n"
			}
		})
	}

	if (!hasIssues) {
		reportContent += "✅ 모든 네임스페이스가 올바르게 등록 및 동기화되었습니다.\n"
	}

	try {
		fs.writeFileSync(REPORT_PATH, reportContent, "utf8")
		console.log(`Report generated successfully at ${REPORT_PATH}`)
	} catch (error) {
		console.error(`Failed to write report file:`, error)
	}
}

function main() {
	console.log("i18n 네임스페이스 및 파일 검증을 시작합니다...")
	const registered = getRegisteredNamespaces()
	const localeNamespaces = getLocaleNamespaces()

	if (registered.length === 0 || Object.keys(localeNamespaces).length === 0) {
		console.error("네임스페이스 정보를 가져올 수 없어 검증을 중단합니다.")
		return
	}

	console.log(`- 등록된 네임스페이스: ${registered.length}개`)
	console.log(`- 'en' 기준 실제 네임스페이스 파일: ${localeNamespaces["en"]?.length || 0}개`)

	const discrepancies = findDiscrepancies(registered, localeNamespaces)
	generateReport(discrepancies)
	console.log("검증이 완료되었습니다.")
}

main()
