// ひきざんライン。わける・とる・のこりをかんがえる・かずのせんをもどる。

import { Q, numberOptions, ranged, randInt, pick, thing, actor } from '../util.js';

// a−b で b≥1, のこり≥1(0を学ぶステージ以外)。のこり=b の「答えが問題文に出る」形も避ける。
function subPair(rng, maxA, minA) {
  let a, b;
  let guard = 0;
  do {
    a = randInt(rng, Math.max(3, minA || 3), maxA);
    b = randInt(rng, 1, a - 1);
    guard += 1;
  } while (guard < 20 && a - b === b);
  if (a - b === b) b = Math.max(1, b - 1);
  return [a, b, a - b];
}

function subScene(rng, a, b) {
  const item = thing(rng);
  const who = actor(rng);
  const scenes = [
    'はこに ' + item.name + 'が ' + a + 'こ。' + who + 'が ' + b + 'こ つかった。のこりは いくつ？',
    item.name + 'が ' + a + 'こ あった。' + b + 'こ あげた。のこりは いくつ？',
    'かごの ' + item.name + ' ' + a + 'このうち、' + b + 'こ とりだした。のこりは いくつ？'
  ];
  return { text: pick(rng, scenes), icon: item.icon };
}

function subExplain(a, b) {
  return a + 'こから ' + b + 'こ へると、のこりは ' + (a - b) + 'こに なるよ。';
}

