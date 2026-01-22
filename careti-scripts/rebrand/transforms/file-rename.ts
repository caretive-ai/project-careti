/**
 * File Rename Transform
 * 파일/디렉토리 이름 변경 모듈
 */

import * as fs from "fs"
import { glob } from "glob"
import * as path from "path"
import { REBRAND_CONFIG } from "../config"

export interface RenameResult {
	from: string
	to: string
	success: boolean
	error?: string
}

/**
 * 파일명이 변경 대상인지 확인
 */
export function shouldRenameFile(filename: string): { shouldRename: boolean; newName?: string } {
	const basename = path.basename(filename)

	for (const rule of REBRAND_CONFIG.fileRenamePatterns) {
		if (rule.pattern.test(basename)) {
			const newName = basename.replace(rule.pattern, rule.replace)
			return { shouldRename: true, newName }
		}
	}

	return { shouldRename: false }
}

/**
 * 제외 패턴에 해당하는지 확인
 */
export function isExcluded(filePath: string): boolean {
	const relativePath = filePath.replace(/\\/g, "/")

	for (const pattern of REBRAND_CONFIG.exclude) {
		// 간단한 glob 패턴 매칭 (** 지원)
		const regexPattern = pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\./g, "\\.")

		if (new RegExp(regexPattern).test(relativePath)) {
			return true
		}
	}

	return false
}

/**
 * 변경 대상 파일 목록 조회 (dry-run용)
 */
export async function findFilesToRename(rootDir: string): Promise<RenameResult[]> {
	const results: RenameResult[] = []

	// careti-* 패턴 파일 찾기
	const patterns = ["**/careti-*.md", "**/careti-*.mdx", "**/careti-*.ps1", "**/caret_*.ts", "**/caret_*.tsx"]

	for (const pattern of patterns) {
		const files = await glob(pattern, {
			cwd: rootDir,
			ignore: REBRAND_CONFIG.exclude,
			nodir: true,
		})

		for (const file of files) {
			const fullPath = path.join(rootDir, file)
			const { shouldRename, newName } = shouldRenameFile(file)

			if (shouldRename && newName) {
				const dir = path.dirname(file)
				const newPath = path.join(dir, newName)

				results.push({
					from: file,
					to: newPath,
					success: false, // dry-run이므로 아직 실행 안 됨
				})
			}
		}
	}

	return results
}

/**
 * 파일 이름 변경 실행
 */
export async function renameFile(
	rootDir: string,
	fromPath: string,
	toPath: string,
	useGit: boolean = true,
): Promise<RenameResult> {
	const fullFrom = path.join(rootDir, fromPath)
	const fullTo = path.join(rootDir, toPath)

	try {
		// 대상 파일 존재 확인
		if (!fs.existsSync(fullFrom)) {
			return {
				from: fromPath,
				to: toPath,
				success: false,
				error: `Source file not found: ${fromPath}`,
			}
		}

		// 목적지 디렉토리 생성
		const toDir = path.dirname(fullTo)
		if (!fs.existsSync(toDir)) {
			fs.mkdirSync(toDir, { recursive: true })
		}

		if (useGit) {
			// git mv 사용 (히스토리 보존)
			const { execSync } = await import("child_process")
			execSync(`git mv "${fullFrom}" "${fullTo}"`, {
				cwd: rootDir,
				stdio: "pipe",
			})
		} else {
			// 일반 파일 이동
			fs.renameSync(fullFrom, fullTo)
		}

		return {
			from: fromPath,
			to: toPath,
			success: true,
		}
	} catch (error) {
		return {
			from: fromPath,
			to: toPath,
			success: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}

/**
 * 모든 대상 파일 이름 변경 실행
 */
export async function renameAllFiles(rootDir: string, dryRun: boolean = false, useGit: boolean = true): Promise<RenameResult[]> {
	const filesToRename = await findFilesToRename(rootDir)

	if (dryRun) {
		console.log("\n[DRY-RUN] 파일명 변경 예정 목록:")
		for (const file of filesToRename) {
			console.log(`  ${file.from} → ${file.to}`)
		}
		console.log(`\n총 ${filesToRename.length}개 파일`)
		return filesToRename
	}

	const results: RenameResult[] = []

	for (const file of filesToRename) {
		const result = await renameFile(rootDir, file.from, file.to, useGit)
		results.push(result)

		if (result.success) {
			console.log(`✅ ${file.from} → ${file.to}`)
		} else {
			console.log(`❌ ${file.from}: ${result.error}`)
		}
	}

	return results
}

export default {
	shouldRenameFile,
	isExcluded,
	findFilesToRename,
	renameFile,
	renameAllFiles,
}
