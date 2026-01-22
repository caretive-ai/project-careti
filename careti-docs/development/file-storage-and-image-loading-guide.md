# 파일 저장 및 이미지 로딩 문제 해결 가이드

> **⚠️ 주의: 개념적 가이드**
> 이 문서는 파일 저장 및 이미지 로딩 관련 문제를 해결하기 위한 **방법론과 원칙**을 설명합니다. 여기에 포함된 코드 예제(`convertImageUri` 등)는 실제 코드베이스에 존재하지 않을 수 있는 **개념적 예시**이며, 아이디어를 전달하기 위한 목적으로 사용되었습니다. 실제 구현 시에는 이 문서의 원칙을 바탕으로 프로젝트의 실제 코드 구조에 맞게 적용해야 합니다.

> 🎯 **목적**: VSCode 확장프로그램 개발 시 파일 저장 권한과 이미지 로딩 관련 문제를 사전에 방지하고 해결하는 가이드

## 1. VSCode 웹뷰 CSP (Content Security Policy) 문제

### 1.1. 문제 상황

VSCode 웹뷰에서 `asset://` 프로토콜을 사용한 이미지 로딩 시 CSP 정책 위반 에러 발생:

```
Refused to load the image 'asset:/assets/template_characters/ichika.png'
because it violates the following Content Security Policy directive:
"img-src 'self' https://*.vscode-cdn.net https: data:".
```

### 1.2. 원인 분석

- VSCode 웹뷰는 보안상 `asset://` 프로토콜을 허용하지 않음
- 허용되는 이미지 소스: `'self'`, `https://*.vscode-cdn.net`, `https:`, `data:`
- `data:` URI 스키마만이 로컬 이미지를 안전하게 로드할 수 있음

### 1.3. 해결 방법

**Base64 데이터 URI 변환 사용:**

```typescript
// ❌ 잘못된 방법: asset:// 프로토콜 사용
const imageUri = "asset:/assets/template_characters/sarang.png"

// ✅ 올바른 방법: Base64 데이터 URI 변환
const convertImageUri = async (assetUri: string): Promise<string> => {
	if (!assetUri.startsWith("asset:/assets/")) {
		return assetUri
	}

	try {
		// 파일 경로 구성
		const imagePath = path.join(context.extensionPath, "assets", assetUri.replace("asset:/assets/", ""))

		// Base64 변환
		const imageBuffer = await fs.readFile(imagePath)
		const ext = path.extname(imagePath).toLowerCase()
		const mimeType =
			ext === ".png"
				? "image/png"
				: ext === ".jpg" || ext === ".jpeg"
					? "image/jpeg"
					: ext === ".webp"
						? "image/webp"
						: "image/png"

		return `data:${mimeType};base64,${imageBuffer.toString("base64")}`
	} catch (error) {
		caretLogger.error(`Failed to convert image URI: ${assetUri}`, error)
		return assetUri // 원본 URI 반환으로 폴백
	}
}
```

### 1.4. 구현 시 주의사항

1. **MIME 타입 정확히 설정**: 파일 확장자에 맞는 MIME 타입 사용
2. **에러 처리**: 파일이 없을 경우 적절한 폴백 제공
3. **로깅**: 변환 과정을 로그로 기록하여 디버깅 지원
4. **성능 고려**: 큰 이미지는 캐싱 고려

## 2. 이미지 파일 경로 및 저장소 혼재 문제

### 2.1. 문제 상황

템플릿 이미지를 잘못된 경로에서 찾으려다 실패하는 상황:

```typescript
// ❌ 문제: globalStorage에서 템플릿 이미지를 찾으려 함
const globalStoragePath = path.join(context.globalStorageUri.fsPath, "personas", fileName)
// 결과: 파일이 존재하지 않아 로딩 실패
```

### 2.2. 경로 구분 규칙

| 이미지 타입              | 저장 위치                           | 용도                            | 접근 방법                  |
| ------------------------ | ----------------------------------- | ------------------------------- | -------------------------- |
| **템플릿 캐릭터 이미지** | `assets/template_characters/` | 고정된 템플릿 캐릭터 이미지     | Extension path + 파일명    |
| **현재 페르소나 이미지** | `globalStorage/personas/`           | 사용자가 업로드한 현재 페르소나 | GlobalStorage URI + 파일명 |
| **사용자 업로드 이미지** | `globalStorage/personas/`           | 사용자 커스텀 이미지            | GlobalStorage URI + 파일명 |

### 2.3. 올바른 구현 패턴

