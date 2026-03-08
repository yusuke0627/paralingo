# ParaLingo コードリーディング入門

対象:
- React Native Web 初学者
- Tamagui 初学者
- Electron 初学者

目的:
- 「このプロジェクトがどこで何をしているか」を1日で掴む
- 機能開発せずに、安心して読み進める

---

## 1. このアプリの技術の役割

- Electron: デスクトップアプリの外側（ウィンドウ、グローバルショートカット、IPC）
- React Native Web: UIをReactコンポーネントで構築（Webとして描画）
- Tamagui: React Native風コンポーネント + デザイントークンでUIを組む

実態:
- 「Electronの中でWeb UI（React Native Web + Tamagui）を動かす」構成

---

## 2. 最初に読むべき実行フロー（全体像）

1. `Command+Shift+T` を押す
2. Electron Main がショートカットを受ける
3. Clipboardの英文をUseCaseで翻訳
4. 翻訳結果をIPCイベントでUIへ渡す
5. Reading / Practice / Review 画面が表示更新

対応ファイル:
- Main起動: `src/main.ts`
- IPCとショートカット: `src/interface/electron-main/index.ts`
- Preload(安全な橋渡し): `src/interface/electron-main/preload.ts`
- UseCase: `src/application/use-cases/RunTranslationFromClipboard.ts`
- 翻訳ゲートウェイ: `src/infrastructure/ai/*TranslatorGateway.ts`
- UIエントリ: `src/interface/ui/index.tsx`
- Reading画面: `src/interface/ui/TranslationOverlay.tsx`
- Practice画面: `src/interface/ui/PracticeScreen.tsx`
- Review画面: `src/interface/ui/ReviewScreen.tsx`

---

## 3. レイヤーごとの責務（Clean Architecture寄り）

- `domain/`: 型・ルール（エンティティ、分割ロジック）
- `application/`: ユースケース（何をするか）
- `infrastructure/`: 外部接続（Gemini/OpenAI/SQLite/OS）
- `interface/`: Electron IPC と UI（見せ方・入力）

読み方のコツ:
- 「どこで判定するべきか」を意識
- 例: 文分割は `domain/services/TranslationCore.ts` にある

---

## 4. 60-90分の読み順（今日用）

1. `src/main.ts`
2. `src/interface/electron-main/index.ts`
3. `src/interface/electron-main/preload.ts`
4. `src/application/use-cases/RunTranslationFromClipboard.ts`
5. `src/infrastructure/ai/MultiProviderTranslatorOrchestrator.ts`
6. `src/infrastructure/ai/GeminiTranslatorGateway.ts`
7. `src/domain/services/TranslationCore.ts`
8. `src/interface/ui/index.tsx`
9. `src/interface/ui/TranslationOverlay.tsx`
10. `src/interface/ui/PracticeScreen.tsx`
11. `src/interface/ui/ReviewScreen.tsx`

---

## 5. まず覚える最重要ポイント

### Electronの文脈分離
- Renderer(UI)からNode APIを直接触らない
- `preload.ts` 経由で `window.paralingo.*` だけを使う

### UI状態の保持
- タブ切替はアンマウントでなく `display` 切替
- 画面を戻っても状態が残る理由はここ

### 翻訳データの流れ
- 翻訳結果は `onTranslationResult` イベントで各画面に届く
- Reading/Practiceはこのイベントを購読して表示更新

---

## 6. よく詰まるポイント

- 「動くが値が出ない」:
  - IPC名のミスマッチ（`save-review-item` など）を確認
- 「ビルドは通るが画面型エラー」:
  - フロントはViteビルド時に厳密型チェックされない場合がある
- 「古い表示が残る」:
  - どのstateをリセットするか（loading時/close時）を確認

---

## 7. 便利コマンド

```bash
# 開発起動（frontend + electron）
npm run start

# テスト実行
npm test -- --run

# 本番ビルド確認
npm run build
```

---

## 8. コードリーディングの着眼点（メモ推奨）

- 入力: どこから来るか（ショートカット/クリップボード）
- 変換: どこで加工するか（文分割/翻訳/整形）
- 出力: どこへ渡すか（IPCイベント/UI state）
- 失敗時: どこでfallbackするか（Provider failover/Web fallback）

---

## 9. 次に読むと理解が深まる資料

- `docs/clean_architecture_mapping_ja.md`
- `docs/mvp_spec_ja.md`
- `docs/mac_os_resident_v1_design.md`

---

この資料のゴールは「改修する前に、迷わず追える状態になること」です。
