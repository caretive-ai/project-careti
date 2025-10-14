Caret 개발을 위한 3단계 수정 전략을 따르고 있습니다.

<detailed_sequence_of_steps>
# Modification Levels - L1 → L2 → L3 결정 프레임워크

## 핵심 원칙
**항상 상위 레벨을 선호합니다 (L1 > L2 > L3). 하위 레벨은 더 강한 근거가 필요합니다.**

## Level 1: 독립 모듈 (선호)
**위치**: `caret-src/`, `caret-docs/`
**자유도**: 완전한 구현 자유도
**요구사항**: 없음 (백업, 주석 불필요)
**사용 사례**:
- 새로운 Caret 기능
- Caret 전용 유틸리티
- 문서 업데이트
- 독립 서비스

```typescript
// 예시: caret-src/services/persona-service.ts
export class PersonaService {
  // 완전한 구현 자유도
}
```

## Level 2: 조건부 통합 (신중)
**위치**: Cline 파일들 (`src/`, `webview-ui/`, `proto/`, `scripts/`)
**요구사항**: 
- **필수 주석**: `// CARET MODIFICATION: [설명]`
- **최소한의 변경**: 파일당 최대 1-3라인
- **완전한 교체**: 기존 코드 주석 처리 금지
- **검증 필수**: 모든 테스트 통과 필요

**결정 기준**:
- [ ] L1 접근법이 불가능한가?
- [ ] 이 변경사항이 장기적으로 안정적인가?
- [ ] 수정이 정말 최소한인가?
- [ ] 업스트림 머지와 깔끔하게 통합될 수 있는가?

```typescript
// 예시: src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  // CARET MODIFICATION: Caret wrapper 초기화
  const caretWrapper = new CaretProviderWrapper(context);
  // ... 나머지 Cline 코드는 변경 없음
}
```

## Level 3: 직접 수정 (최후 수단)
**요구사항**:
- **완전한 문서화**: 완전한 근거 필요
- **영향 분석**: 영향받는 모든 시스템 문서화
- **응급 상황만**: L1/L2가 불가능한 경우

**사용 사례**:
- 기다릴 수 없는 중요한 버그 수정
- 핵심 아키텍처 변경 (드문 경우)
- 즉시 수정이 필요한 보안 문제

## 결정 트리
```
새 기능 필요
├─ L1 독립이 가능한가? → caret-src/ 사용
├─ Cline과 통합해야 하나?
│  ├─ 1-3라인으로 가능한가? → 주석과 함께 L2
│  └─ 대대적 변경 필요? → 완전한 문서와 함께 L3
```

## 관련 Workflow
- L2 수정을 위해 `/modification-protocol` 사용
- L2 표시를 위해 `/comment-protocol` 사용
- 레벨 선택 시 `/critical-verification` 적용
</detailed_sequence_of_steps>

<general_guidelines>
이 프레임워크는 Caret 확장을 가능하게 하면서 Cline의 무결성을 보존합니다.

목표는 업스트림 머지에 최소한의 방해로 최대한의 기능을 제공하는 것입니다.

확실하지 않을 때는 L1부터 시도하세요 - 필요하면 언제든 L2/L3로 확대할 수 있습니다.
</general_guidelines>