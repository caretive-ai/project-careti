/**
 * Validation Transform
 * 변환 검증 모듈
 */

import * as fs from "fs"
import * as path from "path"
import { glob } from "glob"
import { REBRAND_CONFIG } from "../config"

export interface ValidationResult {
  passed: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: "remaining_pattern" | "missing_pattern" | "file_error"
  file?: string
  pattern?: string
  matches?: string[]
  message: string
}

export interface ValidationWarning {
  type: "potential_issue"
  file: string
  message: string
}

/**
 * 잔여 패턴 검사 - 변환되지 않은 Caret 패턴이 남아있는지 확인
 */
export async function checkRemainingPatterns(rootDir: string): Promise<ValidationError[]> {
  const errors: ValidationError[] = []
  const patterns = ["**/*.ts", "**/*.tsx", "**/*.md", "**/*.mdx"]

  for (const globPattern of patterns) {
    const files = await glob(globPattern, {
      cwd: rootDir,
      ignore: REBRAND_CONFIG.exclude,
      nodir: true,
    })

    for (const file of files) {
      const fullPath = path.join(rootDir, file)
      
      try {
        const content = fs.readFileSync(fullPath, "utf-8")

        for (const rule of REBRAND_CONFIG.validation.shouldNotExist) {
          // 제외 파일 확인
          const shouldExclude = rule.excludeFiles.some((excludePattern) => {
            if (excludePattern.includes("**")) {
              const regex = new RegExp(excludePattern.replace(/\*\*/g, ".*"))
              return regex.test(file)
            }
            return file.includes(excludePattern)
          })

          if (shouldExclude) continue

          const matches = content.match(new RegExp(rule.pattern, "g"))
          if (matches && matches.length > 0) {
            errors.push({
              type: "remaining_pattern",
              file,
              pattern: rule.pattern.toString(),
              matches: [...new Set(matches)].slice(0, 5), // 최대 5개
              message: `"${file}"에 변환되지 않은 패턴 발견: ${[...new Set(matches)].slice(0, 3).join(", ")}`,
            })
          }
        }
      } catch {
        // 파일 읽기 실패 무시
      }
    }
  }

  return errors
}

/**
 * 필수 패턴 존재 확인
 */
export async function checkRequiredPatterns(rootDir: string): Promise<ValidationError[]> {
  const errors: ValidationError[] = []
  const patterns = ["**/*.ts", "**/*.tsx"]

  for (const rule of REBRAND_CONFIG.validation.shouldExist) {
    let found = false

    for (const globPattern of patterns) {
      const files = await glob(globPattern, {
        cwd: rootDir,
        ignore: REBRAND_CONFIG.exclude,
        nodir: true,
      })

      for (const file of files) {
        const fullPath = path.join(rootDir, file)
        
        try {
          const content = fs.readFileSync(fullPath, "utf-8")
          if (rule.pattern.test(content)) {
            found = true
            break
          }
        } catch {
          // 파일 읽기 실패 무시
        }
      }

      if (found) break
    }

    if (!found) {
      errors.push({
        type: "missing_pattern",
        pattern: rule.pattern.toString(),
        message: `필수 패턴을 찾을 수 없음: ${rule.description} (${rule.pattern})`,
      })
    }
  }

  return errors
}

/**
 * 전체 검증 실행
 */
export async function runValidation(rootDir: string): Promise<ValidationResult> {
  console.log("\n[VALIDATION] 리브랜딩 검증 시작...")

  const remainingErrors = await checkRemainingPatterns(rootDir)
  const requiredErrors = await checkRequiredPatterns(rootDir)

  const allErrors = [...remainingErrors, ...requiredErrors]

  if (allErrors.length === 0) {
    console.log("✅ 모든 검증 통과!")
  } else {
    console.log(`\n❌ ${allErrors.length}개 에러 발견:`)
    for (const error of allErrors) {
      console.log(`  - ${error.message}`)
    }
  }

  return {
    passed: allErrors.length === 0,
    errors: allErrors,
    warnings: [],
  }
}

export default {
  checkRemainingPatterns,
  checkRequiredPatterns,
  runValidation,
}
