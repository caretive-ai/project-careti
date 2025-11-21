# 수정된 작업 계획: AI-개발자 지식 동기화 시스템 문서화 (v2)

## 1. 목표
마스터의 피드백을 반영하여, 프로젝트의 핵심 정체성을 담아 문서 관리 시스템을 설명하는 `features` 문서를 올바른 명명 규칙으로 생성하고, `README.md`의 기능 목록에 정식으로 추가한다.

## 2. 세부 계획

### 단계 1: 상세 설명 문서 생성 (`f11`)
- **파일명**: `caret-docs/features/f11-ai-developer-knowledge-parity.md` (규칙 준수)
- **내용 (정체성 반영)**:
  ```markdown
  ---
  title: "F11: AI-개발자 지식 동기화 시스템"
  description: "Caret의 핵심 정체성인 '진정한 AI 파트너'를 구현하는 AI와 개발자 간의 1:1 지식 동기화 시스템을 알아봅니다."
  ---

  # F11: AI-개발자 지식 동기화 시스템

  Caret는 단순한 코딩 도구를 넘어, **사용자와 함께 성장하는 'AI 코딩 파트너'**를 지향합니다. 이 비전을 실현하는 핵심 기술이 바로 AI와 개발자가 완벽하게 동일한 지식을 공유하는 **1:1 지식 동기화 시스템**입니다.

  ## 왜 필요한가요? 진정한 파트너십을 위해
  진정한 파트너는 서로 같은 정보를 보고 대화해야 합니다. 이 시스템은 AI와 개발자 간의 정보 불균형을 없애, AI가 개발자의 의도를 정확히 파악하고 개발자는 AI의 작업 방식을 신뢰할 수 있는 환경을 만듭니다.

  ## 핵심 구조: `.caretrules`와 `caret-docs`
  이 시스템은 목적에 따라 분리된 두 개의 디렉토리를 통해 운영되며, AI에 의해 항상 동기화됩니다.

  - **`.caretrules/` (AI의 두뇌)**: AI가 작업을 수행하기 위해 직접 참조하는 규칙과 워크플로우의 집합입니다. 기계가 가장 효율적으로 처리할 수 있는 `YAML`, `JSON` 등의 형식으로 구성되어 있습니다.

  - **`caret-docs/` (개발자의 설명서)**: 개발자가 AI의 작업 방식과 프로젝트의 규칙을 쉽게 이해할 수 있도록 작성된 인간 친화적인 문서입니다.

  이 이중 구조와 자동 동기화 덕분에, Caret의 AI는 단순한 명령 실행자가 아닌, 프로젝트의 규칙을 완벽히 이해하는 진정한 팀원으로 기능할 수 있습니다.

  더 자세한 개발 규칙은 [Caret 개발 규칙 (한국어)](../development/caret-rules.ko.md) 문서를 참조하세요.
  ```

### 단계 2: README.md 기능 테이블 업데이트
- **대상 파일**: `README.md`
- **수정 방식**: `replace_in_file`을 사용하여 기능 테이블에 F11 행을 추가합니다.
- **변경 내용**:
  ```diff
  ------- SEARCH
  | **F10** | **Input History System** | Terminal-like command history | [📖 Details](caret-docs/features/f10-input-history-system.md) |

  </div>
  =======
  | **F10** | **Input History System** | Terminal-like command history | [📖 Details](caret-docs/features/f10-input-history-system.md) |
  | **F11** | **Knowledge Parity System** | Ensures AI and developers share the same knowledge for seamless collaboration | [📖 Details](caret-docs/features/f11-ai-developer-knowledge-parity.md) |

  </div>
  +++++++ REPLACE
  ```

### 단계 3: Features 인덱스 파일 업데이트
- **대상 파일**: `caret-docs/features/index.md`
- **수정 방식**: `replace_in_file`을 사용하여 F11 항목을 추가합니다.

## 3. 실행 순서
1. 이 계획에 대해 마스터의 승인을 받습니다.
2. `write_to_file`로 `caret-docs/features/f11-ai-developer-knowledge-parity.md` 파일을 생성합니다.
3. `replace_in_file`로 `README.md`의 기능 테이블을 업데이트합니다.
4. `replace_in_file`로 `caret-docs/features/index.md`를 업데이트합니다.
5. 모든 작업 완료 후 최종 보고합니다.
