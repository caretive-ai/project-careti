#!/usr/bin/env npx tsx
/**
 * Rebrand Script - Main Orchestrator
 * 리브랜딩 변환 실행 메인 스크립트
 */

import * as path from "path"
import { renameAllFiles } from "./transforms/file-rename"
import { replaceAllContent } from "./transforms/content-replace"
import { runValidation } from "./transforms/validate"

const ROOT_DIR = path.resolve(__dirname, "../..")

interface Options {
  phase?: "files" | "content" | "validate" | "all"
  dryRun?: boolean
  useGit?: boolean
}

function parseArgs(): Options {
  const args = process.argv.slice(2)
  const options: Options = {
    phase: "all",
    dryRun: false,
    useGit: true,
  }

  for (const arg of args) {
    if (arg.startsWith("--phase=")) {
      options.phase = arg.split("=")[1] as Options["phase"]
    } else if (arg === "--dry-run") {
      options.dryRun = true
    } else if (arg === "--no-git") {
      options.useGit = false
    }
  }

  return options
}

async function runPhaseFiles(dryRun: boolean, useGit: boolean) {
  console.log("\n📁 Phase: 파일명 변경")
  console.log("-".repeat(40))
  const results = await renameAllFiles(ROOT_DIR, dryRun, useGit)
  const success = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  console.log(`\n결과: ${success}개 성공, ${failed}개 실패`)
  return failed === 0
}

async function runPhaseContent(dryRun: boolean) {
  console.log("\n📝 Phase: 내용 치환")
  console.log("-".repeat(40))
  const results = await replaceAllContent(ROOT_DIR, dryRun)
  const success = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  console.log(`\n결과: ${success}개 파일 변경`)
  return failed === 0
}

async function runPhaseValidate() {
  console.log("\n🔍 Phase: 검증")
  console.log("-".repeat(40))
  const result = await runValidation(ROOT_DIR)
  return result.passed
}

async function main() {
  const options = parseArgs()

  console.log("=".repeat(60))
  console.log("🚀 Careti 리브랜딩 실행")
  console.log("=".repeat(60))
  console.log(`\n프로젝트 루트: ${ROOT_DIR}`)
  console.log(`실행 모드: ${options.dryRun ? "DRY-RUN (미리보기)" : "실제 적용"}`)
  console.log(`Phase: ${options.phase}`)
  console.log(`Git 사용: ${options.useGit ? "예" : "아니오"}\n`)

  if (!options.dryRun) {
    console.log("⚠️  주의: 실제 파일이 변경됩니다!")
    console.log("    3초 후 시작합니다... (Ctrl+C로 취소)\n")
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  let success = true

  try {
    if (options.phase === "files" || options.phase === "all") {
      success = await runPhaseFiles(options.dryRun || false, options.useGit || true) && success
    }

    if (options.phase === "content" || options.phase === "all") {
      success = await runPhaseContent(options.dryRun || false) && success
    }

    if (options.phase === "validate" || options.phase === "all") {
      success = await runPhaseValidate() && success
    }

    console.log("\n" + "=".repeat(60))
    if (success) {
      console.log("✅ 리브랜딩 완료!")
    } else {
      console.log("⚠️  일부 작업이 실패했습니다. 로그를 확인하세요.")
    }
    console.log("=".repeat(60))

    if (!options.dryRun) {
      console.log("\n다음 단계:")
      console.log("  1. npm run check-types")
      console.log("  2. npm run compile")
      console.log("  3. npm run test:unit")
    }

  } catch (error) {
    console.error("\n❌ 오류 발생:", error)
    process.exit(1)
  }
}

main().catch(console.error)
