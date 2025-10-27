# 🔗 Caret 링크 관리 시스템 가이드

Caret의 통합 링크 관리 시스템은 프로젝트 전반의 URL을 일관되게 관리하고 언어별로 다른 링크를 제공하는 강력한 도구입니다.

## 📋 시스템 개요

### 해결하는 문제

- **중복 URL 관리**: 여러 컴포넌트에 흩어진 하드코딩된 URL 문제 해결
- **다국어 링크 지원**: 언어별로 다른 URL을 제공해야 하는 요구사항 충족
- **유지보수성**: 중앙 집중식 관리로 링크 변경 시 한 곳만 수정
- **타입 안전성**: TypeScript를 통한 링크 키 검증

### 핵심 컴포넌트

1. **URL 상수 정의** (`webview-ui/src/caret/utils/urls.ts`)
2. **i18n 통합** (`webview-ui/src/caret/utils/i18n.ts`)
3. **템플릿 변수 시스템**
4. **타입 안전성 보장**

## 📁 파일 구조

```
webview-ui/src/caret/
├── utils/
│   ├── urls.ts                # URL 상수 정의
│   ├── CaretWebviewLogger.ts       # 웹뷰 로깅 시스템
│   └── i18n.ts                # 번역 및 링크 통합 유틸리티 (추가 예정)
├── locale/                    # 다국어 JSON 파일 (추가 예정)
│   ├── ko/welcome.json        # 한국어 번역 (템플릿 변수 포함)
│   ├── en/welcome.json        # 영어 번역
│   ├── ja/welcome.json        # 일본어 번역
│   └── zh/welcome.json        # 중국어 번역
└── components/                # Caret 컴포넌트 (추가 예정)
    ├── CaretWelcome.tsx       # 링크 시스템 사용 예시
    └── CaretFooter.tsx        # 링크 시스템 사용 예시
```

## 🔧 URL 상수 정의

### 일반 URL 상수 (언어 독립적)

```typescript
// webview-ui/src/caret/utils/urls.ts
export const CARET_URLS = {
	// 서비스 관련 (언어 독립적)
	CARET_SERVICE: "https://caret.team",
	CARET_GITHUB: "https://github.com/aicoding-caret/caret",

	// 회사 관련 (언어 독립적)
	CARETIVE_COMPANY: "https://caretive.ai",
	CARETIVE_ABOUT: "https://caretive.ai/about",
	// ... 기타 URL
} as const
```

### 언어별 URL 상수

```typescript
// 언어에 따라 다른 링크
export const CARET_LOCALIZED_URLS = {
	// 교육 프로그램 링크 (언어별 앵커 다름)
	EDUCATION_PROGRAM: {
		ko: "https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-%EA%B0%9C%EB%B0%9C-%ED%99%98%EA%B2%BD-%EC%84%A4%EC%A0%95-%EC%95%BD-30%EB%B6%84",
		en: "https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes",
		ja: "https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-%E9%96%8B%E7%99%BA%E7%92%B0%E5%A2%83%E8%A8%AD%E5%AE%9A-%E7%B4%8430%E5%88%86",
		zh: "https://github.com/aicoding-caret/multi-post-agent/blob/main/docs/education-scenario.md#2-development-environment-setup-approximately-30-minutes",
	},

	// Gemini 크레딧 가이드 (언어별 문서 다름)
	GEMINI_CREDIT_GUIDE: {
		ko: "https://blog.naver.com/fstory97/223887376667",
		en: "https://cloud.google.com/pricing/free-trial",
		ja: "https://cloud.google.com/pricing/free-trial",
		zh: "https://cloud.google.com/pricing/free-trial",
	},
} as const
```

## 🌍 i18n 통합 시스템

### 헬퍼 함수

```typescript
// webview-ui/src/caret/utils/i18n.ts

// 현재 언어에 맞는 링크 가져오기
export function getLocalizedUrl(key: CaretLocalizedUrlKey, language: SupportedLanguage = "ko"): string {
	const urlMap = CARET_LOCALIZED_URLS[key]
	return urlMap[language] || urlMap.ko // 한국어로 폴백
}

// 일반 URL 가져오기
export function getUrl(key: CaretUrlKey): string {
	return CARET_URLS[key]
}

// 번역 텍스트에서 직접 링크 가져오기
export const getLink = (key: CaretLocalizedUrlKey, language?: SupportedLanguage): string => {
	return getLocalizedUrl(key, language || getCurrentLanguage())
}

export const getGlobalLink = (key: CaretUrlKey): string => {
	return getUrl(key)
}
```

### 템플릿 변수 시스템

번역 JSON 파일에서 `{{variableName}}` 형식으로 링크를 동적으로 삽입할 수 있습니다:

```json
{
	"educationOffer": {
		"header": "✨ 지금 시작하세요! 무료 'Vibe Coding' 교육 프로그램!",
		"body": "Caret과 함께하는 실전 교육 프로그램에 참여하세요! <VSCodeLink href=\"{{educationLink}}\">자세히 보기</VSCodeLink>"
	}
}
```

지원되는 템플릿 변수:

