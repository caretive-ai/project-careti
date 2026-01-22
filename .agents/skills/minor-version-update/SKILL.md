# Minor Version Update Skill

## Overview
Caret의 마이너 버전 업데이트(0.4.x) 시 수행해야 하는 작업들을 정의합니다.

## When to Use
- 마이너 버전 업데이트 배포 시 (예: 0.4.5 → 0.4.6)
- README/CHANGELOG/docs 업데이트가 필요할 때

---

## Step 1: Git 변경사항 분석

마지막 태그 또는 버전 이후의 변경사항을 확인합니다:

```bash
# 마지막 버전 태그 이후 커밋 확인
git log --oneline $(git describe --tags --abbrev=0)..HEAD

# 또는 특정 커밋 이후
git log --oneline <last-version-commit>..HEAD

# 변경된 파일 목록
git diff --name-only $(git describe --tags --abbrev=0)..HEAD
```

---

## Step 2: 사용자 확인 (필수)

**AI는 작업 전 반드시 다음을 사용자에게 확인해야 합니다:**

### 2-1. 문서 유형 구분

| 문서 유형 | 파일 | 특징 |
|----------|------|------|
| **사용자용** | README, docs.careti.ai, announcement | 사용자에게 어필, 중요 기능만 |
| **개발자용** | CHANGELOG.md | 실제 로그, 모든 변경사항 |

### 2-2. 확인할 질문들

1. **업데이트 방식**:
   - 이전 버전 내용에 **추가**할까요? (사용자용 권장)
   - 새로 **덮어쓸까요**? (개발자용 CHANGELOG)

2. **포함할 내용**:
   - 버그패치/링크수정 같은 사소한 변경은 **제외**할까요? (사용자용 권장)
   - 모든 변경사항을 **포함**할까요? (개발자용 CHANGELOG)

3. **announcement 업데이트**:
   - 이번 업데이트도 announcement에 포함할까요?
   - 개발자가 아닌 일반 사용자에게 중요한 변경인가요?

---

## Step 3: 문서별 업데이트 규칙

### 사용자용 문서 (README, docs, announcement)

**규칙**:
- 버전 번호만 올리고, 이전 버전 내용에 **새 내용 추가**
- 버그패치/리팩터링/링크수정 등 사소한 변경은 **제외**
- 사용자에게 어필할 수 있는 **중요 기능만** 포함

**예시** (0.4.5 → 0.4.6):
```markdown
## 🎉 v0.4.6

- 🎁 **Free Credits Promo** — 새 기능 (0.4.6)
- 🤖 **GLM-4.7** — 기존 기능 (0.4.5)
- 🖼️ **Image Tools** — 기존 기능 (0.4.5)
...
```

### 개발자용 문서 (CHANGELOG.md)

**규칙**:
- 이전 버전 **유지**, 새 버전 **위에 추가**
- 모든 변경사항 포함 (버그패치, 리팩터링 등)
- 날짜와 함께 기록

**예시**:
```markdown
## [0.4.6] 2026-01-19

### ✨ Improved
- **Dynamic branding**: 하드코딩 "Cline" → 동적 브랜드명

### Fixed
- **README links**: 다국어 README 링크 수정

---

## [0.4.5] 2026-01-18
(기존 내용 유지)
```

---

## Step 4: 파일별 수정 위치

### README.md
- `[v0.4.x Update]` 배너 텍스트
- `## 🎉 v0.4.x` 섹션

### docs.careti.ai (7개 언어)
```
docs-ko/getting-started/what-is-careti.mdx
docs-en/getting-started/what-is-careti.mdx
docs-ja/getting-started/what-is-careti.mdx
docs-zh/getting-started/what-is-careti.mdx
docs-fr/getting-started/what-is-careti.mdx
docs-de/getting-started/what-is-careti.mdx
docs-ru/getting-started/what-is-careti.mdx
```

### announcement (선택)
```
webview-ui/src/caret/locale/*/announcement.json
```

### CHANGELOG.md
- 최상단에 새 버전 섹션 추가

---

## Step 5: 번역 템플릿

| 언어 | 버전 헤더 |
|------|----------|
| ko | `## 🎉 v0.4.y 업데이트` |
| en | `## 🎉 v0.4.y Update` |
| ja | `## 🎉 v0.4.y アップデート` |
| zh | `## 🎉 v0.4.y 更新` |
| fr | `## 🎉 Mise à jour v0.4.y` |
| de | `## 🎉 v0.4.y Update` |
| ru | `## 🎉 Обновление v0.4.y` |

---

## NOT Required for Minor Updates

- [ ] package.json 버전 (배포 시 별도 변경)

---

## Command Summary

```bash
# 1. Git 변경사항 확인
git log --oneline $(git describe --tags --abbrev=0)..HEAD

# 2. 현재 버전 확인
grep -n "v0\.4\." README.md CHANGELOG.md

# 3. 수정 후 커밋
git add README.md CHANGELOG.md docs.careti.ai/
git commit -m "chore: v0.4.y 버전 업데이트"

# 4. 푸시
git push origin main
```

---

## Mirroring Policy
`.agents/`와 `.users/`는 1:1 미러링 구조입니다.
- 이 파일 수정 시 `.users/skills/minor-version-update/SKILL.md`도 동일하게 업데이트
