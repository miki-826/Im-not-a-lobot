# I am not a robot — main.md

## 0. プロジェクト基本情報

| 項目 | 内容 |
|---|---|
| アプリ名 | I am not a robot |
| 英語名 | I am not a robot |
| ジャンル | AI審査・カメラ/マイク体験型ミニゲーム |
| 想定プレイ時間 | 2〜3分 |
| 開発目的 | 「人間とAIの境界」をテーマに、表情・声・不完全さ・生活感から“人間らしさ”をAI審査するハッカソン向けWebアプリを作る |
| GitHub Repository | 未定：`https://github.com/miki-826/Im-not-a-lobot.git` |
| デプロイ予定 | GitHub連携によるVercelデプロイ |
| 使用技術 | Next.js App Router / TypeScript / Tailwind CSS / OpenAI API / Supabase任意 / LocalStorage / MediaDevices API / Vercel |
| 最優先方針 | 3時間で動くMVP。APIキーなし・SupabaseなしでもMock Modeで1プレイ完結する |

---

## 1. 一言コンセプト

```text
ここは人間界とAI世界の境界にある入国審査場。
表情、声、愚痴、矛盾、不完全さをさらけ出し、
AI審査官に「あなたは人間です」と認めさせろ。
```

---

## 2. アプリ概要

`I am not a robot` は、人間界とAI世界の境界にある入国審査場を舞台にした、カメラとマイクを使うAI審査ゲームです。

プレイヤーは「AIの国で仕事を終え、人間界へ帰ろうとしている人間」という設定です。しかし近年、AIは人間の文章を書き、人間の声を真似し、人間の顔すら作れるようになったため、普通のCAPTCHAでは人間かAIかを判別できなくなりました。

そこで設立されたのが、人間らしさを審査する境界入国管理局です。

ユーザーは以下を行います。

- カメラを許可して顔を映す
- マイクを許可して、AIが出すお題に対して喋る
- 指定された手の動きやジェスチャーを行う
- 最近あった理不尽な出来事や仕事の愚痴などを、20秒以内で叫ぶ/語る
- AI審査官から「人間度」を判定される
- 最終的に入国許可または入国拒否の結果を見る
- 自分の顔写真入りのパスポート風結果カードを表示・ダウンロードする

AIは以下を担当します。

- 3段階認証のお題生成
- 入力されたテキスト/音声文字起こし/表情メモ/ローカル計測値をもとにした人間度評価
- ギャグ寄りの審査コメント生成
- 人間タイプ診断
- 入国許可/拒否のアフターストーリー生成

ハッカソン向きの理由：

- 45秒以内にカメラ・マイクを使ったコア体験へ到達できる
- AIの使いどころが明確
- 結果が笑えるため発表映えする
- カメラ/マイク/AI/ゲームUIを短時間で組み合わせられる
- API未設定でもMock Modeで最後まで遊べる

重要：

- `OPENAI_API_KEY` がなくてもMock Modeで動作する
- Supabaseは任意。未設定時はLocalStorageに保存する
- 写真・録音データはDBに保存しない
- OpenAI API失敗時も固定データと簡易判定で結果画面まで進める

---

## 3. コア体験

```text
タイトル画面
↓
境界入国管理局のストーリー表示
↓
カメラ・マイク使用の確認
↓
AI審査官が3つのお題を生成
↓
ユーザーが20秒以内に表情・声・ジェスチャーで人間らしさを証明
↓
AIまたはMock判定が人間度を分析
↓
検査中アニメーションで「疲労感」「怒り」「生活感」「矛盾」「不完全さ」を解析
↓
人間度・AI疑惑・人間タイプ診断を表示
↓
入国許可または拒否
↓
顔写真入りパスポート風カードを表示・ダウンロード
```

---

## 4. MVP必須機能

| 優先度 | 機能 | 内容 |
|---|---|---|
| Must | タイトル画面 | アプリ名、世界観、開始ボタンを表示 |
| Must | 遊び方画面 | カメラ/マイク利用、3段階認証、保存しない方針を説明 |
| Must | メイン体験画面 | AI審査官、お題、タイマー、カメラプレビュー、入力欄を表示 |
| Must | ユーザー入力 | テキスト入力、カメラ撮影、マイク許可、任意で音声認識 |
| Must | 3段階認証 | 20秒×3問のタスクを順番に実施 |
| Must | AI応答または判定 | OpenAI API接続時はAI判定、未接続時はMock判定 |
| Must | 結果画面 | 人間度、ランク、入国可否、AIコメント、人間タイプ診断を表示 |
| Must | Mock Mode | APIキーなし、APIエラー、JSON parse失敗時でも1プレイ完結 |
| Must | LocalStorage保存 | 過去結果を端末内に保存。写真/録音は保存しない |
| Must | レスポンシブ対応 | PC/スマホで崩れないUI |
| Should | パスポート風カード | 撮影した顔写真を使い、入国スタンプ風のカードを表示 |
| Should | ダウンロード | 結果カードを画像としてダウンロード |
| Could | 共有ランキング | Supabase接続時のみ匿名スコアランキングを保存 |
| Could | BGM/SE | 素材があれば使用。なければ無音 |

---

## 5. 後回しにする機能

MVPでは以下を必須にしない。

```text
ログイン
本格的なユーザー認証
全ユーザー共有ランキングの作り込み
録音ファイル保存
顔画像のDB保存
複雑な感情分析モデル
リアルタイム顔認識
SNS共有
課金
管理画面
詳細なユーザー設定
多言語対応
Discord連携
```

補足：

