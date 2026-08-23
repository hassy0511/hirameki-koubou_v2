// 小3・わりざんライン。等分除→包含除→式づくり→くくの逆→特別な場合→あまり→場面判断→大きな数→倍。

import { Q, ranged, randInt, pick, thing } from '../util.js';

function kukuPair(rng, slot) {
  const b = randInt(rng, 2, 9);
  let q = ranged(rng, slot, [[2, 4], [2, 6], [3, 8], [4, 9]]);
  if (q === b) q = q === 9 ? 8 : q + 1; // 36÷6=6 のような 答え=わる数 を避ける
  return [b * q, b, q];
}

function divScene(rng, share, a, b) {
  const item = thing(rng);
  return share
    ? pick(rng, [
      item.name + 'が ' + a + 'こ。' + b + 'にんで おなじ かずずつ わけると、ひとり なんこ？',
      a + 'まいの カードを ' + b + 'にんに おなじ かずずつ くばる。ひとり なんまい？'
    ])
    : pick(rng, [
      item.name + 'が ' + a + 'こ。1ふくろに ' + b + 'こずつ いれると、なんふくろ できる？',
      a + 'にんが ' + b + 'にんずつの チームに わかれる。なんチーム できる？'
    ]);
}

export const g3DivStages = {
  // ── おなじ かずずつ わける(等分除) ──
  g3_div_share(slot, rng) {
    const [a, b, q] = kukuPair(rng, slot);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story ? divScene(rng, true, a, b) : a + 'こを ' + b + 'にんで おなじ かずずつ わける。ひとりぶんは なんこ？',
      answer: q,
      board: { type: 'share-people', total: a, people: Math.min(b, 5), icon: 'dot' },
      hint1: '1こずつ じゅんばんに くばって みよう。',
      hint2: b + '×なにが ' + a + 'に なるかで もとめられるよ。',
      explain: a + '÷' + b + '＝' + q + '。ひとりぶんは ' + q + 'こだね。',
      story,
      learningKey: 'g3dsh:' + a + ':' + b,
      math: { kind: 'div', a, b }
    });
  },

  // ── いくつぶんに わける(包含除) ──
  g3_div_pack(slot, rng) {
    const [a, b, q] = kukuPair(rng, slot);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story ? divScene(rng, false, a, b) : a + 'こを ' + b + 'こずつ ふくろに いれる。なんふくろ できる？',
      answer: q,
      board: { type: 'share-pool', total: a, per: b, icon: 'dot' },
      hint1: b + 'こずつ かこんで みよう。',
      hint2: b + 'ずつ とって いくと、なんかい とれるかな。',
      explain: a + '÷' + b + '＝' + q + '。' + b + 'こずつの まとまりが ' + q + 'つ できるね。',
      story,
      learningKey: 'g3dpk:' + a + ':' + b,
      math: { kind: 'div', a, b }
    });
  },

  // ── わりざんの しき(場面→式→こたえ) ──
  g3_div_expr(slot, rng) {
    const [a, b] = kukuPair(rng, slot);
    const story = slot === 4;
    const share = slot % 2 === 0;
    return Q({
      kind: 'equation-build',
      prompt: divScene(rng, share, a, b),
      answer: a / b,
      ops: ['＋', '−', '×', '÷'],
      instruction: 'すうじと けいさんの キーで しきを つくって 「けってい」',
      board: share
        ? { type: 'share-people', total: a, people: Math.min(b, 5), icon: 'dot' }
        : { type: 'share-pool', total: a, per: b, icon: 'dot' },
      hint1: 'おなじ かずずつ わける ときは わりざんだよ。',
      hint2: 'しきは ' + a + '÷' + b + '。こたえも いれよう。',
      explain: 'しきは ' + a + '÷' + b + '。こたえは ' + a / b + 'だね。',
      story,
      learningKey: 'g3dex:' + a + ':' + b,
      math: { kind: 'div', a, b }
    });
  },

  // ── くくで もとめる ──
  g3_div_inverse(slot, rng) {
    const [a, b, q] = kukuPair(rng, slot);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'こたえあわせの じかん。' + a + '÷' + b + 'の こたえは、' + b + 'のだんの くくで もとめよう。いくつ？'
        : a + '÷' + b + 'は いくつ？',
      answer: q,
      board: { type: 'array-grid', rows: b, cols: q },
      hint1: b + '×なにが ' + a + 'に なるかを さがそう。',
      hint2: b + 'のだんを じゅんに いって、' + a + 'で とまろう。',
      explain: b + '×' + q + '＝' + a + '。だから ' + a + '÷' + b + '＝' + q + '。くくの ぎゃくだね。',
      story,
      learningKey: 'g3din:' + a + ':' + b,
      math: { kind: 'div', a, b }
    });
  },

  // ── 0や 1の わりざん ──
  g3_div_special(slot, rng) {
    const mode = slot % 3;
    const story = slot === 4;
    const a = randInt(rng, 2, 9);
    if (mode === 0 && !story) {
      return Q({
        kind: 'keypad',
        prompt: '0÷' + a + 'は いくつ？',
        answer: 0,
        board: null,
        hint1: 'なにも ない ものを わけても、なにも ないままだよ。',
        hint2: 'ひとりぶんは 0こに なるね。',
        explain: '0÷' + a + '＝0。0を わけても 0だね。',
        story: false,
        learningKey: 'g3sp0:' + a,
        math: { kind: 'div', a: 0, b: a }
      });
    }
    if (mode === 1 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'クッキー ' + a + 'こを ' + a + 'にんで わける。ひとり なんこ？'
          : a + '÷' + a + 'は いくつ？',
        answer: 1,
        board: { type: 'share-people', total: a, people: Math.min(a, 5), icon: 'dot' },
        hint1: 'にんずうと おなじ かずを わけると どう なるかな。',
        hint2: 'ひとりに 1こずつで ちょうど なくなるよ。',
        explain: a + '÷' + a + '＝1。おなじ かずで わると 1に なるね。',
        story,
        learningKey: 'g3sp1:' + a,
        math: { kind: 'div', a, b: a }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: a + '÷1は いくつ？',
      answer: a,
      board: null,
      hint1: 'ひとりで ぜんぶ もらうと どう なるかな。',
      hint2: '1で わっても かずは かわらないよ。',
      explain: a + '÷1＝' + a + '。1で わると そのままだね。',
      story: false,
      learningKey: 'g3spa:' + a,
      math: { kind: 'div', a, b: 1 }
    });
  },

  // ── あまりの ある わりざん ──
  g3_div_rem(slot, rng) {
    const b = randInt(rng, 2, 9);
    let q = ranged(rng, slot, [[2, 4], [2, 6], [3, 8], [4, 9]]);
    if (q === b) q = q === 9 ? 8 : q + 1;
    const r = randInt(rng, 1, b - 1);
    const a = b * q + r;
    const story = slot === 4;
    const askRem = slot % 2 === 1;
    if (askRem && !story) {
      return Q({
        kind: 'keypad',
        prompt: a + '÷' + b + 'の あまりは いくつ？',
        answer: r,
        board: { type: 'share-pool', total: a, per: b, icon: 'dot' },
        hint1: b + 'ずつ まとめて、はんぱを みつけよう。',
        hint2: 'あまりは わる かず(' + b + ')より かならず ちいさく なるよ。',
        explain: b + '×' + q + '＝' + b * q + '。' + a + 'との ちがいの ' + r + 'が あまりだね。',
        story: false,
        learningKey: 'g3rm2:' + a + ':' + b,
        math: { kind: 'divrem', a, b }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'いちごが ' + a + 'こ。' + b + 'にんで おなじ かずずつ わけて、あまりは のこして おく。ひとりぶんは なんこ？'
        : a + '÷' + b + 'の こたえ(ひとりぶん)は なんこ？ あまりは のこして いいよ。',
      answer: q,
      board: { type: 'share-people', total: a, people: Math.min(b, 5), icon: 'strawberry' },
      hint1: b + 'のだんで ' + a + 'を こえない いちばん おおきい こたえを さがそう。',
      hint2: b + '×' + q + 'は ' + a + 'を こえない。' + b + '×' + (q + 1) + 'だと こえて しまうよ。',
      explain: b + '×' + q + '＝' + b * q + 'で とまる。ひとりぶんは ' + q + 'こで、あまりが でるね。',
      story,
      learningKey: 'g3rm1:' + a + ':' + b,
      math: { kind: 'divrem', a, b }
    });
  },

  // ── あまりを どう する？ ──
  g3_div_rem_ctx(slot, rng) {
    const b = randInt(rng, 3, 6);
    let q = randInt(rng, 3, 8);
    const r = randInt(rng, 1, b - 1);
    const a = b * q + r;
    const roundUp = slot % 2 === 0;
    const story = slot === 4;
    if (roundUp || story) {
      return Q({
        kind: 'choice',
        prompt: (story ? 'えんそくの じゅんび。' : '') + a + 'にんが ' + b + 'にんのりの くるまに のる。くるまは なんだい いる？',
        answer: (q + 1) + 'だい',
        options: [q + 'だい', (q + 1) + 'だい', (q + 2) + 'だい'],
        board: null,
        hint1: 'あまりの ひとも のらないと いけないよ。',
        hint2: q + 'だいだと ' + r + 'にん のれない。もう 1だい いるね。',
        explain: a + '÷' + b + 'は ' + q + ' あまり ' + r + '。あまりの ぶん 1だい ふやして ' + (q + 1) + 'だいだね。',
        story,
        learningKey: 'g3ctx1:' + a + ':' + b,
        math: { kind: 'divrem', a, b }
      });
    }
    return Q({
      kind: 'choice',
      prompt: 'ケーキが ' + a + 'こ。1はこに ' + b + 'こずつ いれる。' + b + 'こ はいった はこは いくつ できる？',
      answer: q + 'はこ',
      options: [q + 'はこ', (q + 1) + 'はこ', (q - 1) + 'はこ'],
      board: null,
      hint1: 'はんぱの ケーキでは はこは いっぱいに ならないよ。',
      hint2: 'あまりは かぞえに いれないんだね。',
      explain: a + '÷' + b + 'は ' + q + ' あまり ' + r + '。いっぱいの はこは ' + q + 'はこだね。',
      story: false,
      learningKey: 'g3ctx2:' + a + ':' + b,
      math: { kind: 'divrem', a, b }
    });
  },

  // ── おおきな かずの わりざん ──
  g3_div_big(slot, rng) {
    const b = randInt(rng, 2, 4);
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const t = randInt(rng, 2, Math.max(2, Math.floor(9 / b)));
      const a = t * b * 10;
      return Q({
        kind: 'keypad',
        prompt: a + '÷' + b + 'は いくつ？',
        answer: a / b,
        board: { type: 'rod-groups', left: a / 10, right: 0, countable: true },
        hint1: '10の たばで かんがえよう。',
        hint2: a / 10 + 'たばを ' + b + 'つに わけると なんたばかな。',
        explain: '10の たば ' + a / 10 + 'こを わけて ' + a / b / 10 + 'たば。だから ' + a / b + 'だね。',
        story: false,
        learningKey: 'g3bg1:' + a + ':' + b,
        math: { kind: 'div', a, b }
      });
    }
    const tens = randInt(rng, 1, 3) * b;
    const ones = randInt(rng, 1, 3) * b;
    const a = tens * 10 + ones;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'いろがみが ' + a + 'まい。' + b + 'にんで おなじ かずずつ わけると、ひとり なんまい？'
        : a + '÷' + b + 'は いくつ？ じゅうと いちに わけて けいさんしよう。',
      answer: a / b,
      board: null,
      hint1: 'じゅうの ぶぶんと いちの ぶぶんを べつべつに わろう。',
      hint2: tens * 10 + '÷' + b + 'と ' + ones + '÷' + b + 'を あわせるよ。',
      explain: (tens * 10) / b + 'と ' + ones / b + 'を あわせて ' + a / b + '。くらいごとに わけると できるね。',
      story,
      learningKey: 'g3bg2:' + a + ':' + b,
      math: { kind: 'div', a, b }
    });
  },

  // ── なんばいかを もとめる ──
  g3_div_times(slot, rng) {
    const base = randInt(rng, 2, 8);
    let times = randInt(rng, 2, 6);
    if (times === base) times = times === 6 ? 5 : times + 1;
    const total = base * times;
    const story = slot === 4;
    const mode = slot % 2;
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'あおい リボンは ' + total + 'cm、あかい リボンは ' + base + 'cm。あおは あかの なんばい？'
          : total + 'cmは ' + base + 'cmの なんばい？',
        answer: times,
        board: { type: 'times-tape', base, times },
        hint1: base + 'cmの いくつぶんかを かぞえよう。',
        hint2: total + '÷' + base + 'で もとめられるよ。',
        explain: total + '÷' + base + '＝' + times + '。' + times + 'ばいだね。',
        story,
        learningKey: 'g3tim1:' + base + ':' + times,
        math: { kind: 'div', a: total, b: base }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: 'なにかの ながさの ' + times + 'ばいが ' + total + 'cm。もとの ながさは なんcm？',
      answer: base,
      board: { type: 'times-tape', base, times },
      hint1: 'もとの ながさを □と すると、□×' + times + '＝' + total + 'だよ。',
      hint2: total + '÷' + times + 'で もとめられるね。',
      explain: total + '÷' + times + '＝' + base + '。もとの ながさは ' + base + 'cmだね。',
      story: false,
      learningKey: 'g3tim2:' + base + ':' + times,
      math: { kind: 'div', a: total, b: times }
    });
  }
};
