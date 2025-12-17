# Maestro E2E Tests

## セットアップ

Maestroをインストール:

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Homebrewを使う場合
brew tap mobile-dev-inc/tap
brew install maestro
```

## テストの実行

```bash
# iOSシミュレーターでテストを実行
maestro test .maestro

# 特定のフローを実行
maestro test .maestro/item-management.yaml

# Androidエミュレーターで実行
maestro --platform android test .maestro
```

## 前提条件

- アプリがExpoで起動していること
- バックエンドAPIが起動していること (http://localhost:3000)
- テスト用のデータベースに初期データがあること