- 共有ランキングは発表映えするが、3時間MVPではLocalStorage履歴を優先する
- Supabaseが設定されている場合のみ匿名ランキングを保存する
- カメラ画像はパスポートカード表示用にブラウザ内で一時利用し、DBには保存しない

---

## 6. 画面一覧

実装速度を優先し、基本は `/` の1ページ内で `phase` による状態切り替えを行うSPA風構成とする。

| 画面名 | パス例 | 内容 |
|---|---|---|
| タイトル | `/` | アプリ名、サブコピー、開始ボタン、Mock Mode表示 |
| 遊び方 | `/` | ストーリー、ルール、カメラ/マイク注意事項 |
| 権限確認 | `/` | カメラ/マイク許可、許可しない場合のMock進行案内 |
| 審査画面 | `/` | AI審査官、カメラプレビュー、お題、タイマー、入力欄 |
| 検査中画面 | `/` | 解析中アニメーション、検出ログ風テキスト |
| 結果画面 | `/` | 人間度、入国判定、人間タイプ、解説、パスポートカード |
| 履歴画面 | `/` またはモーダル | LocalStorageの過去結果を表示 |
| ランキング画面 | `/` またはモーダル | Supabase接続時のみ匿名ランキング表示。未接続時はローカル履歴 |

---

## 7. UIデザイン方針

| 項目 | 内容 |
|---|---|
| テーマ | 人間界とAI世界の境界にあるデジタル入国審査場 |
| キーワード | 境界、入国審査、AI審査官、ノイズ、監視カメラ、パスポート、スタンプ、人間らしさ |
| 見た目の方向性 | サイバーでデジタルな雰囲気。ただし「AIが作ったような汎用的デザイン」ではなく、電気ノイズや古い入管端末のような質感を出す |
| UI演出 | スキャンライン、ノイズ、検査ログ、スタンプ演出、警告ランプ、進捗バー |
| 読みやすさの注意点 | 暗背景でも文字コントラストを高くする。審査中ログは短く、重要結果は大きく表示 |
| ギャグ要素 | 審査官コメントは少し皮肉だが、ユーザー本人への悪口は禁止。状況や行動へのツッコミに留める |

---

## 8. カラーパレット

| 用途 | HEX | 説明 |
|---|---:|---|
| 背景 | `#05070D` | ほぼ黒のデジタル空間 |
| パネル背景 | `#0F172A` | 濃紺のカード背景 |
| メイン文字 | `#E5F2FF` | 明るい青白文字 |
| サブ文字 | `#94A3B8` | 説明文用のグレー |
| アクセント色 | `#38BDF8` | サイバー系シアン |
| 警告色 | `#F97316` | 入国警告・AI疑惑 |
| 成功色 | `#22C55E` | 入国許可 |
| 境界線 | `#1E3A5F` | パネル枠線 |
| ボタン背景 | `#2563EB` | メインボタン |
| ボタンHover | `#1D4ED8` | ボタンホバー |
| スタンプ赤 | `#EF4444` | パスポート拒否/注意スタンプ |
| スタンプ緑 | `#16A34A` | 入国許可スタンプ |

---

## 9. 主要UI文言

```text
タイトル:
I am not a robot

サブコピー:
人間界入国審査を開始します。
表情、声、愚痴、不完全さを提示してください。

開始ボタン:
入国審査を受ける

遊び方ボタン:
審査手順を確認

カメラ許可:
カメラを起動する

マイク許可:
マイクを起動する

権限スキップ:
カメラなしでMock審査を受ける

審査開始:
第1認証を開始

次のお題:
次の認証へ

判定ボタン:
入国判定へ進む

結果タイトル_許可:
入国許可

結果タイトル_拒否:
入国拒否

もう一度:
もう一度認証を受ける

履歴:
過去の審査記録

ダウンロード:
パスポートをダウンロード

Mock表示:
Mock Mode: API未接続でも審査可能
```

審査官コメント例：

```text
「前向きすぎますね。少しAI疑惑があります。」
「疲労感の粒度が高いです。人間らしさを検出しました。」
「怒りの中に生活感があります。かなり人間です。」
「完璧に説明しすぎています。人間ならもう少し脱線してください。」
「入国を許可します。なお休暇は保証されません。」
```

---

## 10. 遊び方テキスト

```text
ここは人間界とAI世界の境界にある入国審査場です。

あなたはAIの国で仕事を終え、人間界へ帰ろうとしています。
しかし、今の時代はAIも人間の顔・声・文章を真似できます。

そのため、この審査場では普通のCAPTCHAではなく、
「人間らしさ」を証明する3つの認証を行います。

1. 表情と手の動きの認証
2. 理不尽な出来事や仕事の愚痴を語る認証
3. ジェスチャーを加えて何かを表現する認証

各認証の制限時間は20秒です。
AI審査官が、疲労感・怒り・生活感・矛盾・感情のにじみ・不完全さを分析します。

カメラ画像と音声は、審査演出とその場の判定にのみ使います。
写真や録音データをデータベースに保存しません。
```

---

## 11. ゲーム画面レイアウト

### PC表示

