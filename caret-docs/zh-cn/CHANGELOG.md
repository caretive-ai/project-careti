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

## [0.2.0]

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

## [0.1.3] - 2025-01-11

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

## [0.1.2] - 2025-01-05

- fix: 解决下一代模型系列的browser_action工具加载问题
- feat: 增强对DeepSeek V3和最新推理模型的支持
- fix: 改进的令牌使用优化和API成本管理
- docs: 更新架构文档和实现指南

## [0.1.1] - 2024-12-28

- feat: 初始Caret品牌系统实现
- feat: 增强的多语言i18n支持基础
- fix: VS Code API冲突解决
- docs: 添加全面的开发文档
- test: 建立基于TDD的测试框架

## [0.1.0] - 2024-12-20

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