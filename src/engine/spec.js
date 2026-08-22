// 出題の品質契約。
// 「良い問題」の条件を文章ではなく検査として持つ。前作は文章で決めて守られなかった。
// すべての生成問題は validatePack を通ってからでないと画面に出せない。
// 根拠は docs/carryover_for_rebuild.md 第3章。

export const KINDS = Object.freeze([
  'choice',     // 選択肢から えらんで けってい
  'keypad',     // 数字キーで いれて けってい
  'count-tap',  // 置き場から 必要な数だけ タップして けってい(数を作る課題)
  'pick-one',   // 並んだものから 一つを タップして けってい(位置・対象を指す課題)
  'remove',     // 置いてあるものを タップして 取り除いて けってい
  'numberline', // かずの線を 歩いて けってい
  'clock-set',  // とけいの針を 動かして けってい
  'grid',       // マス目を タップして 形を作って けってい
  'equation-build' // すうじと＋−のキーで しきを作り、つづけて こたえを いれて けってい
]);

// 小1の画面に出してよい文字。漢字は一切出さない(ヒント・解説も同じ)。
const G1_TEXT = /^[ぁ-んァ-ンヴー0-9 　。、「」？！・＋−＝:じふんぷはい]*$/;
const KANJI = /[一-鿿]/;

// 動詞と操作の対応。問題文がこう言ったら、操作はこれでなければならない。
const VERB_RULES = [
  { verb: /とろう|とりのぞこう/, kinds: ['remove'] },
  { verb: /タップして/, kinds: ['count-tap', 'pick-one', 'remove', 'grid'] },
  { verb: /すすもう|もどろう|あるこう/, kinds: ['numberline'] },
  { verb: /はりを|とけいを あわせよう/, kinds: ['clock-set'] },
  { verb: /いれよう|ぬろう/, kinds: ['count-tap', 'grid'] },
  { verb: /うつそう/, kinds: ['grid'] }
];

function bareNumber(value) {
  return new RegExp('(^|[^0-9])' + String(value) + '([^0-9]|$)');
}

function isPureEquation(text) {
  return /^[0-9]+\s*[＋−]\s*[0-9]+\s*＝\s*[0-9]+\s*。?$/.test(String(text || '').trim());
}

