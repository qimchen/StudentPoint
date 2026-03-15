import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { ScoreItem } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const items = await getValue<ScoreItem[]>('scoreItems', []);
    const index = items.findIndex((i) => i.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ success: false, message: '未找到该积分项' });
    }
    
    items[index] = { ...items[index], ...body, id: params.id };
    await setValue('scoreItems', items);
    
    return NextResponse.json({ success: true, message: '修改成功' });
  } catch {
    return NextResponse.json({ success: false, message: '修改失败' });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const items = await getValue<ScoreItem[]>('scoreItems', []);
    const filtered = items.filter((i) => i.id !== params.id);
    await setValue('scoreItems', filtered);
    
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch {
    return NextResponse.json({ success: false, message: '删除失败' });
  }
}