```typescript
const loadTemplateImage = async (templateImageUri: string): Promise<string> => {
	if (templateImageUri.startsWith("asset:/assets/template_characters/")) {
		// 템플릿 이미지는 assets에서 로드
		const imagePath = path.join(context.extensionPath, "assets", templateImageUri.replace("asset:/assets/", ""))
		return await convertToBase64(imagePath)
	}
	return templateImageUri
}

const loadCurrentPersonaImage = async (): Promise<{ avatarUri: string; thinkingAvatarUri: string }> => {
	// 현재 페르소나 이미지는 globalStorage에서 로드
	const globalStoragePath = path.join(context.globalStorageUri.fsPath, "personas")

	const avatarPath = path.join(globalStoragePath, "agent_profile.png")
	const thinkingPath = path.join(globalStoragePath, "agent_thinking.png")

	return {
		avatarUri: await convertToBase64(avatarPath),
		thinkingAvatarUri: await convertToBase64(thinkingPath),
	}
}
```

## 3. 페르소나 이미지 표시 로직 혼재 문제

### 3.1. 문제 상황

서로 다른 용도의 컴포넌트가 동일한 데이터 소스를 사용하여 잘못된 이미지를 표시:

- **PersonaAvatar** (채팅용): 현재 페르소나 이미지 표시해야 함
- **PersonaManagement** (설정용): 현재 페르소나 이미지 표시해야 함
- **PersonaTemplateSelector** (선택용): 템플릿 캐릭터 이미지 표시해야 함

하지만 모두 `REQUEST_TEMPLATE_CHARACTERS`를 사용해서 템플릿 이미지가 현재 페르소나로 잘못 표시됨.

### 3.2. 메시지 타입 분리 해결책

**용도별 메시지 타입 정의:**

```typescript
// WebviewMessage.ts
export interface WebviewMessage {
  type:
    | "REQUEST_TEMPLATE_CHARACTERS"  // 템플릿 선택용
    | "REQUEST_PERSONA_IMAGES"       // 현재 페르소나 표시용
    | // ... 기타 타입들
}

// ExtensionMessage.ts
export interface ExtensionMessage {
  type:
    | "RESPONSE_TEMPLATE_CHARACTERS" // 템플릿 목록 응답
    | "RESPONSE_PERSONA_IMAGES"      // 현재 페르소나 이미지 응답
    | // ... 기타 타입들
}
```

**Controller에서 분리 처리:**

```typescript
// Controller
case "REQUEST_TEMPLATE_CHARACTERS": {
  // 템플릿 캐릭터 목록 반환 (선택용)
  const templates = await loadTemplateCharacters()
  this.postMessageToWebview({
    type: "RESPONSE_TEMPLATE_CHARACTERS",
    payload: templates
  })
  break
}

case "REQUEST_PERSONA_IMAGES": {
  // 현재 페르소나 이미지만 반환 (표시용)
  const personaImages = await loadCurrentPersonaImages()
  this.postMessageToWebview({
    type: "RESPONSE_PERSONA_IMAGES",
    payload: personaImages
  })
  break
}
```

### 3.3. 컴포넌트별 사용 패턴

```typescript
// PersonaAvatar.tsx - 채팅용 현재 페르소나 표시
useEffect(() => {
	vscode.postMessage({ type: "REQUEST_PERSONA_IMAGES" })
}, [])

// PersonaManagement.tsx - 설정용 현재 페르소나 표시
useEffect(() => {
	vscode.postMessage({ type: "REQUEST_PERSONA_IMAGES" })
	vscode.postMessage({ type: "REQUEST_TEMPLATE_CHARACTERS" }) // 템플릿 목록도 필요
}, [])

// PersonaTemplateSelector.tsx - 템플릿 선택용
useEffect(() => {
	vscode.postMessage({ type: "REQUEST_TEMPLATE_CHARACTERS" })
}, [])
```

## 4. 파일 업로드 및 권한 문제

### 4.1. globalStorage 디렉토리 권한

VSCode는 globalStorage 디렉토리에 대한 읽기/쓰기 권한을 자동으로 제공하지만, 디렉토리가 존재하지 않을 수 있음:

```typescript
const ensurePersonaDirectoryExists = async (context: vscode.ExtensionContext): Promise<string> => {
	const personaDir = path.join(context.globalStorageUri.fsPath, "personas")

	try {
		await fs.access(personaDir)
	} catch {
		// 디렉토리가 없으면 생성
		await fs.mkdir(personaDir, { recursive: true })
		caretLogger.info(`Created personas directory: ${personaDir}`)
	}

	return personaDir
}
```

### 4.2. 파일 업로드 시 권한 체크

