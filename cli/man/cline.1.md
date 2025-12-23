---
title: CARET
section: 1
header: User Commands
footer: Caret CLI 1.0
date: January 2025
---

# NAME

caret - orchestrate and interact with Caret AI coding agents

# SYNOPSIS

**caret** [*prompt*] [*options*]

**caret** *command* [*subcommand*] [*options*] [*arguments*]

# DESCRIPTION

Try: cat README.md | caret "Summarize this for me:"

**caret** is a command-line interface for orchestrating multiple Caret AI coding agents. Caret is an autonomous AI agent who can read, write, and execute code across your projects. He operates through a client-server architecture where **Caret Core** runs as a standalone service, and the CLI acts as a scriptable interface for managing tasks, instances, and agent interactions.

The CLI is designed for both interactive use and automation, making it ideal for CI/CD pipelines, parallel task execution, and terminal-based workflows. Multiple frontends (CLI, VSCode, JetBrains) can attach to the same Caret Core instance, enabling seamless task handoff between environments.

# MODES OF OPERATION

**Instant Task Mode**

:   The simplest invocation: **caret "prompt here"** immediately spawns an instance, creates a task, and enters chat mode. This is equivalent to running **caret instance new && caret task new && caret task chat** in sequence.

**Subcommand Mode**

:   Advanced usage with explicit control: **caret \<command\> [subcommand] [options]** provides fine-grained control over instances, tasks, authentication, and configuration.

# AGENT BEHAVIOR

Caret operates in two primary modes:

**ACT MODE**

:   Caret actively uses tools to accomplish tasks. He can read files, write code, execute commands, use a headless browser, and more. This is the default mode for task execution.

**PLAN MODE**

:   Caret gathers information and creates a detailed plan before implementation. He explores the codebase, asks clarifying questions, and presents a strategy for user approval before switching to ACT MODE.

# INSTANT TASK OPTIONS

When using the instant task syntax **caret "prompt"** the following options are available:

**-o**, **\--oneshot**

:   Full autonomous mode. Caret completes the task and stops following after completion. Example: caret -o "what's 6 + 8?"

**-s**, **\--setting** *setting* *value*

:   Override a setting for this task

**-y**, **\--no-interactive**, **\--yolo**

:   Enable fully autonomous mode. Disables all interactivity:
    - ask_followup_question tool is disabled
    - attempt_completion happens automatically
    - execute_command runs in non-blocking mode with timeout
    - PLAN MODE automatically switches to ACT MODE

**-m**, **\--mode** *mode*

:   Starting mode. Options: **act** (default), **plan**

# GLOBAL OPTIONS

These options apply to all subcommands:

**-F**, **\--output-format** *format*

:   Output format. Options: **rich** (default), **json**, **plain**

**-h**, **\--help**

:   Display help information for the command.

**-v**, **\--verbose**

:   Enable verbose output for debugging.

# COMMANDS

## Authentication

**caret auth** [*provider*] [*key*]

**caret a** [*provider*] [*key*]

:   Configure authentication for AI model providers. Launches an interactive wizard if no arguments provided. If provider is specified without a key, prompts for the key or launches the appropriate OAuth flow.

## Instance Management

Caret Core instances are independent agent processes that can run in the background. Multiple instances can run simultaneously, enabling parallel task execution.

**caret instance**

**caret i**

:   Display instance management help.

**caret instance new** [**-d**|**\--default**]

**caret i n** [**-d**|**\--default**]

:   Spawn a new Caret Core instance. Use **\--default** to set it as the default instance for subsequent commands.

**caret instance list**

**caret i l**

:   List all running Caret Core instances with their addresses and status.

**caret instance default** *address*

**caret i d** *address*

:   Set the default instance to avoid specifying **\--address** in task commands.

**caret instance kill** *address* [**-a**|**\--all**]

**caret i k** *address* [**-a**|**\--all**]

:   Terminate a Caret Core instance. Use **\--all** to kill all running instances.

## Task Management

Tasks represent individual work items that Caret executes. Tasks maintain conversation history, checkpoints, and settings.

**caret task** [**-a**|**\--address** *ADDR*]

