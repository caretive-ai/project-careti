# 変更履歴

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
        <img src="https://img.shields.io/badge/🇯🇵_日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
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

> **注**: Careti v0.4.7はCline v3.49.1の機能を統合し、コード編集の信頼性向上のためSmartEditEngineを導入しました。

### ✨ 新機能
- **CaretiプロバイダーにZAI GLM-4.7追加**: GeminiとClaude Codeに加え、Zhipu AIのGLM-4.7を新しいバックエンドオプションとして追加しました。
- **Web検索 (SerpAPI)**: SerpAPIによるWeb検索機能を統合し、設定でAPIキーを構成できます。
- **Commandsシステム**: Claude Code/OpenCodeスタイルのコマンドを`.agents/commands/`ディレクトリに実装しました。
- **SmartEditEngine**: コード編集の信頼性向上のため、9段階ファジーマッチング＋6段階フォールバックエンジンを追加しました。
- **バックグラウンド編集** (Cline v3.49.1): バックグラウンドファイル編集をサポートします。
- **変更説明** (Cline v3.49.1): コード変更説明のためのgenerate_explanationツールを追加しました。
- **GFMマークダウンサポート**: GitHub Flavored Markdownのテーブルと取り消し線レンダリングを追加しました。
- **TypewriterTextコンポーネント**: ストリーミングテキスト表示用のシマーアニメーションを追加しました。
- **ThinkingRowコンポーネント**: 推論/思考モード表示用の新しいUIを追加しました。
- **ToolGroupRenderer**: 低リスクツール操作のグループ化表示を追加しました。

### ✨ 改善
- **Claude Code連携**: AGENTS.md ↔ CLAUDE.md同期フックでCaret + Claude Codeワークフローをシームレスにサポート。
- **Caret → Caretiリブランド**: コードベースと全ロケールファイルでブランドマイグレーションを完了しました。
- **リトライロジック**: 改善されたバックオフ処理でAPIリトライロジックを強化しました。
- **Upstageプロバイダー**: Upstageプロバイダー構成を改善しました。
- **トークン効率的エラー**: WriteToFileToolHandlerのエラーコンテキストを最適化しました。
- **hwpjs依存関係**: プラットフォーム固有のパッケージをoptionalDependenciesに移動しました。
- **Ollama思考モード**: Ollamaプロバイダーの思考モード表示を修正しました。

### 修正
- **Caretiプラン/実行モード**: Caretiプロバイダーでプラン/実行モードチェックボックスを非表示（単一モデルモードのみ）。
- **preserveFocusオプション**: ファイル開く際のpreserveFocus設定を遵守するよう修正しました。
- **インポートパス**: Caret → Caretiインポートパスマイグレーションを完了しました。
- **Web検索設定**: 設定キャッシュでのSerpAPIキー処理を修正しました。
- **ビルドエラー**: Cline v3.49.1機能統合のビルド問題を解決しました。
- **スキル翻訳**: t()関数呼び出しとskillLoaded翻訳を修正しました。

---

## [0.4.6] 2026-01-19

### ✨ 改善
- **動的ブランディング**: タスクハンドラーでハードコード"Cline"を動的ブランド名(`getCurrentBrandName()`)に置換しました。
- **無料クレジットプロモーション**: ログイン必須UIにサインアップ時無料クレジットプロモーションメッセージを追加しました（7言語対応）。
- **READMEドキュメントリンク**: 多言語READMEの言語バッジにドキュメントリンクを追加してナビゲーションを容易にしました。

---

## [0.4.5] 2026-01-18

> **注**: Careti v0.4.5はCline v3.49.0+からSkillsシステム、Hooks i18nなどをチェリーピックしています。

