# 화이트 라벨링에 대한 피드백
 * 피드백 URL : https://docs.slexn.com/s/ea9b344e-d1a6-459d-92e6-0721561e3501

## 화면 크기에 따른 툴팁 레이아웃 오류
 * 범위 : 캐럿 
 * 현상 : 가로 화면 크기가 작은 경우 우측 하단의 '에이전트' 버튼위에 마우스가 올린 경우 툴팁이 왼쪽 구석으로 잘려 노출되고 있음   
 * 기대값 : 정상적으로 화면안에 툴팁이 노출되어야함

## 작업공간 규칙과 워크플로우 화이트 라벨링
 * 범위 : 코드센터 화이트 라벨링
 * 현상 : 작업공간 규칙/워크플로우를 만들면 .caretrules 아래 생성됩니다.
          또한 현재 규칙은 .caretrules에 만들어지는데 인식은 안 되고 있습니다.
 * 기대값 : 정상적으로 생성되고 인식도 해당 위치에서 되야함

## MCP 파일명 caret노출
 * 범위 : 코드센터 화이트 라벨링
 * 현상 : caret_mcp_settings.json 파일로 노출, 
 * 기대값 : codecenter_mcp_settings.json 파일로 노출되어야함

## LiteLLM모델 로딩시, 모델의 이름이 길면 UI깨짐
  * 범위 : 캐럿 
  * 현상 : LiteLLM, Bizrouter모델 가져오기시, 모델의 종류가 많으면 UI깨짐
           모델리스트 위로 API제공자, API Provider가 노출되기 때문, 모델리스트가 최상단으로 올라가야 할것 같음
  * 기대값 :  모델의 종류가 많아도 정상 출력되야함

## API요청에 격조사가 부자연스러운 벼너역 변경
  * 범위 : 코드센터 화이트 라벨링
  * 현상 : Caret이 -> CodeCenter가
  * 기대값 : "CodeCenter이 파일을 편집하려고 합니다." ->   "CodeCenter가 파일을 편집하려고 합니다."
    i18n의 브랜딩 한글 조사 처리 적용

## 음성 입력 활성화 기능 삭제
  * 범위 : 캐럿
  * Cline의 음성입력 기능이 삭제되어 캐럿도 삭제 햇던 걸로 아는데 또 나왔다고 함, 다시 한번확인필요

## CodeCenter 개발 지원하기
  * 범위 : 코드센터 화이트라벨링
  * 현상 : 설정내의 CodeCenter 개발 지원하기 노출, 오픈소스로 노출하지 않으므로 삭제 필요
  * 기대값 : 삭제

## 챗봇 모드에서 경고 메시지 화이트라벨링
  * 범위 : 캐럿, 코드센터 화이트라벨링
  * 문구 : Cline uses complex prompts and interacive -> Caret uses complex prompts and interacive  -> CodeCenter uses complex prompts and interacive 

  