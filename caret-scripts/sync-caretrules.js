#!/usr/bin/env node

/**
 * Caret Rules Synchronization Script
 *
 * .caretrules 파일을 .cursorrules와 .windsurfrules로 복사하여 동기화
 *
 * Usage: node caret-scripts/sync-caretrules.js
 */

const fs = require("fs")

console.log("🔄 Caret Rules 동기화 시작...\n")

// 파일 경로 설정
const SOURCE_FILE = ".caretrules"
const TARGET_FILES = [".cursorrules", ".windsurfrules", ".clinerules"]

// 메인 실행
function main() {
	try {
		// 1. 소스 파일 읽기
		const sourceContent = fs.readFileSync(SOURCE_FILE, "utf8")
		console.log(`✅ ${SOURCE_FILE} 파일을 읽었습니다`)

		// 2. 타겟 파일들에 복사
		TARGET_FILES.forEach((filename) => {
			try {
				fs.writeFileSync(filename, sourceContent, "utf8")
				console.log(`✅ ${filename} 업데이트 완료`)
			} catch (error) {
				console.error(`❌ ${filename} 업데이트 실패:`, error.message)
			}
		})

		console.log("\n🎉 모든 룰 파일 동기화 완료!")
		console.log("📄 업데이트된 파일들:")
		TARGET_FILES.forEach((file) => console.log(`   - ${file}`))
		console.log("\n💡 이제 git commit으로 변경사항을 저장하세요.")
	} catch (error) {
		console.error(`❌ ${SOURCE_FILE} 파일을 읽을 수 없습니다:`, error.message)
		console.error("❌ 동기화를 중단합니다.")
	}
}

// 스크립트 실행
main()