export function validateQuestion(q, stage, label) {
  const errors = [];
  const err = message => errors.push(label + ': ' + message);

  if (!KINDS.includes(q.kind)) err('未知の操作 ' + q.kind);
  if (!stage.kinds.includes(q.kind)) err('契約外の操作 ' + q.kind + '(許可: ' + stage.kinds.join('/') + ')');
  if (!q.prompt || !/[？。]$/.test(q.prompt)) err('問題文が文になっていない: ' + q.prompt);
  if (!q.instruction) err('やることが無い');
  if (!q.hint1 || !q.hint2) err('二段階のヒントが無い');
  if (q.hint1 === q.hint2) err('ヒントが二つとも同じ');
  if (!q.explain) err('解説が無い');
  if (isPureEquation(q.explain)) err('解説が式だけ: ' + q.explain);

  // 表記: 小1に見せる文はひらがな+数字+記号だけ
  for (const [name, text] of [['問題文', q.prompt], ['やること', q.instruction], ['ヒント1', q.hint1], ['ヒント2', q.hint2], ['解説', q.explain]]) {
    if (KANJI.test(String(text || ''))) err(name + 'に漢字: ' + text);
  }

  // 答えを先に見せない(数を作る課題 task:'produce' だけは、数を示すことが課題)
  const numericAnswer = Number.isFinite(Number(q.answer)) ? Number(q.answer) : null;
  if (numericAnswer !== null && q.task !== 'produce' && !stage.answerEcho) {
    if (bareNumber(numericAnswer).test(q.prompt)) err('答えが問題文に出ている: ' + q.prompt + ' → ' + q.answer);
    if (bareNumber(numericAnswer).test(q.instruction)) err('答えがやることに出ている: ' + q.instruction);
  }
  if (q.task === 'produce' && !['count-tap', 'remove', 'grid', 'clock-set', 'numberline', 'pick-one'].includes(q.kind)) {
    err('数を作る課題なのに操作が ' + q.kind);
  }

  // 解説は答えを言う(教えて先へ進む段のため)
  if (numericAnswer !== null && !['clock-set', 'grid', 'pick-one'].includes(q.kind)) {
    if (!bareNumber(numericAnswer).test(q.explain)) err('解説が答えを言っていない: ' + q.explain + ' → ' + q.answer);
  }

  // 動詞と操作の一致
  for (const rule of VERB_RULES) {
    if (rule.verb.test(q.prompt) && !rule.kinds.includes(q.kind)) {
      err('動詞と操作の不一致: 「' + q.prompt + '」なのに ' + q.kind);
    }
  }
  if (/のこりは いくつ/.test(q.prompt) && q.math && q.math.kind === 'sub') {
    if (numericAnswer !== q.math.a - q.math.b) err('「のこり」を聞いて別の値を採点: ' + q.prompt + ' → ' + q.answer);
  }

  // 操作ごとの盤面契約
  const b = q.board || {};
  if (q.kind === 'choice') {
    const opts = (q.options || []).map(String);
    if (opts.length < 2) err('選択肢が2つ未満');
    if (new Set(opts).size !== opts.length) err('選択肢が重複: ' + opts.join('|'));
    if (!opts.includes(String(q.answer))) err('正解が選択肢に無い: [' + opts.join('|') + '] → ' + q.answer);
    const allNumeric = opts.every(o => Number.isFinite(Number(o)));
    if (allNumeric) {
      if (opts.length !== 4 && !stage.smallAnswerSpace) err('数値選択肢が4つでない: ' + opts.join('|'));
      if (opts.some(o => Number(o) < 0)) err('負の数が選択肢に: ' + opts.join('|'));
      if (opts.includes('0') && numericAnswer !== 0 && !stage.zeroMeaningful && b.countable) {
        err('数えるものが見えているのに誤答に0');
      }
    }
    const expressions = opts.filter(o => /[＋−]/.test(o));
    if (expressions.length) {
      if (expressions.length !== opts.length) err('式と数値が混在した選択肢: ' + opts.join('|'));
      for (const expr of expressions) {
        const m = expr.match(/^([0-9]+)−([0-9]+)$/);
        if (m && Number(m[1]) < Number(m[2])) err('答えの出ない式が選択肢に: ' + expr);
      }
    }
  }
  if (q.kind === 'count-tap') {
    if (!(Number(b.supply) > numericAnswer)) err('置き場がちょうど答えの数(' + b.supply + '個)しかない');
    if (!(numericAnswer >= 1)) err('タップ数0は操作にならない');
  }
  if (q.kind === 'remove') {
    if (!(numericAnswer >= 1)) err('取り除く数が0');
    if (!(Number(b.total) >= numericAnswer)) err('置いてある数より多く取れと言っている');
    if (Number(b.total) === numericAnswer && !q.removeAll) err('全部取れば正解になっている(removeAll指定なし)');
  }
  if (q.kind === 'pick-one') {
    if (!Array.isArray(b.items) || b.items.length < 4) err('並べるものが4つ未満');
    if (!(numericAnswer >= 0 && numericAnswer < (b.items || []).length)) err('指す位置が範囲外');
  }
  if (q.kind === 'numberline') {
    if (!(b.min <= numericAnswer && numericAnswer <= b.max)) err('数直線の範囲外に答え');
    if (Number(b.start) === numericAnswer) err('数直線の開始位置が答えそのもの');
  }
  if (q.kind === 'clock-set') {
    if (String(b.startH) + ':' + String(b.startM) === String(q.answer)) err('針の初期位置が答えそのもの');
  }
  if (q.kind === 'grid') {
    if (!Array.isArray(b.pattern) || !b.pattern.length) err('作る形が無い');
    if (!(b.size * b.size > b.pattern.length)) err('マス目全部が答え');
  }
  if (q.kind === 'keypad') {
    if (numericAnswer === null) err('数字入力なのに答えが数でない');
    if (numericAnswer > 120) err('小1の入力範囲を超える答え: ' + q.answer);
  }
  if (q.kind === 'equation-build') {
    // 式づくり: 文章から数と演算を子どもが取り出す課題。
    // 採点は math の {kind, a, b} が根拠(たし算は順不同で正解にする)。
    const m = q.math || {};
    if (m.kind !== 'add' && m.kind !== 'sub') err('式づくりなのに math.kind が add/sub でない');
    if (!Number.isFinite(m.a) || !Number.isFinite(m.b)) err('式づくりの a, b が数でない');
    if (m.a < 1 || m.b < 1 || m.a > 99 || m.b > 99) err('式づくりの数が小1の範囲外: ' + m.a + ',' + m.b);
    if (m.kind === 'sub' && !(m.a > m.b)) err('引き算なのに a>b でない: ' + m.a + '−' + m.b);
    const expect = m.kind === 'add' ? m.a + m.b : m.a - m.b;
    if (numericAnswer !== expect) err('式づくりの答えが式と合わない: ' + q.answer + ' ≠ ' + expect);
    // 数は必ず文章の中にある(画面にない情報で採点しない、の原則)
    if (!bareNumber(m.a).test(q.prompt)) err('式に使う数 ' + m.a + ' が文章に無い: ' + q.prompt);
    if (!bareNumber(m.b).test(q.prompt)) err('式に使う数 ' + m.b + ' が文章に無い: ' + q.prompt);
  }
  return errors;
}

