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

## [0.4.4] 2025-12-30 

### ✨ 개선
- **캐럿 계정 나노바나나 통합**: 캐럿 계정에서 제미나이의 나노바나나 이미지 생성 기능이 통합되어 프로젝트에 에셋으로 활용 가능합니다.
- **Caret CLI**: Caret계정과 LiteLLM BYO프로바이더를 지원하는 Caret CLI가 정식 배포 되었습니다.
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)**: 네이버 클라우드 신규 프로바이더와 HCX-007/HCX-005/HCX-DASH-002 모델을 추가하였습니다.
- **AAIF 국제 표준 Agents.md 지원 및 프로젝트 초기 설정 기능 추가**: 기존 Caret/Cline 전용 규칙을 AAIF국제 표준을 따르도록 수정하고, 이에 따른 프로젝트 초기 설정을 지원하는 기능을 추가하였습니다.
- **빌드/배포**: 빌드 스크립트 안정화 및 에셋 동기화 순서 수정으로 빌드 안정성을 개선했습니다.
- **레이트리밋 재시도**: 5/10/20/40/60초 백오프에 맞춰 자동 재시도 및 카운트다운 표시를 강화했습니다.
- **문서/모델 리스트**: 프로바이더 설정 문서 및 지원 모델 리스트를 최신 상태로 정리했습니다.
- **텔레메트리**: 오류/품질 추적을 위한 텔레메트리를 적용했습니다.

### 버그 수정
- **Cline v3.45.0 버그수정**: Cline v3.45.0에 반영되었던 버그 수정 코드를 통합하였습니다.
- **히스토리 이미지 표시**: 절대 경로 이미지가 보이지 않던 문제를 해결했습니다.
- **입력 누락**: 응답 완료 후 프롬프트 입력이 씹히는 문제를 완화했습니다.
- **Caret Provider**: Gemini3 관련 동작 오류를 수정했습니다.
- **프로필 이미지**: 로그인 후 이미지가 보이지 않는 문제를 수정했습니다.
- **Ask 레이스**: ask 레이스 경합 문제를 해결했습니다.
- **[Naver Cloud](https://clova.ai/) 응답 처리**: `status.code` 오류와 빈 응답을 즉시 감지하고, 429 매핑을 포함해 안정성을 높였습니다.
- **스트리밍 안정성**: 빈 스트림 청크 방어 및 스트리밍 실패 로깅을 보강했습니다.

## [0.4.1] 2025-12-10

### ✨ 개선
- **Caret Provider**: `caret.team` 서비스의 공식 출시에 맞춰 `anyLLM` 기반 Caret Provider를 안정화했습니다. API 개선 및 안정성 향상이 포함됩니다.

### 버그 수정
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
