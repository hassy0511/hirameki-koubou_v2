// 小学2年生のカリキュラム。docs/curriculum_math_g2_overview.md を正本に、
// v2の出題契約(8問アーク・1ステージ1操作・盤面は答えを見せない)へ載せ替えたもの。
// フラグの意味は g1.js と同じ。bigNumbers: 小2の数の範囲(10000まで)を許す

export const G2 = {
  id: 'g2',
  name: '2ねんせい',
  lineOrder: ['number', 'calc', 'mul', 'measure', 'shape', 'solve'],
  lines: {
    number: {
      id: 'number',
      name: 'おおきな かず',
      device: 'かずの けいじばん',
      stages: [
        { id: 'g2_num_group', name: 'まとまりで かぞえる', action: '2・5・10の まとまりで かぞえる', goal: 'g2.number.group_count', kinds: ['keypad'] },
        { id: 'g2_num_to1000', name: '1000までの かず', action: 'ひゃくと じゅうと いちで よむ', goal: 'g2.number.to1000', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_num_place3', name: 'くらいの へや', action: '3けたを くみたてる・わける', goal: 'g2.number.place_value_3digit', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_num_units', name: '10と 100の たば', action: '10や 100を たんいに みる', goal: 'g2.number.relative_units', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_num_check', name: 'ここまでの おさらい', action: '1000までの かずを たしかめる', goal: 'g2.number.to1000.review', kinds: ['keypad'], assessment: true, bigNumbers: true, sources: ['g2_num_group', 'g2_num_to1000', 'g2_num_place3', 'g2_num_units'] },
        { id: 'g2_num_compare', name: 'どちらが おおきい？', action: 'くらいに ちゅうもくして くらべる', goal: 'g2.number.compare_order', kinds: ['choice'], smallAnswerSpace: true, balanceAnswers: true, bigNumbers: true },
        { id: 'g2_num_line', name: 'かずの レール', action: 'かずの せんの めもりを よむ', goal: 'g2.number.number_line_sequence', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_num_to10000', name: '10000までの かず', action: '4けたを よむ・かく', goal: 'g2.number.to10000', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_num_place4', name: '4けたの こうせい', action: '4けたを くみたてる・わける', goal: 'g2.number.place_value_4digit', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_num_frac', name: 'おなじ おおきさに わける', action: 'はんぶん・3ぶんの1・4ぶんの1', goal: 'g2.number.unit_fractions', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_num_core', name: 'おおきな かずの まとめ', action: 'おおきな かずを ぜんぶ つかう', goal: 'g2.number.review', kinds: ['keypad', 'choice'], assessment: true, bigNumbers: true, smallAnswerSpace: true, sources: ['g2_num_units', 'g2_num_compare', 'g2_num_line', 'g2_num_place4', 'g2_num_frac'] }
      ]
    },
    calc: {
      id: 'calc',
      name: 'たしひき ひっさん',
      device: 'ひっさんの そうち',
      stages: [
        { id: 'g2_calc_add_nr', name: 'くらいを そろえて たす', action: 'くりあがりの ない ひっさん', goal: 'g2.calculation.add_2digit_no_regroup', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_calc_add_r', name: 'くりあがりの ひっさん', action: '10こで 1たばに かえて たす', goal: 'g2.calculation.add_2digit_regroup', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_calc_sub_nr', name: 'くらいを そろえて ひく', action: 'くりさがりの ない ひっさん', goal: 'g2.calculation.sub_2digit_no_regroup', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_calc_sub_r', name: 'くりさがりの ひっさん', action: '1たばを 10こに かえて ひく', goal: 'g2.calculation.sub_2digit_regroup', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_calc_check', name: 'ひっさんの おさらい', action: 'ここまでの ひっさんを たしかめる', goal: 'g2.calculation.written_2digit.review', kinds: ['keypad', 'equation-build'], assessment: true, sources: ['g2_calc_add_nr', 'g2_calc_add_r', 'g2_calc_sub_nr', 'g2_calc_sub_r'] },
        { id: 'g2_calc_sum3', name: 'こたえが 3けたの たしざん', action: 'ひゃくの くらいに すすむ', goal: 'g2.calculation.add_sum_3digit', kinds: ['keypad', 'equation-build'], bigNumbers: true },
        { id: 'g2_calc_from3', name: '3けたからの ひきざん', action: 'ひゃくの たばを りょうがえして ひく', goal: 'g2.calculation.sub_from_3digit', kinds: ['keypad', 'equation-build'], bigNumbers: true },
        { id: 'g2_calc_simple3', name: 'かんたんな 3けたの けいさん', action: 'うごく くらいだけ けいさんする', goal: 'g2.calculation.simple_3digit', kinds: ['keypad', 'equation-build'], bigNumbers: true },
        { id: 'g2_calc_prop', name: 'けいさんの くふう', action: 'じゅんばんや まとまりを かえる', goal: 'g2.calculation.properties_strategies', kinds: ['keypad'] },
        { id: 'g2_calc_inverse', name: 'ぎゃくさんと たしかめ', action: 'たしざんと ひきざんは ぎゃく', goal: 'g2.calculation.inverse_estimate_check', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_calc_core', name: 'ひっさんの まとめ', action: 'ひっさんを ぜんぶ つかう', goal: 'g2.calculation.review', kinds: ['keypad', 'equation-build'], assessment: true, bigNumbers: true, sources: ['g2_calc_sum3', 'g2_calc_from3', 'g2_calc_simple3', 'g2_calc_prop', 'g2_calc_inverse'] }
      ]
    },
    mul: {
      id: 'mul',
      name: 'かけざん',
      device: 'ぞうふくの そうち',
      stages: [
        { id: 'g2_mul_groups', name: 'おなじ かずずつ', action: 'ひとつぶんと いくつぶん', goal: 'g2.multiplication.equal_groups', kinds: ['keypad'] },
        { id: 'g2_mul_expr', name: 'かけざんの しき', action: 'ばめんを かけざんの しきに する', goal: 'g2.multiplication.scene_expression', kinds: ['equation-build'] },
        { id: 'g2_mul_array', name: 'アレイと たしざん', action: 'ならべた ずと るいかで かんがえる', goal: 'g2.multiplication.array_repeated_add', kinds: ['keypad'] },
        { id: 'g2_mul_t25', name: '2のだんと 5のだん', action: '2ずつ・5ずつ ふえる', goal: 'g2.multiplication.tables_2_5', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_mul_check', name: 'かけざんの おさらい', action: 'いみと 2・5のだんを たしかめる', goal: 'g2.multiplication.meaning.review', kinds: ['keypad', 'equation-build'], assessment: true, sources: ['g2_mul_groups', 'g2_mul_expr', 'g2_mul_array', 'g2_mul_t25'] },
        { id: 'g2_mul_t34', name: '3のだんと 4のだん', action: 'アレイを 1れつずつ ふやす', goal: 'g2.multiplication.tables_3_4', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_mul_t67', name: '6のだんと 7のだん', action: 'ならった だんから つくる', goal: 'g2.multiplication.tables_6_7', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_mul_t891', name: '8・9・1のだん', action: 'くくを かんせいさせる', goal: 'g2.multiplication.tables_8_9_1', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_mul_prop', name: 'くくの ひみつ', action: 'ふえかたと いれかえを しらべる', goal: 'g2.multiplication.properties', kinds: ['keypad'] },
        { id: 'g2_mul_times', name: 'ばいと くくの さき', action: 'なんばいと 10をこえる かけざん', goal: 'g2.multiplication.times_simple_2digit', kinds: ['keypad', 'equation-build'] },
        { id: 'g2_mul_core', name: 'かけざんの まとめ', action: 'かけざんを ぜんぶ つかう', goal: 'g2.multiplication.review', kinds: ['keypad', 'equation-build'], assessment: true, sources: ['g2_mul_t34', 'g2_mul_t67', 'g2_mul_t891', 'g2_mul_prop', 'g2_mul_times'] }
      ]
    },
    measure: {
      id: 'measure',
      name: 'はかる',
      device: 'はかる だい',
      stages: [
        { id: 'g2_mea_unit', name: 'そろえて はかる', action: 'おなじ たんいの ひつようせい', goal: 'g2.measure.common_unit_estimate', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_mea_cm', name: 'cmの ものさし', action: '0に そろえて めもりを よむ', goal: 'g2.measure.centimeter_ruler', kinds: ['keypad'] },
        { id: 'g2_mea_mm', name: 'mmの めもり', action: '1cm＝10mmで よむ', goal: 'g2.measure.millimeter_relation', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_mea_len_calc', name: 'ながさの けいさん', action: 'cmどうしを たす・ひく', goal: 'g2.measure.line_draw_calculate', kinds: ['keypad'] },
        { id: 'g2_mea_check', name: 'ながさの おさらい', action: 'cm・mmを たしかめる', goal: 'g2.measure.length.review', kinds: ['choice', 'keypad'], assessment: true, smallAnswerSpace: true, bigNumbers: true, sources: ['g2_mea_unit', 'g2_mea_cm', 'g2_mea_mm', 'g2_mea_len_calc'] },
        { id: 'g2_mea_ldl', name: 'Lと dL', action: '1L＝10dLで はかる', goal: 'g2.measure.capacity_l_dl', kinds: ['keypad'] },
        { id: 'g2_mea_ml', name: 'mLと かさの けいさん', action: '1L＝1000mLで かんがえる', goal: 'g2.measure.capacity_ml_relations', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_mea_time', name: 'じこくと じかん', action: 'とけいの あいだの じかんを よむ', goal: 'g2.measure.time_duration', kinds: ['keypad'] },
        { id: 'g2_mea_ampm', name: 'ごぜんと ごご', action: '1にちは 24じかん', goal: 'g2.measure.day_am_pm', kinds: ['choice'], smallAnswerSpace: true, balanceAnswers: true, maxRepeat: 3 },
        { id: 'g2_mea_m', name: 'mと ながい ながさ', action: '1m＝100cmで はかる', goal: 'g2.measure.meter_relation', kinds: ['keypad'], bigNumbers: true },
        { id: 'g2_mea_core', name: 'はかるの まとめ', action: 'ながさ・かさ・じかんを つかう', goal: 'g2.measure.review', kinds: ['choice', 'keypad'], assessment: true, smallAnswerSpace: true, bigNumbers: true, sources: ['g2_mea_ldl', 'g2_mea_ml', 'g2_mea_time', 'g2_mea_ampm', 'g2_mea_m'] }
      ]
    },
    shape: {
      id: 'shape',
      name: 'かたち',
      device: 'かたちの つくえ',
      stages: [
        { id: 'g2_shp_lines', name: 'ちょくせんで かこむ', action: 'ちょくせんだけの かたちを みつける', goal: 'g2.shape.lines_enclosure', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_shp_tri_quad', name: 'さんかくけいと しかくけい', action: 'へんの かずで みわける', goal: 'g2.shape.triangle_quadrilateral', kinds: ['choice'], smallAnswerSpace: true, balanceAnswers: true, maxRepeat: 3 },
        { id: 'g2_shp_edge_vertex', name: 'へんと ちょうてん', action: 'かずを かぞえて たしかめる', goal: 'g2.shape.edges_vertices', kinds: ['keypad'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_shp_right', name: 'ちょっかくを さがす', action: 'かどに ゲージを あてる', goal: 'g2.shape.right_angle', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_shp_check', name: 'かたちの おさらい', action: 'へん・ちょうてん・ちょっかく', goal: 'g2.shape.basic.review', kinds: ['choice', 'keypad'], assessment: true, smallAnswerSpace: true, maxRepeat: 3, sources: ['g2_shp_lines', 'g2_shp_tri_quad', 'g2_shp_edge_vertex', 'g2_shp_right'] },
        { id: 'g2_shp_rect', name: 'ちょうほうけい', action: 'かどが みんな ちょっかくの しかく', goal: 'g2.shape.rectangle', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_shp_square', name: 'せいほうけい', action: 'へんも みんな おなじ しかく', goal: 'g2.shape.square', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_shp_rtri', name: 'ちょっかくさんかくけい', action: 'ちょっかくの ある さんかく', goal: 'g2.shape.right_triangle', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_shp_tile', name: 'ほうがんで しきつめ', action: 'もようの つづきを つくる', goal: 'g2.shape.draw_compose_tile', kinds: ['grid'], represent: true, maxRepeat: 3 },
        { id: 'g2_shp_box', name: 'はこの かたち', action: 'めん・へん・ちょうてんを かぞえる', goal: 'g2.shape.box_faces_edges_vertices', kinds: ['keypad'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_shp_core', name: 'かたちの まとめ', action: 'かたちの ちしきを ぜんぶ つかう', goal: 'g2.shape.review', kinds: ['choice', 'keypad', 'grid'], assessment: true, smallAnswerSpace: true, represent: true, maxRepeat: 3, sources: ['g2_shp_rect', 'g2_shp_square', 'g2_shp_rtri', 'g2_shp_tile', 'g2_shp_box'] }
      ]
    },
    solve: {
      id: 'solve',
      name: 'しらべる・とく',
      device: 'しらべる つくえ',
      stages: [
        { id: 'g2_sol_view', name: 'かんてんを えらぶ', action: 'しらべたい ことに あう わけかた', goal: 'g2.data.classification_view', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_sol_tally', name: 'かぞえもらしを ふせぐ', action: 'せいの じで きろくして かぞえる', goal: 'g2.data.tally', kinds: ['keypad'] },
        { id: 'g2_sol_table', name: 'ひょうに まとめる', action: 'ひょうから かずを よむ', goal: 'g2.data.one_way_table', kinds: ['keypad'] },
        { id: 'g2_sol_graph', name: '○の グラフ', action: 'ひょうと おなじ かずだけ ぬる', goal: 'g2.data.simple_graph', kinds: ['count-tap'], represent: true },
        { id: 'g2_sol_check', name: 'ひょうと グラフの おさらい', action: 'せい・ひょう・グラフを たしかめる', goal: 'g2.data.table_graph.review', kinds: ['choice', 'keypad', 'count-tap'], assessment: true, smallAnswerSpace: true, represent: true, sources: ['g2_sol_view', 'g2_sol_tally', 'g2_sol_table', 'g2_sol_graph'] },
        { id: 'g2_sol_read', name: 'よみとりモニター', action: 'ちがいや ぜんぶを よみとる', goal: 'g2.data.read_compare', kinds: ['keypad'] },
        { id: 'g2_sol_choose', name: 'あらわしかたを えらぶ', action: 'しつもんに あう ひょう・グラフ', goal: 'g2.data.choose_repair_representation', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_sol_op', name: 'たすのかな ひくのかな', action: 'ばめんから けいさんを きめる', goal: 'g2.problem.add_sub_operation_choice', kinds: ['choice'], smallAnswerSpace: true, balanceAnswers: true },
        { id: 'g2_sol_tape', name: 'テープずで ぎゃくさん', action: 'ぜんぶと ぶぶんから もとめる', goal: 'g2.problem.inverse_tape_diagram', kinds: ['keypad'] },
        { id: 'g2_sol_info', name: 'いる じょうほうを えらぶ', action: 'とくのに いる かずを みつける', goal: 'g2.problem.mixed_story_model', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g2_sol_core', name: 'しらべる・とくの まとめ', action: 'しらべて けいさんで とく', goal: 'g2.problem_data.review', kinds: ['choice', 'keypad'], assessment: true, smallAnswerSpace: true, sources: ['g2_sol_read', 'g2_sol_choose', 'g2_sol_op', 'g2_sol_tape', 'g2_sol_info'] }
      ]
    }
  }
};
