# 변경 기록

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="../../CHANGELOG.md">
          <img src="https://img.shields.io/badge/English-2563eb?style=for-the-badge&labelColor=1e40af" alt="English"/>
        </a>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/한국어-16a34a?style=for-the-badge&labelColor=15803d" alt="한국어"/>
      </td>
      <td align="center">
        <a href="../ja/CHANGELOG.md">
          <img src="https://img.shields.io/badge/日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
        </a>
      </td>
      <td align-center>
        <a href="../zh-cn/CHANGELOG.md">
          <img src="https://img.shields.io/badge/中文-dc2626?style=for-the-badge&labelColor=b91c1c" alt="中文"/>
        </a>
      </td>
    </tr>
  </table>
</div>

## [0.4.2] 2025-12-23

### ✨ 개선
- **이미지 생성 경험**: 로딩/Thinking 메시지 추가, 결과 이미지를 편집기 탭에서 열기, 헤더 비용/토큰 표시 개선.
- **Caret 계정 화면**: Caret 전용 계정 화면 추가 및 크레딧/사용량/결제 내역 조회 흐름 정비(중복 호출 제거, 갱신 주기 조정).
- **CLI**: Caret CLI 인증/구독 및 LiteLLM BYO 설정/모델 목록 가져오기 개선, BYO LiteLLM 및 Caret 프로바이더 포함 정식 배포.
- **업스트림/안정성**: Ask 요청 레이스 경합 해결, Cline v3.45.0 버그 픽스 체리픽 반영.
- **명령 프리픽스**: `cline` → `caretive.caret`로 변경해 동시 설치 충돌을 완화.
- **모델 메타데이터**: Gemini 3 Pro Image Preview 이미지 지원/요금/Thinking 설정 반영.

### 추가된 기능
- **이미지 생성 모델**: Gemini 3 Flash Preview 신규 지원.
- **Caret 계정 모델**: gemini-3-pro-image-preview(나노바나나 pro) 추가.

### 버그수정
- **로그인 프로필 사진**: 로그인 후 사진 미표시 문제 수정.
- **인증 기본값**: 프로바이더 기본값을 Cline으로 조정.

## [0.4.1] 2025-12-10

### ✨ 개선
- **Caret Provider**: `caret.team` 서비스의 공식 출시에 맞춰 `anyLLM` 기반 Caret Provider를 안정화했습니다. API 개선 및 안정성 향상이 포함됩니다.

### 버그수정
- **페르소나 시스템**: 기본 아바타가 올바르게 시딩되도록 페르소나 초기화 로직을 개선했습니다. 페르소나 이미지 로딩 시 예외 처리를 개선했습니다.
- **브랜딩**: `.clineignore` 기능의 브랜딩을 `.caretignore`에 맞게 수정했습니다.
- **빌드**: 다양한 빌드 및 리소스 위치 문제를 해결했습니다.
- **인증**: 인증 프로세스에 대한 사소한 수정 및 점검이 있었습니다.

## [0.4.0] 2025-11-28

> **참고**: Caret v0.4.0은 Cline v3.38.2를 기반으로 합니다. 업스트림 릴리스 노트는 `CHANGELOG-CLINE.md`에 있습니다.

### 🎉 Cline v3.38.2 업스트림 병합
- 병합 커밋: `8723b386f` (브랜치: `main_backup_20251128202033`).

### 추가된 기능
- **Cline v3.38.2 통합**: 최신 모델 지원(Claude Opus 4.5)을 포함한 모든 업스트림 기능.
- **듀얼 계정 시스템**: Caret 모드(확장)와 Cline 모드(기본) 간 전환.
- **Caret CLI (베타)**: 향상된 인증 및 LiteLLM을 지원하는 통합 `caret` CLI.
- **Provider 설정**: 실시간 상태 확인 기능이 있는 LiteLLM/BizRouter용 모델 자동 가져오기.
- **JSON 프롬프트 시스템**: JSON을 통한 동적 시스템 프롬프트 구성.
- **입력 기록**: 터미널과 유사한 지속성 있는 기록 탐색.
- **단축키**: 작업 취소(Esc) 및 재개(Ctrl+Shift+R).

