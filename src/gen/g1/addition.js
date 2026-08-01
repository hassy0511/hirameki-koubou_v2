// たしざんライン。あわせる・ふやす・10をつくる。

import { Q, numberOptions, ranged, randInt, pick, thing, actor } from '../util.js';

// 和が max 以下になる2数。どちらも1以上。
function addPair(rng, maxSum, minSum) {
  const sum = randInt(rng, Math.max(2, minSum || 2), maxSum);
  const a = randInt(rng, 1, sum - 1);
  return [a, sum - a, sum];
}

function addScene(rng, a, b) {
  const item = thing(rng);
  const who = actor(rng);
  const other = who === 'トト' ? 'モクモ' : 'トト';
  const scenes = [
    who + 'が ' + item.name + 'を ' + a + 'こ、' + other + 'が ' + b + 'こ もってきた。あわせて いくつ？',
    'はこに ' + item.name + 'が ' + a + 'こ。あとから ' + b + 'こ いれた。ぜんぶで いくつ？',
    'つくえに ' + item.name + 'が ' + a + 'こ ある。' + who + 'が ' + b + 'こ たした。ぜんぶで いくつ？'
  ];
  return { text: pick(rng, scenes), icon: item.icon };
}

const ADD_HINT1 = 'おおきい ほうの かずから、つづきを かぞえよう。';
const ADD_HINT2 = 'まるを ぜんぶ あわせて、1つずつ かぞえなおしても いいよ。';

function addExplain(a, b) {
  return a + 'こと ' + b + 'こを あわせると ' + (a + b) + 'こに なるよ。';
}

