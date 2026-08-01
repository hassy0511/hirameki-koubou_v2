// 生成器の共通部品。
// すべての生成器は (slot, rng) → question の純関数。乱数は必ず rng を使う。

import { randInt, pick, shuffle } from '../engine/rng.js';

// 8問のリズム: 0-1 やさしい導入 / 2-3 ひろげる / 4 場面 / 5-6 ひねり・たしかめ / 7 しあげ
export function band(slot) {
  if (slot <= 1) return 0;
  if (slot <= 4) return 1;
  if (slot <= 6) return 2;
  return 3;
}

// band ごとの範囲表から値を引く。table = [[lo,hi],[lo,hi],[lo,hi],[lo,hi]]
export function ranged(rng, slot, table) {
  const [lo, hi] = table[band(slot)];
  return randInt(rng, lo, hi);
}

// 操作ごとの「やること」。答えの数はここに書かない。
export const INSTRUCTIONS = Object.freeze({
  choice: 'こたえを えらんで 「けってい」',
  keypad: 'すうじを いれて 「けってい」',
  'count-tap': 'いれる かずだけ タップして 「けってい」',
  'pick-one': 'その まるを タップして 「けってい」',
  remove: 'とる まるを タップして 「けってい」',
  numberline: 'やじるしで うごいて 「けってい」',
  'clock-set': 'はりを うごかして 「けってい」',
  grid: 'マスを タップして 「けってい」'
});

export function Q(data) {
  const q = Object.assign({
    kind: 'choice',
    prompt: '',
    instruction: '',
    answer: null,
    options: null,
    board: null,
    hint1: '',
    hint2: '',
    explain: '',
    story: false,
    task: 'answer',
    learningKey: '',
    math: null
  }, data);
  if (!q.instruction) q.instruction = INSTRUCTIONS[q.kind];
  return q;
}

// 誤答は誤概念から。候補を優先して使い、足りない分だけ近い数で埋める。
export function numberOptions(rng, answer, misconceptions, cfg) {
  const min = cfg && cfg.min != null ? cfg.min : 0;
  const max = cfg && cfg.max != null ? cfg.max : 20;
  const allowZero = Boolean(cfg && cfg.allowZero);
  const count = (cfg && cfg.count) || 4;
  const floor = allowZero ? min : Math.max(min, 1);
  const set = [Number(answer)];
  for (const c of misconceptions) {
    const v = Number(c);
    if (Number.isFinite(v) && v >= floor && v <= max && !set.includes(v)) set.push(v);
    if (set.length === count) break;
  }
  let d = 1;
  while (set.length < count && d <= max - floor + 2) {
    for (const v of [Number(answer) - d, Number(answer) + d]) {
      if (set.length < count && v >= floor && v <= max && !set.includes(v)) set.push(v);
    }
    d += 1;
  }
  return shuffle(rng, set.map(String));
}

// 場面で使う持ちもの。工房の子どもたちの身のまわりの物。
export const THINGS = Object.freeze([
  { name: 'おはじき', icon: 'bead' },
  { name: 'どんぐり', icon: 'acorn' },
  { name: 'つみき', icon: 'block' },
  { name: 'ボタン', icon: 'button' }
]);

export const ACTORS = Object.freeze(['トト', 'モクモ']);

export function thing(rng) {
  return pick(rng, THINGS);
}

export function actor(rng) {
  return pick(rng, ACTORS);
}

export { randInt, pick, shuffle };