### ✨ 新機能
- **Z.AI GLM-4.7 完全サポート**: Thinking Modeと自然な会話スタイルをサポートします。
- **[Upstage](https://upstage.ai/) プロバイダー**: Upstage Solarモデルをサポートする新しいプロバイダーを追加しました。
- **テキストモデル用画像ツール**: テキスト専用モデルでもCaretiアカウントのツールを使用して画像生成・分析が可能になりました。
- **Skillsシステム** (Cline v3.49.0+ チェリーピック): プロジェクト別のスキルを定義してAIが活用できるSkillsシステムを追加しました。`.agents/skills/`または`.users/skills/`ディレクトリでスキルを管理できます。
- **Hooksシステム** (Cline v3.49.0+ チェリーピック): ツール実行の前後にカスタムスクリプトを実行できるHooksシステムを追加しました。`.agents/hooks/`または`.users/hooks/`ディレクトリでフックを管理できます。
- **デュアルディレクトリアーキテクチャ & /init**: トークン最適化AIコンテキスト(`.agents/`)とユーザー言語ドキュメント(`.users/`)を1:1ミラーリングポリシーで管理します。`/init`コマンドでプロジェクトを分析してコンテキストファイルを自動生成します。AGENTS.mdとCLAUDE.mdが標準エントリーポイントとして連動します。
- **HWPドキュメントサポート**: クロスプラットフォームHWPパースをサポートします。Windows、macOS、Linuxすべてで韓国語(.hwp)ドキュメントを読めます。
- **read_documentツール**: HWP、PDF、DOCX、PPTXなど様々なドキュメント形式を読み込む統合ドキュメント読み取りツールを追加しました。PPTレガシーフォーマット検出もサポートします。
- **analyze_imageツール**: CaretiアカウントのGeminiと連携した画像分析ツールを新しく追加しました。最大7500px制限適用、分析結果レポートガイドライン含む。
- **generate_imageツール改善**: XML `<image>`タグパースサポート、ファイルパス（相対/絶対）サポート明示、aspect_ratio/image_size省略ガイドライン追加。
- **画像送信トグル**: @メンションで画像ファイル送信の有無を設定できるトグル機能を追加しました。

### ✨ 改善
- **言語拡張**: フランス語、ドイツ語、ロシア語の翻訳を追加しました。独自のAIモデルを持つ国(Mistral, Aleph Alpha, Yandex など)を優先します。
- **プロバイダー国旗**: プロバイダーに国旗を表示します (Sovereign Cloud 観点)。
- **グローバルコンテキストパス変更**: グローバルエージェント設定パスが`~/Documents/.agents/`に変更されました。
- **多言語サポート**: HooksおよびSkills機能の韓国語、日本語、中国語翻訳を追加しました。
- **YAMLフロントマターパース**: Skills/Hooksで共有されるYAMLパースユーティリティを追加しました。
- **デフォルトプロバイダー**: 新規ユーザーのデフォルトプロバイダーがCaretiに設定されます。
- **Feature Config UIゲーティング**: アカウント/モード/ディクテーションUIをfeature configで制御できます。
- **VSIXサイズ最適化**: iOS/Androidバイナリを除外して拡張機能のサイズを削減しました。
- **画像設定UI**: すべてのプロバイダーで画像比率/解像度設定UIが表示されます。

### 修正
- **sharp起動失敗**: 画像処理ライブラリの起動失敗問題を修正しました。
- **画像参照処理**: 画像参照ハンドリングと最適化関連の問題を修正しました。
- **重複メッセージ表示**: 「Careti画像生成をリクエスト」メッセージが2回表示される問題を修正しました。

## [0.4.4] 2025-12-30

### ✨ 改善
- **Caretiアカウント Nano Banana統合**: CaretiアカウントにGemini 3 Flash Previewを追加し、Nano Banana画像生成機能を統合して生成物をプロジェクトのアセットとして利用できます。
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)**: Naver Cloudの新規プロバイダーとHCX-007/HCX-005/HCX-DASH-002モデルを追加しました。
- **AAIF国際標準Agents.md対応とプロジェクト初期設定支援**: 従来のCareti/Cline専用ルールをAAIF国際標準に合わせて改訂し、プロジェクト初期設定を支援する機能を追加しました。
- **ビルド/配布**: ビルドスクリプトの安定化とアセット同期順の修正によりビルド安定性を改善しました。
- **レートリミット再試行**: 5/10/20/40/60秒バックオフに合わせた自動再試行とカウントダウン表示を強化しました。
- **ドキュメント/モデルリスト**: プロバイダー設定ドキュメントと対応モデル一覧を最新化しました。
- **アップストリーム反映**: Cline v3.45.0のバグ修正をチェリーピックしました。
- **Cline v3.45.0 バグ修正**: Cline v3.45.0に反映されたバグ修正コードを統合しました。
- **テレメトリー**: エラー/品質トラッキング用のテレメトリーを適用しました。

### 修正
- **履歴画像表示**: 絶対パス画像が表示されない問題を解決しました。
- **入力漏れ**: 応答完了後にプロンプト入力が抜ける問題を緩和しました。
- **Careti Provider**: Gemini3関連の動作不具合を修正しました。
- **プロフィール画像**: ログイン後に画像が表示されない問題を修正しました。
- **Askレース**: askレースの競合問題を解決しました。
- **[Naver Cloud](https://clova.ai/)応答処理**: `status.code`エラーと空レスポンスを即時検知し、429マッピングを含めて安定性を高めました。
- **ストリーミング安定性**: 空のストリームチャンク防御とストリーミング失敗ログを強化しました。

## [0.4.1] 2025-12-10

### ✨ 改善
- **Careti Provider**: `careti.ai`サービスの公式ローンチに合わせ、`anyLLM`ベースのCareti Providerを安定化しました。APIの強化と信頼性の向上が含まれます。

### 修正
- **ペルソナシステム**: デフォルトのアバターが正しくシードされるようにペルソナの初期化ロジックを強化しました。ペルソナ画像の読み込み時の例外処理を改善しました。
- **ブランディング**: `.clineignore`機能のブランディングを`.caretignore`に合わせて修正しました。
- **ビルド**: 様々なビルドおよびリソースの場所に関する問題を解決しました。
- **認証**: 認証プロセスに関する軽微な修正とチェックを行いました。

## [0.4.0] 2025-11-28

> **注**: Careti v0.4.0はCline v3.38.2に基づいています。アップストリームのリリースノートは`CHANGELOG-CLINE.md`にあります。

### 🎉 Cline v3.38.2 アップストリームマージ
- マージコミット: `8723b386f` (ブランチ: `main_backup_20251128202033`)。

### 追加機能
- **Cline v3.38.2 統合**: 最新モデルサポート(Claude Opus 4.5)を含むすべてのアップストリーム機能。
- **デュアルアカウントシステム**: Caretiモード(拡張)とClineモード(ストック)の切り替え。
- **プロバイダー設定**: リアルタイムのヘルスチェック機能を備えたLiteLLM/BizRouter用モデルの自動フェッチ。
- **JSONプロンプトシステム**: JSONによる動的なシステムプロンプト構成。
- **入力履歴**: ターミナルのような永続性のある履歴ナビゲーション。
- **ショートカット**: タスクのキャンセル(Esc)と再開(Ctrl+Shift+R)。

### 修正された問題
- Linuxでシェル統合時にターミナルがハングする問題。
- UIとCLI全体でブランディングを復元。
