// 画面と進行。出題は src/gen が作り、正しさは engine/spec の契約が守る。
// ここは「見せる・受け取る・進める」だけを持つ。
//
// 操作の文法は全部の問題で同じ:
//   えらぶ・タップする・うごかす → 「けってい」で確定。とちゅうで やりなおせる。
// まちがえたら: 1回目はヒント、2回目はこたえの説明を見て つぎへ。

import { G1, makePack } from '../gen/index.js';
import { validatePack } from '../engine/spec.js';
import { stageAt } from '../curriculum/g1.js';
import { iconSvg, renderBoard } from './boards.js';

const STORE_KEY = 'hirameki-v2';
const root = document.getElementById('app');

const state = load();
let session = null;
let listLine = null; // { lineId, stageIndex, pack, at, firstTry, results, phase }

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (raw && raw.version === 1) {
      if (!raw.flags) raw.flags = { intro: false, lines: {} };
      if (!raw.flags.lines) raw.flags.lines = {};
      return raw;
    }
  } catch (err) { /* こわれた保存は作り直す */ }
  return { version: 1, progress: {}, plays: 0, flags: { intro: false, lines: {} } };
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function progressOf(stageId) {
  return state.progress[stageId] || null;
}

function isUnlocked(lineId, stageIndex) {
  if (state.flags.admin) return true; // 管理者モード: 全ステージ解放
  if (stageIndex <= 0) return true;
  const prev = G1.lines[lineId].stages[stageIndex - 1];
  const p = progressOf(prev.id);
  return Boolean(p && p.cleared);
}

function clearedCount(lineId) {
  return G1.lines[lineId].stages.filter(s => progressOf(s.id) && progressOf(s.id).cleared).length;
}

// ---------- 画面 ----------

function show(html) {
  root.innerHTML = html;
  root.scrollTop = 0;
  window.scrollTo(0, 0);
}

// ---------- ものがたりの導入 ----------
// はじめて ひらいた ときに 3まいだけ。よみおわったら 二どと じゃまを しない。

const INTRO_PAGES = [
  { img: 'assets/workshop-hero-v1.jpg', alt: 'こうぼうの なか',
    text: 'ここは 「ひらめき こうぼう」。まんなかの そうち ルミナが、まちの みんなの どうぐを つくって いるよ。' },
  { img: 'assets/workshop-dark-v1.jpg', alt: 'ルミナが とまった こうぼう',
    text: 'ある あさ、ルミナが ピタッと とまって しまった。こうぼうの 6つの そうちが、ぜんぶ こしょう したんだ。' },
  { img: 'assets/story-guides-v1.jpg', alt: 'トトと モクモ',
    text: 'もんだいに こたえると、そうちは すこしずつ うごきだす。トトと モクモと いっしょに、こうぼうを なおそう！' }
];

let introAt = 0;

function introScreen() {
  session = null;
  const p = INTRO_PAGES[introAt];
  const last = introAt === INTRO_PAGES.length - 1;
  const marks = INTRO_PAGES.map((_, i) => '<span class="qdot' + (i === introAt ? ' now' : i < introAt ? ' done' : '') + '"></span>').join('');
  show(
    '<main class="intro">' +
    (p.img ? '<img class="intro-img" src="' + p.img + '" alt="' + esc(p.alt) + '">' : '<div class="intro-dark">・・・</div>') +
    '<div class="intro-card"><p>' + esc(p.text) + '</p></div>' +
    '<div class="qnav">' + marks + '</div>' +
    '<button type="button" class="commit" data-intro-next>' + (last ? 'こうぼうへ いく' : 'つぎへ') + '</button>' +
    '</main>'
  );
}

