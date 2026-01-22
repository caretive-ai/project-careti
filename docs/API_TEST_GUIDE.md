# API 통합 테스트 가이드

Careti의 이미지 분석, 문서 읽기 등 API 기능을 테스트하는 방법입니다.

## 빠른 시작

```bash
# 모든 테스트 실행 (Careti API 제외)
node scripts/test-api-scenarios.js

# 개별 테스트 실행
node scripts/test-api-scenarios.js gemini-text
node scripts/test-api-scenarios.js gemini-image
node scripts/test-api-scenarios.js hwp
node scripts/test-api-scenarios.js document
```

## 환경 설정

`.env` 파일에 다음 토큰을 설정하세요:

```env
GEMINI_TOKEN=your_google_gemini_api_key
CARET_KEY=your_caret_api_key  # 선택사항
```

## 테스트 시나리오

### 1. Gemini 텍스트 API (`gemini-text`)

Google Gemini API 연결 확인.

```bash
node scripts/test-api-scenarios.js gemini-text
```

**예상 결과:**
- ✅ "PONG" 응답 수신

**문제 해결:**
- `GEMINI_TOKEN not found`: .env 파일에 토큰 추가
- `HTTP 401`: 토큰이 유효하지 않음
- `HTTP 429`: Rate limit 초과

---

### 2. Gemini 이미지 분석 (`gemini-image`)

이미지 생성 후 Gemini로 분석.

```bash
node scripts/test-api-scenarios.js gemini-image
```

**테스트 내용:**
1. sharp로 100x100 파란색 이미지 생성
2. Gemini API에 이미지 전송
3. "Blue" 응답 확인

**예상 결과:**
- ✅ AI가 "Blue" 색상 인식

**문제 해결:**
- `sharp module not found`: `npm install` 실행
- `HTTP 400 Invalid image`: 이미지 인코딩 오류

---

### 3. HWP 파싱 (`hwp`)

한글 5.0 문서 파싱 테스트.

```bash
node scripts/test-api-scenarios.js hwp
```

**테스트 내용:**
1. `sample.hwp` 파일 로드
2. `@ohah/hwpjs`로 텍스트 추출
3. 한글 텍스트 포함 확인

**예상 결과:**
- ✅ "사업계획" 텍스트 포함
- ✅ 한글 문자 다수 추출

**문제 해결:**
- `Module not found`: `npm run compile` 먼저 실행
- `hwpjs error`: `npm install @ohah/hwpjs` 확인

---

### 4. 문서 추출 (`document`)

여러 문서 포맷 추출 테스트.

```bash
node scripts/test-api-scenarios.js document
```

**지원 포맷:**
- PDF (pdf-parse)
- DOCX (mammoth)
- HWP (hwpjs)
- HWPX (XML 파싱)
- XLSX, PPTX

**테스트 파일 위치:**
```
careti-src/integrations/document/__tests__/fixtures/
├── sample.hwp
├── sample.pdf
├── sample.docx
└── ...
```

---

## VS Code에서 직접 테스트

### analyze_image 도구 테스트

1. Careti 확장 활성화
2. 채팅에서 다음 입력:
   ```
   이 이미지를 분석해줘: ./path/to/image.png
   무엇이 보이는지 설명해줘.
   ```

3. 확인 사항:
   - 승인 다이얼로그 표시
   - 60초 내 응답 (timeout 적용됨)
   - 분석 결과 표시

### read_document 도구 테스트

1. 채팅에서:
   ```
   이 문서를 읽어줘: ./docs/sample.hwp
   내용을 요약해줘.
   ```

2. 확인 사항:
   - HWP 파일 인식
   - 한글 텍스트 추출
   - AI가 내용 기반 답변

---

## 문제 해결 체크리스트

### 응답이 안 올 때

1. **네트워크 확인**
   ```bash
   curl -I https://generativelanguage.googleapis.com
   ```

2. **토큰 확인**
   ```bash
   echo $GEMINI_TOKEN | head -c 10
   ```

3. **빌드 확인**
   ```bash
   npm run compile
   ```

### 이미지 분석 실패

1. **413 에러 (Request Entity Too Large)**
   - 이미지 크기 확인 (7500px 이하)
   - 서버 nginx 설정 확인

2. **Timeout**
   - 60초 timeout 적용됨
   - 서버 상태 확인

### HWP 파싱 실패

1. **모듈 없음**
   ```bash
   npm install @ohah/hwpjs
   ```

2. **Invalid HWP**
   - 파일이 실제 HWP 5.0 포맷인지 확인
   - HWPX(새 포맷)는 별도 파서 사용

