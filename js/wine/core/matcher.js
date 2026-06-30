// js/wine/core/matcher.js
// 红酒版人格匹配
//
// 优先级（高 → 低）：
//   1. VINT 老饕 = 8 极中"主极"≥ 3 且"反向极"≤ -3（即 4 维都接近打满+反向打满）
//      → 用户对 4 维都态度明确，4 维方向都不同（不是"清一色 C"）
//   2. BLEN 调酒师 = 4 维每维最高分都 ≤ 0
//      → 用户对所有 +1 极都不强（什么酒都能搭）
//   3. 16 常规人格 = 4 字母 dimCode 在 types.json 找到 → 查表返回

const HIDDEN_CODES = ['BLEN', 'VINT'];

// 维度对（每维度的 2 个极）
const DIM_PAIRS = [['T', 'S'], ['A', 'C'], ['F', 'L'], ['R', 'Q']];

// VINT 触发：4 维每维主极 ≥ 3 且反向极 ≥ -2（即用户"几乎都赞同"）
//   - 主极 ≥ 3：该维有 3+ 题投 C（赞同）
//   - 反向极 ≥ -2：该维反向题至多 1 题投 A（不强烈反对）
//   - 典型场景：用户全选 C（不反对任何事），或偶尔 1 题 A
// 16 常规人格的"反推答案" = 4 维都"赞同+反对"分明（min ≤ -3）→ 不会触发 VINT
const VINT_POLE_HIGH = 3;
const VINT_POLE_LOW = -2;
// BLEN 触发：4 维每维最高分都 ≤ 0（用户对所有 +1 极都不偏好）
const BLEN_MAX = 0;

/**
 * 提取 4 字母维度指纹（每维选最高极）
 */
function dimensions(scores) {
  let r = '';
  for (const [a, b] of DIM_PAIRS) {
    r += scores[a] >= scores[b] ? a : b;
  }
  return r;
}

/**
 * @param {Object} scores - 8 极分数 {T,S,A,C,F,L,R,Q}
 * @returns {string} 'BLEN' | 'VINT' | 4 字母维度指纹
 */
export function matchType(scores) {
  const dimCode = dimensions(scores);

  // VINT：4 维每维主极 ≥ 3 且反向极 ≥ -2（用户几乎都赞同，不强烈反对）
  // 与 16 常规"赞同+反对分明"（反向极 ≤ -3）形成对照
  const allDimensionsExtreme = DIM_PAIRS.every(([a, b]) =>
    Math.max(scores[a], scores[b]) >= VINT_POLE_HIGH &&
    Math.min(scores[a], scores[b]) >= VINT_POLE_LOW
  );
  if (allDimensionsExtreme) {
    return 'VINT';
  }

  // BLEN：4 维每维最高分都 ≤ BLEN_MAX
  // 即用户对所有 +1 极都不偏好
  const allDimensionsLow = DIM_PAIRS.every(([a, b]) =>
    Math.max(scores[a], scores[b]) <= BLEN_MAX
  );
  if (allDimensionsLow) {
    return 'BLEN';
  }

  // 默认走 dimCode 查表
  return dimCode;
}

/**
 * 用 types.json 里的 dimensions 字段把维度指纹映射到 type code
 * @param {string} dimCode - 4 字母维度指纹
 * @param {Array} types - 16 常规人格数组
 * @returns {string} type code
 */
export function resolveTypeByDimensions(dimCode, types) {
  const exact = types.find(t => t.dimensions === dimCode);
  if (exact) return exact.code;

  // 兜底：找最近（汉明距离最小）
  let best = types[0];
  let bestDist = 4;
  for (const t of types) {
    const dist = hammingDistance(dimCode, t.dimensions);
    if (dist < bestDist) {
      bestDist = dist;
      best = t;
    }
  }
  return best ? best.code : 'BLEN';
}

function hammingDistance(a, b) {
  let n = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) n++;
  }
  return n + Math.abs(a.length - b.length);
}

export { HIDDEN_CODES };