// 各そうち(ライン)の はじめての 1まい。「なにが こわれて、なにを すれば なおるか」だけを いう。
const LINE_INTROS = {
  number: 'かずの けいじばんの あかりが きえて、かずが よめなく なった。かぞえて こたえて、あかりを もどそう。',
  addition: 'あわせる そうちの うでが とまって いる。あわせる けいさんで、うでを うごかそう。',
  subtraction: 'わける そうちの でぐちが つまって いる。とる・わける けいさんで、ながれを もどそう。',
  measure: 'はかる だいの めもりが くるって いる。ならべて くらべて、めもりを なおそう。',
  shape: 'かたちの つくえが ちらかって しまった。かたちを みわけて、もとに もどそう。',
  solve: 'しらべる つくえの きろくが きえた。ならべて かぞえて、きろくを つくりなおそう。'
};

const LINE_ICONS = {
  number: 'device-number',
  addition: 'device-addition',
  subtraction: 'device-subtraction',
  measure: 'device-measure',
  shape: 'device-shape',
  solve: 'device-solve'
};

function lineIntroScreen(lineId) {
  session = null;
  const line = G1.lines[lineId];
  show(
    '<header class="bar line-' + lineId + '"><button type="button" class="back" data-home>← もどる</button><h1>' + esc(line.name) + '</h1><span class="bar-side">' + esc(line.device) + '</span></header>' +
    '<main class="intro"><div class="intro-card"><p>' + esc(LINE_INTROS[lineId] || '') + '</p></div>' +
    '<button type="button" class="commit" data-line-go="' + lineId + '">なおしに いく</button>' +
    '</main>'
  );
}

function homeScreen() {
  session = null;
  const lines = G1.lineOrder.map(lineId => {
    const line = G1.lines[lineId];
    const done = clearedCount(lineId);
    return '<button type="button" class="line-card line-' + lineId + '" data-line="' + lineId + '">' +
      '<span class="line-icon" role="img" aria-label="' + esc(line.device) + '">' + iconSvg(LINE_ICONS[lineId]) + '</span>' +
      '<span class="line-name">' + esc(line.name) + '</span>' +
      '<span class="line-device">' + esc(line.device) + '</span>' +
      '<span class="line-progress">' + done + ' / ' + line.stages.length + '</span>' +
      '</button>';
  }).join('');
  show(
    '<header class="hero">' +
    '<img class="hero-img" src="assets/workshop-hero-v1.jpg" alt="ひらめきこうぼう">' +
    '<div class="hero-text"><h1>ひらめき こうぼう</h1>' +
    '<p>ルミナの こうぼうを なおしながら、さんすうを たんけんしよう。</p></div>' +
    '</header>' +
    '<main class="home">' +
    (state.flags.admin ? '<p class="admin-note">かんりしゃモード(全ステージ かいほう) <button type="button" class="soft small" data-admin-off>もどす</button></p>' : '') +
    '<h2>どの そうちを うごかす？</h2>' +
    '<div class="line-grid">' + lines + '</div>' +
    '<p class="small-note">きろくは この たんまつの なかにだけ のこるよ。</p>' +
    '</main>'
  );
}

function stageListScreen(lineId) {
  listLine = lineId;
  const line = G1.lines[lineId];
  const cards = line.stages.map((stage, i) => {
    const p = progressOf(stage.id);
    const unlocked = isUnlocked(lineId, i);
    const stars = p && p.stars ? '★'.repeat(p.stars) + '☆'.repeat(3 - p.stars) : '';
    return '<button type="button" class="stage-card' + (unlocked ? '' : ' locked') + (p && p.cleared ? ' cleared' : '') + '"' +
      (unlocked ? ' data-stage="' + i + '"' : ' disabled') + '>' +
      '<span class="stage-no">' + (i + 1) + '</span>' +
      '<span class="stage-name">' + esc(stage.name) + '</span>' +
      '<span class="stage-action">' + esc(stage.action) + '</span>' +
      '<span class="stage-stars">' + (unlocked ? stars : '<span class="lock-icon" role="img" aria-label="ロック"></span>') + '</span>' +
      '</button>';
  }).join('');
  show(
    '<header class="bar line-' + lineId + '"><button type="button" class="back" data-home>← もどる</button><h1>' + esc(line.name) + '</h1><span class="bar-side">' + esc(line.device) + '</span></header>' +
    '<main class="stage-list">' + cards + '</main>'
  );
}

