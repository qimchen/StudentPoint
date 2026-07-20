import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { Loan, Student } from '@/lib/types';
import { calcCurrentDebt, calcAccruedInterest, calcElapsedWeeks } from '@/lib/utils/loan';

export const runtime = 'edge';

// GET /api/loans/[id] - 贷款详情
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loans = await getValue<Loan[]>('loans', []);
    const loan = loans.find((l) => l.id === params.id);
    if (!loan) {
      return NextResponse.json({ success: false, message: '未找到该贷款' }, { status: 404 });
    }
    const students = await getValue<Student[]>('students', []);
    const student = students.find((s) => s.id === loan.studentId);
    const now = Date.now();

    return NextResponse.json({
      ...loan,
      studentName: student?.name ?? '未知学生',
      currentDebt: calcCurrentDebt(loan, now),
      accruedInterest: calcAccruedInterest(loan, now),
      elapsedWeeks: calcElapsedWeeks(loan, now),
    });
  } catch {
    return NextResponse.json({ success: false, message: '获取详情失败' }, { status: 500 });
  }
}

// DELETE /api/loans/[id] - 删除贷款（仅允许 closed 状态或管理员强制删除）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === '1';

    const loans = await getValue<Loan[]>('loans', []);
    const index = loans.findIndex((l) => l.id === params.id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: '未找到该贷款' }, { status: 404 });
    }

    const loan = loans[index];
    if (loan.status === 'active' && !force) {
      return NextResponse.json(
        { success: false, message: '该贷款仍处于进行中状态，无法删除。如需强制删除请使用 force=1' },
        { status: 400 },
      );
    }

    loans.splice(index, 1);
    await setValue('loans', loans);

    return NextResponse.json({ success: true, message: '贷款已删除' });
  } catch {
    return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
  }
}
