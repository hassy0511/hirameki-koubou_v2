import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const rootUrl = new URL('../', import.meta.url);
const coreSource = fs.readFileSync(new URL('game-core.js', rootUrl), 'utf8');
const runtimeSource = fs.readFileSync(new URL('grade1-runtime.js', rootUrl), 'utf8');
const appSource = fs.readFileSync(new URL('app.js', rootUrl), 'utf8');
const cssSource = fs.readFileSync(new URL('styles.css', rootUrl), 'utf8');

for (const [filename, source] of [['game-core.js', coreSource], ['grade1-runtime.js', runtimeSource], ['app.js', appSource]]) {
  new vm.Script(source, { filename });
}

const sandbox = { console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
new vm.Script(coreSource, { filename: 'game-core.js' }).runInContext(sandbox);
new vm.Script(runtimeSource, { filename: 'grade1-runtime.js' }).runInContext(sandbox);

const core = sandbox.HiramekiCore;
const runtime = sandbox.HiramekiGrade1Runtime;
assert.equal(core.STATE_VERSION, 4, 'G1保存版が統合仕様の4と一致していません');
assert(runtime.validate().ok, runtime.validate().errors.join('\n'));
assert(!runtimeSource.includes('Math.random'), 'G1生成器が注入rng以外を使っています');

const expectedArc = ['intro', 'intro', 'develop', 'develop', 'story', 'twist', 'check', 'capstone'];
let generatedCount = 0;

function values(question) {
  return Array.from(question.options || [], core.optionValue).map(String);
}

function assertQuestion(question, lineId, stageIndex) {
  const line = core.LINES[lineId];
  const stage = line.stages[stageIndex];
  const contract = core.G1_STAGE_CONTRACTS[lineId][stageIndex];
  assert.equal(question.stageAction, stage.action, lineId + '/' + stage.id + ': stage.actionが生成器へ渡っていません');
  assert(question.instruction && /けってい/.test(question.instruction), lineId + '/' + stage.id + ': 確定文法がありません');
  assert(Array.isArray(question.hints) && question.hints.length >= 2, lineId + '/' + stage.id + ': 段階ヒントがありません');
  assert.notEqual(question.hint, 'よく見て、もういちど ためそう。', lineId + '/' + stage.id + ': 無内容なヒントです');
  assert(question.templateId && question.learningSignature, lineId + '/' + stage.id + ': テンプレートまたは学習署名がありません');
  if (!contract.assessment) assert(contract.allowedKinds.includes(question.kind), lineId + '/' + stage.id + ': 契約外の操作 ' + question.kind);
  if (['choice', 'route', 'sort'].includes(question.kind)) {
    const optionValues = values(question);
    assert(optionValues.includes(String(question.correct)), lineId + '/' + stage.id + ': 正解が選択肢にありません');
    // 盤面に並んだ札から選ぶ問題では、選択肢は盤面そのもの(枚数は盤面が決める)。
    // それ以外の数値問題は、誤概念にもとづく4択を保つ。
    const boardItems = Array.isArray(question.visual?.items) ? question.visual.items.map(String) : null;
    const fromBoard = Boolean(boardItems && optionValues.length && optionValues.every(value => boardItems.includes(value)));
    if (Number.isFinite(Number(question.correct))) {
      if (fromBoard) {
        assert(new Set(optionValues).size >= 3, lineId + '/' + stage.id + ': 盤面の選択肢が少なすぎます');
      } else {
        assert.equal(new Set(optionValues).size, 4, lineId + '/' + stage.id + ': 数値選択肢が4つありません');
      }
    }
  }
  if (question.sourceCanonicalSkillId !== 'g1.sub.zero_same' && question.math?.kind === 'subtract') {
    assert.notEqual(Number(question.math.b), 0, lineId + '/' + stage.id + ': 自明な「−0」です');
    assert.notEqual(Number(question.math.result), 0, lineId + '/' + stage.id + ': 意図しない「全部引く」です');
  }
  if (question.sourceCanonicalSkillId !== 'g1.number.zero_bonds' && question.math?.kind === 'bond') {
    assert.notEqual(Number(question.math.known), 0, lineId + '/' + stage.id + ': 意図しない「いま0こ」です');
    assert.notEqual(Number(question.correct), 0, lineId + '/' + stage.id + ': 意図しない「あと0こ」です');
  }
  if (question.answerDerived && Number.isFinite(Number(question.correct))) {
    const escaped = String(question.correct).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert(!new RegExp('(^|[^0-9])' + escaped + '([^0-9]|$)').test(question.instruction), lineId + '/' + stage.id + ': 操作説明に正解が書かれています');
  }
  generatedCount += 1;
}

for (const lineId of core.LINE_ORDER) {
  const line = core.LINES[lineId];
  assert.equal(core.G1_STAGE_CONTRACTS[lineId].length, 11, lineId + ': 11ステージ分の契約がありません');
  for (let stageIndex = 0; stageIndex < line.stages.length; stageIndex += 1) {
    const contract = core.G1_STAGE_CONTRACTS[lineId][stageIndex];
    assert(line.stages[stageIndex].questionContract, lineId + ': ステージメタデータに出題契約がありません');
    for (const seed of [101, 202, 303]) {
      const pack = core.makeStageQuestions(lineId, stageIndex, { seed: seed + stageIndex * 1009 });
      assert.equal(pack.questions.length, 8);
      assert.deepEqual(Array.from(pack.questions, question => question.arcRole), expectedArc, lineId + '/' + stageIndex + ': 8問アークが不正です');
      // 数える教材のように学習内容が有限のステージでは8問すべてを別内容にできない。
      // 「続けて同じ内容を出さない」「一回の中で3度は繰り返さない」を契約とする。
      const learnings = pack.questions.map(question => question.learningSignature);
      learnings.forEach((signature, index) => {
        if (index === 0) return;
        assert.notEqual(signature, learnings[index - 1], lineId + '/' + stageIndex + ': 同じ学習内容が続けて出ています');
      });
      const learningCounts = new Map();
      learnings.forEach(signature => learningCounts.set(signature, (learningCounts.get(signature) || 0) + 1));
      assert(Math.max(...learningCounts.values()) <= 2, lineId + '/' + stageIndex + ': 同じ学習内容が3回以上くり返されています');
      assert(learningCounts.size >= 5, lineId + '/' + stageIndex + ': 一回の中の学習内容が5種類未満です');
      assert(pack.questions[4].story, lineId + '/' + stageIndex + ': 5問目に場面問題がありません');
      assert(pack.questions[7].checkpoint, lineId + '/' + stageIndex + ': 最終問が代表問題ではありません');
      const kinds = new Set(pack.questions.map(question => question.kind));
      if (!contract.assessment && !contract.paired) assert.deepEqual(kinds, new Set([contract.primaryKind]), lineId + '/' + stageIndex + ': 1ステージ1中心操作ではありません');
      if (contract.paired) assert(kinds.size <= 2 && [...kinds].every(kind => contract.allowedKinds.includes(kind)), lineId + '/' + stageIndex + ': 読む・つくる以外の操作が混在しています');
      pack.questions.forEach(question => assertQuestion(question, lineId, stageIndex));
    }
    const deterministicA = core.makeStageQuestions(lineId, stageIndex, { seed: 919191 + stageIndex });
    const deterministicB = core.makeStageQuestions(lineId, stageIndex, { seed: 919191 + stageIndex });
    assert.deepEqual(deterministicA, deterministicB, lineId + '/' + stageIndex + ': 同じシードを再現できません');
  }
}

for (let packIndex = 0; generatedCount < 1000; packIndex += 1) {
  const lineId = core.LINE_ORDER[packIndex % core.LINE_ORDER.length];
  const stageIndex = Math.floor(packIndex / core.LINE_ORDER.length) % 11;
  core.makeStageQuestions(lineId, stageIndex, { seed: 700000 + packIndex * 7919 }).questions.forEach(question => assertQuestion(question, lineId, stageIndex));
}

// 盤面から選ぶ問題の選択肢は、盤面に並んだ札だけであること。
// 数字に見えるからと作り直すと、盤面に無い数(0や6)が選択肢に現れる。
for (const seed of [4001, 4002, 4003]) {
  core.makeStageQuestions('number', 7, { seed }).questions.forEach(question => {
    const items = (question.visual?.items || []).map(String);
    values(question).forEach(value => {
      assert(items.includes(value), 'なんばんめ: 盤面に無い ' + value + ' が選択肢にあります');
    });
  });
}

// 位取りの誤答は、十の位を読まずに当てられないこと。
for (const seed of [4101, 4102, 4103]) {
  core.makeStageQuestions('number', 9, { seed }).questions.forEach(question => {
    const options = values(question).map(Number).filter(Number.isFinite);
    if (options.length < 3 || Number(question.correct) < 10) return;
    assert(new Set(options.map(value => Math.floor(value / 10))).size > 1, '位取り: 誤答の十の位が正解と全部同じです');
  });
}

// 文言の作法。記号は全角へそろえ、「ちがう」に「だ」を付けない。
for (const lineId of core.LINE_ORDER) {
  for (let stageIndex = 0; stageIndex < 11; stageIndex += 1) {
    core.makeStageQuestions(lineId, stageIndex, { seed: 4200 + stageIndex }).questions.forEach(question => {
      const text = [question.prompt, question.hint, question.explain].join(' ');
      assert(!/[0-9][-+][0-9]/.test(question.prompt), lineId + ': 式に半角記号が混ざっています → ' + question.prompt);
      assert(!/ちがうだ/.test(text), lineId + ': 「ちがうだ」という壊れた文です → ' + text);
    });
  }
}

// 時計は、正解からの固定のずれで初期表示しないこと。
// 固定だと時計を読まずに「同じだけ戻す」手続きで全問正解できる。
for (const stageIndex of [7, 8, 9]) {
  const offsets = new Set();
  for (let index = 0; index < 12; index += 1) {
    core.makeStageQuestions('measure', stageIndex, { seed: 4300 + index * 31 }).questions.forEach(question => {
      if (question.kind !== 'clock') return;
      const toMinutes = value => {
        const [hour, minute] = String(value).split(':').map(Number);
        return hour * 60 + (minute || 0);
      };
      offsets.add(((toMinutes(question.input) - toMinutes(question.correct)) % 720 + 720) % 720);
    });
  }
  assert(offsets.size > 1, 'measure/' + stageIndex + ': 針の初期位置が正解からの固定のずれです');
}

// 盤面は「問題の状態」を見せる。「答えの形」を先に見せない。
// 置き場のタップできる数が答えとちょうど同じだと、全部タップするだけで正解できる。
for (const [lineId, stageIndex] of [['number', 5], ['addition', 1], ['subtraction', 0]]) {
  for (const seed of [5501, 5502, 5503]) {
    core.makeStageQuestions(lineId, stageIndex, { seed }).questions.forEach(question => {
      const visual = question.visual || {};
      if (visual.type !== 'bond-builder') return;
      const missing = Math.max(0, Number(visual.target) - Number(visual.known));
      assert.equal(Number(question.correct), missing, lineId + ': 数の分解の答えが合いません');
      assert(Math.max(10, Number(visual.target)) > missing, lineId + ': 置き場に答えの数ちょうどしか丸がありません');
    });
  }
}
// app.js 側でも、置き場を「たりない数」で描いていないこと。
assert(!/repeat\(missing,/.test(appSource), '数の分解の盤面が、答えの数だけ枠を描いています');
// 確定するまで、合っているかどうかを盤面が教えないこと。
assert(/const settled = Boolean\(question\.feedback\)/.test(appSource), '等分盤面が確定前に過不足を出しています');

// 引き算は「とった数」だけでなく「のこり」を答える問題を含むこと。
for (const stageIndex of [1, 5, 9]) {
  const stage = core.LINES.subtraction.stages[stageIndex];
  let asksRemainder = 0;
  let total = 0;
  for (const seed of [5601, 5602, 5603]) {
    core.makeStageQuestions('subtraction', stageIndex, { seed }).questions.forEach(question => {
      const math = question.math || {};
      if (math.kind !== 'subtract') return;
      total += 1;
      if (Number(question.correct) === Number(math.result)) asksRemainder += 1;
    });
  }
  assert(asksRemainder * 2 >= total, 'subtraction/' + stage.id + ': のこりを答える問題が半分もありません');
}

// 問題文がたずねている値と、採点される値が食い違わないこと。
for (const lineId of core.LINE_ORDER) {
  for (let stageIndex = 0; stageIndex < 11; stageIndex += 1) {
    core.makeStageQuestions(lineId, stageIndex, { seed: 5700 + stageIndex }).questions.forEach(question => {
      const math = question.math || {};
      if (math.kind !== 'subtract' || !/のこり/.test(question.prompt)) return;
      assert.equal(Number(question.correct), Number(math.result), lineId + '/' + stageIndex + ': 「のこり」を聞いて、とった数を採点しています → ' + question.prompt);
    });
  }
}

// 置いてある数と答えがちょうど同じだと、全部タップするだけで正解になる。
assert(/selectAllIsTheAnswer/.test(appSource), '盤面のタップ対象が答えの数ちょうどになるのを防いでいません');

// 計算のステージでは、答えが問題文や操作説明に書かれていないこと。
// (引き算の導入2問は「とる」操作そのものなので、割合で見る)
for (const [lineId, limit] of [['number', 0.05], ['addition', 0.05], ['subtraction', 0.3]]) {
  for (let stageIndex = 0; stageIndex < 11; stageIndex += 1) {
    let visible = 0;
    let total = 0;
    for (const seed of [6001, 6002, 6003, 6004]) {
      core.makeStageQuestions(lineId, stageIndex, { seed: seed + stageIndex }).questions.forEach(question => {
        const answer = Number(question.correct);
        if (!Number.isFinite(answer)) return;
        total += 1;
        const shown = value => new RegExp('(^|[^0-9])' + value + '([^0-9]|$)');
        if (shown(answer).test(String(question.prompt)) || shown(answer).test(String(question.instruction))) visible += 1;
      });
    }
    if (!total) continue;
    assert(visible / total <= limit, lineId + '/' + stageIndex + ': 答えが問題文か操作説明に見えている問題が多すぎます (' + Math.round(visible / total * 100) + '%)');
  }
}

// 形の問題で、例える物の名前に答えの語が入っていないこと。
for (const stageIndex of [0, 3]) {
  for (const seed of [6101, 6102, 6103]) {
    core.makeStageQuestions('shape', stageIndex, { seed }).questions.forEach(question => {
      const answer = String(question.correct);
      if (answer.length < 2) return;
      assert(!String(question.prompt).includes(answer) || (question.options || []).every(option => String(core.optionValue(option)).length && String(question.prompt).includes(String(core.optionValue(option)))),
        'shape/' + stageIndex + ': 物の名前に答えの語が入っています → ' + question.prompt + ' → ' + answer);
    });
  }
}

const expressionPacks = [
  core.makeStageQuestions('solve', 6, { seed: 551 }),
  core.makeStageQuestions('solve', 8, { seed: 552 })
];
expressionPacks.flatMap(pack => pack.questions).forEach(question => {
  assert(values(question).every(value => /[＋−]/.test(value)), '式の選択肢に裸の数値が混ざっています');
});

const equalGroups = core.makeStageQuestions('solve', 9, { seed: 8800 }).questions;
assert(equalGroups.every(question => question.kind === 'grouping'), '等分問題が操作ルーレットへ戻っています');
assert(equalGroups.every(question => !String(question.instruction).includes(String(question.correct))), '等分問題の説明に答えがあります');

assert(appSource.includes('data-select-answer'), '通常モードで選択と確定が分かれていません');
assert(appSource.includes("action === 'submit-choice'"), '選択式の「けってい」処理がありません');
// 選択状態は question.input と分けて持つ。
// input には生成時の初期値が入るため、それを選択済みとして扱うと
// 子どもが何も選んでいないのに誤答が選ばれて見え、確定も押せてしまう。
assert(appSource.includes('question.choiceSelection'), '選択状態を問題の初期値と分けて持っていません');
assert(!/const selected = stagedChoice && String\(question\.input\)/.test(appSource), '選択状態が問題の初期値に依存しています');
assert(/choiceSelection = null/.test(appSource), 'やりなおしで選択状態が消えません');
assert(!/stagedChoice = activeCourseId === 'g1'/.test(appSource), '確定文法が学年によって変わっています');
assert(appSource.includes("question.attempts >= 2"), '二回目の誤答で支援が進みません');
assert(appSource.includes("kind: 'teach'"), '正解説明へ進む段階支援がありません');
assert(appSource.includes("question.kind === 'numberline'"), '歩ける数直線UIがありません');
assert(appSource.includes("question.kind === 'grouping'"), '等分を試すUIがありません');
assert(appSource.includes("slice(activeCourseId === 'g1' ? -96"), '通常ステージの直近32問分を保持していません');
assert(appSource.includes("slice(activeCourseId === 'g1' ? -108"), 'タイムアタックの直近36問分を保持していません');
assert(/\.answer-button\.selected/.test(cssSource), '選択中の答えが見分けられません');
assert(/\.play-number-line/.test(cssSource), '操作できる数直線の見た目がありません');
assert(/\.groups-builder/.test(cssSource), '等分盤面の見た目がありません');

console.log('grade 1 question contract smoke: 66 contracts / fixed center action / 8-question arc / seeded rng / misconception choices / hint ladder / confirm grammar / 1000+ invariants OK');