```text
┌────────────────────────────────────────────────────────────┐
│ I am not a robot                              Mock Mode表示 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌──────────────────────┐  ┌─────────────────────────────┐ │
│ │                      │  │ AI審査官                    │ │
│ │  カメラプレビュー    │  │ ┌─────────────────────────┐ │ │
│ │  または              │  │ │ 今回のお題              │ │ │
│ │  プレースホルダ      │  │ │ 第2認証: 最近の理不尽  │ │ │
│ │                      │  │ └─────────────────────────┘ │ │
│ │ [撮影ボタン]         │  │ Timer: 00:20                │ │
│ └──────────────────────┘  │ Human Meter: █████░░░       │ │
│                            │ AI疑惑: +12                 │ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 入力欄: 喋った内容を入力/音声認識結果を表示           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [録音/認証開始] [次へ] [入国判定へ]                       │
└────────────────────────────────────────────────────────────┘
```

### スマホ表示

```text
┌──────────────────────────────┐
│ I am not a robot              │
│ Mock Mode                     │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ カメラプレビュー          │ │
│ │ またはプレースホルダ      │ │
│ └──────────────────────────┘ │
│                              │
│ AI審査官                     │
│ 「第1認証を開始します」       │
│                              │
│ ┌──────────────────────────┐ │
│ │ お題                      │ │
│ │ 指定された動きをしながら… │ │
│ └──────────────────────────┘ │
│                              │
│ Timer: 00:20                 │
│ Human Meter: █████░░░        │
│                              │
│ ┌──────────────────────────┐ │
│ │ 入力欄                    │ │
│ └──────────────────────────┘ │
│                              │
│ [開始] [次へ]                │
└──────────────────────────────┘
```

---

## 12. 結果画面レイアウト

結果画面に表示する項目：

```text
判定:
- 入国許可 / 入国拒否

スコア:
- 人間度 0〜100%
- AI疑惑 0〜100%

ランク:
- S / A / B / C / D

人間タイプ診断:
- 限界労働型人間
- 壊れかけの人間
- 元気すぎて怪しい人間
- 生活感過多型人間
- 説明が整いすぎたAI疑惑人間

解説:
- 人間っぽかった点
- AIっぽかった点
- 審査官コメント

3認証ごとの内訳:
- 第1認証スコア
- 第2認証スコア
- 第3認証スコア

アフターストーリー:
- 入国許可時: 人間界に戻った後の短いストーリー
- 入国拒否時: AI世界側に戻される短いストーリー

パスポートカード:
- 撮影した顔写真
- 名前欄: GUEST HUMAN
- 人間度
- スタンプ: APPROVED / REJECTED
- 日時

ボタン:
- パスポートをダウンロード
- もう一度認証を受ける
- 履歴を見る
```

---

## 13. 評価・スコア・ランク設計

### スコア項目

| 項目 | 内容 | 配点 |
|---|---|---:|
| 表情の変化 | カメラ許可、撮影、自己申告/AIコメントによる変化 | 20 |
| 声・入力の感情 | 愚痴、理不尽、感情語、生活感の有無 | 25 |
| 不完全さ | 脱線、矛盾、言い淀み、曖昧さ | 20 |
| 生活感 | 仕事、電車、上司、締切、家事、睡眠不足など | 20 |
| ジェスチャー性 | お題に対して動作や説明がある | 15 |
| 合計 | 人間度 | 100 |

### ランク

| 人間度 | ランク | 判定 | 称号 |
|---:|---|---|---|
| 90〜100 | S | 入国許可 | 国境を越えし純正人間 |
| 80〜89 | A | 入国許可 | 生活感の化身 |
| 70〜79 | B | 入国許可 | だいたい人間 |
| 55〜69 | C | 追加審査相当だがMVPでは拒否 | AI疑惑つき人間 |
| 0〜54 | D | 入国拒否 | 説明が整いすぎた存在 |

### 入国判定

```text
人間度が70%以上なら入国許可。
69%以下なら入国拒否。
```

### 人間タイプ診断例

```text
限界労働型人間:
疲労感・理不尽・生活感のスコアが高い

壊れかけの人間:
怒りと諦めの両方が検出された

元気すぎて怪しい人間:
ポジティブ語が多く、生活感が薄い

生活感過多型人間:
具体的な日常ワードが多い

説明が整いすぎたAI疑惑人間:
文章がきれいすぎて感情のノイズが少ない
```

---

## 14. Mock Mode要件

Mock Modeは最重要機能。環境変数や外部APIがなくても必ず1プレイ完結させる。

### Mock Modeに切り替える条件

```text
OPENAI_API_KEY がない
Supabase環境変数がない
APIエラー
OpenAI APIのタイムアウト
OpenAI APIのレスポンスが空
JSON parse失敗
Vercel本番で環境変数未設定
カメラ権限が拒否された
マイク権限が拒否された
ブラウザがMediaDevices APIに非対応
音声認識APIが使えない
```

### Mock Modeでやること

```text
固定の3認証お題を表示する
固定のAI審査官コメントを返す
ユーザー入力テキストから簡易判定する
カメラが使えない場合はプレースホルダ画像で進行する
マイクが使えない場合はテキスト入力で進行する
結果画面まで進める
パスポートカードを生成する
LocalStorageに結果を保存する
```

### Mock Mode表示

画面右上またはフッターに以下を表示。

```text
Mock Mode: API未接続でも審査可能
```

### Mock Modeで禁止すること

```text
APIキーがないことをエラーとしてゲーム停止しない
Supabase未接続で保存失敗エラーを出さない
カメラ/マイク拒否でゲームを終了しない
画像素材がなくてもレイアウトを壊さない
```

---

## 15. Mock正解データ

