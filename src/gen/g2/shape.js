// 小2・かたちライン。直線で囲む→三角/四角→辺・頂点→直角→長方形・正方形・直角三角形→しきつめ→はこ。
// 図形は POLYS の座標データから描く(名前と絵が構造的にずれない)。

import { Q, ranged, randInt, pick, shuffle } from '../util.js';

// points: 100×100 の座標。closed: 囲まれているか。curved: 曲線を含むか。
export const POLYS = {
  tri_acute: { points: [[15, 85], [50, 15], [85, 85]], edges: 3, kind: 'tri', right: false },
  tri_right: { points: [[15, 85], [15, 20], [80, 85]], edges: 3, kind: 'tri', right: true },
  tri_wide: { points: [[10, 80], [55, 25], [90, 70]], edges: 3, kind: 'tri', right: false },
  quad_rect: { points: [[15, 30], [85, 30], [85, 75], [15, 75]], edges: 4, kind: 'quad', right: true, rect: true },
  quad_square: { points: [[25, 25], [75, 25], [75, 75], [25, 75]], edges: 4, kind: 'quad', right: true, rect: true, square: true },
  quad_para: { points: [[25, 30], [90, 30], [70, 75], [5, 75]], edges: 4, kind: 'quad', right: false },
  quad_trap: { points: [[30, 30], [70, 30], [85, 75], [15, 75]], edges: 4, kind: 'quad', right: false },
  quad_kite: { points: [[50, 15], [80, 50], [50, 90], [20, 50]], edges: 4, kind: 'quad', right: false },
  penta: { points: [[50, 12], [88, 42], [72, 88], [28, 88], [12, 42]], edges: 5, kind: 'penta', right: false },
  curved: { curved: true },
  open_zig: { points: [[15, 80], [40, 25], [65, 70], [90, 30]], open: true }
};

function polyQ(rng, slot, target, pool, ask, hints, explainOf, keyPrefix) {
  const others = shuffle(rng, pool.filter(k => k !== target)).slice(0, 2);
  const items = shuffle(rng, [target].concat(others));
  const labels = ['あ', 'い', 'う'];
  const answer = labels[items.indexOf(target)];
  const story = slot === 4;
  return Q({
    kind: 'choice',
    prompt: (story ? 'こうぼうの せっけいずから えらぼう。' : '') + ask,
    answer,
    options: labels,
    board: { type: 'poly-set', items, labels },
    hint1: hints[0],
    hint2: hints[1],
    explain: '「' + answer + '」だね。' + explainOf,
    story,
    learningKey: keyPrefix + ':' + items.join(','),
    math: null
  });
}

