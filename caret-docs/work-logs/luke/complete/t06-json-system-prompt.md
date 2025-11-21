# t06 마스터 플랜: 하이브리드 프롬프트 시스템 구축 v7.0

## 1. 목표

`cline-latest`의 진보된 **컴포넌트 아키텍처**와 **'작업 관리 루프'**를 구조적 뼈대로 채택하고, 그 위에 Caret의 **CHATBOT/AGENT 행동 철학**과 **JSON 기반 콘텐츠 관리**의 장점을 완벽하게 통합하여, 두 시스템의 장점만을 결합한 **궁극의 하이브리드 프롬프트 시스템**을 구축한다.

---

## 2. 📜 Caret 개발 원칙

이 작업과 모든 하위 작업은 다음의 Caret 핵심 개발 원칙을 반드시 준수해야 합니다.

*   **품질 우선**: 속도보다 정확성을 우선하며, 기술 부채를 남기지 않습니다.
*   **TDD 필수**: 모든 기능은 `RED -> GREEN -> REFACTOR` 사이클을 따르며, 통합 테스트를 우선합니다.
*   **검증 필요**: 모든 변경 후에는 `Test -> Compile -> Execute`의 검증 절차를 거칩니다.
*   **L1 독립 모듈 선호**: `caret-src/` 내의 독립적인 모듈 구현을 최우선으로 하여 Cline 원본 코드 수정을 최소화합니다.

---

## 3. 🗺️ 마스터 플랜 및 하위 작업 문서

이 문서는 전체 작업의 흐름을 관리하는 마스터 플랜입니다. 각 Phase의 상세한 작업 내용과 체크리스트는 별도의 하위 문서에서 관리됩니다.

| Phase | 작업명 | 상세 계획 및 체크리스트 | 상태 |
| :--- | :--- | :--- | :--- |
| **Phase 1** | 신규 기능 분석 및 JSON 확장 | [t06-phase1-analysis.md](./t06-phase1-analysis.md) | ⏳ 대기 |
| **Phase 2** | 어댑터 뼈대 구축 및 핵심 철학 이식 | [t06-phase2-adapter.md](./t06-phase2-adapter.md) | ⏳ 대기 |
| **Phase 3** | 전체 기능 통합 및 의미론적 검증 | [t06-phase3-integration.md](./t06-phase3-integration.md) | ⏳ 대기 |
| **Phase 4** | 프론트엔드 통합 및 E2E 검증 | [t06-phase4-frontend.md](./t06-phase4-frontend.md) | ⏳ 대기 |
| **Phase 5** | cline-latest 교차검증 및 시스템 프롬프트 개선 | [t06-phase5-cross-validation.md](./t06-phase5-cross-validation.md) | ⏳ 대기 |
| **Phase 6** | 최종 안정화, 최적화 및 문서화 | [t06-phase6-stabilization.md](./t06-phase6-stabilization.md) | ⏳ 대기 |

---

## 4. 핵심 전략: "구조는 cline-latest, 영혼은 Caret"

-   **기반 아키텍처**: 현재 프로젝트에 이미 존재하는 `cline-latest`의 `PromptRegistry`와 컴포넌트 시스템을 그대로 활용한다.
-   **핵심 철학**: Caret의 CHATBOT/AGENT 모드, `mode_restriction`을 통한 도구 제한, JSON을 통한 콘텐츠 관리 및 토큰 효율성의 장점을 모두 계승한다.
-   **통합 패턴**: `CaretJsonComponentProvider` 어댑터와 `PromptSystemManager` 전략 패턴을 사용하여 두 시스템을 유연하게 결합한다.
