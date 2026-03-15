import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { ScoreRecord, Student, ScoreItem } from '@/lib/types';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [records, students, items] = await Promise.all([
      getValue<ScoreRecord[]>('scoreRecords', []),
      getValue<Student[]>('students', []),
      getValue<ScoreItem[]>('scoreItems', []),
    ]);

    const record = records.find((r: ScoreRecord) => r.id === params.id);
    if (!record) {
      return NextResponse.json({ success: false, message: '未找到该记录' });
    }

    const studentIndex = students.findIndex((s: Student) => s.id === record.studentId);
    if (studentIndex !== -1) {
      let subject: '语文' | '数学' | '英语' | undefined = record.subject;
      
      if (!subject) {
        const item = items.find((i: ScoreItem) => i.id === record.itemId);
        if (item) {
          subject = item.subject;
        }
      }
      
      if (subject) {
        students[studentIndex].totalPoints -= record.points;
        students[studentIndex].subjectPoints[subject] -= record.points;
      }
    }

    await Promise.all([
      setValue('scoreRecords', records.filter((r: ScoreRecord) => r.id !== params.id)),
      setValue('students', students),
    ]);

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch {
    return NextResponse.json({ success: false, message: '删除失败' });
  }
}
