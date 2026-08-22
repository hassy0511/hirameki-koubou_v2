// 小2・たしひき ひっさんライン。位ごとの計算→繰り上がり/繰り下がり→3けた→くふう→逆算。
// 盤面は ひっさんの形(くらいを そろえた かき方)を見せる。答えの行は見せない。

import { Q, ranged, randInt, pick, thing, actor } from '../util.js';

function calcScene(rng, add, a, b) {
  const item = thing(rng);
  const who = actor(rng);
  const texts = add ? [
    'はこに ' + item.name + 'が ' + a + 'こ。あたらしく ' + b + 'こ とどいた。ぜんぶで いくつ？',
    who + 'は シールを ' + a + 'まい もっていた。' + b + 'まい もらった。ぜんぶで なんまい？',
    'きのう ' + a + 'こ、きょう ' + b + 'こ つくった。あわせて いくつ？'
  ] : [
    'はこに ' + item.name + 'が ' + a + 'こ。' + b + 'こ つかった。のこりは いくつ？',
    who + 'は シールを ' + a + 'まい もっていた。' + b + 'まい あげた。のこりは なんまい？',
    a + 'この うち、' + b + 'こ くばった。のこりは いくつ？'
  ];
  return { text: pick(rng, texts), icon: item.icon };
}

// 8問目: 場面を 自分で しきに して こたえる(D方針)
function calcCapstone(rng, add, a, b, key) {
  const scene = calcScene(rng, add, a, b);
  return Q({
    kind: 'equation-build',
    prompt: scene.text,
    answer: add ? a + b : a - b,
    board: { type: 'column-calc', a, b, op: add ? '＋' : '−', hideOp: true },
    hint1: 'ふえる おはなしかな、へる おはなしかな。',
    hint2: 'しきは ' + a + (add ? '＋' : '−') + b + '。ひっさんで たしかめよう。',
    explain: 'しきは ' + a + (add ? '＋' : '−') + b + '。こたえは ' + (add ? a + b : a - b) + 'に なるね。',
    story: false,
    learningKey: key,
    math: { kind: add ? 'add' : 'sub', a, b }
  });
}

function columnQ(rng, slot, add, a, b, keyPrefix, hints) {
  const story = slot === 4;
  const scene = story ? calcScene(rng, add, a, b) : null;
  const answer = add ? a + b : a - b;
  return Q({
    kind: 'keypad',
    prompt: story ? scene.text : 'ひっさんの こたえは いくつ？',
    answer,
    board: { type: 'column-calc', a, b, op: add ? '＋' : '−' },
    hint1: hints[0],
    hint2: hints[1],
    explain: hints[2](a, b, answer),
    story,
    learningKey: keyPrefix + ':' + a + ':' + b,
    math: { kind: add ? 'add' : 'sub', a, b }
  });
}