- `{{educationLink}}` → 현재 언어의 교육 프로그램 링크
- `{{geminiCreditLink}}` → 현재 언어의 Gemini 크레딧 가이드 링크
- `{{caretGitLink}}` → 현재 언어의 Caret GitHub 링크
- `{{caretService}}` → Caret 서비스 링크
- `{{caretGithub}}` → Caret GitHub 링크
- `{{caretiveCompany}}` → Caretive 회사 링크

## 💡 사용법

### 컴포넌트에서 링크 직접 사용

```tsx
import { getGlobalLink, getLink } from "../utils/i18n"

const MyComponent: React.FC = () => {
	return (
		<div>
			{/* 일반 링크 (언어 독립적) */}
			<a href={getGlobalLink("CARET_SERVICE")}>Caret 서비스</a>

			{/* 언어별 링크 */}
			<a href={getLink("EDUCATION_PROGRAM")}>교육 프로그램</a>
		</div>
	)
}
```

### 번역 텍스트를 통한 자동 링크 교체

```tsx
import { t } from "../utils/i18n"

const MyComponent: React.FC = () => {
	return (
		<div>
			{/* 템플릿 변수가 실제 링크로 자동 교체됨 */}
			<p
				dangerouslySetInnerHTML={{
					__html: t("educationOffer.body", "welcome"),
				}}
			/>
		</div>
	)
}
```

## 🛠️ 새 링크 추가하기

### 1. 일반 링크 추가 (언어 독립적)

```typescript
// webview-ui/src/caret/utils/urls.ts
export const CARET_URLS = {
	// ... 기존 링크
	NEW_SERVICE_LINK: "https://example.com/new-service",
} as const
```

### 2. 언어별 링크 추가

```typescript
// webview-ui/src/caret/utils/urls.ts
export const CARET_LOCALIZED_URLS = {
	// ... 기존 링크
	NEW_LOCALIZED_LINK: {
		ko: "https://example.com/ko/new-feature",
		en: "https://example.com/en/new-feature",
		ja: "https://example.com/ja/new-feature",
		zh: "https://example.com/zh/new-feature",
	},
} as const
```

### 3. 템플릿 변수 추가

```typescript
// webview-ui/src/caret/utils/i18n.ts의 replaceTemplateVariables 함수에 추가
const replaceTemplateVariables = (text: string, language: SupportedLanguage): string => {
	return (
		text
			// ... 기존 교체
			.replace(/\{\{newTemplateVar\}\}/g, getLocalizedUrl("NEW_LOCALIZED_LINK", language))
	)
}
```

### 4. 번역 파일에서 사용

```json
{
	"mySection": {
		"title": "새로운 기능",
		"description": "새로운 기능에 대해 <VSCodeLink href=\"{{newTemplateVar}}\">여기</VSCodeLink>에서 자세히 알아보세요!"
	}
}
```

## 🔍 타입 안전성

링크 키에 대한 타입 안전성은 TypeScript를 통해 보장됩니다:

```typescript
// 오타나 존재하지 않는 키는 컴파일 타임에 감지됩니다
getGlobalLink("NONEXISTENT_KEY") // ❌ 타입 에러!
getGlobalLink("CARET_SERVICE") // ✅ OK

getLink("INVALID_LOCALIZED_KEY") // ❌ 타입 에러!
getLink("EDUCATION_PROGRAM") // ✅ OK
```

## 📋 베스트 프랙티스

### 1. 링크 분류 원칙

- **CARET_URLS**: 언어와 무관한 고정 링크 (서비스 URL, API 엔드포인트 등)
- **CARET_LOCALIZED_URLS**: 언어별로 다른 링크 (문서, 가이드, 앵커 등)

### 2. 네이밍 컨벤션

- 상수 이름: `SCREAMING_SNAKE_CASE`
- 의미 있는 이름 사용 (예: `EDUCATION_PROGRAM` vs. `LINK1`)
- 카테고리 접두사 고려 (예: `DOCS_`, `API_`, `SERVICE_`)

### 3. 템플릿 변수 사용 가이드

- 번역 텍스트 내에 링크가 포함될 때 우선 사용
- 변수 이름은 camelCase (예: `{{educationLink}}`)
- 컴포넌트에서 링크를 직접 필요로 할 때는 헬퍼 함수 직접 사용

### 4. 언어별 링크 관리

- 지원하는 모든 언어에 대한 링크 제공
- 번역이 없을 경우 한국어로 폴백
- 언어별 앵커 ID 차이 고려

## ✅ 체크리스트

새 링크 추가 시 다음을 확인하세요:

- [ ] URL 상수에 추가 (`CARET_URLS` 또는 `CARET_LOCALIZED_URLS`)
- [ ] 타입 정의가 자동으로 업데이트됨
- [ ] 템플릿 변수가 필요하면 `replaceTemplateVariables`에 추가
- [ ] 언어별로 모든 링크 제공 (언어별 링크인 경우)
- [ ] 번역 파일에서 템플릿 변수 사용 (필요시)
- [ ] 웹뷰 빌드 테스트 (`npm run build:webview`)
- [ ] 실제 링크 동작 확인

---

## 🔗 관련 문서

- [Caret 다국어화(i18n) 가이드](../../features/f02-multilingual-i18n.md)
- [웹뷰-익스텐션 통신](./webview-extension-communication.md)
- [개발 가이드 인덱스](./index.md)