export const subtractionStages = {
  // ── かずを わける(かくれた かず) ──
  sub_split(slot, rng) {
    const total = ranged(rng, slot, [[4, 5], [5, 7], [6, 10], [8, 10]]);
    let shown = randInt(rng, 1, total - 1);
    if (total - shown === shown) shown = Math.max(1, shown - 1);
    const answer = total - shown;
    const story = slot === 4;
    const item = thing(rng);
    return Q({
      kind: 'keypad',
      prompt: story
        ? item.name + 'が ぜんぶで ' + total + 'こ。トトの てに ' + shown + 'こ みえている。かくれているのは いくつ？'
        : pick(rng, [total + 'こを ふたつに わけた。みえるのは ' + shown + 'こ。かくれた ほうは いくつ？', 'ぜんぶで ' + total + 'こ。ひらいた トレイに ' + shown + 'こ。もう ひとつの トレイは いくつ？']),
      answer,
      board: { type: 'hidden-split', total, shown, icon: story ? item.icon : 'dot' },
      hint1: shown + 'から ' + total + 'まで、つづきを かぞえよう。',
      hint2: 'ぜんぶの かずから、みえている かずを へらしても いいよ。',
      explain: shown + 'と ' + answer + 'で ' + total + '。かくれているのは ' + answer + 'こだね。',
      story,
      learningKey: 'split:' + total + ':' + shown,
      math: { kind: 'bond', target: total, known: shown }
    });
  },

  // ── のこりは いくつ？(導入2問は とる操作、あとは のこりを答える) ──
  sub_remain(slot, rng) {
    const [a, b, rest] = subPair(rng, ranged(rng, slot, [[4, 6], [5, 8], [7, 10], [9, 10]]));
    const story = slot === 4;
    if (slot < 2) {
      return Q({
        kind: 'remove',
        prompt: a + 'この まるから ' + b + 'こ とろう。',
        answer: b,
        task: 'produce',
        board: { type: 'remove-board', total: a, icon: 'dot' },
        hint1: 'タップした まるは くらく なるよ。1つずつ かぞえながら とろう。',
        hint2: 'とった かずを こえに だして かぞえよう。',
        explain: b + 'こ とると、のこりは ' + rest + 'こに なるね。',
        learningKey: 'take:' + a + ':' + b,
        math: { kind: 'sub', a, b }
      });
    }
    const scene = story ? subScene(rng, a, b) : null;
    return Q({
      kind: 'choice',
      prompt: story ? scene.text : a + 'この まるから ' + b + 'こ とった。のこりは いくつ？',
      answer: rest,
      options: numberOptions(rng, rest, [a, b !== rest ? b : rest + 1, rest + 1, rest - 1], { min: 1, max: 12 }),
      board: { type: 'remove-shown', total: a, removed: b, icon: story ? scene.icon : 'dot', countable: true },
      hint1: 'とった まるは くらく なっている。のこりの あかるい まるを かぞえよう。',
      hint2: a + 'から ' + b + 'を へらすと いくつかな。',
      explain: subExplain(a, b),
      story,
      learningKey: 'sub:' + a + ':' + b,
      math: { kind: 'sub', a, b }
    });
  },

  // ── 0の ひきざん ──
  sub_zero(slot, rng) {
    const a = randInt(rng, 2, 9);
    const mode = slot === 4 ? 'story' : pick(rng, ['none', 'all', 'calc']);
    if (mode === 'story') {
      const item = thing(rng);
      return Q({
        kind: 'choice',
        prompt: item.name + 'が ' + a + 'こ ある。きょうは 1こも つかわなかった。のこりは いくつ？',
        answer: a,
        options: numberOptions(rng, a, [0, a - 1, a + 1], { min: 0, max: 12, allowZero: true }),
        board: { type: 'dots', count: a, icon: item.icon, arrange: 'rows', countable: true },
        hint1: 'つかった かずは 0だよ。',
        hint2: 'なにも へって いないね。かずは かわるかな。',
        explain: '0こ つかったから、なにも かわらない。のこりは ' + a + 'こ。',
        story: true,
        learningKey: 'zero:none:' + a,
        math: { kind: 'sub', a, b: 0 }
      });
    }
    if (mode === 'all') {
      return Q({
        kind: 'choice',
        prompt: 'まるが ' + a + 'こ。ぜんぶ とったら、のこりは いくつ？',
        answer: 0,
        options: numberOptions(rng, 0, [a, 1, a - 1], { min: 0, max: 12, allowZero: true }),
        board: { type: 'dots', count: a, icon: 'dot', arrange: 'rows', countable: true },
        hint1: 'ぜんぶ とったら、なにも のこらないね。',
        hint2: 'なにも ないことを あらわす すうじが あったね。',
        explain: 'ぜんぶ とると なにも ない。のこりは 0だよ。',
        learningKey: 'zero:all:' + a,
        math: { kind: 'sub', a, b: a }
      });
    }
    if (mode === 'none') {
      return Q({
        kind: 'choice',
        prompt: 'まるが ' + a + 'こ。1こも とらなかったら、のこりは いくつ？',
        answer: a,
        options: numberOptions(rng, a, [0, a - 1, a + 1], { min: 0, max: 12, allowZero: true }),
        board: { type: 'dots', count: a, icon: 'dot', arrange: 'rows', countable: true },
        hint1: 'とった かずは 0。なにも へらないよ。',
        hint2: 'まるの かずは そのままだね。',
        explain: '0こ とると かずは かわらない。のこりは ' + a + 'こ。',
        learningKey: 'zero:none:' + a,
        math: { kind: 'sub', a, b: 0 }
      });
    }
    const kind = pick(rng, ['a-0', 'a-a']);
    const answer = kind === 'a-0' ? a : 0;
    return Q({
      kind: 'choice',
      prompt: 'しきの こたえは いくつ？',
      answer,
      options: numberOptions(rng, answer, [kind === 'a-0' ? 0 : a, 1, a - 1], { min: 0, max: 12, allowZero: true }),
      board: { type: 'equation', text: kind === 'a-0' ? a + '−0＝□' : a + '−' + a + '＝□' },
      hint1: kind === 'a-0' ? '0を ひくと、かずは かわらないよ。' : 'おなじ かずを ひくと、なにも のこらないよ。',
      hint2: 'まるを おもいうかべて たしかめよう。',
      explain: kind === 'a-0'
        ? '0を ひいても なにも へらない。こたえは ' + a + 'だよ。'
        : a + 'から ' + a + 'を ひくと なにも ない。こたえは 0だよ。',
      learningKey: 'zero:' + kind + ':' + a,
      math: { kind: 'sub', a, b: kind === 'a-0' ? 0 : a }
    });
  },

  // ── しきで ひきざん ──
  sub_equation(slot, rng) {
    const [a, b, rest] = subPair(rng, ranged(rng, slot, [[4, 6], [5, 8], [7, 10], [9, 10]]));
    const story = slot === 4;
    // おはなしの回は、しきを子どもが自分で作る(FB-03)。ひきざんは a−b の順だけ正解
    if (story) {
      const scene = subScene(rng, a, b);
      return Q({
        kind: 'equation-build',
        prompt: scene.text,
        answer: rest,
        board: { type: 'remove-shown', total: a, removed: b, icon: scene.icon, countable: true },
        hint1: 'ふえる おはなしかな、へる おはなしかな。',
        hint2: 'しきは ' + a + '−' + b + '。のこりも いれよう。',
        explain: subExplain(a, b) + ' しきでは ' + a + '−' + b + '＝' + rest + ' と かくよ。',
        story,
        learningKey: 'sub:' + a + ':' + b,
        math: { kind: 'sub', a, b }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: 'しきの こたえは いくつ？',
      answer: rest,
      board: { type: 'equation', text: a + '−' + b + '＝□', dots: [a, b] },
      hint1: a + 'から ' + b + 'を へらす しきだよ。',
      hint2: a + 'から 1つずつ ' + b + 'かい もどって かぞえよう。',
      explain: subExplain(a, b) + ' しきでは ' + a + '−' + b + '＝' + rest + ' と かくよ。',
      story,
      learningKey: 'sub:' + a + ':' + b,
      math: { kind: 'sub', a, b }
    });
  },

  // ── 20までの ひきざん(くりさがりなし) ──
  sub_teens(slot, rng) {
    const onesA = ranged(rng, slot, [[2, 4], [3, 6], [4, 9], [6, 9]]);
    const a = 10 + onesA;
    let b = randInt(rng, 1, onesA);
    if (a - b === b) b = Math.max(1, b - 1);
    const rest = a - b;
    const story = slot === 4;
    const scene = story ? subScene(rng, a, b) : null;
    return Q({
      kind: 'keypad',
      prompt: story ? scene.text : a + 'こから ' + b + 'こ とった。のこりは いくつ？',
      answer: rest,
      board: story
        ? { type: 'remove-shown', total: a, removed: b, icon: scene.icon, countable: true }
        : { type: 'teen-remove', a, b, countable: true },
      hint1: '10の まとまりは そのまま。ばらから へらそう。',
      hint2: 'ばらの ' + onesA + 'から ' + b + 'を へらして、10と あわせよう。',
      explain: 'ばらの ' + onesA + 'から ' + b + 'を へらすと ' + (onesA - b) + '。10と あわせて ' + rest + 'だね。',
      story,
      learningKey: 'sub:' + a + ':' + b,
      math: { kind: 'sub', a, b }
    });
  },

  // ── 3つの かず ──
  sub_three(slot, rng) {
    let a, b, c, plusLast, mid, answer;
    let guard = 0;
    do {
      a = randInt(rng, 5, 10);
      b = randInt(rng, 1, 4);
      c = randInt(rng, 1, 4);
      plusLast = slot % 2 === 1;
      mid = a - b;
      answer = plusLast ? mid + c : mid - c;
      guard += 1;
    } while (guard < 30 && (mid < 1 || answer < 1 || answer > 12 || answer === a || answer === b || answer === c));
    if (mid < 1 || answer < 1) { a = 8; b = 2; c = 3; plusLast = true; mid = 6; answer = 9; }
    const op2 = plusLast ? '＋' : '−';
    const story = slot === 4;
    const item = thing(rng);
    return Q({
      kind: 'keypad',
      prompt: story
        ? item.name + 'が ' + a + 'こ あった。' + b + 'こ つかい、' + (plusLast ? c + 'こ もらった。' : 'さらに ' + c + 'こ つかった。') + 'いま いくつ？'
        : 'しきの こたえは いくつ？',
      answer,
      board: story
        ? { type: 'three-steps', values: [a, b, c], ops: ['−', op2], icon: item.icon }
        : { type: 'equation', text: a + '−' + b + op2 + c + '＝□' },
      hint1: 'ひだりから じゅんに。まず ' + a + '−' + b + 'を けいさんしよう。',
      hint2: a + '−' + b + 'は ' + mid + '。つぎに ' + mid + op2 + c + 'だよ。',
      explain: a + '−' + b + 'で ' + mid + '。そこ' + (plusLast ? 'に ' + c + 'を たして ' : 'から ' + c + 'を ひいて ') + answer + 'に なるよ。',
      story,
      learningKey: 'sub3:' + a + ':' + b + ':' + c + ':' + op2,
      math: { kind: 'sub3', a, b, c, plusLast }
    });
  },

  // ── 10を つかって ひく(くりさがり) ──
  sub_borrow(slot, rng) {
    const a = randInt(rng, 11, 18);
    const b = randInt(rng, (a % 10) + 1, 9);
    const rest = a - b;
    const story = slot === 4;
    const item = thing(rng);
    const askStep = slot < 3;
    if (askStep) {
      const step = a - 10;
      return Q({
        kind: 'keypad',
        prompt: a + 'は、10と いくつに わけられる？',
        answer: step,
        board: { type: 'teen-remove', a, b: 0, countable: true },
        hint1: '10の まとまりを さきに みつけよう。',
        hint2: '10の まとまりの そとに ある ばらを かぞえよう。',
        explain: a + 'は 10と ' + step + '。ここから 10を つかって ひくよ。',
        learningKey: 'borrow-split:' + a,
        math: { kind: 'teens', ones: step }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story
        ? item.name + 'が ' + a + 'こ あった。' + b + 'こ つかった。のこりは いくつ？'
        : 'しきの こたえは いくつ？',
      answer: rest,
      board: story
        ? { type: 'remove-shown', total: a, removed: b, icon: item.icon, countable: true }
        : { type: 'equation', text: a + '−' + b + '＝□', makeTen: true },
      hint1: 'ばらだけでは たりないね。10の まとまりから ひこう。',
      hint2: '10−' + b + 'は ' + (10 - b) + '。それと ばらの ' + (a - 10) + 'を あわせよう。',
      explain: '10から ' + b + 'を ひいて ' + (10 - b) + '。ばらの ' + (a - 10) + 'と あわせて ' + rest + 'だね。',
      story,
      learningKey: 'sub:' + a + ':' + b,
      math: { kind: 'sub', a, b }
    });
  },

  // ── かずの せんで ひく(実際に歩く) ──
  sub_line(slot, rng) {
    const start = ranged(rng, slot, [[5, 8], [7, 12], [10, 16], [13, 18]]);
    let steps = randInt(rng, 2, Math.min(5, start - 1));
    if (start - steps === steps) steps = Math.max(2, steps - 1);
    const answer = start - steps;
    const story = slot === 4;
    return Q({
      kind: 'numberline',
      prompt: story
        ? 'トトが かずの せんの ' + start + 'に いる。' + steps + 'だけ もどった ばしょへ うごいて。'
        : start + 'から ' + steps + 'だけ もどろう。',
      answer,
      task: 'produce',
      board: { type: 'numberline', min: Math.max(0, answer - 4), max: Math.min(20, start + 2), start },
      hint1: 'ひだりへ 1ずつ、' + steps + 'かい うごくよ。',
      hint2: 'こえに だして かぞえながら もどろう。',
      explain: start + 'から ' + steps + ' もどると ' + answer + '。ひきざんと おなじだね。',
      story,
      learningKey: 'line:' + start + ':' + steps,
      math: { kind: 'sub', a: start, b: steps }
    });
  },

  // ── 100までの ひきざん(なんじゅう と ばら) ──
  sub_tens(slot, rng) {
    const tensMode = slot % 2 === 0;
    const story = slot === 4;
    if (tensMode) {
      const aT = randInt(rng, 3, 9);
      let bT = randInt(rng, 1, aT - 1);
      if (aT - bT === bT) bT = Math.max(1, bT - 1);
      if (story && aT - bT === 1) bT = Math.max(1, bT - 1); // 答え10が「10こいり」と重なる
      if (aT - bT === bT) bT = Math.max(1, bT - 1);
      const a = aT * 10;
      const b = bT * 10;
      const item = thing(rng);
      return Q({
        kind: 'keypad',
        prompt: story
          ? item.name + 'が 10こいりの はこで ' + aT + 'はこ あった。' + bT + 'はこ つかった。のこりは なんこ？'
          : a + 'から ' + b + 'を ひくと いくつ？',
        answer: a - b,
        board: { type: 'place-value', tens: aT, ones: 0, removedTens: bT, countable: true },
        hint1: '10の たばの かずで かんがえよう。',
        hint2: aT + 'たばから ' + bT + 'たば へると、なんたば のこるかな。',
        explain: '10の たばが ' + (aT - bT) + 'たば のこる。だから ' + (a - b) + 'だよ。',
        story,
        learningKey: 'tens:' + a + ':' + b,
        math: { kind: 'sub', a, b }
      });
    }
    const tens = randInt(rng, 2, 9);
    const ones = randInt(rng, 3, 9);
    let b = randInt(rng, 1, ones - 1);
    const a = tens * 10 + ones;
    if (a - b === b) b = Math.max(1, b - 1);
    return Q({
      kind: 'keypad',
      prompt: a + 'から ' + b + 'を ひくと いくつ？',
      answer: a - b,
      board: { type: 'place-value', tens, ones, removedOnes: b, countable: true },
      hint1: '10の たばは そのまま。ばらから ひこう。',
      hint2: 'ばらの ' + ones + 'から ' + b + 'を へらそう。',
      explain: 'ばらが ' + (ones - b) + 'こに なる。10の たばと あわせて ' + (a - b) + 'だね。',
      story: false,
      learningKey: 'tens:' + a + ':' + b,
      math: { kind: 'sub', a, b }
    });
  }
};
