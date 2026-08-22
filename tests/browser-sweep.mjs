// 実ブラウザでの全ステージ描画・進行スイープ。
//   node tests/browser-sweep.mjs [serverURL]
// 前提: リポジトリ直下で python3 -m http.server などのローカルサーバが動いていること。
// 検査: 全ステージ×8問で 盤面が描かれる・consoleエラーが無い・正答で最後まで進める。
// 画面幅は iPhone 相当の 390px。どの問題も 横に はみ出さないことを 毎問たしかめる。

import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:8901';
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const browser = await chromium.launch({ executablePath: EXEC });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
const lineOrder = await page.evaluate(() => window.__hirameki.G1.lineOrder);
const stageCounts = await page.evaluate(() => Object.fromEntries(
  window.__hirameki.G1.lineOrder.map(l => [l, window.__hirameki.G1.lines[l].stages.length])
));

let stagesChecked = 0;
let questionsChecked = 0;
const problems = [];

for (const lineId of lineOrder) {
  for (let si = 0; si < stageCounts[lineId]; si += 1) {
    await page.evaluate(([l, s]) => window.__hirameki.open(l, s, 24680), [lineId, si]);
    for (let q = 0; q < 8; q += 1) {
      const info = await page.evaluate(() => {
        const question = window.__hirameki.question();
        const board = document.querySelector('.board');
        const prompt = document.querySelector('.prompt');
        const commit = document.querySelector('[data-commit]');
        // 横はみ出し検査: ページ全体と、盤面の中身の両方
        const pageOverflow = document.documentElement.scrollWidth - window.innerWidth;
        let boardOverflow = 0;
        if (board) {
          boardOverflow = board.scrollWidth - board.clientWidth;
          const boardRect = board.getBoundingClientRect();
          for (const el of board.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.width === 0) continue;
            boardOverflow = Math.max(boardOverflow, Math.ceil(r.right - boardRect.right), Math.ceil(boardRect.left - r.left));
          }
        }
        return {
          kind: question.kind,
          hasBoard: Boolean(question.board),
          boardDrawn: Boolean(board && board.children.length && board.getBoundingClientRect().height > 8),
          promptDrawn: Boolean(prompt && prompt.textContent.trim().length > 3),
          commitDrawn: Boolean(commit),
          pageOverflow,
          boardOverflow
        };
      });
      if (!info.promptDrawn) problems.push(lineId + '/' + si + ' q' + (q + 1) + ': 問題文が表示されていない');
      if (info.hasBoard && !info.boardDrawn) problems.push(lineId + '/' + si + ' q' + (q + 1) + ' [' + info.kind + ']: 盤面が表示されていない');
      if (!info.commitDrawn) problems.push(lineId + '/' + si + ' q' + (q + 1) + ': けっていボタンが無い');
      if (info.pageOverflow > 1) problems.push(lineId + '/' + si + ' q' + (q + 1) + ' [' + info.kind + ']: 画面から横に ' + info.pageOverflow + 'px はみ出す');
      if (info.boardOverflow > 2) problems.push(lineId + '/' + si + ' q' + (q + 1) + ' [' + info.kind + ']: 盤面の中身が ' + info.boardOverflow + 'px 切れている');
      questionsChecked += 1;
      await page.evaluate(() => window.__hirameki.autoAnswer()); // 正解を流し込み commit
      const good = await page.evaluate(() => Boolean(document.querySelector('.feedback.good')));
      if (!good) problems.push(lineId + '/' + si + ' q' + (q + 1) + ' [' + info.kind + ']: 正解を入れたのに せいかいに ならない');
      await page.evaluate(() => window.__hirameki.autoAnswer()); // feedback中は next に相当
    }
    const finished = await page.evaluate(() => Boolean(document.querySelector('.result')));
    if (!finished) problems.push(lineId + '/' + si + ': 8問おわっても 結果画面に ならない');
    stagesChecked += 1;
  }
}

console.log('checked stages:', stagesChecked, ' questions:', questionsChecked);
if (errors.length) {
  console.log('--- page errors ---');
  errors.slice(0, 10).forEach(e => console.log(' ', e));
}
if (problems.length) {
  console.log('--- problems ---');
  problems.slice(0, 30).forEach(p => console.log(' ', p));
}
await browser.close();
if (errors.length || problems.length) {
  console.log('NG: errors=' + errors.length + ' problems=' + problems.length);
  process.exit(1);
}
console.log('OK: all stages render and complete');
