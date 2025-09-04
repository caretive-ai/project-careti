1. Hi I'm cline 페이지
 - welcome 아님
2. api입력후 설정에 다시 api입력페이지로 오는 이상한 경험
 - OpenRouter 가 기본
3. 설정 가니 영어가 기본 (현재 영어 vscode라 정상)
- 그런데 해당 일반 설정 페이지중 일부 내용이 한글임
  -> 모드 시스템, 캐럿/클라인 버튼 (caret 또는 cline모들르 선택하세요)
  -> 익명 오류 및 사용 보고...
4. 한국어로 변경후 다시 일반 설정 진입
  모드시스템(한글로 정상 보임)
5. mcp 페이지 한글 키 깨짐
  history 영문으로 나옴
  api 설정 영문으로 나옴 
  대부분 그냥 영문으로 나옴
  공지사항 키 깨짐
  채팅 apiReques 키 깨짐

 자동 승인 설정은 한글
  작업 밑에 체크 버튼은 영어로 나옴

  6. api 정보들 다 영어로 나옴
   - caret-main은 한글로 번역 했어음

   7. API프로바이더에 Caret 선택 없음. 아예 노출 안되

## Luke Yang 분석 및 답변

### 1. Welcome페이지 이식 안됐나? 
**답변**: WelcomeView.tsx에서 여전히 "Hi, I'm Cline" 하드코딩 상태입니다. 
- 38번째 줄: `<h2>Hi, I'm Cline</h2>`
- caret-main의 완전 i18n 구현이 반영되지 않음
- **해결 필요**: caret-main의 WelcomeView 구현을 이식해야 함

### 2. CaretProvider 나오게 해
**상태**: CaretApiProvider는 구현되어 있으나 UI에 노출되지 않음
- `src/api/providers/CaretApiProvider.ts` 파일 존재 ✅
- 완전한 API 구현 완료 ✅ 
- **문제**: 설정 UI에서 선택 옵션으로 노출되지 않음
- **해결 필요**: ApiOptions 컴포넌트에 Caret 프로바이더 추가 필요

### 3. 총체적으로 i18n 적용이 많이 빠진 케이스 분석

**주요 누락 패턴:**
1. **MCP 관련 페이지** - 대부분 하드코딩 상태
   - history, api 설정, 공지사항 등
   - apiRequest 키 깨짐 현상
2. **API 설정 관련** - 프로바이더 정보들 전체 영문
3. **체크박스/버튼류** - 작업 밑 체크 버튼 등 소규모 UI 요소
4. **혼재 언어 현상** - 일부만 번역되어 일관성 부족

**원인 분석:**
- i18n 인프라는 완성되었으나 실제 컴포넌트 적용률 낮음
- caret-main의 완전한 번역이 반영되지 않음
- JSON 파일 내 키가 있어도 컴포넌트에서 호출하지 않는 경우 다수

**즉시 해결 필요 우선순위:**
1. ⭐ **CaretApiProvider UI 노출** (가장 중요)
2. ⭐ **WelcomeView 완전 i18n 이식** 
3. **MCP 페이지 i18n 키 연결**
4. **API 설정 페이지 i18n 적용**

### 4. 해결 계획
1단계: CaretApiProvider 설정 UI 노출
2단계: WelcomeView caret-main 코드 이식  
3단계: 누락된 i18n 키들 체계적 연결
4단계: 최종 테스트 및 검증

## Provider 명명 혼재 문제 분석 (Cline 패턴 기준)

### 명명 기준 (Cline 패턴 분석 결과)
- **API Handler**: `{Company}ApiProvider` (src/api/providers/)
- **UI Component**: `{Company}Provider` (webview-ui/src/components/settings/providers/)  
- **WebviewProvider**: `{Purpose}WebviewProvider` (src/hosts/)
- **Manager/Service**: `{Purpose}Manager` (싱글턴, 전역 관리)

### As-is (현재 상태) - 문제점
| 파일 경로 | 클래스/컴포넌트명 | 역할 | 문제점 |
|-----------|------------------|------|--------|
| `src/api/providers/CaretApiProvider.ts` | `CaretApiProvider` | API Handler | ✅ 올바름 |
| `webview-ui/src/components/settings/providers/CaretProvider.tsx` | `CaretProvider` | UI Component | ✅ 올바름 |
| `caret-src/providers/CaretProvider.ts` | `CaretGlobalManager` | 전역 매니저 | ❌ 파일명과 클래스명 불일치 |
| `caret-main/caret-src/core/webview/CaretProvider.ts` | `CaretProvider` | WebviewProvider | ❌ WebviewProvider 역할인데 Provider로 명명 |

### To-be (수정 목표)
| 파일 경로 | 클래스/컴포넌트명 | 역할 | 수정 방향 |
|-----------|------------------|------|-----------|
| `src/api/providers/CaretApiProvider.ts` | `CaretApiProvider` | API Handler | 변경 없음 |
| `webview-ui/src/components/settings/providers/CaretProvider.tsx` | `CaretProvider` | UI Component | 변경 없음 |
| `caret-src/managers/CaretGlobalManager.ts` | `CaretGlobalManager` | 전역 매니저 | 📁 파일명 변경 |
| `caret-main/caret-src/core/webview/CaretWebviewProvider.ts` | `CaretWebviewProvider` | WebviewProvider | 📁 파일명+클래스명 변경 |

