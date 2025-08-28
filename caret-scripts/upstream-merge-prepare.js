#!/usr/bin/env node

/**
 * 🚧 [검증 필요] Caret Upstream Merge 준비 스크립트
 *
 * ⚠️ 주의: 이 스크립트는 아직 검증되지 않은 계획 단계입니다.
 * 실제 사용 전 충분한 테스트가 필요합니다.
 *
 * 기능:
 * 1. 현재 .cline 백업들을 .caret으로 확장 백업
 * 2. Git 상태 확인 및 정리
 * 3. 업스트림 remote 설정 확인
 * 4. 머징 전 상태 스냅샷 생성
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// 색상 출력을 위한 유틸리티
const colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	reset: "\x1b[0m",
	bold: "\x1b[1m",
}

function log(message, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`)
}

function execCommand(command, description) {
	try {
		log(`📋 ${description}...`, colors.blue)
		const result = execSync(command, { encoding: "utf8", stdio: "pipe" })
		log(`✅ ${description} 완료`, colors.green)
		return result
	} catch (error) {
		log(`❌ ${description} 실패: ${error.message}`, colors.red)
		throw error
	}
}

function main() {
	log("🚧 [검증 필요] Caret Upstream Merge 준비 시작", colors.bold + colors.cyan)
	log("⚠️  이 스크립트는 아직 검증되지 않았습니다!", colors.yellow)

	try {
		// 1. Git 상태 확인
		log("\n📊 Git 상태 확인", colors.magenta)
		const gitStatus = execCommand("git status --porcelain", "Git 작업 디렉토리 상태 확인")

		if (gitStatus.trim()) {
			log("⚠️  작업 디렉토리에 미커밋 변경사항이 있습니다:", colors.yellow)
			console.log(gitStatus)
			log("📋 변경사항을 커밋하거나 stash 하세요.", colors.yellow)
			return
		}

		// 2. 현재 브랜치 확인
		const currentBranch = execCommand("git branch --show-current", "현재 브랜치 확인").trim()
		log(`📍 현재 브랜치: ${currentBranch}`, colors.blue)

		if (currentBranch !== "main") {
			log("⚠️  main 브랜치가 아닙니다. main으로 이동하세요.", colors.yellow)
			return
		}

		// 3. upstream remote 확인
		log("\n🔗 Upstream Remote 설정 확인", colors.magenta)
		try {
			const remotes = execCommand("git remote -v", "Remote 설정 확인")
			if (!remotes.includes("upstream")) {
				log("📋 upstream remote가 설정되지 않았습니다. 설정 중...", colors.yellow)
				execCommand("git remote add upstream https://github.com/cline/cline.git", "upstream remote 추가")
			}
		} catch (error) {
			log("⚠️  Remote 설정을 확인할 수 없습니다.", colors.yellow)
		}

		// 4. .cline 파일들을 .caret으로 백업
		log("\n💾 백업 파일 확장 (.cline → .caret)", colors.magenta)
		const clineFiles = []

		function findClineFiles(dir) {
			const files = fs.readdirSync(dir, { withFileTypes: true })
			for (const file of files) {
				const fullPath = path.join(dir, file.name)
				if (file.isDirectory() && !file.name.startsWith(".") && file.name !== "node_modules") {
					findClineFiles(fullPath)
				} else if (file.name.endsWith(".cline")) {
					clineFiles.push(fullPath)
				}
			}
		}

		findClineFiles(".")

		log(`📂 발견된 .cline 백업 파일: ${clineFiles.length}개`, colors.blue)

		for (const clineFile of clineFiles) {
			const caretFile = clineFile.replace(".cline", ".caret")
			try {
				fs.copyFileSync(clineFile, caretFile)
				log(`  ✅ ${path.relative(".", clineFile)} → ${path.relative(".", caretFile)}`, colors.green)
			} catch (error) {
				log(`  ❌ ${path.relative(".", clineFile)} 백업 실패: ${error.message}`, colors.red)
			}
		}

		// 5. 머징 전 상태 기록
		log("\n📸 현재 상태 스냅샷 생성", colors.magenta)
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
		const snapshotFile = `caret-scripts/merge-snapshots/pre-merge-${timestamp}.json`

		// snapshots 디렉토리 생성
		const snapshotsDir = "caret-scripts/merge-snapshots"
		if (!fs.existsSync(snapshotsDir)) {
			fs.mkdirSync(snapshotsDir, { recursive: true })
		}

		const snapshot = {
			timestamp,
			branch: currentBranch,
			commit: execCommand("git rev-parse HEAD", "현재 커밋 해시 확인").trim(),
			backupFiles: clineFiles.map((f) => ({
				cline: f,
				caret: f.replace(".cline", ".caret"),
			})),
			packageJson: JSON.parse(fs.readFileSync("package.json", "utf8")).version,
		}

		fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2))
		log(`📄 스냅샷 저장: ${snapshotFile}`, colors.green)

		// 6. 완료 메시지
		log("\n🎉 머징 준비 완료!", colors.bold + colors.green)
		log("\n📋 다음 단계:", colors.blue)
		log("  1. npm run merge:execute - 실제 머징 수행", colors.cyan)
		log("  2. npm run merge:verify - 머징 후 검증", colors.cyan)
		log("\n⚠️  주의: 아직 검증되지 않은 프로세스입니다!", colors.yellow)
	} catch (error) {
		log(`\n❌ 준비 과정 중 오류 발생: ${error.message}`, colors.red)
		log("🔄 안전을 위해 작업을 중단합니다.", colors.yellow)
		process.exit(1)
	}
}

if (require.main === module) {
	main()
}

module.exports = { main }