### 수정된 문제
- Linux에서 셸 통합 시 터미널 멈춤 현상.
- UI 및 CLI 전반에 걸쳐 브랜딩 복원.

## [0.3.1] 2025-10-20

### 신규
- **Caret provider**: 공식 Caret AI provider 통합.
  - 프로모션: 캠페인 기간 동안 $10 무료 크레딧 제공; 유료 크레딧은 곧 제공 예정.

### 수정
- **터미널 브랜딩**: 업스트림 병합 후 Caret으로 복원.
- **시스템 프롬프트 입력** 처리 버그 수정.
- **LiteLLM 모델 목록**: 상태(헬스) 필터링을 적용하여 가져오기.

### 업데이트
- **Cline v3.32.7 병합**: 업스트림 상세는 `CHANGELOG-CLINE.md` 참고.

## [0.3.0] 2025-10-13

### 🎉 Cline v3.32.7 업스트림 병합
- 병합 커밋: `03177da87` (브랜치: `merge/cline-upstream-20251009`).
- 신규 모델: Claude Sonnet 4.5 (200K/1M), GPT-5 업데이트, 향상된 모델 정보/가격.
- 신규 기능: `.caretignore` 지원(`.clineignore` 호환), AWS Bedrock 프로필, Requesty/Together/Alibaba Qwen 제공자, 요청 제한 재시도, Focus Chain.
- 아키텍처: protobuf 타입 시스템 전체 이관, MCP 지원 강화, provider 리팩터링.
- 자세한 내용: `CHANGELOG-CLINE.md` 참고.

### 🚀 프롬프트 시스템 최적화
- 다중 파일 편집 시 API 요청 수 30~50% 절감.
- 스마트 TODO 관리: 자동 업데이트 및 조용한 추적.
- Claude Sonnet 4.5 컨텍스트 최적화; 듀얼 모드 호환성.

## [0.2.3] 2025-10-01
- 채팅 입력 기록 탐색.
- LiteLLM 모델 가져오기 + CaretBrandConfig를 FeatureConfig로 리팩터링.
- 에이전트 프로토콜 강화; 시스템 프롬프트 리팩터링 및 한국어 문서.
- ActionButtons가 두 개 렌더링될 때 오버플로우 문제 수정.

## [0.2.22] 2025-09-21
- 병합 공백 이후 Caret 협업/시스템 프롬프트 톤 복원.
- 누락된 브라우저 번역 수정.

## [0.2.21] 2025-09-18
- 페르소나 시스템 수정(에셋 URI 처리) 및 설정 흐름 개선.
- 페르소나 선택기 문구 업데이트(ko/en).

## [0.2.0] 2025-09-11
- **Cline v3.26.6 병합**: `f8bd960b4` (`c6aa47095ee47036946c6a51339a4fa22aaa073c` 업스트림). 자세한 내용은 `CHANGELOG-CLINE.md` 참고.
- 주요 기능: 최신 모델 지원(GPT-5, Claude 4, Grok), 15+ 신규 제공자, Focus Chain, 컨텍스트 압축, 체크포인트, Mermaid 미리보기.
- 아키텍처: 백엔드 개선, UI 다듬기, MCP 지원 강화.

## [0.1.3]
- 페르소나 시스템 통합(Caret, Osarang, Madobe Ichika, Cheong Ma-shin, Tanto Ubuntu).
- Cline/Caret 모드 전환, 4개 언어 지원, 시스템 프롬프트 개선, 36개 제공자/300개 모델.
- 문서 사이트 진행 중.

## [0.1.2] 2025-08-13
- 차세대 모델에서 `browser_action` 도구 로딩 문제 수정.
- DeepSeek V3 지원, 토큰 최적화, API 비용 제어.
- 아키텍처 문서 및 가이드 업데이트.

## [0.1.1] 2025-07-18
- 초기 Caret 브랜딩 시스템, i18n 기반 강화, VS Code API 충돌 수정.
- TDD/테스트 프레임워크 기반 구축.

## [0.1.0] 2025-07-06
- Cline 최소 변경 포크로 Caret 첫 릴리스.
- `caret-src/` 기반 Caret 전용 확장 아키텍처.
- 듀얼 모드 시스템, JSON 기반 프롬프트 템플릿, 포괄적 문서, 다국어 지원, TDD 파이프라인.
