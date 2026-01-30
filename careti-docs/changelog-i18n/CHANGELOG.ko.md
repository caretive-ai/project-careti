# 변경 기록

<div align="center">
  <!-- Sovereign Cloud Languages: Provider Country = UI Language Support -->
  <table>
    <tr>
      <td align="center">
        <a href="../../CHANGELOG.md">
          <img src="https://img.shields.io/badge/🇺🇸_English-2563eb?style=for-the-badge&labelColor=1e40af" alt="English"/>
        </a>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/🇰🇷_한국어-16a34a?style=for-the-badge&labelColor=15803d" alt="한국어"/>
      </td>
      <td align="center">
        <a href="./CHANGELOG.ja.md">
          <img src="https://img.shields.io/badge/🇯🇵_日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
        </a>
      </td>
      <td align="center">
        <a href="./CHANGELOG.zh-cn.md">
          <img src="https://img.shields.io/badge/🇨🇳_中文-eab308?style=for-the-badge&labelColor=ca8a04" alt="中文"/>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="4">
        <a href="./CHANGELOG.fr.md">
          <img src="https://img.shields.io/badge/🇫🇷_Français-0055a4?style=for-the-badge&labelColor=003f7f" alt="Français"/>
        </a>
        &nbsp;&nbsp;
        <a href="./CHANGELOG.de.md">
          <img src="https://img.shields.io/badge/🇩🇪_Deutsch-ffcc00?style=for-the-badge&labelColor=dd0000" alt="Deutsch"/>
        </a>
        &nbsp;&nbsp;
        <a href="./CHANGELOG.ru.md">
          <img src="https://img.shields.io/badge/🇷🇺_Русский-0039a6?style=for-the-badge&labelColor=d52b1e" alt="Русский"/>
        </a>
      </td>
    </tr>
  </table>
</div>

## [0.4.7] 2026-01-30

> **참고**: Careti v0.4.7은 Cline v3.49.1 기능을 통합하고 코드 편집 안정성을 위한 SmartEditEngine을 도입했습니다.

### ✨ 신규 기능
- **캐러티 프로바이더에 ZAI GLM-4.7 추가**: Gemini, Claude Code와 함께 Zhipu AI의 GLM-4.7을 새로운 백엔드 옵션으로 추가했습니다.
- **웹 검색 (SerpAPI)**: SerpAPI 기반 웹 검색 기능을 추가하고 설정에서 API 키를 구성할 수 있습니다.
- **Commands 시스템**: Claude Code/OpenCode 스타일의 명령어 시스템을 `.agents/commands/` 디렉토리에 구현했습니다.
- **SmartEditEngine**: 코드 편집 안정성을 위한 9단계 퍼지 매칭 + 6단계 폴백 엔진을 추가했습니다.
- **백그라운드 편집** (Cline v3.49.1): 백그라운드 파일 편집 작업을 지원합니다.
- **변경 설명** (Cline v3.49.1): 코드 변경 설명을 위한 generate_explanation 도구를 추가했습니다.
- **GFM 마크다운 지원**: GitHub Flavored Markdown 테이블 및 취소선 렌더링을 추가했습니다.
- **TypewriterText 컴포넌트**: 스트리밍 텍스트 표시를 위한 쉬머 애니메이션을 추가했습니다.
- **ThinkingRow 컴포넌트**: 추론/사고 모드 표시를 위한 새 UI를 추가했습니다.
- **ToolGroupRenderer**: 저위험 도구 작업의 그룹화된 표시를 추가했습니다.

### ✨ 개선
- **Claude Code 연동**: AGENTS.md ↔ CLAUDE.md 동기화 훅으로 Caret + Claude Code 워크플로우 원활하게 지원.
- **Caret → Careti 리브랜딩**: 코드베이스 및 모든 로케일 파일에서 브랜드 마이그레이션을 완료했습니다.
- **재시도 로직**: 개선된 백오프 처리로 API 재시도 로직을 강화했습니다.
- **Upstage 프로바이더**: Upstage 프로바이더 구성을 개선했습니다.
- **토큰 효율적 오류**: WriteToFileToolHandler의 오류 컨텍스트를 최적화했습니다.
- **hwpjs 의존성**: 플랫폼별 패키지를 optionalDependencies로 이동했습니다.
- **Ollama 사고 모드**: Ollama 프로바이더의 사고 모드 표시를 수정했습니다.

### 버그 수정
- **캐러티 계획/실행 모드**: 캐러티 프로바이더에서 계획/실행 모드 체크박스 숨김 (단일 모델 모드만 지원).
- **preserveFocus 옵션**: 파일 열기 시 preserveFocus 설정을 준수하도록 수정했습니다.
- **임포트 경로**: Caret → Careti 임포트 경로 마이그레이션을 완료했습니다.
- **웹 검색 설정**: 설정 캐시에서 SerpAPI 키 처리를 수정했습니다.
- **빌드 오류**: Cline v3.49.1 기능 통합 빌드 문제를 해결했습니다.
- **스킬 번역**: t() 함수 호출 및 skillLoaded 번역을 수정했습니다.

