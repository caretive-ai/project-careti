# F08 - Persona System

**Status**: ✅ Phase 4 (gRPC) | **Scope**: Backend (service/gRPC), Webview (UI/context) | **Priority**: 🔴 High

## 📋 Overview
Personalizes AI interactions with predefined personas (Caret, Oh Sarang, Madobe Ichika, Cyan Mackin, Thando Ubuntu) or custom uploads. Avatars appear in chat; persona tone/specialty is applied to responses.

## 🆚 Improvements vs Cline
| Area | Cline | Caret |
| --- | --- | --- |
| Persona | None | Persona identity (tone, specialty, avatar) |
| Visuals | Text only | Avatars + thinking images in chat |
| Customization | Not available | User-uploaded profile/thinking images |
| Sync | One-way | Real-time gRPC streaming to all windows |

## 🏗 Code Scope
- **Backend**: `src/services/persona/persona-service.ts`, `persona-storage.ts`, gRPC controllers in `src/controllers/persona/*`, proto in `proto/caret/persona.proto`.
- **Webview**: `PersonaManagement.tsx`, `PersonaAvatar.tsx`, chat integration in `webview-ui/src/components/chat/ChatRow.tsx` (Hybrid pattern), CSP-safe image handling.
- **Initializer**: `caret-src/services/persona/persona-initializer.ts` seeds defaults from `template_characters.json` and copies images to global storage.

## 🎭 Features
- Persona avatars on all AI messages; thinking-state images supported.
- Tab-based selector with multilingual descriptions (ko/en). 
- Custom image upload (profile + thinking) with immediate preview.
- gRPC streaming (`SubscribeToPersonaChanges`) keeps all windows in sync after `UpdatePersona`.

## 🔄 Data Flow (gRPC)
1) **Initialize**: on extension start, ensure `persona.md` + images exist (seed from assets if missing). 
2) **Load**: Webview calls `GetPersonaProfile`; backend combines `persona.md` and stored images to return current profile. 
3) **Update**: UI calls `UpdatePersona`; backend writes `persona.md`, copies selected images. 
4) **Broadcast**: `persona-service.ts` emits change events; subscribers update UI instantly.

## 📦 Templates
`template_characters.json` defines persona metadata (name/description per locale, instructions, avatar/thinking/intro URIs, default flag).

## 🔧 Storage Policy (2025-09-10)
- **State** (settings) → VS Code `globalState`. 
- **Storage** (image files) → appropriate storage with real-time sync between ExtensionState and persona storage.

## 🧪 Tests
- Target: 100% coverage for persona components/services. 
- Validate CSP-safe image loading, React hook rules, chat layout integration, and live sync behavior.

## 🚀 Roadmap
- Add question-type persona icons, animation polish, and accessibility tweaks.
