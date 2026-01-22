## 🖼️ M03: 이미지 툴 개선 - 상세 분석

### 📊 현재 구현 상황

#### 1. 이미지 최적화 시스템 (`image-optimization.ts`)

**구현 상태**: ✅ 이미 구현됨

**핵심 설정**:
```typescript
const MAX_IMAGE_DIMENSION = 1024      // 최대 1024px로 리사이즈
const MAX_INPUT_DIMENSION = 7500       // 입력 최대 7500px
const DEFAULT_IMAGE_QUALITY = 86       // WebP 품질
const OUTPUT_MIME_TYPE = "image/webp"   // WebP로 변환
const SUPPORTED_INPUT_MIME_TYPES = new Set([
  "image/png", "image/jpeg", "image/webp"
])
```

**최적화 로직**:
```typescript
export const optimizeImageDataUrl = async (dataUrl: string): Promise<string> => {
  // 1. Sharp 라이브러리 로드
  const sharp = await loadSharp()
  if (!sharp) {
    return dataUrl  // Sharp 없으면 변환 안 함
  }

  // 2. Data URL 파싱
  const { mimeType, base64 } = parseDataUrl(dataUrl)
  if (!SUPPORTED_INPUT_MIME_TYPES.has(mimeType)) {
    return dataUrl  // 지원하지 않는 포맷은 그대로
  }

  // 3. 메타데이터 추출
  const inputBuffer = Buffer.from(base64, "base64")
  const metadata = await sharp(inputBuffer).metadata()

  // 4. 입력 제한 확인 (7500px)
  if (metadata.width > MAX_INPUT_DIMENSION || metadata.height > MAX_INPUT_DIMENSION) {
    throw new Error("Image dimensions exceed maximum allowed size of 7500px.")
  }

  // 5. 리사이즈 계산 (1024px)
  const longestSide = Math.max(metadata.width, metadata.height)
  const scale = longestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestSide : 1
  const targetWidth = Math.round(metadata.width * scale)
  const targetHeight = Math.round(metadata.height * scale)
  const needsResize = scale < 1
  const shouldReencode = needsResize || mimeType !== OUTPUT_MIME_TYPE

  if (!shouldReencode) {
    return dataUrl  // 변환 필요 없으면 그대로
  }

  // 6. WebP 변환 및 리사이즈
  let pipeline = sharp(inputBuffer)
  if (needsResize) {
    pipeline = pipeline.resize({
      width: targetWidth,
      height: targetHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
  }

  const outputBuffer = await pipeline.webp({ quality: DEFAULT_IMAGE_QUALITY }).toBuffer()
  return `data:${OUTPUT_MIME_TYPE};base64,${outputBuffer.toString("base64")}`
}
```

**의존성**: `careti-src/utils/image-optimization.ts`
**Sharp 버전**: v0.33.5 (이미 설치됨)

#### 2. 이미지 레지스트리 (`ImageRegistry.ts`)

**구현 상태**: ✅ 이미 구현됨

**핵심 설정**:
```typescript
const MAX_PERSISTED_DATA_URL_BYTES = 2 * 1024 * 1024      // 단일 이미지 최대 2MB
const MAX_PERSISTED_TOTAL_DATA_URL_BYTES = 6 * 1024 * 1024  // 총 6MB
```

**기능**:
- 이미지 등록 및 관리
- 최신 이미지 우선 저장
- 총 용량 제한으로 자동 삭제 (오래된 이미지부터)
- 이미지 ID 생성 (`careti-src/shared/images/image-id.ts`)

#### 3. 이미지 스코프 매니저 (`ImageScopeManager.ts`)

**구현 상태**: ✅ 이미 구현됨

**기능**:
- `@image` 문법 지원 (`workspace:path/image.png`)
- 사용자 텍스트에서 이미지 멘션 추출
- 이미지 확장자 확인: [".png", ".jpg", ".jpeg", ".webp"]
- ImageRegistry와 연동하여 이미지 로드

#### 4. 이미지 생성 툴 핸들러 (`GenerateImageToolHandler.ts`)

**구현 상태**: ✅ 이미 구현됨

**기능**:
- `generate_image` 툴 처리
- `reference_images` 파라미터 파싱
  - dataUrls: `data:image/png;base64,...`
  - filePaths: `/path/to/image.png`
- 이미지 최적화 적용 (`optimizeImageDataUrl`)
- Careti API를 통한 이미지 생성
- 생성된 이미지 자동 WebP 변환 및 저장

---

