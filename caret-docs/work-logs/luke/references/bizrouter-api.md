BizRouter API 문서
BizRouter는 OpenAI와 호환되는 API를 제공하는 한국 시장 특화 LLM 게이트웨이입니다. 여러 LLM 제공업체(OpenAI, Anthropic, Google Gemini)에 통합 접근이 가능하며, 기업용 기능인 사용량 추적, 요금 제한, 보안 기능을 제공합니다.

빠른 시작
BizRouter API를 사용하여 첫 번째 요청 보내기
cURL
Python
JavaScript
bash
curl https://bizrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk-br-v1-YOUR_API_KEY" \
  -d '{
    "model": "openai/gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": "안녕하세요! BizRouter API 테스트입니다."
      }
    ]
  }'
주요 기능
🔐 엔터프라이즈급 보안
API 키 기반 인증
개인정보 자동 마스킹 (주민번호, 여권번호)
사내 금지어 필터링
PIPA 규정 준수
📊 사용량 관리
실시간 사용량 추적
조직/API 키별 크레딧 제한
자동 요금 계산 (KRW)
사용량 통계 대시보드
🚀 고성능 프록시
Rust 기반 고성능 구현
SSE 스트리밍 지원
가중치 기반 로드 밸런싱
자동 장애 복구
🔧 OpenAI 호환성
기존 OpenAI SDK 그대로 사용 가능
추가 파라미터 지원 (top_k, repetition_penalty)
다중 모델 제공업체 통합
일관된 에러 처리
API 엔드포인트
기본 URL
text
https://bizrouter.ai/
주요 엔드포인트
POST /api/v1/chat/completions
채팅 형식의 대화형 AI 응답 생성 (OpenAI 호환)

POST /api/v1/completions
레거시 텍스트 완성 API (하위 호환성)

GET /api/v1/models
사용 가능한 모델 목록과 가격 정보 조회
--
인증
BizRouter API는 안전한 접근을 위해 API 키 기반 인증을 사용합니다. 모든 API 요청에는 유효한 API 키가 필요합니다.

API 키 형식
BizRouter API 키 구조와 특징
BizRouter API 키는 다음과 같은 형식을 따릅니다:

text
sk-br-v1-{uuid}_{random_token}
구성 요소:
sk-br-v1 - BizRouter API 키 접두사
{uuid} - 고유 식별자 (UUID v4)
{random_token} - 보안 랜덤 토큰
보안 참고사항
API 키는 SHA-256 해시로 저장되며, 생성 시에만 전체 키를 확인할 수 있습니다. 키를 안전하게 보관하고 절대 공개 저장소에 커밋하지 마세요.
인증 방법
API 요청에 인증 정보를 포함하는 방법
1. HTTP 헤더 인증 (권장)
X-API-Key 헤더에 API 키를 포함합니다.

bash
curl https://bizrouter.ai/api/v1/chat/completions \
  -H "X-API-Key: sk-br-v1-YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "openai/gpt-4o", "messages": [...]}'
2. 쿠키 기반 인증 (웹 전용)
웹 애플리케이션에서는 세션 쿠키를 통한 인증도 지원됩니다. 이는 주로 BizRouter 웹 콘솔에서 모델 테스트 시 사용됩니다.

참고
쿠키 인증은 브라우저 환경에서만 사용 가능하며, 일반 API 통합에는 API 키 인증을 사용하세요.
3. 선택적 헤더
추가 컨텍스트를 위한 선택적 헤더를 포함할 수 있습니다:

X-Title
애플리케이션 이름을 지정하여 사용량 추적에 활용

API 키 관리
API 키 생성, 관리 및 보안 모범 사례
API 키 생성
BizRouter 대시보드에 로그인
설정 > API 키 메뉴로 이동
"새 API 키 생성" 버튼 클릭
키 이름과 선택적 크레딧 한도 설정
생성된 키를 안전한 곳에 저장 (다시 확인 불가)
보안 모범 사례
환경 변수를 통해 API 키 관리
소스 코드에 하드코딩 금지
정기적인 키 순환 (rotate)
최소 권한 원칙 적용
키별 크레딧 한도 설정
환경 변수 예시
bash
# .env 파일
BIZROUTER_API_KEY=sk-br-v1-YOUR_API_KEY

