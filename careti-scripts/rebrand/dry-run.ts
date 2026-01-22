#!/usr/bin/env npx tsx

/**
 * Dry Run Script
 * 리브랜딩 변환을 실제로 적용하지 않고 미리보기
 */

import * as fs from "fs"
import * as path from "path"
import { findFilesToReplace, replaceContent } from "./transforms/content-replace"
import { findFilesToRename } from "./transforms/file-rename"
import { runValidation } from "./transforms/validate"

const ROOT_DIR = path.resolve(__dirname, "../..")

async function main() {
	console.log("=".repeat(60))
	console.log("🔍 Careti 리브랜딩 Dry-Run")
	console.log("=".repeat(60))
	console.log(`\n프로젝트 루트: ${ROOT_DIR}\n`)

	// 1. 파일명 변경 예정 목록
	console.log("\n📁 파일명 변경 예정 목록:")
	console.log("-".repeat(40))
	const filesToRename = await findFilesToRename(ROOT_DIR)
	if (filesToRename.length === 0) {
		console.log("  (변경할 파일 없음)")
	} else {
		for (const file of filesToRename) {
			console.log(`  ${file.from}`)
			console.log(`    → ${file.to}`)
		}
		console.log(`\n  총 ${filesToRename.length}개 파일`)
	}

	// 2. 내용 변경 예정 목록
	console.log("\n📝 내용 변경 예정 목록:")
	console.log("-".repeat(40))
	const filesToReplace = await findFilesToReplace(ROOT_DIR)

	let totalChanges = 0
	const changedFiles: { file: string; count: number }[] = []

	for (const file of filesToReplace) {
		try {
			const content = fs.readFileSync(file, "utf-8")
			const { count } = replaceContent(content)

			if (count > 0) {
				const relativePath = path.relative(ROOT_DIR, file)
				changedFiles.push({ file: relativePath, count })
				totalChanges += count
			}
		} catch {
			// 파일 읽기 실패 무시
		}
	}

	if (changedFiles.length === 0) {
		console.log("  (변경할 내용 없음)")
	} else {
		// 상위 20개만 표시
		const displayFiles = changedFiles.slice(0, 20)
		for (const { file, count } of displayFiles) {
			console.log(`  ${file}: ${count}개 치환`)
		}
		if (changedFiles.length > 20) {
			console.log(`  ... 외 ${changedFiles.length - 20}개 파일`)
		}
		console.log(`\n  총 ${changedFiles.length}개 파일에서 ${totalChanges}개 치환 예정`)
	}

	// 3. 검증 (현재 상태)
	console.log("\n🔍 현재 상태 검증:")
	console.log("-".repeat(40))
	await runValidation(ROOT_DIR)

	console.log("\n" + "=".repeat(60))
	console.log("Dry-run 완료. 실제 적용하려면:")
	console.log("  npx tsx careti-scripts/rebrand/rebrand.ts")
	console.log("=".repeat(60))
}

main().catch(console.error)
