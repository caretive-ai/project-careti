# Änderungsprotokoll

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
        <a href="./CHANGELOG.zh-cn.md">
          <img src="https://img.shields.io/badge/🇨🇳_中文-eab308?style=for-the-badge&labelColor=ca8a04" alt="中文"/>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="4">
        <a href="./CHANGELOG.fr.md">
          <img src="https://img.shields.io/badge/🇫🇷_Français-0055a4?style=for-the-badge&labelColor=003f7f" alt="Français"/>
        </a>
        &nbsp;&nbsp;
        <img src="https://img.shields.io/badge/🇩🇪_Deutsch-ffcc00?style=for-the-badge&labelColor=dd0000" alt="Deutsch"/>
        &nbsp;&nbsp;
        <a href="./CHANGELOG.ru.md">
          <img src="https://img.shields.io/badge/🇷🇺_Русский-0039a6?style=for-the-badge&labelColor=d52b1e" alt="Русский"/>
        </a>
      </td>
    </tr>
  </table>
</div>

## [0.4.8] 2026-02-13

> **Hinweis**: Careti v0.4.8 führt das Claude Code-artige Nachrichtenwarteschlangen-System ein und behebt das Problem des endlosen Ladens in v0.4.7.

### ✨ Neue Funktionen
- **F19 Nachrichtenwarteschlangen-System**: Geben Sie die nächsten Anweisungen ein, während die KI streamt. Die Warteschlangeneingabe wird als Inline-Vorschau über dem Eingabefeld angezeigt.
- **ESC Sofort-Abbruch**: Ein einzelner ESC-Druck stoppt das Streaming sofort und stellt die Warteschlangeneingabe im Editor zur Bearbeitung vor dem erneuten Senden wieder her.
- **Inline-Bearbeitung/-Löschung der Warteschlange**: Bearbeiten- (in Eingabefeld wiederherstellen) und Löschen-Buttons (verwerfen) in der Vorschau der ausstehenden Eingabe.
- **CLI Agent-/Chatbot-Modus**: Unabhängige Agent- und Chatbot-Modi für CLI mit Headless/Yolo-Unterstützung, EOF-Wiederverbindung und verbesserter Eingabebehandlung.
- **CLI-Telemetrie**: PostHog-basiertes Event-Tracking für CLI-Nutzungsanalysen.
- **CLI E2E-Tests**: E2E-Tests für Agent-Modus, CLI-Verhalten, Ausgabe und interaktiven Modus.
- **clearPendingInput RPC**: Neuer gRPC-Endpunkt zum Löschen der Warteschlangeneingabe über die Bearbeiten-/Löschen-Buttons.

### ✨ Verbesserungen
- **Paralleles Feature-Flags-Polling**: Sequenzielles Flag-Abrufen (14 Anfragen) auf parallel mit 5-Sekunden-Gesamt-Timeout umgestellt.
- **Nicht-blockierende Initialisierung**: `featureFlagsService.poll()` auf Fire-and-Forget umgestellt, um die Aktivierung der Erweiterung nicht zu blockieren.
- **Subagent-Befehlsmuster**: CARETI_COMMAND_PATTERN für Careti/Cline CLI-Subagent-Unterstützung hinzugefügt.

### Fehlerbehebungen
- **Endloses Laden v0.4.7**: `featureFlagsService.poll()` blockierte die Erweiterungsinitialisierung, wenn `data.cline.bot` nicht erreichbar war. Auf nicht-blockierend mit Timeout umgestellt.
- **ApiProvider-Migration**: Migration von `"caret"` → `"careti"` für Benutzer hinzugefügt, die von v0.4.6 upgraden und deren gespeicherte Einstellungen noch den alten Anbieternamen enthielten.
- **API-Handler-Fallback**: `case "caret":` Fallback im API-Anbieter-Switch hinzugefügt, um nicht migrierte Anbieterwerte ordnungsgemäß zu behandeln.
- **Legacy-Migrationsaufruf**: `migrateLegacyApiConfigurationToModeSpecific()` war definiert, wurde aber bei der Initialisierung nie aufgerufen. Jetzt ordnungsgemäß aufgerufen.
- **pendingInput Race Condition**: Korrektur von `consumePendingInput`, das nach `cancelTask()` aufgerufen wurde, welches die Sitzung bereits über `sessionManager.delete()` zerstört hatte.
- **Debug-Log-Bereinigung**: `[CORE-DEBUG]`-, `[CLI-DEBUG]`-, `[GLM4.7-DEBUG]`-Konsolenlogs entfernt.

---

## [0.4.7] 2026-01-30