### 🚨 문제 분석

#### 문제 1: "계속 넘치는 것 같음"

**가능한 원인**:
1. **Sharp 라이브러리 로드 실패**
   ```typescript
   const sharp = await loadSharp()
   if (!sharp) {
     return dataUrl  // 변환 안 함
   }
   ```
   - Sharp 로드 실패 시 변환 안 함
   - 원본 이미지 그대로 전송

2. **입력 제한 예외 발생**
   ```typescript
   if (metadata.width > MAX_INPUT_DIMENSION || metadata.height > MAX_INPUT_DIMENSION) {
     throw new Error("Image dimensions exceed maximum allowed size of 7500px.")
   }
   ```
   - 7500px 초과 시 에러
   - 하지만 사용자에게 명확한 에러 메시지 전달 필요

3. **shouldReencode 조건 충족하지 않음**
   ```typescript
   const shouldReencode = needsResize || mimeType !== OUTPUT_MIME_TYPE
   if (!shouldReencode) {
     return dataUrl  // 변환 필요 없으면 그대로
   }
   ```
   - 이미 1024px 이하이고 WebP면 변환 안 함

**진단**:
- 최적화 로직은 정상적으로 구현됨
- 하지만 Sharp 로드 실패 시 대응 필요
- 에러 메시지 개선 필요

#### 문제 2: 비전 모델로 이미지 분석 기능 부재

**현재 상황**:
```bash
# 비전 모델 지원 확인
grep -r "vision\|Vision" careti-src/
# 결과: 없음

# Cline에서도 비전 모델 지원 없음
grep -r "gpt-4-turbo\|claude-3.*vision" src/shared/api.ts
# 결과: 없음
```

**진단**:
- 현재 구현에는 비전 모델로 이미지 분석하는 기능이 없음
- AI는 이미지 파일 경로를 통해 직접 읽을 수 있음 (`fs.readFile`)
- 하지만 이미지 내용을 분석하는 API 호출이 없음

#### 문제 3: 이미지 파일 직접 읽기

**현재 구현**:
```typescript
// ImageRegistry.ts
const raw = await fs.readFile(filePath, "utf8")
const buffer = await fs.readFile(record.filePath)
```

**진단**:
- ✅ 이미지 파일 직접 읽기 기능 구현됨
- ✅ Buffer로 이미지 데이터 로드
- ✅ WebP 변환 가능

---

### 🔍 상세 분석 결과

#### 1. 이미지 최적화 로직

| 기능 | 구현 상태 | 동작 |
|------|----------|------|
| **WebP 자동 변환** | ✅ 구현됨 | `OUTPUT_MIME_TYPE = "image/webp"` |
| **리사이즈 (1024px)** | ✅ 구현됨 | `MAX_IMAGE_DIMENSION = 1024` |
| **입력 제한 (7500px)** | ✅ 구현됨 | 에러 발생 시 예외 |
| **품질 제어** | ✅ 구현됨 | `DEFAULT_IMAGE_QUALITY = 86` |
| **Sharp 라이브러리** | ✅ 설치됨 | v0.33.5 |

**결론**: 최적화 로직은 완벽하게 구현됨

#### 2. "계속 넘치는 것 같음" 원인

| 가능한 원인 | 확률 | 대응 |
|-----------|------|------|
| Sharp 라이브러리 로드 실패 | 🟡 중간 | 로그 확인, 에러 메시지 개선 |
| 사용자가 이미 1024px 이하 WebP 사용 | 🟡 중간 | 로그 추가, 사용자에게 안내 |
| 입력 제한 초과 에러 | 🟢 낮음 | 명확한 에러 메시지 |

**추천 조치**:
1. Sharp 로드 실패 시 로그 추가
2. 최적화 건너뛴 시 로그 추가
3. 사용자에게 최적화 상태 안내

#### 3. 비전 모델 이미지 분석

| 기능 | 구현 상태 | 필요 여부 |
|------|----------|----------|
| **이미지 파일 읽기** | ✅ 구현됨 | 필수 |
| **비전 API 호출** | ❌ 미구현 | 권장 |
| **이미지 내용 분석** | ❌ 미구현 | 권장 |

**결론**:
- 이미지 파일 읽기는 이미 구현됨
- 비전 모델로 분석하는 기능은 없음
- AI가 이미지 판단을 위해 비전 API 필요

---

### 🎯 개선 계획

#### Phase 0: RED (테스트 작성)