# 사용 예시 (Python)
import os
api_key = os.getenv('BIZROUTER_API_KEY')
OpenAI SDK 사용
기존 OpenAI 클라이언트를 BizRouter와 함께 사용하기
BizRouter는 OpenAI API와 호환되므로 기존 OpenAI SDK를 그대로 사용할 수 있습니다.

Python 예시
python
from openai import OpenAI

# BizRouter 엔드포인트와 API 키 설정
client = OpenAI(
    api_key="sk-br-v1-YOUR_API_KEY",
    base_url="https://bizrouter.ai/api/v1"
)

# 일반적인 OpenAI API 사용법과 동일
response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[
        {"role": "user", "content": "안녕하세요!"}
    ]
)

print(response.choices[0].message.content)
Node.js 예시
javascript
import OpenAI from 'openai';

// BizRouter 설정
const openai = new OpenAI({
  apiKey: 'sk-br-v1-YOUR_API_KEY',
  baseURL: 'https://bizrouter.ai/api/v1'
});

// API 호출
const response = await openai.chat.completions.create({
  model: 'openai/gpt-4o',
  messages: [
    { role: 'user', content: '안녕하세요!' }
  ]
});

console.log(response.choices[0].message.content);
권한 및 제한
API 키의 권한 범위와 사용 제한
API 키 권한
조직 내 모든 모델에 대한 접근
생성한 사용자의 권한 범위 내에서 작동
owner 권한: 모든 API 키 관리 가능
member 권한: 본인 API 키만 관리 가능
사용 제한
조직별 월 사용량 한도
API 키별 크레딧 한도 (선택적)
분당 요청 수 제한 (Rate Limiting)
동시 요청 수 제한
크레딧 시스템
BizRouter는 선불(prepaid) 또는 후불(postpaid) 크레딧 시스템을 사용합니다. 크레딧이 소진되거나 한도에 도달하면 403 Forbidden 에러가 반환됩니다.

--
모델 목록 API
BizRouter에서 사용 가능한 모든 AI 모델의 목록을 조회합니다. 각 모델의 사양, 가격 정보를 USD와 KRW로 제공하며 실시간 환율을 포함합니다.

API 엔드포인트
모델 목록을 조회하기 위한 엔드포인트
GET /api/v1/models
사용 가능한 모든 모델의 목록과 상세 정보를 반환합니다.

인증 필수
이 API는 유효한 API 키를 통한 인증이 필요합니다. X-API-Key 헤더에 API 키를 포함해야 합니다.
요청 예시
모델 목록을 조회하는 다양한 방법
cURL
Python
JavaScript
bash
curl https://bizrouter.ai/api/v1/models \
  -H "X-API-Key: sk-br-v1-YOUR_API_KEY"
응답 형식
API 응답 구조와 필드 설명
응답 스키마
typescript
interface ModelListResponse {
  models: ModelInfo[];
  exchange_rate: number;  // USD to KRW 환율
}

