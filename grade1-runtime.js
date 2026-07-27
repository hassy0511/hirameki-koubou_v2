(function (global) {
  'use strict';

  const core = global.HiramekiCore;
  if (!core) throw new Error('HiramekiCore is required before grade1-runtime.js');

  const legacyBuildQuestion = core.buildQuestion;
  const ARC = Object.freeze(['intro', 'intro', 'develop', 'develop', 'story', 'twist', 'check', 'capstone']);
  const ARC_TARGET = Object.freeze([0.22, 0.34, 0.48, 0.6, 0.64, 0.72, 0.8, 0.9]);
  const ALL_KINDS = Object.freeze(['choice', 'route', 'sort', 'tap', 'remove', 'select', 'order', 'slider', 'clock', 'input', 'numberline', 'grouping']);

  function contract(kind, options) {
    return Object.freeze(Object.assign({
      primaryKind: kind,
      allowedKinds: Object.freeze([kind]),
      paired: false,
      assessment: false,
      sourceRound: null,
      sourceStage: null,
      roundPattern: null
    }, options || {}));
  }

  function paired(kinds, options) {
    return contract(kinds[0], Object.assign({
      allowedKinds: Object.freeze(kinds.slice()),
      paired: true
    }, options || {}));
  }

  function assessment(options) {
    return contract(null, Object.assign({
      allowedKinds: ALL_KINDS,
      assessment: true
    }, options || {}));
  }

  const STAGE_CONTRACTS = Object.freeze({
    number: Object.freeze([
      contract('choice', { sourceRound: 0 }),
      contract('choice'),
      contract('choice', { sourceRound: 1 }),
      contract('input', { sourceRound: 3 }),
      assessment({ reviewPlan: [0, 1, 2, 3, 0, 1, 2, 3] }),
      contract('tap', { sourceRound: 1 }),
      contract('order', { sourceRound: 0 }),
      contract('choice'),
      contract('choice', { sourceRound: 0 }),
      contract('choice', { sourceRound: 0 }),
      assessment({ reviewPlan: [0, 1, 2, 3, 5, 6, 8, 9] })
    ]),
    addition: Object.freeze([
      contract('choice'),
      contract('tap', { sourceRound: 1 }),
      contract('choice', { sourceRound: 0 }),
      contract('numberline', { sourceRound: 1 }),
      assessment({ reviewPlan: [0, 1, 2, 3, 0, 1, 2, 3] }),
      contract('choice', { sourceRound: 1 }),
      contract('choice', { sourceRound: 0 }),
      contract('numberline', { sourceRound: 1 }),
      contract('route'),
      contract('tap', { sourceRound: 0 }),
      assessment({ reviewPlan: [1, 2, 3, 5, 6, 7, 8, 9] })
    ]),
    subtraction: Object.freeze([
      contract('tap', { sourceRound: 1 }),
      contract('remove', { sourceRound: 0 }),
      contract('choice'),
      contract('numberline', { sourceRound: 1 }),
      assessment({ reviewPlan: [0, 1, 2, 3, 0, 1, 2, 3] }),
      contract('remove', { sourceRound: 1 }),
      contract('numberline'),
      contract('choice'),
      contract('numberline'),
      contract('remove', { custom: 'placeValueRemove' }),
      assessment({ reviewPlan: [0, 1, 2, 3, 5, 6, 7, 8] })
    ]),
    measure: Object.freeze([
      contract('choice'),
      contract('choice'),
      contract('tap', { sourceRound: 0 }),
      contract('choice'),
      assessment({ reviewPlan: [0, 1, 2, 3, 0, 1, 2, 3] }),
      contract('choice'),
      contract('choice'),
      paired(['choice', 'clock']),
      paired(['choice', 'clock']),
      paired(['choice', 'clock']),
      assessment({ reviewPlan: [0, 1, 2, 3, 5, 6, 8, 9] })
    ]),
    shape: Object.freeze([
      contract('choice'),
      contract('choice'),
      contract('sort'),
      contract('choice'),
      assessment({ reviewPlan: [0, 1, 2, 3, 0, 1, 2, 3] }),
      contract('select'),
      contract('choice'),
      contract('tap'),
      contract('select'),
      contract('select'),
      assessment({ reviewPlan: [0, 1, 2, 3, 5, 6, 7, 9] })
    ]),
    solve: Object.freeze([
      contract('sort', { custom: 'mathClassify' }),
      contract('choice'),
      contract('tap'),
      contract('choice'),
      assessment({ reviewPlan: [0, 1, 2, 3, 0, 1, 2, 3] }),
      contract('choice'),
      contract('choice'),
      contract('input'),
      contract('choice'),
      contract('grouping', { custom: 'equalGroups' }),
      assessment({ reviewPlan: [0, 1, 2, 3, 5, 6, 8, 9] })
    ])
  });

  Object.keys(STAGE_CONTRACTS).forEach(function (lineId) {
    core.LINES[lineId].stages.forEach(function (stage, stageIndex) {
      stage.questionContract = Object.freeze(Object.assign({}, STAGE_CONTRACTS[lineId][stageIndex], {
        action: stage.action,
        arc: ARC
      }));
    });
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function isNumeric(value) {
    return value !== '' && Number.isFinite(Number(value));
  }

  function optionValue(option) {
    return core.optionValue(option);
  }

  function uniqueOptions(values) {
    const seen = new Set();
    return values.filter(function (value) {
      const key = String(optionValue(value));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // 見た目だけを変える飾りの値。学習内容の同一判定からは外す。
  const COSMETIC_VISUAL_KEYS = Object.freeze(['layoutVariant', 'materialVariant']);

  function learningVisual(visual) {
    const copy = Object.assign({}, visual || {});
    COSMETIC_VISUAL_KEYS.forEach(function (key) { delete copy[key]; });
    return copy;
  }

  function zeroIsMeaningful(question) {
    if (Number(question.correct) === 0) return true;
    const skill = String(question.sourceCanonicalSkillId || question.canonicalSkillId || '');
    return /zero/.test(skill);
  }

  function numericMisconceptions(question, rng) {
    const correct = Number(question.correct);
    const min = Number.isFinite(Number(question.min)) ? Number(question.min) : Math.max(0, correct - 10);
    const max = Number.isFinite(Number(question.max)) ? Number(question.max) : Math.max(20, correct + 10);
    const math = question.math || {};
    // 数える問題で「0」を誤答に出すと、丸が見えているのに0という不自然な選択肢になる
    const allowZero = zeroIsMeaningful(question);
    const floor = allowZero ? min : Math.max(min, 1);
    const misconceptions = [];
    if (math.kind === 'add') {
      // 片方の数だけを答える／引いてしまう／1ずれ
      misconceptions.push(math.a, math.b, correct + 1, correct - 1);
      if (Number(math.a) !== Number(math.b)) misconceptions.push(Math.abs(math.a - math.b));
    } else if (math.kind === 'subtract') {
      // たしてしまう／引く数や引かれる数をそのまま答える／1ずれ
      misconceptions.push(Number(math.a) + Number(math.b), math.b, math.a, correct + 1, correct - 1);
    } else if (math.kind === 'bond') {
      misconceptions.push(math.known, math.target, correct + 1, correct - 1);
    } else if (math.kind === 'sequence') {
      const first = Number(math.values && math.values[0] || 0);
      const second = Number(math.values && math.values[1] || 0);
      const firstResult = math.ops && math.ops[0] === '-' ? first - second : first + second;
      misconceptions.push(firstResult, first, correct + 1, correct - 1);
    } else if (math.kind === 'groups') {
      misconceptions.push(math.groups, math.perGroup, math.total, correct + 1, correct - 1);
    } else if (math.kind === 'placeValue') {
      // 誤答が正解の±1・±2だけだと十の位が全部同じになり、
      // 「10のまとまりが何こか」を読まずに、ばらの数だけで当てられてしまう。
      const tens = Number(math.tens);
      const ones = Number(math.ones);
      misconceptions.push(
        ones * 10 + tens,          // 十と一を入れ替えた
        (tens + 1) * 10 + ones,    // 十の位を1こ多く数えた
        (tens - 1) * 10 + ones,    // 十の位を1こ少なく数えた
        ones,                      // ばらだけ答えた
        tens                       // まとまりの数だけ答えた
      );
    } else {
      misconceptions.push(correct + 1, correct - 1, correct + 2, correct - 2);
      if (correct >= 10) misconceptions.push(Number(String(correct).split('').reverse().join('')));
    }
    const usable = uniqueOptions(misconceptions
      .map(Number)
      .filter(function (value) { return Number.isFinite(value); })
      .map(function (value) { return clamp(value, floor, max); })
      .filter(function (value) { return value !== correct; }));
    const preferred = [correct].concat(usable).slice(0, 4);
    // 足りない分は正解の近くから埋めるが、選べる幅が狭いときは無理に4つへ広げない
    for (let distance = 1; preferred.length < 4 && distance <= Math.max(20, max - floor); distance += 1) {
      [correct - distance, correct + distance].forEach(function (value) {
        if (value < floor || value > max) return;
        if (preferred.length >= 4) return;
        if (!preferred.includes(value)) preferred.push(value);
      });
    }
    return core.shuffle(preferred.slice(0, 4), rng);
  }

  function expressionOptions(question, rng) {
    const math = question.math || {};
    const a = Number(math.a);
    const b = Number(math.b);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return question.options || [];
    const symbol = math.kind === 'subtract' ? '−' : '＋';
    const opposite = symbol === '＋' ? '−' : '＋';
    const correct = a + symbol + b;
    const nearB = Math.max(0, b - 1);
    const candidates = [
      correct,
      a + opposite + b,
      a + symbol + (b + 1),
      a + symbol + nearB,
      Math.max(0, a - 1) + symbol + b
    ];
    return core.shuffle(uniqueOptions(candidates).slice(0, 4), rng);
  }

  // 盤面に並んだ札から選ぶ問題では、選択肢は盤面そのもの。
  // 数字に見えるからと作り直すと、盤面に無い数が選択肢に現れる。
  function optionsComeFromBoard(question) {
    const items = question.visual && question.visual.items;
    if (!Array.isArray(items) || !items.length) return false;
    const values = (question.options || []).map(optionValue).map(String);
    if (!values.length) return false;
    const board = items.map(String);
    return values.every(function (value) { return board.includes(value); });
  }

  function normalizeChoiceOptions(question, rng) {
    const values = (question.options || []).map(optionValue);
    const expression = typeof question.correct === 'string' && /[＋−]/.test(question.correct);
    if (expression) {
      question.options = expressionOptions(question, rng);
      return;
    }
    if (optionsComeFromBoard(question)) {
      question.options = uniqueOptions(question.options || []);
      return;
    }
    if (isNumeric(question.correct)) {
      question.options = numericMisconceptions(question, rng);
      return;
    }
    if (!values.some(function (value) { return String(value) === String(question.correct); })) {
      question.options = [question.correct].concat(question.options || []);
    }
    question.options = uniqueOptions(question.options || []);
  }

  function startForNumberLine(question) {
    const math = question.math || {};
    if (math.kind === 'sequence' && math.values) return Number(math.values[0]);
    if (math.a != null) return Number(math.a);
    if (question.visual && question.visual.start != null) return Number(question.visual.start);
    return Number(question.min || 0);
  }

  function coerceKind(question, kind, rng) {
    if (!kind || question.kind === kind) return question;
    question.kind = kind;
    question.selected = [];
    question.orderSelected = [];
    if (kind === 'choice' || kind === 'route' || kind === 'sort') {
      normalizeChoiceOptions(question, rng);
      question.input = '';
    } else if (kind === 'input') {
      question.options = [];
      question.input = '';
    } else if (kind === 'numberline') {
      question.options = [];
      question.input = startForNumberLine(question);
      question.min = Number.isFinite(Number(question.min)) ? Number(question.min) : 0;
      question.max = Number.isFinite(Number(question.max)) ? Number(question.max) : 20;
      question.step = 1;
    } else if (kind === 'tap' || kind === 'remove' || kind === 'select') {
      question.options = [];
      question.input = 0;
    }
    return question;
  }

  function instructionFor(question) {
    const visual = question.visual || {};
    if (question.kind === 'choice') {
      if (visual.type === 'measure-method') return 'やりかたを ひとつ えらんで「けってい」';
      if (question.optionLayout === 'horizontal-axis') return 'ひだり・おなじ・みぎから えらんで「けってい」';
      if (question.optionLayout === 'vertical-axis') return 'うえ・まんなか・したから えらんで「けってい」';
      if (question.optionLayout === 'depth-axis') return 'まえ・うしろから えらんで「けってい」';
      if (question.optionLayout === 'relation') return '＜・＝・＞から えらんで「けってい」';
      return 'こたえを ひとつ えらんで「けってい」';
    }
    if (question.kind === 'route') return 'たどりつく こたえを えらんで「けってい」';
    if (question.kind === 'sort') return 'なかまを ひとつ えらんで「けってい」';
    if (question.kind === 'tap') {
      if (visual.type === 'unit-length-builder') return 'ぼうの はしと あう ブロックの みぎはしを タップして「けってい」';
      if (visual.type === 'graph-build') return 'ひつような しるしを タップして「けってい」';
      if (visual.type === 'sticks') return 'ひつような ぼうを タップして「けってい」';
      if (visual.type === 'bond' || visual.type === 'bond-builder') return 'たりないぶんの まるを タップして「けってい」';
      if (visual.type === 'make-ten' || visual.type === 'make-ten-builder') return '10に うごかす まるを タップして「けってい」';
      return 'ひつようなぶんを タップして「けってい」';
    }
    if (question.kind === 'remove') return 'とる ものを タップして「けってい」';
    if (question.kind === 'select') return 'こたえの ばしょを タップして「けってい」';
    if (question.kind === 'order') return 'じゅんばんに タップして「けってい」';
    if (question.kind === 'slider') return '−と＋で こたえを つくって「けってい」';
    if (question.kind === 'numberline') return 'かずの せんを ひとつずつ うごかして「けってい」';
    if (question.kind === 'clock') return 'みじかい はりと ながい はりを うごかして「けってい」';
    if (question.kind === 'grouping') return '−と＋で わけかたを ためして「けってい」';
    return 'すうじを いれて「けってい」';
  }

  // 「すすむ/もどる」は数の線の上でだけ意味を持つ言い回し。
  // 合流図やダイヤル盤に対して使うと、画面に無い動きを指示することになる。
  const MOTION_WORDS = /すすも|進も|もどろ|もどる|後ろへ|先へ/;

  function isNumberLineVisual(question) {
    const type = (question.visual || {}).type || '';
    return question.kind === 'numberline' || /number-line|rail/.test(type);
  }

  function secondHint(question) {
    const math = question.math || {};
    const type = (question.visual || {}).type || '';
    const online = isNumberLineVisual(question);
    if (math.kind === 'add') {
      if (online) return math.a + 'から ' + math.b + 'こぶん すすもう。';
      if (type === 'merge' || type === 'story' || type === 'crane') return 'まず ' + math.a + 'こ。そこへ ' + math.b + 'こ くわえて かぞえよう。';
      return math.a + 'こから さきを、' + math.b + 'こ ゆびで かぞえよう。';
    }
    if (math.kind === 'subtract') {
      if (online) return math.a + 'から ' + math.b + 'こぶん もどろう。';
      if (type === 'merge' || type === 'story' || type === 'crane') return math.a + 'こから ' + math.b + 'こ へらして、のこりを かぞえよう。';
      return math.a + 'こ ならべて、' + math.b + 'こ かくして みよう。';
    }
    if (math.kind === 'bond') return math.known + 'こから ' + math.target + 'こまで、ゆびで 1つずつ かぞえよう。';
    if (math.kind === 'groups') return 'まるを 1こずつ、どの ばしょにも おなじように くばろう。';
    if (type === 'clock-read') return 'ながい はりで ふん、みじかい はりで じを たしかめよう。';
    if (/length|capacity|area/.test(type)) return '二つの はじまりや、つかった おなじ大きさの ものを たしかめよう。';
    if (['objects', 'five-frame', 'selector'].includes(type)) return 'ひだりから、ひとつずつ ゆびで おさえて かぞえよう。';
    return 'みほんと こたえを、ひとつずつ ゆびで たしかめよう。';
  }

  // ビルダー側のヒントは、そのビルダーが受け持つ別ステージの盤面を前提にしている場合がある。
  // 画面と食い違う言い回しのときだけ、盤面に合わせて作り直す。
  function resolveHint(question) {
    const builderHint = question.hint && question.hint !== 'よく見て、もういちど ためそう。' ? String(question.hint) : '';
    if (!builderHint) return secondHint(question);
    if (MOTION_WORDS.test(builderHint) && !isNumberLineVisual(question)) return secondHint(question);
    return builderHint;
  }

  // 「2＋1＝3。」だけでは、なぜそうなるかが残らない。
  // 何を どうしたら そうなったのかを、式の前に一文で置く。
  function enrichExplain(question) {
    const explain = String(question.explain || '').trim();
    const math = question.math || {};
    const formulaOnly = /^[0-9]+\s*[＋−+\-]\s*[0-9]+\s*＝\s*[0-9]+。?$/.test(explain);
    if (explain && !formulaOnly) return explain;
    if (math.kind === 'add') {
      return math.a + 'こと ' + math.b + 'こを あわせると ' + math.result + 'こ。だから ' + math.a + '＋' + math.b + '＝' + math.result + '。';
    }
    if (math.kind === 'subtract') {
      return math.a + 'こから ' + math.b + 'こ へると ' + math.result + 'こ のこる。だから ' + math.a + '−' + math.b + '＝' + math.result + '。';
    }
    if (math.kind === 'bond') {
      return math.known + 'こに ' + question.correct + 'こ たすと ' + math.target + 'こ。' + math.known + 'と' + question.correct + 'で' + math.target + 'だね。';
    }
    // mathメタデータを持たないビルダーでも、式だけの解説は文へ直す
    const parsed = explain.match(/^([0-9]+)\s*([＋−+\-])\s*([0-9]+)\s*＝\s*([0-9]+)。?$/);
    if (parsed) {
      const left = parsed[1];
      const right = parsed[3];
      const result = parsed[4];
      const adding = parsed[2] === '＋' || parsed[2] === '+';
      return adding
        ? left + 'こと ' + right + 'こを あわせると ' + result + 'こ。だから ' + left + '＋' + right + '＝' + result + '。'
        : left + 'こから ' + right + 'こ へると ' + result + 'こ のこる。だから ' + left + '−' + right + '＝' + result + '。';
    }
    return explain || 'こたえは ' + question.correct + '。もういちど いっしょに たしかめよう。';
  }

  // 場面問題は「キャラクター名を頭に付ける」ことではなく、
  // 数の意味が場面として立ち上がる一文を作ることで成立させる。
  // 盤面に出ているものと同じ「まる」で語り、絵と文がずれないようにする。
  const SCENE_TEMPLATES = Object.freeze({
    add: [
      function (m) { return 'トトが まるを ' + m.a + 'こ、モクモが ' + m.b + 'こ もってきました。あわせて いくつ？'; },
      function (m) { return 'はこに まるが ' + m.a + 'こ。あとから ' + m.b + 'こ 入れました。ぜんぶで いくつ？'; },
      function (m) { return 'たなに まるが ' + m.a + 'こと ' + m.b + 'こ あります。あわせて いくつ？'; }
    ],
    subtract: [
      function (m) { return 'まるが ' + m.a + 'こ ありました。' + m.b + 'こ つかいました。のこりは いくつ？'; },
      function (m) { return 'はこに まるが ' + m.a + 'こ。' + m.b + 'こ とりだしました。のこりは いくつ？'; },
      function (m) { return 'トトが まるを ' + m.a + 'こ ならべて、' + m.b + 'こ かたづけました。のこりは いくつ？'; }
    ],
    bond: [
      function (m) { return 'はこは まるが ' + m.target + 'こで いっぱいです。いま ' + m.known + 'こ。あと いくつ？'; },
      function (m) { return 'まるを ' + m.target + 'こ ならべたいです。いま ' + m.known + 'こ あります。あと いくつ？'; }
    ],
    count: [
      function () { return 'トトが まるを ならべました。ぜんぶで いくつ？'; },
      function () { return 'たなに まるが ならんでいます。ぜんぶで いくつ？'; },
      function () { return 'モクモが まるを はこに 入れました。ぜんぶで いくつ？'; }
    ]
  });

  function sceneVariants(question) {
    const math = question.math || {};
    if (math.kind === 'add' && Number.isFinite(Number(math.a)) && Number.isFinite(Number(math.b))) return SCENE_TEMPLATES.add;
    if (math.kind === 'subtract' && Number.isFinite(Number(math.a)) && Number.isFinite(Number(math.b))) return SCENE_TEMPLATES.subtract;
    if (math.kind === 'bond' && Number.isFinite(Number(math.target)) && Number.isFinite(Number(math.known))) return SCENE_TEMPLATES.bond;
    const visual = question.visual || {};
    if (!math.kind && ['objects', 'five-frame'].includes(visual.type) && Number(question.correct) === Number(visual.count)) return SCENE_TEMPLATES.count;
    return null;
  }

  // 場面として書ける問題だけを場面文へ書き換える。
  // 書けないものへ無理にキャラ文を貼らない(貼ると場面のない「おはなし」になる)。
  function applyScene(question, rng) {
    const variants = sceneVariants(question);
    if (!variants) return false;
    const template = core.pick(variants, rng);
    question.prompt = template(question.math || {});
    return true;
  }

  function fixKnownQuestionProblems(question, lineId, stageIndex, variation, rng) {
    if (lineId === 'number' && [0, 2, 3].includes(stageIndex) && question.visual && ['objects', 'five-frame'].includes(question.visual.type)) {
      question.visual.layoutVariant = variation % 6;
      if (Math.floor(variation / 6) % 2 === 1) question.prompt = 'ならんだ まるを かぞえよう。いくつ？';
    }
    if (((lineId === 'number' && stageIndex === 8) || (lineId === 'addition' && stageIndex === 5)) && question.visual && question.visual.type === 'ten-bundle') {
      question.visual.layoutVariant = variation % 3;
      if (Math.floor(variation / 3) % 2 === 1) question.prompt = '10と ばらを あわせると、いくつ？';
    }
    if (lineId === 'measure' && stageIndex === 2 && question.visual) {
      question.visual.layoutVariant = variation % 3;
      if (Math.floor(variation / 3) % 2 === 1) question.prompt = 'ぼうの はしまで、ブロック なんこぶん？';
    }
    if (lineId === 'number' && stageIndex === 6) {
      const orderPrompts = [
        'すうじを ちいさい じゅんに ならべよう。',
        'かずの せんの ひだりから ならべよう。',
        'ひとつずつ おおきくなるように ならべよう。',
        'いちばん ちいさい かずから ならべよう。'
      ];
      question.prompt = orderPrompts[variation % orderPrompts.length];
      question.visual.layoutVariant = variation % orderPrompts.length;
    }
    // ステージの意味づけは画面のステージ名(例「たしざんの じゅんび」)が担う。
    // 同じ文を全8問の問題文へ前置すると、読む量だけが増えて問題文が埋もれる。
    if (lineId === 'addition' && stageIndex === 0) {
      question.templateId = 'addition.prepare.combine';
      question.math = question.math || { kind: 'add', a: question.visual.counts[0], b: question.visual.counts[1], result: question.correct };
    }
    if ((lineId === 'number' && stageIndex === 5) || (lineId === 'addition' && stageIndex === 1) || (lineId === 'subtraction' && stageIndex === 0)) {
      if (question.visual && question.visual.type === 'bond') question.visual.type = 'bond-builder';
    }
    if (lineId === 'addition' && stageIndex === 9 && question.visual && question.visual.type === 'make-ten') {
      question.visual.type = 'make-ten-builder';
    }
    if (lineId === 'shape' && stageIndex === 7) {
      const stickPrompts = [
        question.visual.target + 'を つくるには、ぼうが なんぼん いる？',
        'みほんの ' + question.visual.target + '。ひつような ぼうを えらぼう。',
        question.visual.target + 'の へんを みよう。ぼうは なんぼん？',
        'ぼうで ' + question.visual.target + 'を つくろう。なんぼん ひつよう？'
      ];
      question.prompt = stickPrompts[variation % stickPrompts.length];
      question.visual.materialVariant = variation % stickPrompts.length;
      question.templateId = 'shape.sticks.build';
    }
    if (lineId === 'solve' && (stageIndex === 6 || stageIndex === 8)) {
      const expression = question.math && question.math.a != null
        ? question.math.a + (question.math.kind === 'subtract' ? '−' : '＋') + question.math.b
        : question.correct;
      question.correct = expression;
      question.options = expressionOptions(question, rng);
      question.kind = 'choice';
      question.templateId = stageIndex === 6 ? 'solve.model.expression' : 'solve.match.expression';
    }
    return question;
  }

  const CLASSIFY_CASES = Object.freeze([
    { item: 'ボール', icon: '●', correct: 'まるい かたち' },
    { item: 'ビーだま', icon: '●', correct: 'まるい かたち' },
    { item: 'おさら', icon: '●', correct: 'まるい かたち' },
    { item: 'タイヤ', icon: '●', correct: 'まるい かたち' },
    { item: 'さいころ', icon: '▦', correct: 'しかくい かたち' },
    { item: 'はこ', icon: '▣', correct: 'しかくい かたち' },
    { item: 'けしゴム', icon: '▣', correct: 'しかくい かたち' },
    { item: 'えほん', icon: '▣', correct: 'しかくい かたち' },
    { item: 'えんぴつ', icon: '┃', correct: 'ながい かたち' },
    { item: 'ストロー', icon: '┃', correct: 'ながい かたち' },
    { item: 'ぼう', icon: '┃', correct: 'ながい かたち' },
    { item: 'リボン', icon: '┃', correct: 'ながい かたち' }
  ]);

  function mathClassifyQuestion(round, variation, rng) {
    const item = core.pick(CLASSIFY_CASES, rng);
    const promptVariants = [
      item.item + 'の かたちは、どの なかま？',
      item.item + 'を かたちで わけると、どこに はいる？',
      '「' + item.item + '」と おなじ とくちょうの なかまは？',
      item.item + 'の みためを よく みよう。どの なかま？'
    ];
    return {
      canonicalSkillId: core.SOLVE_STAGES[0].canonicalSkillId,
      kind: 'sort',
      prompt: promptVariants[variation % promptVariants.length],
      correct: item.correct,
      options: ['まるい かたち', 'しかくい かたち', 'ながい かたち'],
      visual: { type: 'sort', item: item.icon, itemLabel: item.item, bins: ['まるい かたち', 'しかくい かたち', 'ながい かたち'] },
      hint: 'まるい？ かどが ある？ ながく のびている？を みよう。',
      explain: item.item + 'は「' + item.correct + '」の なかまだね。',
      templateId: 'solve.classify.shape.' + (variation % promptVariants.length)
    };
  }

  function equalGroupsQuestion(round, rng) {
    const groups = core.rand(2, 5, rng);
    const perGroup = core.rand(2, Math.min(5, Math.floor(20 / groups)), rng);
    const total = groups * perGroup;
    const share = round % 2 === 0;
    return {
      canonicalSkillId: core.SOLVE_STAGES[9].canonicalSkillId,
      kind: 'grouping',
      prompt: share
        ? total + 'この まるを ' + groups + 'にんで おなじ かずずつ わけよう。ひとりぶんは？'
        : total + 'この まるを ' + perGroup + 'こずつ まとめよう。グループは いくつ？',
      correct: share ? perGroup : groups,
      input: 1,
      min: 1,
      max: share ? Math.floor(total / groups) + 2 : Math.floor(total / perGroup) + 2,
      visual: { type: 'equal-groups-builder', total, groups, perGroup, mode: share ? 'share' : 'group' },
      hint: share ? 'どの 人にも、まるを 1こずつ じゅんばんに くばろう。' : perGroup + 'こを ひとまとまりにして、なんこ できるか かぞえよう。',
      explain: share ? 'ひとり ' + perGroup + 'こずつ。' + groups + 'にんぶんで ' + total + 'こだよ。' : perGroup + 'こずつで ' + groups + 'グループ。ぜんぶで ' + total + 'こだよ。',
      math: { kind: 'groups', total, groups, perGroup, result: share ? perGroup : groups },
      templateId: share ? 'solve.groups.share' : 'solve.groups.make'
    };
  }

  function placeValueRemoveQuestion(round, rng) {
    const tensMode = round % 2 === 0;
    if (tensMode) {
      const tens = core.rand(4, 10, rng);
      const remove = core.rand(1, Math.max(1, tens - 1), rng);
      const a = tens * 10;
      const b = remove * 10;
      return {
        canonicalSkillId: core.SUBTRACTION_STAGES[9].canonicalSkillId,
        kind: 'remove',
        prompt: a + 'から、10の まとまりを ' + remove + 'こ とろう。',
        correct: remove,
        input: 0,
        visual: { type: 'place-value-remove-builder', number: a, total: tens, unit: 'ten' },
        hint: '10の まとまりだけを、ひだりから ひとつずつ とろう。',
        explain: a + '−' + b + '＝' + (a - b) + '。',
        math: { kind: 'subtract', a, b, result: a - b, mode: 'tens' },
        answerDerived: false,
        templateId: 'subtraction.place.remove-tens'
      };
    }
    const tens = core.rand(2, 9, rng);
    const ones = core.rand(3, 9, rng);
    const remove = core.rand(1, ones - 1, rng);
    const a = tens * 10 + ones;
    return {
      canonicalSkillId: core.SUBTRACTION_STAGES[9].canonicalSkillId,
      kind: 'remove',
      prompt: a + 'から、ばらを ' + remove + 'こ とろう。',
      correct: remove,
      input: 0,
      visual: { type: 'place-value-remove-builder', number: a, total: ones, unit: 'one' },
      hint: '10の まとまりは そのまま。ばらだけを とろう。',
      explain: a + '−' + remove + '＝' + (a - remove) + '。',
      math: { kind: 'subtract', a, b: remove, result: a - remove, mode: 'ones' },
      answerDerived: false,
      templateId: 'subtraction.place.remove-ones'
    };
  }

  // 子どもが実際に目にする面(問題文・操作・盤面・答え)。
  // ここが一致する問題は、内部の分類が違っても「さっきと同じ問題」に見える。
  function visibleKey(question) {
    return JSON.stringify({
      kind: question.kind,
      prompt: question.prompt,
      instruction: question.instruction,
      correct: question.correct,
      visual: question.visual
    });
  }

  function mappedRound(stageContract, arcRound) {
    if (stageContract.roundPattern) return stageContract.roundPattern[arcRound % stageContract.roundPattern.length];
    if (stageContract.sourceRound != null) return stageContract.sourceRound;
    return arcRound;
  }

  function rawInstructionalQuestion(lineId, stageIndex, arcRound, variation, rng) {
    const stageContract = STAGE_CONTRACTS[lineId][stageIndex];
    if (stageContract.custom === 'mathClassify') return mathClassifyQuestion(arcRound, variation, rng);
    if (stageContract.custom === 'equalGroups') return equalGroupsQuestion(arcRound, rng);
    if (stageContract.custom === 'placeValueRemove') return placeValueRemoveQuestion(arcRound, rng);
    const sourceStage = stageContract.sourceStage == null ? stageIndex : stageContract.sourceStage;
    const sourceRound = mappedRound(stageContract, arcRound);
    return legacyBuildQuestion(lineId, sourceStage, sourceRound, { rng });
  }

  function rawQuestion(lineId, stageIndex, arcRound, variation, rng) {
    const stageContract = STAGE_CONTRACTS[lineId][stageIndex];
    if (!stageContract.assessment) return rawInstructionalQuestion(lineId, stageIndex, arcRound, variation, rng);
    const plan = stageContract.reviewPlan;
    const sourceStage = plan[arcRound % plan.length];
    return rawInstructionalQuestion(lineId, sourceStage, arcRound, variation, rng);
  }

  function difficultyScore(question) {
    const math = question.math || {};
    if (math.kind === 'add') {
      const addScale = Number(math.result) <= 10 ? 10 : 20;
      return clamp(Number(math.result) / addScale + (math.bridge ? 0.08 : 0), 0, 1);
    }
    if (math.kind === 'subtract') {
      const a = Number(math.a);
      const subtractScale = a > 20 ? 100 : 20;
      return clamp(a / subtractScale + (math.mode === 'borrow' ? 0.12 : 0), 0, 1);
    }
    if (math.kind === 'bond') return clamp(Number(math.target) / 10, 0, 1);
    if (math.kind === 'sequence') return clamp(Number(math.result) / (Number(question.max) || 20), 0, 1);
    if (math.kind === 'groups') return clamp(Number(math.total) / 20, 0, 1);
    if (isNumeric(question.correct) && Number.isFinite(Number(question.min)) && Number.isFinite(Number(question.max)) && Number(question.max) > Number(question.min)) {
      return clamp((Number(question.correct) - Number(question.min)) / (Number(question.max) - Number(question.min)), 0, 1);
    }
    const visual = question.visual || {};
    if (Number.isFinite(Number(visual.left)) && Number.isFinite(Number(visual.right))) return clamp(Math.max(Number(visual.left), Number(visual.right)) / 12, 0, 1);
    return null;
  }

  function normalizeQuestion(raw, lineId, stageIndex, arcRound, variation, rng) {
    const line = core.LINES[lineId];
    const stage = line.stages[stageIndex];
    const stageContract = STAGE_CONTRACTS[lineId][stageIndex];
    const question = Object.assign({
      kind: 'choice', prompt: '', instruction: '', correct: 0, options: [], hint: '', explain: '',
      visual: { type: 'machine' }, story: false, checkpoint: false, speedSafe: true,
      templateId: '', interactionFamily: '', optionPolicy: 'shuffle', optionLayout: 'neutral',
      input: '', selected: [], orderSelected: [], attempts: 0, feedback: null, showHint: false
    }, raw || {});
    const sourceStageIndex = Number.isFinite(Number(question.stageIndex)) ? Number(question.stageIndex) : stageIndex;
    question.sourceCanonicalSkillId = question.canonicalSkillId || stage.canonicalSkillId;
    question.canonicalSkillId = stage.canonicalSkillId;
    question.lineId = lineId;
    question.stageId = stage.id;
    question.stageIndex = stageIndex;
    question.stageAction = stage.action;
    question.arcRole = ARC[arcRound] || 'develop';
    question.arcIndex = arcRound;
    question.story = question.arcRole === 'story';
    question.checkpoint = stageContract.assessment || question.arcRole === 'check' || question.arcRole === 'capstone';
    question.assessmentFor = stageContract.assessment ? stage.canonicalSkillId : question.assessmentFor;
    if (!stageContract.assessment && (!stageContract.paired || !stageContract.allowedKinds.includes(question.kind))) {
      coerceKind(question, stageContract.primaryKind, rng);
    }
    fixKnownQuestionProblems(question, lineId, stageContract.assessment ? sourceStageIndex : stageIndex, variation, rng);
    if (question.kind === 'choice' || question.kind === 'route' || question.kind === 'sort') normalizeChoiceOptions(question, rng);
    question.instruction = instructionFor(question);
    question.hint = resolveHint(question);
    question.explain = enrichExplain(question);
    question.hints = uniqueOptions([question.hint, secondHint(question)]);
    if (question.hints.length < 2) question.hints.push('わかっている ところから、ひとつずつ たしかめよう。');
    const learningTemplate = question.templateId || lineId + '.' + stage.id;
    if (question.story) question.sceneApplied = applyScene(question, rng);
    question.templateId = learningTemplate + '.arc-' + question.arcRole;
    question.interactionFamily = lineId + '.' + stage.id + ':' + question.kind;
    question.difficulty = difficultyScore(question);
    question.difficultyBand = question.arcRole;
    question.answerDerived = question.answerDerived !== false;
    question.selected = [];
    question.orderSelected = [];
    question.attempts = 0;
    question.feedback = null;
    question.showHint = false;
    // 学習内容としての同一性は「何を問い、答えが何か」で決める。
    // 並べ方(layoutVariant)や言い回しの違いだけの問題を別物として通さない。
    question.learningSignature = core.questionContentSignature(Object.assign({}, question, {
      canonicalSkillId: question.sourceCanonicalSkillId,
      prompt: '',
      instruction: '',
      story: false,
      checkpoint: false,
      templateId: '',
      visual: learningVisual(question.visual)
    }));
    question.signature = core.questionSignature(question);
    question.contentSignature = core.questionContentSignature(question);
    return question;
  }

  function candidateDistance(question, arcRound) {
    if (question.difficulty == null) return 0;
    return Math.abs(question.difficulty - ARC_TARGET[arcRound]);
  }

  function invalidQuestion(question) {
    const math = question.math || {};
    if (math.kind === 'subtract' && question.sourceCanonicalSkillId !== 'g1.sub.zero_same') {
      if (Number(math.b) === 0 || Number(math.result) === 0) return true;
    }
    if (math.kind === 'bond' && question.sourceCanonicalSkillId !== 'g1.number.zero_bonds') {
      if (Number(math.known) === 0 || Number(question.correct) === 0) return true;
    }
    if (question.kind === 'choice' || question.kind === 'route' || question.kind === 'sort') {
      const values = uniqueOptions(question.options || []).map(optionValue).map(String);
      if (!values.includes(String(question.correct))) return true;
      if (isNumeric(question.correct) && values.length < 4) return true;
    }
    return false;
  }

  function makeStageQuestions(lineId, stageIndex, options) {
    const config = options || {};
    const line = core.LINES[lineId];
    if (!line) throw new Error('Unknown Grade 1 line: ' + lineId);
    const safeIndex = clamp(Number(stageIndex) || 0, 0, line.stages.length - 1);
    const seed = config.seed == null ? Date.now() : config.seed;
    const rng = core.seededRng(seed);
    const count = Number(config.count || core.STAGE_ROUNDS);
    const excluded = new Set(config.exclude || []);
    const usedSignatures = new Set();
    const usedContent = new Set();
    const usedLearning = new Set();
    const questions = [];
    // 教材が有限なステージ(1〜5を数える等)では、8問すべてを別内容にはできない。
    // そこで「使い切るまで再利用しない・直前と同じ内容にしない」を優先し、
    // 同じことをもう一度問うときも、間隔と見た目を必ず変える。
    const learningUseCount = new Map();
    const answerUseCount = new Map();
    const usedVisible = new Set();
    let previousLearning = null;
    let previousAnswer = null;
    for (let round = 0; round < count; round += 1) {
      const arcRound = round % ARC.length;
      let best = null;
      let bestScore = Infinity;
      for (let variation = 0; variation < 24; variation += 1) {
        const raw = rawQuestion(lineId, safeIndex, arcRound, variation, rng);
        const candidate = normalizeQuestion(raw, lineId, safeIndex, arcRound, variation, rng);
        if (invalidQuestion(candidate)) continue;
        // 完全に同一の問題と、直近プレイで出したばかりの問題は必ず避ける
        if (usedSignatures.has(candidate.signature) || usedContent.has(candidate.contentSignature)) continue;
        if (excluded.has(candidate.signature) || excluded.has(candidate.contentSignature)) continue;
        // 見た目まで同じ問題は、一度のステージで二度出さない
        if (usedVisible.has(visibleKey(candidate))) continue;
        // 直前の問題と学習内容が同じものは、どれだけ難易度が合っていても選ばない
        if (candidate.learningSignature === previousLearning) continue;
        // 答えが同じ問題が続くと、考えずに前と同じものを選べてしまう。
        // ただし答えが3種類しかないステージもあるので、禁止するのは「直前と同じ」まで。
        if (previousAnswer != null && String(candidate.correct) === previousAnswer) continue;
        const reuse = learningUseCount.get(candidate.learningSignature) || 0;
        const answerReuse = answerUseCount.get(String(candidate.correct)) || 0;
        const recentlyPlayed = excluded.has(candidate.learningSignature) ? 1 : 0;
        const score = reuse * 10 + answerReuse * 3 + recentlyPlayed * 4 + candidateDistance(candidate, arcRound);
        if (!best || score < bestScore) {
          best = candidate;
          bestScore = score;
        }
        if (score <= 0.08) break;
      }
      if (!best) {
        // 候補が尽きたときは重複回避だけを譲る。
        // 「−0」「全部引く」などの成立しない問題は、ここでも通さない。
        for (let attempt = 0; attempt < 12 && !best; attempt += 1) {
          const variation = 99 + round * 12 + attempt;
          const fallback = normalizeQuestion(rawQuestion(lineId, safeIndex, arcRound, variation, rng), lineId, safeIndex, arcRound, variation, rng);
          if (!invalidQuestion(fallback)) best = fallback;
        }
      }
      if (!best) {
        best = normalizeQuestion(rawQuestion(lineId, safeIndex, arcRound, 99 + round, rng), lineId, safeIndex, arcRound, 99 + round, rng);
      }
      usedSignatures.add(best.signature);
      usedContent.add(best.contentSignature);
      usedLearning.add(best.learningSignature);
      usedVisible.add(visibleKey(best));
      learningUseCount.set(best.learningSignature, (learningUseCount.get(best.learningSignature) || 0) + 1);
      answerUseCount.set(String(best.correct), (answerUseCount.get(String(best.correct)) || 0) + 1);
      previousLearning = best.learningSignature;
      previousAnswer = String(best.correct);
      questions.push(best);
    }
    return { seed, questions };
  }

  const RUSH_STAGE_POOLS = Object.freeze({
    number: [0, 1, 2, 3, 5, 6, 7, 8, 9, 5, 8, 9],
    addition: [0, 1, 2, 3, 5, 6, 7, 8, 9, 6, 8, 9],
    subtraction: [0, 1, 2, 3, 5, 6, 7, 8, 9, 5, 7, 9],
    measure: [0, 1, 2, 3, 5, 6, 7, 8, 9, 6, 8, 9],
    shape: [0, 1, 2, 3, 5, 6, 7, 8, 9, 5, 7, 9],
    solve: [0, 1, 2, 3, 5, 6, 7, 8, 9, 3, 6, 9]
  });

  function makeTimeAttackQuestions(lineId, options) {
    const config = options || {};
    const seed = config.seed == null ? Date.now() : config.seed;
    const rng = core.seededRng(seed);
    const excluded = new Set(config.exclude || []);
    const pool = core.spreadAdjacent(RUSH_STAGE_POOLS[lineId] || RUSH_STAGE_POOLS.number, rng);
    const used = new Set();
    const questions = [];
    pool.forEach(function (stageIndex, round) {
      let question = null;
      for (let variation = 0; variation < 24; variation += 1) {
        const raw = rawInstructionalQuestion(lineId, stageIndex, 5 + round % 3, variation, rng);
        const candidate = normalizeQuestion(raw, lineId, stageIndex, 5 + round % 3, variation, rng);
        if (invalidQuestion(candidate)) continue;
        if (excluded.has(candidate.signature) || excluded.has(candidate.contentSignature) || excluded.has(candidate.learningSignature) || used.has(candidate.signature) || used.has(candidate.contentSignature) || used.has(candidate.learningSignature)) continue;
        question = candidate;
        break;
      }
      if (!question) question = normalizeQuestion(rawInstructionalQuestion(lineId, stageIndex, 7, 100 + round, rng), lineId, stageIndex, 7, 100 + round, rng);
      question.rush = true;
      question.story = false;
      question.checkpoint = false;
      question.showHint = false;
      question.signature = core.questionSignature(question);
      question.contentSignature = core.questionContentSignature(question);
      used.add(question.signature);
      used.add(question.contentSignature);
      used.add(question.learningSignature);
      questions.push(question);
    });
    return { seed, questions: questions.slice(0, core.TIME_ATTACK_ROUNDS) };
  }

  function validate() {
    const errors = [];
    Object.keys(STAGE_CONTRACTS).forEach(function (lineId) {
      const line = core.LINES[lineId];
      if (!line || STAGE_CONTRACTS[lineId].length !== line.stages.length) errors.push(lineId + ': stage contract count mismatch');
      (line && line.stages || []).forEach(function (stage, stageIndex) {
        const stageContract = STAGE_CONTRACTS[lineId][stageIndex];
        if (!stageContract || !stage.questionContract) errors.push(lineId + '/' + stage.id + ': missing question contract');
      });
    });
    return { ok: errors.length === 0, errors };
  }

  core.G1_ARC = ARC;
  core.G1_STAGE_CONTRACTS = STAGE_CONTRACTS;
  core.makeStageQuestions = makeStageQuestions;
  core.makeTimeAttackQuestions = makeTimeAttackQuestions;
  core.grade1RuntimeValidate = validate;
  global.HiramekiGrade1Runtime = Object.freeze({ ARC, STAGE_CONTRACTS, makeStageQuestions, makeTimeAttackQuestions, validate });
}(typeof globalThis !== 'undefined' ? globalThis : window));