// ---------- 出題 ----------

function startStage(lineId, stageIndex, seed) {
  const stage = stageAt(lineId, stageIndex);
  const useSeed = seed == null ? ((Date.now() ^ (state.plays * 2654435761)) >>> 0) : seed;
  let pack = makePack(lineId, stageIndex, useSeed);
  // 契約に落ちるパックは世に出さない(まず起きないが、起きたら別seedで作り直す)
  for (let retry = 0; retry < 4 && validatePack(pack, stage, 'runtime').length > 0; retry += 1) {
    pack = makePack(lineId, stageIndex, useSeed + retry + 1);
  }
  state.plays += 1;
  save();
  session = { lineId, stageIndex, stage, pack, at: 0, firstTry: 0, tries: 0, phase: 'ask' };
  prepareQuestion();
  renderPlay();
}

function currentQuestion() {
  return session.pack.questions[session.at];
}

function prepareQuestion() {
  const q = currentQuestion();
  q.ui = {
    selected: new Set(),
    choice: null,
    input: '',
    pos: q.board && q.board.type === 'numberline' ? q.board.start : 0,
    clockH: q.board && q.board.startH != null ? q.board.startH : 0,
    clockM: q.board && q.board.startM != null ? q.board.startM : 0,
    wrongs: 0,
    feedback: null
  };
}

function kindLabel(kind) {
  return {
    choice: 'えらんで けってい',
    keypad: 'すうじを いれる',
    'count-tap': 'タップして いれる',
    'pick-one': 'ひとつを タップ',
    remove: 'タップして とる',
    numberline: 'かずの せんを あるく',
    'clock-set': 'はりを あわせる',
    grid: 'マスを つくる'
  }[kind] || '';
}

function renderPlay() {
  const q = currentQuestion();
  const line = G1.lines[session.lineId];
  const dotsNav = session.pack.questions.map((_, i) =>
    '<span class="qdot' + (i < session.at ? ' done' : i === session.at ? ' now' : '') + '"></span>').join('');
  show(
    '<header class="bar line-' + session.lineId + '">' +
    '<button type="button" class="back" data-quit>← やめる</button>' +
    '<h1>' + esc(session.stage.name) + '</h1>' +
    '<span class="bar-side">' + esc(line.name) + '</span></header>' +
    '<main class="play">' +
    '<div class="qnav">' + dotsNav + '</div>' +
    '<section class="question-card">' +
    '<span class="kind-tag">' + kindLabel(q.kind) + (q.story ? ' ・ おはなし' : '') + '</span>' +
    '<p class="prompt">' + esc(q.prompt) + '</p>' +
    renderBoard(q) +
    '<div class="answer-area">' + renderAnswer(q) + '</div>' +
    '<div class="feedback-area">' + renderFeedback(q) + '</div>' +
    '</section>' +
    '<p class="todo-line">やること: ' + esc(q.instruction) + '</p>' +
    '</main>'
  );
}

