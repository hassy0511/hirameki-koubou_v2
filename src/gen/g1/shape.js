// かたちライン。立体・面・いろいた・てん・いち。
// 盤面には正解の語を出さない。物の名前にも かたちの語を入れない。

import { Q, ranged, randInt, pick, shuffle } from '../util.js';

// face は教科書の慣例に合わせて1立体1語にする(はこ→ながしかく、さいころ→ましかく)。
// 2つの立体が同じ face を持つと「あと→かたち」問題の正解が2つになってしまう。
const SOLIDS = [
  { name: 'はこの かたち', key: 'box', face: 'ながしかく' },
  { name: 'さいころの かたち', key: 'cube', face: 'ましかく' },
  { name: 'つつの かたち', key: 'tube', face: 'まる' },
  { name: 'ボールの かたち', key: 'ball', face: null }
];

// 物の名前に かたちの語(はこ・つつ・ボール・まる・しかく)を含めない
const OBJECTS = [
  { name: 'ティッシュの ケース', solid: 'box', icon: 'tissue-case' },
  { name: 'おかしの パッケージ', solid: 'box', icon: 'snack-package' },
  { name: 'ずかん', solid: 'box', icon: 'picture-book' },
  { name: 'けしゴム', solid: 'box', icon: 'eraser' },
  { name: 'サイコロ', solid: 'cube', icon: 'die' },
  { name: 'つみき', solid: 'cube', icon: 'block' },
  { name: 'ラップの しん', solid: 'tube', icon: 'wrap-core' },
  { name: 'ジュースの かん', solid: 'tube', icon: 'juice-can' },
  { name: 'えんぴつたて', solid: 'tube', icon: 'pencil-cup' },
  { name: 'テニスの たま', solid: 'ball', icon: 'tennis-ball' },
  { name: 'ビーだま', solid: 'ball', icon: 'marble' },
  { name: 'オレンジ', solid: 'ball', icon: 'orange' }
];

const ROLL_CASES = [
  { name: 'ジュースの かん', answer: 'ころがる し つめる', solid: 'tube' },
  { name: 'ラップの しん', answer: 'ころがる し つめる', solid: 'tube' },
  { name: 'テニスの たま', answer: 'ころがる', solid: 'ball' },
  { name: 'ビーだま', answer: 'ころがる', solid: 'ball' },
  { name: 'つみき', answer: 'つめる', solid: 'cube' },
  { name: 'ティッシュの ケース', answer: 'つめる', solid: 'box' },
  { name: 'ずかん', answer: 'つめる', solid: 'box' },
  { name: 'オレンジ', answer: 'ころがる', solid: 'ball' }
];

// ぼうの かたち。segments が そのまま画面に描かれるので、本数が絵とずれることはない。
export const STICK_FIGURES = [
  { name: 'さんかく', key: 'triangle', segments: [[0, 2, 2, 2], [0, 2, 1, 0], [1, 0, 2, 2]] },
  { name: 'しかく', key: 'square', segments: [[0, 0, 2, 0], [2, 0, 2, 2], [2, 2, 0, 2], [0, 2, 0, 0]] },
  { name: 'おうち', key: 'house', segments: [[0, 1, 2, 1], [0, 1, 1, 0], [1, 0, 2, 1], [2, 1, 2, 2.6], [2, 2.6, 0, 2.6], [0, 2.6, 0, 1]] },
  { name: 'ろっかく', key: 'hex', segments: [[0.5, 0, 1.5, 0], [1.5, 0, 2, 1], [2, 1, 1.5, 2], [1.5, 2, 0.5, 2], [0.5, 2, 0, 1], [0, 1, 0.5, 0]] },
  { name: 'ふたつ ならんだ しかく', key: 'twin', segments: [[0, 0, 1.2, 0], [1.2, 0, 2.4, 0], [0, 2, 1.2, 2], [1.2, 2, 2.4, 2], [0, 0, 0, 2], [1.2, 0, 1.2, 2], [2.4, 0, 2.4, 2]] }
].map(f => Object.assign(f, { sticks: f.segments.length }));

