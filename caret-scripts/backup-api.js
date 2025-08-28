#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("💾 Caret API 백업 스크립트 시작...\n")

// OS 무관 경로 설정 함수
function getProjectRoot() {
	let currentDir = __dirname
	while (currentDir !== path.dirname(currentDir)) {
		if (fs.existsSync(path.join(currentDir, "package.json"))) {
			return currentDir
		}
		currentDir = path.dirname(currentDir)
	}
	throw new Error("프로젝트 루트를 찾을 수 없습니다. package.json이 있는 디렉토리를 찾지 못했습니다.")
}

// 현재 시간을 파일명에 사용할 수 있는 형식으로 변환
function getTimestamp() {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, "0")
	const day = String(now.getDate()).padStart(2, "0")
	const hours = String(now.getHours()).padStart(2, "0")
	const minutes = String(now.getMinutes()).padStart(2, "0")
	const seconds = String(now.getSeconds()).padStart(2, "0")

	return `${year}${month}${day}-${hours}${minutes}${seconds}`
}

// OS 무관 파일 경로들
const projectRoot = getProjectRoot()
const caretApiPath = path.join(projectRoot, "src", "shared", "api.ts")
const backupDir = path.join(projectRoot, "backups")
const timestamp = getTimestamp()
const backupPath = path.join(backupDir, `api-backup-${timestamp}.ts`)

console.log(`📁 프로젝트 루트: ${projectRoot}`)
console.log(`📄 원본 파일: ${caretApiPath}`)
console.log(`💾 백업 파일: ${backupPath}`)

try {
	// 백업 디렉토리 생성 (없으면)
	if (!fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true })
		console.log(`📁 백업 디렉토리 생성: ${backupDir}`)
	}

	// 원본 파일 존재 확인
	if (!fs.existsSync(caretApiPath)) {
		throw new Error(`원본 API 파일을 찾을 수 없습니다: ${caretApiPath}`)
	}

	// 파일 백업 실행
	const originalContent = fs.readFileSync(caretApiPath, "utf8")

	// 백업 파일에 메타데이터 주석 추가
	const backupContent = `// 🔄 Caret API 백업 파일
// 📅 백업 시간: ${new Date().toISOString()}
// 📄 원본 파일: ${caretApiPath}
// 🎯 백업 목적: 026-2 모델 머징 작업 전 안전 백업
// 
// ⚠️  주의: 이 파일은 백업용입니다. 직접 수정하지 마세요.
//
${originalContent}`

	fs.writeFileSync(backupPath, backupContent, "utf8")

	// 백업 완료 정보
	const stats = fs.statSync(caretApiPath)
	const fileSizeKB = Math.round((stats.size / 1024) * 100) / 100

	console.log(`\n✅ 백업 완료!`)
	console.log(`📊 파일 크기: ${fileSizeKB} KB`)
	console.log(`🕐 백업 시간: ${new Date().toLocaleString()}`)
	console.log(`💾 백업 위치: ${backupPath}`)

	// 기존 백업 파일들 확인
	const backupFiles = fs
		.readdirSync(backupDir)
		.filter((file) => file.startsWith("api-backup-") && file.endsWith(".ts"))
		.sort()

	if (backupFiles.length > 1) {
		console.log(`\n📋 기존 백업 파일들 (${backupFiles.length}개):`)
		backupFiles.forEach((file, index) => {
			const isLatest = index === backupFiles.length - 1
			console.log(`   ${isLatest ? "🆕" : "📄"} ${file}`)
		})

		// 백업 파일이 너무 많으면 경고
		if (backupFiles.length > 10) {
			console.log(`\n⚠️  백업 파일이 ${backupFiles.length}개입니다. 오래된 백업 파일 정리를 고려해보세요.`)
		}
	}
} catch (error) {
	console.error("❌ 백업 실행 중 오류:", error.message)
	process.exit(1)
}
