# 変更履歴

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
      <td align-center>
        <a href="../zh-cn/CHANGELOG.md">
          <img src="https://img.shields.io/badge/中文-dc2626?style=for-the-badge&labelColor=b91c1c" alt="中文"/>
        </a>
      </td>
    </tr>
  </table>
</div>

## [0.4.4] 2025-12-30

### ✨ 改善
- **Caretアカウント Nano Banana統合**: CaretアカウントでGeminiのNano Banana画像生成機能を統合し、生成物をプロジェクトのアセットとして利用できます。
- **Caret CLI**: CaretアカウントとLiteLLM BYOプロバイダーをサポートするCaret CLIを正式リリースしました。
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)**: Naver Cloudの新規プロバイダーとHCX-007/HCX-005/HCX-DASH-002モデルを追加しました。
- **AAIF国際標準Agents.md対応とプロジェクト初期設定支援**: 従来のCaret/Cline専用ルールをAAIF国際標準に合わせて改訂し、プロジェクト初期設定を支援する機能を追加しました。
- **ビルド/配布**: ビルドスクリプトの安定化とアセット同期順の修正によりビルド安定性を改善しました。
- **レートリミット再試行**: 5/10/20/40/60秒バックオフに合わせた自動再試行とカウントダウン表示を強化しました。
- **ドキュメント/モデルリスト**: プロバイダー設定ドキュメントと対応モデル一覧を最新化しました。
- **アップストリーム反映**: Cline v3.45.0のバグ修正をチェリーピックしました。
- **Cline v3.45.0 バグ修正**: Cline v3.45.0に反映されたバグ修正コードを統合しました。
- **テレメトリー**: エラー/品質トラッキング用のテレメトリーを適用しました。

### 修正
- **履歴画像表示**: 絶対パス画像が表示されない問題を解決しました。
- **入力漏れ**: 応答完了後にプロンプト入力が抜ける問題を緩和しました。
- **Caret Provider**: Gemini3関連の動作不具合を修正しました。
- **プロフィール画像**: ログイン後に画像が表示されない問題を修正しました。
- **Askレース**: askレースの競合問題を解決しました。
- **[Naver Cloud](https://clova.ai/)応答処理**: `status.code`エラーと空レスポンスを即時検知し、429マッピングを含めて安定性を高めました。
- **ストリーミング安定性**: 空のストリームチャンク防御とストリーミング失敗ログを強化しました。

## [0.4.1] 2025-12-10

### ✨ 改善
- **Caret Provider**: `caret.team`サービスの公式ローンチに合わせ、`anyLLM`ベースのCaret Providerを安定化しました。APIの強化と信頼性の向上が含まれます。

### 修正
- **ペルソナシステム**: デフォルトのアバターが正しくシードされるようにペルソナの初期化ロジックを強化しました。ペルソナ画像の読み込み時の例外処理を改善しました。
- **ブランディング**: `.clineignore`機能のブランディングを`.caretignore`に合わせて修正しました。
- **ビルド**: 様々なビルドおよびリソースの場所に関する問題を解決しました。
- **認証**: 認証プロセスに関する軽微な修正とチェックを行いました。

## [0.4.0] 2025-11-28

> **注**: Caret v0.4.0はCline v3.38.2に基づいています。アップストリームのリリースノートは`CHANGELOG-CLINE.md`にあります。

### 🎉 Cline v3.38.2 アップストリームマージ
- マージコミット: `8723b386f` (ブランチ: `main_backup_20251128202033`)。

### 追加機能
- **Cline v3.38.2 統合**: 最新モデルサポート(Claude Opus 4.5)を含むすべてのアップストリーム機能。
- **デュアルアカウントシステム**: Caretモード(拡張)とClineモード(ストック)の切り替え。
- **Caret CLI (ベータ)**: 強化された認証とLiteLLMをサポートする統合`caret` CLI。
- **プロバイダー設定**: リアルタイムのヘルスチェック機能を備えたLiteLLM/BizRouter用モデルの自動フェッチ。
- **JSONプロンプトシステム**: JSONによる動的なシステムプロンプト構成。
- **入力履歴**: ターミナルのような永続性のある履歴ナビゲーション。
- **ショートカット**: タスクのキャンセル(Esc)と再開(Ctrl+Shift+R)。

### 修正された問題
- Linuxでシェル統合時にターミナルがハングする問題。
- UIとCLI全体でブランディングを復元。
