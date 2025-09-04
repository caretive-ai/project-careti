const fs = require("fs")
const path = require("path")

const LOCALE_DIR_PATH = path.join(__dirname, "../../webview-ui/src/caret/locale")

/**
 * 재귀적으로 객체의 모든 키 경로를 가져옵니다.
 * @param {object} obj - 분석할 객체
 * @param {string} prefix - 현재 경로 접두사
 * @returns {string[]} 키 경로 배열
 */
function getKeys(obj, prefix = "") {
	return Object.keys(obj).reduce((res, el) => {
		if (typeof obj[el] === "object" && obj[el] !== null && !Array.isArray(obj[el])) {
			return [...res, ...getKeys(obj[el], prefix + el + ".")]
		}
		return [...res, prefix + el]
	}, [])
}

/**
 * 점 표기법 키 경로를 사용하여 객체에 값을 설정합니다.
 * @param {object} obj - 수정할 객체
 * @param {string} path - 키 경로
 * @param {*} value - 설정할 값
 */
function setByPath(obj, path, value) {
	const keys = path.split(".")
	let current = obj
	for (let i = 0; i < keys.length - 1; i++) {
		if (current[keys[i]] === undefined) {
			current[keys[i]] = {}
		}
		current = current[keys[i]]
	}
	current[keys[keys.length - 1]] = value
}

/**
 * 점 표기법 키 경로를 사용하여 객체에서 값을 가져옵니다.
 * @param {object} obj - 값을 가져올 객체
 * @param {string} path - 키 경로
 * @returns {*} 값
 */
function getByPath(obj, path) {
	return path.split(".").reduce((o, k) => (o || {})[k], obj)
}

function main() {
	console.log("i18n 키 동기화를 시작합니다...")
	const languages = fs
		.readdirSync(LOCALE_DIR_PATH)
		.filter((file) => fs.statSync(path.join(LOCALE_DIR_PATH, file)).isDirectory())

	if (!languages.includes("en")) {
		console.error("'en' 디렉토리를 찾을 수 없어 동기화를 중단합니다.")
		return
	}

	const enNamespaces = fs.readdirSync(path.join(LOCALE_DIR_PATH, "en")).filter((f) => f.endsWith(".json"))
	const otherLanguages = languages.filter((l) => l !== "en")

	let totalSynced = 0

	enNamespaces.forEach((nsFile) => {
		const enFilePath = path.join(LOCALE_DIR_PATH, "en", nsFile)
		const enContent = JSON.parse(fs.readFileSync(enFilePath, "utf8"))
		const enKeys = getKeys(enContent)

		otherLanguages.forEach((lang) => {
			const langFilePath = path.join(LOCALE_DIR_PATH, lang, nsFile)
			let langContent = {}
			if (fs.existsSync(langFilePath)) {
				langContent = JSON.parse(fs.readFileSync(langFilePath, "utf8"))
			}

			const langKeys = new Set(getKeys(langContent))
			let updated = false

			enKeys.forEach((key) => {
				if (!langKeys.has(key)) {
					const value = getByPath(enContent, key)
					setByPath(langContent, key, value)
					updated = true
					totalSynced++
					console.log(`[${lang}/${nsFile}] 추가됨: ${key}`)
				}
			})

			if (updated) {
				fs.writeFileSync(langFilePath, JSON.stringify(langContent, null, "\t"), "utf8")
			}
		})
	})

	console.log(`\n총 ${totalSynced}개의 누락된 키를 동기화했습니다.`)
	console.log("동기화가 완료되었습니다.")
}

main()
