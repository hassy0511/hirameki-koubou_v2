// 小2・はかるライン。共通単位→cm・mm→長さの計算→かさ(L・dL・mL)→時こくと時間→m。
// ものさし・ますの盤面は 目盛りを正確に描き、読みの根拠を必ず盤面に置く。

import { Q, ranged, randInt, pick } from '../util.js';

export const g2MeasureStages = {
  // ── そろえて はかる(共通単位の 必要性) ──
  g2_mea_unit(slot, rng) {
    const cases = [
      { s: 'トトは えんぴつ 5ほんぶん、モクモは けしゴム 8こぶんと はかった。ながさを ちゃんと くらべるには？', a: 'おなじ ものさしで はかる', k: 'unify' },
      { s: 'つくえの よこの ながさを、とおくの ともだちにも つたわるように はかりたい。', a: 'おなじ ものさしで はかる', k: 'tell' },
      { s: 'ながさを はかる まえに、だいたい どれくらいか かんがえたい。', a: 'よそうを たててから はかる', k: 'estimate' },
      { s: 'えんぴつより みじかい クリップを くわしく はかりたい。', a: 'ちいさい めもりの ものさしを つかう', k: 'small' },
      { s: 'きょうしつの たての ながさの ような ながい ところを はかりたい。', a: 'ながい ものさしを つかう', k: 'long' },
      { s: 'ふたりが べつべつの もので はかったら、かずが あわなかった。', a: 'おなじ ものさしで はかる', k: 'mismatch' }
    ];
    const chosen = pick(rng, cases);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: (story ? 'こうぼうで そうだん。' : '') + chosen.s + pick(rng, [' どう すれば いい？', ' どう するのが いい？', ' なにが ひつよう？']),
      answer: chosen.a,
      options: ['おなじ ものさしで はかる', 'よそうを たててから はかる', 'ちいさい めもりの ものさしを つかう', 'ながい ものさしを つかう'],
      board: null,
      hint1: 'なにが こまっているのかを まず みつけよう。',
      hint2: 'くらべたい ときは、はかる ものさしを そろえるんだったね。',
      explain: 'この ときは 「' + chosen.a + '」が いいね。',
      story,
      learningKey: 'g2unit:' + chosen.k,
      math: null
    });
  },

  // ── cmの ものさし ──
  g2_mea_cm(slot, rng) {
    const cm = ranged(rng, slot, [[2, 5], [3, 8], [5, 12], [8, 15]]);
    const story = slot === 4;
    const objects = [{ name: 'えんぴつ', key: 'pencil' }, { name: 'リボン', key: 'ribbon' }, { name: 'ひも', key: 'string' }];
    const object = pick(rng, objects);
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'モクモの ' + object.name + 'を ものさしに あてた。ながさは なんcm？'
        : object.name + 'の ながさは なんcm？',
      answer: cm,
      board: { type: 'ruler-cm', length: cm, max: 15, objectKey: object.key },
      hint1: 'はしが 0の めもりに そろっているかを みよう。',
      hint2: '0から めもりを 1、2、と かぞえよう。',
      explain: '0から めもり ' + cm + 'こぶん。だから ' + cm + 'cmだね。',
      story,
      learningKey: 'g2cm:' + cm + ':' + object.key,
      math: { kind: 'length', cm }
    });
  },

  // ── mmの めもり(1cm＝10mm) ──
  g2_mea_mm(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const cm = randInt(rng, 2, 9);
      return Q({
        kind: 'keypad',
        prompt: cm + 'cmは なんmm？',
        answer: cm * 10,
        board: null,
        hint1: '1cmは 10mmだったね。',
        hint2: '10mmが ' + cm + 'こぶんだよ。',
        explain: '1cm＝10mmだから、' + cm + 'cmは ' + cm * 10 + 'mmだね。',
        story: false,
        learningKey: 'g2mmconv:' + cm,
        math: { kind: 'length', mm: cm * 10 }
      });
    }
    const cm = randInt(rng, 2, 9);
    const mm = randInt(rng, 1, 9);
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'クリップを ものさしに あてたら、' + cm + 'cmより すこし ながかった。ながさは なんmm？'
        : 'ながさは ' + cm + 'cm' + mm + 'mm。ぜんぶで なんmm？',
      answer: cm * 10 + mm,
      board: { type: 'ruler-cm', length: cm + mm / 10, max: 10, objectKey: 'string', mmMode: true },
      hint1: 'まず cmを mmに かえよう。',
      hint2: cm * 10 + 'mmと ' + mm + 'mmを あわせるよ。',
      explain: cm + 'cmは ' + cm * 10 + 'mm。あと ' + mm + 'mmで ' + (cm * 10 + mm) + 'mmだね。',
      story,
      learningKey: 'g2mm:' + cm + ':' + mm,
      math: { kind: 'length', mm: cm * 10 + mm }
    });
  },

  // ── ながさの けいさん ──
  g2_mea_len_calc(slot, rng) {
    const add = slot % 2 === 0;
    const story = slot === 4;
    const a = ranged(rng, slot, [[3, 8], [4, 12], [6, 20], [10, 25]]);
    let b = randInt(rng, 2, add ? 20 : a - 1);
    if (!add && a - b === b) b = b > 2 ? b - 1 : b + 1;
    const answer = add ? a + b : a - b;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'ひもを ' + a + 'cmと ' + b + 'cm きった。あわせて なんcm？'
        : add
          ? a + 'cmの テープと ' + b + 'cmの テープを つなぐ。なんcm？'
          : a + 'cmの テープから ' + b + 'cm きりとる。のこりは なんcm？',
      answer: story ? a + b : answer,
      board: (story || add)
        ? { type: 'tape-2', top: { label: 'ぜんぶ', value: null }, parts: [{ label: a + 'cm', value: a }, { label: b + 'cm', value: b }] }
        : { type: 'tape-2', top: { label: a + 'cm', value: a }, parts: [{ label: 'きった ' + b + 'cm', value: b }, { label: 'のこり', value: null }] },
      hint1: 'おなじ たんい(cm)どうしなら そのまま けいさんできるよ。',
      hint2: (story || add) ? a + '＋' + b + 'を けいさんしよう。' : a + '−' + b + 'を けいさんしよう。',
      explain: (story || add)
        ? a + 'cmと ' + b + 'cmで ' + (a + b) + 'cm。たんいを そろえて たすんだね。'
        : a + 'cmから ' + b + 'cm とって ' + answer + 'cm。たんいは cmの ままだよ。',
      story,
      learningKey: 'g2lcalc:' + (add ? 'a' : 's') + a + ':' + b,
      math: { kind: add || story ? 'add' : 'sub', a, b }
    });
  },

  // ── Lと dL ──
  g2_mea_ldl(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const l = randInt(rng, 1, 9);
      return Q({
        kind: 'keypad',
        prompt: l + 'Lは なんdL？',
        answer: l * 10,
        board: null,
        hint1: '1Lは 10dLだったね。',
        hint2: '10dLが ' + l + 'こぶんだよ。',
        explain: '1L＝10dLだから、' + l + 'Lは ' + l * 10 + 'dLだね。',
        story: false,
        learningKey: 'g2ldl:' + l,
        math: { kind: 'capacity', dl: l * 10 }
      });
    }
    const l = randInt(rng, 1, 4);
    const dl = randInt(rng, 1, 9);
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'やかんの みずを ますで はかったら、1Lますで ' + l + 'はいと、1dLますで ' + dl + 'はい だった。ぜんぶで なんdL？'
        : 'かさは ' + l + 'L' + dl + 'dL。ぜんぶで なんdL？',
      answer: l * 10 + dl,
      board: { type: 'tank', l, dl },
      hint1: 'まず Lを dLに かえよう。',
      hint2: l * 10 + 'dLと ' + dl + 'dLを あわせるよ。',
      explain: l + 'Lは ' + l * 10 + 'dL。あと ' + dl + 'dLで ' + (l * 10 + dl) + 'dLだね。',
      story,
      learningKey: 'g2ldl2:' + l + ':' + dl,
      math: { kind: 'capacity', dl: l * 10 + dl }
    });
  },

  // ── mLと かさの けいさん ──
  g2_mea_ml(slot, rng) {
    const mode = slot === 0 ? 0 : (slot % 2 === 1 ? 1 : 2);
    const story = slot === 4;
    if (mode === 0 && !story) {
      return Q({
        kind: 'keypad',
        prompt: '1Lは なんmL？',
        answer: 1000,
        board: null,
        hint1: '1Lは 1000mLだよ。おぼえて つかおう。',
        hint2: 'ぎゅうにゅうパック 1ほんぶんが やく 1000mLだね。',
        explain: '1L＝1000mL。おおきな かさは mLで こまかく あらわせるよ。',
        story: false,
        learningKey: 'g2ml1000',
        math: { kind: 'capacity', ml: 1000 }
      });
    }
    if (mode === 1 && !story) {
      const dl = randInt(rng, 2, 9);
      return Q({
        kind: 'keypad',
        prompt: dl + 'dLは なんmL？',
        answer: dl * 100,
        board: null,
        hint1: '1dLは 100mLだったね。',
        hint2: '100mLが ' + dl + 'こぶんだよ。',
        explain: '1dL＝100mLだから、' + dl + 'dLは ' + dl * 100 + 'mLだね。',
        story: false,
        learningKey: 'g2mldl:' + dl,
        math: { kind: 'capacity', ml: dl * 100 }
      });
    }
    const a = randInt(rng, 2, 9);
    let b = randInt(rng, 1, a - 1);
    if (a - b === b) b = b > 1 ? b - 1 : b + 1;
    const add = slot % 2 === 0;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'ジュースが ' + a + 'dL あった。' + b + 'dL のんだ。のこりは なんdL？'
        : add ? a + 'dLと ' + b + 'dLを あわせると なんdL？' : a + 'dLから ' + b + 'dL つかうと のこりは なんdL？',
      answer: story || !add ? a - b : a + b,
      board: { type: 'tank', l: 0, dl: a, removedDl: story || !add ? b : 0 },
      hint1: 'おなじ たんい(dL)どうしで けいさんしよう。',
      hint2: (story || !add) ? a + '−' + b + 'だね。' : a + '＋' + b + 'だね。',
      explain: (story || !add)
        ? a + 'dLから ' + b + 'dL へって ' + (a - b) + 'dL。たんいは そのままだよ。'
        : a + 'dLと ' + b + 'dLで ' + (a + b) + 'dLに なるね。',
      story,
      learningKey: 'g2mlc:' + a + ':' + b + (add ? 'a' : 's'),
      math: { kind: story || !add ? 'sub' : 'add', a, b }
    });
  },

  // ── じこくと じかん ──
  g2_mea_time(slot, rng) {
    const story = slot === 4;
    const startH = randInt(rng, 1, 11);
    const spanMin = pick(rng, slot < 3 ? [30, 40] : [20, 30, 40, 50, 90]);
    const endH = startH + Math.floor(spanMin / 60);
    const endM = spanMin % 60;
    const h2m = slot === 1 || slot === 6;
    if (!h2m || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'こうえんに ' + startH + 'じに ついて、かえったのは とけいの じこく。あそんだ じかんは なんぷん？'
          : '「はじめ」の じこくから 「おわり」の じこくまで、なんぷん たった？',
        answer: spanMin,
        board: { type: 'clock-span', startH, startM: 0, endH: endH > 12 ? endH - 12 : endH, endM },
        hint1: 'ながい はりが どれだけ すすんだかを みよう。',
        hint2: 'ながい はりが 1しゅうで 60ぷんだったね。',
        explain: 'はりは ' + spanMin + 'ぷんぶん すすんだ。じこくと じこくの あいだが じかんだよ。',
        story,
        learningKey: 'g2time:' + startH + ':' + spanMin,
        math: { kind: 'time', min: spanMin }
      });
    }
    const h = slot === 1 ? 1 : 2;
    return Q({
      kind: 'keypad',
      prompt: h + 'じかんは なんぷん？',
      answer: h * 60,
      board: null,
      hint1: '1じかんは 60ぷんだったね。',
      hint2: '60ぷんが ' + h + 'こぶんだよ。',
      explain: '1じかん＝60ぷんだから、' + h + 'じかんは ' + h * 60 + 'ぷんだね。',
      story: false,
      learningKey: 'g2h2m:' + h,
      math: { kind: 'time', min: h * 60 }
    });
  },

  // ── ごぜんと ごご ──
  g2_mea_ampm(slot, rng) {
    const story = slot === 4;
    const cases = [
      { s: 'あさごはんを たべる 7じ', a: 'ごぜん' },
      { s: 'がっこうへ いく 8じ', a: 'ごぜん' },
      { s: 'ゆうごはんを たべる 7じ', a: 'ごご' },
      { s: 'ねる まえの 9じ', a: 'ごご' },
      { s: 'あさの ラジオたいそうの 6じはん', a: 'ごぜん' },
      { s: 'おやつの 3じ', a: 'ごご' },
      { s: 'きゅうしょくの あとの 1じ', a: 'ごご' },
      { s: 'あさの かいの 10じ', a: 'ごぜん' }
    ];
    const chosen = pick(rng, cases);
    return Q({
      kind: 'choice',
      prompt: (story ? 'トトの 1にちの よてい。' : '') + '「' + chosen.s + '」は' + pick(rng, [' ごぜん？ ごご？', ' どちらかな？', ' ごぜんと ごご、どっち？']),
      answer: chosen.a,
      options: ['ごぜん', 'ごご'],
      board: null,
      hint1: 'おひるの 12じ(しょうご)より まえか あとかで きめるよ。',
      hint2: 'あさは ごぜん、ひるすぎからは ごごだね。',
      explain: '「' + chosen.s + '」は ' + chosen.a + '。1にちは ごぜん12じかんと ごご12じかんだよ。',
      story,
      learningKey: 'g2ampm:' + chosen.s,
      math: null
    });
  },

  // ── mと ながい ながさ ──
  g2_mea_m(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const m = randInt(rng, 1, 9);
      return Q({
        kind: 'keypad',
        prompt: m + 'mは なんcm？',
        answer: m * 100,
        board: null,
        hint1: '1mは 100cmだったね。',
        hint2: '100cmが ' + m + 'こぶんだよ。',
        explain: '1m＝100cmだから、' + m + 'mは ' + m * 100 + 'cmだね。',
        story: false,
        learningKey: 'g2mconv:' + m,
        math: { kind: 'length', cm: m * 100 }
      });
    }
    const m = randInt(rng, 1, 3);
    const cm = randInt(rng, 5, 95);
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'ろうかの ながさを はかったら、1mの ものさし ' + m + 'こぶんと、あと ' + cm + 'cm だった。ぜんぶで なんcm？'
        : 'ながさは ' + m + 'm' + cm + 'cm。ぜんぶで なんcm？',
      answer: m * 100 + cm,
      board: null,
      hint1: 'まず mを cmに かえよう。',
      hint2: m * 100 + 'cmと ' + cm + 'cmを あわせるよ。',
      explain: m + 'mは ' + m * 100 + 'cm。あと ' + cm + 'cmで ' + (m * 100 + cm) + 'cmだね。',
      story,
      learningKey: 'g2m:' + m + ':' + cm,
      math: { kind: 'length', cm: m * 100 + cm }
    });
  }
};
