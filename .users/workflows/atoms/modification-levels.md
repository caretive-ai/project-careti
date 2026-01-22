# 수정 레벨 - L1 → L2 → L3 결정 프레임워크

캐러티 개발을 위한 3단계 수정 전략을 따릅니다.

## 핵심 원칙
**항상 상위 레벨 선호 (L1 > L2 > L3). 하위 레벨은 더 강한 정당화 필요.**

## Level 1: 독립 모듈 (권장)
**위치**: `careti-src/`, `careti-docs/`
**자유도**: 완전한 구현 자유
**요구사항**: 없음 (백업 불필요, 주석 불필요)
**사용 사례**:
- 새로운 Caret 기능
- Caret 전용 유틸리티
- 문서 업데이트
- 독립 서비스

```typescript
// 예: careti-src/services/persona-service.ts
export class PersonaService {
  // 완전한 구현 자유
}
```

## Level 2: 조건부 통합 (주의 필요)
**위치**: Cline 파일 (`src/`, `webview-ui/`, `proto/`, `scripts/`)
**요구사항**:
- **필수 주석**: `// CARETI MODIFICATION: [설명]`
- **최소 변경**: 파일당 최대 1-3줄
- **완전 교체**: 기존 코드 주석 처리 금지
- **검증 필요**: 모든 테스트 통과 필수

**결정 기준**:
- [ ] L1 접근이 불가능한가?
- [ ] 이 변경이 장기적으로 안정적인가?
- [ ] 수정이 정말 최소한인가?
- [ ] 업스트림 병합과 깔끔하게 통합될 수 있는가?

```typescript
// 예: src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  // CARETI MODIFICATION: Initialize Caret wrapper
  const caretWrapper = new CaretProviderWrapper(context);
  // ... 나머지 Cline 코드 변경 없음
}
```

## Level 3: 직접 수정 (최후 수단)
**요구사항**:
- **완전한 문서화**: 완전한 근거 필요
- **영향 분석**: 영향받는 모든 시스템 문서화
- **긴급 상황 전용**: L1/L2 불가능할 때만

**사용 사례**:
- 기다릴 수 없는 심각한 버그 수정
- 핵심 아키텍처 변경 (드문 경우)
- 즉각 수정이 필요한 보안 이슈

## 결정 트리
```
새 기능 필요
├─ L1 독립으로 가능한가? → careti-src/ 사용
├─ Cline과 통합이 필수인가?
│  ├─ 1-3줄로 가능한가? → L2 + 주석
│  └─ 대규모 변경 필요? → L3 + 완전한 문서
```

## 관련 워크플로우
- L2 수정 시 `/modification-protocol` 사용
- L2 표시 시 `/comment-protocol` 사용
- 레벨 선택 시 `/critical-verification` 적용

## 일반 가이드라인
이 프레임워크는 Caret 확장을 가능하게 하면서 Cline의 무결성을 보존합니다.

목표는 업스트림 병합에 최소한의 영향으로 최대 기능성입니다.

확신이 없으면 먼저 L1 시도 - 필요하면 언제든 L2/L3로 에스컬레이션 가능합니다.

## 미러링 정책
- 이 파일 수정 시 `.agents/workflows/atoms/modification-levels.md`도 동일하게 업데이트
