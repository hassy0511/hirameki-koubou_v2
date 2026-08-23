// 小3・かけざんライン。0と10→積の変化→分配→何十何百→部分積→筆算→×何十→2けた×2けた。

import { Q, ranged, randInt, pick, thing } from '../util.js';

function mulScene3(rng, a, b) {
  const item = thing(rng);
  return pick(rng, [
    '1はこ ' + a + 'こいりの ' + item.name + 'を ' + b + 'はこ かう。ぜんぶで いくつ？',
    '1れつ ' + a + 'にんの ぎょうれつが ' + b + 'れつ。みんなで なんにん？',
    '1まい ' + a + 'えんの カードを ' + b + 'まい かう。いくら？'
  ]);
}

function mulCapstone3(rng, a, b, key) {
  return Q({
    kind: 'equation-build',
    prompt: mulScene3(rng, a, b),
    answer: a * b,
    ops: ['＋', '−', '×'],
    instruction: 'すうじと けいさんの キーで しきを つくって 「けってい」',
    board: { type: 'column-calc', a, b, op: '×', hideOp: true },
    hint1: 'おなじ かずずつの まとまりが いくつぶんかな。',
    hint2: 'しきは ' + a + '×' + b + '。ひっさんで たしかめよう。',
    explain: 'しきは ' + a + '×' + b + '。こたえは ' + a * b + 'だね。',
    story: false,
    learningKey: key,
    math: { kind: 'mul', a, b }
  });
}

