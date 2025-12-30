# 变更日志

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="../../CHANGELOG.md">
          <img src="https://img.shields.io/badge/English-2563eb?style=for-the-badge&labelColor=1e40af" alt="English"/>
        </a>
      </td>
      <td align="center">
        <a href="../ko/CHANGELOG.md">
          <img src="https://img.shields.io/badge/한국어-16a34a?style=for-the-badge&labelColor=15803d" alt="한국어"/>
        </a>
      </td>
      <td align="center">
        <a href="../ja/CHANGELOG.md">
          <img src="https://img.shields.io/badge/日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
        </a>
      </td>
      <td align-center>
        <img src="https://img.shields.io/badge/中文-dc2626?style=for-the-badge&labelColor=b91c1c" alt="中文"/>
      </td>
    </tr>
  </table>
</div>

## [0.4.4] 2025-12-30

### ✨ 改进
- **Caret 账号 Nano Banana 集成**：在 Caret 账号中集成 Gemini 的 Nano Banana 图像生成功能，可将生成结果用作项目资产。
- **Caret CLI**：正式发布支持 Caret 账号与 LiteLLM BYO 提供商的 Caret CLI。
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)**：新增 Naver Cloud 提供商与 HCX-007/HCX-005/HCX-DASH-002 模型。
- **AAIF 国际标准 Agents.md 支持与项目初始化支持**：将原有 Caret/Cline 专用规则迁移为 AAIF 国际标准，并新增项目初始化支持功能。
- **构建/发布**：稳定构建脚本并修正资产同步顺序，提高构建稳定性。
- **速率限制重试**：按 5/10/20/40/60 秒退避自动重试，并强化倒计时提示。
- **文档/模型列表**：更新提供商配置文档与支持模型列表。
- **上游更新**：Cherry-pick 了 Cline v3.45.0 的修复。
- **Cline v3.45.0 修复**：整合了已在 Cline v3.45.0 中落地的修复代码。
- **遥测**：增加用于错误与质量追踪的遥测。

### 修复
- **历史图片显示**：修复绝对路径图片无法显示的问题。
- **输入丢失**：缓解响应完成后提示输入被吞的问题。
- **Caret Provider**：修复 Gemini3 相关行为问题。
- **头像图片**：修复登录后头像不显示的问题。
- **Ask 竞态**：修复 ask 竞态问题。
- **[Naver Cloud](https://clova.ai/) 响应处理**：即时检测 `status.code` 错误与空响应，并包含 429 映射以提升稳定性。
- **流式稳定性**：防御空流式分片并加强流式失败日志。

## [0.4.1] 2025-12-10

### ✨ 改进
- **Caret Provider**: 为配合 `caret.team` 服务的正式上线，稳定了基于 `anyLLM` 的 Caret Provider。包括 API 增强和可靠性提升。

### 修复
- **角色系统**: 增强了角色初始化逻辑，以确保默认头像正确植入。改进了角色图片加载时的异常处理。
- **品牌化**: 将 `.clineignore` 功能的品牌化更正为与 `.caretignore` 一致。
- **构建**: 解决了各种构建和资源位置问题。
- **认证**: 对认证流程进行了小幅修复和检查。

## [0.4.0] 2025-11-28

> **注意**: Caret v0.4.0 基于 Cline v3.38.2。上游发行说明位于 `CHANGELOG-CLINE.md`。

### 🎉 Cline v3.38.2 上游合并
- 合并提交: `8723b386f` (分支: `main_backup_20251128202033`)。

### 新增功能
- **Cline v3.38.2 集成**: 所有上游功能，包括最新的模型支持（Claude Opus 4.5）。
- **双账户系统**: 在 Caret 模式（扩展）和 Cline 模式（原生）之间切换。
- **Caret CLI (测试版)**: 统一的 `caret` CLI，支持增强的身份验证和 LiteLLM。
- **提供商设置**: 为 LiteLLM/BizRouter 自动获取模型，并进行实时健康检查。
- **JSON 提示系统**: 通过 JSON 进行动态系统提示配置。
- **输入历史**: 类似终端的持久化历史导航。
- **快捷键**: 取消（Esc）和恢复（Ctrl+Shift+R）任务。

### 修复的问题
- 在 Linux 上使用 shell 集成时终端挂起的问题。
- 恢复了 UI 和 CLI 的品牌化。
