import { NextResponse } from 'next/server';
import { getValue } from '@/lib/kv';
import type { ExchangeRecord } from '@/lib/types';

export async function GET() {
  const records = await getValue<ExchangeRecord[]>('exchangeRecords', []);
  return NextResponse.json(records);
}
