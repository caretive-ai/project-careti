# Journal des modifications

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
        <img src="https://img.shields.io/badge/🇫🇷_Français-0055a4?style=for-the-badge&labelColor=003f7f" alt="Français"/>
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

## [0.4.8] 2026-02-13

> **Note** : Careti v0.4.8 introduit le système de file d'attente de messages de type Claude Code et corrige le problème de chargement infini de la v0.4.7.

### ✨ Nouvelles fonctionnalités
- **F19 Système de file d'attente de messages** : Saisissez les prochaines instructions pendant que l'IA est en streaming. L'entrée en file d'attente est affichée en aperçu inline au-dessus du champ de saisie.
- **Annulation instantanée ESC** : Un seul appui sur ESC arrête immédiatement le streaming et restaure l'entrée en file d'attente dans l'éditeur pour modification avant renvoi.
- **Édition/Suppression inline de la file d'attente** : Boutons d'édition (restaurer dans le champ de saisie) et de suppression (abandonner) sur l'aperçu de l'entrée en attente.
- **Mode Agent/Chatbot CLI** : Modes agent et chatbot indépendants pour le CLI avec support headless/yolo, reconnexion EOF et gestion améliorée des entrées.
- **Télémétrie CLI** : Suivi d'événements basé sur PostHog pour l'analyse d'utilisation du CLI.
- **Tests E2E CLI** : Tests E2E pour le mode agent, le comportement CLI, la sortie et le mode interactif.
- **RPC clearPendingInput** : Nouveau endpoint gRPC pour effacer l'entrée en file d'attente depuis les boutons d'édition/suppression.

### ✨ Améliorations
- **Polling parallèle des feature flags** : Récupération séquentielle des flags (14 requêtes) remplacée par du parallèle avec un timeout global de 5 secondes.
- **Initialisation non bloquante** : `featureFlagsService.poll()` changé en fire-and-forget pour ne pas bloquer l'activation de l'extension.
- **Pattern de commande subagent** : Ajout de CARETI_COMMAND_PATTERN pour le support du subagent CLI careti/cline.

### Corrections
- **Chargement infini v0.4.7** : `featureFlagsService.poll()` bloquait l'initialisation de l'extension lorsque `data.cline.bot` était injoignable. Changé en non-bloquant avec timeout.
- **Migration ApiProvider** : Ajout de la migration `"caret"` → `"careti"` pour les utilisateurs passant de la v0.4.6 dont les paramètres sauvegardés contenaient encore l'ancien nom de fournisseur.
- **Fallback du handler API** : Ajout du `case "caret":` en fallback dans le switch du fournisseur API pour gérer les valeurs non migrées de manière transparente.
- **Appel de migration legacy** : `migrateLegacyApiConfigurationToModeSpecific()` était défini mais jamais appelé lors de l'initialisation. Désormais correctement invoqué.
- **Race condition pendingInput** : Correction de `consumePendingInput` appelé après `cancelTask()` qui avait déjà détruit la session via `sessionManager.delete()`.
- **Nettoyage des logs de debug** : Suppression des logs console `[CORE-DEBUG]`, `[CLI-DEBUG]`, `[GLM4.7-DEBUG]`.

---

## [0.4.7] 2026-01-30

### ✨ Nouvelles fonctionnalités
- **ZAI GLM-4.7 dans le fournisseur Careti** : Utilisez ZAI GLM-4.7 directement dans le fournisseur Careti avec votre propre clé API.
- **Recherche Web** : Recherche Web intégrée avec SerpAPI pour des informations actualisées.
- **Intégration Claude Code** : Utilisation transparente avec Claude Code CLI via la synchronisation AGENTS.md.
- **Édition de code améliorée** : Édition de code plus fiable avec SmartEditEngine.
- **Affichage du processus de réflexion** : Visualisez le processus de réflexion de l'IA en temps réel (ThinkingRow).

