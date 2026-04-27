# Noise Maker

シンプルな colored noise と binaural beats の PWA です。Vercel 配備を前提に、依存を増やしすぎない最小構成で実装しています。

公開URL（想定）: https://noise-maker-pwa.vercel.app/

## 目的

- ホワイト、ピンク、ブラウン、ブルー、ヴァイオレットノイズを再生する
- バイノーラルビートを任意で重ねる
- スマホ中心で使いやすい UX にする
- PWA としてホーム画面追加しやすくする
- 科学的説明は慎重にし、医療効果は断定しない

## MVP

- ノイズ種類の切替
- 再生 / 停止
- 音量調整
- バイノーラルビート ON / OFF
- ベース周波数と差分周波数の調整
- タイマー機能
- manifest と service worker
- Add to Home Screen の案内
- Media Session API の連携
- 短い説明と論文リンクの二層 UI

## 仕様の要点

- i18n は 21 言語（日本語、英語、中国語、スペイン語、ヒンディー語、ベンガル語、ポルトガル語、ロシア語、広東語、ベトナム語、マラーティー語、テルグ語、トルコ語、韓国語、パンジャーブ語、タミル語、ジャワ語、イタリア語、フランス語、ドイツ語、インドネシア語）をサポートします
- RTL 言語（アラビア語、ウルドゥー語）は現時点では対象外です
- 翻訳文字列は静的な辞書で持ち、外部入力で上書きしません
- URL パラメータは `lang` のみ読み取り、許可ロケールのみを受け付けます（不正値は英語フォールバック）
- 音量、周波数、タイマーはクランプして異常値を避けます
- バイノーラルビートは左耳と右耳で異なる正弦波を出し、差分を知覚させる方式です

## PWA と端末差分

- iOS はブラウザ制約が強く、バックグラウンド再生は OS の挙動に左右されます
- Android は比較的相性がよいですが、省電力機能で止まることがあります
- Desktop は最も安定しますが、タブを閉じれば停止します

## セキュリティ

- `innerHTML` は使っていません
- URL パラメータはホワイトリストで処理しています
- 音声パラメータは範囲制限しています
- 外部リンクは `rel="noreferrer"` 付きで開きます
- Service Worker は同一オリジンだけをキャッシュします

## 実装メモ

- 音声生成は Web Audio API ベースです
- colored noise は AudioWorklet で生成しています
- バイノーラルビートは左右別々の sine oscillator で合成しています
- PWA は `public/sw.js` と `public/manifest.webmanifest` を使います

## 開発

```bash
npm install
npm run dev
```

ビルド確認:

```bash
npm run build
```

## SEO / AIEO 対策

### 実装済み（Web）

- title / description / keywords / canonical のメタタグ
- Open Graph（`og:title` / `og:description` / `og:image`）
- Twitter Card（`summary_large_image`）
- `hreflang`（ja/en）
- Schema.org（`SoftwareApplication` + `Organization`）
- `robots.txt` / `sitemap.xml`

### AIEO（AI検索最適化）の方針

- 断定的な医療効果を避け、用途を「集中・休憩・環境音マスキング」に限定
- 研究リンクを明示し、主張の根拠を追跡可能にする
- README / メタ情報 / UI文言の整合性を保つ
- FAQ 形式の短文説明を追加し、AIが引用しやすい文構造にする

### 今後の強化候補

- FAQ セクションの追加（JSON-LD `FAQPage`）
- OG 画像を専用デザインに差し替え
- 多言語拡張時の `hreflang` 追加
- 検索クエリ別ランディング（例: white noise, pink noise, binaural beats）

## 集客・認知戦略

### 優先順

1. GitHub 公開の完成度を上げる
2. Product Hunt で初回ローンチ
3. SNS（X / Reddit / Qiita / Zenn）で継続発信

### GitHub 施策

- README の冒頭に価値提案を明記（何ができるかを 1-2 行で）
- スクリーンショット / GIF を掲載
- Topics を設定（`pwa`, `web-audio-api`, `noise`, `binaural-beats`, `vite`, `react`）
- リリースノートを作成し、更新履歴を見える化

### Product Hunt 施策

- 30-60 秒のデモ動画を準備
- "誰のどの課題をどう短時間で解決するか" を1文で説明
- 初日のコメント返信体制を整える

### SNS 施策

- 開発ログを短い連投で公開（週 1-2 回）
- 睡眠・集中系コミュニティへの共有時は医療主張を避ける
- 実測データ（継続率、再訪率、平均セッション）を定期公開

### KPI（初期）

- 週次UU
- PWA インストール率
- 7日後再訪率
- 平均再生時間
- 主要流入元（GitHub / Product Hunt / SNS）

## 自己レビュー

- 複雑な機能は追加していません
- 研究説明は控えめにし、断定表現を避けています
- バックグラウンド再生は OS 制約のため「最大限努力」レベルであり、完全保証ではありません
- 追加機能候補はあるものの、初期版では切っています