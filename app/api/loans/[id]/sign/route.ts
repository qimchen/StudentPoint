import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import { getNowInGMT8 } from '@/lib/utils/date';
import type { Loan } from '@/lib/types';

export const runtime = 'edge';

// POST /api/loans/[id]/sign - 补签合同（已存在但未签署的贷款）
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { signer } = (await request.json()) as { signer: string };

    if (!signer || signer.trim().length === 0) {
      return NextResponse.json({ success: false, message: '请填写签署人姓名' }, { status: 400 });
    }

    const loans = await getValue<Loan[]>('loans', []);
    const index = loans.findIndex((l) => l.id === params.id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: '未找到该贷款' }, { status: 404 });
    }

    const loan = loans[index];
    if (loan.contractSigned) {
      return NextResponse.json({
        success: false,
        message: `该贷款已于 ${loan.contractSignTime} 由 ${loan.contractSigner} 签署，无需重复签署`,
      }, { status: 400 });
    }

    loan.contractSigned = true;
    loan.contractSignTime = getNowInGMT8();
    loan.contractSigner = signer.trim();

    loans[index] = loan;
    await setValue('loans', loans);

    return NextResponse.json({
      success: true,
      message: `合同已由 ${loan.contractSigner} 签署`,
      loan,
    });
  } catch {
    return NextResponse.json({ success: false, message: '签署失败' }, { status: 500 });
  }
}