interface ModelInfo {
  id: string;                      // 모델 코드 (예: "openai/gpt-4o")
  name: string;                    // 모델 이름 (예: "GPT-4o")
  context_length: number;          // 입력 컨텍스트 크기 (토큰)
  max_output_tokens: number;       // 최대 출력 토큰 수
  input_price_per_1m_usd: number;  // USD 입력 가격 (100만 토큰당)
  output_price_per_1m_usd: number; // USD 출력 가격 (100만 토큰당)
  input_price_per_1m_krw: number;  // KRW 입력 가격 (100만 토큰당)
  output_price_per_1m_krw: number; // KRW 출력 가격 (100만 토큰당)
}
응답 예시
json
{
  "models": [
    {
      "id": "openai/gpt-4o",
      "name": "GPT-4o",
      "context_length": 128000,
      "max_output_tokens": 16384,
      "input_price_per_1m_usd": 2.5,
      "output_price_per_1m_usd": 10.0,
      "input_price_per_1m_krw": 3375.0,
      "output_price_per_1m_krw": 13500.0
    },
    {
      "id": "anthropic/claude-3-5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "context_length": 200000,
      "max_output_tokens": 8192,
      "input_price_per_1m_usd": 3.0,
      "output_price_per_1m_usd": 15.0,
      "input_price_per_1m_krw": 4050.0,
      "output_price_per_1m_krw": 20250.0
    },
    {
      "id": "google/gemini-1.5-pro",
      "name": "Gemini 1.5 Pro",
      "context_length": 2097152,
      "max_output_tokens": 8192,
      "input_price_per_1m_usd": 1.25,
      "output_price_per_1m_usd": 5.0,
      "input_price_per_1m_krw": 1687.5,
      "output_price_per_1m_krw": 6750.0
    }
  ],
  "exchange_rate": 1350.0
}
필드 설명
각 필드의 상세 설명
모델 사양 필드
id
모델의 고유 식별자. Chat Completions API 호출 시 model 파라미터에 사용됩니다. 형식: "provider/model-name"

context_length
모델이 한 번에 처리할 수 있는 최대 입력 토큰 수. 프롬프트와 이전 대화 내역을 포함한 전체 입력이 이 제한을 초과하면 에러가 발생합니다.

max_output_tokens
모델이 생성할 수 있는 최대 출력 토큰 수.max_tokens 파라미터는 이 값을 초과할 수 없습니다.

가격 정보 필드
*_price_per_1m_usd
100만 토큰당 USD 가격. 입력(input)과 출력(output) 가격이 별도로 책정됩니다. 실제 요금은 사용한 토큰 수에 비례하여 계산됩니다.

*_price_per_1m_krw
100만 토큰당 KRW 가격. USD 가격에 환율을 적용한 값입니다. 환율은 주기적으로 업데이트되며, 응답의 exchange_rate 필드에서 확인할 수 있습니다.

exchange_rate
현재 적용된 USD to KRW 환율. 모든 KRW 가격은 이 환율을 기준으로 계산됩니다.

가격 계산 예시
토큰 사용량에 따른 요금 계산 방법
요금 계산 공식
입력 요금 = (입력 토큰 수 / 1,000,000) × input_price_per_1m_krw
출력 요금 = (출력 토큰 수 / 1,000,000) × output_price_per_1m_krw
총 요금 = 입력 요금 + 출력 요금
계산 예시
python
# GPT-4o 모델 사용 예시
# 입력: 1,000 토큰, 출력: 500 토큰

selected_model = {
    "id": "openai/gpt-4o",
    "input_price_per_1m_krw": 3375.0,
    "output_price_per_1m_krw": 13500.0
}

input_tokens = 1000
output_tokens = 500

# 요금 계산
input_cost = (input_tokens / 1_000_000) * selected_model["input_price_per_1m_krw"]
output_cost = (output_tokens / 1_000_000) * selected_model["output_price_per_1m_krw"]
total_cost = input_cost + output_cost

