// 小3・おおきな かずと ひっさんライン。3・4けたの筆算→暗算→万→一億→数直線→倍率→そろばん。

import { Q, ranged, randInt, pick, thing, actor } from '../util.js';

function g3Scene(rng, add, a, b) {
  const who = actor(rng);
  const texts = add ? [
    'ぶんぼうぐやで ' + a + 'えんの ふでばこと ' + b + 'えんの ペンを かう。あわせて いくら？',
    'きのうまでに ' + a + 'こ、きょう ' + b + 'こ つくった。ぜんぶで いくつ？',
    who + 'の まちの こども ' + a + 'にんと おとな ' + b + 'にん。あわせて なんにん？'
  ] : [
    who + 'は ' + a + 'えん もっていた。' + b + 'えんの ほんを かった。のこりは いくら？',
    'かみが ' + a + 'まい あった。' + b + 'まい つかった。のこりは なんまい？',
    'ぜんぶで ' + a + 'こ。そのうち ' + b + 'こ くばった。のこりは いくつ？'
  ];
  return pick(rng, texts);
}

function capstone(rng, add, a, b, key) {
  return Q({
    kind: 'equation-build',
    prompt: g3Scene(rng, add, a, b),
    answer: add ? a + b : a - b,
    board: { type: 'column-calc', a, b, op: add ? '＋' : '−', hideOp: true },
    hint1: 'ふえる おはなしかな、へる おはなしかな。',
    hint2: 'しきは ' + a + (add ? '＋' : '−') + b + '。ひっさんで たしかめよう。',
    explain: 'しきは ' + a + (add ? '＋' : '−') + b + '。こたえは ' + (add ? a + b : a - b) + 'だね。',
    story: false,
    learningKey: key,
    math: { kind: add ? 'add' : 'sub', a, b }
  });
}

