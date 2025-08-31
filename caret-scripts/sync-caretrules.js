#!/usr/bin/env node

/**
 * Caret Rules Synchronization Script
 *
 * .caretrules/workflows/ 디렉토리의 모든 JSON 파일들을 병합하여
 * .cursorrules와 .windsurfrules로 동기화
 *
 * Usage: node caret-scripts/sync-caretrules.js
 */

const fs = require("fs")
const path = require("path")

console.log("🔄 Caret Rules 동기화 시작...\n")

// 파일 경로 설정
const SOURCE_DIR = ".caretrules/workflows"
const TARGET_FILES = [".cursorrules", ".windsurfrules", ".clinerules"]

// workflow 파일들을 병합하는 함수
function mergeWorkflowFiles(workflowsDir) {
	const mergedContent = {}

	try {
		const files = fs.readdirSync(workflowsDir)
		const jsonFiles = files.filter((file) => file.endsWith(".md") && file !== "README.md")

		console.log(`📂 발견된 workflow 파일들: ${jsonFiles.join(", ")}`)

		jsonFiles.forEach((filename) => {
			try {
				const filePath = path.join(workflowsDir, filename)
				const content = fs.readFileSync(filePath, "utf8")
				const jsonData = JSON.parse(content)

				// 파일명에서 확장자 제거하여 키로 사용
				const key = path.basename(filename, ".md")
				mergedContent[key] = jsonData

				console.log(`✅ ${filename} 파일 병합 완료`)
			} catch (error) {
				console.error(`❌ ${filename} 파일 처리 실패:`, error.message)
			}
		})

		return JSON.stringify(mergedContent, null, 2)
	} catch (error) {
		console.error(`❌ workflows 디렉토리 읽기 실패:`, error.message)
		return null
	}
}

// 메인 실행
function main() {
	try {
		// 1. workflows 디렉토리에서 모든 JSON 파일 병합
		console.log(`📁 ${SOURCE_DIR} 디렉토리에서 파일들을 병합합니다...`)
		const mergedContent = mergeWorkflowFiles(SOURCE_DIR)

		if (!mergedContent) {
			console.error("❌ workflow 파일 병합에 실패했습니다.")
			return
		}

		console.log(`✅ 모든 workflow 파일 병합 완료\n`)

		// 2. 타겟 파일들에 복사
		TARGET_FILES.forEach((filename) => {
			try {
				fs.writeFileSync(filename, mergedContent, "utf8")
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
		console.error(`❌ 동기화 실패:`, error.message)
		console.error("❌ 동기화를 중단합니다.")
	}
}

// 스크립트 실행
main()
