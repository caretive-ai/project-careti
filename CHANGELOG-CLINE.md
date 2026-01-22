# Cline Upstream Changelog (Tracked for Caret)

> CARETI MODIFICATION: Upstream Cline release notes are recorded separately to keep Caret release history clean. Caret versions link back to these sections when a Cline merge is included.

## [3.38.2]

### Added
- Added Claude Opus 4.5 (Anthropic/OpenRouter/Bedrock/Vertex) with prompt caching prices.

## [3.38.1]

### Fixed
- Fixed handling of `signature` field in `sanitizeAnthropicContentBlock` to properly preserve it when thinking is enabled, as required by Anthropic's API.

## [3.38.0]

### Added
- Gemini 3 Pro Preview model.
- AquaVoice Avalon model for voice-to-text dictation.

### Fixed
- Automatic context truncation when AWS Bedrock token usage rate limits are exceeded.
