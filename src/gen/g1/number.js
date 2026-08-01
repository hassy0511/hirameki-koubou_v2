// かずライン。数える・くらべる・ならべる・位取り。
// すべて (slot, rng) → question の純関数。

import { Q, numberOptions, ranged, randInt, pick, thing, actor } from '../util.js';

const COUNT_PROMPTS = ['まるは いくつ？', 'まるを かぞえよう。いくつ？', 'ぜんぶで いくつ？'];

function countBoard(rng, n, icon) {
  return { type: 'dots', count: n, icon: icon || 'dot', arrange: pick(rng, ['rows', 'scatter', 'two-color']), countable: true };
}

function countScene(rng, n, icon, name) {
  const who = actor(rng);
  const scenes = [
    who + 'が ' + name + 'を はこに あつめた。ぜんぶで いくつ？',
    'つくえに ' + name + 'が ならんでいる。いくつ ある？',
    who + 'の かごに ' + name + 'が はいっている。いくつ？'
  ];
  return pick(rng, scenes);
}

export const numberStages = {
  // ── 1から5まで: 数えて選ぶ ──
  num_intro5(slot, rng) {
    const n = ranged(rng, slot, [[1, 3], [2, 4], [2, 5], [3, 5]]);
    const item = thing(rng);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: story ? countScene(rng, n, item.icon, item.name) : pick(rng, COUNT_PROMPTS),
      answer: n,
      options: numberOptions(rng, n, [n - 1, n + 1, n + 2], { min: 1, max: 6 }),
      board: countBoard(rng, n, story ? item.icon : 'dot'),
      hint1: 'ひだりから ゆびで おさえて、1、2、と かぞえよう。',
      hint2: 'ひとつ かぞえたら、その まるは もう かぞえないよ。',
      explain: 'かぞえると ' + n + 'こ。すうじの ' + n + ' を えらぶよ。',
      story,
      learningKey: 'count:' + n,
      math: { kind: 'count', n }
    });
  },

  // ── どちらが おおい？: 1対1対応 ──
  num_compare(slot, rng) {
    // 問いは いつも「おおいのは どっち？」。おなじ回も この問いのまま
    // 「おなじ かず」を選ばせる(「どうなっている？」のような ぼやけた問いは使わない)。
    const left = ranged(rng, slot, [[2, 4], [3, 6], [4, 9], [6, 10]]);
    let right;
    const same = slot === 5 && rng() < 0.6;
    if (same) right = left;
    else {
      right = left + pick(rng, [-2, -1, 1, 2]);
      if (right < 1) right = left + 1;
      if (right > 10) right = left - 1;
    }
    const answer = left === right ? 'おなじ かず' : left > right ? 'うえ' : 'した';
    const story = slot === 4;
    const item = thing(rng);
    const prompt = story
      ? 'トトは うえの だん、モクモは したの だんに ' + item.name + 'を ならべた。おおいのは どっち？'
      : pick(rng, ['まるが おおいのは どっち？', 'ならべて くらべよう。おおいのは どっち？']);
    return Q({
      kind: 'choice',
      prompt,
      answer,
      options: ['うえ', 'おなじ かず', 'した'],
      board: {
        type: 'rows-compare',
        rows: [
          { label: 'うえ', count: left, icon: story ? item.icon : 'dot' },
          { label: 'した', count: right, icon: story ? item.icon : 'dot' }
        ],
        countable: true
      },
      hint1: 'うえと したを、ひとつずつ ゆびで あわせて いこう。',
      hint2: 'あまった ほうが おおいよ。あまらなければ おなじ かず。',
      explain: left === right
        ? 'うえも したも ' + left + 'こ。おなじ かずだね。'
        : 'うえは ' + left + 'こ、したは ' + right + 'こ。' + (left > right ? 'うえ' : 'した') + 'が おおいね。',
      story,
      learningKey: 'cmp:' + left + ':' + right,
      math: { kind: 'compare', left, right }
    });
  },

  // ── 5までの かず: 数えて入力 ──
  num_count5(slot, rng) {
    const n = ranged(rng, slot, [[1, 3], [2, 5], [2, 5], [3, 5]]);
    const item = thing(rng);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story ? countScene(rng, n, item.icon, item.name) : pick(rng, COUNT_PROMPTS),
      answer: n,
      board: countBoard(rng, n, story ? item.icon : 'dot'),
      hint1: 'ゆびで おさえながら 1こずつ かぞえよう。',
      hint2: 'さいごに かぞえた すうじが、ぜんぶの かずだよ。',
      explain: 'ぜんぶで ' + n + 'こ。すうじで ' + n + ' と かくよ。',
      story,
      learningKey: 'count:' + n,
      math: { kind: 'count', n }
    });
  },

  // ── 10までの かず ──
  num_count10(slot, rng) {
    const n = ranged(rng, slot, [[5, 7], [6, 8], [6, 10], [9, 10]]);
    const item = thing(rng);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story ? countScene(rng, n, item.icon, item.name) : pick(rng, COUNT_PROMPTS),
      answer: n,
      board: countBoard(rng, n, story ? item.icon : 'dot'),
      hint1: '5この まとまりを さきに みつけると はやいよ。',
      hint2: '5この れつと、のこりを あわせて かぞえよう。',
      explain: '5と ' + (n - 5) + 'で ' + n + 'こだね。',
      story,
      learningKey: 'count:' + n,
      math: { kind: 'count', n }
    });
  },

  // ── 0と かずわけ: あといくつ ──
  num_bond(slot, rng) {
    const target = ranged(rng, slot, [[5, 5], [5, 7], [7, 10], [10, 10]]);
    let known = randInt(rng, 1, target - 1);
    if (known * 2 === target) known = Math.max(1, known - 1); // 答え=いまの数 を避ける
    if (slot === 6) known = target; // 0を学ぶ問い: もう いっぱい
    const answer = target - known;
    const story = slot === 4;
    const item = thing(rng);
    const useTap = answer > 0 && slot < 4;
    const prompt = story
      ? 'はこには ' + item.name + 'が ' + target + 'こ はいる。いま ' + known + 'こ。あと いくつ はいる？'
      : 'あわせて ' + target + 'こに したい。いま ' + known + 'こ ある。あと いくつ？';
    return Q({
      kind: useTap ? 'count-tap' : 'keypad',
      prompt,
      instruction: useTap ? 'いれる かずだけ タップして 「けってい」' : undefined,
      answer,
      board: useTap
        ? { type: 'bond-pool', current: known, supply: Math.max(10, target), icon: 'dot' }
        : { type: 'dots', count: known, icon: story ? item.icon : 'dot', arrange: 'rows', countable: true },
      hint1: known + 'から ' + target + 'まで、ゆびで 1つずつ かぞえて みよう。',
      hint2: 'かぞえた かいすうが こたえだよ。',
      explain: answer === 0
        ? 'もう ' + target + 'こ ある。だから あと 0こ。なにも ないことも 0で あらわすよ。'
        : known + 'と ' + answer + 'で ' + target + '。あと ' + answer + 'こだね。',
      story,
      learningKey: 'bond:' + target + ':' + known,
      math: { kind: 'bond', target, known }
    });
  },

  // ── かずの じゅんばん: ならびの あな埋め ──
  num_order(slot, rng) {
    const start = ranged(rng, slot, [[1, 3], [2, 6], [4, 9], [8, 12]]);
    const seq = [start, start + 1, start + 2, start + 3];
    const holeAt = randInt(rng, 1, 2);
    const answer = seq[holeAt];
    const story = slot === 4;
    const shown = seq.map((v, i) => (i === holeAt ? null : v));
    return Q({
      kind: 'choice',
      prompt: story
        ? 'トトが すうじの ふだを ならべたら、1まい ぬけていた。「？」に はいる かずは？'
        : pick(rng, ['「？」に はいる かずは？', 'ならびの あいている かずは？']),
      answer,
      options: numberOptions(rng, answer, [answer - 1, answer + 1, answer + 2], { min: 1, max: 20 }),
      board: { type: 'sequence', shown },
      hint1: 'ひだりから じゅんに よんでみよう。1ずつ ふえて いるよ。',
      hint2: '「？」の まえの かずに 1を たそう。',
      explain: seq[holeAt - 1] + 'の つぎは ' + answer + '。1ずつ ふえる ならびだね。',
      story,
      learningKey: 'seq:' + start + ':' + holeAt,
      math: { kind: 'sequence', start }
    });
  },

  // ── なんばんめ？: 実際にその場所を指す ──
  num_position(slot, rng) {
    const length = ranged(rng, slot, [[4, 5], [5, 6], [5, 7], [6, 8]]);
    const fromRight = slot % 2 === 1;
    let ordinal = randInt(rng, 2, length - 1);
    if (fromRight && length === ordinal * 2) ordinal = ordinal === 2 ? 3 : ordinal - 1;
    const index = fromRight ? length - ordinal : ordinal - 1;
    const story = slot === 4;
    const icons = [];
    for (let i = 0; i < length; i += 1) icons.push(pick(rng, ['dot', 'bead', 'block', 'button']));
    return Q({
      kind: 'pick-one',
      prompt: story
        ? 'ならんだ なかで、モクモの たからものは ' + (fromRight ? 'みぎ' : 'ひだり') + 'から ' + ordinal + 'ばんめ。それを タップして。'
        : (fromRight ? 'みぎ' : 'ひだり') + 'から ' + ordinal + 'ばんめを タップして。',
      instruction: 'その まるを タップして 「けってい」',
      answer: index,
      task: 'produce',
      board: { type: 'row', items: icons, direction: fromRight ? 'right' : 'left' },
      hint1: (fromRight ? 'みぎ' : 'ひだり') + 'の はしから 1、2、と かぞえよう。',
      hint2: 'かぞえながら ゆびを うごかすと まちがえないよ。',
      explain: (fromRight ? 'みぎ' : 'ひだり') + 'から ' + ordinal + 'ばんめは ここだね。',
      story,
      learningKey: 'pos:' + length + ':' + (fromRight ? 'r' : 'l') + ordinal,
      math: { kind: 'ordinal', ordinal }
    });
  },

  // ── 20までの かず: 10といくつ ──
  num_teens(slot, rng) {
    const ones = ranged(rng, slot, [[1, 3], [2, 6], [4, 9], [7, 9]]);
    const answer = 10 + ones;
    const story = slot === 4;
    const item = thing(rng);
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'はこに ' + item.name + 'が 10こ、そとに ばらが ある。ぜんぶで いくつ？'
        : pick(rng, ['10の まとまりと ばら。ぜんぶで いくつ？', '10と ばらを あわせると いくつ？']),
      answer,
      board: { type: 'ten-frame-plus', ones, icon: story ? item.icon : 'dot', countable: true },
      hint1: '10の まとまりは かぞえなおさなくて いいよ。',
      hint2: '10、11、12、と ばらの ぶんだけ つづきを かぞえよう。',
      explain: '10と ' + ones + 'で ' + answer + '。じゅう' + 'の つぎに ばらを つなげるよ。',
      story,
      learningKey: 'teens:' + ones,
      math: { kind: 'teens', ones }
    });
  },

  // ── 100までの かず: 10のたばと ばら ──
  num_place(slot, rng) {
    const tens = ranged(rng, slot, [[2, 3], [2, 5], [4, 8], [6, 9]]);
    const ones = randInt(rng, 1, 9);
    const answer = tens * 10 + ones;
    const story = slot === 4;
    const flipped = ones * 10 + tens;
    const misconceptions = [flipped !== answer ? flipped : answer + 10, (tens + 1) * 10 + ones, (tens - 1) * 10 + ones, tens + ones];
    return Q({
      kind: 'choice',
      prompt: story
        ? 'トトが 10ぼんずつ たばねた ぼうと、ばらの ぼうを かぞえている。ぜんぶで いくつ？'
        : pick(rng, ['10の たばと ばら。ぜんぶで いくつ？', 'たばと ばらを あわせると いくつ？']),
      answer,
      options: numberOptions(rng, answer, misconceptions, { min: 10, max: 100 }),
      board: { type: 'place-value', tens, ones, countable: true },
      hint1: '10の たばを かぞえて、10、20、30、と いって みよう。',
      hint2: 'たばの かずの つづきに、ばらを たして いこう。',
      explain: '10の たばが ' + tens + 'こで ' + tens * 10 + '。ばらが ' + ones + 'こで ' + answer + 'だね。',
      story,
      learningKey: 'place:' + tens + ':' + ones,
      math: { kind: 'place', tens, ones }
    });
  }
};
