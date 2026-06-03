/**
 * Artic 工作台 — 纯 TypeScript 统计函数库
 * 零外部依赖，基于标准统计算法实现
 */

/* ==================== 基础分布函数 ==================== */

/** 标准正态分布 CDF (Abramowitz & Stegun 近似) */
export function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741,
    a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

/** 标准正态分布分位数（逆 CDF），用于置信区间 */
export function normalQuantile(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  // Rational approximation (Moro 1995)
  const a0 = 2.50662823884, a1 = -18.61500062529, a2 = 41.39119773534, a3 = -25.44106049637,
    b1 = -8.4735109309, b2 = 23.08336743743, b3 = -21.06224101826, b4 = 3.13082909833,
    c0 = 0.337475482272615, c1 = 0.976169019091719, c2 = 0.160797971491821,
    c3 = 2.76438810333863e-2, c4 = 3.8405729373609e-3, c5 = 3.951896511919e-4,
    c6 = 3.21767881768e-5, c7 = 2.888167364e-7, c8 = 3.960315187e-7;
  const y = p - 0.5;
  if (Math.abs(y) < 0.42) {
    const r = y * y;
    return y * (((a3 * r + a2) * r + a1) * r + a0) / ((((b4 * r + b3) * r + b2) * r + b1) * r + 1);
  }
  const r = p < 0.5 ? p : 1 - p;
  const s = Math.log(-Math.log(r));
  const t = c0 + s * (c1 + s * (c2 + s * (c3 + s * (c4 + s * (c5 + s * (c6 + s * (c7 + s * c8)))))));
  return p < 0.5 ? -t : t;
}

/* ==================== 描述统计 ==================== */

export function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function stdDev(values: number[], sample = true): number {
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - (sample ? 1 : 0));
  return Math.sqrt(variance);
}

export function sum(values: number[]): number {
  return values.reduce((s, v) => s + v, 0);
}

/* ==================== AB 测试 ==================== */

export interface ABTestInput {
  conversionsA: number;
  trialsA: number;
  conversionsB: number;
  trialsB: number;
}

export interface ABTestResult {
  pA: number;
  pB: number;
  lift: number;           // 相对提升率 %
  absLift: number;         // 绝对提升率 (百分点)
  zScore: number;
  pValue: number;
  ciLow: number;           // 95% CI 下限
  ciHigh: number;          // 95% CI 上限
  significant: boolean;    // α = 0.05
  sampleSizeOK: boolean;   // 最小样本量检查
  recommendation: string;
}

/** 两样本比例 z-test */
export function abTestZTest(input: ABTestInput): ABTestResult {
  const { conversionsA, trialsA, conversionsB, trialsB } = input;

  const pA = conversionsA / trialsA;
  const pB = conversionsB / trialsB;

  const lift = ((pB - pA) / pA) * 100;
  const absLift = (pB - pA) * 100;

  // 池化比例
  const pPool = (conversionsA + conversionsB) / (trialsA + trialsB);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / trialsA + 1 / trialsB));

  const zScore = se > 0 ? (pB - pA) / se : 0;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore))); // 双尾

  // 95% CI for difference in proportions
  const seDiff = Math.sqrt(pA * (1 - pA) / trialsA + pB * (1 - pB) / trialsB);
  const z95 = normalQuantile(0.975); // ~1.96
  const ciLow = ((pB - pA) - z95 * seDiff) * 100;
  const ciHigh = ((pB - pA) + z95 * seDiff) * 100;

  const significant = pValue < 0.05;

  // 最小样本量检查 (α=0.05, power=0.8, MDE=5%)
  const minSample = estimateSampleSize(pA, 0.05);
  const sampleSizeOK = trialsA >= minSample && trialsB >= minSample;

  let recommendation = "";
  if (!significant) {
    recommendation = `不显著（p=${pValue.toFixed(3)}）。建议延长实验或增大样本量，当前可能不足以检测到真实差异。`;
  } else if (lift > 0 && sampleSizeOK) {
    recommendation = `B 版本显著优于 A 版本（p=${pValue.toFixed(4)}），提升 ${lift.toFixed(1)}%。建议采用 B 版本。`;
  } else if (lift < 0 && sampleSizeOK) {
    recommendation = `A 版本显著优于 B 版本（p=${pValue.toFixed(4)}）。建议保留 A 版本。`;
  } else {
    recommendation = `统计显著但样本量不足，建议继续收集数据（每版本至少 ${minSample} 样本）。`;
  }

  return { pA, pB, lift, absLift, zScore, pValue, ciLow, ciHigh, significant, sampleSizeOK, recommendation };
}

/** 卡方检验（2x2 contingency table） */
export function chiSquareTest(input: ABTestInput): { chi2: number; pValue: number; significant: boolean } {
  const { conversionsA, trialsA, conversionsB, trialsB } = input;
  const nonConvA = trialsA - conversionsA;
  const nonConvB = trialsB - conversionsB;
  const total = trialsA + trialsB;
  const totalConv = conversionsA + conversionsB;
  const totalNon = total - totalConv;

  const e11 = trialsA * totalConv / total;
  const e12 = trialsA * totalNon / total;
  const e21 = trialsB * totalConv / total;
  const e22 = trialsB * totalNon / total;

  const chi2 = (conversionsA - e11) ** 2 / e11 + (nonConvA - e12) ** 2 / e12 +
    (conversionsB - e21) ** 2 / e21 + (nonConvB - e22) ** 2 / e22;

  // chi2 with 1 df → p-value via normal approx
  const z = Math.sqrt(chi2);
  const pValue = 2 * (1 - normalCDF(z));

  return { chi2, pValue, significant: pValue < 0.05 };
}

/** Cohen's h 效应量 */
export function cohensH(p1: number, p2: number): number {
  return 2 * (Math.asin(Math.sqrt(p2)) - Math.asin(Math.sqrt(p1)));
}

/** 估计最小样本量（每组） */
export function estimateSampleSize(baselineRate: number, mde: number = 0.05, alpha: number = 0.05, power: number = 0.8): number {
  const zAlpha = normalQuantile(1 - alpha / 2); // two-tailed
  const zBeta = normalQuantile(power);
  const p2 = baselineRate + mde;
  const pPool = (baselineRate + p2) / 2;
  const numerator = (zAlpha * Math.sqrt(2 * pPool * (1 - pPool)) + zBeta * Math.sqrt(baselineRate * (1 - baselineRate) + p2 * (1 - p2))) ** 2;
  return Math.ceil(numerator / (mde ** 2));
}

/* ==================== 工具 ==================== */

/** 推断列的数据类型 */
export function inferColumnType(values: unknown[]): "number" | "string" | "boolean" | "date" | "mixed" {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return "string";
  const types = nonNull.map((v) => {
    if (typeof v === "number") return "number";
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "string") {
      if (/^\d+\.?\d*$/.test(v)) return "number";
      if (/^(true|false|yes|no)$/i.test(v)) return "boolean";
      if (/^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{2}\/\d{2}\/\d{4}/.test(v)) return "date";
      return "string";
    }
    return "string";
  });
  const unique = new Set(types);
  if (unique.size === 1) return Array.from(unique)[0] as "number" | "string" | "boolean" | "date";
  return "mixed";
}

/** 将值统一转为数字（尝试） */
export function toNumber(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[,\s%￥$]/g, ""));
    return isNaN(n) ? null : n;
  }
  return null;
}