print(f"입력 요금: {input_cost:.2f}원")    # 3.38원
print(f"출력 요금: {output_cost:.2f}원")   # 6.75원
print(f"총 요금: {total_cost:.2f}원")      # 10.13원
활용 사례
모델 목록 API의 실제 활용 예시
1. 모델 선택 UI 구성
javascript
// React 컴포넌트에서 모델 선택 드롭다운 구성
const ModelSelector = () => {
  const [modelsList, setModelsList] = useState([]);

  useEffect(() => {
    fetch('/api/v1/models', {
      headers: { 'X-API-Key': API_KEY }
    })
    .then(res => res.json())
    .then(data => setModelsList(data.models));
  }, []);

  return (
    <select>
      {modelsList.map(m => (
        <option key={m.id} value={m.id}>
          {m.name} (₩{m.input_price_per_1m_krw}/1M)
        </option>
      ))}
    </select>
  );
};
2. 비용 최적화 모델 선택
python
# 예산에 맞는 최적의 모델 선택
def select_optimal_model(models_list, max_budget_per_request, expected_tokens):
    """주어진 예산 내에서 가장 성능이 좋은 모델 선택"""

    suitable_models = []

    for m in models_list:
        # 예상 비용 계산 (입력 500토큰, 출력은 예상치 사용)
        estimated_cost = (
            (500 / 1_000_000) * m['input_price_per_1m_krw'] +
            (expected_tokens / 1_000_000) * m['output_price_per_1m_krw']
        )

        if estimated_cost <= max_budget_per_request:
            suitable_models.append({
                'model': m,
                'estimated_cost': estimated_cost
            })

    # 컨텍스트 길이가 가장 큰 모델 선택 (성능 지표로 가정)
    if suitable_models:
        return max(suitable_models,
                  key=lambda x: x['model']['context_length'])

    return None
주의사항
가격 변동
모델 가격과 환율은 변동될 수 있습니다. 정확한 요금은 API 호출 시점의 가격이 적용되며, 실제 청구 금액은 월말 정산 시 확정됩니다.
목록 순서
모델 목록은 BizRouter에서 권장하는 순서로 정렬되어 제공됩니다.
--
파라미터
BizRouter API는 OpenAI 호환 파라미터와 함께 추가적인 고급 파라미터를 지원합니다. 이를 통해 더 세밀한 응답 제어가 가능합니다.

Chat Completions 파라미터
POST /api/v1/chat/completions 엔드포인트 파라미터
파라미터	타입	필수	설명	기본값
model	string	필수	사용할 모델 ID (예: "openai/gpt-4o")	-
messages	array	필수	대화 메시지 배열	-
temperature	number	선택	샘플링 온도 (0-2)	1
max_tokens	integer	선택	생성할 최대 토큰 수	모델별 상이
top_p	number	선택	핵심 샘플링 (0-1)	1
frequency_penalty	number	선택	빈도 페널티 (-2 ~ 2)	0
presence_penalty	number	선택	존재 페널티 (-2 ~ 2)	0
stream	boolean	선택	스트리밍 응답 활성화	false
user	string	선택	최종 사용자 식별자	-
BizRouter 확장 파라미터
OpenAI API에는 없는 BizRouter 전용 파라미터
파라미터	타입	설명	지원 모델
top_k	integer	상위 K개 토큰만 고려 (1-100)	Anthropic, Google
repetition_penalty	number	반복 페널티 (0.1-2.0)	Anthropic
min_p	number	최소 확률 임계값 (0-1)	일부 모델
호환성 참고
확장 파라미터는 특정 모델 제공업체에서만 지원됩니다. 지원하지 않는 모델에 전달되어도 오류는 발생하지 않으며 단순히 무시됩니다.
GPT-5 전용 파라미터
GPT-5 패밀리 모델에서 지원하는 특수 파라미터
파라미터	타입	허용 값	설명	기본값
verbosity	string	low, medium, high	응답의 상세 정도를 제어합니다	medium
reasoning_effort	string	minimal, low, medium, high	추론 작업에 대한 계산 노력을 제어합니다	medium
GPT-5 파라미터 참고사항
이 파라미터들은 선택적이며, 제공하지 않으면 OpenAI API가 기본값을 처리합니다
GPT-5 패밀리 모델 (gpt-5, gpt-5-mini, gpt-5-nano 등)에서만 작동합니다
잘못된 값이 제공되면 요청에서 자동으로 제거되며 경고가 기록됩니다
GPT-5 요청 예시
json
{
  "model": "openai/gpt-5",
  "messages": [
    {"role": "user", "content": "양자 컴퓨팅에 대해 설명해주세요"}
  ],
  "verbosity": "high",         // 선택적: 상세한 응답
  "reasoning_effort": "high",  // 선택적: 깊은 추론
  "stream": false
}
메시지 형식
messages 배열의 구조와 역할
기본 메시지 구조
json
{
  "messages": [
    {
      "role": "system",
      "content": "당신은 도움이 되는 AI 어시스턴트입니다."
    },
    {
      "role": "user",
      "content": "안녕하세요! 오늘 날씨는 어떤가요?"
    },
    {
      "role": "assistant",
      "content": "안녕하세요! 저는 AI이므로 실시간 날씨 정보는 제공할 수 없습니다."
    },
    {
      "role": "user",
      "content": "그렇군요. 대신 날씨에 대한 일반적인 정보를 알려주세요."
    }
  ]
}
역할(Role) 설명
system
AI의 행동과 성격을 정의하는 시스템 프롬프트. 대화의 맨 처음에 위치합니다.