```json
{
  "id": "mock-border-check-001",
  "title": "境界入国管理局 第404審査室",
  "genre": "human_ai_border_inspection",
  "difficulty": "easy",
  "story": "ここは人間界とAI世界の境界にある入国審査場です。あなたはAIの国で仕事を終え、人間界へ帰ろうとしています。しかし、AIも人間の文章・声・顔を真似できる時代になったため、あなたは3つの認証で人間らしさを証明しなければなりません。",
  "examiner": {
    "name": "境界審査官 Unit-404",
    "personality": "事務的だが少し皮肉。ユーザー本人を傷つけず、状況に対してギャグ寄りにコメントする。",
    "opening_line": "入国審査を開始します。完璧すぎる回答は減点対象です。人間なら多少は乱れてください。"
  },
  "tasks": [
    {
      "id": "task-1",
      "title": "第1認証：不完全な同期運動",
      "timeLimitSec": 20,
      "instruction": "カメラに向かって片手を上げ、なぜか少し疲れた顔で『大丈夫です』と言ってください。完璧な笑顔は禁止です。",
      "targetSignals": ["表情のゆらぎ", "疲労感", "不完全さ"]
    },
    {
      "id": "task-2",
      "title": "第2認証：理不尽報告",
      "timeLimitSec": 20,
      "instruction": "最近あった理不尽な出来事、仕事の愚痴、納得できなかったことを20秒以内で叫ぶか語ってください。個人名や攻撃的表現は避けてください。",
      "targetSignals": ["怒り", "生活感", "感情のにじみ"]
    },
    {
      "id": "task-3",
      "title": "第3認証：ジェスチャー付き生活証明",
      "timeLimitSec": 20,
      "instruction": "『月曜日の朝に鳴るアラーム』を、声とジェスチャーで表現してください。説明が上手すぎるとAI疑惑が上がります。",
      "targetSignals": ["ジェスチャー", "矛盾", "生活感", "不完全さ"]
    }
  ],
  "mock_comments": {
    "task-1": "表情に微量の疲労を検出しました。『大丈夫』の信頼度は低いですが、人間らしさは高いです。",
    "task-2": "理不尽に対する語彙の荒れを検出しました。感情のノイズが良好です。",
    "task-3": "月曜日への拒否反応を確認しました。かなり人間です。"
  },
  "resultTemplates": {
    "approved": {
      "verdict": "APPROVED",
      "title": "入国許可",
      "afterStory": "ゲートが開き、あなたは人間界の空気を吸い込みました。審査官は最後に一言だけ告げます。『入国を許可します。なお休暇は保証されません。』"
    },
    "rejected": {
      "verdict": "REJECTED",
      "title": "入国拒否",
      "afterStory": "ゲートは赤く点滅し、あなたはAI世界側の待機ロビーへ戻されました。審査官は静かに言います。『説明が整いすぎています。もう少し生活に敗北してから再申請してください。』"
    }
  },
  "keywords": {
    "humanLike": ["疲れ", "眠い", "上司", "会議", "電車", "締切", "理不尽", "残業", "家賃", "月曜", "アラーム", "寝坊", "忙しい", "納得", "ムカつく", "つらい", "だるい", "なんで", "意味わからん"],
    "aiLike": ["最適化", "効率的", "問題ありません", "論理的", "結論として", "完全に", "体系的", "客観的", "仕様です", "正常です"]
  }
}
```

---

## 16. Mock判定ロジック

API未使用でも判定できる簡易ロジックを実装する。

### 入力

```text
各タスクのユーザーテキスト
カメラ許可の有無
撮影画像の有無
マイク許可の有無
音声認識結果の有無
タスク完了数
```

### 判定ルール

```text
基本点:
- 各タスク完了ごとに +15点
- 3タスク完了で最大 +45点

カメラ:
- カメラ許可あり +10点
- 撮影画像あり +5点
- カメラ拒否でも減点しすぎない。プレースホルダで進行可能

マイク/音声:
- マイク許可あり +5点
- 音声認識またはテキスト入力あり +10点

人間らしいキーワード:
- humanLikeキーワード1つにつき +3点
- 最大 +25点

AIっぽいキーワード:
- aiLikeキーワード1つにつき -4点
- 最大 -20点

不完全さ:
- 「えー」「まあ」「なんか」「いや」「でも」「たぶん」が含まれる +2点
- 最大 +10点

長さ:
- 合計20文字未満 -10点
- 合計50文字以上 +5点
- 合計120文字以上 +10点

最終:
- 0〜100にclampする
- 70以上で入国許可
```

### TypeScript例

```ts
function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function includesAny(text: string, words: string[]) {
  return words.filter((word) => text.includes(word)).length;
}

function judgeMock(input: {
  texts: string[];
  hasCamera: boolean;
  hasSnapshot: boolean;
  hasMic: boolean;
  completedTaskCount: number;
}) {
  const allText = input.texts.join(" ");
  let score = 0;

  score += input.completedTaskCount * 15;
  if (input.hasCamera) score += 10;
  if (input.hasSnapshot) score += 5;
  if (input.hasMic) score += 5;
  if (allText.length > 0) score += 10;

  const humanWords = ["疲れ", "眠い", "上司", "会議", "電車", "締切", "理不尽", "残業", "家賃", "月曜", "アラーム", "寝坊", "忙しい", "納得", "ムカつく", "つらい", "だるい", "なんで", "意味わからん"];
  const aiWords = ["最適化", "効率的", "問題ありません", "論理的", "結論として", "完全に", "体系的", "客観的", "仕様です", "正常です"];
  const imperfectWords = ["えー", "まあ", "なんか", "いや", "でも", "たぶん"];

  score += Math.min(25, includesAny(allText, humanWords) * 3);
  score -= Math.min(20, includesAny(allText, aiWords) * 4);
  score += Math.min(10, includesAny(allText, imperfectWords) * 2);

  if (allText.length < 20) score -= 10;
  if (allText.length >= 50) score += 5;
  if (allText.length >= 120) score += 10;

  score = clampScore(score);

  return {
    humanScore: score,
    aiSuspicion: 100 - score,
    approved: score >= 70
  };
}
```

