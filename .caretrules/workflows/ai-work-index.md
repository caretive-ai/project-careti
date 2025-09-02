You are working with the Caret project and need to efficiently select relevant documentation based on work nature.

<detailed_sequence_of_steps>
# AI Work Index - Context Efficiency Guide

## 1. Analyze Work Nature (30 seconds)
Extract keywords from user request to categorize work:

**Architecture & Design**:
Keywords: 아키텍처, 설계, 구조, 시스템, 확장, Fork, Cline 수정
→ Read: caret-architecture-and-implementation-guide.mdx, extension-architecture.mmd

**AI System Development**:
Keywords: AI, 메시지, 시스템 프롬프트, chatbot, agent, 대화
→ Read: ai-message-flow-guide.mdx, system-prompt-implementation.mdx

**Frontend-Backend Communication**:
Keywords: webview, 통신, 상태 관리, 메시지 전송, UI 연동
→ Read: frontend-backend-interaction-patterns.mdx, webview-extension-communication.mdx

**UI/UX Development**:
Keywords: 컴포넌트, React, UI, UX, 페르소나, 다국어, i18n
→ Read: component-architecture-principles.mdx, locale.mdx

**Testing & Quality**:
Keywords: 테스트, TDD, 품질, 커버리지, 검증, 버그
→ Read: testing-guide.mdx, logging.mdx

**Development Tools**:
Keywords: 유틸리티, 도구, 파일 처리, 이미지, 링크, 빌드
→ Read: utilities.mdx, file-storage-and-image-loading-guide.mdx

**Cline Original Modification**:
Keywords: Cline 수정, 원본 변경, src/ 디렉토리, 백업
→ Read: caret-architecture-and-implementation-guide.mdx + re-check .caretrules backup rules

## 2. Smart Reading Strategy (5-10 minutes)
- **High Priority**: Direct relevance (1-2 docs max)
- **Medium Priority**: Indirect relevance (scan only if needed)
- **Low Priority**: Reference docs (check links only)

## 3. Essential Pre-Work Checks
- [ ] .caretrules file modification checklist confirmed
- [ ] TDD principle (Red → Green → Refactor) understood
- [ ] Backup creation plan (for Cline original modifications)
- [ ] CARET MODIFICATION comment plan (for Cline original modifications)

## 4. Next Step
After document selection and reading, use `/ai-work-protocol` for detailed phase-based implementation approach.
</detailed_sequence_of_steps>

<general_guidelines>
This workflow optimizes AI context usage by selecting only relevant documents based on work nature keywords.

The goal is maximum efficiency with minimal context usage - read only what's necessary for the specific task.

Always follow the sequence: work analysis → document selection → focused reading → protocol execution.
</general_guidelines>