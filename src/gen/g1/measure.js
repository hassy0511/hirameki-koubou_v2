// くらべるライン。ながさ・かさ・ひろさ・とけい。
// くらべる盤面は「どちらが どれだけか」を目で確かめられる形で描く。

import { Q, numberOptions, ranged, randInt, pick } from '../util.js';

const LONG_OBJECTS = ['えんぴつ', 'リボン', 'ぼう', 'テープ', 'ひも'];

// 2本の長さ。おなじ回は twist(slot5-6)にだけ混ぜる。
function lengths(rng, slot) {
  const base = ranged(rng, slot, [[3, 5], [4, 7], [5, 9], [6, 9]]);
  const same = slot >= 5 && slot <= 6 && rng() < 0.4;
  if (same) return [base, base];
  let diff = pick(rng, band0(slot) ? [2, 3] : [1, 2]);
  const left = base;
  let right = rng() < 0.5 ? base + diff : base - diff;
  if (right < 2) right = base + diff;
  if (right > 10) right = base - diff;
  return [left, right];
}

function band0(slot) {
  return slot <= 1;
}

function compareQuestion(rng, slot, cfg) {
  const [left, right] = lengths(rng, slot);
  const askLess = slot % 3 === 2;
  const same = left === right;
  const answer = same ? 'おなじ' : (askLess ? (left < right ? 'ひだり' : 'みぎ') : (left > right ? 'ひだり' : 'みぎ'));
  const object = pick(rng, cfg.objects);
  const story = slot === 4;
  const prompt = same
    ? 'ふたつを くらべよう。どうなっている？'
    : story
      ? cfg.scene(object, askLess)
      : 'ひだりと みぎの ' + object + '。' + (askLess ? cfg.askLess : cfg.askMore);
  return Q({
    kind: 'choice',
    prompt,
    answer,
    options: ['ひだり', 'おなじ', 'みぎ'],
    board: { type: cfg.boardType, left, right, unitLabel: cfg.unitLabel },
    hint1: cfg.hint1,
    hint2: cfg.hint2,
    explain: same
      ? 'どちらも ' + cfg.amount(left) + 'で おなじだね。'
      : 'ひだりは ' + cfg.amount(left) + '、みぎは ' + cfg.amount(right) + '。' + answer + 'が ' + (askLess ? cfg.lessWord : cfg.moreWord) + 'ね。',
    story,
    learningKey: cfg.keyPrefix + ':' + left + ':' + right + ':' + (askLess ? 'l' : 'm'),
    math: { kind: 'compare', left, right }
  });
}