**caret t** [**-a**|**\--address** *ADDR*]

:   Display task management help. The **\--address** flag specifies which Caret Core instance to use (e.g., localhost:50052).

**caret task new** *prompt* [*options*]

**caret t n** *prompt* [*options*]

:   Create a new task in the default or specified instance. Options:

    **-s**, **\--setting** *setting* *value*
    :   Set task-specific settings

    **-y**, **\--no-interactive**, **\--yolo**
    :   Enable autonomous mode

    **-m**, **\--mode** *mode*
    :   Starting mode (act or plan)

**caret task open** *task-id* [*options*]

**caret t o** *task-id* [*options*]

:   Resume a previous task from history. Accepts the same options as **task new**.

**caret task list**

**caret t l**

:   List all tasks in history with their id and snippet

**caret task chat**

**caret t c**

:   Enter interactive chat mode for the current task. Allows back-and-forth conversation with Caret.

**caret task send** [*message*] [*options*]

**caret t s** [*message*] [*options*]

:   Send a message to Caret. If no message is provided, reads from stdin. Options:

    **-a**, **\--approve**
    :   Approve Caret's proposed action

    **-d**, **\--deny**
    :   Deny Caret's proposed action

    **-f**, **\--file** *FILE*
    :   Attach a file to the message

    **-y**, **\--no-interactive**, **\--yolo**
    :   Enable autonomous mode

    **-m**, **\--mode** *mode*
    :   Switch mode (act or plan)

**caret task view** [**-f**|**\--follow**] [**-c**|**\--follow-complete**]

**caret t v** [**-f**|**\--follow**] [**-c**|**\--follow-complete**]

:   Display the current conversation. Use **\--follow** to stream updates in real-time, or **\--follow-complete** to follow until task completion.

**caret task restore** *checkpoint*

**caret t r** *checkpoint*

:   Restore the task to a previous checkpoint state.

**caret task pause**

**caret t p**

:   Pause task execution.

## Configuration

Configuration can be set globally. Override these global settings for a task using the **\--setting** flag

**caret config**

**caret c**

**caret config set** *key* *value*

**caret c s** *key* *value*

:   Set a configuration variable.

**caret config get** *key*

**caret c g** *key*

:   Read a configuration variable.

**caret config list**

**caret c l**

:   List all configuration variables and their values.

# TASK SETTINGS

Task settings are persisted in the *~/.caret/x/tasks* directory. When resuming a task with **caret task open**, task settings are automatically restored.

Common settings include:

**yolo**

:   Enable autonomous mode (true/false)

**mode**

:   Starting mode (act/plan)

# NOTES & EXAMPLES

The **caret task send** and **caret task new** commands support reading from stdin, enabling powerful pipeline compositions:

```bash
cat requirements.txt | caret task send
echo "Refactor this code" | caret -y
```

## Instance Management

Manage multiple Caret instances:

```bash
# Start a new instance and make it default
caret instance new --default

# List all running instances
caret instance list

# Kill a specific instance
caret instance kill localhost:50052

# Kill all CLI instances
caret instance kill --all-cli
```

## Task History

Work with task history:

```bash
# List previous tasks
caret task list

# Resume a previous task
caret task open 1760501486669

# View conversation history
caret task view

# Start interactive chat with this task
caret task chat
```

# ARCHITECTURE

Caret operates on a three-layer architecture:

**Presentation Layer**

:   User interfaces (CLI, VSCode, JetBrains) that connect to Caret Core via gRPC

**Caret Core**

:   The autonomous agent service handling task management, AI model integration, state management, tool orchestration, and real-time streaming updates

**Host Provider Layer**

:   Environment-specific integrations (VSCode APIs, JetBrains APIs, shell APIs) that Caret Core uses to interact with the host system

# BUGS

Report bugs at: <https://github.com/caret/caret/issues>

For real-time help, join the Discord community at: <https://discord.gg/caret>

# SEE ALSO

Full documentation: <https://docs.caret.bot>

# AUTHORS

Caret is developed by the Caret Bot Inc. and the open source community.

# COPYRIGHT

Copyright © 2025 Caret Bot Inc. Licensed under the Apache License 2.0.