### ✨ Améliorations
- **Renommage Caret → Careti** : Mise à jour complète de la marque.
- **Meilleure gestion des erreurs** : Logique de réessai API optimisée.

---

## [0.4.6] 2026-01-19

### ✨ Améliorations
- **Crédits gratuits** : Les nouveaux utilisateurs reçoivent des crédits gratuits lors de l'inscription.
- **Documentation améliorée** : README multilingue avec liens vers la documentation.

---

## [0.4.5] 2026-01-18

> **Note** : Careti v0.4.5 intègre le système Skills, Hooks i18n et d'autres fonctionnalités de Cline v3.49.0+ via cherry-pick.

### ✨ Nouvelles fonctionnalités
- **Support complet Z.AI GLM-4.7** : Prend en charge le mode Thinking et le style de conversation naturel.
- **Fournisseur [Upstage](https://upstage.ai/)** : Nouveau fournisseur supportant les modèles Upstage Solar.
- **Outils image pour modèles texte** : Les modèles texte uniquement peuvent désormais utiliser les outils du compte Careti pour la génération et l'analyse d'images.
- **Système Skills** (cherry-pick Cline v3.49.0+) : Définissez des compétences spécifiques au projet que l'IA peut utiliser. Gérez les skills dans les répertoires `.agents/skills/` ou `.users/skills/`.
- **Système Hooks** (cherry-pick Cline v3.49.0+) : Exécutez des scripts personnalisés avant/après l'exécution des outils. Gérez les hooks dans les répertoires `.agents/hooks/` ou `.users/hooks/`.
- **Architecture double répertoire & /init** : Contexte IA optimisé en tokens (`.agents/`) et docs utilisateur (`.users/`) avec politique de miroir 1:1. Utilisez la commande `/init` pour analyser le projet et générer automatiquement les fichiers de contexte. AGENTS.md et CLAUDE.md servent de points d'entrée standard.
- **Support des documents HWP** : Support multiplateforme de l'analyse HWP pour Windows, macOS et Linux.
- **Outil read_document** : Outil unifié de lecture de documents supportant HWP, PDF, DOCX, PPTX et plus. Inclut la détection du format PPT legacy.
- **Outil analyze_image** : Nouvel outil d'analyse d'images intégré avec Gemini du compte Careti. Limite max de 7500px, inclut les directives de rapport d'analyse.
- **Améliorations de l'outil generate_image** : Support de l'analyse des balises XML `<image>`, support des chemins de fichiers (relatifs/absolus), directives d'omission aspect_ratio/image_size.
- **Basculement envoi d'image** : Fonctionnalité de basculement pour l'envoi de fichiers image via @mention.

### ✨ Améliorations
- **Extension linguistique** : Ajout des traductions française, allemande et russe. Priorité aux pays disposant de leurs propres modèles IA (Mistral, Aleph Alpha, Yandex, etc.).
- **Drapeaux des pays fournisseurs** : Affichage des drapeaux des pays pour les fournisseurs (perspective Sovereign Cloud).
- **Changement du chemin de contexte global** : Le chemin des paramètres d'agent global a été changé en `~/Documents/.agents/`.
- **Support i18n** : Ajout des traductions coréenne, japonaise et chinoise pour les fonctionnalités Hooks et Skills.
- **Analyse frontmatter YAML** : Ajout d'un utilitaire d'analyse YAML partagé pour Skills/Hooks.
- **Fournisseur par défaut** : Les nouveaux utilisateurs ont désormais Careti comme fournisseur par défaut.
- **Contrôle UI Feature Config** : Contrôle de l'UI compte/mode/dictation via feature config.
- **Optimisation de la taille VSIX** : Réduction de la taille de l'extension en excluant les binaires iOS/Android.
- **UI paramètres image** : L'UI des paramètres ratio/résolution d'image est maintenant visible pour tous les fournisseurs.

### Corrections
- **Échec d'activation sharp** : Correction de l'échec d'activation de la bibliothèque de traitement d'image.
- **Gestion des références d'image** : Correction des problèmes de gestion et d'optimisation des références d'image.
- **Affichage de message en double** : Correction du message "Requesting Careti image generation" apparaissant deux fois.

## [0.4.4] 2025-12-30

### ✨ Améliorations
- **Intégration Nano Banana du compte Careti** : Ajout de Gemini 3 Flash preview aux comptes Careti et intégration de la génération d'images Nano Banana pour que les sorties puissent être utilisées comme assets de projet.
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)** : Ajout du fournisseur Naver Cloud et des modèles HCX-007/HCX-005/HCX-DASH-002.
- **Standard international AAIF Agents.md + initialisation de projet** : Migration des règles Careti/Cline legacy vers le standard AAIF et ajout du support d'initialisation de projet.
- **Build/Release** : Stabilisation des scripts de build et correction de l'ordre de synchronisation des assets pour améliorer la fiabilité du build.
- **Retries de limite de taux** : Implémentation du backoff 5/10/20/40/60s avec compte à rebours visible par l'utilisateur.
- **Docs/Liste des modèles** : Mise à jour des docs de configuration fournisseur et de la liste des modèles supportés.
- **Upstream** : Cherry-pick des corrections de bugs Cline v3.45.0.
- **Corrections de bugs Cline v3.45.0** : Intégration du code de correction de bugs de Cline v3.45.0.
- **Télémétrie** : Ajout de la télémétrie pour le suivi des erreurs/qualité.

