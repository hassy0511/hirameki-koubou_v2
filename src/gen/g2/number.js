// 小2・おおきな かずライン。1000まで→位取り→相対的な見方→大小→数直線→10000→分数。
// 盤面は かずの構成(たば・ブロック・めもり)を見せ、答えの数字そのものは見せない。

import { Q, ranged, randInt, pick } from '../util.js';

const KURAI = ['いち', 'じゅう', 'ひゃく', 'せん'];

function digitsOf(n) {
  return { sen: Math.floor(n / 1000) % 10, hyaku: Math.floor(n / 100) % 10, ju: Math.floor(n / 10) % 10, ichi: n % 10 };
}

export const g2NumberStages = {
  // ── まとまりで かぞえる(2・5・10の とびかぞえ) ──
  g2_num_group(slot, rng) {
    const per = pick(rng, [2, 5, 10]);
    const groups = ranged(rng, slot, [[3, 5], [4, 7], [5, 9], [6, 9]]);
    const total = per * groups;
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'トトが どんぐりを ' + per + 'こずつ ふくろに いれた。ふくろは ' + groups + 'つ。ぜんぶで いくつ？'
        : '1つの まとまりに ' + per + 'こずつ。まとまりは ' + groups + 'こ。ぜんぶで いくつ？',
      answer: total,
      board: { type: 'trays', per, groups, icon: 'acorn' },
      hint1: per + '、' + per * 2 + '、と とびで かぞえよう。',
      hint2: 'とびかぞえを まとまりの かずだけ つづけるよ。',
      explain: per + 'こずつ ' + groups + 'まとまりで ' + total + 'こ。とびかぞえが はやいね。',
      story,
      learningKey: 'g2grp:' + per + ':' + groups,
      math: { kind: 'group', per, groups }
    });
  },

  // ── 1000までの かず(ブロックを よむ) ──
  g2_num_to1000(slot, rng) {
    const h = ranged(rng, slot, [[1, 3], [2, 5], [3, 8], [5, 9]]);
    const t = randInt(rng, 0, 9);
    const o = randInt(rng, 0, 9);
    const n = h * 100 + t * 10 + o;
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'そうこに ひゃくの はこと じゅうの たばと ばらが とどいた。けいじばんの ぶんは、ぜんぶで いくつ？'
        : pick(rng, ['ひゃく・じゅう・いちの ブロック。あわせて いくつ？', 'ブロックの あらわす かずは いくつ？']),
      answer: n,
      board: { type: 'place-table', sen: 0, hyaku: h, ju: t, ichi: o },
      hint1: 'ひゃくの はこを 100、200、と かぞえよう。',
      hint2: 'ひゃく→じゅう→いちの じゅんに、くらいごとに よむよ。',
      explain: 'ひゃくが ' + h + 'こ、じゅうが ' + t + 'こ、いちが ' + o + 'こ。あわせて ' + n + 'だね。',
      story,
      learningKey: 'g2t1000:' + n,
      math: { kind: 'place', n }
    });
  },

  // ── くらいの へや(3けたの 組み立てと 分解) ──
  g2_num_place3(slot, rng) {
    const compose = slot % 2 === 0;
    const h = randInt(rng, 1, 9);
    const t = slot >= 2 && randInt(rng, 0, 2) === 0 ? 0 : randInt(rng, 0, 9);
    const o = randInt(rng, 0, 9);
    const n = h * 100 + t * 10 + o;
    const story = slot === 4;
    if (compose || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'モクモが カードを くばった。ひゃくが ' + h + 'まい、じゅうが ' + t + 'まい、いちが ' + o + 'まい。あわせた かずは？'
          : 'ひゃくが ' + h + 'こ、じゅうが ' + t + 'こ、いちが ' + o + 'この かずは？',
        answer: n,
        board: { type: 'place-table', sen: 0, hyaku: h, ju: t, ichi: o },
        hint1: 'くらいの へやに わけて かんがえよう。',
        hint2: t === 0 ? 'じゅうの へやが からの ときは 0を かくよ。' : 'ひゃく、じゅう、いちの じゅんに ならべよう。',
        explain: 'ならべると ' + n + '。' + (t === 0 ? 'じゅうの くらいは 0に なるよ。' : 'くらいの じゅんばんが だいじだよ。'),
        story,
        learningKey: 'g2p3c:' + n,
        math: { kind: 'place', n }
      });
    }
    const kurai = pick(rng, [0, 1, 2]);
    const answer = kurai === 0 ? o : kurai === 1 ? t : h;
    return Q({
      kind: 'keypad',
      prompt: n + 'の ' + KURAI[kurai] + 'の くらいは いくつ？',
      answer,
      board: { type: 'number-card', value: n },
      hint1: 'みぎから いち、じゅう、ひゃくの へやだよ。',
      hint2: KURAI[kurai] + 'の へやの すうじを そのまま こたえよう。',
      explain: n + 'の ' + KURAI[kurai] + 'の くらいは ' + answer + 'だね。',
      story: false,
      learningKey: 'g2p3d:' + n + ':' + kurai,
      math: { kind: 'place', n }
    });
  },

  // ── 10と 100の たば(相対的な 見方) ──
  g2_num_units(slot, rng) {
    const mode = slot % 3;
    const story = slot === 4;
    if (mode === 0 || story) {
      const k = ranged(rng, slot, [[11, 20], [13, 30], [21, 50], [31, 60]]);
      return Q({
        kind: 'keypad',
        prompt: story
          ? '10まいずつの シールが ' + k + 'たば ある。シールは ぜんぶで なんまい？'
          : '10が ' + k + 'こで いくつ？',
        answer: k * 10,
        board: null,
        hint1: '10が 10こで 100に なるよ。',
        hint2: '10が ' + Math.floor(k / 10) * 10 + 'こで ' + Math.floor(k / 10) * 100 + '。のこりの たばを たそう。',
        explain: '10が ' + k + 'こだから ' + k * 10 + '。10を たんいに かぞえたね。',
        story,
        learningKey: 'g2u10:' + k,
        math: { kind: 'unit', base: 10, k }
      });
    }
    if (mode === 1) {
      const k = randInt(rng, 2, 10);
      return Q({
        kind: 'keypad',
        prompt: '100が ' + k + 'こで いくつ？',
        answer: k * 100,
        board: null,
        hint1: '100、200、300、と かぞえよう。',
        hint2: '100が 10こ あつまると 1000だよ。',
        explain: '100が ' + k + 'こだから ' + k * 100 + 'だね。',
        story: false,
        learningKey: 'g2u100:' + k,
        math: { kind: 'unit', base: 100, k }
      });
    }
    const k = randInt(rng, 12, 60);
    return Q({
      kind: 'keypad',
      prompt: k * 10 + 'は 10が なんこ？',
      answer: k,
      board: { type: 'number-card', value: k * 10 },
      hint1: 'いちの くらいの 0を かくして みよう。',
      hint2: 'のこった すうじが、10の たばの かずだよ。',
      explain: k * 10 + 'は 10が ' + k + 'こ。0を かくすと みえて くるね。',
      story: false,
      learningKey: 'g2u10r:' + k,
      math: { kind: 'unit', base: 10, k }
    });
  },

  // ── どちらが おおきい？ ──
  g2_num_compare(slot, rng) {
    const digits = slot < 2 ? 2 : 3;
    const base = digits === 2 ? randInt(rng, 21, 89) : randInt(rng, 201, 899);
    const kurai = randInt(rng, 0, digits - 1);
    const step = Math.pow(10, kurai);
    let other = base + step * pick(rng, [-2, -1, 1, 2]);
    if (other < step || String(other).length !== String(base).length) other = base + step;
    const leftFirst = rng() < 0.5;
    const left = leftFirst ? base : other;
    const right = leftFirst ? other : base;
    const answer = left > right ? 'あ' : 'い';
    const story = slot === 4;
    const diffKurai = KURAI[String(left).split('').reverse().findIndex((ch, i) => ch !== String(right).split('').reverse()[i])];
    return Q({
      kind: 'choice',
      prompt: story
        ? '「あ」の はこに ' + left + 'こ、「い」の はこに ' + right + 'こ はいっている。おおいのは どっち？'
        : 'おおきい かずは どっち？',
      answer,
      options: ['あ', 'い'],
      board: { type: 'compare-pair', left, right },
      hint1: 'うえの くらいから じゅんに くらべよう。',
      hint2: 'おなじ くらいは とばして、ちがう くらいで きめるよ。',
      explain: diffKurai + 'の くらいで きまる。「' + answer + '」が おおきいね。',
      story,
      learningKey: 'g2cmp:' + left + ':' + right,
      math: { kind: 'compare', left, right }
    });
  },

  // ── かずの レール(数直線を よむ) ──
  g2_num_line(slot, rng) {
    const step = pick(rng, slot < 2 ? [10] : slot < 5 ? [10, 100] : [10, 100, 1000]);
    const ticks = 10;
    const k = randInt(rng, 1, ticks - 1);
    const value = step * k;
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'かずの レールを 0から しゅっぱつして、やじるしの えきに ついた。えきの かずは いくつ？'
        : 'やじるしの めもりの かずは いくつ？',
      answer: value,
      board: { type: 'numberline-read', min: 0, max: step * ticks, step, at: k },
      hint1: '1めもりが いくつぶんかを まず しらべよう。',
      hint2: '0から ' + step + '、' + step * 2 + '、と とびかぞえで すすもう。',
      explain: '1めもりは ' + step + '。めもり ' + k + 'こぶんで ' + value + 'だね。',
      story,
      learningKey: 'g2line:' + step + ':' + k,
      math: { kind: 'line', step, k }
    });
  },

  // ── 10000までの かず ──
  g2_num_to10000(slot, rng) {
    if (slot >= 6 && slot % 2 === 1) {
      return Q({
        kind: 'keypad',
        prompt: '1000が 10こで いくつ？',
        answer: 10000,
        board: null,
        hint1: '1000、2000、と かぞえて いこう。',
        hint2: '10こめで くらいが ひとつ あがるよ。',
        explain: '1000が 10こで 10000。いちまんと よむよ。',
        story: false,
        learningKey: 'g2man',
        math: { kind: 'place', n: 10000 }
      });
    }
    const se = ranged(rng, slot, [[1, 3], [2, 5], [3, 8], [5, 9]]);
    const h = randInt(rng, 0, 9);
    const t = randInt(rng, 0, 9);
    const o = randInt(rng, 0, 9);
    const n = se * 1000 + h * 100 + t * 10 + o;
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'まちの おおきな けいじばんに ブロックが ならんだ。あらわす かずは いくつ？'
        : pick(rng, ['せんの ブロックも つかった かず。いくつかな？', 'ブロックの あらわす かずは いくつ？']),
      answer: n,
      board: { type: 'place-table', sen: se, hyaku: h, ju: t, ichi: o },
      hint1: 'せんの はこを 1000、2000、と かぞえよう。',
      hint2: 'せん→ひゃく→じゅう→いちの じゅんに よむよ。0の へやも わすれずに。',
      explain: 'せんが ' + se + 'こ、ひゃくが ' + h + 'こ、じゅうが ' + t + 'こ、いちが ' + o + 'こで ' + n + 'だね。',
      story,
      learningKey: 'g2t10000:' + n,
      math: { kind: 'place', n }
    });
  },

  // ── 4けたの こうせい ──
  g2_num_place4(slot, rng) {
    const compose = slot % 2 === 0;
    const se = randInt(rng, 1, 9);
    const h = randInt(rng, 0, 9);
    const t = randInt(rng, 0, 9);
    const o = randInt(rng, 0, 9);
    const n = se * 1000 + h * 100 + t * 10 + o;
    const story = slot === 4;
    if (compose || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'カードあつめの けっか。1000が ' + se + 'まい、100が ' + h + 'まい、10が ' + t + 'まい、1が ' + o + 'まい。あわせると？'
          : '1000を ' + se + 'こ、100を ' + h + 'こ、10を ' + t + 'こ、1を ' + o + 'こ あわせた かずは？',
        answer: n,
        board: { type: 'place-table', sen: se, hyaku: h, ju: t, ichi: o },
        hint1: 'くらいの へやに じゅんばんに おいて みよう。',
        hint2: 'からの へやには 0を かくよ。',
        explain: 'ならべると ' + n + '。0の へやも かずの いちぶだね。',
        story,
        learningKey: 'g2p4c:' + n,
        math: { kind: 'place', n }
      });
    }
    const kurai = randInt(rng, 0, 3);
    const d = digitsOf(n);
    const answer = [d.ichi, d.ju, d.hyaku, d.sen][kurai];
    return Q({
      kind: 'keypad',
      prompt: n + 'の ' + KURAI[kurai] + 'の くらいは いくつ？',
      answer,
      board: { type: 'number-card', value: n },
      hint1: 'みぎから いち、じゅう、ひゃく、せんの へやだよ。',
      hint2: KURAI[kurai] + 'の へやの すうじを よもう。',
      explain: n + 'の ' + KURAI[kurai] + 'の くらいは ' + answer + 'だね。',
      story: false,
      learningKey: 'g2p4d:' + n + ':' + kurai,
      math: { kind: 'place', n }
    });
  },

  // ── おなじ おおきさに わける(単位分数) ──
  g2_num_frac(slot, rng) {
    const parts = pick(rng, [2, 3, 4]);
    const story = slot === 4;
    const item = pick(rng, ['テープ', 'チョコレート', 'リボン']);
    return Q({
      kind: 'choice',
      prompt: story
        ? 'おやつの ' + item + 'を おなじ おおきさに ' + parts + 'つに わけて、トトが 1つぶん たべた。たべたのは もとの おおきさの どれだけ？'
        : item + 'を おなじ おおきさに ' + parts + 'つに わけた。いろの ついた 1つぶんは、もとの おおきさの どれだけ？',
      answer: parts + 'ぶんの1',
      options: ['2ぶんの1', '3ぶんの1', '4ぶんの1'],
      board: { type: 'frac-tape', parts, shaded: 1 },
      hint1: 'いくつに わけたかを かぞえよう。',
      hint2: parts + 'つに わけた 1つぶんは 「' + parts + 'ぶんの1」と いうよ。',
      explain: 'おなじ おおきさに ' + parts + 'つに わけた 1つぶん。だから ' + parts + 'ぶんの1だね。',
      story,
      learningKey: 'g2frac:' + parts + (story ? 's' : ''),
      math: { kind: 'frac', parts }
    });
  }
};
