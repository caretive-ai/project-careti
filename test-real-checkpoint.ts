/**
 * 진짜 실제 CheckpointGitOperations 직접 호출 테스트
 * TypeScript + ts-node로 alias 해결하여 실제 메서드 테스트
 */

import { GitOperations } from "@integrations/checkpoints/CheckpointGitOperations"
import CheckpointTracker from "@integrations/checkpoints/CheckpointTracker"
import * as path from "path"
import * as fs from "fs/promises"
import * as crypto from "crypto"

// 테스트 설정
const TEST_CWD = "d:/dev/caret"
const GLOBAL_STORAGE_PATH = "C:/Users/luke/AppData/Roaming/Cursor/User/globalStorage/caretive.caret"
const TEST_TASK_ID = "real-test-" + Date.now()

/**
 * 시간 측정 헬퍼
 */
class Timer {
	private start: number

	constructor(private name: string) {
		this.start = performance.now()
		console.log(`⏱️ [${this.name}] 시작`)
	}

	end(): number {
		const duration = Math.round(performance.now() - this.start)
		console.log(`⏱️ [${this.name}] 완료: ${duration}ms`)
		return duration
	}
}

/**
 * CWD 해시 계산 (CheckpointUtils와 동일)
 */
function hashWorkingDir(workingDir: string): string {
	return crypto.createHash("sha256").update(workingDir).digest("hex").substring(0, 10)
}

/**
 * 진짜 실제 CheckpointGitOperations.renameNestedGitRepos() 테스트
 */
async function testRealNestedGitScan(): Promise<{ success: boolean; duration: number; error?: string }> {
	console.log("📁 === 진짜 실제 중첩 Git 스캔 테스트 ===")
	const timer = new Timer("실제 renameNestedGitRepos")

	try {
		console.log(`📂 스캔 경로: ${TEST_CWD}`)

		// 실제 CheckpointGitOperations 인스턴스 생성
		const gitOps = new CheckpointGitOperations()

		// 실제 renameNestedGitRepos 호출
		await gitOps.renameNestedGitRepos(TEST_CWD)

		const duration = timer.end()
		console.log(`✅ 실제 중첩 Git 스캔 성공`)

		return { success: true, duration }
	} catch (error) {
		const duration = timer.end()
		console.error(`❌ 실제 중첩 Git 스캔 실패: ${error}`)
		return { success: false, error: String(error), duration }
	}
}

/**
 * 진짜 실제 CheckpointGitOperations.addCheckpointFiles() 테스트
 */
async function testRealCheckpointGitAdd(): Promise<{ success: boolean; duration: number; error?: string }> {
	console.log("💾 === 진짜 실제 CheckpointGitOperations.addCheckpointFiles() 테스트 ===")
	const timer = new Timer("실제 addCheckpointFiles")

	try {
		console.log(`📂 Git 작업 디렉토리: ${TEST_CWD}`)
		console.log(`🔧 실제 CheckpointGitOperations.addCheckpointFiles() 직접 호출`)

		// 실제 CheckpointGitOperations 인스턴스 생성
		const gitOps = new CheckpointGitOperations()

		// 체크포인트 디렉토리 계산
		const cwdHash = hashWorkingDir(TEST_CWD)
		const checkpointsDir = path.join(GLOBAL_STORAGE_PATH, "checkpoints", cwdHash)
		const gitPath = path.join(checkpointsDir, ".git")

		console.log(`📁 Shadow Git 경로: ${gitPath}`)

		// 실제 addCheckpointFiles 호출 - 진짜 최적화된 로직!
		const result = await gitOps.addCheckpointFiles(gitPath)

		const duration = timer.end()

		if (result.success) {
			console.log(`✅ 실제 CheckpointGitOperations.addCheckpointFiles() 성공!`)
			return { success: true, duration }
		} else {
			console.error(`❌ 실제 CheckpointGitOperations.addCheckpointFiles() 실패`)
			return { success: false, error: "addCheckpointFiles returned failure", duration }
		}
	} catch (error) {
		const duration = timer.end()
		console.error(`❌ 실제 CheckpointGitOperations.addCheckpointFiles() 예외: ${error}`)

		return { success: false, error: String(error), duration }
	}
}

/**
 * index.lock 정리
 */
async function cleanupIndexLock(): Promise<void> {
	try {
		const cwdHash = hashWorkingDir(TEST_CWD)
		const checkpointsDir = path.join(GLOBAL_STORAGE_PATH, "checkpoints", cwdHash)
		const indexLockPath = path.join(checkpointsDir, "index.lock")

		console.log(`🧹 index.lock 정리: ${indexLockPath}`)

		try {
			await fs.unlink(indexLockPath)
			console.log("✅ index.lock 삭제 완료")
		} catch (err) {
			console.log("✅ index.lock 파일 없음")
		}
	} catch (error) {
		console.warn("⚠️ index.lock 정리 실패:", error)
	}
}

/**
 * 전체 실제 성능 테스트 실행
 */
async function runRealPerformanceTest(): Promise<void> {
	console.log("🎯 ========== 진짜 실제 체크포인트 성능 테스트 ==========")
	console.log(`📍 테스트 경로: ${TEST_CWD}`)
	console.log(`📦 Task ID: ${TEST_TASK_ID}`)
	console.log("🔥 CheckpointGitOperations 실제 메서드 직접 호출!")
	console.log("")

	const results = {
		nestedGitScan: null as any,
		gitAdd: null as any,
		total: 0,
	}

	const totalTimer = new Timer("전체 실제 테스트")

	try {
		// 작업 디렉토리 변경
		process.chdir(TEST_CWD)
		console.log(`📂 작업 디렉토리 변경: ${process.cwd()}`)
		console.log("")

		// 1. 실제 중첩 Git 스캔 테스트
		results.nestedGitScan = await testRealNestedGitScan()
		console.log("")

		// 2. 실제 Git add 테스트
		results.gitAdd = await testRealCheckpointGitAdd()
		console.log("")
	} catch (error) {
		console.error("💥 실제 테스트 중 예외:", error)
	} finally {
		// 정리 작업
		await cleanupIndexLock()

		results.total = totalTimer.end()

		// 결과 요약
		console.log("")
		console.log("📊 ========== 진짜 실제 성능 테스트 결과 ==========")
		console.log(
			`실제 중첩 Git 스캔: ${results.nestedGitScan?.success ? "✅" : "❌"} ${results.nestedGitScan?.duration || 0}ms`,
		)
		console.log(`실제 Git Add 작업: ${results.gitAdd?.success ? "✅" : "❌"} ${results.gitAdd?.duration || 0}ms`)
		console.log(`전체 소요시간: ${results.total}ms`)
		console.log("")

		// 성능 분석
		if (results.gitAdd?.success && results.gitAdd.duration < 3000) {
			console.log("🎉 최적화 성공! Git add가 3초 이내에 완료되었습니다!")
		} else if (results.gitAdd?.duration > 5000) {
			console.log("⚠️ Git add가 여전히 5초 이상 소요 - 추가 최적화 필요")
		}

		if (!results.gitAdd?.success) {
			console.log("❌ Git add 실패 - 이것이 체크포인트 실패의 주원인")
		}

		console.log("🏁 진짜 실제 테스트 완료!")
	}
}

// 메인 실행
runRealPerformanceTest().catch(console.error)
