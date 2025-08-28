# .caretrules File Guide

The `.caretrules` file is a core configuration file that helps the Caret AI agent understand the current project's structure, development process, and key files. This file is written in JSON format and is concisely structured for token efficiency. For readability, a Markdown version (`.caretrules.md`) with identical content is also maintained.

## File Structure

The `.caretrules` file consists of the following main sections:

1.  **`project_overview`**: Contains basic project information (name, description, repository URL).
2.  **`architecture`**: Includes a summary of the project's architecture, key components (with paths, entry points, and descriptions), and references to related architecture diagrams.
3.  **`development_process`**: Defines key guidelines related to the development workflow.
    *   `state_management_guideline`: State management principles.
    *   `tool_integration`: Tool integration guide and explicit respect for `.caretignore` rules.
    *   `api_providers`: Location of API provider implementations.
    *   `testing`: Reference to testing plan documents.
    *   `logging`: Reference to logging system usage guide.
    *   `checkpoints`: Checkpoint system information.
    *   `documentation`: Guidelines related to document updates.
    *   `contributing`: Reference to contribution guidelines (`CONTRIBUTING.md`).
    *   `work_logs`: Definition of work log location, format, and purpose.
    *   `git_rules`: Definition of Git commit format and branching strategy.
4.  **`key_files_reference`**: Provides a list of key files and folders that the AI agent should frequently reference.

## How it Works

-   **JSON Format**: The actual file used by the AI agent in the system prompt is the `.caretrules` file in JSON format. This is to minimize token usage.
-   **Markdown Version (`.caretrules.md`)**: Contains the same content as the JSON file and is written in Markdown format for easy human readability and understanding. This file is not directly used by the AI but is used by developers to review and manage rules.
-   **Synchronization**: The content of the `.caretrules` (JSON) file and the `.caretrules.md` file must always be consistent. It is important to update both files when rules change. (Future consideration for automatic synchronization or verification mechanisms).
-   **Reference-Centric**: The `.caretrules` file is structured to reference other documents containing detailed information (e.g., `CONTRIBUTING.md`, architecture diagrams, testing plans) rather than containing all details itself. This keeps the `.caretrules` file concise while allowing access to necessary information.

## Management and Modification

-   Modifying the `.caretrules` file is recommended to be done in **RULE mode** in collaboration with the AI agent.
-   Content must be updated while maintaining the JSON format structure.
-   After modification, the `.caretrules.md` file must also be updated identically to maintain consistency.
