// 小2・かけざんライン。意味(ひとつぶん×いくつぶん)→式づくり→アレイ→くくの構成→性質→倍。
// くくは 暗唱だけに しない。前の答え・アレイ・分けて足す 考えから「作る」。

import { Q, ranged, randInt, pick, thing } from '../util.js';

const DAN_PAIRS = { g2_mul_t25: [2, 5], g2_mul_t34: [3, 4], g2_mul_t67: [6, 7], g2_mul_t891: [8, 9] };

function mulScene(rng, per, groups) {
  const item = thing(rng);
  const holders = ['はこ', 'ふくろ', 'さら'];
  const holder = pick(rng, holders);
  return {
    text: item.name + 'が ' + per + 'こずつ はいった ' + holder + 'が ' + groups + 'つ。ぜんぶで いくつ？',
    icon: item.icon
  };
}

// 8問目: 場面を かけざんの しきに して こたえる
function mulCapstone(rng, per, groups, key) {
  const scene = mulScene(rng, per, groups);
  return Q({
    kind: 'equation-build',
    prompt: scene.text,
    answer: per * groups,
    ops: ['＋', '−', '×'],
    instruction: 'すうじと けいさんの キーで しきを つくって 「けってい」',
    board: { type: 'trays', per, groups, icon: scene.icon },
    hint1: 'おなじ かずずつの ときは かけざんが つかえるよ。',
    hint2: 'しきは ' + per + '×' + groups + '。こたえも いれよう。',
    explain: per + 'こずつ ' + groups + 'つぶんで ' + per + '×' + groups + '＝' + per * groups + 'だね。',
    story: false,
    learningKey: key,
    math: { kind: 'mul', a: per, b: groups }
  });
}

function kukuQ(rng, slot, dan, k, keyPrefix) {
  const story = slot === 4;
  const scene = story ? mulScene(rng, dan, k) : null;
  return Q({
    kind: 'keypad',
    prompt: story ? scene.text : dan + '×' + k + 'は いくつ？',
    answer: dan * k,
    board: { type: 'array-grid', rows: dan, cols: k },
    hint1: '1つ まえの こたえに ' + dan + 'を たすと つぎの こたえだよ。',
    hint2: 'アレイの れつを ' + dan + '、' + dan * 2 + '、と かぞえて いこう。',
    explain: dan + 'が ' + k + 'こぶんで ' + dan * k + '。' + dan + 'のだんは ' + dan + 'ずつ ふえるんだね。',
    story,
    learningKey: keyPrefix + ':' + dan + ':' + k,
    math: { kind: 'mul', a: dan, b: k }
  });
}

function danStage(id) {
  return function (slot, rng) {
    const [d1, d2] = DAN_PAIRS[id];
    const dan = pick(rng, [d1, d2]);
    const k = ranged(rng, slot, [[2, 4], [2, 6], [3, 8], [5, 9]]);
    if (slot === 7) return mulCapstone(rng, dan, randInt(rng, 3, 9), id + 'c');
    return kukuQ(rng, slot, dan, k, id);
  };
}

