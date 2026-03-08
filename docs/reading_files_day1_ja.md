# 明日読む: 具体的ファイル10選（ParaLingo）

目的:
- 実装より先に「流れ」を掴む
- どこで何が起きるかを説明できるようになる

読む順番（この順でOK）

1. `src/main.ts`
- 何を見るか: Electronウィンドウの初期化、表示設定、Tray連携
- チェック: `BrowserWindow` の `webPreferences` と `frame/alwaysOnTop`

2. `src/interface/electron-main/index.ts`
- 何を見るか: グローバルショートカット、IPCハンドラ、翻訳実行の入口
- チェック: `run-translation`, `save-review-item`, `list-review-items`

3. `src/interface/electron-main/preload.ts`
- 何を見るか: Rendererに公開している `window.paralingo` API
- チェック: Main側のIPC名と一致しているか

4. `src/application/use-cases/RunTranslationFromClipboard.ts`
- 何を見るか: クリップボード取得 -> trim -> 翻訳呼び出し
- チェック: 空入力時のエラー処理

5. `src/domain/services/TranslationCore.ts`
- 何を見るか: 文分割ルール（strict newline）とレスポンススキーマ
- チェック: 改行優先の分割挙動

6. `src/infrastructure/ai/MultiProviderTranslatorOrchestrator.ts`
- 何を見るか: gemini/openai の順序、failover、web fallback
- チェック: `auto` モード時の切替ロジック

7. `src/infrastructure/ai/GeminiTranslatorGateway.ts`
- 何を見るか: プロンプト設計、JSONパース、発音情報補完
- チェック: `ipa/katakana/pronunciationNotes` の生成と補完

8. `src/infrastructure/ai/OpenAITranslatorGateway.ts`
- 何を見るか: OpenAI版の同等ロジック
- チェック: Gemini実装との差分（API呼び出し部）

9. `src/interface/ui/index.tsx`
- 何を見るか: タブ構成（Reading/Practice/Review/Settings）と表示切替
- チェック: `display` 切替で状態保持している点

10. `src/interface/ui/TranslationOverlay.tsx`
- 何を見るか: Reading本体UI、翻訳結果反映、Review保存導線
- チェック: `onTranslationResult` のstate更新

---

## 余力があれば（+3）

- `src/interface/ui/PracticeScreen.tsx`
- `src/interface/ui/ReviewScreen.tsx`
- `src/infrastructure/db/SQLiteVocabRepository.ts`

---

## 明日のゴール（30秒で自己評価）

- 「ショートカット押下からUI表示まで」を口頭で説明できる
- 「どこで分割・翻訳・保存しているか」をファイル名で言える
- 「不具合時に最初に見るファイル」を3つ挙げられる
