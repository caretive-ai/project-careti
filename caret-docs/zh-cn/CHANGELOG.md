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
      <td align="center">
        <img src="https://img.shields.io/badge/中文-dc2626?style=for-the-badge&labelColor=b91c1c" alt="中文"/>
      </td>
    </tr>
  </table>
</div>

# 更新日志

## [0.3.1] - 2025-10-20

### 🆕 新功能
- **Caret提供商**: 添加官方Caret AI提供商集成
  - 🎁 **促销**: 促销期间为所有用户提供$10免费积分
  - 💰 付费追加积分购买系统即将推出

### 🐛 错误修复
- **终端品牌**: 修复上游合并后终端徽标和名称恢复为"Cline"的问题
- **输入系统提示**: 修复系统提示输入处理错误
- **LiteLLM模型列表**: 改进从 `/v1/models` 端点获取模型，包含health check过滤

### 🔄 更新
- **Cline v3.32.7 合并**: 合并最新Cline上游改进

---

## [0.3.0] - 2025-10-13

### 🎉 Cline v3.32.7 上游合并

- **合并提交**: `03177da87` (合并分支: `merge/cline-upstream-20251009`)
- **新模型支持**:
  - Claude Sonnet 4.5 (200K和1M上下文窗口变体)
  - GPT-5 扩展思考功能支持
  - 增强的模型信息和价格显示
- **新功能**:
  - `.clineignore` 文件支持以排除Caret的文件访问
  - AWS Bedrock配置文件 (多账户管理)
  - Requesty、Together、Alibaba Qwen提供商添加
  - 速率限制请求自动重试
  - Focus Chain (任务管理) - 为复杂任务自动生成和跟踪待办事项列表
- **架构改进**:
  - 完全基于protobuf的类型系统迁移
  - 增强的MCP (Model Context Protocol) 支持
  - 用于扩展性的提供商系统重构
- **详细的上游更改请参见 [CHANGELOG-CLINE.md](../../CHANGELOG-CLINE.md)**

---

## [0.2.3] - 2025-10-01
 - **新功能**: 在聊天输入框中实现使用箭头键导航消息历史记录的功能
 - **新功能**: 实现LiteLLM模型获取并重构CaretBrandConfig为FeatureConfig
 - **增强**: 强化代理协议以实现明确批准
 - **增强**: 重构系统提示并添加韩语文档（特别是COLLABORATIVE_PRINCIPLES）
 - **错误修复**: 修复了显示两个按钮时ActionButtons布局溢出的问题

## [0.2.22] - 2025-09-21
 - **系统提示增强**: 恢复并补充了在Cline合并过程中缺失的Caret独有的协作态度和成本节约系统提示
 - **翻译修复**: 修复了部分浏览器相关翻译缺失的问题

## [0.2.21] - 2025-09-18

- **角色系统修复与改进**:
  - **错误修复**: 修复了应用重启时角色图片会重置为默认Caret头像的严重错误。此问题是由于后端处理程序无法正确处理模板角色的`asset:/` URI，导致图片无法保存到全局存储而引起的。
  - **功能改进**: 更改了初始设置流程。API密钥提交后，用户将被直接引导到角色模板选择器以立即设置角色。
  - **用户体验改进**: 改进并整合了角色选择器的说明文字，使其更加清晰。（中文/英文）

## [0.2.0] - 2025-09-11

- **Cline v3.26.6 合并**: 通过合并提交 `f8bd960b4` 合并了最新的 Cline upstream (`v3.26.6`, commit `c6aa47095ee47036946c6a51339a4fa22aaa073c`)。详情请参见 [CHANGELOG-CLINE.md](../../CHANGELOG-CLINE.md)。
  - **主要用户功能更新**:
    - **最新AI模型支持**: 支持GPT-5, Claude 4, Grok等最新模型和增强的AI功能
    - **15+新API提供商**: 集成Hugging Face, Groq等15+新服务
    - **任务管理(Focus Chain)**: 为复杂任务添加自动待办事项列表生成和跟踪功能
    - **便利功能**: 对话自动压缩、改进的检查点、Mermaid图表预览等众多功能
  - **主要开发结构变更**:
    - 后端架构改进和增强的API提供商系统
    - 前端UI改进和更好的用户体验
    - 增强的MCP(模型上下文协议)支持

## [0.1.3]

- 🎉 **重大更新**: 包含角色系统的Caret集成
- feat: 个性化AI角色支持 (Caret, Oh Sarang, Madobe Ichika, Cyan Macin, Tando Ubuntu)
- feat: Cline/Caret模式切换 - 随时切换回原始Cline方式
- feat: 完美的4语言支持 (韩语, 英语, 日语, 中文)
- feat: 增强的系统提示以获得更高效的AI响应
- feat: 支持300个模型的36个提供商
- feat: docs.cline.bot多语言文档进行中

### 🎭 Caret专属功能
- 注册您自己的AI名称和头像
- 选择模板角色或完全自定义
- 更直观对话的聊天机器人/代理模式
- 保持完美的Cline兼容性

### 🌍 多语言支持
- UI、文档和手册的完整4语言支持
- 每种语言的专用文档站点
- 实时语言切换功能

### 🚀 **最新Cline v3.26.6架构完全兼容**
- 所有Cline功能都像以前一样完全工作
- 保持Plan/Act模式
- 维护MCP支持
- 零信任安全架构
- 在Claude, Gemini, Kimi等之间自由模型切换

## [0.1.2] - 2025-08-13

- fix: 解决下一代模型系列的browser_action工具加载问题
- feat: 增强对DeepSeek V3和最新推理模型的支持
- fix: 改进的令牌使用优化和API成本管理
- docs: 更新架构文档和实现指南

## [0.1.1] - 2025-07-18

- feat: 初始Caret品牌系统实现
- feat: 增强的多语言i18n支持基础
- fix: VS Code API冲突解决
- docs: 添加全面的开发文档
- test: 建立基于TDD的测试框架

## [0.1.0] - 2025-07-06

- 🎉 **初始Caret发布**: 采用最小修改策略从Cline分叉
- feat: `caret-src/`目录中的Caret专用扩展架构
- feat: 双模式系统(Caret模式/Cline模式)基础
- feat: 使用JSON基础模板的增强系统提示架构
- feat: `caret-docs/`中的全面文档系统
- feat: 多语言支持基础设施
- feat: 基于TDD的开发方法论实现

### 🏗️ 架构基础
- Cline兼容性的最小修改方法
- Level 1-3修改框架
- 基于gRPC的前后端通信
- 安全Cline文件修改的备份系统

### 🧪 开发基础设施
- Vitest测试框架设置
- 全面的CI/CD管道
- 文档驱动的开发方法
- 社区贡献指南

---

**注意**: Caret在添加强大扩展的同时保持与Cline 100%的兼容性。用户可以无缝地在Caret和Cline模式之间切换。
