// 小2・しらべる・とくライン。観点→記録→表→○グラフ→読み取り→表現えらび→演算決定→テープ図→情報えらび。

import { Q, ranged, randInt, pick, shuffle, thing, actor } from '../util.js';

const FRUITS = [
  { label: 'りんご', icon: 'apple' },
  { label: 'みかん', icon: 'orange' },
  { label: 'ぶどう', icon: 'grape' },
  { label: 'いちご', icon: 'strawberry' }
];

function tableData(rng, maxCount) {
  const rows = shuffle(rng, FRUITS).slice(0, 3);
  const counts = [];
  while (counts.length < 3) {
    const c = randInt(rng, 2, maxCount);
    if (!counts.includes(c)) counts.push(c);
  }
  return rows.map((f, i) => ({ label: f.label, icon: f.icon, count: counts[i] }));
}

export const g2SolveStages = {
  // ── かんてんを えらぶ ──
  g2_sol_view(slot, rng) {
    const cases = [
      { s: 'くだものの しゅるいごとの かずを しらべたい。', a: 'しゅるいで わける', k: 'kind' },
      { s: 'すきな あそびは なにが おおいかを しらべたい。', a: 'しゅるいで わける', k: 'play' },
      { s: 'あかい おりがみが なんまい あるか しらべたい。', a: 'いろで わける', k: 'color' },
      { s: 'おおきい ボールだけ かたづけたい。', a: 'おおきさで わける', k: 'size' },
      { s: 'くみの みんなの すきな いろを しらべたい。', a: 'いろで わける', k: 'color2' },
      { s: 'ながい えんぴつと みじかい えんぴつに わけたい。', a: 'おおきさで わける', k: 'size2' }
    ];
    const chosen = pick(rng, cases);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: (story ? 'モクモの しらべもの。' : '') + chosen.s + pick(rng, [' どう わけると いい？', ' どの わけかたが いい？', ' なにで わける？']),
      answer: chosen.a,
      options: ['しゅるいで わける', 'いろで わける', 'おおきさで わける'],
      board: null,
      hint1: 'なにを しりたいのかを もういちど よもう。',
      hint2: 'しりたい ことと おなじ わけかたを えらぶんだよ。',
      explain: 'しりたい ことに あわせて 「' + chosen.a + '」が いいね。',
      story,
      learningKey: 'g2view:' + chosen.k,
      math: null
    });
  },

  // ── かぞえもらしを ふせぐ(せいの じ) ──
  g2_sol_tally(slot, rng) {
    const count = ranged(rng, slot, [[6, 9], [7, 12], [9, 16], [12, 19]]);
    const fruit = pick(rng, FRUITS);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'はたけで とれた ' + fruit.label + 'を、1こずつ しるしを つけて かぞえた。ぜんぶで いくつ？'
        : fruit.label + 'の しるしは ぜんぶで いくつ？',
      answer: count,
      board: { type: 'tally-marks', count, label: fruit.label },
      hint1: '5ほんずつの まとまりで かぞえよう。',
      hint2: '5、10、と とびかぞえして、のこりを たすよ。',
      explain: '5の まとまりが ' + Math.floor(count / 5) + 'こと ばら ' + (count % 5) + 'ほんで ' + count + '。まとめると かぞえやすいね。',
      story,
      learningKey: 'g2tally:' + count + ':' + fruit.label,
      math: { kind: 'count', n: count }
    });
  },

  // ── ひょうに まとめる・よむ ──
  g2_sol_table(slot, rng) {
    const rows = tableData(rng, ranged(rng, slot, [[5, 7], [6, 9], [7, 12], [9, 15]]));
    const story = slot === 4;
    const mode = slot % 2;
    if (mode === 0 && !story) {
      const target = pick(rng, rows);
      return Q({
        kind: 'keypad',
        prompt: 'ひょうで ' + target.label + 'は いくつ？',
        answer: target.count,
        board: { type: 'table-1d', rows, hideTarget: null },
        hint1: target.label + 'の れつを よこに たどろう。',
        hint2: 'らんに かいてある かずが こたえだよ。',
        explain: 'ひょうの ' + target.label + 'の らんは ' + target.count + '。ひょうは かずを さがしやすいね。',
        story: false,
        learningKey: 'g2tbl1:' + target.label + ':' + target.count,
        math: null
      });
    }
    const total = rows.reduce((s, r) => s + r.count, 0);
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'おみせの うりあげの ひょうが できた。うれた かずは ぜんぶで いくつ？'
        : 'ひょうの かずを あわせると、ぜんぶで いくつ？',
      answer: total,
      board: { type: 'table-1d', rows },
      hint1: 'ひょうの かずを ぜんぶ たすよ。',
      hint2: rows.map(r => r.count).join('＋') + 'を けいさんしよう。',
      explain: 'ぜんぶ たすと ' + total + '。ごうけいも ひょうから わかるね。',
      story,
      learningKey: 'g2tbl2:' + rows.map(r => r.count).join(':'),
      math: null
    });
  },

  // ── ○の グラフ(表→グラフ) ──
  g2_sol_graph(slot, rng) {
    const n = ranged(rng, slot, [[2, 4], [3, 6], [4, 8], [6, 9]]);
    const fruit = pick(rng, FRUITS);
    const story = slot === 4;
    return Q({
      kind: 'count-tap',
      prompt: story
        ? 'しらべた けっかを グラフに する。' + fruit.label + 'は ' + n + 'こ だったので、' + n + 'こぶん ぬろう。'
        : 'ひょうの ' + fruit.label + 'は ' + n + 'こ。グラフに ' + n + 'こぶん ぬろう。',
      instruction: 'したから じゅんに タップして 「けってい」',
      answer: n,
      task: 'produce',
      board: { type: 'graph-make', label: fruit.label, icon: fruit.icon, supply: 10 },
      hint1: 'したから 1マスずつ、かぞえながら ぬろう。',
      hint2: 'ひょうの かずと おなじに なったら とめるよ。',
      explain: 'グラフの たかさは ' + n + 'マス。ひょうの かずと そろったね。',
      story,
      learningKey: 'g2graph:' + n,
      math: { kind: 'count', n }
    });
  },

  // ── よみとりモニター ──
  g2_sol_read(slot, rng) {
    const rows = tableData(rng, ranged(rng, slot, [[6, 8], [7, 10], [8, 13], [10, 16]]));
    const story = slot === 4;
    const sorted = rows.slice().sort((a, b) => b.count - a.count);
    const mode = slot % 2;
    if (mode === 0 || story) {
      const top = sorted[0];
      const bottom = sorted[2];
      const diff = top.count - bottom.count;
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'グラフが できあがった。いちばん おおい ' + top.label + 'は、いちばん すくない ' + bottom.label + 'より いくつ おおい？'
          : top.label + 'は ' + bottom.label + 'より いくつ おおい？',
        answer: diff,
        board: { type: 'pictograph', columns: rows },
        hint1: 'ふたつの れつの たかさの ちがいを みよう。',
        hint2: 'とびだして いる ぶぶんの マスを かぞえよう。',
        explain: top.count + 'と ' + bottom.count + 'の ちがいで ' + diff + '。グラフだと ちがいが みえやすいね。',
        story,
        learningKey: 'g2read1:' + rows.map(r => r.count).join(':'),
        math: null
      });
    }
    const total = rows.reduce((s, r) => s + r.count, 0);
    return Q({
      kind: 'keypad',
      prompt: 'グラフの ○を あわせると、ぜんぶで いくつ？',
      answer: total,
      board: { type: 'pictograph', columns: rows },
      hint1: 'れつごとの かずを よんで、ぜんぶ たそう。',
      hint2: rows.map(r => r.count).join('＋') + 'を けいさんするよ。',
      explain: 'ぜんぶで ' + total + '。グラフからも ごうけいが もとめられるね。',
      story: false,
      learningKey: 'g2read2:' + rows.map(r => r.count).join(':'),
      math: null
    });
  },

  // ── あらわしかたを えらぶ ──
  g2_sol_choose(slot, rng) {
    const cases = [
      { s: 'どの あそびが いちばん おおいか、ひとめで わかるように したい。', a: 'グラフに する', k: 'glance' },
      { s: 'それぞれの せいかくな かずを あとで しらべたい。', a: 'ひょうに する', k: 'exact' },
      { s: 'かずの おおい すくないを ぱっと くらべたい。', a: 'グラフに する', k: 'compare' },
      { s: 'ぜんぶの ごうけいを けいさんで もとめたい。', a: 'ひょうに する', k: 'total' },
      { s: 'ならんだ たかさで くらべたい。', a: 'グラフに する', k: 'height' },
      { s: 'かずを ひとつずつ たしかめながら うつしたい。', a: 'ひょうに する', k: 'copy' }
    ];
    const chosen = pick(rng, cases);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: (story ? 'はっぴょうの じゅんび。' : '') + chosen.s + pick(rng, [' どちらに する？', ' どっちが いい？', ' どちらを つかう？']),
      answer: chosen.a,
      options: ['ひょうに する', 'グラフに する'],
      board: null,
      hint1: 'ひとめで くらべたいのか、せいかくな かずが ほしいのかを かんがえよう。',
      hint2: 'くらべるなら グラフ、かずを よむなら ひょうが とくいだよ。',
      explain: 'この ときは 「' + chosen.a + '」が べんりだね。',
      story,
      learningKey: 'g2choose:' + chosen.k,
      math: null
    });
  },

  // ── たすのかな ひくのかな(2けたの 場面) ──
  g2_sol_op(slot, rng) {
    const add = rng() < 0.5;
    const a = ranged(rng, slot, [[15, 30], [18, 45], [25, 60], [30, 75]]);
    const b = randInt(rng, 12, Math.min(a - 1, 39));
    const item = thing(rng);
    const who = actor(rng);
    const story = slot === 4;
    const text = add
      ? pick(rng, [
        'はこに ' + item.name + 'が ' + a + 'こ。' + who + 'が ' + b + 'こ いれた。',
        who + 'は カードを ' + a + 'まい もっていた。' + b + 'まい もらった。'
      ])
      : pick(rng, [
        'はこに ' + item.name + 'が ' + a + 'こ。' + who + 'が ' + b + 'こ つかった。',
        who + 'は カードを ' + a + 'まい もっていた。' + b + 'まい あげた。'
      ]);
    return Q({
      kind: 'choice',
      prompt: text + ' つかう けいさんは どっち？',
      answer: add ? 'たしざん' : 'ひきざん',
      options: ['たしざん', 'ひきざん'],
      board: add
        ? { type: 'tape-2', top: { label: 'ぜんぶ', value: null }, parts: [{ label: 'はじめ ' + a, value: a }, { label: 'いれた ' + b, value: b }] }
        : { type: 'tape-2', top: { label: 'はじめ ' + a, value: a }, parts: [{ label: 'つかった ' + b, value: b }, { label: 'のこり', value: null }] },
      hint1: 'ふえたのかな、へったのかな。',
      hint2: add ? '「いれた」「もらった」は ふえるから たしざんだよ。' : '「つかった」「あげた」は へるから ひきざんだよ。',
      explain: add ? 'かずが ふえる おはなしだから たしざんだね。' : 'かずが へる おはなしだから ひきざんだね。',
      story,
      learningKey: 'g2op:' + (add ? 'a' : 's') + a + ':' + b,
      math: { kind: add ? 'add' : 'sub', a, b }
    });
  },

  // ── テープずで ぎゃくさん ──
  g2_sol_tape(slot, rng) {
    const story = slot === 4;
    const mode = slot % 2;
    const item = thing(rng);
    if (mode === 0 || story) {
      let total = ranged(rng, slot, [[18, 30], [22, 45], [28, 60], [35, 80]]);
      let rest = randInt(rng, 6, total - 6);
      if (total - rest === rest) rest -= 1;
      const taken = total - rest;
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'おまつりで ' + item.name + 'が ' + total + 'こ あった。くばったら のこりが ' + rest + 'こに なった。くばったのは なんこ？'
          : 'ぜんぶで ' + total + 'こ。のこりは ' + rest + 'こ。つかったのは なんこ？',
        answer: taken,
        board: { type: 'tape-2', top: { label: 'ぜんぶ ' + total, value: total }, parts: [{ label: 'つかった', value: null }, { label: 'のこり ' + rest, value: rest }] },
        hint1: 'テープずの どこが わからない ぶぶんかを みよう。',
        hint2: 'ぜんぶから のこりを ひけば もとめられるよ。',
        explain: total + '−' + rest + 'で ' + taken + '。ずに すると しきが みつけやすいね。',
        story,
        learningKey: 'g2tape1:' + total + ':' + rest,
        math: { kind: 'sub', a: total, b: rest }
      });
    }
    const taken = randInt(rng, 8, 35);
    let rest = randInt(rng, 9, 40);
    if (rest === taken) rest += 1;
    const start = taken + rest;
    return Q({
      kind: 'keypad',
      prompt: 'なんこか あった ' + item.name + 'の うち、' + taken + 'こ つかったら、のこりは ' + rest + 'こ。はじめは なんこ？',
      answer: start,
      board: { type: 'tape-2', top: { label: 'はじめ', value: null }, parts: [{ label: 'つかった ' + taken, value: taken }, { label: 'のこり ' + rest, value: rest }] },
      hint1: 'はじめの かずは、つかった ぶんと のこりを あわせた かずだよ。',
      hint2: taken + '＋' + rest + 'を けいさんしよう。',
      explain: taken + 'と ' + rest + 'で ' + start + '。ひきざんの おはなしでも、もとめるのは たしざんの ことが あるんだね。',
      story: false,
      learningKey: 'g2tape2:' + taken + ':' + rest,
      math: { kind: 'add', a: taken, b: rest }
    });
  },

  // ── いる じょうほうを えらぶ ──
  g2_sol_info(slot, rng) {
    const item1 = 'りんご';
    const item2 = 'みかん';
    const a = ranged(rng, slot, [[8, 15], [10, 20], [12, 30], [15, 40]]);
    let b = randInt(rng, 5, a - 2);
    if (a - b === b) b -= 1;
    let extra = randInt(rng, 2, 6);
    if (extra === b || extra === a) extra = extra > 2 ? extra - 1 : extra + 1;
    if (extra === b || extra === a) extra += 2;
    const story = slot === 4;
    const ask = pick(rng, ['ちがい', 'あわせた かず']);
    return Q({
      kind: 'choice',
      prompt: (story ? 'おみせの おてつだい。' : '') + item1 + 'が ' + a + 'こ、' + item2 + 'が ' + b + 'こ、かごが ' + extra + 'つ ある。' + item1 + 'と ' + item2 + 'の ' + ask + 'を もとめるのに つかう かずは どれ？',
      answer: a + 'と ' + b,
      options: [a + 'と ' + b, a + 'と ' + extra, b + 'と ' + extra],
      board: null,
      hint1: 'なにと なにの ことを きかれて いるかを よもう。',
      hint2: 'かごの かずは ' + ask + 'には かんけいないね。',
      explain: item1 + 'と ' + item2 + 'の かずだから ' + a + 'と ' + b + 'を つかう。いらない かずも まざって いるんだね。',
      story,
      learningKey: 'g2info:' + a + ':' + b + ':' + extra,
      math: null
    });
  }
};
