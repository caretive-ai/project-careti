# F02 - Multilingual i18n

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: 100% 완료
**우선순위**: HIGH - 글로벌 확장

---

## 📋 개요

**목표**: 4개 언어 지원 다국어 시스템 - Korean, English, Japanese, Chinese

**핵심 기능**:
- 언어 타입 정의 (UILanguageKey)
- 언어 매핑 유틸리티
- 다국어 프롬프트 지원

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 수정

**1. Languages.ts** (+59 lines)
```
src/shared/Languages.ts
- UILanguageKey 타입 정의
- getLanguageKey() 함수
- getLanguageName() 함수
```

**핵심 코드**:
```typescript
// CARET MODIFICATION: 4개 언어 지원
export type UILanguageKey = "ko" | "en" | "ja" | "zh"

export function getLanguageKey(locale: string): UILanguageKey {
    if (locale.startsWith("ko")) return "ko"
    if (locale.startsWith("ja")) return "ja"
    if (locale.startsWith("zh")) return "zh"
    return "en" // 기본값
}

export function getLanguageName(key: UILanguageKey): string {
    const names = {
        ko: "한국어",
        en: "English",
        ja: "日本語",
        zh: "中文"
    }
    return names[key]
}
```

---

## 🌐 지원 언어

### 4개 언어

| 코드 | 언어 | 표시명 |
|------|------|--------|
| `ko` | Korean | 한국어 |
| `en` | English | English |
| `ja` | Japanese | 日本語 |
| `zh` | Chinese | 中文 |

### Locale 매핑

```
ko-KR → ko
en-US → en
ja-JP → ja
zh-CN → zh
zh-TW → zh
기타 → en (기본값)
```

---

## 🔧 사용 방법

### 언어 키 변환

```typescript
import { getLanguageKey } from "@shared/Languages"

const key = getLanguageKey("ko-KR")  // → "ko"
const key = getLanguageKey("ja-JP")  // → "ja"
const key = getLanguageKey("fr-FR")  // → "en" (기본값)
```

### 언어 이름 표시

```typescript
import { getLanguageName } from "@shared/Languages"

const name = getLanguageName("ko")  // → "한국어"
const name = getLanguageName("ja")  // → "日本語"
```

---

## 📝 Modified Files (Phase 4)

**Cline 핵심 파일**:
```
src/shared/Languages.ts  (+59 lines)
```

**최소 침습**: 1개 파일, 59 lines 추가

---

## 💡 핵심 장점

**1. 타입 안전성**
- UILanguageKey로 컴파일 타임 검증
- 잘못된 언어 코드 방지

**2. 확장성**
- 새 언어 추가 용이
- 중앙 집중식 관리

**3. 사용자 경험**
- 자동 Locale 감지
- 기본값 Fallback

---

## 🧪 검증

### 테스트 케이스

```typescript
// 1. 한국어 매핑
getLanguageKey("ko-KR") === "ko" ✅
getLanguageName("ko") === "한국어" ✅

// 2. 일본어 매핑
getLanguageKey("ja-JP") === "ja" ✅
getLanguageName("ja") === "日本語" ✅

// 3. 기본값 Fallback
getLanguageKey("fr-FR") === "en" ✅
getLanguageName("en") === "English" ✅
```

---

**작성일**: 2025-10-10
**Phase**: Phase 4 완료
**Frontend**: Phase 5에서 UI 연동
