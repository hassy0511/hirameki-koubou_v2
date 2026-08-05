// しらべるライン。なかまわけ・グラフ・おはなしとしき。

import { Q, numberOptions, ranged, randInt, pick, shuffle, thing, actor } from '../util.js';

const CARD_SETS = [
  { label: 'たべもの', items: [
    { name: 'りんご', icon: 'apple' }, { name: 'パン', icon: 'bread' },
    { name: 'みかん', icon: 'orange' }, { name: 'おにぎり', icon: 'rice-ball' },
    { name: 'バナナ', icon: 'banana' }, { name: 'いちご', icon: 'strawberry' }
  ] },
  { label: 'どうぶつ', items: [
    { name: 'うさぎ', icon: 'rabbit' }, { name: 'ねこ', icon: 'cat' },
    { name: 'いぬ', icon: 'dog' }, { name: 'ことり', icon: 'bird' },
    { name: 'きんぎょ', icon: 'goldfish' }, { name: 'りす', icon: 'squirrel' }
  ] },
  { label: 'どうぐ', items: [
    { name: 'はさみ', icon: 'scissors' }, { name: 'えんぴつ', icon: 'pencil' },
    { name: 'けしゴム', icon: 'eraser' }, { name: 'じょうぎ', icon: 'ruler' },
    { name: 'ふで', icon: 'brush' }, { name: 'クレヨン', icon: 'crayon' }
  ] }
];

const FRUIT = [
  { label: 'りんご', icon: 'apple' },
  { label: 'みかん', icon: 'orange' },
  { label: 'ぶどう', icon: 'grape' },
  { label: 'いちご', icon: 'strawberry' }
];

function graphColumns(rng, maxCount) {
  const chosen = shuffle(rng, FRUIT).slice(0, 3);
  const counts = [];
  while (counts.length < 3) {
    const c = randInt(rng, 1, maxCount);
    if (!counts.includes(c)) counts.push(c);
  }
  return chosen.map((f, i) => ({ label: f.label, icon: f.icon, count: counts[i] }));
}

function storyNumbers(rng, slot, add) {
  if (add) {
    const a = ranged(rng, slot, [[2, 4], [3, 6], [4, 8], [5, 9]]);
    const b = randInt(rng, 1, Math.min(9 - Math.min(a, 8), 5) < 1 ? 1 : Math.min(10 - a, 5));
    return [a, Math.max(1, b)];
  }
  const a = ranged(rng, slot, [[3, 5], [4, 7], [5, 9], [6, 10]]);
  let b = randInt(rng, 1, a - 1);
  if (a - b === b) b = Math.max(1, b - 1);
  return [a, b];
}

// 文と動詞をペアで返す。盤面は この動詞で「あげた 1こ」のように群に名前を付ける
// (「→へる」の隣に1こだけ置くと「1こに なる」と誤読される、を防ぐ)。
function tale(rng, item, who, add, a, b) {
  const forms = add ? [
    { text: 'はこに ' + item + 'が ' + a + 'こ。' + who + 'が ' + b + 'こ いれた。', verb: 'いれた' },
    { text: who + 'は ' + item + 'を ' + a + 'こ もっていた。' + b + 'こ もらった。', verb: 'もらった' },
    { text: 'つくえに ' + item + 'が ' + a + 'こ。あとから ' + b + 'こ ふえた。', verb: 'ふえた' }
  ] : [
    { text: 'はこに ' + item + 'が ' + a + 'こ。' + who + 'が ' + b + 'こ つかった。', verb: 'つかった' },
    { text: who + 'は ' + item + 'を ' + a + 'こ もっていた。' + b + 'こ あげた。', verb: 'あげた' },
    { text: 'かごに ' + item + 'が ' + a + 'こ。' + b + 'こ とりだした。', verb: 'とりだした' }
  ];
  return pick(rng, forms);
}

