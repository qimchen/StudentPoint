import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { ExchangeRecord, Student } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const records = await getValue<ExchangeRecord[]>('exchangeRecords', []);
  return NextResponse.json(records, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