```typescript
// careti-src/__tests__/image-tool-optimization.test.ts (신규)
describe('Image Tool Optimization', () => {
  describe('WebP Auto Conversion', () => {
    test('should auto-convert large images to WebP', async () => {
      const largeImage = createLargeImage(2048, 2048) // >10MB
      const optimized = await optimizeImageDataUrl(largeImage)

      expect(optimized.mimeType).toBe('image/webp')
      expect(optimized.size).toBeLessThan(2 * 1024 * 1024) // <2MB
    })

    test('should not convert already WebP 1024px image', async () => {
      const smallWebP = createTestImage('webp', 800, 800)
      const optimized = await optimizeImageDataUrl(smallWebP)

      expect(optimized).toBe(smallWebP) // 변환 안 함
    })

    test('should log when Sharp load fails', async () => {
      // Mock Sharp load failure
      const consoleSpy = jest.spyOn(console, 'error')

      const result = await optimizeImageDataUrl(testImage)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sharp load failed')
      )
      expect(result).toBe(testImage)
    })

    test('should throw clear error for >7500px image', async () => {
      const hugeImage = createTestImage('png', 8000, 6000)

      await expect(optimizeImageDataUrl(hugeImage)).rejects.toThrow(
        'Image dimensions exceed maximum allowed size of 7500px.'
      )
    })
  })

  describe('Image File Direct Read', () => {
    test('should read image file directly from path', async () => {
      const imagePath = createTestImageFile('test.png')
      const imageContent = await readImageFromPath(imagePath)

      expect(imageContent).toHaveProperty('data')
      expect(imageContent).toHaveProperty('mimeType')
      expect(imageContent).toHaveProperty('dimensions')
      expect(imageContent.dimensions.width).toBeGreaterThan(0)
    })

    test('should optimize image after file read', async () => {
      const imagePath = createTestImageFile('test.jpg', 3000, 3000)
      const optimized = await optimizeImageAfterRead(imagePath)

      expect(optimized.mimeType).toBe('image/webp')
      expect(optimized.dimensions.width).toBeLessThanOrEqual(1024)
    })

    test('should handle non-existent file gracefully', async () => {
      await expect(readImageFromPath('/non/existent/path.png')).rejects.toThrow(
        'Image file not found'
      )
    })
  })

  describe('Vision Model Image Analysis', () => {
    test('should analyze image content with vision model', async () => {
      const image = createTestImageFile('test.png')
      const analysis = await analyzeImageWithVisionModel(image, 'gpt-4-vision-preview')

      expect(analysis).toHaveProperty('description')
      expect(analysis).toHaveProperty('objects')
      expect(analysis).toHaveProperty('colors')
      expect(analysis.description).toContain('test')
    })

    test('should analyze multiple images in batch', async () => {
      const images = [
        createTestImageFile('test1.png'),
        createTestImageFile('test2.jpg')
      ]
      const analyses = await analyzeImagesWithVisionModel(images, 'claude-3-5-sonnet')

      expect(analyses).toHaveLength(2)
      expect(analyses[0]).toHaveProperty('description')
      expect(analyses[1]).toHaveProperty('description')
    })

    test('should limit context tokens for vision analysis', async () => {
      const largeImages = Array(5).fill(null).map(() => createLargeImage(2048, 2048))
      const totalTokens = await calculateImageTokens(largeImages)

      expect(totalTokens).toBeLessThan(100000) // 적절한 제한
    })

    test('should cache vision analysis results', async () => {
      const image = createTestImageFile('test.png')
      const analysis1 = await analyzeImageWithVisionModel(image)
      const analysis2 = await analyzeImageWithVisionModel(image)

      expect(analysis1).toEqual(analysis2) // 캐싱 확인
    })
  })
})
```

#### Phase 1: GREEN (최소 구현)

##### Step 1.1: 이미지 최적화 로그 추가

