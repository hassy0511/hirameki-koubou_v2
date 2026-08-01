// 決定的な乱数。同じseedからは必ず同じ問題列が出る。
// 生成器はこのrngだけを使い、Math.randomを使ってはいけない(記録の再現に使うため)。

export function seededRng(seed) {
  let state = (Number(seed) >>> 0) || 1;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng, min, max) {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return lo + Math.floor(rng() * (hi - lo + 1));
}

export function pick(rng, items) {
  return items[randInt(rng, 0, items.length - 1)];
}

export function shuffle(rng, items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randInt(rng, 0, i);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

// 「前と同じでない」ものを選びたいときの補助。候補が1つしかなければ諦めてそれを返す。
export function pickDifferent(rng, items, previous) {
  const candidates = items.filter(item => item !== previous);
  return candidates.length ? pick(rng, candidates) : pick(rng, items);
}
