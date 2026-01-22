/**
 * Content Replace Transform
 * 파일 내용 치환 모듈
 */

import * as fs from "fs"
import * as path from "path"
import { glob } from "glob"
import { REBRAND_CONFIG } from "../config"

export interface ReplaceResult {
  file: string
  replacements: number
  success: boolean
  error?: string
}

/**
 * 파일 내용에서 패턴 치환
 */
export function replaceContent(content: string): { newContent: string; count: number } {
  let newContent = content
  let totalCount = 0

  for (const rule of REBRAND_CONFIG.contentReplacements) {
    if (typeof rule.from === "string") {
      // 문자열 치환
      const regex = new RegExp(rule.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
      const matches = newContent.match(regex)
      if (matches) {
        totalCount += matches.length
        newContent = newContent.replace(regex, rule.to)
      }
    } else {
      // RegExp 치환
      const matches = newContent.match(rule.from)
      if (matches) {
        totalCount += matches.length
        newContent = newContent.replace(rule.from, rule.to)
      }
    }
  }

  return { newContent, count: totalCount }
}

/**
 * 단일 파일 내용 치환
 */
export async function replaceInFile(
  filePath: string,
  dryRun: boolean = false
): Promise<ReplaceResult> {
  try {
    const content = fs.readFileSync(filePath, "utf-8")
    const { newContent, count } = replaceContent(content)

    if (count === 0) {
      return {
        file: filePath,
        replacements: 0,
        success: true,
      }
    }

    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, "utf-8")
    }

    return {
      file: filePath,
      replacements: count,
      success: true,
    }
  } catch (error) {
    return {
      file: filePath,
      replacements: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 변경 대상 파일 목록 조회
 */
export async function findFilesToReplace(rootDir: string): Promise<string[]> {
  const patterns = [
    "careti-src/**/*.ts",
    "src/**/*.ts",
    "webview-ui/**/*.ts",
    "webview-ui/**/*.tsx",
    "**/*.md",
    "**/*.mdx",
  ]

  const allFiles: string[] = []

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: rootDir,
      ignore: REBRAND_CONFIG.exclude,
      nodir: true,
    })
    allFiles.push(...files.map((f) => path.join(rootDir, f)))
  }

  // 중복 제거
  return [...new Set(allFiles)]
}

/**
 * 모든 대상 파일 내용 치환
 */
export async function replaceAllContent(
  rootDir: string,
  dryRun: boolean = false
): Promise<ReplaceResult[]> {
  const files = await findFilesToReplace(rootDir)
  const results: ReplaceResult[] = []

  console.log(`\n[${dryRun ? "DRY-RUN" : "REPLACE"}] 내용 치환 대상: ${files.length}개 파일`)

  for (const file of files) {
    const result = await replaceInFile(file, dryRun)

    if (result.replacements > 0) {
      results.push(result)
      const relativePath = path.relative(rootDir, file)
      console.log(`  ${result.success ? "✅" : "❌"} ${relativePath}: ${result.replacements}개 치환`)
    }
  }

  const totalReplacements = results.reduce((sum, r) => sum + r.replacements, 0)
  console.log(`\n총 ${results.length}개 파일에서 ${totalReplacements}개 치환`)

  return results
}

/**
 * 특정 패턴이 남아있는 파일 찾기 (검증용)
 */
export async function findRemainingPatterns(
  rootDir: string,
  pattern: RegExp
): Promise<{ file: string; matches: string[] }[]> {
  const files = await findFilesToReplace(rootDir)
  const results: { file: string; matches: string[] }[] = []

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8")
      const matches = content.match(pattern)

      if (matches && matches.length > 0) {
        results.push({
          file: path.relative(rootDir, file),
          matches: [...new Set(matches)], // 중복 제거
        })
      }
    } catch {
      // 읽기 실패한 파일은 무시
    }
  }

  return results
}

export default {
  replaceContent,
  replaceInFile,
  findFilesToReplace,
  replaceAllContent,
  findRemainingPatterns,
}