export const additionStages = {
  // ── あわせて いくつ(和6まで・準備) ──
  add_ready(slot, rng) {
    const [a, b, sum] = addPair(rng, ranged(rng, slot, [[3, 4], [4, 5], [5, 6], [6, 6]]));
    const story = slot === 4;
    const scene = story ? addScene(rng, a, b) : null;
    return Q({
      kind: 'choice',
      prompt: story ? scene.text : pick(rng, [a + 'こと ' + b + 'こ。あわせると いくつ？', 'ふたつの まとまりを あわせると いくつ？']),
      answer: sum,
      options: numberOptions(rng, sum, [a, b, sum + 1, sum - 1], { min: 1, max: 8 }),
      board: { type: 'two-groups', left: a, right: b, icon: story ? scene.icon : 'dot', merge: true, countable: true },
      hint1: ADD_HINT1,
      hint2: ADD_HINT2,
      explain: addExplain(a, b),
      story,
      learningKey: 'add:' + a + ':' + b,
      math: { kind: 'add', a, b }
    });
  },

  // ── あと いくつ？(補数) ──
  add_bond(slot, rng) {
    const target = pick(rng, slot <= 1 ? [5] : slot <= 4 ? [5, 7] : [7, 10]);
    let known = randInt(rng, 1, target - 1);
    if (known * 2 === target) known = known - 1 >= 1 ? known - 1 : known + 1; // 答え=いまの数 を避ける
    const answer = target - known;
    const story = slot === 4;
    const item = thing(rng);
    const useTap = slot < 2;
    return Q({
      kind: useTap ? 'count-tap' : 'keypad',
      prompt: story
        ? 'かごに ' + item.name + 'を ' + target + 'こ あつめたい。いま ' + known + 'こ。あと いくつ？'
        : pick(rng, [target + 'こに したい。いま ' + known + 'こ。あと いくつ？', 'あわせて ' + target + 'こに する。あと いくつ いれる？']),
      instruction: useTap ? 'いれる かずだけ タップして 「けってい」' : undefined,
      answer,
      board: useTap
        ? { type: 'bond-pool', current: known, supply: Math.max(10, target), icon: 'dot' }
        : { type: 'dots', count: known, icon: story ? item.icon : 'dot', arrange: 'rows', countable: true },
      hint1: known + 'から ' + target + 'まで つづきを かぞえよう。',
      hint2: 'ゆびを おりながら かぞえると わかりやすいよ。',
      explain: known + 'と ' + answer + 'で ' + target + '。あと ' + answer + 'こだね。',
      story,
      learningKey: 'bond:' + target + ':' + known,
      math: { kind: 'bond', target, known }
    });
  },

  // ── あわせると いくつ？(和10まで) ──
  add_combine(slot, rng) {
    const [a, b, sum] = addPair(rng, ranged(rng, slot, [[4, 6], [5, 8], [7, 10], [9, 10]]), 3);
    const story = slot === 4;
    const scene = story ? addScene(rng, a, b) : null;
    return Q({
      kind: 'choice',
      prompt: story ? scene.text : pick(rng, [a + 'こと ' + b + 'こ。あわせると いくつ？', a + 'この まとまりに ' + b + 'こ ふえた。ぜんぶで いくつ？']),
      answer: sum,
      options: numberOptions(rng, sum, [a, b, sum - 1, sum + 1], { min: 1, max: 12 }),
      board: { type: 'two-groups', left: a, right: b, icon: story ? scene.icon : 'dot', merge: true, countable: true },
      hint1: ADD_HINT1,
      hint2: a + 'の つぎから、' + b + 'かい かぞえて みよう。',
      explain: addExplain(a, b),
      story,
      learningKey: 'add:' + a + ':' + b,
      math: { kind: 'add', a, b }
    });
  },

  // ── しきで たしざん(＋と＝) ──
  add_equation(slot, rng) {
    const [a, b, sum] = addPair(rng, ranged(rng, slot, [[3, 5], [5, 8], [7, 10], [9, 10]]), 3);
    const story = slot === 4;
    const scene = story ? addScene(rng, a, b) : null;
    return Q({
      kind: 'keypad',
      prompt: story ? scene.text : 'しきの こたえは いくつ？',
      answer: sum,
      board: story
        ? { type: 'two-groups', left: a, right: b, icon: scene.icon, merge: true, countable: true }
        : { type: 'equation', text: a + '＋' + b + '＝□', dots: [a, b] },
      hint1: a + 'に ' + b + 'を たす しきだよ。',
      hint2: a + 'から つづきを ' + b + 'かい かぞえよう。',
      explain: a + 'こと ' + b + 'こで ' + sum + 'こ。しきでは ' + a + '＋' + b + '＝' + sum + ' と かくよ。',
      story,
      learningKey: 'add:' + a + ':' + b,
      math: { kind: 'add', a, b }
    });
  },

  // ── 10と いくつ ──
  add_ten_ready(slot, rng) {
    const ones = ranged(rng, slot, [[1, 3], [2, 5], [4, 8], [6, 9]]);
    const answer = 10 + ones;
    const story = slot === 4;
    const item = thing(rng);
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'はこに ' + item.name + 'が 10こ。そとに ' + ones + 'こ ある。ぜんぶで いくつ？'
        : pick(rng, ['10と ' + ones + 'で いくつ？', '10の まとまりに ' + ones + 'こ たすと いくつ？']),
      answer,
      board: { type: 'ten-frame-plus', ones, icon: story ? item.icon : 'dot', countable: true },
      hint1: '10は かぞえなおさず、その つづきを かぞえよう。',
      hint2: '10の つぎは 11。そこから ' + (ones - 1) + 'かい すすむよ。',
      explain: '10と ' + ones + 'で ' + answer + '。10の まとまりに ばらを つなげるよ。',
      story,
      learningKey: 'ten+:' + ones,
      math: { kind: 'add', a: 10, b: ones }
    });
  },

  // ── 20までの たしざん(くりあがりなし) ──
  add_teens(slot, rng) {
    const a = 10 + ranged(rng, slot, [[1, 3], [2, 5], [3, 6], [4, 6]]);
    const b = randInt(rng, 1, Math.min(3 + band(slotSafe(slot)), 19 - a > 9 ? 9 : 19 - a));
    const sum = a + b;
    const story = slot === 4;
    const scene = story ? addScene(rng, a, b) : null;
    return Q({
      kind: 'keypad',
      prompt: story ? scene.text : 'しきの こたえは いくつ？',
      answer: sum,
      board: story
        ? { type: 'two-groups', left: a, right: b, icon: scene.icon, merge: true, countable: true }
        : { type: 'equation', text: a + '＋' + b + '＝□' },
      hint1: '10の まとまりは そのまま。ばらだけ たそう。',
      hint2: (a - 10) + 'と ' + b + 'を たして、10と あわせよう。',
      explain: 'ばらの ' + (a - 10) + 'と ' + b + 'で ' + (a - 10 + b) + '。10と あわせて ' + sum + 'だね。',
      story,
      learningKey: 'add:' + a + ':' + b,
      math: { kind: 'add', a, b }
    });
  },

  // ── 3つの かずを たす ──
  add_three(slot, rng) {
    let a, b, c;
    do {
      a = randInt(rng, 1, 5);
      b = randInt(rng, 1, 4);
      c = randInt(rng, 1, 4);
    } while (a + b > 10 || a + b + c > ranged(rng, slot, [[6, 8], [8, 10], [9, 10], [10, 10]]));
    const sum = a + b + c;
    const story = slot === 4;
    const item = thing(rng);
    return Q({
      kind: 'keypad',
      prompt: story
        ? item.name + 'を あさに ' + a + 'こ、ひるに ' + b + 'こ、よるに ' + c + 'こ ひろった。ぜんぶで いくつ？'
        : 'しきの こたえは いくつ？',
      answer: sum,
      board: story
        ? { type: 'three-steps', values: [a, b, c], ops: ['＋', '＋'], icon: item.icon }
        : { type: 'equation', text: a + '＋' + b + '＋' + c + '＝□' },
      hint1: 'ひだりから じゅんに。まず ' + a + '＋' + b + 'を けいさんしよう。',
      hint2: a + '＋' + b + 'は ' + (a + b) + '。そこに ' + c + 'を たそう。',
      explain: a + '＋' + b + 'で ' + (a + b) + '。それに ' + c + 'を たして ' + sum + 'に なるよ。',
      story,
      learningKey: 'add3:' + a + ':' + b + ':' + c,
      math: { kind: 'add3', a, b, c }
    });
  },

  // ── たしざん れんしゅう ──
  add_practice(slot, rng) {
    const carry = slot >= 6;
    let a, b;
    if (carry) {
      a = randInt(rng, 6, 9);
      b = randInt(rng, 11 - a, 9);
    } else {
      [a, b] = addPair(rng, ranged(rng, slot, [[5, 7], [6, 10], [8, 10], [10, 10]]), 4);
    }
    const sum = a + b;
    const story = slot === 4;
    const scene = story ? addScene(rng, a, b) : null;
    return Q({
      kind: 'keypad',
      prompt: story ? scene.text : 'しきの こたえは いくつ？',
      answer: sum,
      board: story
        ? { type: 'two-groups', left: a, right: b, icon: scene.icon, merge: true, countable: true }
        : { type: 'equation', text: a + '＋' + b + '＝□' },
      hint1: ADD_HINT1,
      hint2: carry ? a + 'は あと ' + (10 - a) + 'で 10に なるよ。' : a + 'の つぎから ' + b + 'かい かぞえよう。',
      explain: carry
        ? b + 'を ' + (10 - a) + 'と ' + (b - (10 - a)) + 'に わける。10を つくって ' + sum + 'だね。'
        : addExplain(a, b),
      story,
      learningKey: 'add:' + a + ':' + b,
      math: { kind: 'add', a, b }
    });
  },

  // ── 10を つくって たす(くりあがり) ──
  add_maketen(slot, rng) {
    const a = randInt(rng, 6, 9);
    const b = randInt(rng, 11 - a, 9);
    const need = 10 - a;
    const sum = a + b;
    const story = slot === 4;
    const item = thing(rng);
    const askFinal = slot >= 3 && slot !== 4;
    if (!askFinal && !story) {
      return Q({
        kind: 'keypad',
        prompt: a + '＋' + b + '。まず、' + a + 'を 10に するには あと いくつ？',
        answer: need,
        board: { type: 'make-ten', a, b },
        hint1: a + 'の はこの あきを かぞえよう。',
        hint2: a + 'から 10まで ゆびで かぞえよう。',
        explain: a + 'と ' + need + 'で 10。だから ' + b + 'から ' + need + 'こ うつすよ。',
        learningKey: 'maketen-need:' + a,
        math: { kind: 'bond', target: 10, known: a }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'はこに ' + item.name + 'が ' + a + 'こ。あとから ' + b + 'こ きた。ぜんぶで いくつ？'
        : 'しきの こたえは いくつ？',
      answer: sum,
      board: story
        ? { type: 'two-groups', left: a, right: b, icon: item.icon, merge: true, countable: true }
        : { type: 'equation', text: a + '＋' + b + '＝□', makeTen: true },
      hint1: a + 'は あと ' + need + 'で 10。まず 10を つくろう。',
      hint2: b + 'を ' + need + 'と ' + (b - need) + 'に わけよう。10と ' + (b - need) + 'で いくつかな。',
      explain: b + 'を ' + need + 'と ' + (b - need) + 'に わけて、10を つくる。10と ' + (b - need) + 'で ' + sum + 'だね。',
      story,
      learningKey: 'add:' + a + ':' + b,
      math: { kind: 'add', a, b }
    });
  }
};

function band(slot) {
  if (slot <= 1) return 0;
  if (slot <= 4) return 1;
  if (slot <= 6) return 2;
  return 3;
}

function slotSafe(slot) {
  return Math.max(0, Math.min(7, slot));
}
