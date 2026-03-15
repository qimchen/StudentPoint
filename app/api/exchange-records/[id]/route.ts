import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { ExchangeRecord, Student } from '@/lib/types';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [records, students] = await Promise.all([
      getValue<ExchangeRecord[]>('exchangeRecords', []),
      getValue<Student[]>('students', []),
    ]);

    const record = records.find((r: ExchangeRecord) => r.id === params.id);
    if (!record) {
      return NextResponse.json({ success: false, message: '未找到该记录' });
    }

    const studentIndex = students.findIndex((s: Student) => s.id === record.studentId);
    if (studentIndex !== -1) {
      students[studentIndex].totalPoints += record.points;

      if (record.subjectPoints) {
        const subjects = ['语文', '数学', '英语'] as const;
        for (const subject of subjects) {
          if (record.subjectPoints[subject]) {
            students[studentIndex].subjectPoints[subject] += record.subjectPoints[subject];
          }
        }
      }
    }

    await Promise.all([
      setValue('exchangeRecords', records.filter((r: ExchangeRecord) => r.id !== params.id)),
      setValue('students', students),
    ]);

    return NextResponse.json({ success: true, message: '删除成功，积分已返还' });
  } catch {
    return NextResponse.json({ success: false, message: '删除失败' });
  }
}