user
사용자의 입력 메시지

assistant
AI의 이전 응답. 대화 컨텍스트 유지에 사용됩니다.

파라미터 가이드라인
효과적인 파라미터 사용을 위한 권장사항
Temperature 조정
0.0-0.3: 사실적이고 일관된 응답 (코드 생성, 사실 확인)
0.4-0.7: 균형잡힌 응답 (일반 대화, 질문 답변)
0.8-1.0: 창의적인 응답 (스토리텔링, 브레인스토밍)
1.1-2.0: 매우 창의적이고 예측 불가능한 응답
토큰 제한
짧은 응답: 50-150 토큰
일반 응답: 150-500 토큰
상세한 설명: 500-1500 토큰
긴 형식 콘텐츠: 1500+ 토큰
샘플링 전략
결정론적 출력
json
{
  "temperature": 0,
  "top_p": 1
}
창의적 출력
json
{
  "temperature": 0.8,
  "top_p": 0.9,
  "top_k": 50
}
요청 예시
다양한 사용 사례별 파라미터 조합
코드 생성
json
{
  "model": "openai/gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "당신은 전문 프로그래머입니다. 깔끔하고 효율적인 코드를 작성합니다."
    },
    {
      "role": "user",
      "content": "Python으로 피보나치 수열을 생성하는 함수를 작성해주세요."
    }
  ],
  "temperature": 0.2,
  "max_tokens": 500
}
창의적 글쓰기
json
{
  "model": "anthropic/claude-3-opus",
  "messages": [
    {
      "role": "user",
      "content": "미래 도시를 배경으로 한 SF 단편 소설의 도입부를 써주세요."
    }
  ],
  "temperature": 0.9,
  "max_tokens": 1000,
  "top_p": 0.95,
  "frequency_penalty": 0.5
}
스트리밍 채팅
json
{
  "model": "openai/gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "기계학습과 딥러닝의 차이점을 설명해주세요."
    }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 800
}
--
스트리밍
BizRouter는 Server-Sent Events (SSE)를 통한 실시간 스트리밍 응답을 지원합니다. 긴 응답을 생성할 때 사용자에게 즉각적인 피드백을 제공할 수 있습니다.

스트리밍 개요
실시간 응답 스트리밍의 작동 방식
스트리밍을 활성화하려면 요청에 stream: true 파라미터를 추가합니다. 응답은 SSE 형식으로 전송되며, 각 청크는 JSON 형식의 데이터를 포함합니다.

장점
첫 번째 토큰까지의 대기 시간 단축
실시간 타이핑 효과 구현 가능
사용자 경험 향상
긴 응답에서도 빠른 피드백
스트리밍 요청 예시
다양한 언어와 환경에서 스트리밍 사용하기
Python
JavaScript
cURL
python
import requests

# 스트리밍 요청
response = requests.post(
    "https://bizrouter.ai/api/v1/chat/completions",
    headers={
        "X-API-Key": "sk-br-v1-YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "model": "openai/gpt-4o",
        "messages": [
            {"role": "user", "content": "한국의 역사에 대해 설명해주세요."}
        ],
        "stream": True  # 스트리밍 활성화
    },
    stream=True  # requests 라이브러리 스트리밍 모드
)

# 스트리밍 응답 처리
usage_data = None

