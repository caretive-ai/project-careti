# Caret과 함께 Google Gemini 무료로 사용하는 방법

Caret을 사용하면 Google Gemini API 키를 사용하여 최대 40만 원의 무료 크레딧을 받아 Gemini를 무료로 사용할 수 있습니다. 방법은 다음과 같습니다.

## 1. 새 Google 계정 만들기

- **URL**: [https://accounts.google.com/](https://accounts.google.com/)
- **필요 정보**:
    - 계정 이름
    - 계정 이메일
    - 복구 이메일 또는 전화번호

## 2. Gemini API 키 발급받기

- **API 키 발급 페이지**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **API 키 생성 및 복사**:
    - "API 키 만들기"를 클릭하여 키를 생성한 다음 복사합니다.
    - 이 키는 나중에 Caret의 Gemini API 설정에 사용됩니다.

## 3. 캐럿에 구글 API 키 설정하기
- **API 제공자 선택**: 캐럿의 API 공급자에 Google Gemini를 선택합니다.
- **Google Gemini API 키 붙여넣기**: 구글 AI스튜디오에서 발급받은 API Key를 붙여 넣습니다.
- **모델**: 모델은 Gemini-2.5 flash나 Gemini-2.5-pro 설정을 추천드립니다. Gemini-2.5 flash는 값이 싸나 성능은 낮으므로 확장된 사고는 활성화를 하시기를 추천 드립니다.   

## 4. Google Cloud에 액세스하여 무료 크레딧 신청하기

⚠️ **중요**: 본인 인증 및 계정 활성화를 위해 신용카드가 필요합니다.

### i. Google Cloud 콘솔로 이동

- **URL**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- 페이지 상단에 무료 크레딧에 대한 메시지가 표시됩니다.
- 표시된 버튼을 클릭하면 다음 페이지로 리디렉션됩니다.
    > "90일 동안 사용할 수 있는 300달러의 무료 크레딧이 제공됩니다."

⚠️ **주의 깊게 확인**: "결제로 이동"으로 바로 이동하면 크레딧이 제공되지 않을 수 있습니다. "90일 동안 300달러(약 40만 원)의 무료 크레딧"이라는 문구를 확인하세요.

### ii. 최종 확인

Google AI Studio API 키 페이지에서 다음 사항을 확인하세요.
- 일반 계정 활성화
- 결제 계정 연결
- Tier 1으로 업그레이드

그래야만 무료 크레딧을 사용할 수 있습니다.

### iii. 참고 사항

- Google 크레딧은 실시간으로 차감되지 않습니다. 사용량은 약 1일의 지연 시간으로 반영됩니다.
- 유료 서비스를 계속 사용하지 않으려면 의도하지 않은 요금이 부과되지 않도록 사용량과 남은 크레딧을 정기적으로 확인하세요.