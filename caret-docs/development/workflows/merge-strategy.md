Caret 프로젝트 병합 전략을 도와드립니다. Cline 코드 수정을 다룰 때 병합 전략 가이드 원칙을 따르세요.

<detailed_sequence_of_steps>
# Caret-Cline 병합 전략 워크플로우

## 1. 수정 범위 분석
1. 필요한 변경사항의 성격 파악:
   ```bash
   # 어떤 파일이 수정되고 있는지 확인
   git status
   git diff --name-only
   ```

2. 수정 수준 분류:
   - **레벨 1**: 독립 모듈 (caret-src/, caret-docs/) - 완전 자유도
   - **레벨 2**: 조건부 통합 - 최소한의 Cline 코드 변경
   - **레벨 3**: 직접 수정 - 백업과 함께 최후의 수단

## 2. 병합 전략 적용
1. **레벨 1 우선 (독립 모듈)**:
   - `caret-src/` 디렉토리에 새로운 기능 생성
   - 상속/구성을 사용하여 Cline 기능 확장
   - 예시: `CaretProvider extends WebviewProvider`

2. **레벨 2 필요 시 (조건부 통합)**:
   - 원본 파일 백업: `cp original.ts original.ts.cline`
   - `// CARET MODIFICATION:` 주석 추가
   - 최소 1-3줄 변경
   - 조건부 로직 사용: `if (isCaretMode()) { ... }`

3. **레벨 3 (직접 수정) - 최후의 수단**:
   - 상속/구성이 불가능한 경우에만 사용
   - 반드시 원본 파일 백업
   - CARET MODIFICATION 주석에 이유 문서화
   - Cline과 Caret 기능 모두 테스트

## 3. 프론트엔드 링크 교체
Cline 병합 후 docs.cline.bot 링크를 docs.caret.team으로 교체:

1. **webview-ui 폴더에서 링크 검색**:
   ```bash
   # docs.cline.bot 링크 찾기
   grep -r "docs\.cline\.bot" webview-ui/src --include="*.tsx" --include="*.ts" -n
   ```

2. **CARET_LOCALIZED_URLS에 추가**:
   - `webview-ui/src/caret/constants/urls.ts` 파일에 새로운 URL 추가
   - 4개 언어(ko, en, ja, zh) 모두 지원
   ```typescript
   export const CARET_LOCALIZED_URLS = {
     // 기존 URL들...
     NEW_FEATURE_DOCS: {
       ko: "https://docs.caret.team/ko/path/to/feature",
       en: "https://docs.caret.team/en/path/to/feature",
       ja: "https://docs.caret.team/ja/path/to/feature",
       zh: "https://docs.caret.team/zh/path/to/feature",
     },
   }
   ```

3. **컴포넌트에서 사용**:
   ```tsx
   import { getLocalizedUrl } from "@/caret/constants/urls"
   import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"

   const { language } = useCaretI18nContext()

   <a href={getLocalizedUrl("NEW_FEATURE_DOCS", language)}>
     {t("learnMore", "settings")}
   </a>
   ```

4. **주요 교체 대상**:
   - FeatureSettingsSection.tsx (자동 압축, YOLO 모드)
   - TerminalSettingsSection.tsx (터미널 문제 해결)
   - InfoBanner.tsx (사이드바 관련)
   - ClineRulesToggleModal.tsx (규칙 관련)

## 4. 검증 단계
1. 백업 존재 및 복원 가능성 확인:
   ```bash
   # 백업 파일 존재 확인
   find . -name "*.cline" | head -10

   # 복원 프로세스 테스트
   cp src/extension.ts.cline src/extension.ts
   npm run compile  # 작동해야 함
   git checkout src/extension.ts  # 수정사항 복원
   ```

2. 양쪽 모드 테스트:
   - Cline 원본 기능이 여전히 작동하는지
   - Caret 확장이 예상대로 작동하는지
   - 충돌이나 회귀 없는지

