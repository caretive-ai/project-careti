#!/usr/bin/env node

/**
 * template_characters.json 복사 스크립트
 * 빌드 시 assets/template_characters/template_characters.json을
 * webview-ui/src/caret/assets/persona/로 복사합니다.
 */

const fs = require("fs")
const path = require("path")

const projectRoot = path.resolve(__dirname, "..", "..")
const sourceFile = path.join(projectRoot, "assets", "template_characters", "template_characters.json")
const targetDir = path.join(__dirname, "..", "src", "caret", "assets", "persona")
const targetFile = path.join(targetDir, "template_characters.json")

try {
	// 소스 파일 존재 확인
	if (!fs.existsSync(sourceFile)) {
		console.warn(`⚠️  template_characters.json 소스 파일이 없습니다: ${sourceFile}`)
		process.exit(0)
	}

	// 대상 디렉토리 생성
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true })
		console.log(`📁 생성된 디렉토리: ${targetDir}`)
	}

	// 파일 복사
	fs.copyFileSync(sourceFile, targetFile)
	console.log(`✅ template_characters.json 복사 완료`)
	console.log(`   ${path.relative(projectRoot, sourceFile)} → ${path.relative(projectRoot, targetFile)}`)
} catch (error) {
	console.error(`❌ template_characters.json 복사 실패:`, error.message)
	process.exit(1)
}
