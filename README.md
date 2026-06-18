# I am not a robot — 境界入国管理局

人間界とAI世界の境界にある入国審査場を舞台にした、カメラ・マイク体験型のAI審査ミニゲーム。
表情・声・愚痴・不完全さをさらけ出し、AI審査官に「あなたは人間です」と認めさせろ。

## 特長

- **ゼロ・インフラ依存**: `OPENAI_API_KEY` も Supabase も無しで、`npm run dev` だけで1プレイ完結（Mock Mode）。
- **AIあり/なし自動切替**: APIキーがあればGPTが審査タスク・コメント・最終判定を生成。失敗時もMockへフォールバック。
- **カメラ/マイク任意**: 許可すれば顔撮影・音声認識。拒否してもテキスト入力で進行。
- **顔写真入りパスポートカード**: 結果をPNGでダウンロード可能（写真・録音はDB保存しない）。

## 起動

```bash
npm install
npm run dev      # http://localhost:3000
```

本番ビルド:

```bash
npm run build && npm run start
```

## 環境変数（すべて任意）

`.env.local` を作成（未設定でもMock Modeで動作）:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- `OPENAI_API_KEY` … 設定するとAI審査官が実稼働（`gpt-4o-mini`）。サーバー側のみで使用。
- `NEXT_PUBLIC_SUPABASE_*` … 設定すると匿名スコアを保存。未設定ならLocalStorageのみ。

## 画像生成

`gen-all.mjs` が `gpt-image-2` で背景・審査官・パスポート枠などを `public/images/` に生成（既存はスキップ）:

```bash
node gen-all.mjs
```

## デプロイ

GitHub に push → Vercel で Import（Next.js 自動検出）。環境変数を設定する場合は Vercel の
Environment Variables に登録し **Redeploy**。Supabase を使う場合は `supabase.sql` を実行。