### ✨ Neue Funktionen
- **ZAI GLM-4.7 im Careti-Anbieter**: Verwenden Sie ZAI GLM-4.7 direkt im Careti-Anbieter mit Ihrer eigenen API-Schlüssel.
- **Web-Suche**: Integrierte Web-Suche mit SerpAPI für aktuelle Informationen.
- **Claude Code Integration**: Nahtlose Nutzung mit Claude Code CLI über AGENTS.md-Synchronisation.
- **Verbessertes Code-Editing**: Zuverlässigere Codebearbeitung mit SmartEditEngine.
- **Denkprozess-Anzeige**: Sehen Sie den Denkprozess der KI in Echtzeit (ThinkingRow).

### ✨ Verbesserungen
- **Caret → Careti Umbenennung**: Vollständige Markenaktualisierung.
- **Bessere Fehlerbehandlung**: Optimierte API-Wiederholungslogik.

---

## [0.4.6] 2026-01-19

### ✨ Verbesserungen
- **Kostenlose Credits**: Neue Benutzer erhalten kostenlose Credits bei der Registrierung.
- **Verbesserte Dokumentation**: Mehrsprachige README mit Dokumentationslinks.

---

## [0.4.5] 2026-01-18

> **Hinweis**: Careti v0.4.5 übernimmt das Skills-System, Hooks i18n und andere Funktionen von Cline v3.49.0+ via Cherry-Pick.

### ✨ Neue Funktionen
- **Vollständige Z.AI GLM-4.7 Unterstützung**: Unterstützt Thinking-Modus und natürlichen Konversationsstil.
- **[Upstage](https://upstage.ai/) Anbieter**: Neuer Anbieter mit Unterstützung für Upstage Solar-Modelle.
- **Bild-Tools für Textmodelle**: Reine Textmodelle können jetzt Careti-Konto-Tools für Bildgenerierung und -analyse verwenden.
- **Skills-System** (Cline v3.49.0+ Cherry-Pick): Definieren Sie projektspezifische Fähigkeiten, die die KI nutzen kann. Verwalten Sie Skills in den Verzeichnissen `.agents/skills/` oder `.users/skills/`.
- **Hooks-System** (Cline v3.49.0+ Cherry-Pick): Führen Sie benutzerdefinierte Skripte vor/nach der Tool-Ausführung aus. Verwalten Sie Hooks in den Verzeichnissen `.agents/hooks/` oder `.users/hooks/`.
- **Dual-Verzeichnis-Architektur & /init**: Token-optimierter KI-Kontext (`.agents/`) und Benutzer-Docs (`.users/`) mit 1:1-Spiegelungsrichtlinie. Verwenden Sie den `/init`-Befehl, um das Projekt zu analysieren und Kontext-Dateien automatisch zu generieren. AGENTS.md und CLAUDE.md dienen als Standard-Einstiegspunkte.
- **HWP-Dokumentenunterstützung**: Plattformübergreifende HWP-Parsing-Unterstützung für Windows, macOS und Linux.
- **read_document-Tool**: Einheitliches Dokumentenlesewerkzeug mit Unterstützung für HWP, PDF, DOCX, PPTX und mehr. Beinhaltet Legacy-PPT-Formaterkennung.
- **analyze_image-Tool**: Neues Bildanalyse-Tool integriert mit Gemini des Careti-Kontos. Max. 7500px-Limit, beinhaltet Richtlinien für Analyseergebnisberichte.
- **generate_image-Tool-Verbesserungen**: XML-`<image>`-Tag-Parsing-Unterstützung, Dateipfad-Unterstützung (relativ/absolut), Richtlinien zum Weglassen von aspect_ratio/image_size.
- **Bildversand-Umschalter**: Umschaltfunktion für den Bilddateiensendung via @Erwähnung.

### ✨ Verbesserungen
- **Spracherweiterung**: Französische, deutsche und russische Übersetzungen hinzugefügt. Priorisierung von Ländern mit eigenen KI-Modellen (Mistral, Aleph Alpha, Yandex, usw.).
- **Anbieter-Länderflaggen**: Anzeige von Länderflaggen für Anbieter (Sovereign-Cloud-Perspektive).
- **Änderung des globalen Kontextpfads**: Der globale Agenten-Einstellungspfad wurde auf `~/Documents/.agents/` geändert.
- **i18n-Unterstützung**: Koreanische, japanische und chinesische Übersetzungen für Hooks- und Skills-Funktionen hinzugefügt.
- **YAML-Frontmatter-Parsing**: Gemeinsames YAML-Parsing-Dienstprogramm für Skills/Hooks hinzugefügt.
- **Standard-Anbieter**: Neue Benutzer haben jetzt Careti als Standard-Anbieter.
- **Feature Config UI-Steuerung**: Steuerung der Konto-/Modus-/Diktier-UI über Feature Config.
- **VSIX-Größenoptimierung**: Reduzierung der Erweiterungsgröße durch Ausschluss von iOS/Android-Binärdateien.
- **Bildeinstellungs-UI**: Bildverhältnis-/Auflösungseinstellungs-UI ist jetzt für alle Anbieter sichtbar.

### Korrekturen
- **Sharp-Aktivierungsfehler**: Behebung des Aktivierungsfehlers der Bildverarbeitungsbibliothek.
- **Bildreferenzhandhabung**: Behebung von Problemen bei der Bildreferenzhandhabung und -optimierung.
- **Doppelte Nachrichtenanzeige**: Behebung der doppelten Anzeige der Nachricht "Requesting Careti image generation".

## [0.4.4] 2025-12-30

### ✨ Verbesserungen
- **Careti-Konto Nano Banana-Integration**: Gemini 3 Flash Preview zu Careti-Konten hinzugefügt und Nano Banana-Bildgenerierung integriert, sodass Ausgaben als Projekt-Assets verwendet werden können.
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)**: Naver Cloud-Anbieter und HCX-007/HCX-005/HCX-DASH-002-Modelle hinzugefügt.
- **AAIF internationaler Standard Agents.md + Projektinitialisierung**: Migration der Legacy Careti/Cline-Regeln zum AAIF-Standard und Hinzufügung der Projektinitialisierungsunterstützung.
- **Build/Release**: Stabilisierung der Build-Skripte und Korrektur der Asset-Synchronisierungsreihenfolge zur Verbesserung der Build-Zuverlässigkeit.
- **Rate-Limit-Wiederholungen**: Implementierung von 5/10/20/40/60s-Backoff mit benutzervisiblem Countdown.
- **Docs/Modellliste**: Aktualisierung der Anbieter-Setup-Dokumentation und der unterstützten Modellliste.
- **Upstream**: Cherry-Pick von Cline v3.45.0 Bugfixes.
- **Cline v3.45.0 Bugfixes**: Integration des Bugfix-Codes von Cline v3.45.0.
- **Telemetrie**: Telemetrie für Fehler-/Qualitätsverfolgung hinzugefügt.

