import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { ScoreRecord, Student, ScoreItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await getValue<ScoreRecord[]>('scoreRecords', []);
    return NextResponse.json(records, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, itemId, week } = await request.json();
    
    const [students, items, records] = await Promise.all([
      getValue<Student[]>('students', []),
      getValue<ScoreItem[]>('scoreItems', []),
      getValue<ScoreRecord[]>('scoreRecords', []),
    ]);

    const item = items.find((i: ScoreItem) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ success: false, message: '未找到该积分项' });
    }

    const studentIndex = students.findIndex((s: Student) => s.id === studentId);
    if (studentIndex === -1) {
      return NextResponse.json({ success: false, message: '未找到该学生' });
    }

    const newRecord: ScoreRecord = {
      id: `record-${Date.now()}`,
      studentId,
      itemId,
      subject: item.subject,
      week,
      points: item.points,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    students[studentIndex].totalPoints += item.points;
    students[studentIndex].subjectPoints[item.subject] += item.points;

    await Promise.all([
      setValue('students', students),
      setValue('scoreRecords', [...records, newRecord]),
    ]);

    return NextResponse.json({ success: true, message: `成功录入 +${item.points} 分` });
  } catch {
    return NextResponse.json({ success: false, message: '录入失败' });
  }
}
