# Mac OS常駐モード v1 技術設計

## 1. 目的
- Web以外のアプリでも翻訳を呼び出せるようにする。
- MVPでは「コピー前提」で実装し、取得経路を単純化する。

## 2. スコープ
- 対象:
  - グローバルショートカットで翻訳実行
  - クリップボード文字列の翻訳
  - 翻訳結果のポップアップ表示
  - 単語/フレーズ保存
- 非対象:
  - アクセシビリティAPIでの直接選択取得
  - OCR
  - コピー不可コンテンツ対応

## 3. コンポーネント

### 3.1 Electron Main
- `globalShortcut` 登録
- クリップボード文字列取得
- 翻訳ジョブ起動
- オーバーレイWindow制御
- SQLiteアクセス（またはDBサービス呼び出し）

### 3.2 Renderer (Expo Web + Tamagui)
- 設定画面（プロバイダ選択・APIキー登録・ショートカット設定）
- 復習画面（単語一覧/詳細）
- 翻訳結果UI（英日並列）

### 3.3 Translation Core (shared)
- 文分割
- プロバイダ別翻訳クライアント
- JSONスキーマ検証（Zod）
- フォールバック処理

## 4. イベントフロー
1. ユーザが任意アプリで英文を選択し `Cmd+C`。
2. ユーザがグローバル翻訳ショートカット（例: `Cmd+Shift+T`）を押す。
3. Electron Mainがクリップボード文字列を取得。
4. Translation Coreが翻訳を実行し、英日1:1ペアを返す。
5. MainがオーバーレイWindowへ結果を送信。
6. Rendererが英日並列表示。
7. ユーザが語句を選択してメモ保存。

## 5. IPC設計（最小）
- `translation:runFromClipboard`
  - request: `{ source: "clipboard" }`
  - response: `{ ok: true, sentences: [{ en: string, ja: string }] } | { ok: false, error: string }`
- `vocab:save`
  - request: `{ term: string, translation: string[], content: string }`
  - response: `{ ok: true } | { ok: false, error: string }`
- `settings:update`
  - request: `{ provider, model, apiKeyRef, shortcut }`
  - response: `{ ok: true } | { ok: false, error: string }`

## 6. ショートカット仕様
- 初期値: `CommandOrControl+Shift+T`
- 競合時:
  - 登録失敗を通知
  - 設定画面で再割り当てを促す

## 7. エラーハンドリング
- クリップボードが空: 「テキストをコピーしてから実行してください」
- APIキー未設定: 設定画面へ誘導
- 翻訳失敗: リトライ後も失敗なら詳細エラー表示
- JSON不正: フォールバック翻訳へ切替

## 8. セキュリティ方針（MVP）
- APIキーは平文ファイル保存を避ける。
- 保存先はOSキーチェーン系ストアを優先（実装容易性次第でMVP内決定）。
- レンダラーにAPIキー生値を渡さない。

## 9. 受け入れ条件
- Web外アプリでコピーした英文をショートカットで翻訳できる。
- 英日並列表示が文単位で崩れない。
- 単語メモがJSON仕様どおり保存され、復習画面で参照できる。
- 同期機能が存在しないこと（MVP要件）。