for line in response.iter_lines():
    if line:
        line = line.decode('utf-8')
        if line.startswith('data: '):
            data = line[6:]  # "data: " 제거
            if data == '[DONE]':
                print("스트리밍 완료")
                break

            try:
                import json
                chunk = json.loads(data)

                # 콘텐츠 출력
                if 'choices' in chunk:
                    content = chunk['choices'][0].get('delta', {}).get('content', '')
                    if content:
                        print(content, end='', flush=True)

                # 사용량 데이터 캡처 (모델에 따라 제공될 수 있음)
                if 'usage' in chunk:
                    usage_data = chunk['usage']

            except json.JSONDecodeError:
                pass

# 사용량 정보 출력 (제공되는 경우)
print("스트리밍 완료")

if usage_data:
    print(f"토큰 사용량: {usage_data.get('total_tokens', 'N/A')}")
스트리밍 응답 형식
SSE 스트림의 데이터 구조
일반 청크
각 스트리밍 청크는 다음과 같은 형식으로 전송됩니다:

text
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"openai/gpt-4o","choices":[{"index":0,"delta":{"content":"안녕"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"openai/gpt-4o","choices":[{"index":0,"delta":{"content":"하세요"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1234567890,"model":"openai/gpt-4o","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}
스트림 종료
스트림이 완료되면 다음 마커가 전송됩니다:

text
data: [DONE]
사용량 데이터 (Usage)
특정 모델의 경우 스트리밍 마지막 청크에 토큰 사용량 정보가 포함될 수 있습니다:

json
// 마지막 청크에 포함되는 usage 데이터 예시
data: {
  "id": "chatcmpl-123",
  "object": "chat.completion.chunk",
  "created": 1234567890,
  "model": "gpt-4o",
  "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
  "usage": {
    "prompt_tokens": 32,
    "completion_tokens": 128,
    "total_tokens": 160,
    "thinking_tokens": 25  // 특정 모델에서만 제공
  }
}
참고사항
스트리밍 중 usage 데이터 제공 여부는 모델별로 다를 수 있습니다. 지원되는 경우 [DONE] 마커 직전 청크에 usage 객체가 포함됩니다.
청크 구조
delta
이전 청크 이후의 증분 콘텐츠를 포함합니다. 첫 번째 청크에는 role이 포함될 수 있습니다.

finish_reason
스트림 종료 이유: stop,length,content_filter 등

OpenAI SDK로 스트리밍
OpenAI 공식 SDK를 사용한 스트리밍 구현
Python SDK
python
from openai import OpenAI

client = OpenAI(
    api_key="sk-br-v1-YOUR_API_KEY",
    base_url="https://bizrouter.ai/api/v1"
)

# 스트리밍 응답 생성
stream = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[
        {"role": "user", "content": "한국의 역사에 대해 설명해주세요."}
    ],
    stream=True
)

# 스트리밍 처리
usage_data = None

for chunk in stream:
    # 콘텐츠 출력
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)

    # 사용량 데이터 캡처 (지원되는 모델의 경우)
    if hasattr(chunk, 'usage') and chunk.usage is not None:
        usage_data = chunk.usage

print("스트리밍 완료")

# 사용량 출력 (제공되는 경우)
if usage_data:
    print(f"토큰 사용량: {usage_data.total_tokens}")
Node.js SDK
javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'sk-br-v1-YOUR_API_KEY',
  baseURL: 'https://bizrouter.ai/api/v1'
});

async function streamChat() {
  const stream = await openai.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: [
      { role: 'user', content: '한국의 역사에 대해 설명해주세요.' }
    ],
    stream: true
  });

  let usageData = null;

  for await (const chunk of stream) {
    // 콘텐츠 출력
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }

    // 사용량 데이터 캡처 (지원되는 모델의 경우)
    if (chunk.usage) {
      usageData = chunk.usage;
    }
  }

  console.log('스트리밍 완료');

  // 사용량 출력 (제공되는 경우)
  if (usageData) {
    console.log('토큰 사용량: ' + usageData.total_tokens);
  }
}
스트리밍 모범 사례
안정적인 스트리밍 구현을 위한 권장사항
에러 처리
네트워크 중단에 대비한 재연결 로직 구현
부분적인 JSON 청크 처리를 위한 버퍼링
타임아웃 설정 (일반적으로 60초)
스트림 중단 시 사용자에게 알림
성능 최적화
청크를 즉시 렌더링하여 지연 최소화
대용량 응답의 경우 메모리 효율적인 처리
불필요한 상태 업데이트 최소화
사용자 경험
스트리밍 중임을 나타내는 시각적 표시
중단 버튼 제공
부분 응답 저장 기능
네트워크 오류 시 재시도 옵션
참고사항
스트리밍 모드에서도 토큰 사용량과 비용은 전체 응답 기준으로 계산됩니다.
스트림이 중단되더라도 생성된 토큰에 대한 비용이 발생합니다.
사용량 데이터는 모델에 따라 제공되지 않을 수 있습니다.
--
에러 처리
BizRouter API는 일관된 에러 응답 형식을 제공하여 문제를 쉽게 진단하고 처리할 수 있도록 합니다. 모든 에러는 표준화된 JSON 형식으로 반환됩니다.

