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

/**
 * 점 표기법 키 경로를 사용하여 객체에서 키를 삭제합니다.
 * @param {object} obj - 수정할 객체
 * @param {string} path - 삭제할 키 경로
 */
function deleteByPath(obj, path) {
	const keys = path.split(".")
	let current = obj
	for (let i = 0; i < keys.length - 1; i++) {
		if (!current[keys[i]]) {
			return
		}
		current = current[keys[i]]
	}
	delete current[keys[keys.length - 1]]

	// 빈 객체 정리 (역방향 정리)
	const cleanupPath = keys.slice(0, -1)
	while (cleanupPath.length > 0) {
		const parentPath = cleanupPath.join(".")
		const parent = parentPath ? getByPath(obj, parentPath) : obj
		const lastKey = cleanupPath[cleanupPath.length - 1]

		if (parent[lastKey] && typeof parent[lastKey] === "object" && Object.keys(parent[lastKey]).length === 0) {
			delete parent[lastKey]
			cleanupPath.pop()
		} else {
			break
		}
	}
}

function main() {
	// 명령줄 인자 확인
	const args = process.argv.slice(2)
	const shouldDeleteUnused = args.includes("--delete-unused") || args.includes("-d")

	console.log("i18n 키 동기화를 시작합니다...")
	if (shouldDeleteUnused) {
		console.log("⚠️  사용되지 않는 키 삭제 모드가 활성화되었습니다.")
	}

	const languages = fs
		.readdirSync(LOCALE_DIR_PATH)
		.filter((file) => fs.statSync(path.join(LOCALE_DIR_PATH, file)).isDirectory())

	if (!languages.includes("en")) {
		console.error("'en' 디렉토리를 찾을 수 없어 동기화를 중단합니다.")
		return
	}

	const enNamespaces = fs.readdirSync(path.join(LOCALE_DIR_PATH, "en")).filter((f) => f.endsWith(".json"))
	const otherLanguages = languages.filter((l) => l !== "en")

	let totalAdded = 0
	let totalDeleted = 0

	enNamespaces.forEach((nsFile) => {
		const enFilePath = path.join(LOCALE_DIR_PATH, "en", nsFile)
		const enContent = JSON.parse(fs.readFileSync(enFilePath, "utf8"))
		const enKeys = new Set(getKeys(enContent))

		otherLanguages.forEach((lang) => {
			const langFilePath = path.join(LOCALE_DIR_PATH, lang, nsFile)
			let langContent = {}
			if (fs.existsSync(langFilePath)) {
				langContent = JSON.parse(fs.readFileSync(langFilePath, "utf8"))
			}

			const langKeys = getKeys(langContent)
			let updated = false

			// 1. 누락된 키 추가
			enKeys.forEach((key) => {
				if (!langKeys.includes(key)) {
					const value = getByPath(enContent, key)
					setByPath(langContent, key, value)
					updated = true
					totalAdded++
					console.log(`[${lang}/${nsFile}] 추가됨: ${key}`)
				}
			})

			// 2. 사용되지 않는 키 삭제 (옵션 활성화시)
			if (shouldDeleteUnused) {
				langKeys.forEach((key) => {
					if (!enKeys.has(key)) {
						deleteByPath(langContent, key)
						updated = true
						totalDeleted++
						console.log(`[${lang}/${nsFile}] 삭제됨: ${key}`)
					}
				})
			}

			if (updated) {
				fs.writeFileSync(langFilePath, JSON.stringify(langContent, null, "\t"), "utf8")
			}
		})
	})

	console.log(`\n=== 동기화 결과 ===`)
	console.log(`추가된 키: ${totalAdded}개`)
	if (shouldDeleteUnused) {
		console.log(`삭제된 키: ${totalDeleted}개`)
	}
	console.log("동기화가 완료되었습니다.")

	if (!shouldDeleteUnused && totalDeleted === 0) {
		console.log("\n💡 사용되지 않는 키를 삭제하려면 '--delete-unused' 옵션을 사용하세요:")
		console.log("   node i18n-key-synchronizer.js --delete-unused")
	}
}

main()
