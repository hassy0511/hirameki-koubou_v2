# ひらめき工房 v2

小学生の算数を、工房の装置をさわって学ぶブラウザゲーム。
工房の中枢装置ルミナを直しながら、学習指導要領に沿ったステージを順にクリアしていく。

旧リポジトリ(hirameki-kobo)の全面作り直し版。設計の引き継ぎ内容は `docs/carryover_for_rebuild.md` を正本とする。

## 現在の範囲

- 小学1年生算数: 6ライン・全67ステージ(たしざんのみ12、ほかは11)
- 小学2年生算数: 6ライン・全66ステージ(おおきな かず/たしひき ひっさん/かけざん/はかる/かたち/しらべる・とく)。ホームの学年タブで切り替え
  - かず / たしざん / ひきざん / くらべる / かたち / しらべる
- 各ステージ8問。前のステージをクリアすると次が開く。星は一発正解の数で3段階。
- 進捗は端末の localStorage にのみ保存する。

## 動かし方

ビルド・依存なし。静的サーバで開くだけ。

```
python3 -m http.server 8901
# http://127.0.0.1:8901/index.html
```

## 構成

```
index.html / styles.css     画面の枠とスタイル
src/engine/rng.js           シード付き乱数(生成は全て純関数)
src/engine/spec.js          出題契約(バリデータ)= 問題品質の正本
src/curriculum/g1.js        6ライン×11ステージの定義
src/gen/g1/*.js             ライン別の問題生成器
src/gen/index.js            8問パック組み立て(重複・偏りガード付き)
src/ui/app.js               画面遷移・回答UI・進捗保存
src/ui/boards.js            盤面描画(教材図はHTML/CSS/SVGで描く)
tests/quality-contract.test.mjs  出題契約テスト(node --test)
tests/browser-sweep.mjs          実ブラウザ全ステージ検証(Playwright)
docs/                       カリキュラム・世界観・引き継ぎ資料
```

## 品質の決まり(要約)

- 盤面は「問題の状態」を見せ、「答えの形」を見せない。
- 1ステージ1操作。動詞と操作を一致させる(とろう→取り除く 等)。
- 8問は 導入2→展開2→おはなし1→ゆさぶり2→まとめ1 の弧で並べる。
- 誤答選択肢は誤概念(演算取り違え・±1・位の入れ替え 等)から作る。
- 子どもに見える文はひらがな+数字+記号のみ。二段階ヒント+言葉での説明を必ず持つ。
- 詳細は `CLAUDE.md` と `src/engine/spec.js`。仕様変更はテストを先に直す。

## 検証

```
node --test tests/quality-contract.test.mjs   # 出題契約 10本
python3 -m http.server 8901 &                 # サーバを立ててから
node tests/browser-sweep.mjs                  # 全ステージ×8問を実ブラウザで完走
```
