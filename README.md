# Mottainai - JANバーコード在庫管理アプリ

React Native + tRPC + Turborepo を使用したモダンな在庫管理アプリケーション

## 技術スタック

- **モノレポ**: Turborepo + pnpm workspaces
- **リンター/フォーマッター**: Biome.js
- **バックエンド**: Hono + tRPC + Drizzle ORM + SQLite
- **フロントエンド**: React Native + Expo + React Query
- **言語**: TypeScript
- **テスト**: Vitest (バックエンド) + Maestro (モバイル)

## プロジェクト構造

```
mottainai/
├── apps/
│   ├── api/              # Honoバックエンド + tRPC
│   │   ├── src/
│   │   │   ├── db/       # Drizzle ORM スキーマ
│   │   │   ├── trpc/     # tRPC ルーター
│   │   │   └── index.ts  # Honoサーバー
│   │   └── tests/        # E2Eテスト
│   └── mobile/           # React Nativeアプリ
│       ├── app/          # Expo Router画面
│       ├── src/utils/    # tRPCクライアント
│       └── .maestro/     # Maestro E2Eテスト
└── packages/
    └── shared/           # 共有型定義
```

## セットアップ

### 前提条件

- Node.js 20以上
- pnpm 9以上

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### バックエンドAPI

```bash
# データベースのセットアップ
cd apps/api
pnpm drizzle-kit push

# 開発サーバーの起動
pnpm dev
```

APIは http://localhost:3000 で起動します。

### モバイルアプリ

```bash
cd apps/mobile

# Expoの起動
pnpm start

# iOS
pnpm ios

# Android
pnpm android
```

## 主な機能

1. **JANバーコードスキャン**: カメラでバーコードを読み取り、商品を検索・登録
2. **在庫一覧**: 登録済み商品の一覧表示
3. **商品詳細**: 在庫数の増減、商品情報の表示
4. **商品追加**: 新規商品の登録（JANコード必須）
5. **CRUD操作**: tRPC経由での型安全なAPI通信

## テスト

### バックエンドE2Eテスト (Vitest)

```bash
cd apps/api

# すべてのテストを実行
pnpm test:e2e

# ウォッチモードでテストを実行
pnpm test:watch
```

テスト内容:
- 在庫アイテムのCRUD操作
- JANコードバリデーション
- 在庫数の増減
- カテゴリー管理

### モバイルE2Eテスト (Maestro)

Maestroのインストール:

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Homebrewを使う場合
brew tap mobile-dev-inc/tap
brew install maestro
```

テストの実行:

```bash
cd apps/mobile

# すべてのフローを実行
maestro test .maestro

# 特定のフローを実行
maestro test .maestro/item-management.yaml
```

テストフロー:
- `empty-state.yaml`: 空の状態の確認
- `barcode-scan.yaml`: バーコードスキャン画面のナビゲーション
- `item-management.yaml`: 商品の追加、編集、削除

## 開発コマンド

```bash
# すべてのアプリを起動
pnpm dev

# ビルド
pnpm build

# リント
pnpm lint

# フォーマット
pnpm format

# 型チェック
turbo typecheck
```

## データベーススキーマ

### inventory_items

- `id`: UUID（主キー）
- `jan_code`: JANコード（13桁、ユニーク）
- `name`: 商品名
- `description`: 説明（オプション）
- `quantity`: 在庫数
- `price`: 価格（セント単位で保存）
- `category_id`: カテゴリーID（外部キー）
- `image_url`: 画像URL（オプション）
- `created_at`: 作成日時
- `updated_at`: 更新日時

### categories

- `id`: UUID（主キー）
- `name`: カテゴリー名
- `description`: 説明（オプション）
- `created_at`: 作成日時
- `updated_at`: 更新日時

## API エンドポイント

すべてのAPIはtRPC経由で型安全にアクセスできます。

### Inventory

- `inventory.list`: 全アイテムの取得
- `inventory.getById`: IDでアイテムを取得
- `inventory.getByJanCode`: JANコードでアイテムを取得
- `inventory.create`: 新規アイテムの作成
- `inventory.update`: アイテムの更新
- `inventory.updateQuantity`: 在庫数の増減
- `inventory.delete`: アイテムの削除

### Category

- `category.list`: 全カテゴリーの取得
- `category.create`: 新規カテゴリーの作成
- `category.delete`: カテゴリーの削除

## ライセンス

MIT