---

## [0.4.6] 2026-01-19

### ✨ 개선
- **동적 브랜딩**: 태스크 핸들러에서 하드코딩된 "Cline" 참조를 동적 브랜드명(`getCurrentBrandName()`)으로 교체했습니다.
- **무료 크레딧 프로모션**: 로그인 필요 UI에 가입 시 무료 크레딧 프로모션 메시지를 추가했습니다 (7개 언어 지원).
- **README 문서 링크**: 다국어 README 언어 배지에 문서 링크를 추가하여 탐색을 용이하게 했습니다.

---

## [0.4.5] 2026-01-18

> **참고**: Careti v0.4.5는 Cline v3.49.0+ 기능 중 Skills 시스템, Hooks i18n 등을 체리픽 통합했습니다.

### ✨ 신규 기능
- **Z.AI GLM-4.7 완벽 지원**: Thinking Mode와 자연스러운 대화 스타일을 지원합니다.
- **[Upstage](https://upstage.ai/) 프로바이더**: Upstage Solar 모델을 지원하는 신규 프로바이더를 추가했습니다.
- **텍스트 모델 전용 이미지 도구 사용**: 텍스트 전용 모델도 캐러티 계정의 도구를 사용하여 이미지 생성 및 분석이 가능합니다.
- **Skills 시스템** (Cline v3.49.0+ 체리픽): 프로젝트별 스킬을 정의하고 AI가 활용할 수 있는 Skills 시스템을 추가했습니다. `.agents/skills/` 또는 `.users/skills/` 디렉토리에서 스킬을 관리할 수 있습니다.
- **Hooks 시스템** (Cline v3.49.0+ 체리픽): 도구 실행 전후에 커스텀 스크립트를 실행할 수 있는 Hooks 시스템을 추가했습니다. `.agents/hooks/` 또는 `.users/hooks/` 디렉토리에서 훅을 관리할 수 있습니다.
- **이중 디렉토리 아키텍처 & /init**: 토큰 최적화 AI 컨텍스트(`.agents/`)와 사용자 언어 문서(`.users/`)를 1:1 미러링 정책으로 관리합니다. `/init` 명령어로 프로젝트를 분석하고 컨텍스트 파일을 자동 생성합니다. AGENTS.md와 CLAUDE.md가 표준 진입점으로 연동됩니다.
- **HWP 문서 지원**: 크로스 플랫폼 HWP 파싱을 지원합니다. Windows, macOS, Linux 모두에서 한글(.hwp) 문서를 읽을 수 있습니다.
- **read_document 도구**: HWP, PDF, DOCX, PPTX 등 다양한 문서 포맷을 읽을 수 있는 통합 문서 읽기 도구를 추가했습니다. PPT 레거시 포맷 감지도 지원합니다.
- **analyze_image 도구**: 캐러티 계정의 Gemini  연동한 이미지 분석 도구를 새로 추가했습니다. 최대 픽셀 7500px 제한 적용, 분석 결과 보고 지침 포함.
- **generate_image 도구 개선**: XML `<image>` 태그 파싱 지원, 파일 경로(상대/절대) 지원 명시, aspect_ratio/image_size 생략 지침 추가.
- **이미지 전송 토글**: @멘션으로 이미지 파일 전송 여부를 설정할 수 있는 토글 기능을 추가했습니다.

### ✨ 개선
- **언어 확장**: 프랑스어, 독일어, 러시아어 번역을 추가했습니다. 자체 AI 모델을 보유한 국가(Mistral, Aleph Alpha, Yandex 등)를 우선 지원합니다.
- **프로바이더 국가 플래그**: 프로바이더에 국가 플래그를 표시합니다 (Sovereign Cloud 관점).
- **글로벌 컨텍스트 경로 변경**: 글로벌 에이전트 설정 경로가 `~/Documents/.agents/`로 변경되었습니다.
- **다국어 지원**: Hooks 및 Skills 기능에 대한 한국어, 일본어, 중국어 번역을 추가했습니다.
- **YAML frontmatter 파싱**: Skills/Hooks에서 공유되는 YAML 파싱 유틸리티를 추가했습니다.
- **기본 프로바이더**: 신규 사용자의 기본 프로바이더가 Careti으로 설정됩니다.
- **Feature Config UI 게이팅**: 계정/모드/딕테이션 UI를 feature config로 제어할 수 있습니다.
- **VSIX 크기 최적화**: iOS/Android 바이너리를 제외하여 확장 프로그램 크기를 줄였습니다.
- **이미지 설정 UI**: 모든 프로바이더에서 이미지 비율/해상도 설정 UI가 표시됩니다.

### 버그 수정
- **sharp 활성화 실패**: 이미지 처리 라이브러리의 활성화 실패 문제를 수정했습니다.
- **이미지 참조 처리**: 이미지 참조 처리 및 최적화 관련 문제를 수정했습니다.
- **중복 메시지 표시**: "Careti 이미지 생성 요청" 메시지가 두 번 표시되는 문제를 수정했습니다.

## [0.4.4] 2025-12-30

### ✨ 개선
- **캐러티 계정 나노바나나 통합**: 캐러티 계정에서 제미나이3 플래시가 추가되고 나노바나나 이미지 생성 기능이 통합되어 프로젝트에 에셋으로 활용 가능합니다.
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)**: 네이버 클라우드 신규 프로바이더와 HCX-007/HCX-005/HCX-DASH-002 모델을 추가하였습니다.
- **AAIF 국제 표준 Agents.md 지원 및 프로젝트 초기 설정 기능 추가**: 기존 Careti/Cline 전용 규칙을 AAIF국제 표준을 따르도록 수정하고, 이에 따른 프로젝트 초기 설정을 지원하는 기능을 추가하였습니다.
- **빌드/배포**: 빌드 스크립트 안정화 및 에셋 동기화 순서 수정으로 빌드 안정성을 개선했습니다.
- **레이트리밋 재시도**: 5/10/20/40/60초 백오프에 맞춰 자동 재시도 및 카운트다운 표시를 강화했습니다.
- **문서/모델 리스트**: 프로바이더 설정 문서 및 지원 모델 리스트를 최신 상태로 정리했습니다.
- **텔레메트리**: 오류/품질 추적을 위한 텔레메트리를 적용했습니다.