에러 응답 형식
모든 API 에러의 표준 응답 구조
json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again later.",
    "type": "rate_limit_error",
    "details": {
      "retry_after": 60
    }
  }
}
응답 필드 설명:
code - 에러를 식별하는 고유 코드
message - 사람이 읽을 수 있는 에러 설명
type - 에러 카테고리
details - 추가 컨텍스트 정보 (선택적)
HTTP 상태 코드
API에서 사용되는 주요 HTTP 상태 코드
상태 코드	의미	일반적인 원인
200 OK	요청 성공	정상적인 응답
400 Bad Request	잘못된 요청	잘못된 파라미터, 금지어 포함
401 Unauthorized	인증 실패	잘못된 API 키, 만료된 세션
403 Forbidden	접근 거부	크레딧 부족, 권한 없음
404 Not Found	리소스 없음	존재하지 않는 모델
429 Too Many Requests	요청 제한 초과	Rate limit 초과
500 Internal Server Error	서버 오류	예기치 않은 서버 문제
502 Bad Gateway	게이트웨이 오류	업스트림 제공자 오류
503 Service Unavailable	서비스 이용 불가	임시 서비스 중단
주요 에러 코드
자주 발생하는 에러와 해결 방법
invalid_api_key
json
{
  "error": {
    "code": "invalid_api_key",
    "message": "Invalid API key",
    "type": "invalid_api_key"
  }
}
원인:

잘못된 API 키
비활성화된 API 키
삭제된 API 키
해결방법:

API 키가 올바른지 확인
대시보드에서 키 상태 확인
필요시 새 API 키 생성
rate_limit_exceeded
json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again later.",
    "type": "rate_limit_error",
    "details": {
      "retry_after": 60
    }
  }
}
원인:

분당 요청 수 초과
동시 요청 수 초과
해결방법:

Retry-After 헤더 확인
지수 백오프(exponential backoff) 구현
요청 속도 조절
credit_limit_exceeded
json
{
  "error": {
    "code": "credit_limit_exceeded",
    "message": "Credit limit exceeded",
    "type": "credit_limit_exceeded"
  }
}
원인:

조직 크레딧 소진
API 키 크레딧 한도 초과
월 사용 한도 도달
해결방법:

크레딧 충전 (선불)
사용 한도 증가 요청
대시보드에서 사용량 확인
forbidden_content
json
{
  "error": {
    "code": "forbidden_content",
    "message": "사내 금지어가 포함되어 있습니다",
    "type": "forbidden_content"
  }
}
원인:

조직에서 설정한 금지어 포함
부적절한 콘텐츠 감지
해결방법:

프롬프트 내용 검토
금지어 제거 후 재시도
관리자에게 금지어 목록 확인
model_not_found
json
{
  "error": {
    "code": "model_not_found",
    "message": "Model not found: gpt-5",
    "type": "model_not_found"
  }
}
원인:

