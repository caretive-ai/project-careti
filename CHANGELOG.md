# Changelog

## [0.1.2]

- **GPT-5 Model Family Support**: Added support for OpenAI's latest GPT-5, GPT-5 Mini, and GPT-5 Nano models with advanced reasoning capabilities and improved performance
- **Enhanced Provider Support**: Added 15 new API providers including Claude Code, Hugging Face, Cerebras, Groq, SAP AI Core, Moonshot, Huawei Cloud MaaS, and Baseten, integrating 274 AI models



## [0.1.1]

- Patched persona application bug
- Fixed project opening failure by handling broken checkpoint exceptions
- Changed API providers (except Caret) to Native and applied caching
- Optimized token cost by dynamic loading of system prompts

## [0.1.0]

- Public release of Caret repository forked from Cline v3.17.13
- Applied overlay architecture design for Caret development on top of Cline
- Introduced `.caretrules` for AI-agent–based development workflow
- Added i18n support for Korean, English, Chinese and Japanese interfaces
- Provided six persona templates out-of-the-box
- Developed Caret-exclusive chatbot/agent features

---

For changes prior to v3.17.13, see [CHANGELOG-cline.md](CHANGELOG-cline.md)
