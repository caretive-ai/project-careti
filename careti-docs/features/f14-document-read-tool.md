# F15 - Document Read Tool (문서 읽기 도구)

**상태**: ✅ 구현 완료
**영향 범위**: Core Task/Tool, Integrations, System Prompt
**우선순위**: 🟡 Medium

---

## 📋 개요

문서 읽기 도구(`read_document`)는 LLM이 다양한 문서 파일을 **경로만으로** 읽을 수 있게 하는 Careti 전용 기능입니다.

### Careti만의 차별점

| 기능 | Cline | Careti |
|------|-------|-------|
| PDF 읽기 | 사용자 첨부 시에만 | **LLM이 경로로 직접 읽기 가능** |
| DOCX/XLSX 읽기 | 사용자 첨부 시에만 | **LLM이 경로로 직접 읽기 가능** |
| HWPX (한글) | 미지원 | **지원** |
| HWP 5.0 (구형 한글) | 미지원 | **지원** |
| PPTX | 미지원 | **지원** |
| IPYNB | 미지원 | **지원** |

### 사용 시나리오

```
사용자: 이 프로젝트의 docs/spec.pdf 분석해줘
LLM: [read_document 도구 사용] → PDF 내용 추출 → 분석 결과 제공
```

---

## 🔧 지원 형식

| 형식 | 확장자 | 파서 | 비고 |
|------|--------|------|------|
| PDF | `.pdf` | pdf-parse | 기존 Cline 라이브러리 |
| Word | `.docx` | mammoth | 기존 Cline 라이브러리 |
| Excel | `.xlsx` | exceljs | 기존 Cline 라이브러리 |
| PowerPoint | `.pptx` | Careti 자체 구현 | ZIP + XML 파싱 |
| 한글 (신형) | `.hwpx` | Careti 자체 구현 | ZIP + XML 파싱 |
| 한글 (구형) | `.hwp` | @ohah/hwpjs | WASM 기반, 모든 OS 지원 |
| Jupyter | `.ipynb` | JSON parse | 기존 Cline 방식 |

### 미지원 형식 (감지 시 친절한 에러 메시지 + 변환 방법 안내)

| 형식 | 확장자 | 미지원 이유 | 에러 메시지 안내 |
|------|--------|------------|-----------------|
| PowerPoint 97-2003 | `.ppt` | OLE Compound Document 바이너리 포맷. 순수 JS 파서가 없음 (SheetJS js-ppt 시도했으나 파싱 에러 발생) | LibreOffice, Google Slides, MS PowerPoint로 .pptx 변환 권장 |
| Word 97-2003 | `.doc` | OLE Compound Document 바이너리 포맷. 순수 JS 파서가 없음 | LibreOffice, Google Docs, MS Word로 .docx 변환 권장 |
| Excel 97-2003 | `.xls` | OLE Compound Document 바이너리 포맷. 순수 JS 파서가 없음 | LibreOffice, Google Sheets, MS Excel로 .xlsx 변환 권장 |

> **참고**: LibreOffice를 외부 의존성으로 사용하는 방안을 검토했으나, VSCode 플러그인 특성상 멀티OS(Windows/macOS/Linux)에서 설치 경로가 다르고 사용자 설치를 강제할 수 없어 채택하지 않았습니다.

---

## 🧱 핵심 데이터 흐름

### 문서 읽기 요청

```
LLM → read_document(path="docs/spec.pdf")
    → ReadDocumentToolHandler.execute()
    → DocumentExtractor.extract()
    → 형식별 파서 호출
    → 텍스트 반환
```

### 도구 파라미터

```typescript
interface ReadDocumentParams {
  path: string           // 문서 경로 (필수, 상대/절대 경로)
  task_progress?: string // 작업 진행 상황 (선택)
}
```

---

## 🔒 보안

### Path Traversal 보호
- `path.normalize()`: 경로 정규화로 `..` 시퀀스 해결
- `isLocatedInPath()`: 워크스페이스 내부 여부 확인 및 로깅
- 파일 확장자 검증: 지원 형식만 허용