```typescript
const savePersonaImage = async (
	context: vscode.ExtensionContext,
	imageType: "normal" | "thinking",
	base64Data: string,
): Promise<string> => {
	const personaDir = await ensurePersonaDirectoryExists(context)
	const fileName = imageType === "normal" ? "agent_profile.png" : "agent_thinking.png"
	const filePath = path.join(personaDir, fileName)

	try {
		// Base64 데이터를 버퍼로 변환
		const imageBuffer = Buffer.from(base64Data.split(",")[1], "base64")

		// 파일 쓰기 권한 체크
		await fs.access(path.dirname(filePath), fs.constants.W_OK)

		// 파일 저장
		await fs.writeFile(filePath, imageBuffer)

		caretLogger.info(`Persona image saved: ${filePath}`)
		return filePath
	} catch (error) {
		caretLogger.error(`Failed to save persona image: ${filePath}`, error)
		throw new Error(`Failed to save persona image: ${error.message}`)
	}
}
```

## 5. TypeScript 타입 안전성 확보

### 5.1. 메시지 타입 정의 완성도

새로운 메시지 타입을 추가할 때는 관련된 모든 타입 정의를 업데이트해야 함:

```typescript
// 1. WebviewMessage.ts 업데이트
export interface WebviewMessage {
  type:
    | "REQUEST_PERSONA_IMAGES"  // 새 타입 추가
    | // ... 기존 타입들
}

// 2. ExtensionMessage.ts 업데이트
export interface ExtensionMessage {
  type:
    | "RESPONSE_PERSONA_IMAGES" // 새 타입 추가
    | // ... 기존 타입들
}

// 3. 페이로드 타입 정의
export interface PersonaImagesPayload {
  avatarUri: string
  thinkingAvatarUri: string
}
```

### 5.2. 컴파일 에러 사전 방지

타입 추가 후 즉시 컴파일 확인:

```bash
npm run compile
```

타입 에러가 발생하면 모든 관련 파일을 업데이트한 후 다시 컴파일해야 함.

## 6. 디버깅 및 로깅 전략

### 6.1. 이미지 로딩 과정 로깅

```typescript
const convertImageUri = async (uri: string): Promise<string> => {
	caretLogger.info(`[ImageLoading] Converting URI: ${uri}`)

	try {
		const result = await performConversion(uri)
		caretLogger.info(`[ImageLoading] Success: ${uri} -> data:${mimeType} (${buffer.length} bytes)`)
		return result
	} catch (error) {
		caretLogger.error(`[ImageLoading] Failed: ${uri}`, error)
		throw error
	}
}
```

### 6.2. 파일 권한 문제 진단

```typescript
const diagnoseFilePermissions = async (filePath: string): Promise<void> => {
	try {
		const stats = await fs.stat(filePath)
		caretLogger.info(`[FilePermissions] ${filePath}:`, {
			exists: true,
			size: stats.size,
			isFile: stats.isFile(),
			isDirectory: stats.isDirectory(),
		})

		// 읽기 권한 체크
		await fs.access(filePath, fs.constants.R_OK)
		caretLogger.info(`[FilePermissions] Read access: OK`)

		// 쓰기 권한 체크 (디렉토리의 경우)
		if (stats.isDirectory()) {
			await fs.access(filePath, fs.constants.W_OK)
			caretLogger.info(`[FilePermissions] Write access: OK`)
		}
	} catch (error) {
		caretLogger.error(`[FilePermissions] ${filePath}:`, error)
	}
}
```

## 7. 체크리스트

### 7.1. 이미지 로딩 구현 체크리스트

- [ ] CSP 정책 준수 (asset:// 대신 data: URI 사용)
- [ ] 올바른 파일 경로 사용 (템플릿 vs 사용자 이미지)
- [ ] MIME 타입 정확히 설정
- [ ] 에러 처리 및 폴백 제공
- [ ] 로깅으로 디버깅 지원
- [ ] TypeScript 타입 정의 완성

### 7.2. 파일 저장 구현 체크리스트

- [ ] 디렉토리 존재 여부 확인 및 생성
- [ ] 파일 권한 체크
- [ ] Base64 데이터 올바른 변환
- [ ] 저장 성공/실패 로깅
- [ ] 사용자에게 적절한 피드백 제공

### 7.3. 컴포넌트 분리 체크리스트

- [ ] 용도별 메시지 타입 분리
- [ ] Controller에서 요청 타입별 적절한 응답
- [ ] 컴포넌트별 올바른 메시지 타입 사용
- [ ] TypeScript 컴파일 에러 해결

---

> 💡 **팁**: 이 가이드의 패턴들을 따르면 VSCode 확장프로그램에서 파일 저장과 이미지 로딩 관련 문제를 효과적으로 방지할 수 있습니다. 특히 CSP 정책과 경로 혼재 문제는 사전에 설계 단계에서 고려하는 것이 중요합니다.