export const measureStages = {
  // ── どちらが ながい？(はしを そろえて) ──
  mea_direct(slot, rng) {
    return compareQuestion(rng, slot, {
      objects: LONG_OBJECTS,
      boardType: 'compare-bars',
      askMore: 'ながいのは どっち？',
      askLess: 'みじかいのは どっち？',
      moreWord: 'ながい',
      lessWord: 'みじかい',
      amount: n => 'めもり ' + n + 'こぶん',
      hint1: 'ひだりの はしが そろっているかを まず みよう。',
      hint2: 'とびだしている ほうが ながいよ。',
      scene: (object, less) => 'トトと モクモが ' + object + 'を もちよった。' + (less ? 'みじかいのは どっち？' : 'ながいのは どっち？'),
      keyPrefix: 'len'
    });
  },

  // ── うつして くらべる(かみテープ) ──
  mea_indirect(slot, rng) {
    return compareQuestion(rng, slot, {
      objects: ['つくえの よこ', 'ほんだなの よこ', 'まどの よこ'],
      boardType: 'tape-compare',
      askMore: 'ながいのは どっち？',
      askLess: 'みじかいのは どっち？',
      moreWord: 'ながい',
      lessWord: 'みじかい',
      amount: n => 'テープ ' + n + 'めもりぶん',
      hint1: 'うごかせない ものは、テープに うつして くらべるんだったね。',
      hint2: 'うつした テープの はしを そろえて みよう。',
      scene: (object, less) => 'うごかせない ' + object + 'を テープに うつした。' + (less ? 'みじかいのは どっち？' : 'ながいのは どっち？'),
      keyPrefix: 'tape'
    });
  },

  // ── ブロックで はかる(いくつぶんかを 指す) ──
  mea_unit(slot, rng) {
    const blocks = 10;
    const barUnits = ranged(rng, slot, [[3, 4], [4, 6], [5, 8], [7, 9]]);
    const story = slot === 4;
    const object = pick(rng, ['ぼう', 'リボン', 'テープ']);
    return Q({
      kind: 'pick-one',
      prompt: story
        ? 'モクモの ' + object + 'の ながさを ブロックで はかる。' + object + 'の みぎはしの ブロックを タップして。'
        : pick(rng, [object + 'の みぎはしは ブロック なんこめ？ その ブロックを タップして。', object + 'の おわりの ばしょの ブロックを タップして。']),
      instruction: 'その ブロックを タップして 「けってい」',
      answer: barUnits - 1,
      task: 'produce',
      board: { type: 'block-ruler', items: Array.from({ length: blocks }, () => 'block'), barUnits, object },
      hint1: 'ぼうの はじまりと ブロックの はじまりが そろっているよ。',
      hint2: 'ひだりから 1、2、と かぞえて、ぼうの おわる ところを みつけよう。',
      explain: 'ぼうは ブロック ' + barUnits + 'こぶんの ながさだね。',
      story,
      learningKey: 'unit:' + barUnits,
      math: { kind: 'unit', n: barUnits }
    });
  },

  // ── くらべかたを えらぶ ──
  mea_method(slot, rng) {
    const cases = [
      { situation: 'ふたつの えんぴつの ながさを くらべたい。', answer: 'はしを そろえて ならべる', key: 'direct' },
      { situation: 'うごかせない つくえと たなの よこの ながさを くらべたい。', answer: 'テープに うつして くらべる', key: 'transfer' },
      { situation: 'ぼうの ながさを、はなれた ともだちに つたえたい。', answer: 'ブロックの いくつぶんかを かぞえる', key: 'unit' },
      { situation: 'ふたつの リボンの ながさを その ばで くらべたい。', answer: 'はしを そろえて ならべる', key: 'direct2' },
      { situation: 'ドアの よこの ながさを あとで おもいだしたい。', answer: 'ブロックの いくつぶんかを かぞえる', key: 'unit2' },
      { situation: 'はなれた ふたつの まどの よこを くらべたい。', answer: 'テープに うつして くらべる', key: 'transfer2' }
    ];
    const chosen = pick(rng, cases);
    const story = slot === 4;
    const ask = pick(rng, [' どうやって くらべる？', ' どの やりかたが いい？']);
    return Q({
      kind: 'choice',
      prompt: (story ? 'トトから そうだん。' : '') + chosen.situation + ask,
      answer: chosen.answer,
      options: ['はしを そろえて ならべる', 'テープに うつして くらべる', 'ブロックの いくつぶんかを かぞえる'],
      board: null,
      hint1: 'うごかせるか、うごかせないかを まず かんがえよう。',
      hint2: 'かずで つたえたい ときは、なにかの いくつぶんかに するんだったね。',
      explain: chosen.situation + ' このときは「' + chosen.answer + '」が いいね。',
      story,
      learningKey: 'method:' + chosen.key,
      math: null
    });
  },

  // ── どちらが おおく はいる？(カップのいくつぶん) ──
  mea_capacity(slot, rng) {
    return compareQuestion(rng, slot, {
      objects: ['すいとう', 'ペットボトル', 'やかん'],
      boardType: 'cups',
      askMore: 'おおく はいるのは どっち？',
      askLess: 'すくないのは どっち？',
      moreWord: 'おおい',
      lessWord: 'すくない',
      amount: n => 'カップ ' + n + 'はいぶん',
      hint1: 'おなじ カップの いくつぶんかで くらべるよ。',
      hint2: 'カップの えを かぞえて みよう。',
      scene: (object, less) => 'ふたつの ' + object + 'から カップに みずを うつした。' + (less ? 'すくないのは どっち？' : 'おおく はいるのは どっち？'),
      keyPrefix: 'cap'
    });
  },

  // ── どちらが ひろい？(マスのいくつぶん) ──
  mea_area(slot, rng) {
    return compareQuestion(rng, slot, {
      objects: ['レジャーシート', 'ハンカチ', 'カード'],
      boardType: 'area-grid',
      askMore: 'ひろいのは どっち？',
      askLess: 'せまいのは どっち？',
      moreWord: 'ひろい',
      lessWord: 'せまい',
      amount: n => 'マス ' + n + 'こぶん',
      hint1: 'おなじ おおきさの マスの かずで くらべよう。',
      hint2: 'マスを 1つずつ かぞえて みよう。',
      scene: (object, less) => 'ふたつの ' + object + 'を マスの うえに おいた。' + (less ? 'せまいのは どっち？' : 'ひろいのは どっち？'),
      keyPrefix: 'area'
    });
  },

  // ── なんじ？(よむ⇄あわせる) ──
  mea_hour(slot, rng) {
    return clockQuestion(rng, slot, 'hour');
  },
  mea_half(slot, rng) {
    return clockQuestion(rng, slot, 'half');
  },
  mea_minute(slot, rng) {
    return clockQuestion(rng, slot, 'minute');
  }
};