---

## 17. OpenAI API使用箇所

| 使用箇所 | 内容 | API未接続時 |
|---|---|---|
| お題生成 | 3つの認証タスクを生成 | Mock固定タスクを使用 |
| 審査コメント生成 | 各タスク後にAI審査官コメントを生成 | Mockコメントを表示 |
| 最終判定 | ユーザー入力、撮影有無、音声認識テキストから人間度を評価 | Mock判定ロジック |
| 人間タイプ診断 | スコア傾向からタイプ名を生成 | 固定タイプから選択 |
| アフターストーリー生成 | 入国許可/拒否に応じた短い後日談を生成 | Mockテンプレート |
| 画像生成 | 背景・審査官画像の生成 | CSS背景・プレースホルダ |

---

## 18. API設計

Next.js App Router の Route Handler を使用する。

### POST `/api/game/start`

| 項目 | 内容 |
|---|---|
| Endpoint | `POST /api/game/start` |
| Request | `{ "mode": "normal" }` |
| Response | `{ "sessionId": "string", "tasks": Task[], "examiner": Examiner, "isMock": boolean }` |
| 注意点 | `OPENAI_API_KEY` がない場合はMockタスクを返す。正解情報や内部評価ロジックを不要に返さない |

### POST `/api/game/task-comment`

| 項目 | 内容 |
|---|---|
| Endpoint | `POST /api/game/task-comment` |
| Request | `{ "sessionId": "string", "taskId": "string", "userText": "string", "signals": { "hasCamera": true, "hasMic": true } }` |
| Response | `{ "comment": "string", "partialScore": 0, "isMock": boolean }` |
| 注意点 | 入力文字数を500文字以内に制限。API失敗時はMockコメント |

### POST `/api/game/answer`

| 項目 | 内容 |
|---|---|
| Endpoint | `POST /api/game/answer` |
| Request | `{ "sessionId": "string", "texts": ["string"], "hasCamera": true, "hasSnapshot": true, "hasMic": true, "completedTaskCount": 3 }` |
| Response | `{ "humanScore": 85, "aiSuspicion": 15, "rank": "A", "approved": true, "humanType": "生活感の化身", "comments": [], "afterStory": "string", "isMock": false }` |
| 注意点 | 写真/録音バイナリは送らないMVP設計。送る場合も保存しない。API失敗時はMock判定 |

### POST `/api/result/save`

| 項目 | 内容 |
|---|---|
| Endpoint | `POST /api/result/save` |
| Request | `{ "result": ResultSummary }` |
| Response | `{ "saved": true, "storage": "supabase" | "localOnly" }` |
| 注意点 | Supabase接続時のみ匿名結果を保存。写真・録音は保存しない。未接続ならフロントLocalStorage保存のみ |

---

## 19. OpenAI用プロンプト

### 生成用プロンプト

```text
あなたは「人間界とAI世界の境界にある入国審査場」のAI審査官です。
ユーザーが人間らしさを証明するための3つの認証タスクを生成してください。

条件:
- テーマは「人間とAIの境界」
- 各タスクは20秒以内で実行できる
- カメラとマイクを使う前提
- 表情、声、疲労感、怒り、生活感、矛盾、感情のにじみ、不完全さを引き出す
- ユーザー本人を傷つける表現は禁止
- ギャグ寄りだが安全な内容
- 個人情報や他人への誹謗中傷を求めない
- 3時間ハッカソンMVPで実装しやすい内容

出力は必ずJSONのみ。
Markdownは禁止。

JSON形式:
{
  "examiner": {
    "name": "string",
    "opening_line": "string"
  },
  "tasks": [
    {
      "id": "task-1",
      "title": "string",
      "timeLimitSec": 20,
      "instruction": "string",
      "targetSignals": ["string"]
    }
  ]
}
```

### 応答用プロンプト

```text
あなたは境界入国管理局のAI審査官です。
ユーザーが認証タスクに回答しました。
以下の情報をもとに、短い審査コメントと部分スコアを返してください。

方針:
- コメントは40〜80文字程度
- 事務的だが少し皮肉で面白い
- ユーザー本人への悪口は禁止
- 状況や回答内容へのツッコミに留める
- 人間らしさの観点: 疲労感、怒り、生活感、矛盾、感情のにじみ、不完全さ
- 完璧すぎる回答はAI疑惑として扱ってよい

入力:
taskTitle: {{taskTitle}}
instruction: {{instruction}}
userText: {{userText}}
hasCamera: {{hasCamera}}
hasMic: {{hasMic}}

出力は必ずJSONのみ。
Markdownは禁止。

JSON形式:
{
  "comment": "string",
  "partialScore": 0,
  "detectedSignals": ["string"],
  "aiSuspicionDelta": 0
}
```

### 判定用プロンプト

