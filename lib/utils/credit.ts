import type { Loan, Student } from '@/lib/types';
import { calcCurrentDebt, calcAccruedInterest } from './loan';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 信用评级档位
 * - SSS：信用典范，几乎无逾期且按时结清多笔
 * - SS：信用优秀
 * - A：信用良好
 * - B：信用一般
 * - C：信用待改善
 * - D：信用风险
 */
export interface CreditLevel {
  grade: 'SSS' | 'SS' | 'A' | 'B' | 'C' | 'D';
  label: string;
  score: number;          // 0-100
  color: string;          // tailwind 渐变色
  textColor: string;
  icon: string;
  description: string;
}

export interface CreditReport {
  score: number;                    // 综合信用分 0-100
  level: CreditLevel;
  totalBorrowed: number;            // 累计借入
  totalRepaid: number;              // 累计已还
  activeDebt: number;               // 当前总欠款（含利息）
  activeInterest: number;           // 待结利息
  activeCount: number;              // 进行中笔数
  closedCount: number;              // 已结清笔数
  onTimeRepayments: number;         // 按时还款次数（结清前未满 4 周视为按时）
  overdueClosedCount: number;       // 曾经逾期但已结清的笔数（结清时已满 4 周以上）
  maxSingleDebt: number;            // 单笔最高欠款
  oldestLoanTimestamp?: number;     // 最早一笔借款时间
  contractSignedCount: number;      // 已签合同笔数
  unsignedCount: number;            // 未签合同笔数
  advice: string;                   // 信用建议
}

/**
 * 根据学生的贷款历史计算信用报告
 */
export function calcCreditReport(
  loans: Loan[],
  studentId: string,
  now: number = Date.now(),
): CreditReport {
  const studentLoans = loans.filter((l) => l.studentId === studentId);
  const active = studentLoans.filter((l) => l.status === 'active');
  const closed = studentLoans.filter((l) => l.status === 'closed');

  const totalBorrowed = studentLoans.reduce((s, l) => s + l.principal, 0);
  const totalRepaid = studentLoans.reduce(
    (s, l) => s + l.repayments.reduce((ss, r) => ss + r.amount, 0),
    0,
  );
  const activeDebt = active.reduce((s, l) => s + calcCurrentDebt(l, now), 0);
  const activeInterest = active.reduce((s, l) => s + calcAccruedInterest(l, now), 0);

  // 按时结清：结清时距借款不足 4 周
  let onTimeRepayments = 0;
  let overdueClosedCount = 0;
  for (const l of closed) {
    const lastRepay = l.repayments[l.repayments.length - 1];
    if (!lastRepay) continue;
    const durationMs = lastRepay.timestamp - l.borrowTimestamp;
    if (durationMs < 4 * WEEK_MS) onTimeRepayments += 1;
    else overdueClosedCount += 1;
  }

  const maxSingleDebt = active.reduce(
    (s, l) => Math.max(s, calcCurrentDebt(l, now)),
    0,
  );

  const oldestLoanTimestamp = studentLoans.length > 0
    ? Math.min(...studentLoans.map((l) => l.borrowTimestamp))
    : undefined;

  const contractSignedCount = studentLoans.filter((l) => l.contractSigned).length;
  const unsignedCount = studentLoans.length - contractSignedCount;

  // 计算信用分（0-100）
  let score = 100;

  // 当前欠款扣分（按欠款占已借比例）
  if (totalBorrowed > 0) {
    const debtRatio = activeDebt / totalBorrowed;
    score -= Math.min(40, debtRatio * 40);
  }

  // 进行中笔数过多扣分
  score -= Math.min(15, active.length * 5);

  // 待结利息扣分
  if (activeInterest > 0) {
    score -= Math.min(15, Math.log10(activeInterest + 1) * 6);
  }

  // 逾期已结清扣分
  score -= Math.min(20, overdueClosedCount * 8);

  // 未签合同扣分
  score -= Math.min(10, unsignedCount * 2);

  // 按时还款奖励（已经从 100 起算，这里不额外加分，只确保不被过度扣分）

  score = Math.max(0, Math.min(100, Math.round(score)));

  const level = getCreditLevel(score);

  // 生成信用建议
  let advice = '信用记录良好，请继续保持按时还款的好习惯。';
  if (activeDebt > 0 && activeInterest > 0) {
    advice = `当前有 ${active.length} 笔进行中贷款待还，建议尽快结清以避免利息继续累计。`;
  } else if (active.length > 0) {
    advice = `有 ${active.length} 笔贷款进行中，请关注还款时间。`;
  } else if (closed.length > 0 && unsignedCount > 0) {
    advice = '部分历史借款未签合同，建议补签以完善信用档案。';
  } else if (closed.length > 0 && score >= 90) {
    advice = '信用档案良好，所有借款均已按时结清，是值得信赖的小借款人。';
  } else if (overdueClosedCount > 0) {
    advice = `历史有 ${overdueClosedCount} 笔逾期已结清，下次借款请尽量在 4 周内还清。`;
  }

  return {
    score,
    level,
    totalBorrowed,
    totalRepaid,
    activeDebt,
    activeInterest,
    activeCount: active.length,
    closedCount: closed.length,
    onTimeRepayments,
    overdueClosedCount,
    maxSingleDebt,
    oldestLoanTimestamp,
    contractSignedCount,
    unsignedCount,
    advice,
  };
}

export function getCreditLevel(score: number): CreditLevel {
  if (score >= 95) {
    return {
      grade: 'SSS',
      label: '信用典范',
      score,
      color: 'from-purple-500 via-fuchsia-500 to-pink-500',
      textColor: 'text-purple-600 dark:text-purple-300',
      icon: '💎',
      description: '信用极佳，几乎无任何瑕疵',
    };
  }
  if (score >= 85) {
    return {
      grade: 'SS',
      label: '信用优秀',
      score,
      color: 'from-amber-400 via-orange-400 to-yellow-400',
      textColor: 'text-amber-600 dark:text-amber-300',
      icon: '👑',
      description: '信用记录优秀，值得信赖',
    };
  }
  if (score >= 75) {
    return {
      grade: 'A',
      label: '信用良好',
      score,
      color: 'from-blue-400 via-cyan-400 to-sky-400',
      textColor: 'text-blue-600 dark:text-blue-300',
      icon: '🥇',
      description: '信用良好，按时还款',
    };
  }
  if (score >= 60) {
    return {
      grade: 'B',
      label: '信用一般',
      score,
      color: 'from-green-400 via-emerald-400 to-teal-400',
      textColor: 'text-green-600 dark:text-green-300',
      icon: '🥈',
      description: '信用尚可，注意按时还款',
    };
  }
  if (score >= 40) {
    return {
      grade: 'C',
      label: '信用待改善',
      score,
      color: 'from-orange-400 via-red-400 to-rose-400',
      textColor: 'text-orange-600 dark:text-orange-300',
      icon: '🥉',
      description: '信用有瑕疵，建议尽快还款',
    };
  }
  return {
    grade: 'D',
    label: '信用风险',
    score,
    color: 'from-red-500 via-rose-500 to-pink-600',
    textColor: 'text-red-600 dark:text-red-300',
    icon: '⚠️',
    description: '信用风险较高，请尽快结清欠款',
  };
}