function clockLabel(h, m) {
  if (m === 0) return h + 'じ';
  if (m === 30) return h + 'じはん';
  return h + 'じ' + m + 'ふん';
}

function clockQuestion(rng, slot, mode) {
  const h = randInt(rng, 1, 12);
  const m = mode === 'hour' ? 0 : mode === 'half' ? (slot % 2 === 0 ? 30 : pick(rng, [0, 30])) : randInt(rng, 0, 11) * 5;
  const setMode = slot % 2 === 1 && slot !== 4;
  const story = slot === 4;
  if (setMode) {
    // つくる: 針をあわせる。初期位置は毎回ちがう ずれかた。
    let sh = randInt(rng, 1, 12);
    let sm = mode === 'minute' ? randInt(rng, 0, 11) * 5 : pick(rng, [0, 30]);
    if (sh === h && sm === m) sh = (sh % 12) + 1;
    return Q({
      kind: 'clock-set',
      prompt: clockLabel(h, m) + 'に とけいを あわせよう。',
      answer: h + ':' + m,
      task: 'produce',
      board: { type: 'clock-set', startH: sh, startM: sm, stepM: mode === 'minute' ? 5 : 30 },
      hint1: 'みじかい はりが「じ」、ながい はりが「ふん」だよ。',
      hint2: m === 0 ? 'ながい はりは 12に あわせよう。' : m === 30 ? 'ながい はりは 6に あわせよう。' : 'ながい はりは 1めもりで 5ふん すすむよ。',
      explain: 'みじかい はりが ' + h + '、ながい はりで ' + (m === 0 ? '12' : m === 30 ? '6' : String(m / 5)) + 'を さすと ' + clockLabel(h, m) + 'だね。',
      story: false,
      learningKey: 'clock:' + h + ':' + m,
      math: { kind: 'clock', h, m }
    });
  }
  const distractors = new Set([clockLabel(h, m)]);
  const mirrorH = m === 0 ? (h % 12) + 1 : h;
  distractors.add(clockLabel(mirrorH === h ? (h % 12) + 1 : mirrorH, m));
  if (mode !== 'hour') distractors.add(clockLabel(h, m === 30 ? 0 : 30));
  if (mode === 'minute') distractors.add(clockLabel(h, (m + 25) % 60));
  distractors.add(clockLabel((h + 5) % 12 + 1, m));
  const options = Array.from(distractors).slice(0, 4);
  return Q({
    kind: 'choice',
    prompt: story ? 'トトが とけいを みている。いま なんじかな？' : 'とけいは ' + (mode === 'hour' ? 'なんじ？' : mode === 'half' ? 'なんじはん？' : 'なんじ なんぷん？'),
    answer: clockLabel(h, m),
    options,
    board: { type: 'clock', h, m },
    hint1: 'みじかい はりから よもう。「じ」が わかるよ。',
    hint2: m === 0 ? 'ながい はりが 12なら、ちょうど「じ」だよ。' : m === 30 ? 'ながい はりが 6なら「はん」だよ。' : 'ながい はりは 1めもりで 5ふんだよ。',
    explain: 'みじかい はりが ' + h + '、ながい はりが ' + (m === 0 ? '12' : m === 30 ? '6' : String(m / 5)) + '。だから ' + clockLabel(h, m) + 'だね。',
    story,
    learningKey: 'clock:' + h + ':' + m,
    math: { kind: 'clock', h, m }
  });
}
