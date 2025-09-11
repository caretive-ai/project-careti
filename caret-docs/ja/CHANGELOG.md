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
        <img src="https://img.shields.io/badge/日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
      </td>
      <td align="center">
        <a href="../zh-cn/CHANGELOG.md">
          <img src="https://img.shields.io/badge/中文-dc2626?style=for-the-badge&labelColor=b91c1c" alt="中文"/>
        </a>
      </td>
    </tr>
  </table>
</div>

# 変更ログ

## [0.2.0]

- **Cline v3.26.6マージ**: 最新のCline upstream (`v3.26.6`, commit `c6aa47095ee47036946c6a51339a4fa22aaa073c`) をマージコミット `f8bd960b4` を通じてマージしました。詳細は [CHANGELOG-CLINE.md](../../CHANGELOG-CLINE.md) を参照してください。
  - **主要ユーザー機能アップデート**:
    - **最新AIモデルサポート**: GPT-5, Claude 4, Grok などの最新モデルと強化されたAI機能のサポート
    - **15以上の新しいAPIプロバイダー**: Hugging Face, Groq など15以上の新しいサービス統合
    - **タスク管理（Focus Chain）**: 複雑なタスクのための自動To-Doリスト生成および追跡機能を追加
    - **便利機能**: 会話の自動圧縮、改善されたチェックポイント、Mermaidダイアグラムプレビューなど多数の機能
  - **主要開発構造変更**:
    - バックエンドアーキテクチャの改善と強化されたAPIプロバイダーシステム
    - フロントエンドUIの改善とより良いユーザーエクスペリエンス
    - 強化されたMCP（Model Context Protocol）サポート

## [0.1.3] - 2025-01-11

- 🎉 **メジャーアップデート**: ペルソナシステムを含むCaret統合
- feat: パーソナライズされたAIペルソナサポート（Caret, Oh Sarang, Madobe Ichika, Cyan Macin, Tando Ubuntu）
- feat: Cline/Caretモードトグル - いつでも元のCline方式に切り替え可能
- feat: 完璧な4言語サポート（韓国語, 英語, 日本語, 中国語）
- feat: より効率的なAI応答のための強化されたシステムプロンプト
- feat: 300モデルをサポートする36プロバイダー
- feat: docs.cline.bot多言語文書化進行中

### 🎭 Caret専用機能
- 独自のAI名とプロフィール画像の登録
- テンプレートペルソナの選択または完全なカスタマイズ
- より直感的な会話のためのチャットボット/エージェントモード
- 完璧なCline互換性の維持

### 🌍 多言語サポート
- UI、ドキュメント、マニュアルの完全な4言語サポート
- 各言語専用のドキュメントサイト
- リアルタイム言語切り替え機能

### 🚀 **最新Cline v3.26.6アーキテクチャ完全互換**
- すべてのCline機能が以前と全く同じように動作
- Plan/Actモードの保持
- MCPサポートの維持
- ゼロトラストセキュリティアーキテクチャ
- Claude, Gemini, Kimi等の自由なモデル切り替え

## [0.1.2] - 2025-01-05

- fix: 次世代モデルファミリー用browser_actionツール読み込み問題の解決
- feat: DeepSeek V3と最新推論モデルに対する強化されたサポート
- fix: 向上したトークン使用量最適化とAPIコスト管理
- docs: アーキテクチャドキュメントと実装ガイドの更新

## [0.1.1] - 2024-12-28

- feat: 初期Caretブランディングシステム実装
- feat: 強化された多言語i18nサポート基盤
- fix: VS Code API競合解決
- docs: 包括的な開発ドキュメントの追加
- test: TDDベースのテスティングフレームワーク確立

## [0.1.0] - 2024-12-20

- 🎉 **初期Caretリリース**: 最小変更戦略でClineからフォーク
- feat: `caret-src/`ディレクトリのCaret専用拡張アーキテクチャ
- feat: デュアルモードシステム（Caretモード/Clineモード）基盤
- feat: JSONベーステンプレートを使用した強化されたシステムプロンプトアーキテクチャ
- feat: `caret-docs/`の包括的なドキュメントシステム
- feat: 多言語サポートインフラストラクチャ
- feat: TDDベース開発手法の実装

### 🏗️ アーキテクチャ基盤
- Cline互換性のための最小変更アプローチ
- Level 1-3変更フレームワーク
- gRPCベースのフロントエンド-バックエンド通信
- 安全なClineファイル変更のためのバックアップシステム

### 🧪 開発インフラストラクチャ
- Vitestテスティングフレームワーク設定
- 包括的なCI/CDパイプライン
- ドキュメント駆動開発アプローチ
- コミュニティ貢献ガイドライン

---

**注記**: Caretは強力な拡張を追加しながらClineと100%の互換性を維持しています。ユーザーはCaretとClineモードを自由に切り替えることができます。