// 小3・はかるライン。秒→時刻の計算→まきじゃく・km→g・kg→正味と t。

import { Q, ranged, randInt, pick } from '../util.js';

export const g3MeasureStages = {
  // ── びょうの せかい ──
  g3_mea_sec(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 || story) {
      const m = randInt(rng, 1, 3);
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'はしる れんしゅう。' + m + 'ぷんかん はしった。なんびょうかん はしった？'
          : pick(rng, [m + 'ぷんは なんびょう？', m + 'ぷんかんは ぜんぶで なんびょう？']),
        answer: m * 60,
        board: null,
        hint1: '1ぷんは 60びょうだよ。',
        hint2: '60びょうが ' + m + 'こぶんだね。',
        explain: m + 'ぷんは ' + m * 60 + 'びょう。みじかい じかんは びょうで はかるんだね。',
        story,
        learningKey: 'g3sec1:' + m,
        math: { kind: 'time', sec: m * 60 }
      });
    }
    const s = pick(rng, [70, 80, 90, 100, 110]);
    return Q({
      kind: 'keypad',
      prompt: s + 'びょうは 1ぷんと なんびょう？',
      answer: s - 60,
      board: null,
      hint1: 'まず 60びょうを 1ぷんに かえよう。',
      hint2: s + 'から 60を ひいた のこりだよ。',
      explain: s + 'びょうは 1ぷん' + (s - 60) + 'びょう。60ずつ たばに するんだね。',
      story: false,
      learningKey: 'g3sec2:' + s,
      math: { kind: 'time', sec: s }
    });
  },

  // ── びょうと ふんの へんかん ──
  g3_mea_secmin(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const m = randInt(rng, 2, 5);
    const s = pick(rng, [10, 20, 30, 40, 50]);
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'カレーの にこみ じかんは ' + m + 'ふん' + s + 'びょう。ぜんぶで なんびょう？'
          : m + 'ふん' + s + 'びょうは ぜんぶで なんびょう？',
        answer: m * 60 + s,
        board: null,
        hint1: 'まず ふんを びょうに かえよう。',
        hint2: m * 60 + 'びょうと ' + s + 'びょうを あわせるよ。',
        explain: m + 'ふんは ' + m * 60 + 'びょう。あわせて ' + (m * 60 + s) + 'びょうだね。',
        story,
        learningKey: 'g3sm1:' + m + ':' + s,
        math: { kind: 'time', sec: m * 60 + s }
      });
    }
    const total = m * 60 + s;
    return Q({
      kind: 'keypad',
      prompt: total + 'びょうは なんぷんと なんびょう？ ふんの かずを こたえよう。',
      answer: m,
      board: null,
      hint1: '60びょうずつ たばに して いこう。',
      hint2: '60が なんこ とれるかな。',
      explain: total + 'びょうは ' + m + 'ふん' + s + 'びょう。ふんの かずは ' + m + 'だね。',
      story: false,
      learningKey: 'g3sm2:' + total,
      math: { kind: 'time', sec: total }
    });
  },

  // ── たった じかん ──
  g3_mea_duration(slot, rng) {
    const startH = randInt(rng, 1, 10);
    const startM = pick(rng, [0, 10, 20, 30, 40]);
    const span = pick(rng, slot < 3 ? [30, 40, 50] : [25, 35, 45, 50, 70]);
    const endTotal = startH * 60 + startM + span;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;
    const story = slot === 4;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'としょかんに ついたのが 「はじめ」、でたのが 「おわり」の じこく。いた じかんは なんぷん？'
        : '「はじめ」から 「おわり」まで、なんぷん たった？',
      answer: span,
      board: { type: 'clock-span', startH, startM, endH: endH > 12 ? endH - 12 : endH, endM },
      hint1: 'きりの いい じこくまでと、そこからの ふたつに わけよう。',
      hint2: 'ながい はりの うごいた ぶんを ぜんぶ あわせるよ。',
      explain: 'あわせて ' + span + 'ぷん。とちゅうの きりの いい じこくで わけると かぞえやすいね。',
      story,
      learningKey: 'g3du:' + startH + ':' + startM + ':' + span,
      math: { kind: 'time', min: span }
    });
  },

  // ── とうちゃくの じこく(はりを あわせる) ──
  g3_mea_startend(slot, rng) {
    const startH = randInt(rng, 1, 10);
    const startM = pick(rng, [0, 15, 30, 45]);
    const span = pick(rng, [20, 30, 45, 60]);
    const endTotal = startH * 60 + startM + span;
    let endH = Math.floor(endTotal / 60);
    if (endH > 12) endH -= 12;
    const endM = endTotal % 60;
    const story = slot === 4;
    const back = slot % 3 === 2 && !story;
    if (back) {
      const depTotal = startH * 60 + startM;
      let depH = Math.floor(depTotal / 60);
      const depM = depTotal % 60;
      return Q({
        kind: 'clock-set',
        prompt: (endH) + 'じ' + (endM === 0 ? '' : endM + 'ふん') + 'に つきたい。かかるのは ' + span + 'ぷん。しゅっぱつの じこくに はりを あわせよう。',
        answer: depH + ':' + depM,
        task: 'produce',
        board: { type: 'clock-set', startH: endH, startM: endM, stepM: 5 },
        hint1: 'とうちゃくから ぎゃくに はりを もどそう。',
        hint2: span + 'ぷんぶん まえの じこくだよ。',
        explain: span + 'ぷん まえは ' + depH + 'じ' + (depM === 0 ? '' : depM + 'ふん') + '。ぎゃくに たどれば しゅっぱつが わかるね。',
        story: false,
        learningKey: 'g3se2:' + depH + ':' + depM + ':' + span,
        math: { kind: 'time', min: span }
      });
    }
    return Q({
      kind: 'clock-set',
      prompt: story
        ? 'えいがは ' + startH + 'じ' + (startM === 0 ? '' : startM + 'ふん') + 'に はじまり、' + span + 'ぷんで おわる。おわる じこくに はりを あわせよう。'
        : startH + 'じ' + (startM === 0 ? '' : startM + 'ふん') + 'の ' + span + 'ぷんあとの じこくに、はりを あわせよう。',
      answer: endH + ':' + endM,
      task: 'produce',
      board: { type: 'clock-set', startH, startM, stepM: 5 },
      hint1: 'ながい はりを ' + span + 'ぷんぶん すすめよう。',
      hint2: '60ぷん すすむと みじかい はりが 1つ すすむよ。',
      explain: span + 'ぷんあとは ' + endH + 'じ' + (endM === 0 ? '' : endM + 'ふん') + '。はりを うごかして たしかめたね。',
      story,
      learningKey: 'g3se1:' + startH + ':' + startM + ':' + span,
      math: { kind: 'time', min: span }
    });
  },

  // ── まきじゃくで はかる ──
  g3_mea_tape(slot, rng) {
    const cases = [
      { s: 'きの みきの まわりの ながさを はかりたい。', a: 'まきじゃく', k: 'tree' },
      { s: 'プールの たての ながさ(25m)を はかりたい。', a: 'まきじゃく', k: 'pool' },
      { s: 'えんぴつの ながさを はかりたい。', a: '30cmの ものさし', k: 'pencil' },
      { s: 'ノートの あつさを はかりたい。', a: '30cmの ものさし', k: 'note' },
      { s: 'まるい はしらの まわりを はかりたい。', a: 'まきじゃく', k: 'pillar' },
      { s: 'きょうかしょの よこの ながさを はかりたい。', a: '30cmの ものさし', k: 'book' }
    ];
    const chosen = pick(rng, cases);
    const story = slot === 4;
    return Q({
      kind: 'choice',
      prompt: (story ? 'はかりものの おてつだい。' : '') + chosen.s + pick(rng, [' どの どうぐが いい？', ' なにで はかる？']),
      answer: chosen.a,
      options: ['まきじゃく', '30cmの ものさし'],
      board: null,
      hint1: 'ながい ものや まるい ものは どちらが はかりやすいかな。',
      hint2: 'まきじゃくは まげられるし、ながい ところも はかれるよ。',
      explain: 'この ときは 「' + chosen.a + '」が べんり。はかる ものに あわせて どうぐを えらぶんだね。',
      story,
      learningKey: 'g3tp:' + chosen.k,
      math: null
    });
  },

  // ── kmと みちのり ──
  g3_mea_km(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const km = randInt(rng, 1, 5);
      return Q({
        kind: 'keypad',
        prompt: km + 'kmは なんm？',
        answer: km * 1000,
        board: null,
        hint1: '1kmは 1000mだよ。',
        hint2: '1000mが ' + km + 'こぶんだね。',
        explain: km + 'km＝' + km * 1000 + 'm。ながい みちのりは kmで あらわすんだね。',
        story: false,
        learningKey: 'g3km1:' + km,
        math: { kind: 'length', m: km * 1000 }
      });
    }
    const a = randInt(rng, 3, 9) * 100;
    const b = randInt(rng, 3, 9) * 100;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'いえから こうえんまで ' + a + 'm、こうえんから えきまで ' + b + 'm。みちのりは ぜんぶで なんm？'
        : a + 'mと ' + b + 'mを あわせた みちのりは なんm？',
      answer: a + b,
      board: null,
      hint1: 'おなじ たんい(m)どうしで たそう。',
      hint2: a + '＋' + b + 'を けいさんするよ。1000mを こえたら kmでも いえるね。',
      explain: 'あわせて ' + (a + b) + 'm。' + (a + b >= 1000 ? '1km' + (a + b - 1000) + 'mとも いえるね。' : 'とおりみちの ながさを みちのりと いうよ。'),
      story,
      learningKey: 'g3km2:' + a + ':' + b,
      math: { kind: 'length', m: a + b }
    });
  },

  // ── おもさと g ──
  g3_mea_gram(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    if (mode === 0 && !story) {
      const step = pick(rng, [10, 20, 50]);
      const k = randInt(rng, 3, 9);
      return Q({
        kind: 'keypad',
        prompt: 'はかりの 1めもりは ' + step + 'g。はりは めもり ' + k + 'こぶんの ところ。なんg？',
        answer: step * k,
        board: null,
        hint1: '1めもりの おおきさ×めもりの かずだよ。',
        hint2: step + 'を ' + k + 'かい たしても いいね。',
        explain: step + 'gの ' + k + 'こぶんで ' + step * k + 'g。めもりの おおきさに ちゅういだね。',
        story: false,
        learningKey: 'g3g1:' + step + ':' + k,
        math: { kind: 'weight', g: step * k }
      });
    }
    const a = randInt(rng, 12, 48) * 10;
    let b = randInt(rng, 11, 39) * 10;
    if (a === b) b += 10;
    return Q({
      kind: 'keypad',
      prompt: story
        ? 'りんごが ' + a + 'g、みかんが ' + b + 'g。あわせて なんg？'
        : a + 'gと ' + b + 'gを あわせると なんg？',
      answer: a + b,
      board: null,
      hint1: 'おもさも おなじ たんいなら たしざんできるよ。',
      hint2: a + '＋' + b + 'を けいさんしよう。',
      explain: 'あわせて ' + (a + b) + 'g。おもさの けいさんも かずと おなじだね。',
      story,
      learningKey: 'g3g2:' + a + ':' + b,
      math: { kind: 'weight', g: a + b }
    });
  },

  // ── kgと gの かんけい ──
  g3_mea_kg(slot, rng) {
    const mode = slot % 2;
    const story = slot === 4;
    const kg = randInt(rng, 1, 4);
    const g = randInt(rng, 1, 9) * 100;
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'ランドセルの おもさは ' + kg + 'kg' + g + 'g。ぜんぶで なんg？'
          : kg + 'kg' + g + 'gは なんg？',
        answer: kg * 1000 + g,
        board: null,
        hint1: '1kgは 1000gだよ。',
        hint2: kg * 1000 + 'gと ' + g + 'gを あわせよう。',
        explain: kg + 'kgは ' + kg * 1000 + 'g。あわせて ' + (kg * 1000 + g) + 'gだね。',
        story,
        learningKey: 'g3kg1:' + kg + ':' + g,
        math: { kind: 'weight', g: kg * 1000 + g }
      });
    }
    const total = kg * 1000 + g;
    return Q({
      kind: 'keypad',
      prompt: total + 'gは なんkgと なんg？ kgの かずを こたえよう。',
      answer: kg,
      board: null,
      hint1: '1000gずつ たばに しよう。',
      hint2: '1000が なんこ とれるかな。',
      explain: total + 'gは ' + kg + 'kg' + g + 'g。1000の たばの かずが kgだね。',
      story: false,
      learningKey: 'g3kg2:' + total,
      math: { kind: 'weight', g: total }
    });
  },

  // ── なかみの おもさと t ──
  g3_mea_net(slot, rng) {
    const mode = slot % 3;
    const story = slot === 4;
    if (mode === 2 && !story) {
      const t = randInt(rng, 2, 8);
      return Q({
        kind: 'keypad',
        prompt: t + 'tは なんkg？',
        answer: t * 1000,
        board: null,
        hint1: '1tは 1000kgだよ。トラックの にもつなどで つかうよ。',
        hint2: '1000kgが ' + t + 'こぶんだね。',
        explain: t + 't＝' + t * 1000 + 'kg。とても おもい ものは tで あらわすんだね。',
        story: false,
        learningKey: 'g3t:' + t,
        math: { kind: 'weight', kg: t * 1000 }
      });
    }
    const tare = randInt(rng, 15, 45) * 10;
    let net = randInt(rng, 35, 85) * 10;
    if (net === tare) net += 10;
    const gross = tare + net;
    if (mode === 0 || story) {
      return Q({
        kind: 'keypad',
        prompt: story
          ? 'はこいり みかんの おもさは ぜんぶで ' + gross + 'g。はこだけだと ' + tare + 'g。みかんの おもさは？'
          : 'ぜんぶで ' + gross + 'g、いれものが ' + tare + 'g。なかみは なんg？',
        answer: net,
        board: { type: 'tape-2', top: { label: 'ぜんぶ ' + gross + 'g', value: gross }, parts: [{ label: 'いれもの ' + tare + 'g', value: tare }, { label: 'なかみ', value: null }] },
        hint1: 'ぜんぶから いれものの ぶんを ひこう。',
        hint2: gross + '−' + tare + 'を けいさんするよ。',
        explain: gross + '−' + tare + '＝' + net + '。なかみだけの おもさが わかったね。',
        story,
        learningKey: 'g3net1:' + gross + ':' + tare,
        math: { kind: 'sub', a: gross, b: tare }
      });
    }
    return Q({
      kind: 'keypad',
      prompt: 'なかみが ' + net + 'g、いれものが ' + tare + 'g。ぜんぶで なんg？',
      answer: gross,
      board: { type: 'tape-2', top: { label: 'ぜんぶ', value: null }, parts: [{ label: 'いれもの ' + tare + 'g', value: tare }, { label: 'なかみ ' + net + 'g', value: net }] },
      hint1: 'なかみと いれものを あわせよう。',
      hint2: net + '＋' + tare + 'を けいさんするよ。',
      explain: 'あわせて ' + gross + 'g。ぜんぶの おもさは たしざんで もとまるね。',
      story: false,
      learningKey: 'g3net2:' + net + ':' + tare,
      math: { kind: 'add', a: net, b: tare }
    });
  }
};
