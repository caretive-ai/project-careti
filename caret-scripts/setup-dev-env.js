#!/usr/bin/env node

/**
 * Caret 개발 환경 설정 스크립트 (크로스 플랫폼)
 * 이 스크립트는 운영체제를 자동 감지하여 적절한 설정 스크립트를 실행합니다.
 */

const { execSync, spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

// 색상 정의
const colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	reset: "\x1b[0m",
}

// 로그 함수
function log(message, color = "blue") {
	console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
	log(`✅ ${message}`, "green")
}

function logWarning(message) {
	log(`⚠️  ${message}`, "yellow")
}

function logError(message) {
	log(`❌ ${message}`, "red")
}

function logInfo(message) {
	log(`ℹ️  ${message}`, "blue")
}

// 운영체제 감지
function getOS() {
	const platform = process.platform
	if (platform === "win32") return "windows"
	if (platform === "darwin") return "macos"
	if (platform === "linux") return "linux"
	return "unknown"
}

// Node.js 버전 확인
function checkNodeVersion() {
	try {
		const version = execSync("node --version", { encoding: "utf8" }).trim()
		logInfo(`Node.js 버전 확인됨: ${version}`)

		const majorVersion = parseInt(version.slice(1).split(".")[0])
		if (majorVersion < 20) {
			logWarning(`Node.js 버전이 너무 낮습니다: ${version} (20.x 필요)`)
			return false
		}
		return true
	} catch (error) {
		logError("Node.js가 설치되어 있지 않습니다.")
		return false
	}
}

// 스크립트 실행
function runScript(scriptPath) {
	const os = getOS()
	logInfo(`운영체제 감지됨: ${os}`)

	if (os === "windows") {
		// Windows에서는 배치 파일 실행
		const batchPath = path.join(__dirname, "setup-dev-env.bat")
		if (fs.existsSync(batchPath)) {
			logInfo("Windows 배치 파일을 실행합니다...")
			try {
				execSync(`"${batchPath}"`, { stdio: "inherit" })
				logSuccess("Windows 설정이 완료되었습니다!")
			} catch (error) {
				logError("Windows 설정 중 오류가 발생했습니다.")
				process.exit(1)
			}
		} else {
			logError("Windows 배치 파일을 찾을 수 없습니다.")
			process.exit(1)
		}
	} else {
		// Linux/macOS에서는 쉘 스크립트 실행
		const shellPath = path.join(__dirname, "setup-dev-env.sh")
		if (fs.existsSync(shellPath)) {
			logInfo("Linux/macOS 쉘 스크립트를 실행합니다...")
			try {
				// 실행 권한 부여
				execSync(`chmod +x "${shellPath}"`)
				execSync(`"${shellPath}"`, { stdio: "inherit" })
				logSuccess("Linux/macOS 설정이 완료되었습니다!")
			} catch (error) {
				logError("Linux/macOS 설정 중 오류가 발생했습니다.")
				process.exit(1)
			}
		} else {
			logError("Linux/macOS 쉘 스크립트를 찾을 수 없습니다.")
			process.exit(1)
		}
	}
}

// 메인 함수
function main() {
	console.log("🚀 Caret 개발 환경 설정을 시작합니다...\n")

	// Node.js 버전 확인
	if (!checkNodeVersion()) {
		logWarning("Node.js 20.x 설치가 필요합니다.")
		logInfo("자동 설정 스크립트가 Node.js 설치를 도와드릴게요.")
	}

	// 스크립트 실행
	runScript()
}

// 스크립트 실행
if (require.main === module) {
	main()
}

module.exports = { main, checkNodeVersion, getOS }
