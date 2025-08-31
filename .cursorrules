{
  "ai-work-method": {
    "ai_work_protocol": {
      "core_principle": "업무 성격별 필수 문서 체크 없이는 코딩 시작 금지",
      "work_phases": {
        "phase_0": {
          "title": "필수 사전 검토 및 아키텍처 결정",
          "mandatory": true,
          "steps": [
            "사용자 식별 및 현재 날짜 확인",
            "작업 성격 분석 및 카테고리 식별",
            "아키텍처 결정 체크리스트 실행",
            "업무별 필수 문서 확인"
          ],
          "work_categories": [
            "Frontend-Backend 상호작용",
            "원본 파일 수정 관련",
            "컴포넌트/UI 개발",
            "테스트 관련 업무"
          ]
        },
        "phase_1": {
          "title": "TDD RED - 실패하는 테스트 작성",
          "approach": "통합 시나리오부터 시작",
          "principle": "실제 사용 시나리오의 통합 테스트부터 작성",
          "stop_points": [
            "테스트 파일 생성 전 경로 확인",
            "즉시 검증으로 테스트 인식 확인"
          ]
        },
        "phase_2": {
          "title": "TDD GREEN - 테스트 통과 구현",
          "principle": "최소한의 코드로 통합 테스트 통과",
          "stop_points": [
            "원본 파일 수정 전 백업 및 주석 체크",
            "새 파일 생성 전 디렉토리 확인",
            "즉시 검증으로 컴파일 에러 확인"
          ]
        },
        "phase_3": {
          "title": "TDD REFACTOR - 코드 품질 개선",
          "principle": "통합 테스트 유지하며 코드 구조 개선",
          "verification": [
            "전체 시스템 컴파일 성공",
            "모든 테스트 통과",
            "기존 기능 영향 없음 확인"
          ]
        }
      },
      "core_development_principles": [
        "품질 우선: 속도보다 정확성과 품질 우선",
        "테스트 필수: 모든 테스트 통과, 실패 시 근본 원인 해결",
        "문제 회피 금지: 임시 방편이나 '나중에 수정' 접근 금지",
        "기술 부채 방지: 처음부터 올바른 구현",
        "완전성 추구: 부분적/불완전한 상태로 작업 종료 금지",
        "검증 우선: 코드 변경 후 반드시 컴파일, 테스트, 실행 검증"
      ],
      "tdd_cycle_checklist": [
        "RED: 실제 사용 시나리오의 통합/E2E 테스트 작성 (실패 확인)",
        "GREEN: 통합 테스트가 통과하도록 최소 구현",
        "REFACTOR: 통합 테스트를 유지하며 코드 품질 개선",
        "반복: 다음 시나리오로 사이클 반복"
      ],
      "common_test_patterns": {
        "correct_approach": "실제 사용 시나리오의 통합 테스트부터 작성",
        "example_patterns": {
          "web_component": "컴포넌트 렌더링 → 사용자 상호작용 → 기대 결과 테스트",
          "api_service": "HTTP 요청 → 응답 전체 흐름 통합 테스트",
          "ui_feature": "사용자 시나리오 기반 End-to-End 테스트"
        },
        "anti_patterns": [
          "단위 함수 테스트부터 시작",
          "유틸리티 함수 테스트 우선",
          "구현 후 테스트 작성"
        ]
      },
      "testing_best_practices": {
        "mocking_guidelines": [
          "모든 모킹을 블록 내에서 직접 정의",
          "호이스팅 문제 방지 패턴 적용",
          "적절한 초기화 방법 선택"
        ],
        "verification_principles": [
          "테스트 파일 생성 후 즉시 실행으로 검증",
          "각 구현 후 관련 테스트 실행",
          "전체 테스트 스위트 정기 실행"
        ]
      },
      "approval_report_template": {
        "format": "마스터, {업무명} 관련 문서 분석 완료했습니다.\n\n📚 체크한 문서:\n- {문서1}: {얻은 정보 요약}\n- {문서2}: {얻은 정보 요약}\n\n🎯 작업 계획:\n- Phase 1: {계획}\n- Phase 2: {계획}\n\n⚠️ 주의사항:\n- {제약사항1}\n- {제약사항2}\n\n진행하겠습니다."
      },
      "forbidden_actions": [
        "즉시 코딩 시작: 관련 문서 체크 없이 바로 코드 수정",
        "패턴 무시: 기존 아키텍처 패턴 무시하고 임의 구현",
        "테스트 생략: 구현 후 테스트 작성하는 잘못된 순서",
        "문서 업데이트 생략: 새로운 패턴 발견 시 문서화 생략"
      ]
    }
  },
  "caretrules": {
    "project_overview": {
      "name": "Caret",
      "description": "VSCode AI coding assistant extension - Cline-based Fork project",
      "repository_url": "https://github.com/aicoding-caret/caret",
      "naming_convention": "Caret refers to the '^' (caret) symbol used in programming, representing position and direction in programming contexts. NOT a carrot (🥕)."
    },
    "architecture_principles": {
      "fork_structure": "Cline codebase directly integrated in src/ directory with minimal extension strategy",
      "directory_structure": {
        "src": "Cline original code (must preserve)",
        "caret_src": "Caret extension features (minimal)",
        "webview_ui": "React frontend (leveraging Cline build system)",
        "caret_assets": "Caret-specific resources",
        "caret_docs": "Caret documentation system",
        "caret_scripts": "Caret automation scripts"
      },
      "code_management_principles": [
        "Preserve Cline code: maintain src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/ and root config files",
        "Minimal extension: free modification only in caret-src/, caret-docs/, assets/",
        {
          "principle": "Principle of Extensibility: Inheritance vs. Direct Modification",
          "new_feature": "For new features, prioritize using inheritance to extend existing classes.",
          "modify_feature": "For modifying existing features, use overriding via inheritance if possible.",
          "direct_modification_condition": "If extension via inheritance is impossible due to private members, direct modification of the original file after backup is permitted as an exception, as this aligns with the 'minimal modification' principle."
        },
        "Backup mandatory: create .cline backup before modifying any Cline original file"
      ],
      "cline_original_file_modification_absolute_principles": {
        "directories": [
          "src/",
          "webview-ui/",
          "proto/",
          "scripts/",
          "evals/",
          "docs/",
          "locales/",
          "root config files"
        ],
        "principle_1": "Never touch commented-out unused code (for merging considerations)",
        "principle_2": "Minimal modification principle - 1-3 lines recommended",
        "principle_3": "Complete replacement when modifying, not commenting out",
        "principle_4": "Must add CARET MODIFICATION comment"
      },
      "backup_rules": {
        "backup_command": "cp src/extension.ts src/extension-ts.cline",
        "modification_marker": "// CARET MODIFICATION: description of Caret-specific functionality",
        "backup_format": "{filename-extension}.cline"
      },
      "file_modification_checklist": [
        "Is this a Cline original file? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/)",
        "Did you create backup? ({filename-extension}.cline)",
        "Did you add CARET MODIFICATION comment?",
        "Did you follow minimal modification principle? (1-3 lines within)",
        "Did you completely replace instead of commenting out?"
      ],
      "free_modification_areas": [
        "caret-src/: Complete freedom",
        "caret-docs/: Complete freedom",
        "caret-assets/: Complete freedom"
      ],
      "cline_patterns": [
        "Task execution system: streaming processing, race condition prevention with locking mechanisms",
        "API management: token tracking and automatic context management",
        "Error handling: automatic retry and user confirmation processes",
        "State management: Global/Workspace/Secrets multi-store, instance synchronization",
        "Real-time communication: Controller ↔ ExtensionStateContext pattern"
      ]
    },
    "development_environment": {
      "requirements": "Node.js 18+, npm/yarn, VSCode, Git",
      "setup_commands": [
        "git clone https://github.com/aicoding-caret/caret.git",
        "cd caret",
        "npm install",
        "cd webview-ui && npm install && cd ..",
        "npm run protos",
        "npm run compile"
      ],
      "build_commands": {
        "protos": "npm run protos",
        "compile": "npm run compile",
        "build_webview": "npm run build:webview",
        "watch": "npm run watch",
        "package": "npm run package"
      }
    },
    "development_process": {
      "git_commit_convention": "[type]: [description] - feat, fix, docs, style, refactor, test, chore",
      "state_management": "CaretProvider extends Cline's WebviewProvider, following Cline patterns with minimal extensions"
    },
    "ai_task_protocol": {
      "workflow_reference": "See .caretrules/workflows/ai-work-method.md for detailed AI work protocol implementation",
      "task_start_protocol": [
        "Phase 0 - MANDATORY Pre-Review: Task nature analysis and architecture decisions",
        "Phase 1 - TDD RED: Failing test creation with integration scenario first approach",
        "Phase 2 - TDD GREEN: Implementation with STOP POINTS for original file modifications",
        "Phase 3 - TDD REFACTOR: Code quality improvement and full system verification",
        "CRITICAL: Follow integration-first TDD approach (NOT unit-test-first)"
      ],
      "task_nature_mandatory_documents": {
        "frontend_backend_interaction": [
          "caret-docs/development/frontend-backend-interaction-patterns.mdx",
          "caret-docs/development/caret-architecture-and-implementation-guide.mdx (sections 10-11)"
        ],
        "cline_original_modification": [
          "File modification checklist in caret-docs/caretrules.ko.md",
          "Backup creation rules and CARET MODIFICATION comment requirements"
        ],
        "component_ui_development": [
          "caret-docs/development/component-architecture-principles.mdx",
          "VSCode theme integration and i18n patterns"
        ],
        "testing_related": [
          "caret-docs/development/testing-guide.mdx",
          "TDD mandatory principles (RED → GREEN → REFACTOR)"
        ],
        "persona_ai_character": [
          "caret-docs/development/frontend-backend-interaction-patterns.mdx (setPersona pattern)",
          "caret-docs/development/component-architecture-principles.mdx"
        ]
      },
      "core_principles": [
        "Quality first: prioritize accuracy and quality over speed",
        "Tests must pass: all tests must pass, fix root causes when tests fail",
        "No problem avoidance: no temporary fixes or 'fix later' approaches",
        "Prevent technical debt: implement correctly from the start",
        "Pursue completeness: never finish work in partial/incomplete state",
        "Verification first: always verify through compilation, testing, execution after code changes",
        "CARET comment mandatory: Must add CARET MODIFICATION comment when modifying Caret"
      ],
      "phase_based_work": {
        "planning": "Divide all work into clear Phase units, each Phase independently completable",
        "execution": "Before Phase start: reconfirm related guide documents and principles. Before file modifications: mandatory check 'Is this a Cline original file?'",
        "stop_points": {
          "stop_point_1": "Test file creation - verify include path before creation, immediate npm run test:webview verification",
          "stop_point_2": "Cline original file modification - backup creation, CARET MODIFICATION comment, minimal modification principle",
          "stop_point_3": "New file creation - verify correct directory (caret/ vs src/), import path validation",
          "immediate_verification": "File creation/modification followed by immediate compile/test verification for early problem detection"
        }
      },
      "file_modification_mandatory_checklist": [
        "Is this a Cline original file? (src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/)",
        "Did you create backup correctly? (Follow backup_safety_rules below)",
        "Did you add CARET MODIFICATION comment?",
        "Did you follow minimal modification principle? (1-3 lines within)",
        "Did you completely replace instead of commenting out old code?",
        "Did you check storage type? (globalState vs workspaceState)",
        "Do save and load locations match?",
        "Do related files use consistent storage patterns?",
        "🚨 Rule file modification: Did you run node caret-scripts/sync-caretrules.js after caretrules.ko.md changes?"
      ],
      "backup_safety_rules": {
        "backup_naming": "{filename-extension}.cline (e.g., ChatTextArea.tsx.cline)",
        "backup_target_directories": [
          "src/, webview-ui/, proto/, scripts/, evals/, docs/, locales/",
          "Root config files (package.json, tsconfig.json, .vscode/settings.json, etc.)"
        ],
        "backup_creation_conditions": [
          "NEW modification: Create backup only if .cline backup does not exist",
          "EXISTING backup: NEVER overwrite existing .cline backup files",
          "VERIFICATION: Always check backup existence before creation"
        ],
        "powershell_commands": {
          "check_backup_exists": "Test-Path 'filepath.cline'",
          "create_backup_safely": "if (!(Test-Path 'filepath.cline')) { Copy-Item 'original' 'filepath.cline' }",
          "find_existing_backups": "Get-ChildItem -Recurse -Filter '*.cline' | Where-Object { $_.Name -like '*filename*' }"
        },
        "forbidden_actions": [
          "Overwriting existing .cline backup files",
          "Modifying Cline original files without backup",
          "Directly editing .cline backup files"
        ],
        "verification_steps": [
          "Confirm backup file exists and is identical to pre-modification original",
          "Test that backup can restore original functionality",
          "Document modification reason and expected impact"
        ]
      },
      "storage_usage_principles": {
        "chatSettings": "workspaceState (project-specific settings)",
        "globalSettings": "globalState (global settings)",
        "consistency_rule": "Save and load must use same storage type"
      },
      "complexity_explosion_prevention": [
        "Maximum 3 files modification at once",
        "Analyze existing feature impact before adding new features",
        "Step-by-step progression: Proto → Backend → Frontend",
        "Complete testing and verification after each step"
      ],
      "cline_original_modification_additional_principles": [
        "Test existing functionality before modification",
        "Verify no impact on existing features after modification",
        "Confirm backup file allows recovery anytime",
        "Document modification reason and expected impact"
      ],
      "problem_analysis_systematic_approach": [
        "Record symptoms (alert usage, log not showing, etc.)",
        "Establish hypotheses (list multiple possibilities)",
        "Explore root causes (code-level analysis)",
        "Identify impact scope (related systems check)",
        "Prioritize solution approaches"
      ],
      "self_diagnosis": "When principle violations or unclear guidelines are detected, halt work and request guide improvements",
      "ai_mistake_prevention_summary": {
        "architecture_decision_mistakes": "Caret-specific features must be in caret/ folders, Cline originals require minimal modification",
        "test_location_mistakes": "webview tests only in src/caret/**/*.test.tsx, verify include path settings",
        "backup_omission_prevention": "Cline original modification requires backup creation and CARET MODIFICATION comment before any changes",
        "immediate_verification_principle": "File creation/modification followed by immediate compile/test for early problem detection",
        "rule_sync_omission_prevention": "caretrules.ko.md modification MUST be followed by node caret-scripts/sync-caretrules.js execution"
      },
      "session_continuity": {
        "next_session_guide_location": "caret-docs/work-logs/{username}/next-session-guide.md",
        "purpose": "AI session transition with perfect context preservation",
        "update_timing": "Mandatory creation/update after each subtask completion",
        "standard_structure": {
          "current_progress": "Completed work, current state, verification results",
          "important_decisions": "Design decisions, constraints, cautions",
          "next_step_preparation": "Next task goals, required files, verification methods",
          "developer_notes": "Design intent, alternative considerations, future improvements"
        },
        "ai_session_transition_checklist": [
          "Current work completion confirmation: commit all changes",
          "next-session-guide.md update: record current situation and next steps",
          "Verification results recording: passed tests and confirmed functions",
          "Important decision documentation: design intent and constraints",
          "Next session preparation: enable new AI to start work immediately"
        ]
      },
      "development_method_evolution": {
        "change_detection": "Immediately document when new development patterns, tools, or methodologies are introduced",
        "guide_synchronization": "Prioritize updates when inconsistencies between actual implementation and documentation are found",
        "experience_accumulation": "Reflect insights gained from problem-solving processes into guides",
        "practical_reflection": "Prioritize methodologies verified in actual work over theoretical content",
        "examples": "Integration test method changes (mocking → actual build verification), module system compatibility issue resolution, etc."
      }
    },
    "documentation_system": {
      "standardization_completed": "2025-01-21 completed",
      "achievements": [
        "MDX format: all development documents unified to .mdx format",
        "Integration completed: UI-to-Storage-Flow related 10 split documents merged into 1",
        "Real code alignment: all paths/examples match actual codebase",
        "Framework update: Jest → Vitest conversion completed",
        "Unnecessary document cleanup: work documents/review reports cleaned up",
        "Cline pattern integration: Cline technical patterns integrated into architecture guide"
      ],
      "documentation_optimization": {
        "completed_date": "2025-01-21",
        "test_guide_integration": {
          "before": "3 separate files: testing-guide.mdx (799 lines), test-writing-standards.mdx (750 lines), tdd-guide.mdx (524 lines)",
          "after": "1 unified file: testing-guide.mdx (1799 lines)",
          "token_reduction": "13% reduction in test documentation tokens"
        },
        "ui_storage_guide_cleanup": {
          "removed_files": [
            "ui-to-storage-flow-integrated.mdx"
          ],
          "maintained_files": [
            "ui-to-storage-flow.mdx"
          ],
          "token_reduction": "17% reduction in UI-Storage documentation tokens"
        },
        "connectivity_improvements": {
          "readme_enhancement": "README.ko.md developer section expanded 30x with structured categories",
          "developer_guide_strengthening": "DEVELOPER_GUIDE.md enhanced with workflow and categorized guides",
          "organic_linking": "Systematic cross-document linking established"
        },
        "overall_results": {
          "file_reduction": "7% reduction (44 → 41 files)",
          "token_cost_savings": "13% overall token reduction",
          "user_experience": "Significantly improved accessibility and connectivity"
        }
      },
      "core_documents": [
        "Development guide: ./development/index.mdx",
        "Architecture guide: ./development/caret-architecture-and-implementation-guide.mdx",
        "Testing guide: ./development/testing-guide.mdx (Vitest-based)",
        "Logging guide: ./development/logging.mdx"
      ],
      "writing_standards": [
        "Term consistency: Caret refers to '^' symbol (NOT carrot 🥕)",
        "Path accuracy: must exactly match actual codebase",
        "Example code: include only working code examples",
        "MDX format: all technical documents in .mdx format"
      ],
      "task_document_format": {
        "task_number": "3-digit numbers (001, 002, ...)",
        "master_task": "{task-number}-{task-name}.md (overall context and goals)",
        "sub_task": "{task-number}-{sub-number}-{sub-task-name}.md (individual implementation)",
        "unified_format": "Plan + Checklist integrated in single document",
        "ai_session_based": "All tasks must be completable in single AI conversation session",
        "size_limits": "Context window <50%, 1-3 files, 2-4 hours work, 3-5 phases max",
        "writing_guide": "Reference caret-docs/guides/writing-task-documents-guide.mdx for detailed requirements"
      },
      "multilingual_structure": {
        "principle": "Korean documents are the source of truth. English translations use '.en' suffix.",
        "readme_files": {
          "ko": "README.ko.md",
          "en": "README.md",
          "ja": "README.ja.md",
          "zh-cn": "README.zh-cn.md"
        },
        "readme_link_rule": "Japanese and Chinese READMEs must link to English versions of other documents (e.g., CONTRIBUTING.en.md).",
        "other_documents": "Files like CONTRIBUTING.md and DEVELOPER_GUIDE.md must have corresponding .en.md versions.",
        "sync_rule": "When updating a document, its translated counterparts must also be updated to maintain consistency."
      }
    },
    "testing_quality": {
      "framework": "Vitest (updated)",
      "commands": {
        "individual_backend_test": "npm run test:backend [file-path] [-t 'test-name']",
        "individual_frontend_test": "npm run test:webview",
        "backend_watch": "npm run test:backend:watch",
        "fast_dev_test": "npm run dev:build-test:fast",
        "full_test_with_coverage": "npm run test:all && npm run caret:coverage",
        "WARNING": "Do NOT use 'npm test' - it runs full build+compile+lint+all tests (very slow)"
      },
      "test_standards": "import { describe, it, expect, vi } from 'vitest' - AAA pattern (Arrange, Act, Assert)",
      "quality_standards": [
        "Caret-specific code: 100% test coverage goal",
        "TDD methodology: Red-Green-Refactor cycle",
        "Test first: write tests before implementing features"
      ],
      "tdd_mandatory_checklist": [
        "Test code written (RED)",
        "Minimal implementation passes test (GREEN)",
        "Refactoring completed (REFACTOR)",
        "No code commits without these 3 steps"
      ],
      "ai_assistant_tdd_principles": [
        "Start with 'I'll write tests first' when implementation requested",
        "Refuse implementation without tests and suggest TDD approach",
        "Break complex features into step-by-step TDD"
      ],
      "integration_test_requirements": [
        "Run actual tests in Extension Host environment",
        "Verify entire settings save/load flow",
        "Test both mocked and actual environments",
        "Include storage inconsistency verification tests"
      ],
      "test_verification_stages": [
        "Unit tests: individual functions/components",
        "Integration tests: complete flow (MANDATORY)",
        "E2E tests: actual Extension Host environment"
      ],
      "logging_system": {
        "backend": "Integrated Logger (backend): src/services/logging/Logger.ts (CaretLogger-based with Cline API compatibility)",
        "frontend": "WebviewLogger (frontend): webview-ui/src/caret/utils/webview-logger.ts",
        "automatic_mode_detection": "Development mode: DEBUG level + console output, Production mode: INFO level + VSCode output channel only"
      },
      "test_architecture_principles": {
        "service_code_purity": "NEVER include test-only methods in service/production classes",
        "test_helper_pattern": "Use separate TestHelper classes for test-only functionality",
        "directory_structure": "caret-src/__tests__/helpers/ for test helper classes",
        "forbidden_in_service_code": [
          "Methods only used by tests",
          "Test-specific setup/teardown logic",
          "Mock-related functionality",
          "Test validation methods"
        ],
        "testhelper_naming": "{ServiceName}TestHelper.ts in __tests__/helpers/",
        "exception_fortest_prefix": {
          "condition": "Only when absolutely necessary for internal state access",
          "naming": "forTestOnly_ or forTest_ prefix mandatory",
          "justification": "Must document why TestHelper pattern cannot be used"
        },
        "architecture_benefits": [
          "Clear responsibility separation",
          "Production code clarity",
          "Test code maintainability",
          "No test pollution in APIs"
        ]
      }
    },
    "project_management": {
      "script_management": "Caret scripts located in caret-scripts/ (separate from Cline scripts/)",
      "key_scripts": [
        "node caret-scripts/caret-coverage-check.js",
        "node caret-scripts/sync-caretrules.js",
        "node caret-scripts/test-report.js"
      ],
      "upstream_merging": "Cline update integration process - change verification, conflict resolution (src/ directory), compatibility testing, documentation updates",
      "rules_management": {
        "master_file": "caretrules.ko.md (Korean template for human readability)",
        "source_of_truth": ".caretrules (JSON format, the actual rule data)",
        "sync_procedure": [
          "Step 1: Modify caretrules.ko.md to document the rule change for readability.",
          "Step 2: Directly modify the .caretrules JSON file to change the actual rule data.",
          "Step 3: Run 'node caret-scripts/sync-caretrules.js' to synchronize the changes from .caretrules to other rule files."
        ],
        "ai_mandatory_task": "AI must strictly follow the 3-step sync procedure without skipping or changing the order.",
        "sync_targets": [
          ".cursorrules",
          ".windsurfrules (JSON format)"
        ],
        "content_principles": {
          "include_only": "Immutable project principles and core architectural decisions",
          "exclude_always": [
            "Time-sensitive status",
            "Specific dates",
            "Current progress",
            "Detailed implementation",
            "Tool-specific configurations"
          ],
          "ai_error_prevention": "AI must halt work if attempting to add non-essential information to .caretrules"
        }
      }
    },
    "key_reference_files": {
      "config_files": [
        ".caretrules",
        "caret-docs/caretrules.ko.md",
        "caret-docs/development/index.mdx"
      ],
      "entry_points": [
        "caret-src/extension.ts",
        "caret-src/core/webview/CaretProvider.ts",
        "src/extension.ts"
      ],
      "frontend": [
        "webview-ui/src/App.tsx",
        "webview-ui/src/context/ExtensionStateContext.tsx",
        "webview-ui/src/caret/"
      ]
    }
  }
}