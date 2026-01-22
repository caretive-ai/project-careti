# 아키텍처 가이드

Caret 프로젝트 개발을 위한 포괄적인 아키텍처 가이드입니다.

## 원칙

- **최소 Cline 확장**: 최대 보존을 가진 포크 전략
- **레벨 기반 수정**: L1 독립 → L2 조건부 → L3 직접
- **깨끗한 분리**: `careti-src/` vs `src/` 구분

## 아키텍처 레벨

### Level 1: 독립 모듈
- **우선순위**: 권장
- **위치**: `careti-src/`, `careti-docs/`
- **자유도**: 완전한 구현 자유
- **요구사항**: 없음 (백업 또는 주석 요구사항 없음)

### Level 2: 조건부 통합
- **우선순위**: 주의 필요
- **수정**: 최소 Cline 파일 수정 (최대 1-3줄)
- **필수**: CARETI MODIFICATION 주석
- **보호**: `src/`, `webview-ui/`, `proto/`, `scripts/`

### Level 3: 직접 수정
- **우선순위**: 최후 수단
- **요구사항**: 완전한 문서화, 완전한 영향 분석
- **사용 사례**: 긴급 상황에만

## 스토리지 패턴

| 데이터 | 타입 | 범위 |
|--------|------|------|
| chatSettings | workspaceState | 프로젝트별 |
| globalSettings | globalState | 사용자 전역 |

**규칙**: 관련 설정에 동일한 스토리지 타입 사용

## 익스텐션 아키텍처

- **진입점**: `extension.ts`
- **통신**: WebviewProvider ↔ Controller ↔ Task
- **메시지 플로우**: 타입 안전을 위한 Protocol Buffers
- **컨텍스트 관리**: AST 파싱을 사용한 스마트 윈도우 관리

## 구현 패턴

| 패턴 | 설명 |
|------|------|
| TDD 통합 우선 | 유닛 테스트가 아닌 실제 사용 시나리오 |
| 백업 프로토콜 | deprecated (.cline 백업 미사용) |
| 주석 프로토콜 | `// CARETI MODIFICATION: [명확한 설명]` |
| 검증 프로토콜 | 테스트 → 컴파일 → 실행 |

## 주요 파일 위치

| 유형 | 위치 |
|------|------|
| 코어 로직 | `src/core/` |
| Caret 확장 | `careti-src/` |
| 통신 | `src/shared/ExtensionMessage.ts` |
| 웹뷰 | `webview-ui/src/App.tsx` |

## 통합 포인트

- VS Code API 통합 포인트
- AI 프로바이더 추상화 레이어
- 도구 시스템 확장성 포인트
- MCP (Model Context Protocol) 통합

## 가이드라인

- 개발자와 동일한 아키텍처 지식에 AI 접근 제공 (careti-architecture-and-implementation-guide.md)
- 3단계 수정 전략 이해에 집중
- Cline 수정보다 항상 Level 1 독립 모듈 선호
- Caret 확장을 가능하게 하면서 Cline 코어에 최소한의 방해를 위해 설계된 아키텍처

## 미러링 정책
- 이 파일 수정 시 `.agents/context/architecture-guide.yaml`도 동일하게 업데이트