export const solveStages = {
  // ── なかまわけ ──
  sol_sort(slot, rng) {
    const set = pick(rng, CARD_SETS);
    const item = pick(rng, set.items);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: story
        ? 'カードの かたづけ。「' + item.name + '」の カードは どの なかまの はこに いれる？'
        : '「' + item.name + '」は どの なかま？',
      answer: set.label,
      options: CARD_SETS.map(s => s.label),
      board: { type: 'object-card', label: item.name, icon: item.icon },
      hint1: 'たべられるかな。いきものかな。つかう ものかな。',
      hint2: 'おなじ なかまの ものを おもいうかべよう。',
      explain: '「' + item.name + '」は ' + set.label + 'の なかまだね。',
      story,
      learningKey: 'sort:' + item.name,
      math: null
    });
  },

  // ── ならべて くらべる ──
  sol_line(slot, rng) {
    const columns = graphColumns(rng, ranged(rng, slot, [[4, 5], [5, 7], [6, 9], [8, 10]]));
    const most = slot % 2 === 0;
    const target = columns.reduce((best, c) => (most ? c.count > best.count : c.count < best.count) ? c : best, columns[0]);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: story
        ? 'みんなで ひろった くだものを、しゅるいごとに 1れつに ならべた。いちばん おおいのは どれ？'
        : '1れつに ならべて くらべよう。いちばん ' + (most ? 'おおい' : 'すくない') + 'のは どれ？',
      answer: target.label,
      options: columns.map(c => c.label),
      board: { type: 'rows-compare', rows: columns },
      hint1: 'れつの ながさを くらべれば いいんだね。',
      hint2: 'れつの さきっぽを よこに みくらべよう。',
      explain: target.label + 'の れつが いちばん ' + (most ? 'ながい。かずも いちばん おおいね。' : 'みじかい。かずも いちばん すくないね。'),
      story,
      learningKey: 'line:' + columns.map(c => c.count).join(':') + (most ? 'M' : 'm'),
      math: null
    });
  },

  // ── えグラフを つくる ──
  sol_graph_make(slot, rng) {
    const fruit = pick(rng, FRUIT);
    const n = ranged(rng, slot, [[2, 3], [3, 5], [4, 7], [6, 8]]);
    const story = slot === 4;
    return Q({
      kind: 'count-tap',
      prompt: story
        ? 'きょう ひろった ' + fruit.label + 'は ' + n + 'こ。グラフに ' + n + 'こぶん ぬろう。'
        : fruit.label + 'が ' + n + 'こ ある。グラフに ' + n + 'こぶん ぬろう。',
      instruction: 'したから じゅんに タップして 「けってい」',
      answer: n,
      task: 'produce',
      board: { type: 'graph-make', label: fruit.label, icon: fruit.icon, supply: 10 },
      hint1: 'したから 1マスずつ、かぞえながら ぬろう。',
      hint2: 'ぬった かずと ' + fruit.label + 'の かずが おなじに なれば いいよ。',
      explain: n + 'こぶん ぬれたね。グラフは したから つみあげるよ。',
      story,
      learningKey: 'gmake:' + n,
      math: { kind: 'count', n }
    });
  },

  // ── グラフを よむ ──
  sol_graph_read(slot, rng) {
    const columns = graphColumns(rng, ranged(rng, slot, [[4, 5], [5, 7], [6, 9], [8, 10]]));
    const mode = slot <= 1 ? 'most' : pick(rng, ['most', 'least', 'howmany', 'diff']);
    const story = slot === 4;
    const sorted = columns.slice().sort((a, b) => b.count - a.count);
    if (mode === 'most' || mode === 'least') {
      const target = mode === 'most' ? sorted[0] : sorted[sorted.length - 1];
      return Q({
        kind: 'choice',
        prompt: story
          ? 'しゅうかくの グラフが できた。いちばん ' + (mode === 'most' ? 'おおい' : 'すくない') + 'のは どれ？'
          : 'グラフで いちばん ' + (mode === 'most' ? 'おおい' : 'すくない') + 'のは どれ？',
        answer: target.label,
        options: columns.map(c => c.label),
        board: { type: 'pictograph', columns },
        hint1: 'グラフの たかさを くらべよう。',
        hint2: 'いちばん ' + (mode === 'most' ? 'たかい' : 'ひくい') + ' れつを さがそう。',
        explain: target.label + 'は ' + target.count + 'こで いちばん ' + (mode === 'most' ? 'おおい' : 'すくない') + 'ね。',
        story,
        learningKey: 'gread:' + mode + ':' + columns.map(c => c.count).join(':'),
        math: null
      });
    }
    if (mode === 'howmany') {
      const target = pick(rng, columns);
      return Q({
        kind: 'choice',
        prompt: story ? 'グラフを みて。' + target.label + 'は なんこ あった？' : 'グラフで ' + target.label + 'は なんこ？',
        answer: target.count,
        options: numberOptions(rng, target.count, columns.map(c => c.count).filter(c => c !== target.count), { min: 1, max: 12 }),
        board: { type: 'pictograph', columns },
        hint1: target.label + 'の れつを したから かぞえよう。',
        hint2: 'マスの かずが そのまま こたえだよ。',
        explain: target.label + 'の れつは ' + target.count + 'マス。だから ' + target.count + 'こだね。',
        story,
        learningKey: 'gread:n:' + target.label + target.count,
        math: null
      });
    }
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const diff = top.count - bottom.count;
    return Q({
      kind: 'choice',
      prompt: story
        ? 'グラフを みて。' + top.label + 'は ' + bottom.label + 'より なんこ おおい？'
        : top.label + 'は ' + bottom.label + 'より なんこ おおい？',
      answer: diff,
      options: numberOptions(rng, diff, [top.count, bottom.count, diff + 1], { min: 1, max: 12 }),
      board: { type: 'pictograph', columns },
      hint1: 'ふたつの れつの たかさの ちがいを みよう。',
      hint2: 'とびだしている ぶぶんの マスを かぞえよう。',
      explain: top.count + 'と ' + bottom.count + 'の ちがいは ' + diff + '。とびだした ぶんが ちがいだよ。',
      story,
      learningKey: 'gread:diff:' + top.count + ':' + bottom.count,
      math: { kind: 'sub', a: top.count, b: bottom.count }
    });
  },

  // ── たすのかな ひくのかな ──
  sol_op(slot, rng) {
    const add = rng() < 0.5;
    const [a, b] = storyNumbers(rng, slot, add);
    const item = thing(rng);
    const who = actor(rng);
    const taleOf = tale(rng, item.name, who, add, a, b);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: taleOf.text + ' つかう けいさんは どっち？',
      answer: add ? 'たしざん' : 'ひきざん',
      options: ['たしざん', 'ひきざん'],
      board: { type: 'story-strip', a, b, add, icon: item.icon, verb: taleOf.verb },
      hint1: add ? 'ふえたのかな、へったのかな。' : 'ふえたのかな、へったのかな。よく よもう。',
      hint2: add ? '「いれた」「もらった」「ふえた」は たしざんだよ。' : '「つかった」「あげた」「とりだした」は ひきざんだよ。',
      explain: add
        ? 'かずが ふえる おはなしだから、たしざんを つかうよ。'
        : 'かずが へる おはなしだから、ひきざんを つかうよ。',
      story,
      learningKey: 'op:' + (add ? 'a' : 's') + ':' + a + ':' + b,
      math: { kind: add ? 'add' : 'sub', a, b }
    });
  },

  // ── おはなしに あう しき ──
  sol_expr(slot, rng) {
    const add = rng() < 0.5;
    const [a, b] = storyNumbers(rng, slot, add);
    const item = thing(rng);
    const who = actor(rng);
    const taleOf = tale(rng, item.name, who, add, a, b);
    const story = slot === 4;
    const correct = a + (add ? '＋' : '−') + b;
    const optionSet = new Set([correct, a + (add ? '−' : '＋') + b]);
    if (add || a !== b) optionSet.add(b <= a ? a + (add ? '＋' : '−') + Math.max(1, b - 1) : correct);
    optionSet.add((a + 1) + (add ? '＋' : '−') + b);
    const options = shuffle(rng, Array.from(optionSet).filter(expr => {
      const m = expr.match(/^([0-9]+)−([0-9]+)$/);
      return !m || Number(m[1]) >= Number(m[2]);
    }).slice(0, 3));
    if (!options.includes(correct)) options[0] = correct;
    return Q({
      kind: 'choice',
      prompt: taleOf.text + ' あう しきは どれ？',
      answer: correct,
      options,
      board: { type: 'story-strip', a, b, add, icon: item.icon, verb: taleOf.verb },
      hint1: 'はじめの かずと、' + (add ? 'ふえた' : 'へった') + ' かずを さがそう。',
      hint2: add ? 'ふえる ときは ＋の しきに なるよ。' : 'へる ときは −の しきに なるよ。',
      explain: 'はじめ ' + a + 'こ、' + (add ? b + 'こ ふえた' : b + 'こ へった') + '。だから しきは ' + correct + ' だよ。',
      story,
      learningKey: 'expr:' + correct,
      math: { kind: add ? 'add' : 'sub', a, b }
    });
  },

  // ── おはなしの こたえ ──
  sol_answer(slot, rng) {
    const add = rng() < 0.5;
    const [a, b] = storyNumbers(rng, slot, add);
    const answer = add ? a + b : a - b;
    const item = thing(rng);
    const who = actor(rng);
    const taleOf = tale(rng, item.name, who, add, a, b);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: taleOf.text + (add ? ' ぜんぶで いくつ？' : ' のこりは いくつ？'),
      answer,
      board: { type: 'story-strip', a, b, add, icon: item.icon, verb: taleOf.verb },
      hint1: add ? 'ふえる おはなしだから たしざんだよ。' : 'へる おはなしだから ひきざんだよ。',
      hint2: 'しきに すると ' + a + (add ? '＋' : '−') + b + ' だね。',
      explain: (add ? a + 'こに ' + b + 'こ ふえて ' : a + 'こから ' + b + 'こ へって ') + answer + 'こに なるよ。',
      story,
      learningKey: 'ans:' + (add ? 'a' : 's') + a + ':' + b,
      math: { kind: add ? 'add' : 'sub', a, b }
    });
  },

  // ── えに あう しき ──
  sol_pict_expr(slot, rng) {
    const add = rng() < 0.5;
    const [a, b] = storyNumbers(rng, slot, add);
    const story = slot === 4;
    const correct = a + (add ? '＋' : '−') + b;
    const optionSet = new Set([correct, a + (add ? '−' : '＋') + b, (add ? b + '＋' + (a + 1) : a + '−' + Math.max(1, b - 1))]);
    const options = shuffle(rng, Array.from(optionSet).filter(expr => {
      const m = expr.match(/^([0-9]+)−([0-9]+)$/);
      return !m || Number(m[1]) >= Number(m[2]);
    }).slice(0, 3));
    if (!options.includes(correct)) options[0] = correct;
    return Q({
      kind: 'choice',
      prompt: story ? 'トトが えにっきを かいた。この えに あう しきは どれ？' : 'えに あう しきは どれ？',
      answer: correct,
      options,
      board: { type: 'picture-op', a, b, add },
      hint1: 'はじめに いくつ あって、' + (add ? 'いくつ ふえたかな。' : 'いくつ へったかな。'),
      hint2: add ? 'やじるしで ふえた ぶんが ＋の あとの かずだよ。' : 'うすく なった ぶんが −の あとの かずだよ。',
      explain: 'えは ' + a + 'こから ' + (add ? b + 'こ ふえた' : b + 'こ へった') + ' ようす。しきは ' + correct + ' だね。',
      story,
      learningKey: 'pict:' + correct,
      math: { kind: add ? 'add' : 'sub', a, b }
    });
  },

  // ── おなじ かずずつ ──
  sol_share(slot, rng) {
    let people, per, total;
    let guard = 0;
    do {
      people = ranged(rng, slot, [[2, 2], [2, 3], [3, 4], [4, 5]]);
      per = randInt(rng, 2, 4);
      total = people * per;
      guard += 1;
      // ひとりぶん＝にんずう(4こを2にんで2こ)のような、答えが文の数と重なる組みを避ける
    } while (guard < 20 && (per === people || total > 20));
    if (per === people) per = per === 4 ? 3 : per + 1;
    total = people * per;
    const item = thing(rng);
    const story = slot === 4;
    const askGroups = slot >= 5 && rng() < 0.5;
    if (askGroups) {
      return Q({
        kind: 'keypad',
        prompt: item.name + 'が ' + total + 'こ ある。' + per + 'こずつ ふくろに いれると、ふくろは いくつ できる？',
        answer: people,
        board: { type: 'share-pool', total, per, icon: item.icon },
        hint1: per + 'こずつ まるで かこんで いこう。',
        hint2: 'かこんだ まとまりの かずが こたえだよ。',
        explain: per + 'こずつ わけると ' + people + 'ふくろ できるね。',
        story: false,
        learningKey: 'group:' + total + ':' + per,
        math: { kind: 'share', total, per, people }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story
        ? who(rng) + 'たち ' + people + 'にんで、' + item.name + ' ' + total + 'こを おなじ かずずつ わける。ひとりぶんは いくつ？'
        : item.name + 'が ' + total + 'こ。' + people + 'にんで おなじ かずずつ わけると、ひとりぶんは いくつ？',
      answer: per,
      board: { type: 'share-people', total, people, icon: item.icon },
      hint1: 'ひとりに 1こずつ、じゅんばんに くばって いこう。',
      hint2: 'くばりおわったら、ひとりの まえに いくつ あるか かぞえよう。',
      explain: total + 'こを ' + people + 'にんで わけると、ひとり ' + per + 'こずつに なるよ。',
      story,
      learningKey: 'share:' + total + ':' + people,
      math: { kind: 'share', total, per, people }
    });
  }
};

function who(rng) {
  return pick(rng, ['トト', 'モクモ']);
}
