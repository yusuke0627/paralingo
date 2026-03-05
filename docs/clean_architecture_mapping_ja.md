# Clean Architecture マッピング（Next.js参照）

## 1. 参照元
- 参照プロジェクト: `/Users/arakaki/dev/rss_reader`
- 参照した構成:
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
  - `src/interface`
- 採用する依存方向:
  - `interface / infrastructure -> application -> domain`

## 2. readable 向けレイヤ定義

### 2.1 domain
- 役割:
  - 翻訳結果、語彙メモ、学習履歴のエンティティとルール
- 例:
  - `TranslationPair`（en/ja）
  - `VocabMemo`（term, translation[], content[]）
  - 文分割ルール（純粋関数）
- 禁止:
  - Electron API、Chrome API、SQLite実装、React依存

### 2.2 application
- 役割:
  - ユースケース実行（翻訳、保存、取得）
  - 依存は `ports` のみ
- 主要use-case例:
  - `RunTranslationFromSelection`
  - `RunTranslationFromClipboard`
  - `SaveVocabMemo`
  - `ListVocabMemos`
  - `GetVocabMemoDetail`
- ports例:
  - `TranslatorGateway`
  - `VocabRepository`
  - `SettingsRepository`
  - `ClipboardPort`
  - `ShortcutPort`

### 2.3 infrastructure
- 役割:
  - ports の具体実装
- 実装例:
  - `sqlite-vocab-repository`
  - `openai-translator-gateway`
  - `gemini-translator-gateway`
  - `electron-clipboard-port`
  - `electron-shortcut-port`
  - `keychain-settings-repository`（またはMVP代替）

### 2.4 interface
- 役割:
  - 入出力境界
  - UIイベントをユースケースへ渡し、結果を表示
- 実装例:
  - `interface/electron-main`（IPC, globalShortcut）
  - `interface/extension`（選択テキスト取得）
  - `interface/ui`（Expo Web + Tamagui）

## 3. 推奨ディレクトリ（初期）
```txt
src/
  domain/
    entities/
    services/
    value-objects/
  application/
    ports/
    use-cases/
  infrastructure/
    ai/
    db/
    os/
  interface/
    electron-main/
    extension/
    ui/
```

## 4. 実装時ルール
- UIから直接SQLiteを叩かない（必ずuse-case経由）。
- Extensionから直接AI APIを叩かない（Mainまたはgateway経由）。
- `Zod` は interface/infrastructure 境界の検証で使う。
- テスト優先:
  - use-case単体テスト
  - gateway/repositoryの結合テスト

## 5. OS常駐モードv1への適用
- 入力:
  - `interface/electron-main` がグローバルショートカットを受ける
  - `ClipboardPort` で選択済み文字列を取得
- 処理:
  - `RunTranslationFromClipboard` use-case
- 出力:
  - UIへ英日ペアを返却
  - 必要時 `SaveVocabMemo` を呼ぶ
