import type { Loan } from '@/lib/types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 实时计算贷款当前总欠款（含累计利息）
 * 复利公式：欠款 = currentPrincipal × (1 + 周利率)^已过周数
 */
export function calcCurrentDebt(loan: Loan, now: number = Date.now()): number {
  if (loan.status === 'closed') return 0;
  const elapsed = now - loan.lastResetTimestamp;
  if (elapsed <= 0) return loan.currentPrincipal;
  const weeks = Math.floor(elapsed / WEEK_MS);
  if (weeks <= 0) return loan.currentPrincipal;
  return loan.currentPrincipal * Math.pow(1 + loan.weeklyInterestRate, weeks);
}

/**
 * 计算从上次结息到现在的累计利息
 */
export function calcAccruedInterest(loan: Loan, now: number = Date.now()): number {
  const debt = calcCurrentDebt(loan, now);
  return Math.max(0, debt - loan.currentPrincipal);
}

/**
 * 计算到当前为止已过的整周数
 */
export function calcElapsedWeeks(loan: Loan, now: number = Date.now()): number {
  if (loan.status === 'closed') return 0;
  const elapsed = now - loan.lastResetTimestamp;
  if (elapsed <= 0) return 0;
  return Math.floor(elapsed / WEEK_MS);
}

export interface StudentLoanStat {
  activeCount: number;          // 进行中贷款数
  closedCount: number;          // 已结清贷款数
  totalDebt: number;            // 当前总欠款（含利息）
  totalAccruedInterest: number; // 待结利息
  totalBorrowed: number;        // 累计借出本金
  totalRepaid: number;          // 累计已还款
  activeLoans: Loan[];          // 进行中的贷款列表
}

/**
 * 汇总学生的贷款统计
 */
export function summarizeStudentLoans(loans: Loan[], studentId: string, now: number = Date.now()): StudentLoanStat {
  const studentLoans = loans.filter((l) => l.studentId === studentId);
  const activeLoans = studentLoans.filter((l) => l.status === 'active');
  const closedLoans = studentLoans.filter((l) => l.status === 'closed');

  const totalDebt = activeLoans.reduce((sum, l) => sum + calcCurrentDebt(l, now), 0);
  const totalAccruedInterest = activeLoans.reduce((sum, l) => sum + calcAccruedInterest(l, now), 0);
  const totalBorrowed = studentLoans.reduce((sum, l) => sum + l.principal, 0);
  const totalRepaid = studentLoans.reduce(
    (sum, l) => sum + l.repayments.reduce((s, r) => s + r.amount, 0),
    0,
  );

  return {
    activeCount: activeLoans.length,
    closedCount: closedLoans.length,
    totalDebt,
    totalAccruedInterest,
    totalBorrowed,
    totalRepaid,
    activeLoans,
  };
}
