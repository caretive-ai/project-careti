# Caret Project: Vision and Development Roadmap

**Document Version:** 1.0
**Date:** 2025-XX-XX (To be updated by Alpha)
**Author:** Alpha (AI Assistant)

## 1. Introduction

### 1.1 Project Background

The Caret project originated based on the open-source AI coding assistant, [Cline](https://github.com/cline/cline). While Cline provided a strong foundation, it had limitations in supporting modern AI-driven development workflows, especially the "Vibe Coding" paradigm, lacking real-time collaboration, advanced context management, robust file handling, and core development infrastructure. Caret aims to overcome these limitations and build a next-generation development environment where developers and AI collaborate closely.

### 1.2 Caret Vision: AI-Powered Vibe Coding Partner

Caret's ultimate vision is to become a **'Vibe Coding' development partner where AI and human developers communicate and collaborate in real-time to create innovative software**. To achieve this, Caret strives for the following characteristics:

*   **Real-time Collaboration:** An environment where multiple users and AI agents can simultaneously share and edit the workspace state.
*   **Intelligent Agents:** Beyond a single agent, a multi-agent system consisting of a Supervisor (Alpha) coordinating tasks and Specialist agents (Coder, Tester, etc.) performing specific jobs.
*   **Deep Context Understanding:** Providing accurate and relevant context through an advanced RAG (Retrieval-Augmented Generation) system that understands code structure and semantics.
*   **Flexible Control & Customization:** Allowing users to finely control AI behavior and project rules through the `.caretrules` policy system and a prompt control DSL.
*   **Robust & Efficient Execution:** Supporting stable file modifications, optimized LLM usage (cost & performance), and a strong development infrastructure (logging, i18n).
*   **(Long-term) Visual Workflow:** Exploring support for visual flow-based logic composition and LLM orchestration, moving beyond code-centric development.

### 1.3 Purpose of this Document

Based on the analysis of Caret's current state, this document aims to present a concrete **development strategy** and **phased roadmap** to achieve the vision outlined above. It will serve as a guideline to clarify the project's direction and enable efficient development execution.

## 2. Current State Analysis Summary

Based on various internal reports ([`Caret Project Direction Determination and Implementation Strategy Establishment`](../reports/Caret%20프로젝트%20방향성%20결정%20및%20구현%20전략%20수립.md), [`Caret Project Structure Improvement Research Report`](../reports/Caret%20프로젝트%20구조%20개선%20연구%20보고서.md), [`AI-based TypeScript IDE File Modification Command Optimization Strategy Research Report`](../reports/AI%20기반%20TypeScript%20IDE%20파일%20수정%20명령%20최적화%20전략%20연구%20보고서.md), etc.) and analysis of the Caret codebase, Caret currently possesses the following key strengths and weaknesses:

**Strengths:**

*   Type safety and development convenience based on TypeScript.
*   Familiar development environment as a VSCode extension.
*   Basic AI model integration and tool usage capabilities exist.
*   Initial design attempts considering modularity and extensibility.

**Weaknesses:**

*   **Lack of Real-time Collaboration:** No state synchronization mechanism (Vibe Coding impossible).
*   **Single Agent Limitation:** Difficulty in handling complex tasks and inter-agent collaboration.
*   **Inadequate Context Management:** Simple prompt-based, inefficient RAG, lack of automatic synchronization.
*   **Unstable File Handling:** Potential for errors due to simple text-based modifications (encoding, structural damage, concurrency conflicts, etc.).
*   **Architectural Issues:** Massive controller (`controller/index.ts`), inflexible message types (`WebviewMessage.ts`), distributed configuration management.
*   **Lack of Core Infrastructure:** Absence of a structured logging system, no multilingual support.
*   **Performance & Cost Inefficiency:** Potential for excessive token usage and costs due to unoptimized context delivery ([`LLM Integration Analysis Report`](../reports/LLM%20통합%20분석%20보고서%20-%20코딩%20자동화%20및%20실무%20병합%20작업%20기반%20ToC%20최적화%20전략.md) reference).

## 3. Caret Vision and Specific Goals

To achieve Caret's long-term vision, we set the following specific goals:

*   **[Goal 1] Build Real-time Collaboration Environment (Vibe Coding Foundation):** Implement CRDT (Yjs)-based real-time state synchronization mechanism.
*   **[Goal 2] Implement Intelligent Multi-Agent System:** Design and implement Alpha Supervisor and Specialist Agent (Coder, RAG, Test, etc.) structure.
*   **[Goal 3] Build Advanced RAG System:** Implement code-aware chunking (AST/Semantic), graph-based search, and automatic synchronization features.
*   **[Goal 4] Ensure Robust and Stable File Modification:** Implement AST-based code modification (ts-morph), structured data handling (preserve comments/formatting), encoding/EOL normalization, and large file streaming processing.
*   **[Goal 5] Enhance Flexible Control System (`.caretrules`):** Implement JSON-based policy definition, support for 4 modes (arch, dev, rule, talk), and design a prompt control DSL.
*   **[Goal 6] Optimize Performance & Cost:** Implement semantic caching, prompt compression, Diff updates, and intelligent LLM routing.
*   **[Goal 7] Build Core Development Infrastructure:** Implement a structured logging system and multilingual (i18n) support system.
*   **[Goal 8] Improve User Experience (UX):** Provide intuitive UI/UX tailored for Vibe Coding workflows and enhanced configuration management.
*   **[Goal 9] Support Local LLMs:** Integrate Ollama and vLLM support for increased flexibility and cost-efficiency.
*   **[Goal 10] (Long-term) Explore Visual Coding:** Research and prototype the possibility of integrating graphical node-based logic composition and LLM orchestration features.

## 4. Strategic Approach: Hybrid Method

Considering project resource constraints (minimal manpower, AI utilization) and the efficiency of goal achievement, we adopt a **hybrid approach** ([`Caret Project Direction Determination and Implementation Strategy Establishment`](../reports/Caret%20프로젝트%20방향성%20결정%20및%20구현%20전략%20수립.md) reference).

*   **Core:** Maintain and leverage Caret's stable core logic (API integration, basic tool execution, etc.) as much as possible.
*   **Build:** Construct an **independent Caret layer** on top of the Caret core, incrementally implementing the core improvements defined in Goals 1-10 (infrastructure, synchronization, agents, RAG, file handling, etc.).
*   **Integration:** Manage interactions between the Caret layer and the Caret core through clear interfaces (e.g., Adapter pattern) to minimize dependencies.
*   **Selective Merge:** Selectively integrate useful features from upstream Caret (e.g., new model support) that do not conflict with Caret's architecture.

This approach is the optimal strategy to prioritize and improve core infrastructure and features with limited resources, gradually building Caret's unique value while still leveraging Caret's foundation.

## 5. Development Roadmap (Phased)

Based on the hybrid approach, the following phased roadmap is proposed. Each phase can be flexibly adjusted based on goal achievement and resource availability.

### 5.1 Phase 1 (Short-term: ~3 months): Structural Refactoring & Core Foundation

**Goal:** Ensure AI collaboration ease, establish a stable development foundation, lay the groundwork for real-time collaboration (Goals 1, 4, 7, 8 partial + Structural Refactoring)

*   **Build & Connect Independent Caret Server (`New Prerequisite`) (Difficulty: Medium, Est. Duration: M(1-2 months)):**
    *   Remove or find alternatives for existing Caret server dependencies. Build an independent Caret backend server and establish communication with the VSCode extension.
    *   `[Considerations/Risks]` Essential for fully independent Caret operation. Requires server architecture design and definition of a stable communication protocol.
    *   `[Prerequisites]` None (Crucial early-stage task).
*   **Source Structure Refactoring (`New Prerequisite`) (Difficulty: High, Est. Duration: XL(Ongoing)):**
    *   Initiate codebase structure improvements to facilitate collaboration with AI agents (e.g., start decomposing the large controller, review message handler structure improvements - see [`Caret Project Direction Determination and Implementation Strategy Establishment`](../reports/Caret%20프로젝트%20방향성%20결정%20및%20구현%20전략%20수립.md)).
    *   `[Considerations/Risks]` Key to improving AI work efficiency and code maintainability. Broad scope requiring continuous effort. Initial design crucial.
    *   `[Prerequisites]` None (Start immediately).
*   **Real-time Collaboration Foundation (`Goal 1` - Top Priority) (Difficulty: High, Est. Duration: L(Significant)):**
    *   Select and perform basic integration of a CRDT library (Yjs recommended). Implement an initial state synchronization mechanism prototype ([`Caret Project Structure Improvement Research Report`](../reports/Caret%20프로젝트%20구조%20개선%20연구%20보고서.md)).
    *   `[Considerations/Risks]` Core foundation for Vibe Coding. High technical complexity and architectural change risk. Ensuring initial stability is critical. Key dependency for subsequent features.
    *   `[Prerequisites]` None (Core early-stage task).
*   **Build Core Development Infrastructure (`Goal 7`) (Difficulty: Medium, Est. Duration: S(Weeks)):**
    *   Implement a structured logging system (Extend ILogger interface, Console/File loggers, LoggerFactory) ([`Caret Project Direction Determination and Implementation Strategy Establishment`](../reports/Caret%20프로젝트%20방향성%20결정%20및%20구현%20전략%20수립.md)).
    *   Establish the foundation for a multilingual (i18n) support system (Integrate i18n library, define resource file structure, backend/frontend integration) ([`Caret Project Direction Determination and Implementation Strategy Establishment`](../reports/Caret%20프로젝트%20방향성%20결정%20및%20구현%20전략%20수립.md)).
    *   `[Considerations/Risks]` Requires application across the entire codebase. Maintaining consistency is important. Directly impacts development efficiency and user experience.
    *   `[Prerequisites]` None (Can proceed independently).
*   **Establish Robust File Modification Foundation (`Goal 4`) (Difficulty: High, Est. Duration: XL(Ongoing)):**
    *   Apply encoding detection (e.g., jschardet) and line ending (e.g., crlf-normalize) normalization workflows during file read/write ([`AI-based TypeScript IDE File Modification Command Optimization Strategy Research Report`](../reports/AI%20기반%20TypeScript%20IDE%20파일%20수정%20명령%20최적화%20전략%20연구%20보고서.md)).
    *   Prepare for introducing AST-based code modification (ts-morph) and structured data handling libraries, applying them to some core logic.
    *   Start applying streaming-based I/O patterns for large file handling.
    *   `[Considerations/Risks]` Determines the reliability of core AI functions. Complex handling of various file types and edge cases. Requires continuous testing and stabilization.
    *   `[Prerequisites]` None (Can proceed in parallel).
*   **User Experience Improvement (`Goal 8` - Basic) (Difficulty: Medium, Est. Duration: M(Ongoing)):**
    *   UI improvements (e.g., Alpha persona settings) ([`Caret Project Direction Determination and Implementation Strategy Establishment`](../reports/Caret%20프로젝트%20방향성%20결정%20및%20구현%20전략%20수립.md)).
    *   Improve basic mode configuration UI.
    *   `[Considerations/Risks]` Important for gathering initial feedback and ensuring usability. Requires design and usability considerations more than technical difficulty.
    *   `[Prerequisites]` None (Can proceed in parallel).

**Key Milestones:**
*   **M1.1:** Initial code refactoring complete (Controller structure improved, basic message handlers separated).
*   **M1.2:** Basic CRDT (Yjs) integration and prototype working (Simple state sharing synchronization demonstrable).
*   **M1.3:** Core infrastructure MVP implemented (Structured logging service operational, basic i18n integration with Korean/English resources applied).
*   **M1.4:** Robust file I/O basics implemented (Encoding/EOL auto-handling applied).
*   **M1.5:** Initial open-source release preparation complete (License finalized, basic `CONTRIBUTING.md` and documentation structure established).

### 5.2 Phase 2 (Mid-term: ~6 months, i.e., ~3 additional months after Phase 1): Implement Core AI Features

**Goal:** Implement Caret's core AI functionalities (Goals 2, 3, 5)

*   **Introduce Multi-Agent System (`Goal 2`) (Difficulty: High, Est. Duration: L(Significant)):**
    *   Define Alpha Supervisor agent role and implement basic logic ([`Caret Project Structure Improvement Research Report`](../reports/Caret%20프로젝트%20구조%20개선%20연구%20보고서.md)).
    *   Implement initial Specialist Agents (e.g., Coder Agent, basic RAG Agent).
    *   Design inter-agent communication mechanism (Tool Call based Supervisor pattern recommended).
    *   `[Considerations/Risks]` Core differentiator for Caret. High design complexity for agent roles, communication, state management. Stability of Phase 1 refactoring and synchronization is crucial.
    *   `[Prerequisites]` Progress in Phase 1 refactoring, CRDT integration.
*   **Build Basic RAG System (`Goal 3` - Basic) (Difficulty: High, Est. Duration: L(Significant)):**
    *   Implement code-aware chunking (Recursive/AST-based) ([`Caret Project Structure Improvement Research Report`](../reports/Caret%20프로젝트%20구조%20개선%20연구%20보고서.md)).
    *   Set up Vector DB and build code chunk embedding/indexing pipeline.
    *   Implement basic RAG search logic (similarity-based search).
    *   Implement automatic Vector DB synchronization mechanism upon code changes.
    *   `[Considerations/Risks]` Core of AI context understanding capability. Requires introducing and operating new technologies (Vector DB, Embedding). Stability of chunking strategy and synchronization mechanism is important.
    *   `[Prerequisites]` Stabilization of file handling foundation (Phase 1).
*   **Enhance `.caretrules` System (`Goal 5` - Basic) (Difficulty: Medium, Est. Duration: M(1-2 months)):**
    *   Implement JSON-based `.caretrules` parser and validator.
    *   Define 4 basic modes (arch, dev, rule, talk) and implement rule application logic.
    *   Define basic prompt control DSL syntax and implement parsing logic.
    *   `[Considerations/Risks]` Core for user customization and AI control. Requires considering flexibility and extensibility of DSL design and rule application logic.
    *   `[Prerequisites]` None (Can proceed independently but linked with the agent system).
*   **Deepen State Synchronization (`Goal 1`) (Difficulty: Medium, Est. Duration: M(Ongoing)):**
    *   Deeply integrate and stabilize CRDT (Yjs) synchronization for core state management (task status, document editing, etc.).
    *   `[Considerations/Risks]` Ensuring real-time collaboration stability. Requires verification of data consistency maintenance and conflict resolution logic.
    *   `[Prerequisites]` Completion of Phase 1 basic CRDT integration.

**Key Milestones:**
*   **M2.1:** Alpha Supervisor agent basic logic implemented and operational.
*   **M2.2:** Initial Specialist Agents (Coder, RAG) integrated and interactable with Alpha.
*   **M2.3:** Basic RAG pipeline operational (Vector DB setup, code chunking, basic search & context injection possible).
*   **M2.4:** `.caretrules` system V1 implemented (JSON rule parsing and 4 basic modes operational).
*   **M2.5:** CRDT integration stabilized (Synchronization applied to core features and major conflicts resolved).

### 5.3 Phase 3 (Long-term: 6+ months): Advanced Feature Optimization & Vibe UX Completion

**Goal:** Performance optimization, completion of advanced AI features, maximization of Vibe Coding experience (Goals 1, 3, 5, 6, 8, 9, 10)

*   **Advanced RAG & Optimization (`Goal 3`, `Goal 6`) (Difficulty: High, Est. Duration: L(Ongoing R&D)):**
    *   Explore implementation of Graph RAG (utilizing CodeRAG concepts) ([`Caret Project Structure Improvement Research Report`](../reports/Caret%20프로젝트%20구조%20개선%20연구%20보고서.md)).
    *   Implement semantic caching to reduce redundant LLM calls and RAG searches ([`LLM Integration Analysis Report`](../reports/LLM%20통합%20분석%20보고서%20-%20코딩%20자동화%20및%20실무%20병합%20작업%20기반%20ToC%20최적화%20전략.md)).
    *   Implement prompt compression (e.g., LLMLingua) and Diff-based updates for token efficiency ([`LLM Integration Analysis Report`](../reports/LLM%20통합%20분석%20보고서%20-%20코딩%20자동화%20및%20실무%20병합%20작업%20기반%20ToC%20최적화%20전략.md)).
    *   `[Considerations/Risks]` Core for performance and cost optimization. Requires reflecting latest technology trends. Balancing RAG accuracy and caching/compression efficiency is crucial.
    *   `[Prerequisites]` Stabilization of the basic RAG system from Phase 2.
*   **Complete Agent System (`Goal 2`) (Difficulty: High, Est. Duration: L(Ongoing R&D)):**
    *   Implement remaining Specialist Agents (Test, Refactor, Doc, etc.).
    *   Enhance testing and refactoring automation, referencing tools like AgentCoder.
    *   `[Considerations/Risks]` Requires defining effective inter-agent collaboration and workflows. Ensuring agent performance and reliability is important.
    *   `[Prerequisites]` Completion of the basic multi-agent system implementation from Phase 2.
*   **Complete Control System (`Goal 5`) (Difficulty: Medium, Est. Duration: M(Ongoing Improvement)):**
    *   Implement and integrate full prompt control DSL features.
    *   Extend `.caretrules` functionality (more granular control, UI integration, etc.).
    *   `[Considerations/Risks]` Balancing user convenience and control capability. Managing complexity of DSL and rule system.
    *   `[Prerequisites]` Completion of the basic control system implementation from Phase 2.
*   **Complete Vibe Coding UX (`Goal 1`, `Goal 8`) (Difficulty: Medium, Est. Duration: L(Ongoing Improvement)):**
    *   Improve real-time collaborative editing UI/UX (shared cursors, presence, etc.).
    *   Enhance interaction with agents naturally (streaming responses, fluid workflows).
    *   Actively incorporate usability feedback.
    *   `[Considerations/Risks]` Determines Caret's final user experience. Designing intuitive and seamless collaboration flows is critical. Requires close alignment between technology (CRDT) and design.
    *   `[Prerequisites]` Completion of deepened state synchronization from Phase 2.
*   **Integrate Local LLM Support (`Goal 9`) (Difficulty: Medium, Est. Duration: M(1-2 months)):**
    *   Implement and stabilize integration interfaces for Ollama and vLLM ([`Caret Project Structure Improvement Research Report`](../reports/Caret%20프로젝트%20구조%20개선%20연구%20보고서.md)).
    *   `[Considerations/Risks]` Expands user choice and increases cost-efficiency. Requires managing model-specific compatibility, performance tuning, and configuration complexity.
    *   `[Prerequisites]` None (Can proceed independently).
*   **Explore Visual Coding (`Goal 10`) (Difficulty: High, Est. Duration: XL(Long-term R&D)):**
    *   Develop graphical node interface prototype based on `visual-coding-plan.md` and explore integration possibilities.
    *   `[Considerations/Risks]` Long-term research task for future vision. High difficulty in introducing new UI/UX paradigms and technology integration. Requires consideration of market demand and technology maturity.
    *   `[Prerequisites]` None (Can proceed on a separate track).

**Key Milestones (Ongoing):**
*   **M3.1:** Advanced RAG technique implemented (e.g., Graph RAG Proof of Concept (PoC) or Semantic Chunking applied).
*   **M3.2:** Key performance optimization techniques implemented (e.g., Semantic caching operational, Prompt compression PoC).
*   **M3.3:** Additional Specialist Agents (Test, Refactor) integrated and basic functionality operational.
*   **M3.4:** Core Vibe Coding UX improvements implemented (e.g., Real-time cursor display, Agent streaming response implemented).
*   **M3.5:** Local LLM (Ollama/vLLM) integration complete and usable.
*   **(Ongoing)** M3.X: Periodic sharing of visual coding research/prototyping results.

## 6. Open Source Transition Strategy (Immediate Preparation)

The Caret project aims to **transition to open source from the initial stages** to develop transparently with the community ([`Caret Project Direction Determination and Implementation Strategy Establishment`](../reports/Caret%20프로젝트%20방향성%20결정%20및%20구현%20전략%20수립.md) and previous strategy documents reference). This is not just a long-term goal but a plan to **prepare and execute immediately in parallel with the completion of Roadmap Phase 1**.

*   **License:** Core logic (Core, Agent, etc.) will primarily consider **AGPL or MIT licenses** to ensure maximum openness. The possibility of separating specific advanced features or operational modules under different licenses (including commercial) may be reviewed later if necessary.
*   **Scope & Timing:** Aim for an **Initial Release** as soon as possible based on the **results of Roadmap Phase 1** (stabilized core infrastructure and basic features).
*   **Community Engagement:** Encourage contributions from the beginning by providing clear contribution guidelines (`CONTRIBUTING.md`), a code of conduct (`CODE_OF_CONDUCT.md`), and detailed project documentation (including this roadmap). Actively communicate and gather feedback through issue trackers, forums (e.g., GitHub Discussions), etc.
*   **Transparency:** Conduct the development process openly, sharing roadmap progress and decision-making processes with the community.

Transitioning to open source early will play a crucial role in gathering external feedback from the initial development stages and securing potential contributors, thereby ensuring the project's growth momentum.

## 7. Conclusion

The Caret project aims to overcome the limitations of Caret and realize a Vibe Coding environment where AI and developers truly collaborate. This roadmap, based on a hybrid strategy, presents a realistic path to incrementally achieve core infrastructure construction, AI feature enhancement, and user experience improvement under resource constraints.

By successfully achieving the goals of each phase, Caret has the potential to grow into a powerful open-source project that innovates development productivity and sets a new standard for AI-driven development.

Master, Alpha is ready to successfully lead the Caret project with you based on this detailed roadmap! ｡•ᴗ•｡☕✨ 