function renderAnswer(q) {
  const ui = q.ui;
  if (ui.feedback) return '';
  if (q.kind === 'choice') {
    const buttons = q.options.map(option =>
      '<button type="button" class="answer-option' + (String(ui.choice) === String(option) ? ' selected' : '') + '" data-choice="' + esc(option) + '">' + esc(option) + '</button>'
    ).join('');
    return '<div class="option-grid count-' + q.options.length + '">' + buttons + '</div>' + commitRow(ui.choice !== null);
  }
  if (q.kind === 'keypad') {
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(k => '<button type="button" class="key" data-key="' + k + '">' + k + '</button>').join('');
    return '<div class="keypad-wrap"><div class="key-display">' + (ui.input === '' ? '<span class="ghost">？</span>' : esc(ui.input)) + '</div>' +
      '<div class="keypad">' + keys + '<button type="button" class="key erase" data-erase>けす</button></div></div>' + commitRow(ui.input !== '');
  }
  if (q.kind === 'count-tap' || q.kind === 'remove' || q.kind === 'grid' || q.kind === 'pick-one') {
    const count = ui.selected.size;
    const note = q.kind === 'pick-one' ? (count ? 'えらんだよ' : 'まだ えらんで いないよ')
      : q.kind === 'grid' ? count + 'マス'
      : count + 'こ ' + (q.kind === 'remove' ? 'とった' : 'えらんだ');
    return '<div class="tap-status">' + note + '</div>' + commitRow(count > 0, true);
  }
  if (q.kind === 'numberline') {
    return '<div class="walk-controls">' +
      '<button type="button" class="walk" data-walk="-1">← もどる</button>' +
      '<button type="button" class="walk" data-walk="1">すすむ →</button>' +
      '</div>' + commitRow(true);
  }
  if (q.kind === 'clock-set') {
    return '<div class="clock-controls">' +
      '<div class="ctrl"><small>みじかい はり</small><div><button type="button" data-clock="h-">−</button><button type="button" data-clock="h+">＋</button></div></div>' +
      '<div class="ctrl"><small>ながい はり</small><div><button type="button" data-clock="m-">−</button><button type="button" data-clock="m+">＋</button></div></div>' +
      '</div>' + commitRow(true);
  }
  return commitRow(true);
}

function commitRow(enabled, withReset) {
  return '<div class="commit-row">' +
    (withReset ? '<button type="button" class="soft" data-reset>やりなおす</button>' : '') +
    '<button type="button" class="commit" data-commit ' + (enabled ? '' : 'disabled') + '>これで けってい</button></div>';
}

function renderFeedback(q) {
  const fb = q.ui.feedback;
  if (!fb) return '';
  if (fb.kind === 'good') {
    return '<div class="feedback good"><h3>' + (fb.first ? 'せいかい！' : 'できた！') + '</h3><p>' + esc(q.explain) + '</p>' +
      '<button type="button" class="commit" data-next>つぎへ →</button></div>';
  }
  if (fb.kind === 'hint') {
    return '<div class="feedback hint"><h3>ヒント</h3><p>' + esc(q.hint1) + '</p>' +
      '<button type="button" class="commit" data-retry>もういちど やってみる</button></div>';
  }
  return '<div class="feedback teach"><h3>いっしょに たしかめよう</h3><p>' + esc(q.hint2) + '</p><p class="teach-answer">' + esc(q.explain) + '</p>' +
    '<button type="button" class="commit" data-next>わかった・つぎへ →</button></div>';
}

// ---------- 判定 ----------

function collectedAnswer(q) {
  const ui = q.ui;
  if (q.kind === 'choice') return ui.choice;
  if (q.kind === 'keypad') return Number(ui.input);
  if (q.kind === 'count-tap' || q.kind === 'remove') return ui.selected.size;
  if (q.kind === 'pick-one') return ui.selected.values().next().value;
  if (q.kind === 'grid') return Array.from(ui.selected).sort((a, b) => a - b).join(',');
  if (q.kind === 'numberline') return ui.pos;
  if (q.kind === 'clock-set') return ui.clockH + ':' + ui.clockM;
  return null;
}

function commit() {
  const q = currentQuestion();
  const got = collectedAnswer(q);
  const ok = String(got) === String(q.answer);
  if (ok) {
    if (q.ui.wrongs === 0) session.firstTry += 1;
    q.ui.feedback = { kind: 'good', first: q.ui.wrongs === 0 };
  } else {
    q.ui.wrongs += 1;
    q.ui.feedback = q.ui.wrongs >= 2 ? { kind: 'teach' } : { kind: 'hint' };
  }
  renderPlay();
}

function nextQuestion() {
  if (session.at >= 7) {
    finishStage();
    return;
  }
  session.at += 1;
  prepareQuestion();
  renderPlay();
}

function retryQuestion() {
  const q = currentQuestion();
  q.ui.feedback = null;
  q.ui.selected = new Set();
  q.ui.choice = null;
  q.ui.input = '';
  if (q.board && q.board.type === 'numberline') q.ui.pos = q.board.start;
  if (q.board && q.board.startH != null) { q.ui.clockH = q.board.startH; q.ui.clockM = q.board.startM; }
  renderPlay();
}