// 3×3 の いろいた パターン(答えのマス番号)
const TILE_PATTERNS = [
  [0, 1, 3], [1, 3, 4], [0, 4, 8], [2, 4, 6], [0, 1, 4, 5], [3, 4, 5, 7], [0, 2, 4], [1, 4, 7],
  [0, 3, 6, 7], [2, 5, 7, 8], [1, 2, 4], [0, 1, 2, 4]
];

export const shapeStages = {
  // ── にている かたち ──
  shp_match(slot, rng) {
    const object = pick(rng, OBJECTS);
    const solid = SOLIDS.find(s => s.key === object.solid);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: story
        ? 'モクモが へやで「' + object.name + '」を みつけた。にている かたちは どれ？'
        : pick(rng, ['「' + object.name + '」に にている かたちは どれ？', '「' + object.name + '」と おなじ なかまの かたちは どれ？']),
      answer: solid.name,
      options: SOLIDS.map(s => s.name),
      board: { type: 'object-card', label: object.name, icon: object.icon },
      hint1: 'かどが あるかな。まるい ところが あるかな。',
      hint2: 'ころがして みた ようすを おもいうかべよう。',
      explain: '「' + object.name + '」は ' + solid.name + 'の なかまだよ。',
      story,
      learningKey: 'match:' + object.name,
      math: null
    });
  },

  // ── ころがる？ つめる？ ──
  shp_roll(slot, rng) {
    const item = pick(rng, ROLL_CASES);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: story
        ? 'トトが 「' + item.name + '」を はこに しまおうと している。この かたちは どうなる？'
        : pick(rng, ['「' + item.name + '」は、ころがる？ つめる？ それとも どちらも？', '「' + item.name + '」の うごきかたは どれ？ ころがる？ つめる？ どちらも？']),
      answer: item.answer,
      options: ['ころがる', 'つめる', 'ころがる し つめる'],
      board: { type: 'solid', solid: item.solid, label: item.name },
      hint1: 'まるい めんが あると ころがるよ。',
      hint2: 'たいらな めんが あると、かさねて つめるよ。',
      explain: '「' + item.name + '」は ' + item.answer + '。めんの かたちで きまるんだね。',
      story,
      learningKey: 'roll:' + item.name,
      math: null
    });
  },

  // ── かたちで なかまわけ ──
  shp_sort(slot, rng) {
    const object = pick(rng, OBJECTS);
    const groups = { box: 'はこの なかま', cube: 'さいころの なかま', tube: 'つつの なかま', ball: 'ボールの なかま' };
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: story
        ? 'かたづけの じかん。「' + object.name + '」は どの たなに いれる？'
        : pick(rng, ['「' + object.name + '」は どの なかま？', '「' + object.name + '」を しまう たなは どれ？']),
      answer: groups[object.solid],
      options: Object.values(groups),
      board: { type: 'object-card', label: object.name, icon: object.icon },
      hint1: 'ころがるか、つめるかを かんがえよう。',
      hint2: 'かどと めんの かたちを みよう。',
      explain: '「' + object.name + '」は ' + groups[object.solid] + 'だね。',
      story,
      learningKey: 'sort:' + object.name,
      math: null
    });
  },

  // ── うつる かたち(スタンプ)。かたち→あと と あと→かたち の両向きで問う ──
  shp_stamp(slot, rng) {
    const candidates = SOLIDS.filter(s => s.face);
    const solid = pick(rng, candidates);
    const story = slot === 4;
    const reverse = !story && slot % 2 === 1;
    if (reverse) {
      const face = solid.face;
      const wording = pick(rng, [
        'かみに 「' + face + '」の あとが ついた。おした かたちは どれ？',
        '「' + face + '」の スタンプに なるのは、どの かたちの めん？'
      ]);
      return Q({
        kind: 'choice',
        prompt: wording,
        answer: solid.name,
        options: candidates.map(s => s.name),
        board: { type: 'stamp-mark', face },
        hint1: 'その かたちの めんを もつ ものを さがそう。',
        hint2: face === 'まる' ? 'まるい めんが あるのは どれかな。'
          : face === 'ましかく' ? 'へんの ながさが ぜんぶ おなじ めんを もつのは どれかな。'
          : 'ほそながい めんを もつのは どれかな。',
        explain: '「' + face + '」の あとは ' + solid.name + 'の めんから つくよ。',
        story: false,
        learningKey: 'stampR:' + solid.key,
        math: null
      });
    }
    const wording = pick(rng, [
      solid.name + 'の めんを かみに うつすと、どんな かたち？',
      solid.name + 'に えのぐを つけて ぺたん。どんな あとが つく？'
    ]);
    return Q({
      kind: 'choice',
      prompt: story
        ? 'トトが えのぐを つけて ぺたん。' + solid.name + 'の たいらな めんは、どんな かたちに うつる？'
        : wording,
      answer: solid.face,
      options: ['まる', 'ましかく', 'ながしかく'],
      board: { type: 'solid', solid: solid.key, stamp: true },
      hint1: 'かみに つく、たいらな めんの かたちを みよう。',
      hint2: 'まるいかな。かどが 4つなら、へんの ながさも みよう。',
      explain: solid.name + 'の めんは 「' + solid.face + '」に うつるよ。',
      story,
      learningKey: 'stamp:' + solid.key,
      math: null
    });
  },

  // ── いろいたで つくる(みほんを うつす) ──
  shp_tiles(slot, rng) {
    const pattern = pick(rng, TILE_PATTERNS.slice(0, 6 + band2(slot) * 3));
    const story = slot === 4;
    return Q({
      kind: 'grid',
      prompt: story
        ? 'モクモの つくった みほんと おなじ かたちを、となりの ばんに つくろう。'
        : pick(rng, ['みほんと おなじ マスを タップして、かたちを うつそう。', 'みほんの かたちを、となりの ばんに うつそう。']),
      answer: pattern.slice().sort((x, y) => x - y).join(','),
      task: 'produce',
      board: { type: 'grid-copy', size: 3, pattern },
      hint1: 'みほんの うえの だんから、じゅんばんに みて いこう。',
      hint2: 'ひとつ うつしたら、みほんと みくらべよう。',
      explain: 'みほんと おなじ ばしょを ぬれたね。かたちは ばしょで きまるよ。',
      story,
      learningKey: 'tiles:' + pattern.join(''),
      math: null
    });
  },

  // ── まわす？ うらがえす？ ──
  shp_flip(slot, rng) {
    const base = pick(rng, [[0, 1, 3], [0, 1, 5], [0, 3, 4], [1, 2, 5]]);
    const move = pick(rng, ['まわす', 'うらがえす', 'そのまま']);
    const piece = move === 'まわす' ? rotate3(base) : move === 'うらがえす' ? mirror3(base) : base.slice();
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: story
        ? 'トトの いろいたが みほんと ちがう むきに みえる。どう うごかすと みほんに なる？'
        : 'みぎの いたを どう うごかすと、ひだりの みほんに なる？',
      answer: move,
      options: ['そのまま', 'まわす', 'うらがえす'],
      board: { type: 'flip-pair', size: 3, model: base, piece },
      hint1: 'かたむけたり、ひっくりかえしたり する ようすを おもいうかべよう。',
      hint2: 'かたちの とがった ところが どこへ いくかを みよう。',
      explain: 'この いたは 「' + move + '」で みほんと おなじに なるよ。',
      story,
      learningKey: 'flip:' + base.join('') + ':' + move,
      math: null
    });
  },

  // ── ぼうは なんぼん？ ──
  shp_sticks(slot, rng) {
    const figure = pick(rng, STICK_FIGURES.slice(0, 3 + band2(slot)));
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'モクモが ぼうで 「' + figure.name + '」を つくりたい。ぼうは なんぼん いる？'
        : pick(rng, ['この かたちは、ぼうを なんぼん つかっている？', 'おなじ かたちを つくるには、ぼうが なんぼん いる？']),
      answer: figure.sticks,
      board: { type: 'stick-figure', figure: figure.key },
      hint1: 'ぼうを 1ぽんずつ ゆびで なぞって かぞえよう。',
      hint2: 'かぞえた ぼうに しるしを つける つもりで、もういちど。',
      explain: '「' + figure.name + '」は ぼう ' + figure.sticks + 'ほんで できているよ。',
      story,
      learningKey: 'sticks:' + figure.key,
      math: null
    });
  },

  // ── てんを つないだ かたち ──
  shp_dots(slot, rng) {
    const pattern = pick(rng, TILE_PATTERNS.slice(2, 8 + band2(slot) * 2));
    const story = slot === 4;
    return Q({
      kind: 'grid',
      prompt: story
        ? 'トトが てんの カードに かたちを かいた。おなじ てんを タップして うつそう。'
        : pick(rng, ['みほんと おなじ てんを タップして、かたちを うつそう。', 'みほんの かたちを、てんの ばんに うつそう。']),
      answer: pattern.slice().sort((x, y) => x - y).join(','),
      task: 'produce',
      board: { type: 'dot-copy', size: 3, pattern },
      hint1: 'みほんの てんの ばしょを、うえから じゅんに みよう。',
      hint2: 'ひだりから なんばんめ、うえから なんばんめ、と かぞえよう。',
      explain: 'おなじ ばしょの てんを えらべたね。',
      story,
      learningKey: 'dots:' + pattern.join(''),
      math: null
    });
  },

  // ── どこに うごく？ ──
  shp_move(slot, rng) {
    const size = 3;
    const dirs = [
      { name: 'うえ', dx: 0, dy: -1 },
      { name: 'した', dx: 0, dy: 1 },
      { name: 'ひだり', dx: -1, dy: 0 },
      { name: 'みぎ', dx: 1, dy: 0 }
    ];
    let from, dir, steps, tx, ty;
    let guard = 0;
    do {
      from = randInt(rng, 0, size * size - 1);
      dir = pick(rng, dirs);
      steps = band2(slot) >= 1 ? pick(rng, [1, 2]) : 1;
      tx = (from % size) + dir.dx * steps;
      ty = Math.floor(from / size) + dir.dy * steps;
      guard += 1;
    } while (guard < 40 && (tx < 0 || tx >= size || ty < 0 || ty >= size));
    if (tx < 0 || tx >= size || ty < 0 || ty >= size) { from = 4; dir = dirs[0]; steps = 1; tx = 1; ty = 0; }
    const target = ty * size + tx;
    const story = slot === 4;
    return Q({
      kind: 'grid',
      prompt: story
        ? 'モクモの こまが いろの マスに いる。「' + dir.name + 'へ ' + steps + 'つ」うごいた さきを タップして。'
        : 'いろの マスから ' + dir.name + 'へ ' + steps + 'つ うごいた マスを タップして。',
      answer: String(target),
      task: 'produce',
      board: { type: 'grid-move', size, from, pattern: [target] },
      hint1: dir.name + 'は どっちか、ゆびで さして たしかめよう。',
      hint2: '1マスずつ ゆびを うごかして かぞえよう。',
      explain: dir.name + 'へ ' + steps + 'つで、この マスに つくね。',
      story,
      learningKey: 'move:' + from + ':' + dir.name + steps,
      math: null
    });
  }
};

function band2(slot) {
  if (slot <= 1) return 0;
  if (slot <= 4) return 1;
  return 2;
}

function rotate3(cells) {
  // 3×3 を みぎに 90ど
  return cells.map(i => {
    const x = i % 3;
    const y = Math.floor(i / 3);
    return x * 3 + (2 - y);
  }).sort((a, b) => a - b);
}

function mirror3(cells) {
  return cells.map(i => {
    const x = i % 3;
    const y = Math.floor(i / 3);
    return y * 3 + (2 - x);
  }).sort((a, b) => a - b);
}
