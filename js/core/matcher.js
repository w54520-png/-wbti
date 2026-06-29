// js/core/matcher.js
// 纯函数：人格匹配

// 16 常规人格维度组合 → 代号
const TYPE_DIM_TO_CODE = {
  'HSFC': 'MALT',  'HSMC': 'CASK',  'HTFC': 'BOOZE', 'HTMC': 'FIRE',
  'HSFN': 'NEAT',  'HSMN': 'SMOK',  'HTFN': 'TOAS',  'HTMN': 'HYPE',
  'LSFC': 'PEAC',  'LSMC': 'JULE',  'LSFN': 'COOL',  'LSMN': 'ZEN',
  'LTFC': 'PUNC',  'LTFN': 'TIPS',  'LTMC': 'CHIC',  'LTMN': 'DRAM'
};

// HHHH 触发阈值（spec §3.5）
const HHHH_THRESHOLD = 5;

// 字母表顺序（用于平手处理：靠前者胜）
// 在每个维度对内，H > L, S > T, F > M, C > N（字母表靠前）
const POLE_ORDER = ['H', 'L', 'S', 'T', 'F', 'M', 'C', 'N'];

// 维度对
const DIM_PAIRS = [['H', 'L'], ['S', 'T'], ['F', 'M'], ['C', 'N']];

/**
 * 主函数：根据分数匹配人格代号
 * @param {Object} scores - {H, L, S, T, F, M, C, N}，范围 -8..+8
 * @param {string|null} drunkAnswer - 饮酒分支答案 'A'/'B'/'C'/null
 * @returns {string} - 18 个代号之一
 */
export function matchType(scores, drunkAnswer) {
  // 1. DRUNK 优先
  if (drunkAnswer === 'A') {
    return 'DRUNK';
  }

  // 2. HHHH 检查：每维度选最高极，最高极得分 < 5 → HHHH
  let maxPoleScore = -Infinity;

  for (const [a, b] of DIM_PAIRS) {
    const maxScore = Math.max(scores[a], scores[b]);
    if (maxScore > maxPoleScore) maxPoleScore = maxScore;
  }

  if (maxPoleScore < HHHH_THRESHOLD) {
    return 'HHHH';
  }

  // 3. 常规人格：每维度选最高极
  let resultCode = '';
  for (const [a, b] of DIM_PAIRS) {
    if (scores[a] > scores[b]) {
      resultCode += a;
    } else if (scores[b] > scores[a]) {
      resultCode += b;
    } else {
      // 平手：字母表靠前者胜
      resultCode += POLE_ORDER.indexOf(a) < POLE_ORDER.indexOf(b) ? a : b;
    }
  }

  return TYPE_DIM_TO_CODE[resultCode] || 'HHHH'; // 兜底
}
