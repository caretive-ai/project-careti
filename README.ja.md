[Read this document in English](./README.md) | [한국어로 읽기](./README.ko.md) | [日本語で読む](./README.ja.md) | [阅读中文版](./README.zh-cn.md)

<div align="center">
  <img src="caret-assets/icons/icon.png" alt="Caret icon" width="128">
  <h1>Caret: あなたの新しいAIパートナー</h1>
  <p><strong>Clineの透明性にCursorの柔軟性を加える</strong></p>
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=caretive.caret">
      <img src="https://img.shields.io/visual-studio-marketplace/v/caretive.caret.svg?color=blue&label=VS%20Code%20Marketplace" alt="VS Code Marketplace">
    </a>
    <a href="https://github.com/aicoding-caret/caret">
      <img src="https://img.shields.io/github/stars/aicoding-caret/caret.svg?style=social&label=Star" alt="GitHub stars">
    </a>
  </p>
</div>

Caretは単なるAIコーディングツールを超え、**開発者と共に成長するAIパートナー**を目指すVS Code拡張機能です。安定性が実証されたオープンソース[Cline](https://github.com/cline/cline)の利点を維持しながら、より強力な機能、低コスト、柔軟な機能を'オーバーレイ'として追加し、開発体験を最大化します。

## ✨ Caretの特徴

| 特徴 | Cline | Cursor | **Caret** |
| :--- | :--- | :--- | :--- |
| **AI行動様式** | Plan/Act(分断された体験) | Ask/Agent(単一体験) | **Chatbot/Agentモード(単一体験)** |
| **AI透明性** | ✅ オープンソース (高) | ❌ ブラックボックス (低) | **✅ オープンソース (高)** |
| **AI効率性** | 基本 | 基本 | **システムプロンプト最適化で50%トークン削減** |
| **ペルソナ** | ❌ 未対応 | ❌ 未対応 | **✅ テンプレートとカスタムペルソナ、プロフィール画像対応** |
| **多言語対応** | ❌ 未対応 | ❌ 未対応 | **✅ 完全な多言語対応 (i18nオーバーレイ)** |
| **アーキテクチャ** | コア機能 | クローズド | **オーバーレイ構造 (安定性 + 拡張性)** |

### 1. より自然なAIとの対話: ChatbotとAgentモード
Clineのやや硬直したPlan/Actモードを超え、Cursorの Ask/Agent方式のように柔軟で、かつ'Ask'という用語よりも直感的な**Chatbot/Agentモード**を提供します。また、行動様式を変えただけでなく、**独自に改善したシステムプロンプト**によってAIの応答性能と態度を向上させました。[実験検証](./caret-docs/reports/experiment/json_caret_performance_test_20250713/comprehensive-performance-report-20250717.md)により、**50%のトークン削減**と**20%のAPIコスト削減**を達成し、より経済的で予測可能なAI協業を提供します。

### 2. 自分だけのAIパートナーを作る: カスタムペルソナ
<img src="caret-assets/template_characters/caret_illust.png" alt="Caret Persona Illustration" width="300"/>

Caretの基本キャラクター、K-POPアイドル、OS-tanなど、あらかじめ用意された**テンプレートペルソナ**でコーディングに楽しさを加えましょう。自分だけのAIエージェント名と**プロフィール画像を登録**して、視覚的に生き生きとした開発環境を作ることができます。

**基本提供ペルソナ:**
*   <img src="caret-assets/template_characters/caret.png" width="24" align="center"/> **キャレット**: コーディングが大好きで開発者を支援するフレンドリーなロボット。
*   <img src="caret-assets/template_characters/sarang.png" width="24" align="center"/> **オサラン**: K-popアイドルであり、論理と感情の間であなたを助けるツンデレ工学女子。
*   <img src="caret-assets/template_characters/ichika.png" width="24" align="center"/> **窓辺イチカ**: Windows 11をモチーフにした、きちんとして頼りになるアシスタント。
*   <img src="caret-assets/template_characters/cyan.png" width="24" align="center"/> **シアン・マッキン**: macOSをモチーフにした、簡潔で効率的なヘルパー。
*   <img src="caret-assets/template_characters/ubuntu.png" width="24" align="center"/> **丹土ウブントゥ**: オープンソースの精神で共に問題を解決する温かい協力者。

### 3. 言語の壁のないコーディング: 完全な多言語対応
他のAIツールが見落としていた多言語対応、Caretが解決します。**i18nベースのオーバーレイ構造**により、英語に不慣れな開発者も**日本語、韓国語、中国語など自分の母国語**ですべての機能を完全に使用できます。

### 4. 安定性と拡張性を同時に: オーバーレイアーキテクチャ
安定性が実証されたClineのコアはそのまま保持し、Caret独自の革新的な機能をその上に'オーバーレイ'として重ねました。これにより、**Clineの安定性と透明性**を享受しながら、**Caretの強力な拡張性**を体験できます。

## 🚀 はじめ方

1.  **インストール:** VS Code マーケットプレイスで**"Caret"**を検索してインストールしてください。(準備中)
2.  **ペルソナ選択:** サイドバーでお好みのAIペルソナを選択するか、独自に作成してください。
3.  **対話開始:** さあ、AIパートナーと一緒にコーディングを始めましょう！

## 🔮 将来のビジョンとロードマップ

Caretは'究極のAIパートナー'を目指して進化し続けています。

*   **独自ログインとクレジットシステム:** 独自ログイン機能（1週間以内提供予定）とクレジット購入機能（2週間以内提供予定）を準備中です。
*   **sLLMとソブリンモデル対応:** セキュリティとコスト効率のため、ローカルLLM（sLLM）と各国特化型ソブリンモデルのサポートを強化します。
*   **コミュニティベースの機能拡張:** ユーザーのフィードバックと貢献を通じて共に作り上げる機能を追加予定です。

## 🤝 貢献について

Caretはみなさんの参加で成長するオープンソースプロジェクトです。バグレポート、機能提案、コード貢献など、どのような形の協力も歓迎します！

### 🌟 貢献方法

| 貢献タイプ | 説明 | 特典 |
|------------|------|------|
| **💻 コード貢献** | 機能開発、バグ修正、文書改善 | サービスクレジット + GitHub貢献者登録 |
| **🐛 バグ報告** | 問題報告、再現手順提供 | サービスクレジット |
| **💡 アイデア提案** | 新機能、改善案の提案 | サービスクレジット |
| **💰 金銭的貢献** | プロジェクト支援、開発支援 | サービスクレジット + 特別貢献者登録 |
| **📖 文書化** | ガイド作成、翻訳、チュートリアル | サービスクレジット + 文書貢献者登録 |

### 🎁 貢献者特典

- **サービス利用クレジット**: 貢献規模に応じたCaretサービスクレジットの提供
- **GitHub貢献者登録**: プロジェクトREADMEとリリースノートへの名前掲載
- **サービスページ掲載**: 公式ウェブサイトの貢献者ページへのプロフィール掲載
- **優先サポート**: 新機能とベータ版への優先アクセス

### 🚀 始め方

1. **イシューの確認**: [GitHub Issues](https://github.com/aicoding-caret/caret/issues)で貢献できる課題を探す
2. **議論への参加**: 機能提案や質問をIssuesやDiscussionsで共有
3. **コード貢献**: Fork → 開発 → Pull Requestのプロセスでコード貢献
4. **文書貢献**: `caret-docs/`フォルダの文書改善や翻訳作業

詳細な貢献ガイドは[CONTRIBUTING.md](./CONTRIBUTING.en.md)を参照してください。

---

## 🛠️ 開発者向け情報

Caretプロジェクト開発に必要なすべての情報を体系的に整理しました。

### 📚 コア開発ガイド

#### 🏗️ アーキテクチャ & 設計
- **[開発者ガイド (DEVELOPER_GUIDE.md)](./DEVELOPER_GUIDE.en.md)** - ビルド、テスト、パッケージングの基本情報
- **[開発ガイド概要 (development/)](./caret-docs/development/index.en.mdx)** - 全開発ガイドのナビゲーション
- **[Caretアーキテクチャガイド](./caret-docs/development/caret-architecture-and-implementation-guide.en.mdx)** - Fork構造、拡張戦略、設計原則
- **[拡張アーキテクチャ図](./caret-docs/development/extension-architecture.mmd)** - 全システム構造の視覚化 (Mermaid)
- **[新規開発者ガイド](./caret-docs/development/new-developer-guide.en.mdx)** - プロジェクト入門と開発環境構築

#### 🧪 テスト & 品質管理
- **[テストガイド](./caret-docs/development/testing-guide.en.mdx)** - TDD、テスト作成標準、カバレッジ管理
- **[ロギングシステム](./caret-docs/development/logging.en.mdx)** - 統合ロギング、デバッグ、開発/本番モード

#### 🔄 Frontend-Backend通信
- **[相互作用パターン](./caret-docs/development/frontend-backend-interaction-patterns.en.mdx)** - 循環メッセージ防止、Optimistic Update
- **[Webview通信](./caret-docs/development/webview-extension-communication.en.mdx)** - メッセージタイプ、状態管理、通信構造
- **[UI-Storageフロー](./caret-docs/development/ui-to-storage-flow.en.mdx)** - データフローと状態管理パターン

#### 🤖 AIシステム実装
- **[AIメッセージフローガイド](./caret-docs/development/ai-message-flow-guide.en.mdx)** - AIメッセージ送受信の全フロー
- **[システムプロンプト実装](./caret-docs/development/system-prompt-implementation.en.mdx)** - システムプロンプトの設計と実装
- **[メッセージ処理アーキテクチャ](./caret-docs/development/message-processing-architecture.en.mdx)** - メッセージ処理システムの設計

#### 🎨 UI/UX開発
- **[コンポーネントアーキテクチャ](./caret-docs/development/component-architecture-principles.en.mdx)** - Reactコンポーネント設計原則
- **[フロントエンドi18nシステム](./caret-docs/development/locale.en.mdx)** - 多言語対応実装 (UI)
- **[バックエンドi18nシステム](./caret-docs/development/backend-i18n-system.en.mdx)** - 多言語対応実装 (システムメッセージ)

#### 🔧 開発ツール & ユーティリティ
- **[ユーティリティガイド](./caret-docs/development/utilities.en.mdx)** - 開発ユーティリティの使用法
- **[ファイル保存と画像読み込み](./caret-docs/development/file-storage-and-image-loading-guide.en.mdx)** - ファイル処理システム
- **[リンク管理ガイド](./caret-docs/development/link-management-guide.en.mdx)** - リンク管理システム
- **[対応モデル一覧](./caret-docs/development/support-model-list.en.mdx)** - AIモデル対応状況

#### 📖 文書化 & 規約
- **[文書化ガイド](./caret-docs/development/documentation-guide.en.mdx)** - 文書作成標準と規約
- **[JSON注釈規約](./caret-docs/development/json-comment-conventions.en.mdx)** - JSONファイル注釈作成規則

#### 🤖 AI作業方法論
- **[AI作業インデックスガイド](./caret-docs/development/ai-work-index.en.mdx)** - **AI必須事前読解** 📋
- **[AI作業ガイド](./caret-docs/guides/ai-work-method-guide.en.mdx)** - TDD、アーキテクチャレビュー、フェーズベース作業

### 🎯 クイックスタートワークフロー

1. **環境設定**: [開発者ガイド](./DEVELOPER_GUIDE.en.md) → [開発ガイド概要](./caret-docs/development/index.en.mdx)
2. **プロジェクト理解**: [新規開発者ガイド](./caret-docs/development/new-developer-guide.en.mdx) → [Caretアーキテクチャガイド](./caret-docs/development/caret-architecture-and-implementation-guide.en.mdx)
3. **AIシステム理解**: [AIメッセージフローガイド](./caret-docs/development/ai-message-flow-guide.en.mdx) → [システムプロンプト実装](./caret-docs/development/system-prompt-implementation.en.mdx)
4. **開発開始**: [AI作業ガイド](./caret-docs/guides/ai-work-method-guide.en.mdx) → [テストガイド](./caret-docs/development/testing-guide.en.mdx)
5. **高度な機能**: [相互作用パターン](./caret-docs/development/frontend-backend-interaction-patterns.en.mdx) → [コンポーネントアーキテクチャ](./caret-docs/development/component-architecture-principles.en.mdx)

### 📖 追加資料

- **[タスク文書](./caret-docs/tasks/)** - 具体的な実装作業ガイド
- **[戦略文書](./caret-docs/strategy-archive/)** - プロジェクトビジョンとロードマップ
- **[ユーザーガイド](./caret-docs/user-guide/)** - エンドユーザー向け使用方法

💡 **開発開始前の必読**: [AI作業方法論ガイド](./caret-docs/guides/ai-work-method-guide.en.mdx)でTDDベース開発プロセスとアーキテクチャ原則を最初に理解してください。

⚡ **AIシステムを理解したい場合**: [AIメッセージフローガイド](./caret-docs/development/ai-message-flow-guide.en.mdx)でユーザーメッセージがAIに送信され応答を受け取る全プロセスを確認してください！