### Korrekturen
- **Verlaufsbilder**: Behebung von Bildern mit absolutem Pfad, die im Verlauf nicht angezeigt wurden.
- **Eingabeverlust**: Abschwächung von Prompts, die nach einer Antwort verloren gingen.
- **Careti Provider**: Behebung von Gemini3-Verhaltensproblemen.
- **Profilbilder**: Behebung von fehlenden Bildern nach der Anmeldung.
- **Ask-Race-Condition**: Behebung von Ask-Race-Conditions.
- **[Naver Cloud](https://clova.ai/) Antwortverarbeitung**: Erkennung von `status.code` und leeren Antworten, mit 429-Mapping.
- **Streaming-Stabilität**: Schutz gegen leere Stream-Chunks und verbesserte Streaming-Fehlerprotokollierung.

## [0.4.1] 2025-12-10

### ✨ Verbesserungen
- **Careti Provider**: Stabilisierung des `anyLLM`-basierten Careti Providers für den offiziellen Start des `careti.ai`-Dienstes. Beinhaltet API-Verbesserungen und verbesserte Zuverlässigkeit.

### Korrekturen
- **Persona-System**: Verbesserung der Persona-Initialisierungslogik, um das korrekte Seeding der Standard-Avatare sicherzustellen. Verbesserte Ausnahmebehandlung beim Laden von Persona-Bildern.
- **Branding**: Korrektur des Brandings der `.clineignore`-Funktionalität zur Angleichung an `.caretignore`.
- **Build**: Behebung verschiedener Build- und Ressourcenstandortprobleme.
- **Authentifizierung**: Kleine Korrekturen und Überprüfungen für den Authentifizierungsprozess.

## [0.4.0] 2025-11-28

> **Hinweis**: Careti v0.4.0 basiert auf Cline v3.38.2. Upstream-Versionshinweise befinden sich in `CHANGELOG-CLINE.md`.

### 🎉 Cline v3.38.2 Upstream-Merge
- Merge-Commit: `8723b386f` (Branch: `main_backup_20251128202033`).

### Hinzugefügt
- **Cline v3.38.2-Integration**: Alle Upstream-Funktionen einschließlich Unterstützung der neuesten Modelle (Claude Opus 4.5).
- **Dual-Konto-System**: Wechsel zwischen Careti-Modus (erweitert) und Cline-Modus (Standard).
- **Anbieter-Einrichtung**: Automatischer Modellabruf für LiteLLM/BizRouter mit Echtzeit-Gesundheitsprüfungen.
- **JSON-Prompt-System**: Dynamische Systempromptkonfiguration über JSON.
- **Eingabeverlauf**: Terminal-ähnliche Verlaufsnavigation mit Persistenz.
- **Tastenkürzel**: Abbrechen (Esc) und Fortsetzen (Ctrl+Shift+R) von Aufgaben.

### Korrekturen
- **Terminal-Hänger** unter Linux mit Shell-Integration.
- **Branding** in UI und CLI wiederhergestellt.
