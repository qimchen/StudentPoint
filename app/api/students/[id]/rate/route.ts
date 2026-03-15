import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { Student } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { rate } = await request.json();
    const students = await getValue<Student[]>('students', []);
    const index = students.findIndex((s) => s.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ success: false, message: '未找到该学生' });
    }
    
    students[index].exchangeRate = rate;
    await setValue('students', students);
    
    return NextResponse.json({ success: true, message: '兑换比例修改成功' });
  } catch {
    return NextResponse.json({ success: false, message: '修改失败' });
  }
}
