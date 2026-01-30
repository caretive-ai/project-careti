# 变更日志

<div align="center">
  <!-- Sovereign Cloud Languages: Provider Country = UI Language Support -->
  <table>
    <tr>
      <td align="center">
        <a href="../../CHANGELOG.md">
          <img src="https://img.shields.io/badge/🇺🇸_English-2563eb?style=for-the-badge&labelColor=1e40af" alt="English"/>
        </a>
      </td>
      <td align="center">
        <a href="./CHANGELOG.ko.md">
          <img src="https://img.shields.io/badge/🇰🇷_한국어-16a34a?style=for-the-badge&labelColor=15803d" alt="한국어"/>
        </a>
      </td>
      <td align="center">
        <a href="./CHANGELOG.ja.md">
          <img src="https://img.shields.io/badge/🇯🇵_日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
        </a>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/🇨🇳_中文-eab308?style=for-the-badge&labelColor=ca8a04" alt="中文"/>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="4">
        <a href="./CHANGELOG.fr.md">
          <img src="https://img.shields.io/badge/🇫🇷_Français-0055a4?style=for-the-badge&labelColor=003f7f" alt="Français"/>
        </a>
        &nbsp;&nbsp;
        <a href="./CHANGELOG.de.md">
          <img src="https://img.shields.io/badge/🇩🇪_Deutsch-ffcc00?style=for-the-badge&labelColor=dd0000" alt="Deutsch"/>
        </a>
        &nbsp;&nbsp;
        <a href="./CHANGELOG.ru.md">
          <img src="https://img.shields.io/badge/🇷🇺_Русский-0039a6?style=for-the-badge&labelColor=d52b1e" alt="Русский"/>
        </a>
      </td>
    </tr>
  </table>
</div>

## [0.4.7] 2026-01-30

> **注意**: Careti v0.4.7集成了Cline v3.49.1功能，并引入SmartEditEngine以提高代码编辑可靠性。

### ✨ 新功能
- **Careti提供商新增ZAI GLM-4.7**: 在Gemini和Claude Code之外，新增智谱AI的GLM-4.7作为新的后端选项。
- **Web搜索 (SerpAPI)**: 集成SerpAPI驱动的Web搜索，可在设置中配置API密钥。
- **Commands系统**: 在`.agents/commands/`目录中实现Claude Code/OpenCode风格的命令。
- **SmartEditEngine**: 新增9阶段模糊匹配+6阶段回退引擎，提高代码编辑可靠性。
- **后台编辑** (Cline v3.49.1): 支持后台文件编辑操作。
- **变更说明** (Cline v3.49.1): 新增用于代码变更说明的generate_explanation工具。
- **GFM Markdown支持**: 新增GitHub Flavored Markdown表格和删除线渲染。
- **TypewriterText组件**: 新增用于流式文本显示的闪烁动画。
- **ThinkingRow组件**: 新增用于推理/思考模式显示的UI。
- **ToolGroupRenderer**: 新增低风险工具操作的分组显示。

### ✨ 改进
- **Claude Code集成**: AGENTS.md ↔ CLAUDE.md同步钩子，无缝支持Caret + Claude Code工作流。
- **Caret → Careti品牌重塑**: 完成代码库和所有语言文件的品牌迁移。
- **重试逻辑**: 改进退避处理，增强API重试逻辑。
- **Upstage提供商**: 改进Upstage提供商配置。
- **令牌高效错误**: 优化WriteToFileToolHandler的错误上下文。
- **hwpjs依赖**: 将平台特定包移至optionalDependencies。
- **Ollama思考模式**: 修复Ollama提供商的思考模式显示。

### 修复
- **Careti计划/执行模式**: 在Careti提供商中隐藏计划/执行模式复选框（仅支持单模型模式）。
- **preserveFocus选项**: 修复文件打开时遵守preserveFocus设置。
- **导入路径**: 完成Caret → Careti导入路径迁移。
- **Web搜索配置**: 修复配置缓存中的SerpAPI密钥处理。
- **构建错误**: 解决Cline v3.49.1功能集成的构建问题。
- **技能翻译**: 修复t()函数调用和skillLoaded翻译。

---

## [0.4.6] 2026-01-19

### ✨ 改进
- **动态品牌**: 将任务处理器中硬编码的"Cline"替换为动态品牌名(`getCurrentBrandName()`)。
- **免费积分促销**: 在登录必需UI中添加注册时免费积分促销消息（支持7种语言）。
- **README文档链接**: 为多语言README的语言徽章添加文档链接，方便导航。

---

## [0.4.5] 2026-01-18

> **注意**: Careti v0.4.5从Cline v3.49.0+中Cherry-pick了Skills系统、Hooks i18n等功能。

