# Visual Regression Testing (VRT)

このプロジェクトでは、Maestro + Pixelmatchを使用してビジュアルリグレッションテストを実装しています。

## 概要

ビジュアルリグレッションテストは、UIの見た目の変更を自動的に検出するテストです。各画面のスクリーンショットを撮影し、ベースライン画像と比較して差分を検出します。

## セットアップ

### 必要な依存関係

```bash
pnpm install
```

依存関係:
- `pixelmatch`: 画像比較ライブラリ
- `pngjs`: PNG画像の読み書き
- `tsx`: TypeScriptスクリプトの実行

### Maestroのインストール

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# または Homebrew
brew tap mobile-dev-inc/tap
brew install maestro
```

## 使い方

### 1. 初回: ベースライン画像の作成

まず、アプリを起動してからベースライン画像を作成します:

```bash
# 別ターミナルでアプリを起動
pnpm start

# Maestroでスクリーンショットを撮影
maestro test .maestro/visual-regression.yaml

# ベースライン画像として保存
pnpm test:vrt:update
```

これにより、`.maestro/screenshots/baseline/` にベースライン画像が保存されます。

### 2. ビジュアルリグレッションテストの実行

コードを変更した後、ビジュアルリグレッションテストを実行します:

```bash
# アプリを起動
pnpm start

# 新しいスクリーンショットを撮影
maestro test .maestro/visual-regression.yaml

# ベースラインと比較
pnpm test:vrt:compare
```

### 3. テスト結果の確認

テストが失敗した場合、差分画像が `.maestro/screenshots/diff/` に保存されます。

差分画像を確認して:
- **意図した変更の場合**: `pnpm test:vrt:update` でベースラインを更新
- **意図しない変更の場合**: コードを修正してテストを再実行

## テストフロー

### visual-regression.yaml

メインのビジュアルリグレッションテストフロー。以下の画面をテストします:

1. 在庫一覧（空の状態）
2. 商品追加フォーム（空）
3. 商品追加フォーム（入力済み）
4. 成功ダイアログ
5. 在庫一覧（商品あり）
6. 商品詳細
7. 在庫追加後の商品詳細
8. 在庫削減後の商品詳細
9. 削除確認ダイアログ
10. 削除後の在庫一覧

### visual-barcode-scan.yaml

バーコードスキャナー画面のビジュアルテスト:

1. ホーム画面
2. カメラ権限ダイアログ（表示される場合）
3. スキャナー画面
4. ホーム画面に戻る

## CI/CDでの使用

GitHub ActionsなどのCI/CDで使用する場合:

```yaml
- name: Run Visual Regression Tests
  run: |
    cd apps/mobile
    maestro test .maestro/visual-regression.yaml
    pnpm test:vrt:compare
```

## 設定

### 差分の許容範囲

`scripts/compare-screenshots.ts` の `THRESHOLD` 定数で調整できます:

```typescript
const THRESHOLD = 0.1; // 10% の差分まで許容
```

### Pixelmatchオプション

画像比較の感度は `pixelmatch` の `threshold` オプションで調整できます:

```typescript
const pixelDiff = pixelmatch(
  baseline.data,
  current.data,
  diff.data,
  width,
  height,
  { threshold: 0.1 }, // 0.0（厳密）～ 1.0（緩い）
);
```

## ディレクトリ構造

```
apps/mobile/
├── .maestro/
│   ├── screenshots/
│   │   ├── baseline/        # ベースライン画像（Gitにコミット）
│   │   ├── diff/            # 差分画像（Gitで無視）
│   │   └── *.png            # 最新のスクリーンショット（Gitで無視）
│   ├── visual-regression.yaml
│   └── visual-barcode-scan.yaml
└── scripts/
    ├── compare-screenshots.ts
    └── update-baselines.ts
```

## トラブルシューティング

### 「Baseline directory not found」エラー

```bash
pnpm test:vrt:update
```

を実行してベースライン画像を作成してください。

### 画像サイズの不一致エラー

デバイスやシミュレーターのサイズが異なる可能性があります。同じデバイス/シミュレーターで実行してください。

### すべてのテストが失敗する

1. アプリが正しく起動しているか確認
2. Maestroがスクリーンショットを正しく撮影できているか確認
3. ベースライン画像が存在するか確認

## ベストプラクティス

1. **定期的にベースラインを更新**: デザイン変更が承認されたら、必ずベースラインを更新してコミット
2. **CI/CDで自動実行**: プルリクエストごとに自動実行して、意図しない変更を早期に検出
3. **差分画像を確認**: テスト失敗時は必ず差分画像を確認して、変更の影響を理解
4. **小さな変更を積み重ねる**: 大きなUI変更は小さく分割して、テストの失敗を最小限に

## 利点

- UIの意図しない変更を自動検出
- デザインの一貫性を保証
- リグレッション（後退バグ）の防止
- レビュー時の視覚的な差分確認

## 制限事項

- アニメーションや動的コンテンツの検証には向いていない
- デバイス/シミュレーターのサイズに依存
- 実機デバイスでは環境差によりノイズが発生しやすい
