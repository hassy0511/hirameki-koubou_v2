import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const rootUrl = new URL('../', import.meta.url);
const files = [
  'game-core.js',
  'grade1-runtime.js',
  'grade2-curriculum.js',
  'grade2-runtime-arithmetic.js',
  'grade2-runtime-world.js',
  'course-core.js'
];

const sandbox = { console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const filename of files) {
  const source = fs.readFileSync(new URL(filename, rootUrl), 'utf8');
  new vm.Script(source, { filename }).runInContext(sandbox);
}

const courses = sandbox.HiramekiCourses;
const core = sandbox.HiramekiCore;
const curriculum = sandbox.HiramekiGrade2Curriculum;
assert(courses && core && curriculum, '二年生の出題に必要なモジュールが読み込めていません');

const stem = prompt => String(prompt).replace(/[0-9０-９]+/g, '#');
const values = question => Array.from(question.options || [], core.optionValue).map(String);

// 1. 同じseedからは同じ問題が出ること。
//    注入rngを使わない抽選が混ざると、記録の再現や調査ができなくなる。
for (const lineId of curriculum.lineOrder) {
  for (let stageIndex = 0; stageIndex < 11; stageIndex += 1) {
    const seed = 4242 + stageIndex;
    const first = courses.makeStageQuestions('g2', lineId, stageIndex, { seed }).questions;
    const second = courses.makeStageQuestions('g2', lineId, stageIndex, { seed }).questions;
    assert.deepEqual(
      first.map(q => [q.prompt, q.correct, values(q).join(',')]),
      second.map(q => [q.prompt, q.correct, values(q).join(',')]),
      lineId + '/' + stageIndex + ': 同じseedで違う問題が出ています'
    );
  }
}

let checked = 0;
for (const lineId of curriculum.lineOrder) {
  for (let stageIndex = 0; stageIndex < 11; stageIndex += 1) {
    for (const seed of [909, 1717, 2525]) {
      courses.makeStageQuestions('g2', lineId, stageIndex, { seed }).questions.forEach(question => {
        const label = lineId + '/' + stageIndex;

        // 2. 一度目のヒントと二度目の言い換えを必ず持つこと(小1と支援の段数をそろえる)。
        assert(Array.isArray(question.hints) && question.hints.length >= 2, label + ': 段階ヒントがありません');

        // 3. 解説が式だけで終わらないこと。
        assert(question.explain, label + ': 解説がありません');
        assert(
          !/^[0-9]+\s*[＋−×÷+\-]\s*[0-9]+\s*＝\s*[0-9]+。?$/.test(String(question.explain)),
          label + ': 解説が式だけで、なぜそうなるかが残りません'
        );

        // 4. 操作説明が答えを先に見せないこと。
        //    個数を答えさせる問題で「10こ えらんで」と書くと、答えを教えてしまう。
        if (question.kind === 'tap' && Number.isFinite(Number(question.correct))) {
          const escaped = String(question.correct).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const inPrompt = new RegExp('(^|[^0-9])' + escaped + '([^0-9]|$)').test(String(question.prompt));
          if (!inPrompt) {
            assert(
              !new RegExp('(^|[^0-9])' + escaped + '([^0-9]|$)').test(String(question.instruction)),
              label + ': 操作説明に答えが書かれています → ' + question.prompt + ' || ' + question.instruction
            );
          }
        }

        // 5. 選択肢に正解が含まれること。
        if (['choice', 'route', 'sort'].includes(question.kind)) {
          assert(values(question).includes(String(question.correct)), label + ': 正解が選択肢にありません');
        }
        checked += 1;
      });
    }
  }
}

// 6. 同じステージを遊び直したとき、文がまったく同じにならないこと。
//    数だけ変わって文が固定だと「さっきと同じ」に見えて、考える気が続かない。
const replaySamples = [
  ['written', 1, 3],
  ['written', 1, 7],
  ['multiplication', 3, 1],
  ['number', 0, 0],
  ['measure', 1, 0],
  ['solve', 2, 1]
];
for (const [lineId, stageIndex, slot] of replaySamples) {
  const stems = new Set();
  for (let index = 0; index < 12; index += 1) {
    const pack = courses.makeStageQuestions('g2', lineId, stageIndex, { seed: 5100 + index * 37 });
    stems.add(stem(pack.questions[slot].prompt));
  }
  assert(stems.size >= 2, lineId + '/' + stageIndex + ' の' + (slot + 1) + '問目: 遊び直しても文が一種類のままです');
}

// 7. ライン全体としても、遊び直しで十分な種類の文が出ること。
for (const lineId of curriculum.lineOrder) {
  const stems = new Set();
  for (let index = 0; index < 12; index += 1) {
    courses.makeStageQuestions('g2', lineId, 1, { seed: 6100 + index * 53 }).questions.forEach(q => stems.add(stem(q.prompt)));
  }
  assert(stems.size >= 7, lineId + ': 一つのステージから出る文の種類が少なく、毎回ほぼ同じ並びになります');
}

console.log('grade 2 question quality smoke: ' + checked + ' questions / seed reproducible / hint ladder / explained answers / no answer leak / replay variety OK');