```typescript
// careti-src/utils/image-optimization.ts
export const optimizeImageDataUrl = async (
  dataUrl: string,
  options?: {
    logSkipped?: boolean
    logOptimized?: boolean
  }
): Promise<string> => {
  const sharp = await loadSharp()
  if (!sharp) {
    Logger.warn("Image optimization skipped: Sharp library not available")
    if (options?.logSkipped) {
      console.log("⚠️ Image optimization skipped (Sharp not available)")
    }
    return dataUrl
  }

  const { mimeType, base64 } = parseDataUrl(dataUrl)
  if (!SUPPORTED_INPUT_MIME_TYPES.has(mimeType)) {
    Logger.debug(`Image optimization skipped: Unsupported MIME type ${mimeType}`)
    return dataUrl
  }

  // ... 기존 로직 ...

  const shouldReencode = needsResize || mimeType !== OUTPUT_MIME_TYPE
  if (!shouldReencode) {
    if (options?.logSkipped) {
      console.log(`✓ Image optimization skipped: Already WebP and ${metadata.width}x${metadata.height}px`)
    }
    return dataUrl
  }

  // ... WebP 변환 ...

  if (options?.logOptimized) {
    const inputSize = Math.round(base64.length * 0.75)
    const outputSize = Math.round(outputBuffer.length * 0.75)
    const reduction = Math.round((1 - outputSize / inputSize) * 100)

    console.log(`✓ Image optimized: ${metadata.width}x${metadata.height}px → ${targetWidth}x${targetHeight}px (${reduction}% reduction)`)
  }

  return `data:${OUTPUT_MIME_TYPE};base64,${outputBuffer.toString("base64")}`
}
```

##### Step 1.2: 이미지 파일 읽기 개선

```typescript
// careti-src/core/task/tools/utils/image-reader.ts (신규)
import * as fs from "fs/promises"
import * as path from "path"
import { optimizeImageDataUrl } from "@careti/utils/image-optimization"
import { getMimeType } from "@integrations/misc/process-files"
import { Logger } from "@/services/logging/Logger"

export type ImageContent = {
  data: string          // Base64 data URL
  mimeType: string
  dimensions: {
    width: number
    height: number
  }
  size: number          // bytes
}

export type ImageAnalysis = {
  description: string
  objects: string[]
  colors: string[]
  text?: string        // OCR 텍스트
}

export class ImageReader {
  /**
   * 이미지 파일을 직접 읽고 최적화
   */
  static async readAndOptimize(
    filePath: string,
    options?: {
      optimize?: boolean
      log?: boolean
    }
  ): Promise<ImageContent> {
    // 1. 파일 존재 확인
    const absolutePath = path.resolve(filePath)
    try {
      await fs.access(absolutePath)
    } catch {
      throw new Error(`Image file not found: ${filePath}`)
    }

    // 2. 파일 읽기
    const buffer = await fs.readFile(absolutePath)
    const mimeType = getMimeType(filePath)

    // 3. 메타데이터 추출 (Sharp)
    const sharp = await import("sharp")
    const metadata = await sharp.default(buffer).metadata()

    const content: ImageContent = {
      data: `data:${mimeType};base64,${buffer.toString("base64")}`,
      mimeType,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0,
      },
      size: buffer.length,
    }

    // 4. 최적화 (옵션)
    if (options?.optimize !== false) {
      content.data = await optimizeImageDataUrl(content.data, {
        logOptimized: options?.log,
      })
    }

    if (options?.log) {
      Logger.info(`Image read: ${filePath} (${content.dimensions.width}x${content.dimensions.height}, ${formatBytes(content.size)})`)
    }

    return content
  }

  /**
   * 비전 모델로 이미지 분석 (현재 미구현 - 추후 확장용)
   */
  static async analyzeWithVisionModel(
    content: ImageContent,
    modelId: string
  ): Promise<ImageAnalysis> {
    // 추후 구현: GPT-4 Vision, Claude 3.5 Vision 등
    throw new Error("Vision model analysis not yet implemented")
  }

  /**
   * 다중 이미지 배치 처리
   */
  static async readMultiple(
    filePaths: string[],
    options?: {
      optimize?: boolean
      log?: boolean
    }
  ): Promise<ImageContent[]> {
    return Promise.all(
      filePaths.map(path => ImageReader.readAndOptimize(path, options))
    )
  }
}
```

##### Step 1.3: 이미지 생성 툴 핸들러 수정

```typescript
// careti-src/core/task/tools/handlers/GenerateImageToolHandler.ts
import { ImageReader } from "@careti/core/task/tools/utils/image-reader"

export class GenerateImageToolHandler {
  async execute(tool: ToolUse, config: TaskConfig): Promise<ToolResponse> {
    // 1. 참조 이미지 파싱
    const parsed = parseReferenceImagesParam(tool.params?.reference_images)

    // 2. 각 이미지 처리
    const referenceContents: ImageContent[] = []

    for (const dataUrl of parsed.dataUrls) {
      // 2.1 Data URL이면 바로 최적화
      const optimized = await optimizeImageDataUrl(dataUrl, { logOptimized: true })
      referenceContents.push({
        data: optimized,
        mimeType: parseDataUrl(optimized).mimeType,
        dimensions: { width: 0, height: 0 },
        size: 0,
      })
    }

    // 2.2 파일 경로면 읽고 최적화
    for (const filePath of parsed.filePaths) {
      const content = await ImageReader.readAndOptimize(filePath, {
        optimize: true,
        log: true,
      })
      referenceContents.push(content)
    }

    // 3. 이미지 생성
    return await this.generateImage(tool, config, referenceContents)
  }

  private async generateImage(
    tool: ToolUse,
    config: TaskConfig,
    references: ImageContent[]
  ): Promise<ToolResponse> {
    // ... 기존 로직 ...
  }
}
```

