// 出題の品質契約テスト。
// 全コース・全ステージ × 複数seed の実際の生成問題が、engine/spec.js の契約を満たすことを保証する。
// このテストが通らない実装は、どれだけ動いて見えても出荷しない。

import test from 'node:test';
import assert from 'node:assert/strict';
import { G1, COURSES, makePack } from '../src/gen/index.js';
import { validatePack } from '../src/engine/spec.js';

const SEEDS = [11, 202, 3033, 40404, 55055];

for (const course of Object.values(COURSES)) {
  for (const lineId of course.lineOrder) {
    const line = course.lines[lineId];
    test('品質契約: ' + course.id + '/' + lineId + ' ぜんステージ × ' + SEEDS.length + 'seed', () => {
      line.stages.forEach((stage, stageIndex) => {
        for (const seed of SEEDS) {
          const pack = makePack(lineId, stageIndex, seed, course.id);
          const errors = validatePack(pack, stage, course.id + '/' + stage.id + ' seed' + seed);
          assert.deepEqual(errors, [], errors.slice(0, 5).join('\n'));
        }
      });
    });
  }
}

test('小2: 同じseedからは同じ問題が出る', () => {
  for (const lineId of COURSES.g2.lineOrder) {
    for (const stageIndex of [0, 4, 7, 10]) {
      const a = makePack(lineId, stageIndex, 777, 'g2');
      const b = makePack(lineId, stageIndex, 777, 'g2');
      assert.deepEqual(a, b, 'g2/' + lineId + '/' + stageIndex + ': 再現しない');
    }
  }
});

test('小2: 遊びなおすと 文もなかみも 変わる', () => {
  for (const lineId of COURSES.g2.lineOrder) {
    for (const stageIndex of [0, 2, 6]) {
      const faces = new Set();
      for (let i = 0; i < 8; i += 1) {
        const pack = makePack(lineId, stageIndex, 900 + i * 131, 'g2');
        pack.questions.forEach(q => faces.add(JSON.stringify([q.prompt, q.board])));
      }
      assert.ok(faces.size >= 12, 'g2/' + lineId + '/' + stageIndex + ': 8回遊んで見た目が' + faces.size + '種類しかない');
    }
  }
});

test('同じseedからは同じ問題が出る', () => {
  for (const lineId of G1.lineOrder) {
    for (const stageIndex of [0, 4, 7, 10]) {
      const a = makePack(lineId, stageIndex, 777);
      const b = makePack(lineId, stageIndex, 777);
      assert.deepEqual(a, b, lineId + '/' + stageIndex + ': 再現しない');
    }
  }
});

test('遊びなおすと 文もなかみも 変わる', () => {
  for (const lineId of G1.lineOrder) {
    for (const stageIndex of [0, 2, 6]) {
      const faces = new Set();
      const answers = new Set();
      for (let i = 0; i < 8; i += 1) {
        const pack = makePack(lineId, stageIndex, 900 + i * 131);
        pack.questions.forEach(q => {
          faces.add(JSON.stringify([q.prompt, q.board]));
          answers.add(String(q.answer));
        });
      }
      assert.ok(faces.size >= 12, lineId + '/' + stageIndex + ': 8回遊んで見た目が' + faces.size + '種類しかない');
      assert.ok(answers.size >= 3, lineId + '/' + stageIndex + ': 答えの種類が少なすぎる(' + answers.size + ')');
    }
  }
});

test('1ステージの中に 答えの種類が 複数ある', () => {
  for (const lineId of G1.lineOrder) {
    G1.lines[lineId].stages.forEach((stage, stageIndex) => {
      for (const seed of [61, 62]) {
        const pack = makePack(lineId, stageIndex, seed);
        const answers = new Set(pack.questions.map(q => String(q.answer)));
        assert.ok(answers.size >= 2, lineId + '/' + stage.id + ' seed' + seed + ': 答えが1種類だけ');
      }
    });
  }
});

test('むずかしさは 8問のなかで あがっていく(たしざんの れんしゅう)', () => {
  for (const seed of [5, 55, 555]) {
    const pack = makePack('addition', 8, seed);
    const first = pack.questions[0].math;
    const last = pack.questions[7].math;
    assert.ok(first.a + first.b <= last.a + last.b + 6, '導入が仕上げより極端に難しい');
    assert.ok(last.a + last.b >= 10, '仕上げの和が小さすぎる: ' + (last.a + last.b));
  }
});