```text
あなたは「人間界とAI世界の境界にある入国審査場」の最終審査AIです。
ユーザーの3つの認証結果をもとに、人間度、AI疑惑、入国可否、人間タイプ診断を判定してください。

重要:
- ユーザー本人を侮辱しない
- ギャグ寄りだが安全な表現にする
- 個人情報を推測しない
- 医療・心理診断のような断定をしない
- 写真や録音は保存しない前提
- 人間度70%以上で入国許可
- 「不完全さ」「生活感」「感情のにじみ」を高く評価
- 文章が整いすぎている場合はAI疑惑を少し上げる

入力:
texts: {{texts}}
hasCamera: {{hasCamera}}
hasSnapshot: {{hasSnapshot}}
hasMic: {{hasMic}}
completedTaskCount: {{completedTaskCount}}

出力は必ずJSONのみ。
Markdownは禁止。

JSON形式:
{
  "humanScore": 0,
  "aiSuspicion": 0,
  "rank": "S|A|B|C|D",
  "approved": true,
  "humanType": "string",
  "goodPoints": ["string"],
  "aiLikePoints": ["string"],
  "examinerComment": "string",
  "afterStory": "string"
}
```

---

## 20. Supabase設計

Supabaseは必須ではない。未接続でもLocalStorageで動作する。

接続されている場合のみ、匿名の結果サマリーを保存する。写真・録音・詳細な発話全文は保存しない方針。

### テーブル定義

```sql
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  is_mock boolean default false,
  user_agent text,
  completed boolean default false
);

create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references game_sessions(id) on delete cascade,
  created_at timestamp with time zone default now(),
  human_score integer not null check (human_score >= 0 and human_score <= 100),
  ai_suspicion integer not null check (ai_suspicion >= 0 and ai_suspicion <= 100),
  rank text not null,
  approved boolean not null,
  human_type text not null,
  storage_note text default 'No photo/audio stored'
);

create table if not exists game_actions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references game_sessions(id) on delete cascade,
  created_at timestamp with time zone default now(),
  task_id text not null,
  partial_score integer,
  detected_signals jsonb default '[]'::jsonb
);
```

### 保存しないもの

```text
顔写真
録音ファイル
音声データ
詳細な全文ログ
個人名
メールアドレス
ログイン情報
```

### Supabase未接続時

```text
APIはエラーにせず { saved: false, storage: "localOnly" } を返す
フロント側でLocalStorageへ保存する
ランキング画面は「この端末の履歴」として表示する
```

---

## 21. LocalStorage設計

Supabaseなしでも進行できるようにLocalStorageへ保存する。

### Key

```text
iam_not_a_robot_sessions
iam_not_a_robot_latest_result
iam_not_a_robot_settings
```

### 保存データ例

```json
{
  "sessions": [
    {
      "id": "local-20260618-001",
      "createdAt": "2026-06-18T10:00:00.000Z",
      "humanScore": 84,
      "aiSuspicion": 16,
      "rank": "A",
      "approved": true,
      "humanType": "生活感の化身",
      "examinerComment": "疲労感の粒度が高いです。かなり人間です。",
      "afterStory": "ゲートが開き、あなたは人間界の空気を吸い込みました。",
      "taskSummaries": [
        {
          "taskId": "task-1",
          "title": "第1認証：不完全な同期運動",
          "partialScore": 24
        }
      ],
      "isMock": true
    }
  ],
  "latestResultId": "local-20260618-001"
}
```

### 注意

```text
顔写真のData URLは原則保存しない
パスポートカードは画面表示中のみ生成
どうしても保存する場合はユーザー操作によるダウンロードのみ
```

---

## 22. 状態管理

### TypeScript型定義例

```ts
export type GamePhase =
  | "title"
  | "howto"
  | "permission"
  | "loading"
  | "playing"
  | "analyzing"
  | "result"
  | "history";

export type Task = {
  id: string;
  title: string;
  timeLimitSec: number;
  instruction: string;
  targetSignals: string[];
};

export type Examiner = {
  name: string;
  openingLine: string;
};

export type TaskAnswer = {
  taskId: string;
  userText: string;
  startedAt?: string;
  endedAt?: string;
  partialScore?: number;
  comment?: string;
  detectedSignals?: string[];
};

export type GameResult = {
  sessionId: string;
  humanScore: number;
  aiSuspicion: number;
  rank: "S" | "A" | "B" | "C" | "D";
  approved: boolean;
  humanType: string;
  goodPoints: string[];
  aiLikePoints: string[];
  examinerComment: string;
  afterStory: string;
  isMock: boolean;
  createdAt: string;
};

export type PermissionState = {
  camera: "unknown" | "granted" | "denied";
  mic: "unknown" | "granted" | "denied";
  hasSnapshot: boolean;
};

export type GameState = {
  phase: GamePhase;
  sessionId: string | null;
  isMock: boolean;
  examiner: Examiner | null;
  tasks: Task[];
  currentTaskIndex: number;
  answers: TaskAnswer[];
  permission: PermissionState;
  snapshotDataUrl?: string;
  result?: GameResult;
  errorMessage?: string;
};
```

---

## 23. 画像生成指定

`gen-image.mjs` で生成する画像。画像生成に失敗してもCSS背景とプレースホルダで動作すること。

