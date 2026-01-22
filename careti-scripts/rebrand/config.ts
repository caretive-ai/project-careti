/**
 * Careti Rebrand Configuration
 * 변환 규칙 정의 파일
 */

export interface ContentReplacement {
  from: string | RegExp
  to: string
}

export interface FileRenamePattern {
  pattern: RegExp
  replace: string
}

export const REBRAND_CONFIG = {
  // 영문 브랜드명
  from: {
    lower: "careti",
    pascal: "Careti",
    upper: "CARET",
  },
  to: {
    lower: "careti",
    pascal: "Careti",
    upper: "CARETI",
  },

  // 한글 브랜드명
  korean: {
    from: "캐러티",
    to: "캐러티",
    // 조사 매핑 (받침 유→무)
    particles: {
      "캐러티가": "캐러티가",
      "캐러티을": "캐러티를",
      "캐러티는": "캐러티는",
      "캐러티와": "캐러티와",  // 유지
      "캐러티에": "캐러티에",  // 유지
    } as Record<string, string>,
  },

  // 제외 패턴
  exclude: [
    "node_modules/**",
    ".git/**",
    "*.lock",
    "work-logs/**",
    "**/*.png",
    "**/*.jpg",
    "**/*.ico",
    "**/*.webp",
    "**/*.gif",
    "**/*.svg",  // SVG는 텍스트지만 보통 제외
    "CHANGELOG-CLINE.md",  // Cline 업스트림 변경로그는 유지
  ],

  // 파일명 변경 대상 패턴
  fileRenamePatterns: [
    // 문서 파일
    { pattern: /^careti-(.+)\.md$/, replace: "careti-$1.md" },
    { pattern: /^careti-(.+)\.mdx$/, replace: "careti-$1.mdx" },
    // PowerShell 스크립트
    { pattern: /^careti-(.+)\.ps1$/, replace: "careti-$1.ps1" },
    // 기타 스크립트
    { pattern: /^caret[-_](.+)$/, replace: "careti-$1" },
    { pattern: /(.+)[-_]caret\.(.+)$/, replace: "$1-careti.$2" },
  ],

  // 내용 치환 규칙 (순서 중요! 긴 패턴 먼저)
  contentReplacements: [
    // 1. 주석 마커 (가장 먼저 - 이미 완료됨)
    // { from: "CARETI MODIFICATION", to: "CARETI MODIFICATION" },
    // { from: "CARET_MODIFICATION", to: "CARETI_MODIFICATION" },

    // 2. 상수명 (대문자)
    { from: /\bCARET_MODE\b/g, to: "CARETI_MODE" },
    { from: /\bCARET_REF\b/g, to: "CARETI_REF" },
    { from: /\bCARET_MODES\b/g, to: "CARETI_MODES" },
    { from: /\bCARET_API\b/g, to: "CARETI_API" },

    // 3. 클래스명/타입명 (파스칼케이스) - 구체적인 것 먼저
    { from: /\bCaretGlobalManager\b/g, to: "CaretiGlobalManager" },
    { from: /\bCaretApiProvider\b/g, to: "CaretiApiProvider" },
    { from: /\bCaretApiHandler\b/g, to: "CaretiApiHandler" },
    { from: /\bCaretApiHandlerOptions\b/g, to: "CaretiApiHandlerOptions" },
    { from: /\bCaretMode\b/g, to: "CaretiMode" },
    { from: /\bCaretModeType\b/g, to: "CaretiModeType" },
    { from: /\bCaretProvider\b/g, to: "CaretiProvider" },
    { from: /\bCaretPromptWrapper\b/g, to: "CaretiPromptWrapper" },
    { from: /\bCaretJsonAdapter\b/g, to: "CaretiJsonAdapter" },
    { from: /\bCaretI18nProvider\b/g, to: "CaretiI18nProvider" },

    // 4. 일반 패턴 (마지막) - 단어 경계 사용
    // 주의: 이미 변환된 "Careti"를 다시 변환하지 않도록 negative lookbehind/lookahead 필요
    // JavaScript에서 지원하므로 사용 가능
    { from: /\bCaret(?!i)\b/g, to: "Careti" },  // Caret 뒤에 i가 없는 경우만
    { from: /\bcaret(?!i)\b/g, to: "careti" },  // caret 뒤에 i가 없는 경우만
  ],

  // 검증 체크리스트
  validation: {
    // 잔여 패턴 검사 (이 패턴이 남아있으면 에러)
    shouldNotExist: [
      { pattern: /\bCaret(?!i)\b/, excludeFiles: ["CHANGELOG-CLINE.md", "work-logs/**"] },
      { pattern: /\bcaret(?!i)\b/, excludeFiles: ["CHANGELOG-CLINE.md", "work-logs/**", "package.json"] },
    ],
    // 필수 패턴 존재 확인
    shouldExist: [
      { pattern: /@careti\//, description: "Import alias" },
      { pattern: /CARETI MODIFICATION/, description: "Modification comments" },
    ],
  },
}

// 현재 남은 변환 대상 (이전 Phase에서 완료된 것 제외)
export const REMAINING_TRANSFORMS = {
  // 파일명 변경
  fileRenames: [
    // 문서 파일 (careti-*.md → careti-*.md)
    "docs/merging/careti-*.md",
    "docs/merging/careti-*.mdx",
    "careti-docs/**/careti-*.md",
    // PowerShell 스크립트
    "scripts/careti-*.ps1",
  ],

  // 내용 변경 (클래스명, 상수명)
  contentChanges: [
    // 클래스명 변경 대상 파일
    "careti-src/**/*.ts",
    "src/**/*.ts",
    "webview-ui/**/*.ts",
    "webview-ui/**/*.tsx",
  ],
}

export default REBRAND_CONFIG