## 5. 문서 사이트 동기화 (docs.caret.team)

Cline 병합 후 다국어 문서 사이트 동기화:

1. **docs.caret.team 클론 (최초 1회)**:
   ```bash
   cd /Users/luke/dev/caret

   # 처음 한 번만
   if [ ! -d "docs.caret.team" ]; then
     git clone https://github.com/aicoding-caret/docs.caret.team
   fi
   ```

2. **Caret/docs에서 docs.caret.team 업데이트**:
   ```bash
   cd docs.caret.team
   git checkout -b sync/cline-$(date +%Y%m%d)

   # 신규/변경 파일 확인
   diff -qr ../docs/ docs-en/ | grep -E "Only in ../docs/|differ"

   # 신규 Cline 기능 복사 (Caret 브랜딩)
   # 예시: yolo-mode, dictation, multiroot-workspace
   cp ../docs/features/yolo-mode.mdx docs-en/features/
   sed -i '' 's/Cline/Caret/g' docs-en/features/yolo-mode.mdx
   sed -i '' 's/cline/caret/g' docs-en/features/yolo-mode.mdx
   sed -i '' 's/docs\.cline\.bot/docs.caret.team\/ko/g' docs-en/features/yolo-mode.mdx
   ```

3. **전체 언어 번역**:
   ```bash
   # 한국어, 일본어, 중국어 번역
   # docs-ko/, docs-ja/, docs-zh/

   # 네비게이션 업데이트
   # sidebars-en.ts, sidebars-ko.ts, sidebars-ja.ts, sidebars-zh.ts
   ```

4. **빌드 및 검증**:
   ```bash
   npm install
   npm run build
   npm run start

   # 모든 언어 버전 테스트
   # http://localhost:3000/ko/features/yolo-mode
   # http://localhost:3000/en/features/yolo-mode
   ```

5. **상세 가이드**:
   `/Users/luke/dev/caret/caret-docs/work-logs/luke/2025-10-14-docs-caret-team-sync-analysis.md` 참조

## 6. 향후 병합 준비
1. 모든 Cline 파일 수정사항 문서화:
   ```bash
   # 모든 CARET MODIFICATION 주석 찾기
   grep -r "CARET MODIFICATION" src/ webview-ui/ --include="*.ts" --include="*.tsx"
   ```

2. 병합 충돌 해결 계획 수립:
   - 수정된 파일과 변경 이유 목록화
   - 충돌 해결 전략 준비
   - 더미 브랜치로 병합 시나리오 테스트

3. 문서 사이트 업데이트:
   - 신규 Cline 기능을 docs.caret.team에 동기화
   - 4개 언어 (en, ko, ja, zh) 번역
   - Caret 독점 기능 섹션 업데이트

## 7. 사용자 확인 요청
레벨 2 또는 레벨 3 수정 적용 전:
   ```xml
   <ask_followup_question>
   <question>Cline 원본 파일을 수정해야 합니다: {filename}
   
   수정 이유: {reason}
   변경 범위: {number} 줄
   백업 생성 예정: {filename}.cline
   
   이 Cline 파일 수정을 진행하시겠습니까?</question>
   <options>["예, 백업과 함께 진행", "아니요, 대안 방법 찾기", "변경사항을 먼저 검토하겠습니다"]</options>
   </ask_followup_question>
   ```
</detailed_sequence_of_steps>

<general_guidelines>
항상 계층을 따르세요: 레벨 1 → 레벨 2 → 레벨 3. 레벨 1과 2 옵션을 탐색하지 않고 레벨 3로 직접 점프하지 마세요.

Cline 파일을 수정할 때는 향후 병합 시나리오를 고려하세요. 수정되는 파일이 적을수록 업스트림 병합이 쉬워집니다.

모든 아키텍처 결정과 수정 이유를 향후 참조를 위해 문서화하세요.
</general_guidelines>