| 用途 | 保存先 | サイズ | 形式 | 優先度 | プロンプト |
|---|---|---:|---|---|---|
| タイトル背景 | `public/images/title-bg.png` | 1536x864 | png | 高 | `A dark digital border immigration checkpoint between human world and AI world, electric noise, scanning lines, cyber terminal, cinematic lighting, empty center area for UI text, web game background, no text, no logo` |
| ゲーム背景 | `public/images/game-bg.png` | 1536x864 | png | 高 | `Futuristic inspection room at the boundary of human world and AI world, camera monitor, holographic panels, subtle blue electric noise, dark cyber atmosphere, center readable area, web game background, no text, no logo` |
| 結果背景_許可 | `public/images/result-approved-bg.png` | 1536x864 | png | 中 | `Open gate from dark AI checkpoint to warm human city morning light, passport control booth, hopeful atmosphere, clean center space for result card, web game background, no text, no logo` |
| 結果背景_拒否 | `public/images/result-rejected-bg.png` | 1536x864 | png | 中 | `Closed digital border gate, red warning lights, dark AI waiting lobby, subtle glitch noise, dramatic but not horror, center space for result UI, web game background, no text, no logo` |
| AI審査官 | `public/images/examiner.png` | 1024x1024 | png | 高 | `Humanoid AI immigration officer, sleek digital face, official uniform, slightly suspicious but humorous expression, cyber border control style, transparent or simple dark background, web game character, no text, no logo` |
| パスポートカード装飾 | `public/images/passport-frame.png` | 1024x768 | png | 低 | `Futuristic passport card frame, cyber immigration stamp style, blank photo area, blank information area, official border document design, no readable text, no logo` |

### 画像フォールバック

```text
画像が存在しない場合:
- 背景はTailwindのgradientで代替
- AI審査官はCSSの丸いアバターで代替
- パスポートカードはborderとstamp風CSSで代替
```

---

## 24. BGM・音声素材

BGM・SEは任意。素材がなくても無音で成立させる。

### 推奨配置

```text
public/audio/bgm.mp3
public/audio/scan.mp3
public/audio/stamp.mp3
public/audio/approved.mp3
public/audio/rejected.mp3
```

### 使用方針

```text
bgm.mp3:
- タイトル〜審査中に小音量でループ
- 初回ユーザー操作後に再生

scan.mp3:
- 検査中画面で再生

stamp.mp3:
- 結果画面のスタンプ表示時に再生

approved.mp3:
- 入国許可時

rejected.mp3:
- 入国拒否時
```

### フォールバック

```text
音声ファイルがない場合は再生しない
再生失敗してもエラー表示しない
ブラウザの自動再生制限に従う
```

---

## 25. 動画素材

動画素材は任意。素材がない場合は結果カードのみ表示する。

### 推奨配置

```text
public/video/approved.mp4
public/video/rejected.mp4
public/video/scan-loop.mp4
```

### 使用方針

```text
approved.mp4:
- 入国ゲートが開く短い演出

rejected.mp4:
- 赤い警告ランプが点滅する短い演出

scan-loop.mp4:
- 検査中画面の背景ループ
```

### フォールバック

```text
動画がない場合:
- CSSアニメーションのスキャンライン
- 点滅するborder
- ログ文字の疑似進行
```

---

## 26. エラー処理

| エラー | 対応 |
|---|---|
| OpenAI APIキーなし | Mock Modeへ切り替え。固定タスク・Mock判定を使用 |
| OpenAI API失敗 | エラーを握りつぶしすぎずconsoleに記録。UIはMock応答で続行 |
| Supabase未接続 | LocalStorage保存に切り替え。「この端末に保存」と表示 |
| 画像未生成 | CSSグラデーション背景とプレースホルダで代替 |
| BGMなし | 無音で続行 |
| 動画なし | 結果カードとCSSアニメーションのみ表示 |
| JSON parse失敗 | OpenAIレスポンスを破棄し、Mock判定を使用 |
| カメラ拒否 | プレースホルダ表示。「カメラなしMock審査」として続行 |
| マイク拒否 | テキスト入力で続行 |
| 音声認識非対応 | テキスト入力で続行 |
| タイマー終了 | 入力途中でも次タスクへ進める |
| LocalStorage保存失敗 | 結果表示は継続。保存不可メッセージを小さく表示 |
| パスポートDL失敗 | 画面表示のみ維持。再試行ボタンを表示 |

---

## 27. セキュリティ要件

```text
OPENAI_API_KEY はサーバー側のみで使用する
クライアントにAPIキーを渡さない
.env* をGitに含めない
Supabase service_roleキーをクライアントで使わない
Supabaseを使う場合はanon keyのみクライアントで使用する
正解情報や内部評価プロンプトを不要なタイミングでフロントに返さない
入力文字数制限を行う
ユーザー入力は最大500文字/タスクに制限する
写真や録音データをDBに保存しない
顔写真はパスポートカード生成のためブラウザ内で一時利用する
録音ファイルは保存しない
個人名や誹謗中傷を求めるお題を出さない
AIコメントはユーザー本人を攻撃しない
```

---

## 28. 環境変数

未設定でもMock Modeで動くこと。

```env
# OpenAI
OPENAI_API_KEY=

# Supabase optional
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional
NEXT_PUBLIC_APP_URL=
```

### 動作方針

```text
OPENAI_API_KEY が空:
- /api/game/start はMockタスクを返す
- /api/game/answer はMock判定を返す

Supabase環境変数が空:
- DB保存しない
- LocalStorage保存のみ

Vercel本番で未設定:
- ビルド成功
- Mock Modeとして表示
- 1プレイ完結
```

---