export const g2MulStages = {
  // ── おなじ かずずつ(ひとつぶんと いくつぶん) ──
  g2_mul_groups(slot, rng) {
    const per = ranged(rng, slot, [[2, 4], [2, 5], [3, 6], [4, 9]]);
    const groups = randInt(rng, 2, 6);
    const story = slot === 4;
    const mode = slot % 3;
    const item = thing(rng);
    if (mode === 0 && !story) {
      return Q({
        kind: 'keypad',
        prompt: 'おさらに ' + item.name + 'が のっている。「ひとつぶんの かず」は いくつ？',
        answer: per,
        board: { type: 'trays', per, groups, icon: item.icon },
        hint1: '1さらだけ みて かぞえよう。',
        hint2: 'どの さらも おなじ かずに なっているよ。',
        explain: '1さらに ' + per + 'こずつ。これが ひとつぶんの かずだね。',
        story: false,
        learningKey: 'g2grp1:' + per + ':' + groups,
        math: { kind: 'mul', a: per, b: groups }
      });
    }
    if (mode === 1 && !story) {
      return Q({
        kind: 'keypad',
        prompt: item.name + 'の おさら。「いくつぶん」あるかな？',
        answer: groups,
        board: { type: 'trays', per, groups, icon: item.icon },
        hint1: 'さらの かずを かぞえよう。',
        hint2: 'なかみでは なく、まとまりの かずだよ。',
        explain: 'さらは ' + groups + 'つ。ひとつぶんが ' + groups + 'つぶん あるんだね。',
        story: false,
        learningKey: 'g2grp2:' + per + ':' + groups,
        math: { kind: 'mul', a: per, b: groups }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'こうえんの ベンチに ' + per + 'にんずつ すわっている。ベンチは ' + groups + 'つ。みんなで なんにん？'
        : item.name + 'が ' + per + 'こずつ ' + groups + 'さら。ぜんぶで いくつ？',
      answer: per * groups,
      board: { type: 'trays', per, groups, icon: story ? 'dot' : item.icon },
      hint1: per + 'ずつの とびかぞえで かぞえよう。',
      hint2: per + '、' + per * 2 + '、' + per * 3 + '、と ' + groups + 'かい すすむよ。',
      explain: per + 'こずつ ' + groups + 'つぶんで ' + per * groups + 'こ。おなじ かずずつだから かぞえやすいね。',
      story,
      learningKey: 'g2grp3:' + per + ':' + groups,
      math: { kind: 'mul', a: per, b: groups }
    });
  },

  // ── かけざんの しき(場面→式) ──
  g2_mul_expr(slot, rng) {
    const per = ranged(rng, slot, [[2, 4], [2, 6], [3, 8], [4, 9]]);
    const groups = randInt(rng, 2, 9);
    const story = slot === 4;
    const scene = mulScene(rng, per, groups);
    return Q({
      kind: 'equation-build',
      prompt: scene.text.replace('ぜんぶで いくつ？', 'かけざんの しきを つくろう。'),
      answer: per * groups,
      askAnswer: false,
      ops: ['＋', '−', '×'],
      instruction: 'すうじと けいさんの キーで しきを つくって 「けってい」',
      board: { type: 'trays', per, groups, icon: scene.icon },
      hint1: '「ひとつぶんの かず」と 「いくつぶん」を さがそう。',
      hint2: 'おなじ かずずつは ×の しきに なるよ。',
      explain: 'ひとつぶんが ' + per + '、いくつぶんが ' + groups + '。しきは ' + per + '×' + groups + 'で、ぜんぶは ' + per * groups + 'こだね。',
      story,
      learningKey: 'g2mexpr:' + per + ':' + groups,
      math: { kind: 'mul', a: per, b: groups }
    });
  },

  // ── アレイと たしざん(累加) ──
  g2_mul_array(slot, rng) {
    const rows = ranged(rng, slot, [[2, 3], [2, 4], [3, 5], [3, 6]]);
    let cols = randInt(rng, 3, 8);
    if (cols === rows) cols += 1;
    const story = slot === 4;
    const mode = slot % 2;
    if (mode === 1 && !story) {
      return Q({
        kind: 'keypad',
        prompt: 'たての ' + rows + 'こを 1れつと みる。' + rows + 'を なんかい たすと ぜんぶに なる？',
        answer: cols,
        board: { type: 'array-grid', rows, cols },
        hint1: 'よこに れつが いくつ ならんでいるか かぞえよう。',
        hint2: '1れつが ' + rows + 'こ。れつの かずだけ たすんだよ。',
        explain: 'れつは ' + cols + 'こ。' + rows + 'を ' + cols + 'かい たすのと ' + rows + '×' + cols + 'は おなじだね。',
        story: false,
        learningKey: 'g2arr2:' + rows + ':' + cols,
        math: { kind: 'mul', a: rows, b: cols }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'チョコの はこを あけたら、つぶが きれいに ならんでいた。ぜんぶで いくつ？'
        : 'ならんだ ○は ぜんぶで いくつ？',
      answer: rows * cols,
      board: { type: 'array-grid', rows, cols },
      hint1: '1れつぶんを かぞえて、れつの かずだけ たそう。',
      hint2: rows + 'こずつの れつが ならんでいるよ。' + rows + '、' + rows * 2 + '、と かぞえよう。',
      explain: rows + 'こずつ ' + cols + 'れつで ' + rows * cols + 'こ。ならべると かぞえやすいね。',
      story,
      learningKey: 'g2arr1:' + rows + ':' + cols,
      math: { kind: 'mul', a: rows, b: cols }
    });
  },

  g2_mul_t25: danStage('g2_mul_t25'),
  g2_mul_t34: danStage('g2_mul_t34'),
  g2_mul_t67: danStage('g2_mul_t67'),

  // ── 8・9・1のだん(1のだんは 盤面から よむ) ──
  g2_mul_t891(slot, rng) {
    if (slot === 7) return mulCapstone(rng, pick(rng, [8, 9]), randInt(rng, 3, 9), 'g2t891c');
    const useOne = slot % 4 === 3;
    if (useOne) {
      const groups = randInt(rng, 3, 9);
      return Q({
        kind: 'keypad',
        prompt: 'おさらに 1こずつ のっている。ぜんぶで いくつ？',
        answer: groups,
        board: { type: 'trays', per: 1, groups, icon: 'orange' },
        hint1: '1こずつだから、さらの かずと おなじに なるよ。',
        hint2: '1×いくつは、いくつの ままだね。',
        explain: '1こずつ ' + groups + 'さらで ' + groups + 'こ。1のだんは かける かずと おなじだよ。',
        story: false,
        learningKey: 'g2t1:' + groups,
        math: { kind: 'mul', a: 1, b: groups }
      });
    }
    const dan = pick(rng, [8, 9]);
    const k = ranged(rng, slot, [[2, 4], [2, 6], [3, 8], [5, 9]]);
    return kukuQ(rng, slot, dan, k, 'g2t891');
  },

  // ── くくの ひみつ(ふえかた・いれかえ・わけて たす) ──
  g2_mul_prop(slot, rng) {
    const story = slot === 4;
    const mode = story ? 1 : slot % 3;
    if (mode === 0) {
      const rows = randInt(rng, 3, 9);
      const cols = randInt(rng, 3, 7);
      return Q({
        kind: 'keypad',
        prompt: 'アレイに たての 1れつを たす。○は いくつ ふえる？',
        answer: rows,
        board: { type: 'array-grid', rows, cols },
        hint1: '1れつは たてに ならんだ ○の かずだよ。',
        hint2: 'たてに いくつ ならんでいるか かぞえよう。',
        explain: '1れつで ' + rows + 'こ ふえる。かける かずが 1 ふえると、こたえは だんの かずだけ ふえるんだね。',
        story: false,
        learningKey: 'g2prop1:' + rows + ':' + cols,
        math: { kind: 'mul', a: rows, b: cols }
      });
    }
    if (mode === 1) {
      const a = randInt(rng, 3, 9);
      let b = randInt(rng, 2, 9);
      if (b === a) b = a - 1;
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'トトは ' + a + '×' + b + '、モクモは ' + b + '×' + a + 'を けいさんした。どちらの こたえも いくつ？'
          : a + '×' + b + 'と ' + b + '×' + a + '。どちらの こたえも いくつ？',
        answer: a * b,
        board: { type: 'array-grid', rows: a, cols: b },
        hint1: 'アレイを よこから みても、たてから みても、○の かずは おなじだよ。',
        hint2: 'どちらか けいさんしやすい ほうで もとめよう。',
        explain: 'かける じゅんばんを かえても こたえは おなじ。' + a + '×' + b + '＝' + a * b + 'だね。',
        story,
        learningKey: 'g2prop2:' + Math.min(a, b) + ':' + Math.max(a, b),
        math: { kind: 'mul', a, b }
      });
    }
    let dan = randInt(rng, 4, 9);
    let k = randInt(rng, 6, 9);
    let split = randInt(rng, 2, 4);
    let guard = 0;
    while ((k - split === dan || k - split === split || k - split === k) && guard < 20) {
      dan = randInt(rng, 4, 9);
      k = randInt(rng, 6, 9);
      split = randInt(rng, 2, 4);
      guard += 1;
    }
    if (k - split === dan) dan = dan === 9 ? 8 : dan + 1;
    return Q({
      kind: 'keypad',
      prompt: dan + '×' + k + 'は、' + dan + '×' + split + 'と ' + dan + '×いくつに わけられる？',
      answer: k - split,
      board: { type: 'array-grid', rows: dan, cols: k, splitAt: split },
      hint1: 'れつを ふたつの まとまりに わけて みよう。',
      hint2: k + 'れつを ' + split + 'れつと のこりに わけるよ。',
      explain: k + 'れつは ' + split + 'れつと ' + (k - split) + 'れつ。わけて たしても こたえは おなじだね。',
      story: false,
      learningKey: 'g2prop3:' + dan + ':' + k + ':' + split,
      math: { kind: 'mul', a: dan, b: k }
    });
  },

  // ── ばいと くくの さき ──
  g2_mul_times(slot, rng) {
    const story = slot === 4;
    if (slot === 7) return mulCapstone(rng, randInt(rng, 2, 4), randInt(rng, 10, 12), 'g2timesc');
    const mode = slot % 2;
    if (mode === 0 || story) {
      const base = randInt(rng, 3, 9);
      const times = randInt(rng, 2, 4);
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'あかい テープは ' + base + 'cm。あおい テープは その ' + times + 'ばいの ながさ。なんcm？'
          : base + 'cmの ' + times + 'ばいは なんcm？',
        answer: base * times,
        board: { type: 'times-tape', base, times },
        hint1: times + 'ばいは、おなじ ながさの ' + times + 'つぶんだよ。',
        hint2: 'しきに すると ' + base + '×' + times + 'だね。',
        explain: base + 'cmの ' + times + 'つぶんで ' + base * times + 'cm。ばいは かけざんで もとめられるね。',
        story,
        learningKey: 'g2times:' + base + ':' + times,
        math: { kind: 'mul', a: base, b: times }
      });
    }
    const dan = randInt(rng, 2, 5);
    const k = randInt(rng, 10, 12);
    return Q({
      kind: 'keypad',
      prompt: dan + '×' + k + 'は いくつ？ くくの つづきを つくろう。',
      answer: dan * k,
      board: { type: 'array-grid', rows: dan, cols: k },
      hint1: dan + '×9の こたえに、' + dan + 'を たしていけば いいよ。',
      hint2: dan + '×9＝' + dan * 9 + '。そこから ' + dan + 'ずつ すすもう。',
      explain: dan + '×9の ' + dan * 9 + 'から ' + dan + 'ずつ ふやして ' + dan * k + '。くくの さきも つくれるね。',
      story: false,
      learningKey: 'g2over:' + dan + ':' + k,
      math: { kind: 'mul', a: dan, b: k }
    });
  }
};
