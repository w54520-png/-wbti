// js/wine/core/scoring.js
// 红酒版计分：4 维度 8 极
// 维度对：
//   单宁 T(强) ↔ S(弱)
//   酸度 A(高) ↔ C(低)
//   酒体 F(满) ↔ L(轻)
//   回味 R(长) ↔ Q(短)

export function scoreAnswer(answer) {
  if (answer === 'A') return -1;
  if (answer === 'B') return 0;
  if (answer === 'C') return 1;
  throw new Error(`invalid answer: ${answer}`);
}

/**
 * 32 题聚合到 8 个极的得分
 * @returns {Object} - {T, S, A, C, F, L, R, Q} 各为 -8..+8
 */
export function scoreAllAnswers(answers, questions) {
  if (answers.length !== 32) {
    throw new Error(`expected 32 answers, got ${answers.length}`);
  }
  if (!questions || questions.length !== 32) {
    throw new Error(`expected 32 questions, got ${questions ? questions.length : 0}`);
  }

  const scores = { T: 0, S: 0, A: 0, C: 0, F: 0, L: 0, R: 0, Q: 0 };

  for (let i = 0; i < 32; i++) {
    const score = scoreAnswer(answers[i]);
    const pole = questions[i].pole;
    if (!scores.hasOwnProperty(pole)) {
      throw new Error(`invalid pole: ${pole} in question ${questions[i].id}`);
    }
    scores[pole] += score;
  }

  return scores;
}

/**
 * 提取每维度最高极，组成 4 字母维度指纹
 * @returns {string} 4 字母组合，每维度选最高极
 */
export function dimensions(scores) {
  let result = '';
  if (scores.T >= scores.S) result += 'T'; else result += 'S'; // 单宁：强 vs 弱
  if (scores.A >= scores.C) result += 'A'; else result += 'C'; // 酸度：高 vs 低
  if (scores.F >= scores.L) result += 'F'; else result += 'L'; // 酒体：满 vs 轻
  if (scores.R >= scores.Q) result += 'R'; else result += 'Q'; // 回味：长 vs 短
  return result;
}