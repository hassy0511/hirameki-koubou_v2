// 小3・しょうすうと ぶんすうライン。同じ「1」を 10等分・n等分して、量→記号→数直線→計算へ。

import { Q, ranged, randInt, pick } from '../util.js';

function tenth(n) {
  return (n / 10).toFixed(1).replace(/\.0$/, n % 10 === 0 ? '.0' : '');
}

function dec1(n) {
  // 0.1の n こぶんを 小数の文字列に(浮動小数の ずれを避ける)
  return (Math.round(n) / 10).toFixed(1);
}

export const g3DecStages = {
  // ── 0.1の いみ ──
  g3_dec_tenths(slot, rng) {
    const n = ranged(rng, slot, [[2, 4], [2, 6], [3, 8], [4, 9]]);
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      decimals: true,
      prompt: story
        ? 'ジュース 1Lの ますを 10とうぶんした めもりで はかったら、いろの ついた ところまで はいっていた。なんL？'
        : '1を 10とうぶんした ' + 'めもりの ' + 'いろの ついた ぶぶんは いくつ？',
      answer: Number(dec1(n)),
      board: { type: 'frac-tape', parts: 10, shaded: n },
      hint1: '1めもりは 0.1だよ。',
      hint2: '0.1が ' + n + 'こぶんだね。',
      explain: '0.1の ' + n + 'こぶんで ' + dec1(n) + '。1に みたない はんぱも かずに できるんだね。',
      story,
      learningKey: 'g3te:' + n + (story ? 's' : ''),
      math: { kind: 'dec', tenths: n }
    });
  },

  // ── しょうすうの くらい ──
  g3_dec_place(slot, rng) {
    const mode = slot % 3;
    const story = slot === 4;
    const whole = randInt(rng, 1, 5);
    const t = randInt(rng, 1, 9);
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        decimals: true,
        prompt: story
          ? 'すいとうに みずが 1Lますで ' + whole + 'はいと、0.1Lますで ' + t + 'はい ぶん はいる。ぜんぶで なんL？'
          : '1が ' + whole + 'こと 0.1が ' + t + 'こで いくつ？',
        answer: Number(whole + '.' + t),
        board: null,
        hint1: '1の へやと 0.1の へやに わけて かんがえよう。',
        hint2: whole + 'と 0.' + t + 'を あわせるよ。',
        explain: 'あわせて ' + whole + '.' + t + '。てんの みぎが 0.1の くらいだよ。',
        story,
        learningKey: 'g3pl1:' + whole + ':' + t,
        math: { kind: 'dec', tenths: whole * 10 + t }
      });
    }
    if (mode === 1) {
      const total = whole * 10 + t;
      return Q({
        kind: 'keypad',
        prompt: whole + '.' + t + 'は 0.1が なんこ？',
        answer: total,
        board: null,
        hint1: '1は 0.1が 10こだったね。',
        hint2: whole + 'で ' + whole * 10 + 'こ。あと ' + t + 'こを たそう。',
        explain: whole + '.' + t + 'は 0.1が ' + total + 'こ。0.1を たんいに かぞえられるね。',
        story: false,
        learningKey: 'g3pl2:' + whole + ':' + t,
        math: { kind: 'dec', tenths: total }
      });
    }
    let count = randInt(rng, 12, 49);
    if (count % 10 === 0) count += 1; // 3.0 のような きりの いい かずは 表記が ぶれるので 避ける
    return Q({
      kind: 'keypad',
      decimals: true,
      prompt: '0.1を ' + count + 'こ あつめた かずは いくつ？',
      answer: Number(dec1(count)),
      board: null,
      hint1: '10こで 1に なるよ。',
      hint2: count + 'こは 1が ' + Math.floor(count / 10) + 'こと 0.1が ' + (count % 10) + 'こだね。',
      explain: '0.1が ' + count + 'こで ' + dec1(count) + '。10こずつ たばに すると わかりやすいね。',
      story: false,
      learningKey: 'g3pl3:' + count,
      math: { kind: 'dec', tenths: count }
    });
  },

  // ── しょうすうの レール ──
  g3_dec_line(slot, rng) {
    const base = ranged(rng, slot, [[0, 0], [0, 1], [0, 2], [1, 3]]);
    const k = randInt(rng, 1, 9);
    const story = slot === 4;
    const answer = Number((base + k / 10).toFixed(1));
    return Q({
      kind: 'keypad',
      decimals: true,
      prompt: story
        ? 'かずの レールの えきに とまった。やじるしの めもりの かずは？'
        : 'やじるしの めもりの かずは いくつ？',
      answer,
      board: { type: 'numberline-read', min: base, max: base + 1, step: 0.1, at: k, decimals: true },
      hint1: base + 'と ' + (base + 1) + 'の あいだが 10とうぶんされて いるよ。',
      hint2: '1めもりは 0.1。' + base + 'から 0.1ずつ すすもう。',
      explain: base + 'から 0.1が ' + k + 'こぶんで ' + answer + 'だね。',
      story,
      learningKey: 'g3dl:' + base + ':' + k,
      math: { kind: 'dec', tenths: base * 10 + k }
    });
  },

  // ── 0.1の いくつぶんで けいさん ──
  g3_dec_addsub(slot, rng) {
    const add = slot % 2 === 0;
    const story = slot === 4;
    let x = randInt(rng, 2, 8);
    if (!add && !story && x === 2) x = 3;
    let y = randInt(rng, 1, add ? 9 - x : x - 1);
    if (!add && x - y === y) y = y > 1 ? y - 1 : y + 1;
    if (!add && x - y === y) y = randInt(rng, 1, 9) !== y ? Math.max(1, y - 1) : y;
    const answer = Number(dec1(add || story ? x + y : x - y));
    return Q({
      kind: 'keypad',
      decimals: true,
      prompt: story
        ? 'みずが ' + dec1(x) + 'L はいって いる。あと ' + dec1(y) + 'L たすと なんL？'
        : add
          ? dec1(x) + '＋' + dec1(y) + 'は いくつ？'
          : dec1(x) + '−' + dec1(y) + 'は いくつ？',
      answer,
      board: { type: 'frac-tape', parts: 10, shaded: x },
      hint1: '0.1の いくつぶんかで かんがえよう。',
      hint2: '0.1が ' + x + 'こと ' + y + 'こ。' + (add || story ? 'あわせると' : 'ちがいは') + ' なんこかな。',
      explain: '0.1が ' + (add || story ? x + y : x - y) + 'こぶんで ' + answer + '。0.1を たんいに すれば いままでの けいさんだね。',
      story,
      learningKey: 'g3da:' + x + ':' + y + (add ? 'a' : 's'),
      math: { kind: 'dec', tenths: add || story ? x + y : x - y }
    });
  },

  // ── しょうすうの ひっさん ──
  g3_dec_written(slot, rng) {
    const add = slot % 2 === 0;
    const story = slot === 4;
    const a = randInt(rng, 12, 68);
    let b = randInt(rng, 11, add ? 92 - a : a - 5);
    if (!add && a - b === b) b -= 1;
    const A = dec1(a);
    const B = dec1(b);
    const answer = Number(dec1(add || story ? a + b : a - b));
    return Q({
      kind: 'keypad',
      decimals: true,
      prompt: story
        ? 'テープを ' + A + 'mと ' + B + 'm きった。あわせて なんm？'
        : 'ひっさんの こたえは いくつ？',
      answer,
      board: { type: 'column-calc', a: A, b: B, op: add || story ? '＋' : '−' },
      hint1: 'しょうすうてんを たてに そろえるのが やくそくだよ。',
      hint2: '0.1が 10こ あつまったら 1に くりあがるよ。',
      explain: 'てんを そろえて けいさんすると ' + answer + '。くらいの しくみは せいすうと おなじだね。',
      story,
      learningKey: 'g3dw:' + a + ':' + b + (add ? 'a' : 's'),
      math: { kind: 'dec', tenths: add || story ? a + b : a - b }
    });
  },

  // ── ぶんすうの かきかた ──
  g3_frac_note(slot, rng) {
    const parts = pick(rng, [3, 4, 5, 6, 8]);
    const shaded = randInt(rng, 1, parts - 1);
    const story = slot === 4;
    const correct = parts + 'ぶんの' + shaded;
    const optionSet = [correct, shaded + 'ぶんの' + parts, parts + 'ぶんの' + Math.min(parts - 1, shaded + 1)];
    return Q({
      kind: 'choice',
      prompt: story
        ? 'テープを おなじ ながさに ' + parts + 'つに わけて、いろを ぬった。ぬった ぶぶんは もとの どれだけ？'
        : '1を ' + parts + 'とうぶんした ' + shaded + 'こぶんは どれ？',
      answer: correct,
      options: Array.from(new Set(optionSet)),
      board: { type: 'frac-tape', parts, shaded },
      hint1: 'わけた かずが ぶんぼ(したの かず)だよ。',
      hint2: 'いろの ついた こすうが ぶんし(うえの かず)だね。',
      explain: parts + 'とうぶんの ' + shaded + 'こぶんで ' + correct + '。したが わけた かず、うえが とった かずだよ。',
      story,
      learningKey: 'g3fn:' + parts + ':' + shaded,
      math: { kind: 'frac', parts, shaded }
    });
  },

  // ── ぶんすうの おおきさ ──
  g3_frac_unit(slot, rng) {
    const mode = slot === 0 ? 0 : 1;
    const story = slot === 4;
    if (mode === 0 && !story) {
      return Q({
        kind: 'choice',
        prompt: '0.1と おなじ おおきさの ぶんすうは どれ？',
        answer: '10ぶんの1',
        options: ['10ぶんの1', '1ぶんの10', '10ぶんの10'],
        board: { type: 'frac-tape', parts: 10, shaded: 1 },
        hint1: 'どちらも 1を 10とうぶんした 1こぶんだよ。',
        hint2: 'したの かずが わけた かずだったね。',
        explain: '0.1＝10ぶんの1。しょうすうと ぶんすうは おなじ おおきさを あらわせるんだね。',
        story: false,
        learningKey: 'g3fu0',
        math: null
      });
    }
    const parts = pick(rng, [4, 5, 6, 8]);
    const x = randInt(rng, 1, parts - 2);
    const y = randInt(rng, x + 1, parts - 1);
    const askBig = slot % 3 !== 2;
    return Q({
      kind: 'choice',
      prompt: (story ? 'ピザの のこりくらべ。' : '') + parts + 'ぶんの' + x + 'と ' + parts + 'ぶんの' + y + '、' + (askBig ? 'おおきいのは' : 'ちいさいのは') + ' どっち？',
      answer: parts + 'ぶんの' + (askBig ? y : x),
      options: [parts + 'ぶんの' + x, parts + 'ぶんの' + y],
      board: { type: 'frac-tape', parts, shaded: y },
      hint1: 'おなじ おおきさに わけた こすうで くらべよう。',
      hint2: 'ぶんぼが おなじなら、ぶんしが おおきい ほうが おおきいよ。',
      explain: 'おなじ ' + parts + 'とうぶんなら、' + (askBig ? y : x) + 'こぶんの ほうが ' + (askBig ? 'おおきい' : 'ちいさい') + '。' + parts + 'ぶんの' + (askBig ? y : x) + 'だね。',
      story,
      learningKey: 'g3fu:' + parts + ':' + x + ':' + y + (askBig ? 'b' : 's'),
      math: { kind: 'frac', parts }
    });
  },

  // ── ぶんすうの たしひき ──
  g3_frac_addsub(slot, rng) {
    const parts = pick(rng, [4, 5, 6, 7, 8]);
    const add = slot % 2 === 0;
    const story = slot === 4;
    const x = randInt(rng, 1, parts - 2);
    let y = randInt(rng, 1, add ? parts - x - 1 : x);
    if (!add && y === x) y = Math.max(1, y - 1);
    if (!add && x - y === 0) y = Math.max(1, x - 1);
    const resNum = add || story ? x + y : x - y;
    const correct = parts + 'ぶんの' + resNum;
    const options = Array.from(new Set([
      correct,
      (parts * 2) + 'ぶんの' + resNum,
      parts + 'ぶんの' + Math.min(parts, resNum + 1)
    ]));
    return Q({
      kind: 'choice',
      prompt: story
        ? 'ジュースを ' + parts + 'ぶんの' + x + 'Lと ' + parts + 'ぶんの' + y + 'L あわせる。なんLに なる？'
        : parts + 'ぶんの' + x + (add ? '＋' : '−') + parts + 'ぶんの' + y + 'は どれ？',
      answer: correct,
      options,
      board: { type: 'frac-tape', parts, shaded: add || story ? x + y : x },
      hint1: 'ぶんぼは そのままで、ぶんしだけ けいさんするよ。',
      hint2: x + (add || story ? '＋' : '−') + y + 'こぶんに なるね。',
      explain: parts + 'ぶんの いくつが ' + resNum + 'こぶんで ' + correct + '。ぶんぼは かわらないんだね。',
      story,
      learningKey: 'g3fa:' + parts + ':' + x + ':' + y + (add ? 'a' : 's'),
      math: { kind: 'frac', parts }
    });
  },

  // ── しょうすうと ぶんすうの へんかん ──
  g3_dec_convert(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const n = randInt(rng, 1, 9);
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'モクモの メモに 「0.' + n + '」と かいて ある。10ぶんの いくつと おなじ？'
          : '0.' + n + 'は 10ぶんの なん？',
        answer: n,
        board: { type: 'frac-tape', parts: 10, shaded: n },
        hint1: '0.1が なんこぶんかを かぞえよう。',
        hint2: '0.1＝10ぶんの1だったね。',
        explain: '0.' + n + 'は 0.1が ' + n + 'こ。だから 10ぶんの' + n + 'だね。',
        story,
        learningKey: 'g3cv1:' + n,
        math: { kind: 'dec', tenths: n }
      });
    }
    return Q({
      kind: 'keypad',
      decimals: true,
      prompt: '10ぶんの' + n + 'を しょうすうで かくと いくつ？',
      answer: Number('0.' + n),
      board: { type: 'frac-tape', parts: 10, shaded: n },
      hint1: '10とうぶんの ' + n + 'こぶんだよ。',
      hint2: '0.1の ' + n + 'こぶんと おなじだね。',
      explain: '10ぶんの' + n + '＝0.' + n + '。おなじ おおきさを ふたつの かきかたで あらわせるんだね。',
      story: false,
      learningKey: 'g3cv2:' + n,
      math: { kind: 'dec', tenths: n }
    });
  }
};