---

## 테스트 파일 추가

새 테스트 케이스 추가:

```
careti-src/integrations/document/__tests__/fixtures/
```

에 파일 추가 후 `test-api-scenarios.js`의 `testFiles` 배열 수정.

---

## CI/CD 통합

GitHub Actions에서 실행:

```yaml
- name: API Integration Tests
  run: |
    npm run compile
    node scripts/test-api-scenarios.js gemini-text
    node scripts/test-api-scenarios.js hwp
  env:
    GEMINI_TOKEN: ${{ secrets.GEMINI_TOKEN }}
```

---

---

## LLM API 프로바이더 테스트

### 개요

각 LLM 프로바이더 API가 정상 동작하는지 개별적으로 테스트할 수 있습니다.

### 환경 설정

`.env` 파일에 테스트할 프로바이더의 API 키를 설정하세요:

```env
# Google Gemini
GEMINI_TOKEN=your_gemini_api_key

# Upstage Solar
UPSTAGE_KEY=your_upstage_api_key

# ZAI (GLM4.7)
ZAI_TOKEN=your_zai_api_key

# Careti
CARET_KEY=your_caret_api_key
```

### 테스트 스크립트 실행

```bash
# Upstage Solar API 테스트
node scripts/test-upstage-api.js

# GLM4.7 스트리밍 테스트
node scripts/test-glm47-streaming.js

# Hook & Skill 통합 테스트
node scripts/test-api-hook-skill.js
```

### 개별 프로바이더 테스트

#### 1. Upstage Solar (`test-upstage-api.js`)

```bash
node scripts/test-upstage-api.js
```

**테스트 내용:**
- 스트리밍 모드 응답 확인
- 논스트리밍 모드 응답 확인
- 토큰 사용량 확인

**예상 결과:**
```
============================================================
Test Summary:
- Streaming: ✅ PASS
- Non-streaming: ✅ PASS
============================================================
```

#### 2. GLM4.7/ZAI (`test-glm47-streaming.js`)

```bash
node scripts/test-glm47-streaming.js
```

**중요 설정:**
- 엔드포인트: `https://api.z.ai/api/coding/paas/v4/chat/completions`
- `stream: true` 필수
- `thinking.type: "enabled"` 필수
- `max_tokens: 500` 이상 권장

#### 3. Hook & Skill 통합 (`test-api-hook-skill.js`)

```bash
node scripts/test-api-hook-skill.js
```

**테스트 내용:**
- API 연결 확인
- Hook 시스템 동작 확인
- Skill 도구 호출 확인

---

## 새 프로바이더 테스트 스크립트 만들기

### 템플릿 구조

```javascript
// scripts/test-{provider}-api.js

const fs = require('fs');
const path = require('path');

// .env 로드
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2];
        }
    });
}

const API_KEY = process.env.{PROVIDER}_KEY;

async function testStreamingAPI() {
    console.log('=== Streaming Test ===');

    const response = await fetch('{API_ENDPOINT}', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: '{MODEL_ID}',
            messages: [{ role: 'user', content: 'Hello!' }],
            max_tokens: 100,
            stream: true,
        }),
    });

    // SSE 스트리밍 처리
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) process.stdout.write(content);
            } catch {}
        }
    }
    console.log('\n✅ Streaming test passed!');
}

testStreamingAPI().catch(console.error);
```

### 체크리스트

새 프로바이더 테스트 스크립트 작성 시:

1. **환경 변수**: `.env`에서 API 키 로드
2. **엔드포인트**: 프로바이더별 정확한 URL 확인
3. **인증 방식**: Bearer 토큰, API 키 헤더 등
4. **스트리밍**: SSE 처리 로직 구현
5. **에러 처리**: HTTP 상태 코드별 메시지

---

## 관련 파일

| 파일 | 설명 |
|------|------|
| `scripts/test-api-scenarios.js` | 통합 테스트 스크립트 |
| `scripts/test-upstage-api.js` | Upstage Solar API 테스트 |
| `scripts/test-glm47-streaming.js` | GLM4.7 스트리밍 테스트 |
| `scripts/test-api-hook-skill.js` | Hook & Skill 통합 테스트 |
| `careti-src/core/task/tools/handlers/AnalyzeImageToolHandler.ts` | 이미지 분석 핸들러 |
| `careti-src/core/task/tools/handlers/ReadDocumentToolHandler.ts` | 문서 읽기 핸들러 |
| `careti-src/integrations/document/hwp-parser.ts` | HWP 파서 |
| `careti-src/integrations/document/document-extractor.ts` | 문서 추출기 |