export function validatePack(pack, stage, label) {
  const errors = [];
  const err = message => errors.push(label + ': ' + message);
  const questions = pack.questions || [];
  if (questions.length !== 8) err('8問でない(' + questions.length + '問)');

  questions.forEach((q, i) => {
    errors.push(...validateQuestion(q, stage, label + ' q' + (i + 1)));
  });

  // 場面問題は5問目
  questions.forEach((q, i) => {
    if (i === 4 && !q.story) err('5問目が場面問題でない');
    if (i !== 4 && q.story) err('場面問題が' + (i + 1) + '問目に出ている');
  });

  // 同じ問題を続けない
  const visible = questions.map(q => JSON.stringify([q.prompt, q.answer, q.board]));
  if (new Set(visible).size !== visible.length) err('見た目まで同じ問題が一回の中にある');
  const keys = questions.map(q => q.learningKey || '');
  for (let i = 1; i < keys.length; i += 1) {
    if (keys[i] && keys[i] === keys[i - 1]) err('同じ学習内容が続いている: ' + keys[i]);
  }
  const keyCount = new Map();
  keys.forEach(k => keyCount.set(k, (keyCount.get(k) || 0) + 1));
  const maxRepeat = stage.maxRepeat || 2;
  for (const [k, n] of keyCount) {
    if (n > maxRepeat) err('同じ学習内容が' + n + '回: ' + k);
  }

  // 答えの偏り: 同じ答えが3連続しない。2択の言葉答えは片方に寄らない
  const answers = questions.map(q => String(q.answer));
  for (let i = 2; i < answers.length; i += 1) {
    if (answers[i] === answers[i - 1] && answers[i] === answers[i - 2]) err('同じ答えが3問続く: ' + answers[i]);
  }
  if (stage.balanceAnswers) {
    const tally = new Map();
    answers.forEach(a => tally.set(a, (tally.get(a) || 0) + 1));
    for (const [a, n] of tally) {
      if (n >= 6) err('答えが「' + a + '」に偏っている(' + n + '/8)');
    }
  }

  // 数の答えの単調さ: 「2と3ばかり」のような回を禁じる。
  // 位置答え(pick-one)と、答えの空間が意図して狭いステージは対象外。
  const numericSeq = questions
    .filter(q => q.kind !== 'pick-one' && /^\d+$/.test(String(q.answer)))
    .map(q => String(q.answer));
  if (!stage.smallAnswerSpace && !stage.represent && numericSeq.length >= 6) {
    const tally = new Map();
    numericSeq.forEach(a => tally.set(a, (tally.get(a) || 0) + 1));
    for (const [a, n] of tally) {
      if (n > 3) err('同じ答え「' + a + '」が' + n + '回ある(3回まで)');
    }
    if (new Set(numericSeq).size < 4) err('答えの種類が' + new Set(numericSeq).size + '種しかない(4種以上)');
    for (let i = 0; i + 4 <= numericSeq.length; i += 1) {
      const window = new Set(numericSeq.slice(i, i + 4));
      if (window.size < 3) err('連続する4問の答えが' + [...window].join('と') + 'の くりかえしになっている');
    }
  }

  // 「答えの数が問題文に書いてある」作業課題は導入だけ。
  // (前作の「4こ とろう を8回」を禁じる規則。答えが文に無い操作課題は対象外)
  if (!stage.represent && !stage.assessment) {
    const echoing = questions.map(q => {
      const n = Number(q.answer);
      return q.task === 'produce' && Number.isFinite(n) && bareNumber(n).test(q.prompt);
    });
    const produce = echoing.filter(Boolean).length;
    if (produce > (stage.maxProduce == null ? 2 : stage.maxProduce)) err('答えが文にある作業課題が' + produce + '問ある');
    echoing.forEach((is, i) => {
      if (is && i > 1) err('答えが文にある作業課題が' + (i + 1) + '問目にある(導入2問まで)');
    });
  }
  return errors;
}
