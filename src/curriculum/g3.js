// 小学3年生のカリキュラム。docs/curriculum_math_g3_overview.md を正本に、
// v2の出題契約へ載せ替えたもの。7ライン×11ステージ=77ステージ。
// decimalsAllowed 等の個別指定は各生成器の question 側で行う。

export const G3 = {
  id: 'g3',
  name: '3ねんせい',
  lineOrder: ['number', 'mul', 'div', 'dec', 'measure', 'shape', 'solve'],
  lines: {
    number: {
      id: 'number',
      name: 'おおきな かずと ひっさん',
      device: 'せいぎょばん',
      stages: [
        { id: 'g3_num_add3', name: '3けたの たしざん', action: 'くらいを そろえて たす', goal: 'g3.calculation.add_3digit', kinds: ['keypad', 'equation-build'], bigNumbers: true },
        { id: 'g3_num_sub3', name: '3けたの ひきざん', action: 'りょうがえして ひく', goal: 'g3.calculation.sub_3digit', kinds: ['keypad', 'equation-build'], bigNumbers: true },
        { id: 'g3_num_calc4', name: '4けたと 0をまたぐ けいさん', action: 'つづけて りょうがえする', goal: 'g3.calculation.add_sub_4digit', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_num_mental', name: 'あんざんと たしかめ', action: '100を つくる・ぎゃくに たどる', goal: 'g3.calculation.mental_estimate_check', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_num_check', name: 'ひっさんの おさらい', action: 'ここまでの けいさんを たしかめる', goal: 'g3.calculation.written.review', kinds: ['keypad', 'equation-build'], assessment: true, bigNumbers: true, sources: ['g3_num_add3', 'g3_num_sub3', 'g3_num_calc4', 'g3_num_mental'] },
        { id: 'g3_num_man', name: '10000より おおきい かず', action: 'まんの たばで かぞえる', goal: 'g3.number.ten_thousands', kinds: ['keypad'], bigNumbers: true, numberCap: 100000 },
        { id: 'g3_num_oku', name: '一おくまでの かず', action: 'まんを たんいに よむ', goal: 'g3.number.to100million', kinds: ['keypad', 'choice'], bigNumbers: true, numberCap: 100000, smallAnswerSpace: true },
        { id: 'g3_num_line', name: 'おおきな かずの レール', action: 'めもりを きめて よむ', goal: 'g3.number.order_number_line', kinds: ['keypad'], bigNumbers: true, numberCap: 100000 },
        { id: 'g3_num_scale', name: '10ばい・100ばい・10ぶんの1', action: 'くらいを うごかす', goal: 'g3.number.scale_10_100_1000_tenth', kinds: ['keypad'], bigNumbers: true, numberCap: 100000 },
        { id: 'g3_num_abacus', name: 'そろばんの くらい', action: '5だまと 1だまで よむ', goal: 'g3.number.abacus_integer_decimal_add_sub', kinds: ['keypad'], bigNumbers: true, numberCap: 100000 },
        { id: 'g3_num_core', name: 'かずと けいさんの まとめ', action: 'おおきな かずを ぜんぶ つかう', goal: 'g3.number_calculation.review', kinds: ['keypad', 'choice'], assessment: true, bigNumbers: true, numberCap: 100000, smallAnswerSpace: true, sources: ['g3_num_man', 'g3_num_oku', 'g3_num_line', 'g3_num_scale', 'g3_num_abacus'] }
      ]
    },
    mul: {
      id: 'mul',
      name: 'かけざん',
      device: 'ぞうふくの そうち',
      stages: [
        { id: 'g3_mul_zero', name: '0と 10の かけざん', action: 'かける かずが 0や 10でも', goal: 'g3.multiplication.zero_ten_unknown', kinds: ['keypad'], zeroMeaningful: true },
        { id: 'g3_mul_change', name: 'こたえの かわりかた', action: 'かける かずと こたえの かんけい', goal: 'g3.multiplication.change_commutative', kinds: ['keypad'] },
        { id: 'g3_mul_dist', name: 'わけて かける', action: 'アレイを わけて あわせる', goal: 'g3.multiplication.associative_distributive', kinds: ['keypad'] },
        { id: 'g3_mul_tens', name: 'なん10・なん100の かけざん', action: '10や 100の たばで かける', goal: 'g3.multiplication.tens_hundreds_by_1digit', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mul_check', name: 'かけざんの おさらい', action: 'きまりを たしかめる', goal: 'g3.multiplication.properties.review', kinds: ['keypad'], assessment: true, bigNumbers: true, zeroMeaningful: true, sources: ['g3_mul_zero', 'g3_mul_change', 'g3_mul_dist', 'g3_mul_tens'] },
        { id: 'g3_mul_partial', name: '2けたを わけて かける', action: 'じゅうと いちに わける', goal: 'g3.multiplication.2digit_by_1digit_model', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mul_written1', name: 'かけざんの ひっさん', action: '2・3けた×1けた', goal: 'g3.multiplication.written_by_1digit', kinds: ['keypad', 'equation-build'], bigNumbers: true },
        { id: 'g3_mul_by_tens', name: 'なん10を かける', action: '10ばいと くみあわせる', goal: 'g3.multiplication.by_tens', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mul_written2', name: '2けた×2けたの ひっさん', action: 'ぶぶんせきを かさねる', goal: 'g3.multiplication.2digit_by_2digit', kinds: ['keypad', 'equation-build'], bigNumbers: true },
        { id: 'g3_mul_big', name: '3けた×2けたと けんとう', action: 'おおきな かけざんと みつもり', goal: 'g3.multiplication.3digit_by_2digit', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mul_core', name: 'かけざんの まとめ', action: 'きまりと ひっさんを つかう', goal: 'g3.multiplication.review', kinds: ['keypad', 'equation-build'], assessment: true, bigNumbers: true, sources: ['g3_mul_partial', 'g3_mul_written1', 'g3_mul_by_tens', 'g3_mul_written2', 'g3_mul_big'] }
      ]
    },
    div: {
      id: 'div',
      name: 'わりざん',
      device: 'ぶんぱいの そうち',
      stages: [
        { id: 'g3_div_share', name: 'おなじ かずずつ わける', action: 'ひとりぶんを もとめる', goal: 'g3.division.partitive', kinds: ['keypad'] },
        { id: 'g3_div_pack', name: 'いくつぶんに わける', action: 'なんくみ できるかを もとめる', goal: 'g3.division.quotative', kinds: ['keypad'] },
        { id: 'g3_div_expr', name: 'わりざんの しき', action: 'ばめんを わりざんの しきに する', goal: 'g3.division.scene_expression', kinds: ['equation-build'] },
        { id: 'g3_div_inverse', name: 'くくで もとめる', action: 'かけざんと わりざんは ぎゃく', goal: 'g3.division.inverse_facts', kinds: ['keypad'] },
        { id: 'g3_div_check', name: 'わりざんの おさらい', action: 'いみと もとめかたを たしかめる', goal: 'g3.division.meaning.review', kinds: ['keypad', 'equation-build'], assessment: true, sources: ['g3_div_share', 'g3_div_pack', 'g3_div_expr', 'g3_div_inverse'] },
        { id: 'g3_div_special', name: '0や 1の わりざん', action: '0÷a、a÷a、a÷1', goal: 'g3.division.special_cases', kinds: ['keypad'], zeroMeaningful: true, smallAnswerSpace: true, answerEcho: true, maxRepeat: 3 },
        { id: 'g3_div_rem', name: 'あまりの ある わりざん', action: 'あまりは わる かずより ちいさい', goal: 'g3.division.remainder_compute_check', kinds: ['keypad'] },
        { id: 'g3_div_rem_ctx', name: 'あまりを どう する？', action: 'ばめんに あわせて はんだんする', goal: 'g3.division.remainder_context', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_div_big', name: 'おおきな かずの わりざん', action: '80÷4や 69÷3', goal: 'g3.division.simple_2digit_by_1digit', kinds: ['keypad'] },
        { id: 'g3_div_times', name: 'なんばいかを もとめる', action: 'くらべる りょうと もとに する りょう', goal: 'g3.division.multiplicative_comparison', kinds: ['keypad'] },
        { id: 'g3_div_core', name: 'わりざんの まとめ', action: 'わりざんを ぜんぶ つかう', goal: 'g3.division.review', kinds: ['keypad', 'choice'], assessment: true, zeroMeaningful: true, smallAnswerSpace: true, answerEcho: true, sources: ['g3_div_special', 'g3_div_rem', 'g3_div_rem_ctx', 'g3_div_big', 'g3_div_times'] }
      ]
    },
    dec: {
      id: 'dec',
      name: 'しょうすうと ぶんすう',
      device: 'せいみつの そうち',
      stages: [
        { id: 'g3_dec_tenths', name: '0.1の いみ', action: '1を 10とうぶんした 1つぶん', goal: 'g3.decimal.tenths_measure', kinds: ['keypad'] },
        { id: 'g3_dec_place', name: 'しょうすうの くらい', action: '1と 0.1で つくる', goal: 'g3.decimal.place_value_compose', kinds: ['keypad'] },
        { id: 'g3_dec_line', name: 'しょうすうの レール', action: 'めもりを 10とうぶんで よむ', goal: 'g3.decimal.order_number_line', kinds: ['keypad'] },
        { id: 'g3_dec_addsub', name: '0.1の いくつぶんで けいさん', action: '0.1を たんいに たしひきする', goal: 'g3.decimal.add_sub_meaning', kinds: ['keypad'] },
        { id: 'g3_dec_check', name: 'しょうすうの おさらい', action: '0.1の つかいかたを たしかめる', goal: 'g3.decimal.basic.review', kinds: ['keypad'], assessment: true, sources: ['g3_dec_tenths', 'g3_dec_place', 'g3_dec_line', 'g3_dec_addsub'] },
        { id: 'g3_dec_written', name: 'しょうすうの ひっさん', action: 'しょうすうてんを そろえる', goal: 'g3.decimal.written_add_sub', kinds: ['keypad'] },
        { id: 'g3_frac_note', name: 'ぶんすうの かきかた', action: 'ぶんぼと ぶんしで あらわす', goal: 'g3.fraction.measure_notation', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_frac_unit', name: 'ぶんすうの おおきさ', action: 'たんいぶんすうと 0.1', goal: 'g3.fraction.unit_compare_decimal_relation', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_frac_addsub', name: 'ぶんすうの たしひき', action: 'おなじ ぶんぼどうしで けいさん', goal: 'g3.fraction.simple_add_sub', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_dec_convert', name: 'しょうすうと ぶんすうの へんかん', action: 'おなじ おおきさを いいかえる', goal: 'g3.precision.representations_apply', kinds: ['keypad'] },
        { id: 'g3_dec_core', name: 'せいみつすうの まとめ', action: 'しょうすうと ぶんすうを つかう', goal: 'g3.precision_number.review', kinds: ['keypad', 'choice'], assessment: true, smallAnswerSpace: true, sources: ['g3_dec_written', 'g3_frac_note', 'g3_frac_unit', 'g3_frac_addsub', 'g3_dec_convert'] }
      ]
    },
    measure: {
      id: 'measure',
      name: 'はかる',
      device: 'はかる だい',
      stages: [
        { id: 'g3_mea_sec', name: 'びょうの せかい', action: '1ぷん＝60びょう', goal: 'g3.measure.second', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mea_secmin', name: 'びょうと ふんの へんかん', action: '60びょうずつ たばねる', goal: 'g3.measure.second_minute_relation', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mea_duration', name: 'たった じかん', action: 'じこくの あいだを もとめる', goal: 'g3.measure.time_duration', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mea_startend', name: 'とうちゃくの じこく', action: 'じかんぶんだけ はりを すすめる', goal: 'g3.measure.time_start_end', kinds: ['clock-set', 'keypad'] },
        { id: 'g3_mea_check', name: 'じかんの おさらい', action: 'びょうと じこくを たしかめる', goal: 'g3.measure.time.review', kinds: ['keypad', 'clock-set'], assessment: true, bigNumbers: true, sources: ['g3_mea_sec', 'g3_mea_secmin', 'g3_mea_duration', 'g3_mea_startend'] },
        { id: 'g3_mea_tape', name: 'まきじゃくで はかる', action: 'ながい ものに あう どうぐ', goal: 'g3.measure.tape_distance_path', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_mea_km', name: 'kmと みちのり', action: '1km＝1000m', goal: 'g3.measure.kilometer_distance', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mea_gram', name: 'おもさと g', action: 'はかりの めもりを よむ', goal: 'g3.measure.gram_scale', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mea_kg', name: 'kgと gの かんけい', action: '1kg＝1000g', goal: 'g3.measure.kilogram_relation_tool', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mea_net', name: 'なかみの おもさと t', action: 'ぜんぶから いれものを ひく', goal: 'g3.measure.ton_net_tare_total', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_mea_core', name: 'はかるの まとめ', action: 'じかん・ながさ・おもさを つかう', goal: 'g3.measure.review', kinds: ['keypad', 'choice'], assessment: true, bigNumbers: true, smallAnswerSpace: true, sources: ['g3_mea_tape', 'g3_mea_km', 'g3_mea_gram', 'g3_mea_kg', 'g3_mea_net'] }
      ]
    },
    shape: {
      id: 'shape',
      name: 'かたち',
      device: 'せっけいの つくえ',
      stages: [
        { id: 'g3_shp_circle', name: 'えんの ひみつ', action: 'ちゅうしん・はんけい・ちょっけい', goal: 'g3.shape.circle_parts_properties', kinds: ['keypad', 'choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_shp_compass', name: 'コンパスの つかいかた', action: 'はんけいを きめて かく', goal: 'g3.shape.compass_circle_equal_length', kinds: ['keypad'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_shp_pattern', name: 'えんの もよう', action: 'おなじ はんけいの えんを かさねる', goal: 'g3.shape.circle_pattern_apply', kinds: ['keypad'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_shp_sphere', name: 'きゅうを しらべる', action: 'きりくちと はんけい', goal: 'g3.shape.sphere_parts_cross_section', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_shp_check', name: 'えんと きゅうの おさらい', action: 'ここまでを たしかめる', goal: 'g3.shape.circle_sphere.review', kinds: ['keypad', 'choice'], assessment: true, smallAnswerSpace: true, maxRepeat: 3, sources: ['g3_shp_circle', 'g3_shp_compass', 'g3_shp_pattern', 'g3_shp_sphere'] },
        { id: 'g3_shp_iso_find', name: 'にとうへんと せいさんかく', action: 'へんの ながさで みわける', goal: 'g3.shape.isosceles_equilateral_classify', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_shp_iso', name: 'にとうへんさんかくけい', action: 'おなじ ながさの へんが 2ほん', goal: 'g3.shape.isosceles_construct', kinds: ['keypad'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_shp_equi', name: 'せいさんかくけい', action: 'へんが みんな おなじ', goal: 'g3.shape.equilateral_construct', kinds: ['keypad'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_shp_angle', name: 'かどの おおきさ', action: 'かさねて くらべる', goal: 'g3.shape.angle_compare', kinds: ['choice'], smallAnswerSpace: true, balanceAnswers: true, maxRepeat: 3 },
        { id: 'g3_shp_tri_angle', name: 'さんかくけいの かど', action: 'おなじ おおきさの かどを さがす', goal: 'g3.shape.triangle_angle_properties_pattern', kinds: ['keypad'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_shp_core', name: 'かたちの まとめ', action: 'えん・きゅう・さんかくけいを つかう', goal: 'g3.shape.review', kinds: ['keypad', 'choice'], assessment: true, smallAnswerSpace: true, maxRepeat: 3, sources: ['g3_shp_iso_find', 'g3_shp_iso', 'g3_shp_equi', 'g3_shp_angle', 'g3_shp_tri_angle'] }
      ]
    },
    solve: {
      id: 'solve',
      name: 'しらべる・とく',
      device: 'しらべる つくえ',
      stages: [
        { id: 'g3_sol_tally', name: 'せいの じで しゅうけい', action: 'もれなく かぞえる', goal: 'g3.data.question_classify_tally', kinds: ['keypad'] },
        { id: 'g3_sol_table', name: 'ひょうに まとめる', action: 'ごうけいまで たしかめる', goal: 'g3.data.table_create_read', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_sol_bar_read', name: 'ぼうグラフを よむ', action: 'めもりの おおきさに ちゅうい', goal: 'g3.data.bar_graph_read', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_sol_bar_make', name: 'ぼうグラフを つくる', action: '0から ぼうを のばす', goal: 'g3.data.bar_graph_construct', kinds: ['count-tap'], represent: true },
        { id: 'g3_sol_check', name: 'ひょうと グラフの おさらい', action: 'ここまでを たしかめる', goal: 'g3.data.table_bar.review', kinds: ['keypad', 'count-tap'], assessment: true, bigNumbers: true, represent: true, sources: ['g3_sol_tally', 'g3_sol_table', 'g3_sol_bar_read', 'g3_sol_bar_make'] },
        { id: 'g3_sol_scale', name: 'めもりの おおきさ', action: '1めもりが 2や 5の グラフ', goal: 'g3.data.bar_graph_scales_horizontal', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_sol_combined', name: 'くみあわせた ひょう', action: 'ふたつの ひょうを あわせて よむ', goal: 'g3.data.simple_combined_table_graph', kinds: ['keypad'], bigNumbers: true },
        { id: 'g3_sol_analyze', name: 'グラフから いえる こと', action: 'こんきょを もって いう', goal: 'g3.data.analyze_express', kinds: ['choice'], smallAnswerSpace: true, maxRepeat: 3 },
        { id: 'g3_sol_four_ops', name: 'どの けいさんを つかう？', action: 'たしひきかけわりを えらぶ', goal: 'g3.problem.four_operations_choice', kinds: ['choice'], smallAnswerSpace: true, balanceAnswers: true },
        { id: 'g3_sol_box', name: '□を つかった しき', action: 'わからない かずを □に する', goal: 'g3.problem.unknown_box_equation', kinds: ['keypad'] },
        { id: 'g3_sol_core', name: 'しらべる・とくの まとめ', action: 'しらべて えらんで とく', goal: 'g3.problem_data.review', kinds: ['keypad', 'choice'], assessment: true, bigNumbers: true, smallAnswerSpace: true, sources: ['g3_sol_scale', 'g3_sol_combined', 'g3_sol_analyze', 'g3_sol_four_ops', 'g3_sol_box'] }
      ]
    }
  }
};
