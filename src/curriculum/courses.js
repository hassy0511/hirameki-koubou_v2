// コース(学年)の一覧。学年選択・進行・生成が全部ここを見る。
// 不明な courseId で 1年生へ黙って落とさない(実装ルール)。

import { G1 } from './g1.js';
import { G2 } from './g2.js';
import { G3 } from './g3.js';

export const COURSES = Object.freeze({ g1: G1, g2: G2, g3: G3 });

export function courseOf(courseId) {
  const course = COURSES[courseId];
  if (!course) throw new Error('未知のコース: ' + courseId);
  return course;
}

export function stageAt(courseId, lineId, stageIndex) {
  const line = courseOf(courseId).lines[lineId];
  if (!line) throw new Error('未知のライン: ' + courseId + '/' + lineId);
  const stage = line.stages[stageIndex];
  if (!stage) throw new Error('未知のステージ: ' + courseId + '/' + lineId + '/' + stageIndex);
  return stage;
}