존재하지 않는 모델 ID
잘못된 모델 형식
비활성화된 모델
해결방법:

올바른 모델 ID 사용 (예: "openai/gpt-4o")
사용 가능한 모델 목록 확인
제공업체 접두사 포함 확인
provider_error
json
// OpenAI 형식 에러 (원본 그대로 전달)
{
  "error": {
    "message": "You exceeded your current quota, please check your plan and billing details.",
    "type": "insufficient_quota",
    "param": null,
    "code": "insufficient_quota"
  }
}

// Anthropic 형식 에러 (원본 그대로 전달)
{
  "error": {
    "type": "invalid_request_error",
    "message": "messages: Unexpected role 'test'. The Messages API accepts user, assistant, and system roles."
  }
}
원인:

업스트림 제공자(OpenAI, Anthropic 등) API 오류
제공자 측 할당량 초과
잘못된 요청 형식
특징:

원본 제공자의 에러 형식이 그대로 전달됨
제공자별로 다른 에러 구조 가능
HTTP 상태 코드도 원본 그대로 유지
에러 처리 코드 예시
다양한 프로그래밍 언어에서의 에러 처리
Python
JavaScript
Go
python
import requests
import time

def call_bizrouter_api(prompt, max_retries=3):
    url = "https://bizrouter.ai/api/v1/chat/completions"
    headers = {
        "X-API-Key": "sk-br-v1-YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {
        "model": "openai/gpt-4o",
        "messages": [{"role": "user", "content": prompt}]
    }

    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=data)

            # 성공
            if response.status_code == 200:
                return response.json()

            # 에러 처리
            error_data = response.json().get("error", {})
            error_code = error_data.get("code")

            # Rate limit - 재시도
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 60))
                print(f"Rate limit 초과. {retry_after}초 후 재시도...")
                time.sleep(retry_after)
                continue

            # 크레딧 부족 - 즉시 중단
            elif error_code == "credit_limit_exceeded":
                raise Exception("크레딧이 부족합니다. 충전이 필요합니다.")

            # 인증 실패 - 즉시 중단
            elif response.status_code == 401:
                raise Exception("API 키가 유효하지 않습니다.")

            # 기타 에러
            else:
                raise Exception(f"API 에러: {error_data.get('message', 'Unknown error')}")

        except requests.exceptions.RequestException as e:
            print(f"네트워크 에러: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 지수 백오프
                continue
            raise

    raise Exception("최대 재시도 횟수 초과")

# 사용 예시
try:
    result = call_bizrouter_api("안녕하세요!")
    print(result)
except Exception as e:
    print(f"에러 발생: {e}")
재시도 전략
안정적인 API 통합을 위한 재시도 모범 사례
중요
모든 에러에 대해 재시도하지 마세요. 일부 에러(인증 실패, 크레딧 부족 등)는 재시도해도 해결되지 않습니다.
재시도 가능한 에러
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
네트워크 타임아웃
재시도 불가능한 에러
400 Bad Request (잘못된 파라미터)
401 Unauthorized (인증 실패)
403 Forbidden (크레딧 부족, 권한 없음)
404 Not Found (모델 없음)
지수 백오프 구현
python
import time
import random

def exponential_backoff(attempt, base_delay=1, max_delay=60):
    """
    지수 백오프 with 지터
    attempt: 현재 시도 횟수 (0부터 시작)
    base_delay: 기본 지연 시간 (초)
    max_delay: 최대 지연 시간 (초)
    """
    delay = min(base_delay * (2 ** attempt), max_delay)
    # 지터 추가 (0-25% 랜덤 지연)
    jitter = delay * 0.25 * random.random()
    return delay + jitter

# 사용 예시
for attempt in range(5):
    try:
        # API 호출
        response = make_api_call()
        break
    except RetryableError:
        if attempt < 4:
            delay = exponential_backoff(attempt)
            print(f"재시도 대기: {delay:.2f}초")
            time.sleep(delay)
        else:
            raise