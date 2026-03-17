import { NextRequest, NextResponse } from 'next/server';
import { getValue, setValue } from '../../../lib/kv';
import type { Student } from '../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const { studentId, avatarUrl } = await request.json();
    
    if (!studentId || !avatarUrl) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    const students = await getValue<Student[]>('students', []);
    const studentIndex = students.findIndex((s: Student) => s.id === studentId);
    
    if (studentIndex === -1) {
      return NextResponse.json({ error: '学生不存在' }, { status: 404 });
    }

    students[studentIndex] = {
      ...students[studentIndex],
      avatarUrl,
    };

    await setValue('students', students);
    
    return NextResponse.json({ success: true, student: students[studentIndex] });
  } catch (error) {
    console.error('上传头像失败:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
