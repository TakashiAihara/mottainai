# アプリの起動とスクリーンショット取得手順

## 1. バックエンドAPIの起動

```bash
# ターミナル1: バックエンドAPI
cd apps/api

# データベースのセットアップ（初回のみ）
pnpm drizzle-kit push

# APIサーバー起動
pnpm dev
```

APIが http://localhost:3000 で起動します。

## 2. モバイルアプリの起動

```bash
# ターミナル2: Expoアプリ
cd apps/mobile
pnpm start
```

起動後、以下のオプションが表示されます：

- `i` - iOSシミュレーターで開く（macOSのみ）
- `a` - Androidエミュレーターで開く
- `w` - ブラウザで開く（推奨：最も簡単）

### Web版で確認する場合（推奨）

```bash
# アプリ起動中に 'w' を押す
# または
pnpm web
```

ブラウザで http://localhost:8081 が開きます。

## 3. Visual Regression Testの実行

### 3-1. Maestroのインストール

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# または Homebrew
brew tap mobile-dev-inc/tap
brew install maestro
```

### 3-2. テストの実行とスクリーンショット取得

```bash
# ターミナル3: テスト実行
cd apps/mobile

# iOS
maestro test .maestro/visual-regression.yaml --platform ios

# Android
maestro test .maestro/visual-regression.yaml --platform android
```

スクリーンショットは `.maestro/screenshots/` に保存されます。

### 3-3. ベースライン画像の保存

```bash
pnpm test:vrt:update
```

ベースライン画像が `.maestro/screenshots/baseline/` に保存されます。

## 4. 画面構成の確認

保存されたスクリーンショット：

1. `01-inventory-list-empty.png` - 在庫一覧（空の状態）
2. `02-add-item-form.png` - 商品追加フォーム（空）
3. `03-add-item-filled.png` - 商品追加フォーム（入力済み）
4. `04-success-dialog.png` - 登録成功ダイアログ
5. `05-inventory-list-with-item.png` - 在庫一覧（商品あり）
6. `06-item-detail.png` - 商品詳細画面
7. `07-item-detail-after-add.png` - 在庫追加後
8. `08-item-detail-after-subtract.png` - 在庫削減後
9. `09-delete-confirmation.png` - 削除確認ダイアログ
10. `10-inventory-list-after-delete.png` - 削除後の在庫一覧

## トラブルシューティング

### アプリが起動しない

```bash
# 依存関係を再インストール
cd apps/mobile
rm -rf node_modules
pnpm install
```

### APIに接続できない

`apps/mobile/src/utils/trpc.ts` の接続先URLを確認：

```typescript
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc', // または実機のIPアドレス
    }),
  ],
});
```

実機デバイスでテストする場合は、`localhost` をPCのIPアドレスに変更してください。

### Maestroがアプリを見つけられない

```bash
# iOSの場合
maestro test .maestro/visual-regression.yaml --platform ios

# Androidの場合
maestro test .maestro/visual-regression.yaml --platform android
```

## Web版でのプレビュー（最も簡単）

Maestroの代わりに、ブラウザでアプリを確認：

```bash
cd apps/mobile
pnpm web
```

ブラウザの開発者ツール（F12）でモバイルビューに切り替えて、
各画面をブラウザのスクリーンショット機能で撮影できます。

## 次のステップ

スクリーンショットを取得したら：

1. `.maestro/screenshots/baseline/` の画像を確認
2. 必要に応じてコミット: `git add apps/mobile/.maestro/screenshots/baseline/`
3. Visual Regression Testを実行: `pnpm test:vrt:compare`
