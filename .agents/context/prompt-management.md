# System Prompt Management Rules

This document outlines the rules for managing and editing Caret's system prompts to ensure consistency and maintainability.

## Core Principle

The system prompt is managed through a combination of JSON configuration files and their corresponding human-readable Markdown documentation in Korean. This ensures that both the AI and human developers have a clear and synchronized understanding of the AI's behavior.

## Editing Workflow

When modifying the AI's core behavior, the following files **must** be edited together as a pair:

1.  **JSON Configuration (`/caret-src/core/prompts/sections/`)**:
    -   This is the source of truth that the system directly loads.
    -   Example: `AGENT_BEHAVIOR_DIRECTIVES.json`

2.  **Korean Markdown Documentation (`/caret-docs/system-prompts-ko/`)**:
    -   This document must be a direct, human-readable translation of the JSON file's content and structure.
    -   Example: `agent-behavior-directives.md`

## Synchronization Rule

**Any change to a prompt-related JSON file must be accompanied by a corresponding change to its Korean Markdown counterpart, and vice versa.**

This rule ensures that the documentation always reflects the current system behavior, preventing confusion and maintaining a clear source of reference for all developers.
