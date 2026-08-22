// 小学1年生のカリキュラム。学習指導要領と docs/curriculum_math_g1_*.md にもとづく。
// ここは「何を学ぶか」と「どの操作で答えるか(出題契約)」のデータだけを持つ。
// 問題の作り方は src/gen/g1/ にある。

// 各ステージ:
//   id / name(画面に出す) / action(やることの説明) / goal(学習目標ID)
//   kinds: 許可する操作。1つが原則。2つは「読む⇄つくる」の相補ペアだけ
//   assessment: おさらい・まとめ。sources のステージから8問を組む
//   represent: 数を表すこと自体がねらい(えグラフ等)。produce制限を外す
//   smallAnswerSpace: 答えの種類が少ない(ことば答え等)。4択の強制を外す
//   zeroMeaningful: 0を学ぶステージ。0の選択肢・答えを許す
//   balanceAnswers: 答えの偏りを検査する(2択のことば答え)

export const G1 = {
  id: 'g1',
  name: '1ねんせい',
  lineOrder: ['number', 'addition', 'subtraction', 'measure', 'shape', 'solve'],
  lines: {
    number: {
      id: 'number',
      name: 'かず',
      device: 'かずの けいじばん',
      stages: [
        { id: 'num_intro5', name: '1から 5まで', action: 'まるを かぞえて すうじを えらぶ', goal: 'g1.number.to5.intro', kinds: ['choice'], maxRepeat: 3 },
        { id: 'num_compare', name: 'どちらが おおい？', action: 'ふたつの まとまりを くらべる', goal: 'g1.number.one_to_one', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'num_count5', name: '5までの かず', action: 'かぞえて すうじを いれる', goal: 'g1.number.to5', kinds: ['keypad'], maxRepeat: 3 },
        { id: 'num_count10', name: '10までの かず', action: 'かぞえて すうじを いれる', goal: 'g1.number.to10', kinds: ['keypad'] },
        { id: 'num_check', name: 'ここまでの おさらい', action: 'いろいろな かぞえかたを たしかめる', goal: 'g1.number.to10.review', kinds: ['choice', 'keypad'], assessment: true, sources: ['num_intro5', 'num_compare', 'num_count5', 'num_count10'], smallAnswerSpace: true },
        { id: 'num_bond', name: '0と かずわけ', action: 'あと いくつか かんがえて いれる', goal: 'g1.number.zero_bonds', kinds: ['count-tap', 'keypad'], zeroMeaningful: true },
        { id: 'num_order', name: 'かずの じゅんばん', action: 'ならびの あいた ところを うめる', goal: 'g1.number.order', kinds: ['choice'] },
        { id: 'num_position', name: 'なんばんめ？', action: 'ならんだ なかから ひとつを さす', goal: 'g1.number.ordinal', kinds: ['pick-one'] },
        { id: 'num_teens', name: '20までの かず', action: '10の まとまりと ばらで かぞえる', goal: 'g1.number.to20', kinds: ['keypad'] },
        { id: 'num_place', name: 'おおきい かず', action: '10の たばと ばらで かずを よむ', goal: 'g1.number.to100', kinds: ['choice'] },
        { id: 'num_core', name: 'かずの まとめ', action: 'かずの みかたを ぜんぶ つかう', goal: 'g1.number.review', kinds: ['count-tap', 'keypad', 'choice', 'pick-one'], assessment: true, sources: ['num_bond', 'num_order', 'num_position', 'num_teens', 'num_place'], smallAnswerSpace: true, zeroMeaningful: true }
      ]
    },
    addition: {
      id: 'addition',
      name: 'たしざん',
      device: 'あわせる そうち',
      stages: [
        { id: 'add_ready', name: 'あわせて いくつ', action: 'ふたつの まとまりを あわせて かぞえる', goal: 'g1.add.ready', kinds: ['choice'] },
        { id: 'add_bond', name: 'あと いくつ？', action: 'めあての かずまで いくつか かんがえる', goal: 'g1.add.bond', kinds: ['count-tap', 'keypad'] },
        { id: 'add_combine', name: 'あわせると いくつ？', action: 'ふたつの かずを あわせる', goal: 'g1.add.combine', kinds: ['choice'] },
        { id: 'add_equation', name: 'しきで たしざん', action: 'たしざんの しきに こたえる', goal: 'g1.add.equation', kinds: ['keypad', 'equation-build'] },
        { id: 'add_check', name: 'たしざんの おさらい', action: 'ここまでの たしざんを たしかめる', goal: 'g1.add.review1', kinds: ['choice', 'count-tap', 'keypad', 'equation-build'], assessment: true, sources: ['add_ready', 'add_bond', 'add_combine', 'add_equation'] },
        { id: 'add_ten_ready', name: '10と いくつ', action: '10の まとまりと ばらを あわせる', goal: 'g1.add.ten_ready', kinds: ['keypad', 'equation-build'] },
        { id: 'add_teens', name: '20までの たしざん', action: 'くりあがりの ない たしざん', goal: 'g1.add.teens', kinds: ['keypad', 'equation-build'] },
        { id: 'add_three', name: '3つの かずを たす', action: 'ひだりから じゅんに たす', goal: 'g1.add.three', kinds: ['keypad'] },
        { id: 'add_practice', name: 'たしざん れんしゅう', action: 'いろいろな たしざんに こたえる', goal: 'g1.add.practice', kinds: ['keypad', 'equation-build'] },
        { id: 'add_maketen', name: '10を つくって たす', action: '10の まとまりを つくって たす', goal: 'g1.add.maketen', kinds: ['keypad'] },
        { id: 'add_tens', name: 'なん10の たしざん', action: '10の たばで たす', goal: 'g1.add.tens', kinds: ['keypad', 'equation-build'] },
        { id: 'add_core', name: 'たしざんの まとめ', action: 'たしざんを ぜんぶ つかう', goal: 'g1.add.review2', kinds: ['keypad'], assessment: true, sources: ['add_tens', 'add_teens', 'add_three', 'add_practice', 'add_maketen'] }
      ]
    },
    subtraction: {
      id: 'subtraction',
      name: 'ひきざん',
      device: 'わける そうち',
      stages: [
        { id: 'sub_split', name: 'かずを わける', action: 'かくれた かずを かんがえる', goal: 'g1.sub.split', kinds: ['keypad'] },
        { id: 'sub_remain', name: 'のこりは いくつ？', action: 'とった のこりを かんがえる', goal: 'g1.sub.remain', kinds: ['remove', 'choice'] },
        { id: 'sub_zero', name: '0の ひきざん', action: 'ぜんぶ とる・とらないを かんがえる', goal: 'g1.sub.zero', kinds: ['choice'], smallAnswerSpace: true, zeroMeaningful: true, answerEcho: true, maxRepeat: 4 },
        { id: 'sub_equation', name: 'しきで ひきざん', action: 'ひきざんの しきに こたえる', goal: 'g1.sub.equation', kinds: ['keypad', 'equation-build'] },
        { id: 'sub_check', name: 'ひきざんの おさらい', action: 'ここまでの ひきざんを たしかめる', goal: 'g1.sub.review1', kinds: ['keypad', 'remove', 'choice', 'equation-build'], assessment: true, sources: ['sub_split', 'sub_remain', 'sub_zero', 'sub_equation'], smallAnswerSpace: true, zeroMeaningful: true, answerEcho: true },
        { id: 'sub_teens', name: '20までの ひきざん', action: 'ばらから ひいて のこりを だす', goal: 'g1.sub.teens', kinds: ['keypad', 'equation-build'] },
        { id: 'sub_three', name: '3つの かず', action: 'ひだりから じゅんに けいさんする', goal: 'g1.sub.three', kinds: ['keypad'] },
        { id: 'sub_borrow', name: '10を つかって ひく', action: '10の まとまりから ひく', goal: 'g1.sub.borrow', kinds: ['keypad', 'equation-build'] },
        { id: 'sub_line', name: 'かずの せんで ひく', action: 'かずの せんを もどって こたえる', goal: 'g1.sub.line', kinds: ['numberline'] },
        { id: 'sub_tens', name: '100までの ひきざん', action: '10の たばや ばらを ひく', goal: 'g1.sub.tens', kinds: ['keypad', 'equation-build'] },
        { id: 'sub_core', name: 'ひきざんの まとめ', action: 'ひきざんを ぜんぶ つかう', goal: 'g1.sub.review2', kinds: ['keypad', 'numberline', 'equation-build'], assessment: true, sources: ['sub_teens', 'sub_three', 'sub_borrow', 'sub_line', 'sub_tens'] }
      ]
    },
    measure: {
      id: 'measure',
      name: 'くらべる',
      device: 'はかる だい',
      stages: [
        { id: 'mea_direct', name: 'どちらが ながい？', action: 'ならべて ながさを くらべる', goal: 'g1.measure.direct', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'mea_indirect', name: 'うつして くらべる', action: 'テープに うつして くらべる', goal: 'g1.measure.indirect', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'mea_unit', name: 'ブロックで はかる', action: 'ブロックの いくつぶんかを よむ', goal: 'g1.measure.unit', kinds: ['pick-one'] },
        { id: 'mea_method', name: 'くらべかたを えらぶ', action: 'どう くらべるかを きめる', goal: 'g1.measure.method', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'mea_check', name: 'ながさの おさらい', action: 'くらべかたを たしかめる', goal: 'g1.measure.review1', kinds: ['choice', 'pick-one'], assessment: true, sources: ['mea_direct', 'mea_indirect', 'mea_unit', 'mea_method'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'mea_capacity', name: 'どちらが おおく はいる？', action: 'カップの いくつぶんかで くらべる', goal: 'g1.measure.capacity', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'mea_area', name: 'どちらが ひろい？', action: 'マスの いくつぶんかで くらべる', goal: 'g1.measure.area', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'mea_hour', name: 'なんじ？', action: 'とけいを よむ・あわせる', goal: 'g1.time.hour', kinds: ['choice', 'clock-set'], smallAnswerSpace: true },
        { id: 'mea_half', name: 'なんじはん？', action: 'とけいを よむ・あわせる', goal: 'g1.time.half', kinds: ['choice', 'clock-set'], smallAnswerSpace: true },
        { id: 'mea_minute', name: 'なんじ なんぷん？', action: 'とけいを よむ・あわせる', goal: 'g1.time.minute', kinds: ['choice', 'clock-set'], smallAnswerSpace: true },
        { id: 'mea_core', name: 'くらべる まとめ', action: 'はかりかたを ぜんぶ つかう', goal: 'g1.measure.review2', kinds: ['choice', 'clock-set'], assessment: true, sources: ['mea_capacity', 'mea_area', 'mea_hour', 'mea_half', 'mea_minute'], smallAnswerSpace: true, maxRepeat: 3 }
      ]
    },
    shape: {
      id: 'shape',
      name: 'かたち',
      device: 'かたちの つくえ',
      stages: [
        { id: 'shp_match', name: 'にている かたち', action: 'みのまわりの ものと かたちを むすぶ', goal: 'g1.shape.match', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'shp_roll', name: 'ころがる？ つめる？', action: 'かたちの せいしつを かんがえる', goal: 'g1.shape.roll', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'shp_sort', name: 'かたちで なかまわけ', action: 'かたちの なかまを えらぶ', goal: 'g1.shape.sort', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'shp_stamp', name: 'うつる かたち', action: 'めんを うつした かたちを かんがえる', goal: 'g1.shape.stamp', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'shp_check', name: 'かたちの おさらい', action: 'かたちの みかたを たしかめる', goal: 'g1.shape.review1', kinds: ['choice'], assessment: true, sources: ['shp_match', 'shp_roll', 'shp_sort', 'shp_stamp'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'shp_tiles', name: 'いろいたで つくる', action: 'みほんの かたちを マスに うつす', goal: 'g1.shape.tiles', kinds: ['grid'], represent: true },
        { id: 'shp_flip', name: 'まわす？ うらがえす？', action: 'かたちの うごきを かんがえる', goal: 'g1.shape.flip', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'shp_sticks', name: 'ぼうは なんぼん？', action: 'かたちの へんを かぞえる', goal: 'g1.shape.sticks', kinds: ['keypad'] },
        { id: 'shp_dots', name: 'てんを つないだ かたち', action: 'みほんの かたちを てんに うつす', goal: 'g1.shape.dots', kinds: ['grid'], represent: true },
        { id: 'shp_move', name: 'どこに うごく？', action: 'うえ したの うごきを かんがえる', goal: 'g1.shape.move', kinds: ['grid'], represent: true },
        { id: 'shp_core', name: 'かたちの まとめ', action: 'かたちの みかたを ぜんぶ つかう', goal: 'g1.shape.review2', kinds: ['grid', 'choice', 'keypad'], assessment: true, sources: ['shp_tiles', 'shp_flip', 'shp_sticks', 'shp_dots', 'shp_move'], smallAnswerSpace: true, represent: true, maxRepeat: 3 }
      ]
    },
    solve: {
      id: 'solve',
      name: 'しらべる',
      device: 'しらべる つくえ',
      stages: [
        { id: 'sol_sort', name: 'なかまわけ', action: 'カードの なかまを えらぶ', goal: 'g1.data.sort', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'sol_line', name: 'ならべて くらべる', action: 'ならべた れつを くらべる', goal: 'g1.data.line', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'sol_graph_make', name: 'えグラフを つくる', action: 'かずだけ グラフを ぬる', goal: 'g1.data.make', kinds: ['count-tap'], represent: true },
        { id: 'sol_graph_read', name: 'グラフを よむ', action: 'グラフから よみとる', goal: 'g1.data.read', kinds: ['choice'], smallAnswerSpace: true },
        { id: 'sol_check', name: 'グラフの おさらい', action: 'グラフの つかいかたを たしかめる', goal: 'g1.data.review', kinds: ['choice', 'count-tap'], assessment: true, sources: ['sol_sort', 'sol_line', 'sol_graph_make', 'sol_graph_read'], smallAnswerSpace: true, represent: true },
        { id: 'sol_op', name: 'たすのかな ひくのかな', action: 'ふえたか へったかを かんがえる', goal: 'g1.story.operation', kinds: ['choice'], smallAnswerSpace: true, balanceAnswers: true, maxRepeat: 4 },
        { id: 'sol_expr', name: 'おはなしに あう しき', action: 'おはなしを しきに つくる', goal: 'g1.story.expression', kinds: ['equation-build'] },
        { id: 'sol_answer', name: 'おはなしの こたえ', action: 'しきを つくって こたえまで もとめる', goal: 'g1.story.answer', kinds: ['equation-build'] },
        { id: 'sol_pict_expr', name: 'えに あう しき', action: 'えを しきに する', goal: 'g1.story.picture', kinds: ['choice'] },
        { id: 'sol_share', name: 'おなじ かずずつ', action: 'おなじ かずずつ わける', goal: 'g1.story.share', kinds: ['keypad'] },
        { id: 'sol_core', name: 'しらべる まとめ', action: 'おはなしと しきを ぜんぶ つかう', goal: 'g1.story.review', kinds: ['choice', 'keypad', 'equation-build'], assessment: true, sources: ['sol_op', 'sol_expr', 'sol_answer', 'sol_pict_expr', 'sol_share'], smallAnswerSpace: true }
      ]
    }
  }
};

export function stageAt(lineId, stageIndex) {
  return G1.lines[lineId].stages[stageIndex];
}