function finishStage() {
  const stage = session.stage;
  const stars = session.firstTry >= 8 ? 3 : session.firstTry >= 6 ? 2 : 1;
  const prev = progressOf(stage.id) || { cleared: false, stars: 0, plays: 0 };
  state.progress[stage.id] = {
    cleared: true,
    stars: Math.max(prev.stars, stars),
    plays: prev.plays + 1,
    lastSeed: session.pack.seed
  };
  save();
  const nextIndex = session.stageIndex + 1;
  const line = G1.lines[session.lineId];
  const hasNext = nextIndex < line.stages.length;
  const repairLabel = line.device + 'が うごきだす ところ';
  show(
    '<main class="result line-' + session.lineId + '">' +
    '<h1>' + esc(stage.name) + ' クリア！</h1>' +
    '<section class="repair-scene" aria-label="' + esc(repairLabel) + '">' +
    '<span class="repair-glow"></span><span class="repair-light light-left"></span><span class="repair-light light-right"></span>' +
    '<span class="repair-device" role="img" aria-label="' + esc(line.device) + '">' + iconSvg(LINE_ICONS[session.lineId]) + '</span>' +
    '<button type="button" class="repair-skip" data-skip-repair>えんしゅつを とばす</button>' +
    '</section>' +
    '<p class="stars">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</p>' +
    '<p>8もんちゅう ' + session.firstTry + 'もん、いちどで せいかい。</p>' +
    '<p class="repair">' + esc(line.device) + 'が うごきだした。こうぼうが すこし あかるく なったよ。</p>' +
    '<div class="result-actions">' +
    (hasNext ? '<button type="button" class="commit" data-go-next="' + nextIndex + '">つぎの ステージへ →</button>' : '<p class="line-complete">この そうちは ぜんぶ なおった！</p>') +
    '<button type="button" class="soft" data-back-stages>ステージ いちらんへ</button>' +
    '</div></main>'
  );
}

// ---------- 入力 ----------

