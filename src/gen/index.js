// パック生成。生成器を呼び、重複・偏りを避けながら8問を組む。
// ここで組んだパックは engine/spec.js の validatePack を通る形でなければならない
// (通ることは tests/quality-contract.test.mjs が全ステージ×複数seedで保証する)。

import { COURSES, stageAt } from '../curriculum/courses.js';
import { G1 } from '../curriculum/g1.js';
import { seededRng } from '../engine/rng.js';
import { numberStages } from './g1/number.js';
import { additionStages } from './g1/addition.js';
import { subtractionStages } from './g1/subtraction.js';
import { measureStages } from './g1/measure.js';
import { shapeStages } from './g1/shape.js';
import { solveStages } from './g1/solve.js';
import { g2NumberStages } from './g2/number.js';
import { g2CalcStages } from './g2/calc.js';
import { g2MulStages } from './g2/mul.js';
import { g2MeasureStages } from './g2/measure.js';
import { g2ShapeStages } from './g2/shape.js';
import { g2SolveStages } from './g2/solve.js';
import { g3NumberStages } from './g3/number.js';
import { g3MulStages } from './g3/mul.js';
import { g3DivStages } from './g3/div.js';
import { g3DecStages } from './g3/dec.js';
import { g3MeasureStages } from './g3/measure.js';
import { g3ShapeStages } from './g3/shape.js';
import { g3SolveStages } from './g3/solve.js';

const GENERATORS = Object.assign({}, numberStages, additionStages, subtractionStages, measureStages, shapeStages, solveStages,
  g2NumberStages, g2CalcStages, g2MulStages, g2MeasureStages, g2ShapeStages, g2SolveStages,
  g3NumberStages, g3MulStages, g3DivStages, g3DecStages, g3MeasureStages, g3ShapeStages, g3SolveStages);

// おさらい・まとめ: どのスロットで どの元ステージを出すか。
// スロット4は必ず場面問題になるよう、元ステージへ slot=4 を渡す。
function sourceFor(stage, slot) {
  const n = stage.sources.length;
  const plan4 = [0, 1, 2, 3, 0, 1, 2, 3];
  const plan5 = [0, 1, 2, 3, 4, 0, 2, 4];
  const plan = n === 5 ? plan5 : plan4;
  return stage.sources[plan[slot] % n];
}

function generate(stage, slot, rng) {
  const genId = stage.assessment ? sourceFor(stage, slot) : stage.id;
  const generator = GENERATORS[genId];
  if (!generator) throw new Error('生成器がありません: ' + genId);
  const q = generator(slot, rng);
  q.slot = slot;
  return q;
}

export function makePack(lineId, stageIndex, seed, courseId) {
  const stage = stageAt(courseId || 'g1', lineId, stageIndex);
  const rng = seededRng(seed);
  const questions = [];
  const seenVisible = new Set();
  const keyCount = new Map();
  const answerCount = new Map();
  const strictNumeric = !stage.smallAnswerSpace && !stage.represent;
  const numericSeq = []; // pick-one 以外の数の答え(順番どおり)
  let prevKey = null;
  let prevAnswer = null;
  let prevAnswer2 = null;

  for (let slot = 0; slot < 8; slot += 1) {
    let chosen = null;
    for (let attempt = 0; attempt < 40 && !chosen; attempt += 1) {
      const candidate = generate(stage, slot, rng);
      const visibleKey = JSON.stringify([candidate.prompt, candidate.answer, candidate.board]);
      const answer = String(candidate.answer);
      if (seenVisible.has(visibleKey)) continue;
      if (candidate.learningKey && candidate.learningKey === prevKey) continue;
      if ((keyCount.get(candidate.learningKey) || 0) >= (stage.maxRepeat || 2)) continue;
      if (answer === prevAnswer && answer === prevAnswer2) continue;
      if (stage.balanceAnswers && (answerCount.get(answer) || 0) >= 4) continue;
      // 数の答えの単調さを避ける(spec.js の規則と同じ)
      if (strictNumeric && candidate.kind !== 'pick-one' && /^\d+$/.test(answer)) {
        if ((answerCount.get(answer) || 0) >= 3) continue;
        if (numericSeq.length >= 3) {
          const window = new Set(numericSeq.slice(-3).concat(answer));
          if (window.size < 3) continue;
        }
        const distinctAfter = new Set(numericSeq.concat(answer)).size;
        if (distinctAfter + (7 - slot) < 4) continue; // 残り問数で4種に届かない選び方をしない
      }
      chosen = candidate;
    }
    // 候補が尽きたら、ゆずれる条件からゆるめる。
    // 「見た目まで同じ問題」と「直前と同じ内容」だけは最後まで守る。
    for (let attempt = 0; attempt < 40 && !chosen; attempt += 1) {
      const candidate = generate(stage, slot, rng);
      const visibleKey = JSON.stringify([candidate.prompt, candidate.answer, candidate.board]);
      if (seenVisible.has(visibleKey)) continue;
      if (candidate.learningKey && candidate.learningKey === prevKey) continue;
      chosen = candidate;
    }
    if (!chosen) chosen = generate(stage, slot, rng);
    const answer = String(chosen.answer);
    seenVisible.add(JSON.stringify([chosen.prompt, chosen.answer, chosen.board]));
    keyCount.set(chosen.learningKey, (keyCount.get(chosen.learningKey) || 0) + 1);
    answerCount.set(answer, (answerCount.get(answer) || 0) + 1);
    if (chosen.kind !== 'pick-one' && /^\d+$/.test(answer)) numericSeq.push(answer);
    prevAnswer2 = prevAnswer;
    prevAnswer = answer;
    prevKey = chosen.learningKey;
    questions.push(chosen);
  }
  return { seed, courseId: courseId || 'g1', lineId, stageIndex, questions };
}

export { G1, COURSES, stageAt };