export const g2ShapeStages = {
  // ── ちょくせんで かこまれた かたち ──
  g2_shp_lines(slot, rng) {
    const target = pick(rng, ['tri_acute', 'quad_rect', 'quad_trap', 'penta']);
    return polyQ(rng, slot, target, [target, 'curved', 'open_zig'],
      'ちょくせんだけで かこまれた かたちは どれ？',
      ['まがった せんが ないかを みよう。', 'とちゅうで きれて いない、とじた かたちを さがそう。'],
      'ちょくせんだけで、ぐるっと かこまれて いるよ。',
      'g2lines');
  },

  // ── さんかくけいと しかくけい ──
  g2_shp_tri_quad(slot, rng) {
    const key = pick(rng, ['tri_acute', 'tri_right', 'tri_wide', 'quad_rect', 'quad_para', 'quad_trap', 'quad_kite']);
    const poly = POLYS[key];
    const story = slot === 4;
    const answer = poly.kind === 'tri' ? 'さんかくけい' : 'しかくけい';
    return Q({
      kind: 'choice',
      prompt: story ? 'かたづけの じかん。この いたは どちらの たなに いれる？' : 'この かたちは どっち？',
      answer,
      options: ['さんかくけい', 'しかくけい'],
      board: { type: 'poly', item: key },
      hint1: 'へんの かずを かぞえよう。',
      hint2: 'へんが 3ぼんなら さんかくけい、4ほんなら しかくけいだよ。',
      explain: 'へんが ' + poly.edges + 'ほんだから ' + answer + 'だね。',
      story,
      learningKey: 'g2tq:' + key,
      math: null
    });
  },

  // ── へんと ちょうてん ──
  g2_shp_edge_vertex(slot, rng) {
    const key = pick(rng, ['tri_acute', 'tri_right', 'quad_rect', 'quad_para', 'quad_trap', 'penta']);
    const poly = POLYS[key];
    const askEdge = slot % 2 === 0;
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'いたの まわりの へんに 1ぽんずつ ぼうを はる。ぼうは なんぼん いる？'
        : askEdge ? 'この かたちの へんは なんぼん？' : 'この かたちの ちょうてんは いくつ？',
      answer: poly.edges,
      board: { type: 'poly', item: key, markVertices: !askEdge && !story },
      hint1: askEdge || story ? 'まわりの まっすぐな せんを 1ぽんずつ かぞえよう。' : 'かどの とがった ところを かぞえよう。',
      hint2: 'かぞえた ところに しるしを つけると もれないよ。',
      explain: 'へんも ちょうてんも ' + poly.edges + 'つずつ あるね。',
      story,
      learningKey: 'g2ev:' + key + (askEdge ? 'e' : 'v'),
      math: null
    });
  },

  // ── ちょっかくを さがす ──
  g2_shp_right(slot, rng) {
    const target = pick(rng, ['tri_right', 'quad_rect', 'quad_square']);
    return polyQ(rng, slot, target, [target, 'tri_acute', 'quad_para'],
      'ちょっかくの ある かたちは どれ？',
      ['かみを おって つくった かどと おなじ かどを さがそう。', 'ましかくの かどに ぴったり かさなる かどが ちょっかくだよ。'],
      'かどの ひとつが ちょっかくに なって いるよ。',
      'g2right');
  },

  // ── ちょうほうけい ──
  g2_shp_rect(slot, rng) {
    return polyQ(rng, slot, 'quad_rect', ['quad_rect', 'quad_para', 'quad_trap', 'quad_kite', 'tri_acute'],
      'ちょうほうけいは どれ？',
      ['かどが みんな ちょっかくかを みよう。', 'かどが 4つとも ちょっかくの しかくけいが ちょうほうけいだよ。'],
      'かどが 4つとも ちょっかく。むかいあう へんの ながさも おなじだね。',
      'g2rect');
  },

  // ── せいほうけい ──
  g2_shp_square(slot, rng) {
    return polyQ(rng, slot, 'quad_square', ['quad_square', 'quad_rect', 'quad_kite', 'quad_para', 'quad_trap'],
      'せいほうけいは どれ？',
      ['かどが ちょっかくで、へんの ながさも みよう。', 'かどが みんな ちょっかくで、へんが みんな おなじ ながさだよ。'],
      'かども へんも みんな おなじ。せいほうけいだね。',
      'g2square');
  },

  // ── ちょっかくさんかくけい ──
  g2_shp_rtri(slot, rng) {
    return polyQ(rng, slot, 'tri_right', ['tri_right', 'tri_acute', 'tri_wide', 'quad_para', 'quad_kite'],
      'ちょっかくさんかくけいは どれ？',
      ['さんかくけいの かどを 1つずつ しらべよう。', 'ちょっかくの かどが ある さんかくけいだよ。'],
      'ちょっかくの かどを もつ さんかくけいだね。',
      'g2rtri');
  },

  // ── ほうがんで しきつめ ──
  g2_shp_tile(slot, rng) {
    const patterns = [
      [0, 2, 4, 6, 8], [1, 3, 5, 7], [0, 1, 3, 4], [4, 5, 7, 8], [0, 4, 8], [2, 4, 6],
      [0, 1, 2, 6, 7, 8], [0, 3, 6, 2, 5, 8].slice(0, 4), [1, 4, 7], [3, 4, 5]
    ];
    const pattern = pick(rng, patterns);
    const story = slot === 4;
    return Q({
      kind: 'grid',
      prompt: story
        ? 'ゆかの もようの せっけいず。みほんと おなじ もようを つくろう。'
        : 'みほんの もようを、となりの ばんに うつそう。',
      instruction: 'マスを タップして 「けってい」',
      answer: pattern.slice().sort((a, b) => a - b).join(','),
      task: 'produce',
      board: { type: 'grid-copy', size: 3, pattern },
      hint1: 'みほんの いろの ばしょを 1つずつ みよう。',
      hint2: 'うえの だんから じゅんばんに うつすと まちがえないよ。',
      explain: 'おなじ ばしょを ぬれば おなじ もようが できるね。',
      story,
      learningKey: 'g2tile:' + pattern.join(''),
      math: null
    });
  },

  // ── はこの かたち ──
  g2_shp_box(slot, rng) {
    const asks = [
      { t: 'めん', n: 6, hint: 'かみを はる たいらな ところが めんだよ。' },
      { t: 'へん', n: 12, hint: 'ぼうに なる ところが へんだよ。' },
      { t: 'ちょうてん', n: 8, hint: 'ねんどだまに なる かどが ちょうてんだよ。' }
    ];
    const ask = pick(rng, asks);
    const phrasings = {
      'めん': ['はこの かたちの めんは いくつ？', 'はこに かみを はる。かみは なんまい いる？', 'はこの たいらな ところは いくつ？'],
      'へん': ['はこの かたちの へんは いくつ？', 'はこの かたちを ひごで つくる。ひごは なんぼん いる？', 'はこの まっすぐな ところは いくつ？'],
      'ちょうてん': ['はこの かたちの ちょうてんは いくつ？', 'はこの かたちを つくるのに ねんどだまは いくつ いる？', 'はこの かどは いくつ？']
    };
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'ひごと ねんどだまで はこの かたちを つくる。' + ask.t + 'は いくつ いる？'
        : pick(rng, phrasings[ask.t]),
      answer: ask.n,
      board: { type: 'solid', solid: 'box' },
      hint1: ask.hint,
      hint2: 'みえない うらがわの ぶんも わすれずに かぞえよう。',
      explain: 'はこの かたちは めんが 6、へんが 12、ちょうてんが 8。' + ask.t + 'は ' + ask.n + 'だね。',
      story,
      learningKey: 'g2box:' + ask.t + (story ? 's' : ''),
      math: null
    });
  }
};