### 파일 크기 제한
- 최대 50MB (`DEFAULT_MAX_FILE_SIZE`)
- 초과 시 명확한 에러 메시지 반환

### Zip Slip 방지
- HWPX/PPTX 파싱 시 고정된 경로만 접근
  - HWPX: `Preview/PrvText.txt`, `Contents/section*.xml`
  - PPTX: `ppt/slides/slide*.xml`
- 디스크에 파일 추출 없음 (메모리에서만 처리)

### 승인 동작
- **읽기 전용** 작업이므로 자동 승인
- 워크스페이스 외부 파일도 읽기 가능 (경고 로그 기록)

---

## 🧩 주요 파일 맵

### Tool Handler
- `careti-src/core/task/tools/handlers/ReadDocumentToolHandler.ts`
  - `IFullyManagedTool` 인터페이스 구현
  - 경로 검증, 형식 확인, 추출 결과 반환

### Document Extractor
- `careti-src/integrations/document/document-extractor.ts`
  - 형식별 파서 통합 관리
  - 파일 크기 제한 적용

### 형식별 파서
- `careti-src/integrations/document/hwpx-parser.ts`
  - HWPX (한글) ZIP 구조에서 텍스트 추출
  - `Preview/PrvText.txt` 우선, XML 파싱 fallback
- `careti-src/integrations/document/hwp-parser.ts`
  - HWP 5.0 (구형 한글) 바이너리 파싱
  - @ohah/hwpjs 라이브러리 사용 (Rust→WASM)
- `careti-src/integrations/document/pptx-parser.ts`
  - PPTX 슬라이드에서 `<a:t>` 태그 텍스트 추출

### 타입 정의
- `careti-src/integrations/document/types.ts`
  - `DocumentFormat`, `ExtractOptions`, `ExtractResult`

### 시스템 프롬프트
- `careti-src/core/prompts/system-prompt/tools/read_document.ts`
  - 도구 설명 및 파라미터 정의

### 테스트
- `careti-src/integrations/document/__tests__/`
  - `document-extractor.test.ts` (15개 테스트)
  - `hwpx-parser.test.ts` (7개 테스트)
  - `hwp-parser.test.ts` (6개 테스트) - HWP 5.0 파싱
  - `pptx-parser.test.ts` (9개 테스트)
  - `ppt-parser.test.ts` (3개 테스트) - 레거시 PPT 감지 및 에러 메시지

---

## 📦 의존성 및 오픈소스 라이센스

### 사용 라이브러리