### 버그 수정
- **Cline v3.45.0 버그수정**: Cline v3.45.0에 반영되었던 버그 수정 코드를 통합하였습니다.
- **히스토리 이미지 표시**: 절대 경로 이미지가 보이지 않던 문제를 해결했습니다.
- **입력 누락**: 응답 완료 후 프롬프트 입력이 씹히는 문제를 완화했습니다.
- **Careti Provider**: Gemini3 관련 동작 오류를 수정했습니다.
- **프로필 이미지**: 로그인 후 이미지가 보이지 않는 문제를 수정했습니다.
- **Ask 레이스**: ask 레이스 경합 문제를 해결했습니다.
- **[Naver Cloud](https://clova.ai/) 응답 처리**: `status.code` 오류와 빈 응답을 즉시 감지하고, 429 매핑을 포함해 안정성을 높였습니다.
- **스트리밍 안정성**: 빈 스트림 청크 방어 및 스트리밍 실패 로깅을 보강했습니다.

## [0.4.1] 2025-12-10

### ✨ 개선
- **Careti Provider**: `careti.ai` 서비스의 공식 출시에 맞춰 `anyLLM` 기반 Careti Provider를 안정화했습니다. API 개선 및 안정성 향상이 포함됩니다.

### 버그 수정
- **페르소나 시스템**: 기본 아바타가 올바르게 시딩되도록 페르소나 초기화 로직을 개선했습니다. 페르소나 이미지 로딩 시 예외 처리를 개선했습니다.
- **브랜딩**: `.clineignore` 기능의 브랜딩을 `.caretignore`에 맞게 수정했습니다.
- **빌드**: 다양한 빌드 및 리소스 위치 문제를 해결했습니다.
- **인증**: 인증 프로세스에 대한 사소한 수정 및 점검이 있었습니다.

## [0.4.0] 2025-11-28

> **참고**: Careti v0.4.0은 Cline v3.38.2를 기반으로 합니다. 업스트림 릴리스 노트는 `CHANGELOG-CLINE.md`에 있습니다.

### 🎉 Cline v3.38.2 업스트림 병합
- 병합 커밋: `8723b386f` (브랜치: `main_backup_20251128202033`).

### 추가된 기능
- **Cline v3.38.2 통합**: 최신 모델 지원(Claude Opus 4.5)을 포함한 모든 업스트림 기능.
- **듀얼 계정 시스템**: Careti 모드(확장)와 Cline 모드(기본) 간 전환.
- **Provider 설정**: 실시간 상태 확인 기능이 있는 LiteLLM/BizRouter용 모델 자동 가져오기.
- **JSON 프롬프트 시스템**: JSON을 통한 동적 시스템 프롬프트 구성.
- **입력 기록**: 터미널과 유사한 지속성 있는 기록 탐색.
- **단축키**: 작업 취소(Esc) 및 재개(Ctrl+Shift+R).

### 수정된 문제
- Linux에서 셸 통합 시 터미널 멈춤 현상.
- UI 및 CLI 전반에 걸쳐 브랜딩 복원.
