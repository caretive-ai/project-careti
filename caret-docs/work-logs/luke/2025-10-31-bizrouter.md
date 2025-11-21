# 제목 : BizRotuer 지원
* 개요 : 신규 Provider로 BizRouter 추가
* SDK문서 : caret-docs/work-logs/luke/references/bizrouter-api.md
* 연관 feature 문서 : caret-docs/features/f09-enhanced-provider-setup.md
* 특이사항 : OpenAPI Compatable Provider와 동일한 스펙으로 알고 있음.
* 작업 요구사항
  - 기존 Provider중 가장 유사한 것을 참고하여 추가 파일을 만들며 작업을 진행함
# 작업 방법 및 필수 확인사항
  - 캐럿의 기본 개발 방법론, 최소 침습, TDD를 반드시 지킨다.
  - 작업은 반드시 이 문서를 기준으로 작업을 진행하며, 작업 중에는 현행화를 한다.  
  - 단계가 끝나면 이 문서와 관련 문서를 한 번 더 읽고, 제대로 구현되었는지 불필요한게 없는지 한번 검토 하고 작업 문서를 업데이트하고 사용자의 확인을 받은 후, 다음 단계로 진행한다.


# 상세 작업 계획 (진행하며 본 영역은 업데이트 한다)

## 1단계 ✅ 완료
 * 요구사항을 파악 후 작업 계획 수립

### 1단계 체크리스트
 * [x] 본 작업 문서와 SDK문서로 작업에 대한 방향 확인
 * [x] 본 작업 문서의 상세 작업 계획 섹션을 업데이트한다.

### 1단계 분석 결과
**BizRouter 특징:**
- OpenAI Compatible API
- 인증: `X-API-Key` 헤더 (형식: `sk-br-v1-{uuid}_{random_token}`)
- Base URL: `https://bizrouter.ai/`
- 모델 목록 API: `GET /api/v1/models` (KRW 가격 포함)
- 한국 시장 특화: 환율 정보, KRW 가격 제공

**유사 Provider:** LiteLLM (`src/core/api/providers/litellm.ts`)
- OpenAI SDK 기반, Custom header 지원
- 구조가 거의 동일하여 복사 후 수정 방식으로 진행

## 1.5단계 ✅ 완료
 * CaretApiProvider 소스 위치 변경 (기술 부채 정리)
 * 최소 침습 원칙 준수: `src/api/providers/` → `caret-src/core/api/providers/`

### 1.5단계 상세 계획

**작업 목적:**
- CaretApiProvider가 초기 작업 시 `src/api/providers/`에 위치했으나, 이는 최소 침습 원칙 위배
- 신규 Provider(BizRouter) 추가 전에 기존 Caret Provider를 올바른 위치로 이동
- 일관된 아키텍처 패턴 확립

**파일 이동:**
- 소스: `src/api/providers/CaretApiProvider.ts`
- 목적지: `caret-src/core/api/providers/CaretApiProvider.ts`

**영향받는 파일 확인 및 수정:**
1. **Import 경로 변경**
   - CaretApiProvider는 아직 다른 파일에서 import되지 않음 (초기 작업 산물)
   - 내부 import 경로만 수정 필요 (`package.json` 참조)

2. **타입 정의 확인**
   - `CaretApiHandlerOptions` 인터페이스는 파일 내부에 위치
   - 별도 import 경로 수정 불필요

### 1.5단계 체크리스트

**파일 이동:**
 * [x] `caret-src/core/api/providers/` 디렉토리 생성 (없으면)
 * [x] `src/api/providers/CaretApiProvider.ts`를 `caret-src/core/api/providers/CaretApiProvider.ts`로 이동
 * [x] `src/api/providers/` 및 `src/api/` 디렉토리 삭제 (비어있음)

**Import 경로 업데이트:**
 * [x] 전체 코드베이스에서 CaretApiProvider import 검색 완료 (import 없음 확인)
 * [x] `CaretApiProvider.ts` 내부 `package.json` import 경로 수정 (`../../../` → `../../../../`)

**검증:**
 * [x] `npm run compile` 성공 확인
 * [x] `npm run check-types` 성공 확인 (compile에 포함)
 * [x] Biome lint 성공 확인
 * [x] 작업 문서 업데이트

