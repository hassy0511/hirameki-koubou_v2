// 小3・しらべる・とくライン。集計→表→棒グラフ(読む・つくる・目盛り)→組合せ表→分析→演算決定→□の式。

import { Q, ranged, randInt, pick, shuffle, thing } from '../util.js';

const TOPICS = [
  { label: 'サッカー', icon: 'dot' },
  { label: 'やきゅう', icon: 'dot' },
  { label: 'ドッジボール', icon: 'dot' },
  { label: 'なわとび', icon: 'dot' },
  { label: 'おにごっこ', icon: 'dot' }
];

function graphData(rng, maxCount, step) {
  const rows = shuffle(rng, TOPICS).slice(0, 3);
  const counts = [];
  while (counts.length < 3) {
    const c = randInt(rng, 1, maxCount) * (step || 1);
    if (!counts.includes(c)) counts.push(c);
  }
  return rows.map((t, i) => ({ label: t.label, count: counts[i] }));
}

export const g3SolveStages = {
  // ── せいの じで しゅうけい ──
  g3_sol_tally(slot, rng) {
    const count = ranged(rng, slot, [[8, 13], [11, 17], [13, 22], [16, 28]]);
    const topic = pick(rng, TOPICS);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'すきな あそび しらべで、' + topic.label + 'に 1ぴょうずつ しるしを つけた。なんにんが えらんだ？'
        : topic.label + 'の しるしは ぜんぶで いくつ？',
      answer: count,
      board: { type: 'tally-marks', count, label: topic.label },
      hint1: '5ほんずつの まとまりで かぞえよう。',
      hint2: '5、10、15、と とびかぞえして のこりを たすよ。',
      explain: '5の まとまり ' + Math.floor(count / 5) + 'こと ばら ' + (count % 5) + 'ほんで ' + count + '。もれなく かぞえられたね。',
      story,
      learningKey: 'g3ty:' + count + ':' + topic.label,
      math: { kind: 'count', n: count }
    });
  },

  // ── ひょうに まとめる ──
  g3_sol_table(slot, rng) {
    const rows = graphData(rng, ranged(rng, slot, [[6, 9], [8, 12], [10, 16], [12, 20]]));
    const story = slot === 4;
    const mode = slot % 2;
    if (mode === 0 && !story) {
      const target = pick(rng, rows);
      return Q({
        kind: 'keypad',
        prompt: 'ひょうで ' + target.label + 'は なんにん？',
        answer: target.count,
        board: { type: 'table-1d', rows },
        hint1: target.label + 'の れつを たどろう。',
        hint2: 'らんの かずを そのまま よめば いいよ。',
        explain: target.label + 'は ' + target.count + 'にん。ひょうは かずが さがしやすいね。',
        story: false,
        learningKey: 'g3tb1:' + target.label + ':' + target.count,
        math: null
      });
    }
    const total = rows.reduce((s, r) => s + r.count, 0);
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'クラスの すきな あそび しらべが ひょうに なった。こたえた 人は ぜんぶで なんにん？'.replace('人', 'ひと')
        : 'ひょうの ごうけいは いくつ？',
      answer: total,
      board: { type: 'table-1d', rows },
      hint1: 'ぜんぶの らんの かずを たそう。',
      hint2: rows.map(r => r.count).join('＋') + 'を けいさんするよ。',
      explain: 'ごうけいは ' + total + '。ごうけいの らんが あると たしかめに つかえるね。',
      story,
      learningKey: 'g3tb2:' + rows.map(r => r.count).join(':'),
      math: null
    });
  },

  // ── ぼうグラフを よむ ──
  g3_sol_bar_read(slot, rng) {
    const step = slot < 3 ? 1 : pick(rng, [1, 2]);
    const rows = graphData(rng, ranged(rng, slot, [[4, 6], [5, 8], [5, 9], [6, 10]]), step);
    const story = slot === 4;
    const mode = slot % 2;
    if (mode === 0 || story) {
      const target = pick(rng, rows);
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'たいいくの じかんの きろくが グラフに なった。' + target.label + 'は なんにん？'
          : 'グラフで ' + target.label + 'は なんにん？',
        answer: target.count,
        board: { type: 'bar-graph', columns: rows, step },
        hint1: 'まず 1めもりが いくつかを たしかめよう。',
        hint2: 'ぼうの さきの めもりを よこに たどろう。',
        explain: target.label + 'は ' + target.count + 'にん。めもりの おおきさに ちゅういして よめたね。',
        story,
        learningKey: 'g3br1:' + target.label + ':' + target.count + ':' + step,
        math: null
      });
    }
    const sorted = rows.slice().sort((a, b) => b.count - a.count);
    const diff = sorted[0].count - sorted[2].count;
    return Q({
      kind: 'keypad',
      prompt: 'いちばん おおい ' + sorted[0].label + 'と いちばん すくない ' + sorted[2].label + 'の ちがいは なんにん？',
      answer: diff,
      board: { type: 'bar-graph', columns: rows, step },
      hint1: 'ふたつの ぼうの たかさの ちがいを みよう。',
      hint2: sorted[0].count + '−' + sorted[2].count + 'を けいさんするよ。',
      explain: 'ちがいは ' + diff + 'にん。グラフは ちがいも みつけやすいね。',
      story: false,
      learningKey: 'g3br2:' + rows.map(r => r.count).join(':'),
      math: null
    });
  },

  // ── ぼうグラフを つくる ──
  g3_sol_bar_make(slot, rng) {
    const n = ranged(rng, slot, [[2, 4], [3, 6], [4, 8], [6, 9]]);
    const topic = pick(rng, TOPICS);
    const story = slot === 4;
    return Q({
      kind: 'count-tap',
      prompt: story
        ? 'しらべた けっかを グラフに する。' + topic.label + 'は ' + n + 'にん だったので、ぼうを ' + n + 'めもりぶん のばそう。'
        : 'ひょうの ' + topic.label + 'は ' + n + 'にん。ぼうを ' + n + 'めもりぶん のばそう。',
      instruction: 'したから じゅんに タップして 「けってい」',
      answer: n,
      task: 'produce',
      board: { type: 'graph-make', label: topic.label, icon: 'dot', supply: 10 },
      hint1: '0から したから じゅんに のばすよ。',
      hint2: 'ひょうの かずと おなじ たかさで とめよう。',
      explain: 'ぼうの たかさは ' + n + 'めもり。0から のばすのが やくそくだね。',
      story,
      learningKey: 'g3bm:' + n,
      math: { kind: 'count', n }
    });
  },

  // ── めもりの おおきさ ──
  g3_sol_scale(slot, rng) {
    const step = pick(rng, slot < 3 ? [2, 5] : [2, 5, 10]);
    const k = randInt(rng, 2, 8);
    const rows = graphData(rng, 8, step);
    const story = slot === 4;
    const mode = slot % 2;
    if (mode === 0 || story) {
      const target = pick(rng, rows);
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'がっこうぜんいんの きろくなので、めもりの おおきな グラフに なった。' + target.label + 'は なんにん？'
          : 'この グラフで ' + target.label + 'は なんにん？',
        answer: target.count,
        board: { type: 'bar-graph', columns: rows, step, hideNote: true },
        hint1: 'じくの すうじから 1めもりの おおきさを よみとろう。',
        hint2: '1めもりが 1とは かぎらないよ。',
        explain: target.label + 'は ' + target.count + 'にん。1めもりの おおきさを さきに たしかめるのが コツだね。',
        story,
        learningKey: 'g3sc1:' + target.count + ':' + step,
        math: null
      });
    }
    return Q({
      kind: 'keypad',
      prompt: '1めもりが ' + step + 'にんの グラフで、ぼうが めもり ' + k + 'こぶん。なんにん？',
      answer: step * k,
      board: null,
      hint1: '1めもりの おおきさ×めもりの かずだよ。',
      hint2: step + '×' + k + 'を けいさんしよう。',
      explain: step + '×' + k + '＝' + step * k + '。めもりが おおきいと たくさんの かずも あらわせるね。',
      story: false,
      learningKey: 'g3sc2:' + step + ':' + k,
      math: { kind: 'mul', a: step, b: k }
    });
  },

  // ── くみあわせた ひょう ──
  g3_sol_combined(slot, rng) {
    const rows = shuffle(rng, TOPICS).slice(0, 3);
    const april = rows.map(() => randInt(rng, 3, 12));
    const may = rows.map(() => randInt(rng, 3, 12));
    const idx = randInt(rng, 0, 2);
    const story = slot === 4;
    const mode = slot % 2;
    const data = rows.map((r, i) => ({ label: r.label, count: april[i] + may[i] }));
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: (story ? 'ひとつの ひょうに まとめる こうじちゅう。' : '') + '4がつに ' + april[idx] + 'にん、5がつに ' + may[idx] + 'にんが ' + rows[idx].label + 'を えらんだ。あわせて なんにん？',
        answer: april[idx] + may[idx],
        board: { type: 'table-1d', rows: data },
        hint1: 'おなじ あそびの 2つの かずを たすよ。',
        hint2: april[idx] + '＋' + may[idx] + 'を けいさんしよう。',
        explain: 'あわせて ' + (april[idx] + may[idx]) + 'にん。くみあわせた ひょうの 1らんが できたね。',
        story,
        learningKey: 'g3cb1:' + april[idx] + ':' + may[idx],
        math: { kind: 'add', a: april[idx], b: may[idx] }
      });
    }
    const total = data.reduce((s, r) => s + r.count, 0);
    return Q({
      kind: 'keypad',
      prompt: '2つきぶんを まとめた ひょう。ごうけいは なんにん？',
      answer: total,
      board: { type: 'table-1d', rows: data },
      hint1: 'まとめた らんの かずを ぜんぶ たそう。',
      hint2: data.map(r => r.count).join('＋') + 'だね。',
      explain: 'ごうけいは ' + total + 'にん。まとめると ぜんたいが みえるね。',
      story: false,
      learningKey: 'g3cb2:' + data.map(r => r.count).join(':'),
      math: null
    });
  },

  // ── グラフから いえる こと ──
  g3_sol_analyze(slot, rng) {
    const rows = graphData(rng, 8, 1);
    const sorted = rows.slice().sort((a, b) => b.count - a.count);
    const story = slot === 4;
    const correct = '「' + sorted[0].label + '」が いちばん おおい';
    const options = shuffle(rng, [
      correct,
      '「' + sorted[2].label + '」が いちばん おおい',
      '「' + sorted[0].label + '」と 「' + sorted[2].label + '」は おなじ かず'
    ]);
    return Q({
      kind: 'choice',
      prompt: (story ? 'はっぴょうの げんこうづくり。' : '') + 'グラフから いえる ことは どれ？',
      answer: correct,
      options,
      board: { type: 'bar-graph', columns: rows, step: 1 },
      hint1: 'ぼうの たかさを くらべて たしかめよう。',
      hint2: 'いちばん たかい ぼうは どれかな。',
      explain: correct + 'が ただしい。グラフを こんきょに して いえたね。',
      story,
      learningKey: 'g3az:' + rows.map(r => r.count).join(':'),
      math: null
    });
  },

  // ── どの けいさんを つかう？ ──
  g3_sol_four_ops(slot, rng) {
    const item = thing(rng);
    const kind = pick(rng, ['add', 'sub', 'mul', 'div']);
    const story = slot === 4;
    let text = '';
    let answer = '';
    if (kind === 'add') {
      const a = randInt(rng, 14, 48);
      const b = randInt(rng, 13, 39);
      text = item.name + 'が ' + a + 'こと ' + b + 'こ。あわせて なんこか もとめたい。';
      answer = 'たしざん';
    } else if (kind === 'sub') {
      const a = randInt(rng, 25, 60);
      const b = randInt(rng, 12, 24);
      text = item.name + 'が ' + a + 'こ あって、' + b + 'こ つかった。のこりを もとめたい。';
      answer = 'ひきざん';
    } else if (kind === 'mul') {
      const a = randInt(rng, 3, 8);
      const b = randInt(rng, 4, 9);
      text = '1はこ ' + a + 'こいりの ' + item.name + 'が ' + b + 'はこ。ぜんぶの かずを もとめたい。';
      answer = 'かけざん';
    } else {
      const b = randInt(rng, 3, 6);
      const q = randInt(rng, 4, 8);
      text = item.name + 'が ' + b * q + 'こ。' + b + 'にんで おなじ かずずつ わけたい。';
      answer = 'わりざん';
    }
    return Q({
      kind: 'choice',
      prompt: (story ? 'といの ぶんせきタイム。' : '') + text + ' つかう けいさんは どれ？',
      answer,
      options: ['たしざん', 'ひきざん', 'かけざん', 'わりざん'],
      board: null,
      hint1: 'ふえる? へる? おなじ かずずつ? どれかな。',
      hint2: '「あわせて」は たしざん、「おなじ かずずつ わける」は わりざんだよ。',
      explain: 'この ばめんは ' + answer + '。ことばから けいさんを えらべたね。',
      story,
      learningKey: 'g3fo:' + kind + ':' + text.length,
      math: null
    });
  },

  // ── □を つかった しき ──
  g3_sol_box(slot, rng) {
    const mode = slot % 3;
    const story = slot === 4;
    if (mode === 0 || story) {
      const b = randInt(rng, 13, 38);
      let extra = randInt(rng, 14, 45);
      if (extra === b) extra += 1;
      const total = b + extra;
      const hole = total - b;
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'はこに いくつか はいって いた。' + b + 'こ たしたら ぜんぶで ' + total + 'こ。はじめの かずを □と すると、□＋' + b + '＝' + total + '。□は いくつ？'
          : '□＋' + b + '＝' + total + '。□は いくつ？',
        answer: hole,
        board: { type: 'tape-2', top: { label: 'ぜんぶ ' + total, value: total }, parts: [{ label: '□', value: null }, { label: b + 'こ', value: b }] },
        hint1: 'ずの どこが □かを みよう。',
        hint2: total + '−' + b + 'で もとめられるよ。',
        explain: '□＝' + total + '−' + b + '＝' + hole + '。ぎゃくの けいさんで □が わかるね。',
        story,
        learningKey: 'g3bx1:' + b + ':' + total,
        math: { kind: 'sub', a: total, b }
      });
    }
    if (mode === 1) {
      const b = randInt(rng, 3, 8);
      let q = randInt(rng, 4, 9);
      if (q === b) q = q === 9 ? 8 : q + 1;
      return Q({
        kind: 'keypad',
        prompt: '□×' + b + '＝' + b * q + '。□は いくつ？',
        answer: q,
        board: { type: 'array-grid', rows: b, cols: q },
        hint1: b + 'のだんの くくで さがそう。',
        hint2: b * q + '÷' + b + 'でも もとめられるよ。',
        explain: '□＝' + q + '。' + q + '×' + b + '＝' + b * q + 'で たしかめられるね。',
        story: false,
        learningKey: 'g3bx2:' + b + ':' + q,
        math: { kind: 'div', a: b * q, b }
      });
    }
    const b = randInt(rng, 12, 35);
    const rest = randInt(rng, 13, 40);
    const start = b + rest;
    return Q({
      kind: 'keypad',
      prompt: '□−' + b + '＝' + rest + '。□は いくつ？',
      answer: start,
      board: { type: 'tape-2', top: { label: '□', value: null }, parts: [{ label: b + 'こ', value: b }, { label: rest + 'こ', value: rest }] },
      hint1: '□は ひく まえの かずだよ。',
      hint2: b + '＋' + rest + 'で もどせるよ。',
      explain: '□＝' + b + '＋' + rest + '＝' + start + '。ひきざんの □は たしざんで もどすんだね。',
      story: false,
      learningKey: 'g3bx3:' + b + ':' + rest,
      math: { kind: 'add', a: b, b: rest }
    });
  }
};