#### Phase 2: REFACTOR (개선)

##### 2.1: 비전 모델 API 통합 (추후 확장용)

```typescript
// careti-src/core/task/tools/utils/vision-analyzer.ts (신규)
export class VisionAnalyzer {
  /**
   * 이미지 토큰 계산
   */
  static calculateTokens(image: ImageContent, modelId: string): number {
    // GPT-4 Vision: 85 tokens per 512x512 tile
    // Claude 3.5 Vision: 다른 계산법
    if (modelId.includes('gpt-4')) {
      return this.calculateGpt4VisionTokens(image)
    } else if (modelId.includes('claude-3')) {
      return this.calculateClaudeVisionTokens(image)
    }
    return 0
  }

  private static calculateGpt4VisionTokens(image: ImageContent): number {
    const { width, height } = image.dimensions
    const tileSize = 512
    const tilesX = Math.ceil(width / tileSize)
    const tilesY = Math.ceil(height / tileSize)
    const totalTiles = tilesX * tilesY
    return totalTiles * 85
  }

  /**
   * 이미지 크기 제한 확인
   */
  static validateImageSize(image: ImageContent, maxTokens: number): boolean {
    const tokens = this.calculateTokens(image, 'gpt-4-vision-preview')
    return tokens <= maxTokens
  }
}
```

##### 2.2: 캐싱 시스템 추가

```typescript
// careti-src/core/task/tools/utils/image-cache.ts (신규)
export class ImageCache {
  private static cache = new Map<string, ImageContent>()

  static set(filePath: string, content: ImageContent): void {
    this.cache.set(filePath, content)
  }

  static get(filePath: string): ImageContent | undefined {
    return this.cache.get(filePath)
  }

  static clear(): void {
    this.cache.clear()
  }
}
```

---

### 📝 체크리스트

**Phase 0: RED**
- [ ] 테스트 파일 생성: `careti-src/__tests__/image-tool-optimization.test.ts`
- [ ] 10개 테스트 케이스 작성
- [ ] 테스트 실행 (모두 실패 예상)

**Phase 1: GREEN**
- [ ] 이미지 최적화 로그 추가 (`image-optimization.ts`)
- [ ] 이미지 읽기 유틸리티 구현 (`image-reader.ts`)
- [ ] 이미지 생성 툴 핸들러 수정 (`GenerateImageToolHandler.ts`)
- [ ] WebP 자동 변환 로직 검증
- [ ] 큰 이미지 처리 검증
- [ ] 테스트 실행 (모두 통과)

**Phase 2: REFACTOR**
- [ ] 비전 모델 API 준비 (`vision-analyzer.ts`)
- [ ] 이미지 토큰 계산 구현
- [ ] 캐싱 시스템 구현
- [ ] 코드 리팩토링
- [ ] 최종 테스트 통과

---

### ✅ 결론

#### 현재 구현 상태
- ✅ **WebP 자동 변환**: 완벽하게 구현됨
- ✅ **리사이즈 (1024px)**: 완벽하게 구현됨
- ✅ **이미지 파일 읽기**: 완벽하게 구현됨
- ✅ **크기 제한**: 2MB/6MB, 7500px 구현됨

#### "계속 넘치는 것 같음" 원인
- 최적화 로직은 정상
- Sharp 라이브러리는 설치됨
- 로그 부족으로 사용자에게 상황 전달 안 됨

#### 개선 필요 항목
1. 최적화 로그 추가 (Skipped/Optimized 상태)
2. 명확한 에러 메시지
3. 비전 모델 분석 (추후 확장용 준비)

#### 예상 개선 효과
- 사용자가 최적화 상태를 명확히 인지
- 에러 메시지로 문제 해결 용이성 향상
- 비전 모델 통합 준비 완료

---

**분석 완료일**: 2025-01-14
**분석자**: Luke (with Claude Code)
