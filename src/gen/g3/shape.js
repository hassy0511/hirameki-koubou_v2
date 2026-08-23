// 小3・かたちライン。円と球→コンパス→二等辺・正三角形→角。図形は POLYS の座標から描く。

import { Q, ranged, randInt, pick, shuffle } from '../util.js';

function polyChoice(rng, slot, target, pool, ask, hints, explainOf, keyPrefix) {
  const others = shuffle(rng, pool.filter(k => k !== target)).slice(0, 2);
  const items = shuffle(rng, [target].concat(others));
  const labels = ['あ', 'い', 'う'];
  const answer = labels[items.indexOf(target)];
  const story = slot === 4;
  return Q({
    kind: 'choice',
    prompt: (story ? 'せっけいずの なかから えらぼう。' : '') + ask,
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

export const g3ShapeStages = {
  // ── えんの ひみつ(中心・半径・直径) ──
  g3_shp_circle(slot, rng) {
    const mode = slot === 0 ? 0 : (slot % 2 === 1 ? 1 : 2);
    const story = slot === 4;
    const r = randInt(rng, 2, 9);
    if (mode === 0 && !story) {
      return Q({
        kind: 'choice',
        prompt: 'えんの まんなかの てんを なんと いう？',
        answer: 'ちゅうしん',
        options: ['ちゅうしん', 'はんけい', 'ちょっけい'],
        board: { type: 'circle', show: 'plain' },
        hint1: 'えんの まんまんなかの 1てんだよ。',
        hint2: 'そこから まわりまでの ながさは どこでも おなじに なるよ。',
        explain: 'まんなかの てんは ちゅうしん。えんの きほんに なる てんだね。',
        story: false,
        learningKey: 'g3ci0',
        math: null
      });
    }
    if (mode === 1 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'まるい テーブルを つくる。はんけいは ' + r + 'cmに した。ちょっけいは なんcm？'
          : 'はんけいが ' + r + 'cmの えんの ちょっけいは なんcm？',
        answer: r * 2,
        board: { type: 'circle', show: 'radius' },
        hint1: 'ちょっけいは ちゅうしんを とおって はしから はしまでの ながさだよ。',
        hint2: 'はんけいの 2つぶんに なるね。',
        explain: 'ちょっけいは はんけいの 2ばいで ' + r * 2 + 'cm。' + r + '×2だね。',
        story,
        learningKey: 'g3ci1:' + r,
        math: { kind: 'mul', a: r, b: 2 }
      });
    }
    const d = randInt(rng, 2, 9) * 2;
    return Q({
      kind: 'keypad',
      prompt: 'ちょっけいが ' + d + 'cmの えんの はんけいは なんcm？',
      answer: d / 2,
      board: { type: 'circle', show: 'diameter' },
      hint1: 'はんけいは ちょっけいの はんぶんだよ。',
      hint2: d + '÷2を けいさんしよう。',
      explain: 'はんけいは ' + d + '÷2で ' + d / 2 + 'cm。ちょっけいの はんぶんだね。',
      story: false,
      learningKey: 'g3ci2:' + d,
      math: { kind: 'div', a: d, b: 2 }
    });
  },

  // ── コンパスの つかいかた ──
  g3_shp_compass(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const d = randInt(rng, 2, 9) * 2;
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'こうさくで ちょっけい ' + d + 'cmの まるい まどを あける。コンパスは なんcmに ひらく？'
          : 'ちょっけい ' + d + 'cmの えんを かく。コンパスは なんcmに ひらく？',
        answer: d / 2,
        board: { type: 'circle', show: 'diameter' },
        hint1: 'コンパスの ひらきは はんけいの ながさだよ。',
        hint2: 'はんけいは ちょっけいの はんぶんだったね。',
        explain: 'コンパスは はんけいの ' + d / 2 + 'cmに ひらく。ちょっけいの はんぶんだね。',
        story,
        learningKey: 'g3cp1:' + d,
        math: { kind: 'div', a: d, b: 2 }
      });
    }
    const r = randInt(rng, 2, 8);
    const times = randInt(rng, 2, 4);
    return Q({
      kind: 'keypad',
      prompt: 'コンパスを ' + r + 'cmに ひらいて、まっすぐな せんの うえに つづけて ' + times + 'かい しるしを つけた。はじめから おわりまで なんcm？',
      answer: r * times,
      board: { type: 'circle-pattern', count: times },
      hint1: 'コンパスは おなじ ながさを うつしとる どうぐだよ。',
      hint2: r + 'cmが ' + times + 'こぶんだね。',
      explain: r + 'cmずつ ' + times + 'かいで ' + r * times + 'cm。コンパスで ながさを はこべるんだね。',
      story: false,
      learningKey: 'g3cp2:' + r + ':' + times,
      math: { kind: 'mul', a: r, b: times }
    });
  },

  // ── えんの もよう ──
  g3_shp_pattern(slot, rng) {
    const count = ranged(rng, slot, [[2, 3], [3, 4], [3, 5], [4, 6]]);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'こうぼうの かべの もよう。かさなった えんは ぜんぶで いくつ？'
        : pick(rng, ['もようの えんは ぜんぶで いくつ？', 'かさなった えんの かずは いくつ？', 'この もようは えんを いくつ つかって いる？']),
      answer: count,
      board: { type: 'circle-pattern', count },
      hint1: 'ひだりから じゅんに かぞえよう。',
      hint2: 'かさなって いても 1つずつ かぞえるよ。',
      explain: 'えんは ' + count + 'こ。おなじ はんけいの えんを ずらして かさねた もようだね。',
      story,
      learningKey: 'g3pt:' + count + (story ? 's' : ''),
      math: { kind: 'count', n: count }
    });
  },

  // ── きゅうを しらべる ──
  g3_shp_sphere(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 || story) {
      const thing3 = pick(rng, ['すいか', 'ボール', 'ねんどの たま']);
      return Q({
        kind: 'choice',
        prompt: story
          ? 'すいかを まっぷたつに きる。きりくちは どんな かたち？'
          : pick(rng, [
            'きゅうを きった きりくちは どんな かたち？',
            'まるい ' + thing3 + 'を すぱっと きる。きりくちの かたちは？',
            'きゅうを どこで きっても、きりくちは どんな かたちに なる？'
          ]),
        answer: 'えん',
        options: ['えん', 'ましかく', 'さんかく'],
        board: { type: 'sphere-cut', cutY: 60 },
        hint1: 'ボールを きった ところを そうぞうしよう。',
        hint2: 'どこを きっても おなじ しゅるいの かたちに なるよ。',
        explain: 'きゅうの きりくちは いつも えん。まるい かたちの ひみつだね。',
        story,
        learningKey: 'g3sp1' + (story ? 's' : ''),
        math: null
      });
    }
    return Q({
      kind: 'choice',
      prompt: pick(rng, [
        'きゅうの きりくちが いちばん おおきく なるのは、どこを きった とき？',
        'きりくちの えんを いちばん おおきく したい。どこを きる？',
        'きゅうを きって いちばん ひろい きりくちに するには、どこを きれば いい？',
        'てんせんの いちを ずらして きる。きりくちが いちばん おおきいのは？'
      ]),
      answer: 'ちゅうしんを とおる ところ',
      options: ['ちゅうしんを とおる ところ', 'はしに ちかい ところ', 'どこでも おなじ'],
      board: { type: 'sphere-cut', cutY: pick(rng, [32, 40, 48, 74, 82]) },
      hint1: 'まんなかと はしでは、きりくちの おおきさが ちがうよ。',
      hint2: 'まんなかを とおるほど きりくちは おおきく なるね。',
      explain: 'ちゅうしんを とおる ところで きると いちばん おおきい えんに なるよ。',
      story: false,
      learningKey: 'g3sp2:' + (slot % 4),
      math: null
    });
  },

  // ── にとうへんと せいさんかくの みわけ ──
  g3_shp_iso_find(slot, rng) {
    const target = pick(rng, ['tri_iso', 'tri_equi']);
    const isEqui = target === 'tri_equi';
    return polyChoice(rng, slot, target,
      [target, isEqui ? 'tri_iso' : 'tri_equi', 'tri_wide', 'tri_acute'],
      (isEqui ? 'せいさんかくけい' : 'にとうへんさんかくけい') + 'は どれ？',
      ['へんの ながさを コンパスで うつしとって くらべよう。',
        isEqui ? '3つの へんが みんな おなじ ながさだよ。' : '2つの へんが おなじ ながさだよ。'],
      isEqui ? '3つの へんが みんな おなじ。せいさんかくけいだね。' : '2つの へんが おなじ ながさ。にとうへんさんかくけいだね。',
      isEqui ? 'g3eq' : 'g3iso');
  },

  // ── にとうへんさんかくけい ──
  g3_shp_iso(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const ask = pick(rng, [
        { t: pick(rng, ['おなじ ながさの へんは なんぼん？', 'ながさの ひとしい へんは なんぼん ある？']), n: 2, h: 'ながさの おなじ 2ほんを さがそう。', k: 'e' },
        { t: pick(rng, ['おなじ おおきさの かどは いくつ？', 'おおきさの ひとしい かどは いくつ ある？']), n: 2, h: 'おなじ ながさの へんの したに ある かどだよ。', k: 'a' }
      ]);
      return Q({
        kind: 'keypad',
        prompt: 'にとうへんさんかくけいの ' + ask.t,
        answer: ask.n,
        board: { type: 'poly', item: 'tri_iso' },
        hint1: ask.h,
        hint2: 'おって かさねると ぴったり あうよ。',
        explain: 'にとうへんさんかくけいは、へんも かども 2つずつ おなじだね。',
        story: false,
        learningKey: 'g3is1:' + ask.k + ':' + ask.t.length,
        math: null
      });
    }
    const eq = randInt(rng, 3, 9);
    let base = randInt(rng, 2, 8);
    if (base === eq) base = base > 2 ? base - 1 : base + 1;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'にとうへんさんかくけいの はたを つくる。おなじ ながさの へんが ' + eq + 'cmずつ、のこりの へんが ' + base + 'cm。まわりの ながさは なんcm？'
        : 'へんが ' + eq + 'cm、' + eq + 'cm、' + base + 'cmの にとうへんさんかくけい。まわりの ながさは なんcm？',
      answer: eq * 2 + base,
      board: { type: 'poly', item: 'tri_iso' },
      hint1: '3つの へんを ぜんぶ たそう。',
      hint2: eq + '＋' + eq + '＋' + base + 'を けいさんするよ。',
      explain: 'まわりは ' + (eq * 2 + base) + 'cm。おなじ へんが 2ほん あるのが にとうへんだね。',
      story,
      learningKey: 'g3is2:' + eq + ':' + base,
      math: { kind: 'add', a: eq * 2, b: base }
    });
  },

  // ── せいさんかくけい ──
  g3_shp_equi(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const side = randInt(rng, 2, 9);
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? '1ぺん ' + side + 'cmの せいさんかくけいの クッキーの まわりに チョコを つける。チョコは なんcm いる？'
          : '1ぺんが ' + side + 'cmの せいさんかくけい。まわりの ながさは なんcm？',
        answer: side * 3,
        board: { type: 'poly', item: 'tri_equi' },
        hint1: 'せいさんかくけいの へんは みんな おなじ ながさだよ。',
        hint2: side + '×3で もとめられるね。',
        explain: side + 'cmの へんが 3ぼんで ' + side * 3 + 'cm。ぜんぶ おなじだから かけざんが つかえるね。',
        story,
        learningKey: 'g3eq1:' + side,
        math: { kind: 'mul', a: side, b: 3 }
      });
    }
    const per = randInt(rng, 2, 9) * 3;
    return Q({
      kind: 'keypad',
      prompt: 'まわりの ながさが ' + per + 'cmの せいさんかくけい。1ぺんは なんcm？',
      answer: per / 3,
      board: { type: 'poly', item: 'tri_equi' },
      hint1: '3ぼんの へんが みんな おなじ ながさだよ。',
      hint2: per + '÷3を けいさんしよう。',
      explain: per + '÷3＝' + per / 3 + '。1ぺんは ' + per / 3 + 'cmだね。',
      story: false,
      learningKey: 'g3eq2:' + per,
      math: { kind: 'div', a: per, b: 3 }
    });
  },

  // ── かどの おおきさ ──
  g3_shp_angle(slot, rng) {
    const small = randInt(rng, 25, 55);
    const large = small + randInt(rng, 25, 60);
    const flip = rng() < 0.5;
    const a = flip ? large : small;
    const bDeg = flip ? small : large;
    const askBig = slot % 2 === 0;
    const story = slot === 4;
    const answer = askBig ? (a > bDeg ? 'あ' : 'い') : (a < bDeg ? 'あ' : 'い');
    return Q({
      kind: 'choice',
      prompt: story
        ? 'とびらの あきかたを くらべる。' + (askBig ? 'おおきく あいて いる' : 'すこししか あいて いない') + 'のは どっち？'
        : 'かどが ' + (askBig ? 'おおきい' : 'ちいさい') + 'のは どっち？',
      answer,
      options: ['あ', 'い'],
      board: { type: 'angle-pair', a, bDeg },
      hint1: 'へんの ながさでは なく、ひらきぐあいを くらべるよ。',
      hint2: 'かさねた とき、そとに はみだす ほうが おおきい かどだよ。',
      explain: 'ひらきが ' + (askBig ? 'おおきい' : 'ちいさい') + 'のは 「' + answer + '」。かどの おおきさは ひらきぐあいの ことだね。',
      story,
      learningKey: 'g3an:' + small + ':' + large + (askBig ? 'b' : 's'),
      math: null
    });
  },

  // ── さんかくけいの かど ──
  g3_shp_tri_angle(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'おりがみで にとうへんさんかくけいを おった。ぴったり かさなる かどは いくつ？'
          : pick(rng, [
            'にとうへんさんかくけいで、おなじ おおきさの かどは いくつ？',
            'にとうへんさんかくけいを おって かさねる。ぴったり かさなる かどは いくつ？',
            'にとうへんさんかくけいの かどで、おおきさの ひとしい ものは いくつ？'
          ]),
        answer: 2,
        board: { type: 'poly', item: 'tri_iso', markVertices: true },
        hint1: 'おなじ ながさの へんの はしに ある かどだよ。',
        hint2: 'はんぶんに おると かさなるよ。',
        explain: 'にとうへんさんかくけいの かどは 2つが おなじ おおきさだね。',
        story,
        learningKey: 'g3ta1' + (story ? 's' : ''),
        math: null
      });
    }
    return Q({
      kind: 'keypad',
      prompt: pick(rng, [
        'せいさんかくけいで、おなじ おおきさの かどは いくつ？',
        'せいさんかくけいの かどは、いくつとも おなじ おおきさ？',
        'せいさんかくけいを まわして おいても おなじに みえる。おなじ おおきさの かどは いくつ？',
        'せいさんかくけいを おって かさねる。ぴったり かさなる かどは ぜんぶで いくつ？'
      ]),
      answer: 3,
      board: { type: 'poly', item: 'tri_equi', markVertices: slot < 4 },
      hint1: 'へんが みんな おなじなら、かども みんな おなじだよ。',
      hint2: 'どこを むけて おいても おなじ かたちに みえるね。',
      explain: 'せいさんかくけいは 3つの かどが みんな おなじ おおきさだよ。',
      story: false,
      learningKey: 'g3ta2:' + (slot % 4),
      math: null
    });
  }
};