| 라이브러리 | 버전 | 라이센스 | 용도 | 저장소 |
|-----------|------|---------|------|--------|
| pdf-parse | ^1.1.1 | MIT | PDF 텍스트 추출 | [github.com/modesty/pdf-parse](https://github.com/modesty/pdf-parse) |
| mammoth | ^1.8.0 | BSD-2-Clause | DOCX 텍스트 추출 | [github.com/mwilliamson/mammoth.js](https://github.com/mwilliamson/mammoth.js) |
| exceljs | ^4.4.0 | MIT | XLSX 텍스트 추출 | [github.com/exceljs/exceljs](https://github.com/exceljs/exceljs) |
| jszip | ^3.10.1 | MIT/GPLv3 dual | HWPX/PPTX ZIP 파싱 | [github.com/Stuk/jszip](https://github.com/Stuk/jszip) |
| @ohah/hwpjs | latest | MIT | HWP 5.0 파싱 (WASM) | [npmjs.com/package/@ohah/hwpjs](https://www.npmjs.com/package/@ohah/hwpjs) |

### 참조 프로젝트 (코드 직접 사용 안함)

구현 시 다음 프로젝트를 참조하여 문서 구조를 분석했습니다:

| 프로젝트 | 라이센스 | 참조 내용 | 저장소 |
|---------|---------|----------|--------|
| MarkItDown | MIT (Microsoft) | 문서→Markdown 변환 아이디어 | [github.com/microsoft/markitdown](https://github.com/microsoft/markitdown) |
| pypandoc-hwpx | MIT | HWPX 문서 구조 이해 | [github.com/msjang/pypandoc-hwpx](https://github.com/msjang/pypandoc-hwpx) |

### 라이센스 고지

```
pdf-parse
---------
Copyright (c) 2017 modesty

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
License: MIT

mammoth.js
----------
Copyright (c) 2013-2023, Michael Williamson
All rights reserved.
License: BSD-2-Clause

ExcelJS
-------
Copyright (c) 2014-2023 ExcelJS contributors
License: MIT

JSZip
-----
Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso
License: MIT or GPLv3 (dual license)

@ohah/hwpjs
-----------
HWP parser for Node.js, Web, and React Native
Rust로 구현된 핵심 로직을 WASM으로 컴파일
License: MIT
```

---

## ⚙️ 설정

### 도구 활성화
- 기본적으로 활성화됨
- 별도의 설정 토글 없음 (읽기 전용이므로)

### ExtensionState
```typescript
// src/shared/ExtensionMessage.ts
interface ClineSayTool {
  tool: "readDocument" | ...
  // ...
}
```

---

## ✅ 구현 완료 상태

**순수 JavaScript/WASM으로 구현 가능한 모든 문서 형식을 지원합니다.**

| 카테고리 | 지원 형식 | 구현 방식 |
|---------|----------|----------|
| PDF | `.pdf` | pdf-parse (Node.js) |
| Microsoft Office (신형) | `.docx`, `.xlsx`, `.pptx` | mammoth, exceljs, ZIP+XML |
| 한글 (신형/구형) | `.hwpx`, `.hwp` | ZIP+XML, @ohah/hwpjs (WASM) |
| Jupyter | `.ipynb` | JSON parse |

---

## ⚠️ 알려진 제한사항

### 1. 레거시 바이너리 포맷 미지원

| 형식 | 미지원 이유 | 시도한 라이브러리 | 결과 |
|------|------------|------------------|------|
| `.ppt` | OLE Compound Document | SheetJS js-ppt, ole-doc | 파싱 에러 발생 |
| `.doc` | OLE Compound Document | 순수 JS 라이브러리 없음 | - |
| `.xls` | OLE Compound Document | 순수 JS 라이브러리 없음 | - |

**대안 검토 결과:**
- **LibreOffice headless**: 멀티OS에서 설치 경로 다름, 사용자 설치 강제 불가
- **LibreOffice WASM**: 아직 실험적, 수백 MB 크기로 플러그인에 부적합
- **Python 브릿지**: Python 런타임 필요, 외부 의존성 증가

→ **결론**: `.ppt`, `.doc`, `.xls` 파일은 감지 시 친절한 에러 메시지와 변환 방법을 안내합니다.

### 2. 이미지/차트 미포함
- 문서 내 이미지, 차트는 텍스트로 변환 불가
- 텍스트 콘텐츠만 추출

### 3. 복잡한 레이아웃
- 표, 다단 레이아웃 등은 단순 텍스트로 변환됨
- 원본 서식 정보 손실

---

## 🔄 Cline 머징 가이드

### 충돌 없는 파일 (Careti 전용)
- `careti-src/` 하위 모든 파일
- `read_document` 관련 코드

### 주의 필요 파일
- `src/core/task/ToolExecutor.ts` - 핸들러 등록 부분
- `src/shared/tools.ts` - `READ_DOCUMENT` enum 추가
- `src/shared/ExtensionMessage.ts` - `"readDocument"` 타입 추가
- `src/core/prompts/system-prompt/tools/init.ts` - variants 등록
- `src/core/prompts/system-prompt/tools/index.ts` - export 추가

---

**최종 업데이트**: 2026-01-16
**문서 버전**: v1.3 (HWP 5.0 지원 추가, 레거시 포맷 에러 메시지에 변환 방법 안내 추가, 구현 완료 상태 명시)