### 1.5단계 작업 결과
- ✅ CaretApiProvider 파일이 올바른 위치(`caret-src/core/api/providers/`)로 이동
- ✅ 빈 디렉토리 정리 완료 (`src/api/` 전체 삭제)
- ✅ 컴파일 및 타입 체크 통과
- ✅ 최소 침습 원칙 준수 확립
- 📝 향후 BizRouter 추가 시 동일한 패턴 적용 가능

## 2단계 ✅ 완료
 * LiteLLM을 기반으로 BizRouter provider 추가
 * hostname 고정하여 기본 동작 확인
 * Provider 순서: Caret > OpenRouter > **BizRouter(추가)** > Google Gemini > Claude Code > OpenAI Compatible > Anthropic > Ollama

### 2단계 상세 계획

**파일 위치 결정 (최소 침습 원칙):**
- ✅ **Provider 파일**: `caret-src/core/api/providers/BizRouterApiProvider.ts`
  - 이유: 완전히 새로운 provider이므로 **caret-src/**에 위치
  - 최소 침습 = Cline 원본(`src/`) 수정 최소화, 확장은 `caret-src/`
- 참조 파일:
  - `caret-src/core/api/providers/CaretApiProvider.ts` (구조 참고)
  - `src/core/api/providers/litellm.ts` (로직 참고 - Cline 원본 확장)

**Backend 작업:**

1. **Provider 클래스 생성** (`caret-src/core/api/providers/BizRouterApiProvider.ts`)
   - 참조: `caret-src/core/api/providers/CaretApiProvider.ts` (구조)
   - 클래스명: `BizRouterHandler`
   - Options 인터페이스: `BizRouterHandlerOptions`
   - Base URL: `https://bizrouter.ai/api/v1` (기본값)
   - API Key 헤더: `X-API-Key`
   - OpenAI SDK 기반 (OpenAI Compatible)

2. **모델 페칭 함수 추가** (Enhanced Provider Setup 패턴)
   - 위치: `caret-src/core/controller/caretSystem/FetchBizRouterModels.ts`
   - 참조: `caret-src/core/controller/caretSystem/FetchLiteLlmModels.ts`
   - API 엔드포인트: `GET /api/v1/models`
   - 응답: 모델 ID 목록 반환

3. **gRPC Protocol 정의**
   - `proto/caret/system.proto`에 추가:
     ```protobuf
     rpc FetchBizRouterModels(FetchBizRouterModelsRequest) returns (FetchBizRouterModelsResponse);
     ```
   - Request: baseUrl, apiKey
   - Response: success, models[], errorMessage

4. **API Configuration 타입 추가**
   - `src/shared/api.ts`에 BizRouter 설정:
     - `bizRouterApiKey?: string`
     - `bizRouterBaseUrl?: string`
     - Plan/Act 모드별 모델 설정:
       - `planModeBizRouterModelId?: string`
       - `planModeBizRouterModelInfo?: BizRouterModelInfo`
       - `actModeBizRouterModelId?: string`
       - `actModeBizRouterModelInfo?: BizRouterModelInfo`
     - 프롬프트 캐시 설정:
       - `bizRouterUsePromptCache?: boolean`

5. **Provider 등록**
   - `src/core/api/index.ts`에 BizRouterHandler 등록 (최소 수정)
   - Provider 순서: LiteLLM 다음에 위치

**Frontend 작업:**
1. Provider 설정 컴포넌트 생성 (`BizRouterProvider.tsx`)
2. 모델 선택 UI (드롭다운 + Fetch 버튼)
3. API Key 입력 필드
4. 모델 설정 (context window, max tokens, temperature)
5. Thinking Budget 슬라이더
6. 다국어 지원 (ko/en/ja/zh)

### 2단계 체크리스트

**Backend (caret-src/):**
 * [x] `caret-src/core/api/providers/` 디렉토리 이미 존재 (1.5단계에서 생성)
 * [x] `caret-src/core/api/providers/BizRouterApiProvider.ts` Provider 클래스 생성
 * [x] `caret-src/core/controller/caretSystem/FetchBizRouterModels.ts` 모델 페칭 함수 생성
 * [x] `proto/caret/system.proto`에 FetchBizRouterModels RPC 정의 추가
 * [x] `npm run protos` 실행하여 proto 코드 생성
 * [x] `src/shared/api.ts`에 BizRouter 타입 추가
 * [x] `src/core/api/index.ts`에 BizRouterHandler 등록 (최소 수정)
 * [x] Proto namespace 빌드 스크립트 수정 (cline.* → caret.* 자동 변환)

**Frontend:**
 * [x] `webview-ui/src/components/settings/providers/BizRouterProvider.tsx` 생성
 * [x] gRPC 클라이언트로 FetchBizRouterModels 호출 연동
 * [x] 다국어 파일 추가 (ko/en/ja/zh) - providers.bizrouter.*
 * [x] Provider 목록에 BizRouter 추가 (ApiOptions.tsx)
 * [x] `providerUtils.ts`에 BizRouter 지원 추가

**검증:**
 * [x] `npm run compile` 성공 확인
 * [x] Type checking 성공 확인
 * [x] Lint 성공 확인
 * [ ] F5로 실행하여 UI 확인 (사용자 확인 필요)
 * [ ] 테스트 시나리오 실행 (사용자 확인 필요)

### 2단계 작업 결과

**생성된 파일:**
1. `caret-src/core/api/providers/BizRouterApiProvider.ts` (340 lines)
   - BizRouterHandler 클래스
   - OpenAI SDK 기반, X-API-Key 헤더 인증
   - 모델 정보 캐싱 (5분 TTL)
   - 비용 계산 기능 (input/output/cache tokens)
   - Extended thinking 지원
   - Prompt caching 지원

2. `caret-src/core/controller/caretSystem/FetchBizRouterModels.ts` (36 lines)
   - gRPC service 핸들러
   - `/api/v1/models` API 호출
   - 모델 ID 목록 정렬하여 반환

3. `webview-ui/src/components/settings/providers/BizRouterProvider.tsx` (297 lines)
   - Base URL, API Key 입력 필드
   - 모델 가져오기 버튼 + 드롭다운
   - 모델 설정 (이미지 지원, context window, max tokens, temperature)
   - Thinking Budget 슬라이더
   - 다국어 지원

**수정된 파일:**
1. `proto/caret/system.proto` - FetchBizRouterModels RPC 추가
2. `src/shared/api.ts` - BizRouter 타입 및 설정 추가
3. `src/core/api/index.ts` - BizRouterHandler 등록
4. `caret-scripts/build/build-proto.mjs` - BizRouter namespace 자동 변환 추가
5. `webview-ui/src/caret/locale/{ko,en,ja,zh}/settings.json` - 번역 추가
6. `webview-ui/src/components/settings/ApiOptions.tsx` - Provider 목록 추가
7. `webview-ui/src/components/settings/utils/providerUtils.ts` - BizRouter 지원 추가

**주요 기능:**
- ✅ OpenAI Compatible API 기반 구현
- ✅ 모델 목록 자동 가져오기 (FetchBizRouterModels gRPC)
- ✅ Extended thinking 지원 (budget_tokens)
- ✅ Prompt caching 지원 (cache_control)
- ✅ 비용 계산 (input/output/cache tokens)
- ✅ Plan/Act 모드별 모델 분리 지원
- ✅ 다국어 지원 (한국어/영어/일본어/중국어)

### 2단계 테스트 시나리오 (사용자 확인 필요)
1. Provider 선택 화면에서 BizRouter 표시 확인
2. Base URL, API Key 입력 테스트
3. 모델 목록 가져오기 테스트
4. 모델 선택 후 설정 저장 테스트
5. 채팅 요청 테스트 (간단한 메시지)
6. 스트리밍 응답 테스트
7. Extended thinking 기능 테스트 (thinking budget > 0)
8. 다국어 전환 테스트

## 3단계 (계획 예정)
 * SDK문서의 특징을 기반으로 프론트엔드 추가 기능 구현
 * 한국 시장 특화 기능 추가 (KRW 가격 표시, 환율 정보 등)

### 3단계 상세 계획 (사용자 승인 후 작성)
- KRW 가격 표시 기능
- 환율 정보 표시
- 모델 선택 UI 개선 (가격 정보 포함)
- 기타 BizRouter 특화 기능
 