### ✨ 新功能
- **Z.AI GLM-4.7 完整支持**: 支持Thinking Mode和自然对话风格。
- **[Upstage](https://upstage.ai/) 提供商**: 新增支持Upstage Solar模型的提供商。
- **文本模型图像工具**: 纯文本模型也可以使用Careti账号工具进行图像生成和分析。
- **Skills系统** (Cline v3.49.0+ Cherry-pick): 添加了可定义项目级技能供AI使用的Skills系统。可在`.agents/skills/`或`.users/skills/`目录中管理技能。
- **Hooks系统** (Cline v3.49.0+ Cherry-pick): 添加了可在工具执行前/后运行自定义脚本的Hooks系统。可在`.agents/hooks/`或`.users/hooks/`目录中管理hooks。
- **双目录架构 & /init**: 令牌优化的AI上下文(`.agents/`)和用户语言文档(`.users/`)采用1:1镜像策略管理。使用`/init`命令分析项目并自动生成上下文文件。AGENTS.md和CLAUDE.md作为标准入口点联动。
- **HWP文档支持**: 支持跨平台HWP解析。Windows、macOS、Linux均可读取韩文(.hwp)文档。
- **read_document工具**: 新增可读取HWP、PDF、DOCX、PPTX等多种文档格式的统一文档读取工具。同时支持PPT旧版格式检测。
- **analyze_image工具**: 新增与Careti账号Gemini连接的图像分析工具。应用最大7500px限制，包含分析结果报告指南。
- **generate_image工具改进**: 支持XML `<image>`标签解析，明确文件路径（相对/绝对）支持，添加aspect_ratio/image_size省略指南。
- **图像发送开关**: 添加了可通过@提及设置是否发送图像文件的切换功能。

### ✨ 改进
- **语言扩展**: 新增法语、德语、俄语翻译。优先支持拥有自主AI模型的国家（Mistral、Aleph Alpha、Yandex 等）。
- **提供商国旗**: 为提供商显示国家旗帜（主权云视角）。
- **全局上下文路径变更**: 全局代理设置路径更改为`~/Documents/.agents/`。
- **多语言支持**: 为Hooks和Skills功能添加了韩语、日语、中文翻译。
- **YAML frontmatter解析**: 添加了Skills/Hooks共享的YAML解析工具。
- **默认提供商**: 新用户的默认提供商设置为Careti。
- **Feature Config UI门控**: 可通过feature config控制账号/模式/听写UI。
- **VSIX大小优化**: 通过排除iOS/Android二进制文件减小扩展大小。
- **图像设置UI**: 所有提供商均显示图像比例/分辨率设置UI。

### 修复
- **sharp激活失败**: 修复了图像处理库激活失败的问题。
- **图像引用处理**: 修复了图像引用处理和优化相关问题。
- **重复消息显示**: 修复了"请求Careti图像生成"消息显示两次的问题。

## [0.4.4] 2025-12-30

### ✨ 改进
- **Careti 账号 Nano Banana 集成**：Careti 账号新增 Gemini 3 Flash Preview，并整合 Nano Banana 图像生成功能，可将生成结果用作项目资产。
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)**：新增 Naver Cloud 提供商与 HCX-007/HCX-005/HCX-DASH-002 模型。
- **AAIF 国际标准 Agents.md 支持与项目初始化支持**：将原有 Careti/Cline 专用规则迁移为 AAIF 国际标准，并新增项目初始化支持功能。
- **构建/发布**：稳定构建脚本并修正资产同步顺序，提高构建稳定性。
- **速率限制重试**：按 5/10/20/40/60 秒退避自动重试，并强化倒计时提示。
- **文档/模型列表**：更新提供商配置文档与支持模型列表。
- **上游更新**：Cherry-pick 了 Cline v3.45.0 的修复。
- **Cline v3.45.0 修复**：整合了已在 Cline v3.45.0 中落地的修复代码。
- **遥测**：增加用于错误与质量追踪的遥测。

### 修复
- **历史图片显示**：修复绝对路径图片无法显示的问题。
- **输入丢失**：缓解响应完成后提示输入被吞的问题。
- **Careti Provider**：修复 Gemini3 相关行为问题。
- **头像图片**：修复登录后头像不显示的问题。
- **Ask 竞态**：修复 ask 竞态问题。
- **[Naver Cloud](https://clova.ai/) 响应处理**：即时检测 `status.code` 错误与空响应，并包含 429 映射以提升稳定性。
- **流式稳定性**：防御空流式分片并加强流式失败日志。

## [0.4.1] 2025-12-10

### ✨ 改进
- **Careti Provider**: 为配合 `careti.ai` 服务的正式上线，稳定了基于 `anyLLM` 的 Careti Provider。包括 API 增强和可靠性提升。

### 修复
- **角色系统**: 增强了角色初始化逻辑，以确保默认头像正确植入。改进了角色图片加载时的异常处理。
- **品牌化**: 将 `.clineignore` 功能的品牌化更正为与 `.caretignore` 一致。
- **构建**: 解决了各种构建和资源位置问题。
- **认证**: 对认证流程进行了小幅修复和检查。

## [0.4.0] 2025-11-28

> **注意**: Careti v0.4.0 基于 Cline v3.38.2。上游发行说明位于 `CHANGELOG-CLINE.md`。

### 🎉 Cline v3.38.2 上游合并
- 合并提交: `8723b386f` (分支: `main_backup_20251128202033`)。

### 新增功能
- **Cline v3.38.2 集成**: 所有上游功能，包括最新的模型支持（Claude Opus 4.5）。
- **双账户系统**: 在 Careti 模式（扩展）和 Cline 模式（原生）之间切换。
- **提供商设置**: 为 LiteLLM/BizRouter 自动获取模型，并进行实时健康检查。
- **JSON 提示系统**: 通过 JSON 进行动态系统提示配置。
- **输入历史**: 类似终端的持久化历史导航。
- **快捷键**: 取消（Esc）和恢复（Ctrl+Shift+R）任务。

### 修复的问题
- 在 Linux 上使用 shell 集成时终端挂起的问题。
- 恢复了 UI 和 CLI 的品牌化。
