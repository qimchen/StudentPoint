import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { ScoreItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await getValue<ScoreItem[]>('scoreItems', []);
  return NextResponse.json(items, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}

export async function POST(request: Request) {
  try {
    const { subject, name, points } = await request.json();
    
    const items = await getValue<ScoreItem[]>('scoreItems', []);
    const newItem: ScoreItem = {
      id: `${subject}-${Date.now()}`,
      subject,
      name,
      points,
    };
    
    await setValue('scoreItems', [...items, newItem]);
    return NextResponse.json({ success: true, message: '添加成功' });
  } catch {
    return NextResponse.json({ success: false, message: '添加失败' });
  }
}