### Corrections
- **Images de l'historique** : Correction des images en chemin absolu ne s'affichant pas dans l'historique.
- **Perte d'entrée** : Atténuation des prompts perdus après une réponse.
- **Careti Provider** : Correction des problèmes de comportement Gemini3.
- **Images de profil** : Correction des images manquantes après connexion.
- **Race condition Ask** : Résolution des conditions de course ask.
- **Gestion des réponses [Naver Cloud](https://clova.ai/)** : Détection de `status.code` et des réponses vides, avec mapping 429.
- **Stabilité du streaming** : Protection contre les chunks de stream vides et amélioration de la journalisation des échecs de streaming.

## [0.4.1] 2025-12-10

### ✨ Améliorations
- **Careti Provider** : Stabilisation du Careti Provider basé sur `anyLLM` pour le lancement officiel du service `careti.ai`. Inclut des améliorations de l'API et une meilleure fiabilité.

### Corrections
- **Système Persona** : Amélioration de la logique d'initialisation des personas pour assurer le seeding correct des avatars par défaut. Amélioration de la gestion des exceptions pour le chargement des images de persona.
- **Branding** : Correction du branding de la fonctionnalité `.clineignore` pour s'aligner avec `.caretignore`.
- **Build** : Résolution de divers problèmes de build et de localisation des ressources.
- **Authentification** : Corrections mineures et vérifications pour le processus d'authentification.

## [0.4.0] 2025-11-28

> **Note** : Careti v0.4.0 est basé sur Cline v3.38.2. Les notes de version upstream sont dans `CHANGELOG-CLINE.md`.

### 🎉 Fusion upstream Cline v3.38.2
- Commit de fusion : `8723b386f` (branche : `main_backup_20251128202033`).

### Ajouts
- **Intégration Cline v3.38.2** : Toutes les fonctionnalités upstream incluant le support des derniers modèles (Claude Opus 4.5).
- **Système de double compte** : Basculement entre le mode Careti (étendu) et le mode Cline (stock).
- **Configuration fournisseur** : Récupération automatique des modèles pour LiteLLM/BizRouter avec vérifications de santé en temps réel.
- **Système de prompts JSON** : Configuration dynamique des prompts système via JSON.
- **Historique de saisie** : Navigation dans l'historique de type terminal avec persistance.
- **Raccourcis** : Annulation (Esc) et reprise (Ctrl+Shift+R) des tâches.

### Corrections
- **Blocage terminal** sur Linux avec l'intégration shell.
- **Branding** restauré dans l'UI et le CLI.