export const g2CalcStages = {
  // ── くりあがりなしの 2けたのたしざん ──
  g2_calc_add_nr(slot, rng) {
    const a1 = randInt(rng, 1, 8);
    const a0 = ranged(rng, slot, [[1, 4], [1, 5], [2, 6], [3, 6]]);
    const b1 = randInt(rng, 1, 9 - a1);
    const b0 = randInt(rng, 1, 9 - a0);
    const a = a1 * 10 + a0;
    const b = b1 * 10 + b0;
    if (slot === 7) return calcCapstone(rng, true, a, b, 'g2anr:' + a + ':' + b);
    return columnQ(rng, slot, true, a, b, 'g2anr', [
      'いちの くらいから じゅんに たそう。',
      'いちは ' + a0 + '＋' + b0 + '、じゅうは ' + a1 + '＋' + b1 + 'だよ。',
      (x, y, ans) => 'くらいごとに たすと ' + ans + '。くらいを そろえるのが ひっさんの きほんだね。'
    ]);
  },

  // ── くりあがりの ひっさん ──
  g2_calc_add_r(slot, rng) {
    const a0 = randInt(rng, 4, 9);
    const b0 = randInt(rng, 11 - a0, 9);
    const a1 = ranged(rng, slot, [[1, 3], [1, 5], [2, 6], [3, 7]]);
    const b1 = randInt(rng, 1, 8 - a1);
    const a = a1 * 10 + a0;
    const b = b1 * 10 + b0;
    if (slot === 7) return calcCapstone(rng, true, a, b, 'g2ar:' + a + ':' + b);
    return columnQ(rng, slot, true, a, b, 'g2ar', [
      'いちの くらいの こたえが 10を こえるよ。',
      'いちの 10こぶんを、じゅうの くらいへ 1つ くりあげよう。',
      (x, y, ans) => 'いちが ' + (a0 + b0) + 'に なるから 1 くりあがって ' + ans + '。10こで 1たばだね。'
    ]);
  },

  // ── くりさがりなしの 2けたのひきざん ──
  g2_calc_sub_nr(slot, rng) {
    const a1 = randInt(rng, 2, 9);
    const a0 = ranged(rng, slot, [[3, 6], [3, 8], [4, 9], [5, 9]]);
    const b1 = randInt(rng, 1, a1 - 1);
    const b0 = randInt(rng, 1, a0 - 1);
    const a = a1 * 10 + a0;
    const b = b1 * 10 + b0;
    if (slot === 7) return calcCapstone(rng, false, a, b, 'g2snr:' + a + ':' + b);
    return columnQ(rng, slot, false, a, b, 'g2snr', [
      'いちの くらいから じゅんに ひこう。',
      'いちは ' + a0 + '−' + b0 + '、じゅうは ' + a1 + '−' + b1 + 'だよ。',
      (x, y, ans) => 'くらいごとに ひくと ' + ans + '。たしざんの ひっさんと おなじ ならべかただね。'
    ]);
  },

  // ── くりさがりの ひっさん ──
  g2_calc_sub_r(slot, rng) {
    const a0 = randInt(rng, 1, 5);
    const b0 = randInt(rng, a0 + 1, 9);
    const a1 = ranged(rng, slot, [[2, 4], [2, 6], [3, 8], [4, 9]]);
    const b1 = randInt(rng, 1, a1 - 1);
    const a = a1 * 10 + a0;
    const b = b1 * 10 + b0;
    if (slot === 7) return calcCapstone(rng, false, a, b, 'g2sr:' + a + ':' + b);
    return columnQ(rng, slot, false, a, b, 'g2sr', [
      'いちの くらいが ひけない ときは どう するんだったかな。',
      'じゅうの 1たばを 10こに かえて、いちの くらいへ うつそう。',
      (x, y, ans) => 'じゅうから 1たば かりて ' + (10 + a0) + '−' + b0 + '。こたえは ' + ans + 'だね。'
    ]);
  },

  // ── こたえが 3けたの たしざん ──
  g2_calc_sum3(slot, rng) {
    const a = ranged(rng, slot, [[55, 70], [60, 85], [65, 95], [75, 99]]);
    const b = randInt(rng, 101 - Math.min(a, 99) > 15 ? 101 - a : 15, 99);
    const sum = a + b;
    if (slot === 7) return calcCapstone(rng, true, a, b, 'g2s3:' + a + ':' + b);
    return columnQ(rng, slot, true, a, b, 'g2s3', [
      'じゅうの くらいの こたえが 10を こえるよ。',
      'じゅうの 10たばぶんを、ひゃくの くらいへ くりあげよう。',
      (x, y, ans) => 'ひゃくの くらいに 1が たって ' + ans + '。かずが 3けたに なったね。'
    ]);
  },

  // ── 3けたからの ひきざん ──
  g2_calc_from3(slot, rng) {
    const a = ranged(rng, slot, [[105, 130], [110, 150], [115, 170], [125, 185]]);
    const b = randInt(rng, Math.max(25, a - 99), a - 20);
    if (slot === 7) return calcCapstone(rng, false, a, b, 'g2f3:' + a + ':' + b);
    return columnQ(rng, slot, false, a, b, 'g2f3', [
      'ひゃくの 1たばを じゅうの 10たばに かえられるよ。',
      'ひゃくから りょうがえして、じゅうと いちで ひこう。',
      (x, y, ans) => 'りょうがえして ひくと ' + ans + '。100は 10が 10こだったね。'
    ]);
  },

  // ── かんたんな 3けたの けいさん ──
  g2_calc_simple3(slot, rng) {
    const add = slot % 2 === 0;
    const h = randInt(rng, 1, 8);
    const story = slot === 4;
    if (add) {
      const base = h * 100 + randInt(rng, 1, 8) * 10 + randInt(rng, 0, 3);
      const b = randInt(rng, 1, 6);
      const a = base;
      if (slot === 7) return calcCapstone(rng, true, a, b, 'g2sim:' + a + ':' + b);
      return Q({
        kind: 'keypad',
        prompt: story ? 'ちょきんばこに ' + a + 'えん。おてつだいで ' + b + 'えん ふえた。いくらに なった？' : a + '＋' + b + 'は いくつ？',
        answer: a + b,
        board: { type: 'column-calc', a, b, op: '＋' },
        hint1: 'うごくのは いちの くらいだけだよ。',
        hint2: 'ひゃくと じゅうは そのまま。いちだけ たそう。',
        explain: 'いちの くらいだけ うごいて ' + (a + b) + '。おおきな かずでも かんがえかたは おなじだね。',
        story,
        learningKey: 'g2sim:' + a + ':' + b,
        math: { kind: 'add', a, b }
      });
    }
    const a1 = randInt(rng, 2, 9);
    const a0 = randInt(rng, 4, 9);
    const a = h * 100 + a1 * 10 + a0;
    const b1 = randInt(rng, 1, Math.min(4, a1 - 1));
    const b0 = randInt(rng, 1, a0 - 1);
    const bAdj = b1 * 10 + b0;
    if (slot === 7) return calcCapstone(rng, false, a, bAdj, 'g2sim:' + a + ':' + bAdj);
    return Q({
      kind: 'keypad',
      prompt: story ? 'ひもが ' + a + 'cm ある。' + bAdj + 'cm つかった。のこりは なんcm？' : a + '−' + bAdj + 'は いくつ？',
      answer: a - bAdj,
      board: { type: 'column-calc', a, b: bAdj, op: '−' },
      hint1: 'うごく くらいは どこかな。',
      hint2: 'ひゃくは そのまま。じゅうと いちだけ ひこう。',
      explain: 'うごく くらいだけ ひいて ' + (a - bAdj) + '。ぜんぶの くらいを ひきなおさなくて いいんだね。',
      story,
      learningKey: 'g2sim:' + a + ':' + bAdj,
      math: { kind: 'sub', a, b: bAdj }
    });
  },

  // ── けいさんの くふう ──
  g2_calc_prop(slot, rng) {
    const story = slot === 4;
    const c = pick(rng, [1, 2, 3, 4]) * 10;
    const x = randInt(rng, 3, 9);
    const y = 10 - x;
    const base = randInt(rng, 12, 58);
    const mode = slot % 2;
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'トトは ' + base + 'えん、あめが ' + x + 'えん、ガムが ' + y + 'えん。ぜんぶで いくら？'
          : base + '＋' + x + '＋' + y + 'は いくつ？ じゅんばんを くふうして いいよ。',
        answer: base + 10,
        board: { type: 'three-steps', values: [base, x, y], ops: ['＋', '＋'] },
        hint1: 'あとの ふたつを さきに たすと 10に なるよ。',
        hint2: x + '＋' + y + '＝10。まとまりを さきに つくろう。',
        explain: x + 'と ' + y + 'で 10。だから ' + base + '＋10で ' + (base + 10) + '。まとめると かんたんだね。',
        story,
        learningKey: 'g2prop:' + base + ':' + x,
        math: { kind: 'add', a: base, b: 10 }
      });
    }
    const n = randInt(rng, 15, 48);
    return Q({
      kind: 'keypad',
      prompt: n + '＋' + c + 'を あんざんで。いくつ？',
      answer: n + c,
      board: null,
      hint1: 'じゅうの くらいだけ うごくよ。',
      hint2: 'じゅうの くらいに ' + c / 10 + 'を たそう。',
      explain: 'じゅうの くらいだけ ふえて ' + (n + c) + '。あんざんは くらいで かんがえるんだね。',
      story: false,
      learningKey: 'g2prop2:' + n + ':' + c,
      math: { kind: 'add', a: n, b: c }
    });
  },

  // ── ぎゃくさんと たしかめ ──
  g2_calc_inverse(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const b = ranged(rng, slot, [[11, 25], [12, 35], [15, 45], [20, 55]]);
    let extra = randInt(rng, 12, 44);
    if (extra === b) extra += 1; // 答えが 問題文の かずと 同じに ならないように
    const total = b + extra;
    const hole = total - b;
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'はこに なんこか はいっていた。' + b + 'こ たすと ' + total + 'こに なった。はじめは なんこ？'
          : 'なにかの かずに ' + b + 'を たすと ' + total + '。もとの かずは いくつ？',
        answer: hole,
        board: { type: 'tape-2', top: { label: 'ぜんぶ ' + total + 'こ', value: total }, parts: [{ label: 'はじめ', value: null }, { label: 'たした ' + b + 'こ', value: b }] },
        hint1: 'ぜんぶから わかっている ぶんを とりのぞこう。',
        hint2: total + 'から ' + b + 'を ひけば もとめられるよ。',
        explain: total + '−' + b + 'で ' + hole + '。たしざんの もとは ひきざんで もどせるんだね。',
        story,
        learningKey: 'g2inv:' + total + ':' + b,
        math: { kind: 'sub', a: total, b }
      });
    }
    const taken = randInt(rng, 12, 38);
    const rest = randInt(rng, 15, 49);
    const start = taken + rest;
    return Q({
      kind: 'keypad',
      prompt: 'なんこか あった うち、' + taken + 'こ つかったら のこりが ' + rest + 'こに なった。はじめは なんこ？',
      answer: start,
      board: { type: 'tape-2', top: { label: 'はじめ', value: null }, parts: [{ label: 'つかった ' + taken + 'こ', value: taken }, { label: 'のこり ' + rest + 'こ', value: rest }] },
      hint1: 'つかった ぶんと のこりを あわせると、はじめに もどるよ。',
      hint2: taken + '＋' + rest + 'を けいさんしよう。',
      explain: taken + 'と ' + rest + 'を あわせて ' + start + '。ひきざんの もとは たしざんで もどせるんだね。',
      story: false,
      learningKey: 'g2chk:' + taken + ':' + rest,
      math: { kind: 'add', a: taken, b: rest }
    });
  }
};
