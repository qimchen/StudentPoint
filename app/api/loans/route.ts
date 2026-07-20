import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import { getNowInGMT8 } from '@/lib/utils/date';
import { calcCurrentDebt, calcAccruedInterest, calcElapsedWeeks } from '@/lib/utils/loan';
import type { Loan, Student } from '@/lib/types';

export const runtime = 'edge';

// GET /api/loans - 返回所有贷款列表（含实时计算的当前欠款）
export async function GET() {
  try {
    const loans = await getValue<Loan[]>('loans', []);
    const students = await getValue<Student[]>('students', []);
    const now = Date.now();

    const enriched = loans.map((loan) => {
      const student = students.find((s) => s.id === loan.studentId);
      return {
        ...loan,
        studentName: student?.name ?? '未知学生',
        currentDebt: calcCurrentDebt(loan, now),
        accruedInterest: calcAccruedInterest(loan, now),
        elapsedWeeks: calcElapsedWeeks(loan, now),
      };
    });

    // 按借款时间倒序
    enriched.sort((a, b) => b.borrowTimestamp - a.borrowTimestamp);

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/loans - 创建借款（含合同签署）
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      studentId: string;
      principal: number;
      weeklyInterestRate?: number;
      purpose: string;
      signer?: string;       // 合同签署人姓名（管理员代签）
    };

    const { studentId, principal, purpose, signer } = body;

    // 参数校验
    if (!studentId) {
      return NextResponse.json({ success: false, message: '缺少学生 ID' }, { status: 400 });
    }
    if (!Number.isFinite(principal) || principal <= 0) {
      return NextResponse.json({ success: false, message: '本金必须为正数' }, { status: 400 });
    }
    if (!purpose || purpose.trim().length === 0) {
      return NextResponse.json({ success: false, message: '请填写借款用途' }, { status: 400 });
    }

    const students = await getValue<Student[]>('students', []);
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return NextResponse.json({ success: false, message: '未找到该学生' }, { status: 404 });
    }

    // 利率优先使用请求传入；否则使用学生的 weeklyInterestRate；默认 0.025（2.5%）
    const rate = Number.isFinite(body.weeklyInterestRate) && body.weeklyInterestRate! >= 0
      ? body.weeklyInterestRate!
      : (student.weeklyInterestRate ?? 0.025);

    if (rate > 1) {
      return NextResponse.json({ success: false, message: '周利率不能超过 100%（1.0）' }, { status: 400 });
    }

    const loans = await getValue<Loan[]>('loans', []);
    const now = Date.now();
    const nowStr = getNowInGMT8();

    const loan: Loan = {
      id: `loan-${now}`,
      studentId,
      principal,
      currentPrincipal: principal,
      weeklyInterestRate: rate,
      borrowTime: nowStr,
      borrowTimestamp: now,
      lastResetTimestamp: now,
      status: 'active',
      repayments: [],
      purpose: purpose.trim(),
      // 合同签署：若提供签署人姓名，则借款即视为已签署合同
      contractSigned: !!signer,
      contractSignTime: signer ? nowStr : undefined,
      contractSigner: signer || undefined,
    };

    loans.push(loan);
    await setValue('loans', loans);

    return NextResponse.json({
      success: true,
      message: signer ? '借款已创建并完成合同签署' : '借款已创建（未签署合同）',
      loan,
    });
  } catch {
    return NextResponse.json({ success: false, message: '创建借款失败' }, { status: 500 });
  }
}
