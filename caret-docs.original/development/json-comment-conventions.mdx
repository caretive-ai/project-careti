# Caret JSON 파일 주석 작성 규칙

**중요:** 표준 JSON은 주석을 지원하지 않습니다. 다음 규칙들은 내부 문서화 및 Caret 전용 변경사항 추적을 위한 것으로, 특히 `cline/webview-ui/package.json` 같은 공유 파일에서 사용됩니다. 이러한 주석들은 린터나 빌드 프로세스에서 문제가 발생할 경우 전처리기에 의해 제거되거나 처리되어야 할 수 있습니다.

## 한 줄 주석

`//` 다음에 간결한 마커와 설명을 사용합니다.

- **마커:** `[CARET]`
- **형식:** `// [CARET] 간결한 주석 내용`

**예시 (`package.json` 컨텍스트):**

```json
{
	"dependencies": {
		"some-dependency": "^1.0.0", // [CARET] 이 의존성이 필요한 이유.
		"another-dependency": "^2.1.0"
	}
}
```

## 여러 줄 주석 블록

여러 줄에 걸치거나 관련 항목들을 그룹화하는 광범위한 주석을 위해 시작과 끝 마커를 사용합니다.

- **시작 마커:** `// [CARET_BLOCK_START] 블록에 대한 간단한 설명 (선택사항)`
- **내용:** 여러 줄 주석의 각 줄도 `//`로 시작해야 함
- **끝 마커:** `// [CARET_BLOCK_END] 간단한 설명 (시작과 일치 가능)`

**예시 (`package.json` 컨텍스트):**

```json
{
	"dependencies": {
		// [CARET_BLOCK_START] 국제화 의존성들
		// 이 패키지들은 Caret WelcomeView 및 기타 향후 UI 컴포넌트에서
		// 다국어 지원을 제공하는 데 필수적입니다.
		"i18next": "^23.11.5", // [CARET] 핵심 i18n 라이브러리.
		"react-i18next": "^15.5.3", // [CARET] i18next용 React 바인딩.
		// [CARET_BLOCK_END] 국제화 의존성들
		"other-package": "1.0.0"
	}
}
```

## 키-값 쌍에 대한 한 줄 주석

특정 키-값 쌍에 주석을 달려면, 대상 항목 **바로 다음에** 새로운 키-값 쌍을 추가합니다.

- **주석 키 형식:** `comment_[원래키이름]_caret` (Caret 관련인 경우) 또는 `comment_[원래키이름]`
- **주석 값:** 설명하는 주석 문자열

**예시:**

```json
{
	"someSetting": true,
	"comment_someSetting_caret": "Caret의 향상된 기능 X를 위해 활성화됨."
}
```

## 주석 블록

설정 그룹에 대한 설명 블록을 정의하려면:

- **블록 시작 키:** `_comment_block_start_[설명]_caret`
    - 값: 블록 시작에 대한 주석 텍스트
- **블록 끝 키:** `_comment_block_end_[설명]_caret`
    - 값: 블록 끝에 대한 주석 텍스트 ("... 블록 끝" 같이 간단하게 가능)

**예시:**

```json
{
	"_comment_block_start_feature_Y_settings_caret": "Caret의 기능 Y 관련 설정들.",
	"settingA": "valueA",
	"comment_settingA_caret": "기능 Y 전용.",
	"settingB": false,
	"comment_settingB_caret": "기능 Y에서 기본적으로 비활성화됨.",
	"_comment_block_end_feature_Y_settings_caret": "Caret의 기능 Y 설정 끝."
}
```

이러한 주석 키들이 고유하며 실제 설정 키들과 충돌하지 않도록 항상 확인하세요.