export const g3MulStages = {
  // ── 0と 10の かけざん・□の かけざん ──
  g3_mul_zero(slot, rng) {
    const mode = slot % 3;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const dan = randInt(rng, 2, 9);
      return Q({
        kind: 'keypad',
        prompt: pick(rng, [
          'おさらは ' + dan + 'まい あるのに、どれにも なにも のって いない。ぜんぶで なんこ？',
          'なにも はいって いない ふくろが ' + dan + 'つ。なかみは ぜんぶで なんこ？'
        ]),
        answer: 0,
        board: { type: 'trays', per: 0, groups: dan, icon: 'dot' },
        hint1: '0こずつは なんかい あつめても 0だよ。',
        hint2: 'なにも ない まとまりを かぞえて いるんだね。',
        explain: '0の かけざんの こたえは いつも 0。ないものは ふえないんだね。',
        story: false,
        learningKey: 'g3z:' + dan,
        math: { kind: 'mul', a: 0, b: dan }
      });
    }
    if (mode === 1 || story) {
      const dan = randInt(rng, 2, 9);
      return Q({
        kind: 'keypad',
        prompt: story
          ? '1ふくろ 10こいりの あめを ' + dan + 'ふくろ かう。ぜんぶで いくつ？'
          : '10×' + dan + 'は いくつ？',
        answer: 10 * dan,
        board: { type: 'rod-groups', left: dan, right: 0, countable: true },
        hint1: '10の たばが ' + dan + 'こぶんだよ。',
        hint2: '10、20、30、と とびかぞえしよう。',
        explain: '10が ' + dan + 'こで ' + 10 * dan + '。10の かけざんは 0を つけるだけだね。',
        story,
        learningKey: 'g3ten:' + dan,
        math: { kind: 'mul', a: 10, b: dan }
      });
    }
    const dan = randInt(rng, 3, 9);
    let k = randInt(rng, 3, 9);
    if (k === dan) k = k === 9 ? 8 : k + 1;
    return Q({
      kind: 'keypad',
      prompt: 'なにかの かずに ' + dan + 'を かけると ' + dan * k + '。もとの かずは いくつ？',
      answer: k,
      board: { type: 'array-grid', rows: dan, cols: k },
      hint1: dan + 'のだんの くくで ' + dan * k + 'に なる ところを さがそう。',
      hint2: dan + '×なにが ' + dan * k + 'かな。じゅんに いって みよう。',
      explain: dan + '×' + k + '＝' + dan * k + '。くくを ぎゃくから つかえたね。',
      story: false,
      learningKey: 'g3unk:' + dan + ':' + k,
      math: { kind: 'mul', a: dan, b: k }
    });
  },

  // ── こたえの かわりかた・いれかえ ──
  g3_mul_change(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const rows = randInt(rng, 3, 9);
    let cols = randInt(rng, 3, 8);
    if (cols === rows) cols += 1;
    if (mode === 0 && !story) {
      return Q({
        kind: 'keypad',
        prompt: 'アレイに たての 1れつを たす。○は いくつ ふえる？',
        answer: rows,
        board: { type: 'array-grid', rows, cols },
        hint1: '1れつは たてに ならんだ ○の かずだよ。',
        hint2: 'かける かずが 1 ふえると、だんの かずだけ ふえるんだね。',
        explain: '1れつで ' + rows + 'こ ふえる。こたえの ふえかたには きまりが あるね。',
        story: false,
        learningKey: 'g3ch1:' + rows + ':' + cols,
        math: { kind: 'mul', a: rows, b: cols }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'トトは ' + rows + '×' + cols + '、モクモは ' + cols + '×' + rows + 'を けいさんした。どちらの こたえも いくつ？'
        : rows + '×' + cols + 'と ' + cols + '×' + rows + '。どちらの こたえも いくつ？',
      answer: rows * cols,
      board: { type: 'array-grid', rows, cols },
      hint1: 'アレイを たてから みても よこから みても ○は おなじ。',
      hint2: 'けいさんしやすい ほうで もとめよう。',
      explain: 'かける じゅんばんを いれかえても ' + rows * cols 
        + '。じゆうに いれかえて いいんだね。',
      story,
      learningKey: 'g3ch2:' + Math.min(rows, cols) + ':' + Math.max(rows, cols),
      math: { kind: 'mul', a: rows, b: cols }
    });
  },

  // ── わけて かける(結合・分配) ──
  g3_mul_dist(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const a = randInt(rng, 2, 4);
      const b = randInt(rng, 2, 3);
      const c = randInt(rng, 2, 4);
      return Q({
        kind: 'keypad',
        prompt: a + '×' + b + 'を さきに けいさんしても、' + b + '×' + c + 'を さきに けいさんしても おなじ。' + a + '×' + b + '×' + c + 'は いくつ？',
        answer: a * b * c,
        board: null,
        hint1: 'まとまりを つくって 2かいに わけて かけよう。',
        hint2: a + '×' + b + '＝' + a * b + '。それを ' + c + 'ばいするよ。',
        explain: 'どこから かけても ' + a * b * c + '。かけざんは じゅんばんを くふうできるね。',
        story: false,
        learningKey: 'g3as:' + a + ':' + b + ':' + c,
        math: { kind: 'mul', a: a * b, b: c }
      });
    }
    const dan = randInt(rng, 3, 8);
    const k = randInt(rng, 6, 9);
    let split = randInt(rng, 2, 4);
    if (k - split === dan || k - split === split) split = split === 4 ? 3 : split + 1;
    const rest = k - split;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'ながい アレイを ふたりで ぶんたん。' + dan + '×' + split + 'の ぶんと ' + dan + '×' + rest + 'の ぶんに わけた。あわせて いくつ？'
        : dan + '×' + k + 'を、' + dan + '×' + split + 'と ' + dan + '×' + rest + 'に わけて けいさんする。こたえは いくつ？',
      answer: dan * k,
      board: { type: 'array-grid', rows: dan, cols: k, splitAt: split },
      hint1: 'わけた ふたつの こたえを たせば いいよ。',
      hint2: dan * split + 'と ' + dan * rest + 'を あわせよう。',
      explain: dan * split + '＋' + dan * rest + '＝' + dan * k + '。わけて かけても こたえは おなじだね。',
      story,
      learningKey: 'g3di:' + dan + ':' + k + ':' + split,
      math: { kind: 'mul', a: dan, b: k }
    });
  },

  // ── なん10・なん100の かけざん ──
  g3_mul_tens(slot, rng) {
    const dan = randInt(rng, 2, 9);
    const k = randInt(rng, 2, 9);
    const hundred = slot >= 3 && slot % 2 === 1;
    const base = hundred ? k * 100 : k * 10;
    const story = slot === 4;
    if (base * dan > 9000) return this.g3_mul_tens((slot + 2) % 4, rng);
    return Q({
      kind: 'keypad',
      prompt: story
        ? '1たば ' + base + 'まいの かみを ' + dan + 'たば つかう。ぜんぶで なんまい？'
        : base + '×' + dan + 'は いくつ？',
      answer: base * dan,
      board: null,
      hint1: (hundred ? '100' : '10') + 'の たばが なんこに なるかで かんがえよう。',
      hint2: k + '×' + dan + '＝' + k * dan + '。それを ' + (hundred ? '100ばい' : '10ばい') + 'するよ。',
      explain: k + '×' + dan + 'の ' + k * dan + 'に 0を つけて ' + base * dan + '。たばで かんがえると くくが つかえるね。',
      story,
      learningKey: 'g3t100:' + base + ':' + dan,
      math: { kind: 'mul', a: base, b: dan }
    });
  },

  // ── 2けたを わけて かける(部分積) ──
  g3_mul_partial(slot, rng) {
    const tens = randInt(rng, 1, 4);
    const ones = randInt(rng, 2, 9);
    const a = tens * 10 + ones;
    let b = randInt(rng, 2, 4);
    if (b === ones) b = b === 4 ? 3 : b + 1;
    if (b === ones) b = 2;
    const story = slot === 4;
    const mode = slot % 2;
    if (mode === 0 && !story) {
      return Q({
        kind: 'keypad',
        prompt: a + '×' + b + 'を、' + tens * 10 + '×' + b + 'と あと ひとつに わける。のこりは なに×' + b + '？',
        answer: ones,
        board: null,
        hint1: a + 'を じゅうと いちに わけよう。',
        hint2: a + 'は ' + tens * 10 + 'と いくつかな。',
        explain: a + 'は ' + tens * 10 + 'と ' + ones + '。だから ' + ones + '×' + b + 'が のこりだね。',
        story: false,
        learningKey: 'g3pa1:' + a + ':' + b,
        math: { kind: 'mul', a, b }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story
        ? '1ふくろ ' + a + 'こいりの クッキーが ' + b + 'ふくろ。じゅうと いちに わけて けいさんすると、ぜんぶで いくつ？'
        : a + '×' + b + 'は いくつ？ ' + tens * 10 + '×' + b + 'と ' + ones + '×' + b + 'に わけて けいさんしよう。',
      answer: a * b,
      board: null,
      hint1: 'わけた ふたつの こたえを たすよ。',
      hint2: tens * 10 * b + 'と ' + ones * b + 'を あわせよう。',
      explain: tens * 10 * b + '＋' + ones * b + '＝' + a * b + '。じゅうと いちに わけると けいさんできるね。',
      story,
      learningKey: 'g3pa2:' + a + ':' + b,
      math: { kind: 'mul', a, b }
    });
  },

  // ── かけざんの ひっさん(×1けた) ──
  g3_mul_written1(slot, rng) {
    const threeDigit = slot >= 5;
    const a = threeDigit ? randInt(rng, 123, 987) : ranged(rng, slot, [[12, 34], [15, 48], [23, 76], [34, 98]]);
    let b = randInt(rng, 2, 9);
    while (a * b > 9800) b -= 1;
    if (slot === 7) return mulCapstone3(rng, a, b, 'g3w1c:' + a + ':' + b);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story ? mulScene3(rng, a, b) : 'ひっさんの こたえは いくつ？',
      answer: a * b,
      board: { type: 'column-calc', a, b, op: '×' },
      hint1: 'いちの くらいから じゅんに かけて いくよ。',
      hint2: 'くりあがりは うえの くらいの けいさんに たすんだよ。',
      explain: 'くらいごとに かけて ' + a * b + '。ひっさんなら おおきな かけざんも できるね。',
      story,
      learningKey: 'g3w1:' + a + ':' + b,
      math: { kind: 'mul', a, b }
    });
  },

  // ── なん10を かける ──
  g3_mul_by_tens(slot, rng) {
    const a = ranged(rng, slot, [[3, 9], [4, 12], [12, 24], [13, 32]]);
    const bT = randInt(rng, 2, 9);
    const b = bT * 10;
    const story = slot === 4;
    if (a * b > 9600) return this.g3_mul_by_tens(Math.max(0, slot - 2), rng);
    return Q({
      kind: 'keypad',
      prompt: story
        ? '1こ ' + a + 'えんの あめを ' + b + 'こ かう。ぜんぶで いくら？'
        : a + '×' + b + 'は いくつ？',
      answer: a * b,
      board: null,
      hint1: 'まず ' + a + '×' + bT + 'を けいさんしよう。',
      hint2: a + '×' + bT + '＝' + a * bT + '。それを 10ばいするよ。',
      explain: a + '×' + bT + 'の ' + a * bT + 'を 10ばいして ' + a * b + '。0を あとから つけるんだね。',
      story,
      learningKey: 'g3bt:' + a + ':' + b,
      math: { kind: 'mul', a, b }
    });
  },

  // ── 2けた×2けたの ひっさん ──
  g3_mul_written2(slot, rng) {
    const a = ranged(rng, slot, [[12, 24], [13, 32], [21, 48], [26, 76]]);
    let b = randInt(rng, 12, 89);
    while (a * b > 9700) b -= 7;
    if (b < 12) b = 12;
    if (slot === 7) return mulCapstone3(rng, a, b, 'g3w2c:' + a + ':' + b);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story ? mulScene3(rng, a, b) : 'ひっさんの こたえは いくつ？',
      answer: a * b,
      board: { type: 'column-calc', a, b, op: '×' },
      hint1: 'いちの くらいの ぶんと、じゅうの くらいの ぶんを べつべつに かけよう。',
      hint2: a + '×' + (b % 10) + 'と ' + a + '×' + Math.floor(b / 10) * 10 + 'を あわせるよ。',
      explain: 'ぶぶんせきを あわせて ' + a * b + '。2だんの ひっさんに なるんだね。',
      story,
      learningKey: 'g3w2:' + a + ':' + b,
      math: { kind: 'mul', a, b }
    });
  },

  // ── 3けた×2けたと けんとう ──
  g3_mul_big(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const a = randInt(rng, 102, 324);
    let b = randInt(rng, 12, 39);
    while (a * b > 9900) b -= 3;
    if (b < 12) b = 12;
    if (mode === 1 && !story) {
      const approx = Math.round(a / 100) * 100 * Math.round(b / 10) * 10;
      return Q({
        kind: 'keypad',
        prompt: a + '×' + b + 'の こたえの けんとう。だいたい いくつ？',
        answer: approx,
        board: null,
        hint1: a + 'を ちかい なんびゃく、' + b + 'を ちかい なんじゅうに しよう。',
        hint2: Math.round(a / 100) * 100 + '×' + Math.round(b / 10) * 10 + 'を けいさんするよ。',
        explain: 'およそ ' + approx + '。けんとうを つけて おくと、まちがいに きづけるね。',
        story: false,
        learningKey: 'g3bg2:' + a + ':' + b,
        math: { kind: 'mul', a, b }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story ? mulScene3(rng, a, b) : 'ひっさんの こたえは いくつ？',
      answer: a * b,
      board: { type: 'column-calc', a, b, op: '×' },
      hint1: 'いままでの ひっさんと おなじ。だんが ふえるだけだよ。',
      hint2: 'さいごに ぶぶんせきを ぜんぶ あわせよう。',
      explain: 'ぶぶんせきを かさねて ' + a * b + '。けんとうと くらべて たしかめよう。',
      story,
      learningKey: 'g3bg1:' + a + ':' + b,
      math: { kind: 'mul', a, b }
    });
  }
};
