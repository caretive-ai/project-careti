Caret 프로젝트 개발을 위한 포괄적인 아키텍처 가이드에 액세스하고 있습니다.

<detailed_sequence_of_steps>
# 아키텍처 가이드 - 시스템 설계 & 구현

## 핵심 아키텍처 원칙
1. **최소 Cline 확장**: 최대한의 보존을 위한 포크 전략
2. **수준별 수정**: L1 독립 → L2 조건부 → L3 직접
3. **명확한 분리**: caret-src/ vs src/ 구분

## 아키텍처 수준
**레벨 1 - 독립 모듈** (선호):
- 위치: caret-src/, caret-docs/
- 자유도: 완전한 구현 자유
- 백업이나 주석 요구사항 없음

**레벨 2 - 조건부 통합** (주의):
- 최소한의 Cline 파일 수정 (최대 1-3줄)
- 필수: 백업 + CARET MODIFICATION 주석
- 보호된 디렉토리: src/, webview-ui/, proto/, scripts/

**레벨 3 - 직접 수정** (최후의 수단):
- 완전한 문서화 필수
- 완전한 영향 분석
- 응급 상황에만 사용

## 스토리지 & 상태 패턴
- **chatSettings**: workspaceState (프로젝트별)
- **globalSettings**: globalState (사용자별)
- 일관성 규칙: 관련 설정에 대해 동일한 스토리지 타입

## 확장 아키텍처
- **진입점**: extension.ts
- **통신**: WebviewProvider ↔ Controller ↔ Task
- **메시지 플로우**: 타입 안전성을 위한 Protocol Buffers
- **컨텍스트 관리**: AST 파싱과 함께 스마트 윈도우 관리

## 구현 패턴
1. **TDD 통합 우선**: 단위 테스트가 아닌 실제 사용 시나리오
2. **백업 프로토콜**: {filename-extension}.cline 형식
3. **주석 프로토콜**: // CARET MODIFICATION: [명확한 설명]
4. **검증 프로토콜**: 테스트 → 컴파일 → 실행

## 핵심 파일 위치
- 핵심 로직: src/core/
- Caret 확장: caret-src/
- 통신: src/shared/ExtensionMessage.ts
- 웹뷰: webview-ui/src/App.tsx

## 통합 지점
- VS Code API 통합 지점
- AI 프로바이더 추상화 레이어
- 도구 시스템 확장성 지점
- MCP (Model Context Protocol) 통합
</detailed_sequence_of_steps>

<general_guidelines>
이 워크플로우는 개발자가 caret-architecture-and-implementation-guide.mdx 문서를 통해 갖는 것과 동일한 아키텍처 지식에 AI가 액세스할 수 있도록 제공합니다.

3단계 수정 전략을 이해하는 데 초점을 맞추고 항상 Cline 수정보다 레벨 1 독립 모듈을 선호하세요.

아키텍처는 Caret별 확장을 가능하게 하면서 Cline의 핵심 기능에 대한 최소한의 중단을 위해 설계되었습니다.
</general_guidelines>