### 수정 작업 리스트
1. **파일 이동/이름변경**:
   - `caret-src/providers/CaretProvider.ts` → `caret-src/managers/CaretGlobalManager.ts`
   - `caret-main/caret-src/core/webview/CaretProvider.ts` → `CaretWebviewProvider.ts`

2. **Import 경로 수정**:
   - `@caret/providers/CaretProvider` → `@caret/managers/CaretGlobalManager`
   - 모든 참조 파일 업데이트

3. **클래스명 수정**:
   - `CaretProvider` (WebviewProvider) → `CaretWebviewProvider`

### 우선순위
1. ⭐ **즉시**: CaretGlobalManager 파일명 정리 (현재 혼재) ✅ 완료
2. ⭐ **즉시**: Import 경로 수정으로 빌드 오류 해결 ✅ 완료
3. 🔄 **추후**: caret-main WebviewProvider 정리 (별도 브랜치)

## 🚨 핵심 문제 발견: CaretApiProvider UI 노출 안되는 진짜 원인

### 분석 결과
**문제**: `proto/cline/models.proto`의 `ApiProvider enum`에 `CARET`가 없음!
- 현재 enum: ANTHROPIC, OPENROUTER, ... DIFY (CARET 없음)
- UI에서 string "caret"로 처리하지만 protobuf 타입 시스템과 불일치
- 따라서 CaretApiProvider는 백엔드에 있어도 UI 선택지에 노출되지 않음

### 🎯 해결해야 할 작업 리스트 (우선순위)

#### 1단계: 즉시 해결 (CaretApiProvider UI 노출)
- [ ] `proto/cline/models.proto`에 `CARET = 35` 추가
- [ ] `npm run protos` 실행하여 타입 재생성
- [ ] `ApiOptions.tsx`에서 string "caret" → `ApiProvider.CARET` enum 사용
- [ ] `CaretProvider.tsx` 타입 에러 수정:
  - Mode 타입 처리 (`currentMode === "caret"` 에러)
  - API 키 필드 `caretActApiKey` 존재하지 않음 에러
  - DebouncedTextField autoFocus prop 에러

#### 2단계: i18n 누락 수정
- [ ] **WelcomeView.tsx**: "Hi, I'm Cline" → caret-main i18n 구현 이식
- [ ] **MCP 페이지**: history, api 설정, 공지사항, apiRequest 키 연결
- [ ] **API 설정 페이지**: 프로바이더 정보 i18n 적용

#### 3단계: 아키텍처 문서화
- [ ] `f04-caret-account.mdx`에 전체 구조 정리
- [ ] 현재: API 키 직접 라우팅 (`caret.team` 직접 호출)
- [ ] 향후: OpenRouter 스타일 프록시 전환 계획

### 현재 상태
- ✅ **CaretGlobalManager**: 파일명 정리 완료 (`caret-src/managers/CaretGlobalManager.ts`)
- ✅ **Import 경로**: 수정 완료 (`@caret/managers/CaretGlobalManager`)
- ✅ **CaretApiProvider**: 백엔드 완전 구현됨
- ❌ **UI 노출**: protobuf enum 누락으로 노출되지 않음
- ❌ **WelcomeView**: 여전히 "Hi, I'm Cline" 상태
- ❌ **i18n**: 대부분 누락된 상태

# luke 2차 피드백
* 위 문서는 완료 상태 업데이트 안되었으니 다시 확인할것
## 언어 문제 : 해결안됨
* 첫번째 실행 : account 에 영어 노출, 설정 선호언어에는 한글, 한글을 중문으로 바꾸자 account 중문으로 변경
   -> 여전히 llm의 선호 언어가 바로 ui에 반영 되지 않는것 같음
* 두번째 실행 : 설정의 선호 언어는 중문 상태, accont는 여전히 영어 노출 
 -> llm의 선호 언어와 ui의 언어설정이 여전히 일치 되지 않고 있음. 로그가 없어 뭐가 문제인지 알기 어려움

* 총평: 대부분의 페이지가 영어로 나오거나 i18n의 key로 노출됨. key의 누락, 가능성 => 이 문제는 위의 문제 해결 후 확인


## CaretProvider
 - Caret 노출 : 정상 노출되고 있음
 - Caret을 선택시 : Anthropic으로 Provider가 자동 변경됨 -> 더 이상 확인 불가 
    예전에 비슷한 문제가 이어는데 무언가 잘못되어 기본값인 Anthropic으로 변환되는 거 이었음

## Welcome페이지 문제
- 타이틀이 
 👋 안녕하세요! AI 개발 파트너, ^Caret입니다.
 가 뜨고, 버튼은 시작하기, 
  한글 설정 상태가 아닌데 한글이 나오는게 이상하고, caret-main 의 Welcome페이지와 다름
   caret-main 은 몇개의 하부 섹션으로 되어 자세한 소개가 있고 상단에 이미지가 있으며, 페이지 안에 바로 언어설정이 있었음
    해당 기능으 부활이 필요
    