## 29. package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "gen:image": "node gen-image.mjs"
  }
}
```

---

## 30. ディレクトリ構成

```text
.
├── app
│   ├── api
│   │   ├── game
│   │   │   ├── start
│   │   │   │   └── route.ts
│   │   │   ├── task-comment
│   │   │   │   └── route.ts
│   │   │   └── answer
│   │   │       └── route.ts
│   │   └── result
│   │       └── save
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── TitleScreen.tsx
│   ├── HowToScreen.tsx
│   ├── PermissionScreen.tsx
│   ├── GameScreen.tsx
│   ├── AnalyzingScreen.tsx
│   ├── ResultScreen.tsx
│   ├── PassportCard.tsx
│   ├── HistoryPanel.tsx
│   ├── CameraPreview.tsx
│   ├── TimerBar.tsx
│   ├── ExaminerPanel.tsx
│   └── MockBadge.tsx
├── lib
│   ├── mockData.ts
│   ├── mockJudge.ts
│   ├── openai.ts
│   ├── supabase.ts
│   ├── storage.ts
│   ├── score.ts
│   ├── passport.ts
│   └── utils.ts
├── types
│   └── game.ts
├── public
│   ├── images
│   │   ├── title-bg.png
│   │   ├── game-bg.png
│   │   ├── result-approved-bg.png
│   │   ├── result-rejected-bg.png
│   │   ├── examiner.png
│   │   └── passport-frame.png
│   ├── audio
│   │   ├── bgm.mp3
│   │   ├── scan.mp3
│   │   ├── stamp.mp3
│   │   ├── approved.mp3
│   │   └── rejected.mp3
│   └── video
│       ├── approved.mp4
│       ├── rejected.mp4
│       └── scan-loop.mp4
├── gen-image.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 31. 実装時の重要ルール

```text
まずMock Modeで完成させる
APIキーなしでビルド成功させる
Supabaseなしで1プレイ完結させる
画像がなくてもUIが壊れない
BGM/動画がなくても進行できる
npm run build を最優先
45秒以内にゲーム開始できる導線にする
タイトルから2クリック以内で審査画面へ入る
正解情報をフロントに不要に持たせない
写真や録音をDBに保存しない
ユーザー本人への悪口をAIコメントに出さない
カメラ/マイク拒否でもゲームを止めない
Supabaseランキングは任意実装にする
```

---

## 32. 3時間ハッカソン想定の開発順

```text
0:00〜0:30
- Next.js / TypeScript / Tailwindの初期セットアップ
- 画面phase管理を作成
- mockData.ts と mockJudge.ts を作成
- タイトル画面と遊び方画面を作る

0:30〜1:00
- GameScreenを作成
- 3タスク表示、20秒タイマー、次へボタンを実装
- テキスト入力欄を実装
- カメラ/マイクなしでも進行できる状態にする

1:00〜1:30
- MediaDevices APIでカメラプレビューを実装
- スナップショット撮影を実装
- マイク許可チェックを実装
- 音声認識は可能なら実装、無理ならテキスト入力優先

1:30〜2:00
- AnalyzingScreenを実装
- 検査中ログ演出を追加
- Mock判定でResultScreenへ遷移
- 人間度、AI疑惑、ランク、入国可否を表示

2:00〜2:30
- PassportCardを実装
- 撮影画像をカードに表示
- APPROVED/REJECTEDスタンプ風CSSを作る
- LocalStorage履歴保存を実装

2:30〜3:00
- API RouteのMock/OpenAI分岐を整える
- Supabase未接続フォールバックを確認
- レスポンシブ調整
- npm run build確認
- Vercelデプロイ
- 発表用デモ動線確認
```

---

## 33. 発表用説明文

```text
「I am not a robot」は、人間とAIの境界をテーマにした入国審査ゲームです。

舞台は、人間界とAI世界の境界にある入国管理局です。
AIが人間の文章、声、顔を真似できるようになった世界で、
プレイヤーは表情、声、愚痴、ジェスチャーを使って
自分が人間であることを証明します。

AIは3つの認証お題を出し、
ユーザーの回答から疲労感、怒り、生活感、矛盾、不完全さを分析して
人間度を判定します。

結果では、入国許可または拒否、
人間タイプ診断、AI審査官のコメント、
そして顔写真入りのパスポート風カードが表示されます。

また、OpenAI APIやSupabaseが未設定でもMock Modeで最後まで遊べるため、
ハッカソン本番やVercelデプロイでも安定してデモできます。
```

---

## 34. 受け入れ条件

```text
- [ ] npm run build が成功する
- [ ] APIキーなしで動く
- [ ] Supabaseなしで動く
- [ ] タイトル画面が表示される
- [ ] 遊び方画面が表示される
- [ ] 45秒以内にコア体験へ入れる
- [ ] カメラ許可時にプレビューが表示される
- [ ] カメラ拒否時もプレースホルダで進行できる
- [ ] マイク拒否時もテキスト入力で進行できる
- [ ] 3つのお題を順番に実行できる
- [ ] 各お題に20秒タイマーがある
- [ ] 質問または入力ができる
- [ ] Mock判定で結果表示できる
- [ ] 人間度、AI疑惑、ランクが表示される
- [ ] 入国許可/拒否が表示される
- [ ] AI審査官コメントが表示される
- [ ] 人間タイプ診断が表示される
- [ ] パスポート風カードが表示される
- [ ] 写真や録音をDB保存しない
- [ ] LocalStorageに結果履歴が保存される
- [ ] スマホで崩れない
- [ ] GitHubにpushできる
- [ ] Vercelで表示できる
- [ ] 画像未生成でもCSS背景で動く
- [ ] BGM/動画なしでも動く
```

---

## 35. 最終ゴール

審査員がVercel URLを開くと、すぐに「人間界とAI世界の境界にある入国審査場」に入り、カメラとマイク、またはMock Modeを使って3つの人間認証を体験できる。

最後に、人間度・AI疑惑・入国許可/拒否・人間タイプ診断・AI審査官の皮肉コメント・顔写真入りパスポート風カードが表示され、「人間とAIの境界」を笑いながら体験できる状態を最終ゴールとする。