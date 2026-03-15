import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { ScoreItem } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = await getValue<ScoreItem[]>('scoreItems', []);
    
    const newItem: ScoreItem = {
      id: `${body.subject}-${Date.now()}`,
      subject: body.subject,
      name: body.name,
      points: body.points,
    };
    
    await setValue('scoreItems', [...items, newItem]);
    return NextResponse.json({ success: true, message: '添加成功' });
  } catch {
    return NextResponse.json({ success: false, message: '添加失败' });
  }
}
