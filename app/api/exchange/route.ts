import { NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/kv';
import type { ExchangeRecord, Student } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { studentId, points, reason } = await request.json();
    
    const [students, exRecords] = await Promise.all([
      getValue<Student[]>('students', []),
      getValue<ExchangeRecord[]>('exchangeRecords', []),
    ]);

    const studentIndex = students.findIndex((s: Student) => s.id === studentId);
    if (studentIndex === -1) {
      return NextResponse.json({ success: false, message: '未找到该学生' });
    }

    const student = students[studentIndex];

    if (points <= 0) {
      return NextResponse.json({ success: false, message: '兑换积分必须大于0' });
    }

    if (points > student.totalPoints) {
      return NextResponse.json({ success: false, message: '兑换积分不能超过总积分' });
    }

    if (points >= 100) {
      const totalPoints = student.totalPoints;
      const maxPerSubject = (points * student.exchangeRate) / 100;
      
      const subjects = ['语文', '数学', '英语'] as const;
      const exceededSubjects: string[] = [];
      
      for (const subject of subjects) {
        const subjectPoints = student.subjectPoints[subject];
        const subjectRatio = (subjectPoints / totalPoints) * 100;
        if (subjectPoints < maxPerSubject && subjectRatio < student.exchangeRate) {
          exceededSubjects.push(`${subject}(占比${subjectRatio.toFixed(1)}%,需≥${student.exchangeRate}%)`);
        }
      }
      
      if (exceededSubjects.length > 0) {
        return NextResponse.json({
          success: false,
          message: '积分兑换需要平衡发展',
          details: `以下科目积分不足：${exceededSubjects.join('、')}`,
        });
      }
    }

    const newRecord: ExchangeRecord = {
      id: `exchange-${Date.now()}`,
      studentId,
      points,
      reason,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    students[studentIndex].totalPoints -= points;

    await Promise.all([
      setValue('students', students),
      setValue('exchangeRecords', [...exRecords, newRecord]),
    ]);

    return NextResponse.json({ success: true, message: `成功兑换 ${points} 积分` });
  } catch {
    return NextResponse.json({ success: false, message: '兑换失败' });
  }
}