export const g3NumberStages = {
  g3_num_add3(slot, rng) {
    const a = ranged(rng, slot, [[112, 340], [150, 450], [230, 620], [320, 780]]);
    const b = randInt(rng, 101, 999 - a > 101 ? 999 - a : 101);
    if (slot === 7) return capstone(rng, true, a, b, 'g3a3c:' + a + ':' + b);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story ? g3Scene(rng, true, a, b) : 'ひっさんの こたえは いくつ？',
      answer: a + b,
      board: { type: 'column-calc', a, b, op: '＋' },
      hint1: 'いちの くらいから じゅんに たそう。',
      hint2: '10に なったら ひとつ うえの くらいへ くりあげるよ。',
      explain: 'くらいごとに たして ' + (a + b) + '。3けたでも やりかたは おなじだね。',
      story,
      learningKey: 'g3a3:' + a + ':' + b,
      math: { kind: 'add', a, b }
    });
  },

  g3_num_sub3(slot, rng) {
    const a = ranged(rng, slot, [[312, 500], [350, 650], [420, 800], [520, 950]]);
    let b = randInt(rng, 101, a - 101);
    if (a - b === b) b -= 1;
    if (slot === 7) return capstone(rng, false, a, b, 'g3s3c:' + a + ':' + b);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story ? g3Scene(rng, false, a, b) : 'ひっさんの こたえは いくつ？',
      answer: a - b,
      board: { type: 'column-calc', a, b, op: '−' },
      hint1: 'ひけない くらいは、うえの くらいから りょうがえしよう。',
      hint2: '100は 10が 10こ。10は 1が 10こだったね。',
      explain: 'りょうがえしながら ひいて ' + (a - b) + '。けんざんは たしざんで できるよ。',
      story,
      learningKey: 'g3s3:' + a + ':' + b,
      math: { kind: 'sub', a, b }
    });
  },

  g3_num_calc4(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 || story) {
      const a = pick(rng, [1000, 2000, 3000, 5000]);
      const b = randInt(rng, 106, 987);
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'ちょきんが ' + a + 'えん あった。' + b + 'えんの プレゼントを かった。のこりは いくら？'
          : a + '−' + b + 'の こたえは？',
        answer: a - b,
        board: { type: 'column-calc', a, b, op: '−' },
        hint1: '0の くらいは、さらに うえから りょうがえを つなげるよ。',
        hint2: '1000は 999と 1に わけて かんがえても いいね。',
        explain: '0を またいで りょうがえして ' + (a - b) + '。れんぞくの りょうがえが ポイントだね。',
        story,
        learningKey: 'g3c4s:' + a + ':' + b,
        math: { kind: 'sub', a, b }
      });
    }
    const a = randInt(rng, 1234, 4876);
    const b = randInt(rng, 1023, 9800 - a);
    return Q({
      kind: 'keypad',
      prompt: a + '＋' + b + 'の こたえは？',
      answer: a + b,
      board: { type: 'column-calc', a, b, op: '＋' },
      hint1: '4けたでも いちの くらいから じゅんばんは おなじ。',
      hint2: 'くりあがりの 1を わすれずに うえの くらいへ。',
      explain: 'くらいごとに たして ' + (a + b) + '。けたが ふえても こわくないね。',
      story: false,
      learningKey: 'g3c4a:' + a + ':' + b,
      math: { kind: 'add', a, b }
    });
  },

  g3_num_mental(slot, rng) {
    const mode = slot % 3;
    const story = slot === 4;
    if (mode === 0 || story) {
      const a = randInt(rng, 25, 68);
      let b = randInt(rng, 13, 99 - a);
      if (a + b === 100) b -= 1;
      return Q({
        kind: 'keypad',
        prompt: story ? 'おかしやで ' + a + 'えんの グミと ' + b + 'えんの あめを かう。あんざんで いくら？' : a + '＋' + b + 'を あんざんで。いくつ？',
        answer: a + b,
        board: null,
        hint1: 'じゅうの くらいどうし、いちの くらいどうしで たそう。',
        hint2: 'きりの いい かずに して、あとで ちょうせいしても いいよ。',
        explain: 'あんざんで ' + (a + b) + '。くらいに わけると あたまの なかでも けいさんできるね。',
        story,
        learningKey: 'g3me1:' + a + ':' + b,
        math: { kind: 'add', a, b }
      });
    }
    if (mode === 1) {
      const b = randInt(rng, 23, 78);
      return Q({
        kind: 'keypad',
        prompt: '100−' + b + 'を あんざんで。いくつ？',
        answer: 100 - b,
        board: null,
        hint1: b + 'に いくつ たすと 100に なるかで かんがえよう。',
        hint2: 'まず 90まで、つぎに 100までと 2かいに わけても いいよ。',
        explain: '100−' + b + '＝' + (100 - b) + '。100の まとまりは あんざんの みかただね。',
        story: false,
        learningKey: 'g3me2:' + b,
        math: { kind: 'sub', a: 100, b }
      });
    }
    const x = randInt(rng, 140, 480);
    const y = randInt(rng, 120, 390);
    const rounded = Math.round((x + y) / 100) * 100;
    return Q({
      kind: 'keypad',
      prompt: x + '＋' + y + 'の こたえの けんとうを つける。だいたい なんびゃくに なる？',
      answer: rounded,
      board: null,
      hint1: 'それぞれを ちかい なんびゃくに して たそう。',
      hint2: 'けんとうは ぴったりで なくて いい。だいたいで つかむんだよ。',
      explain: 'およそ ' + Math.round(x / 100) * 100 + 'と およそ ' + Math.round(y / 100) * 100 + 'で、だいたい ' + rounded + 'だね。',
      story: false,
      learningKey: 'g3me3:' + x + ':' + y,
      math: { kind: 'add', a: x, b: y }
    });
  },

  g3_num_man(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const man = randInt(rng, 1, 9);
    const sen = randInt(rng, 1, 9);
    if (mode === 0 || story) {
      const n = man * 10000 + sen * 1000;
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'まつりの おきゃくは、1まんにんの かたまりが ' + man + 'つと、1000にんの かたまりが ' + sen + 'つ。ぜんぶで なんにん？'
          : '1まんが ' + man + 'こ、1000が ' + sen + 'この かずは？',
        answer: n,
        board: null,
        hint1: '1まんは 0が 4つ ついた かずだよ。',
        hint2: man + '0000と ' + sen + '000を あわせよう。',
        explain: 'あわせて ' + n + '。まんの くらいは 1000の ひとつ うえだね。',
        story,
        learningKey: 'g3man1:' + man + ':' + sen,
        math: { kind: 'place', n }
      });
    }
    const k = randInt(rng, 2, 9);
    return Q({
      kind: 'keypad',
      prompt: k * 10000 + 'は 1まんが なんこ？',
      answer: k,
      board: { type: 'number-card', value: k * 10000 },
      hint1: 'うしろの 0を 4つ かくして みよう。',
      hint2: 'のこった すうじが 1まんの こすうだよ。',
      explain: k * 10000 + 'は 1まんが ' + k + 'こ。0を 4つ かくすと みえるね。',
      story: false,
      learningKey: 'g3man2:' + k,
      math: { kind: 'place', n: k * 10000 }
    });
  },

  g3_num_oku(slot, rng) {
    const mode = slot === 0 ? 0 : (slot % 2 === 1 ? 1 : 2);
    const story = slot === 4;
    if (mode === 0 && !story) {
      return Q({
        kind: 'choice',
        prompt: '1000まんを 10こ あつめた かずを なんと いう？',
        answer: 'いちおく',
        options: ['いちおく', 'いっせんまん', 'ひゃくまん'],
        board: null,
        hint1: 'まんの つぎに おおきい くらいの なまえだよ。',
        hint2: '10こ あつまると あたらしい くらいに あがるんだったね。',
        explain: '1000まんが 10こで いちおく。0が 8つ ならぶ かずだよ。',
        story: false,
        learningKey: 'g3oku1',
        math: null
      });
    }
    if (mode === 1 || story) {
      const man = randInt(rng, 12, 98) * 10;
      const full = man * 10000;
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'しの じんこうは ' + full + 'にん。なんまんにんと いえる？'
          : full + 'は なんまん？',
        answer: man,
        board: { type: 'number-card', value: full },
        hint1: 'うしろの 0を 4つ かくして よもう。',
        hint2: 'のこった かずが 「なんまん」に なるよ。',
        explain: full + 'は ' + man + 'まん。まんを たんいに すると みじかく いえるね。',
        story,
        learningKey: 'g3oku2:' + man,
        math: { kind: 'place', n: man }
      });
    }
    const k = randInt(rng, 2, 9);
    return Q({
      kind: 'keypad',
      prompt: k + '00まんは 100まんが なんこ？',
      answer: k,
      board: null,
      hint1: '100まんを たんいに して かぞえよう。',
      hint2: 'あたまの すうじが こすうに なって いるよ。',
      explain: k + '00まんは 100まんが ' + k + 'こ。おおきな たばで かぞえると かんたんだね。',
      story: false,
      learningKey: 'g3oku3:' + k,
      math: { kind: 'place', n: k }
    });
  },

  g3_num_line(slot, rng) {
    const step = pick(rng, slot < 3 ? [1000, 2000] : [1000, 5000, 10000]);
    const k = randInt(rng, 1, 9);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'かずの レールを 0から すすんで、やじるしの えきに とまった。えきの かずは？'
        : 'やじるしの めもりの かずは いくつ？',
      answer: step * k,
      board: { type: 'numberline-read', min: 0, max: step * 10, step, at: k },
      hint1: 'まず 1めもりの おおきさを たしかめよう。',
      hint2: '0から ' + step + 'ずつ とびかぞえで すすもう。',
      explain: '1めもりは ' + step + '。' + k + 'こぶんで ' + step * k + 'だね。',
      story,
      learningKey: 'g3line:' + step + ':' + k,
      math: { kind: 'line', step, k }
    });
  },

  g3_num_scale(slot, rng) {
    const mode = slot % 3;
    const story = slot === 4;
    const base = randInt(rng, 12, 96);
    if (mode === 0 || story) {
      const times = pick(rng, [10, 100]);
      return Q({
        kind: 'keypad',
        prompt: story
          ? '1こ ' + base + 'えんの おかしを ' + times + 'こ はこで かう。いくら？'
          : base + 'の ' + times + 'ばいは いくつ？',
        answer: base * times,
        board: null,
        hint1: times === 10 ? '10ばいすると 0が 1つ ふえるよ。' : '100ばいすると 0が 2つ ふえるよ。',
        hint2: 'すうじは そのままで、くらいだけ うえに うごくんだよ。',
        explain: base + 'の ' + times + 'ばいは ' + base * times + '。0の かずに ちゅうもくだね。',
        story,
        learningKey: 'g3sc1:' + base + ':' + times,
        math: { kind: 'scale', base, times }
      });
    }
    if (mode === 1) {
      const n = randInt(rng, 12, 89) * 10;
      return Q({
        kind: 'keypad',
        prompt: n + 'の 10ぶんの1は いくつ？',
        answer: n / 10,
        board: null,
        hint1: '10ぶんの1に すると 0が 1つ へるよ。',
        hint2: '10ばいの ぎゃくの うごきだね。',
        explain: n + 'の 10ぶんの1は ' + n / 10 + '。くらいが 1つ さがったね。',
        story: false,
        learningKey: 'g3sc2:' + n,
        math: { kind: 'scale', base: n, times: 0.1 }
      });
    }
    const b2 = randInt(rng, 13, 87);
    return Q({
      kind: 'keypad',
      prompt: b2 + 'を 1000ばいすると いくつ？',
      answer: b2 * 1000,
      board: null,
      hint1: '1000ばいは 0が 3つ ふえるよ。',
      hint2: '10ばいを 3かい くりかえすのと おなじだね。',
      explain: b2 + 'の 1000ばいは ' + b2 * 1000 + '。0の かずで たしかめよう。',
      story: false,
      learningKey: 'g3sc3:' + b2,
      math: { kind: 'scale', base: b2, times: 1000 }
    });
  },

  g3_num_abacus(slot, rng) {
    const digits = ranged(rng, slot, [[2, 3], [2, 4], [3, 5], [4, 5]]);
    let value = 0;
    for (let i = 0; i < digits; i += 1) value = value * 10 + randInt(rng, i === 0 ? 1 : 0, 9);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'そろばんやさんの けいじばん。そろばんの あらわす かずは いくつ？'
        : 'そろばんの あらわす かずは いくつ？',
      answer: value,
      board: { type: 'abacus', value },
      hint1: 'うえの 5だまが さがって いたら 5だよ。',
      hint2: 'したの 1だまは あがって いる かずだけ かぞえよう。',
      explain: 'くらいごとに 5だまと 1だまを あわせて よむと ' + value + 'だね。',
      story,
      learningKey: 'g3ab:' + value,
      math: { kind: 'place', n: value }
    });
  }
};
