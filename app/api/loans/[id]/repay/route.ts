import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import { getNowInGMT8 } from '@/lib/utils/date';
import { calcCurrentDebt } from '@/lib/utils/loan';
import type { Loan, Repayment, Student } from '@/lib/types';

export const runtime = 'edge';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// POST /api/loans/[id]/repay - 还款
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { amount } = (await request.json()) as { amount: number };

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: '还款金额必须为正数' }, { status: 400 });
    }

    const loans = await getValue<Loan[]>('loans', []);
    const index = loans.findIndex((l) => l.id === params.id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: '未找到该贷款' }, { status: 404 });
    }

    const loan = loans[index];
    if (loan.status === 'closed') {
      return NextResponse.json({ success: false, message: '该贷款已结清，无需还款' }, { status: 400 });
    }

    // 1. 实时结息：把从 lastResetTimestamp 到现在的整周利息累加到 currentPrincipal
    const now = Date.now();
    const elapsed = now - loan.lastResetTimestamp;
    const weeks = Math.max(0, Math.floor(elapsed / WEEK_MS));
    const newPrincipalAfterInterest = loan.currentPrincipal * Math.pow(1 + loan.weeklyInterestRate, weeks);

    // 2. 还款扣减
    const newBalance = newPrincipalAfterInterest - amount;

    // 3. 记录还款
    const nowStr = getNowInGMT8();
    const repayment: Repayment = {
      id: `repay-${now}`,
      amount,
      time: nowStr,
      timestamp: now,
    };
    loan.repayments.push(repayment);

    if (newBalance <= 0) {
      // 结清
      loan.currentPrincipal = 0;
      loan.lastResetTimestamp = now;
      loan.status = 'closed';
    } else {
      // 仍有欠款：重置 currentPrincipal 为结息后扣减的余额，刷新 lastResetTimestamp
      loan.currentPrincipal = newBalance;
      loan.lastResetTimestamp = now;
    }

    loans[index] = loan;
    await setValue('loans', loans);

    // 虚拟信用额度方案：还款扣减学生现有积分
    const students = await getValue<Student[]>('students', []);
    const sIndex = students.findIndex((s) => s.id === loan.studentId);
    if (sIndex !== -1) {
      const student = students[sIndex];
      // 限制实际扣减金额不超过学生当前积分（避免出现负数）
      const actualDeduct = Math.min(amount, student.totalPoints);
      if (actualDeduct > 0) {
        student.totalPoints = Math.max(0, student.totalPoints - actualDeduct);
        // 按科目从高到低扣减
        const subjects: Array<'语文' | '数学' | '英语'> = ['语文', '数学', '英语'];
        subjects.sort((a, b) => student.subjectPoints[b] - student.subjectPoints[a]);
        let toDeduct = actualDeduct;
        for (const subj of subjects) {
          if (toDeduct <= 0) break;
          const deduct = Math.min(student.subjectPoints[subj], toDeduct);
          student.subjectPoints[subj] -= deduct;
          toDeduct -= deduct;
        }
        students[sIndex] = student;
        await setValue('students', students);
      }
    }

    const currentDebt = calcCurrentDebt(loan, now);

    return NextResponse.json({
      success: true,
      message: loan.status === 'closed' ? '还款成功，贷款已结清' : '还款成功',
      loan,
      currentDebt,
      repaid: amount,
      newBalance: loan.currentPrincipal,
    });
  } catch {
    return NextResponse.json({ success: false, message: '还款失败' }, { status: 500 });
  }
}