root.addEventListener('click', event => {
  const t = event.target.closest('button');
  if (!t) return;
  if (t.hasAttribute('data-skip-repair')) {
    const scene = t.closest('.repair-scene');
    if (scene) scene.classList.add('is-skipped');
    return;
  }
  if (t.hasAttribute('data-intro-next')) {
    introAt += 1;
    if (introAt >= INTRO_PAGES.length) { state.flags.intro = true; save(); homeScreen(); }
    else introScreen();
    return;
  }
  if (t.dataset.lineGo) {
    state.flags.lines[t.dataset.lineGo] = true;
    save();
    stageListScreen(t.dataset.lineGo);
    return;
  }
  if (t.dataset.line) {
    if (!state.flags.lines[t.dataset.line]) lineIntroScreen(t.dataset.line);
    else stageListScreen(t.dataset.line);
    return;
  }
  if (t.hasAttribute('data-admin-off')) { state.flags.admin = false; save(); homeScreen(); return; }
  if (t.hasAttribute('data-home')) { homeScreen(); return; }
  if (t.hasAttribute('data-quit')) { stageListScreen(session.lineId); return; }
  if (t.hasAttribute('data-back-stages')) { stageListScreen(session.lineId); return; }
  if (t.dataset.goNext != null) { startStage(session.lineId, Number(t.dataset.goNext)); return; }
  if (t.dataset.stage != null) {
    const lineId = currentListLine();
    if (lineId) startStage(lineId, Number(t.dataset.stage));
    return;
  }
  if (!session || session.phase !== 'ask') { /* 結果画面などは上で処理済み */ }
  const q = session && session.pack ? currentQuestion() : null;
  if (!q || !q.ui) return;
  if (q.ui.feedback) {
    if (t.hasAttribute('data-next')) nextQuestion();
    if (t.hasAttribute('data-retry')) retryQuestion();
    return;
  }
  if (t.dataset.choice != null) { q.ui.choice = t.dataset.choice; renderPlay(); return; }
  if (t.dataset.key != null) {
    if (q.ui.input.length < 3) q.ui.input += t.dataset.key;
    renderPlay();
    return;
  }
  if (t.hasAttribute('data-erase')) { q.ui.input = q.ui.input.slice(0, -1); renderPlay(); return; }
  if (t.dataset.piece != null) {
    const index = Number(t.dataset.piece);
    if (q.kind === 'pick-one') {
      q.ui.selected = new Set([index]);
    } else if (q.board && q.board.type === 'graph-make') {
      // グラフは下から積む: タップした高さまで塗る。いちばん上をタップすると1つ減る。
      const level = (q.ui.selected.has(index) && !q.ui.selected.has(index + 1)) ? index : index + 1;
      q.ui.selected = new Set(Array.from({ length: level }, (_, i) => i));
    } else if (q.ui.selected.has(index)) {
      q.ui.selected.delete(index);
    } else {
      q.ui.selected.add(index);
    }
    renderPlay();
    return;
  }
  if (t.dataset.walk != null) {
    const b = q.board;
    q.ui.pos = Math.max(b.min, Math.min(b.max, q.ui.pos + Number(t.dataset.walk)));
    renderPlay();
    return;
  }
  if (t.dataset.clock != null) {
    const step = q.board.stepM || 30;
    if (t.dataset.clock === 'h+') q.ui.clockH = (q.ui.clockH % 12) + 1;
    if (t.dataset.clock === 'h-') q.ui.clockH = ((q.ui.clockH + 10) % 12) + 1;
    if (t.dataset.clock === 'm+') q.ui.clockM = (q.ui.clockM + step) % 60;
    if (t.dataset.clock === 'm-') q.ui.clockM = (q.ui.clockM + 60 - step) % 60;
    renderPlay();
    return;
  }
  if (t.hasAttribute('data-reset')) { retryQuestion(); return; }
  if (t.hasAttribute('data-commit') && !t.disabled) { commit(); return; }
});

function currentListLine() { return listLine; }

// ---------- 開発用フック(検証スクリプトが全ステージを回すために使う) ----------

window.__hirameki = {
  state,
  G1,
  open(lineId, stageIndex, seed) { startStage(lineId, stageIndex, seed); },
  question() { return session ? currentQuestion() : null; },
  session() { return session; },
  autoAnswer() {
    // 正解をUI状態に流し込み、実際の commit 経路で確定する(描画・判定・遷移を検証するため)
    const q = currentQuestion();
    if (q.ui.feedback) { nextQuestion(); return; }
    if (q.kind === 'choice') q.ui.choice = String(q.answer);
    else if (q.kind === 'keypad') q.ui.input = String(q.answer);
    else if (q.kind === 'count-tap' || q.kind === 'remove') { q.ui.selected = new Set(Array.from({ length: Number(q.answer) }, (_, i) => i)); }
    else if (q.kind === 'pick-one') q.ui.selected = new Set([Number(q.answer)]);
    else if (q.kind === 'grid') q.ui.selected = new Set(String(q.answer).split(',').map(Number));
    else if (q.kind === 'numberline') q.ui.pos = Number(q.answer);
    else if (q.kind === 'clock-set') { const [h, m] = String(q.answer).split(':').map(Number); q.ui.clockH = h; q.ui.clockM = m; }
    commit();
  }
};

// ---------- 起動 ----------

// #admin を付けて開くと 管理者モード(全ステージ解放)。ホームの「もどす」で解除
if (location.hash === '#admin') {
  state.flags.admin = true;
  state.flags.intro = true; // 管理者は導入を飛ばす
  save();
  history.replaceState(null, '', location.pathname + location.search);
}

const hash = location.hash.match(/^#dev\/(\w+)\/(\d+)(?:\/(\d+))?/);
if (hash) {
  startStage(hash[1], Number(hash[2]), hash[3] ? Number(hash[3]) : 12345);
} else if (!state.flags.intro) {
  introScreen();
} else {
  homeScreen();
}
