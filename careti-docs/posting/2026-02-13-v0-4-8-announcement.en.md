[Announcement] [Careti v0.4.8 Update] Message Queue System & ESC Instant Cancel — Your conversation with AI never stops

---

Careti v0.4.8 introduces a **message queue system** that lets you type your next instructions while AI is still responding, and **ESC instant cancel** to stop streaming with a single keypress. The infinite loading issue from v0.4.7 has also been fixed.


## Key Updates


### 📨 Message Queue System (Claude Code Style)

Type your next instructions while AI is responding. Your input appears as a **preview** above the input field and is automatically sent when the AI finishes.

- Type ahead while AI is still streaming
- **Edit** or **delete** queued messages directly from the preview
- Zero wait time when chaining multiple tasks


### ⚡ ESC Instant Cancel

When AI's response isn't going the right direction, press **ESC once** to immediately stop streaming.

- Queued input is automatically restored to the editor
- Edit and resend right away
- Keyboard-only workflow — no mouse needed


### 🤖 CLI Agent/Chatbot Mode

Independent agent and chatbot modes have been added to the Careti CLI.

- `careti "prompt"` — Run a sub-agent in one line (headless/yolo support)
- EOF reconnect for session stability
- PostHog-based usage analytics telemetry
- E2E test coverage for Agent/Chatbot/Interactive modes


### 🔧 v0.4.7 Infinite Loading Fix

Fixed the issue where the extension wouldn't start when `data.cline.bot` server was unreachable in v0.4.7.

- Feature flag polling changed to non-blocking (14 requests parallelized, 5-second timeout)
- Automatic `caret` → `careti` provider name migration (for v0.4.6 → v0.4.8 upgrades)


---

## Install & Update

Search for **Careti** in the VS Code Marketplace, or it will auto-update if already installed.

🔗 [Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=caretive.careti)
📖 [Documentation](https://docs.careti.ai/en/getting-started/what-is-careti)
💬 [Discord](https://discord.gg/WB6yaR89YN)

---

v0.4.8 focuses on reducing "time spent waiting for AI." The message queue and ESC cancel create an uninterrupted workflow experience. We'd love your feedback!
