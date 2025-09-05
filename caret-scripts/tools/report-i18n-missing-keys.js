const fs = require("fs")
const path = require("path")

const LOCALE_DIR_PATH = path.join(__dirname, "../../webview-ui/src/caret/locale")
const REPORT_PATH = path.join(__dirname, "../i18n-missing-keys-report.md")

/**
 * 재귀적으로 객체의 모든 키 경로를 가져옵니다.
 * @param {object} obj - 분석할 객체
 * @param {string} prefix - 현재 경로 접두사
 * @returns {string[]} 키 경로 배열
 */
function getKeys(obj, prefix = "") {
	return Object.keys(obj).reduce((res, el) => {
		if (typeof obj[el] === "object" && obj[el] !== null) {
			return [...res, ...getKeys(obj[el], prefix + el + ".")]
		}
		return [...res, prefix + el]
	}, [])
}

function main() {
	console.log("i18n 누락 키 검증을 시작합니다...")
	const languages = fs
		.readdirSync(LOCALE_DIR_PATH)
		.filter((file) => fs.statSync(path.join(LOCALE_DIR_PATH, file)).isDirectory())

	if (!languages.includes("en")) {
		console.error("'en' 디렉토리를 찾을 수 없어 검증을 중단합니다.")
		return
	}

	const enNamespaces = fs.readdirSync(path.join(LOCALE_DIR_PATH, "en")).filter((f) => f.endsWith(".json"))
	const otherLanguages = languages.filter((l) => l !== "en")

	let reportContent = `# i18n 키 누락 검증 보고서\n\n`
	reportContent += `**기준 언어:** en\n`
	reportContent += `**검증 대상:** ${otherLanguages.join(", ")}\n`
	reportContent += `**생성일:** ${new Date().toLocaleString()}\n\n`

	let totalMissing = 0

	enNamespaces.forEach((nsFile) => {
		const _namespace = path.basename(nsFile, ".json")
		const enFilePath = path.join(LOCALE_DIR_PATH, "en", nsFile)
		const enContent = JSON.parse(fs.readFileSync(enFilePath, "utf8"))
		const enKeys = new Set(getKeys(enContent))

		otherLanguages.forEach((lang) => {
			const langFilePath = path.join(LOCALE_DIR_PATH, lang, nsFile)
			if (!fs.existsSync(langFilePath)) {
				return
			}

			const langContent = JSON.parse(fs.readFileSync(langFilePath, "utf8"))
			const langKeys = new Set(getKeys(langContent))

			const missingKeys = [...enKeys].filter((key) => !langKeys.has(key))

			if (missingKeys.length > 0) {
				if (totalMissing === 0) {
					reportContent += `## 🚨 누락된 번역 키 목록\n\n`
				}
				reportContent += `### \`${lang}/${nsFile}\`\n`
				missingKeys.forEach((key) => {
					reportContent += `- \`${key}\`\n`
				})
				reportContent += "\n"
				totalMissing += missingKeys.length
			}
		})
	})

	if (totalMissing === 0) {
		reportContent += "✅ 모든 언어의 번역 키가 'en'을 기준으로 동기화되었습니다.\n"
	}

	fs.writeFileSync(REPORT_PATH, reportContent, "utf8")
	console.log(`보고서가 성공적으로 생성되었습니다: ${REPORT_PATH}`)
	console.log(`총 ${totalMissing}개의 키가 누락되었습니다.`)
	console.log("검증이 완료되었습니다.")
}

main()
