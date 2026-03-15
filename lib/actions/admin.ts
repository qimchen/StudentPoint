'use server';
import { getValue, setValue } from '../kv';
import type { Student, ScoreItem, ScoreRecord, ExchangeRecord } from '../types';

export async function updatePassword(newPwd: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!newPwd || newPwd.length < 4) {
      return { success: false, message: '密码长度至少4位' };
    }
    await setValue('config', { password: newPwd });
    return { success: true, message: '密码修改成功' };
  } catch {
    return { success: false, message: '修改失败，请重试' };
  }
}

export async function getScoreItems(): Promise<ScoreItem[]> {
  return getValue<ScoreItem[]>('scoreItems', []);
}

export async function addScoreItem(item: Omit<ScoreItem, 'id'>): Promise<{ success: boolean; message: string }> {
  try {
    const items = await getScoreItems();
    const newItem: ScoreItem = {
      ...item,
      id: `${item.subject}-${Date.now()}`,
    };
    await setValue('scoreItems', [...items, newItem]);
    return { success: true, message: '添加成功' };
  } catch {
    return { success: false, message: '添加失败' };
  }
}

export async function updateScoreItem(item: ScoreItem): Promise<{ success: boolean; message: string }> {
  try {
    const items = await getScoreItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index === -1) {
      return { success: false, message: '未找到该积分项' };
    }
    items[index] = item;
    await setValue('scoreItems', items);
    return { success: true, message: '修改成功' };
  } catch {
    return { success: false, message: '修改失败' };
  }
}

export async function deleteScoreItem(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const items = await getScoreItems();
    const filtered = items.filter((i) => i.id !== id);
    await setValue('scoreItems', filtered);
    return { success: true, message: '删除成功' };
  } catch {
    return { success: false, message: '删除失败' };
  }
}

export async function getStudents(): Promise<Student[]> {
  return getValue<Student[]>('students', []);
}

export async function updateStudentExchangeRate(studentId: string, rate: number): Promise<{ success: boolean; message: string }> {
  try {
    const students = await getStudents();
    const index = students.findIndex((s) => s.id === studentId);
    if (index === -1) {
      return { success: false, message: '未找到该学生' };
    }
    students[index].exchangeRate = rate;
    await setValue('students', students);
    return { success: true, message: '兑换比例修改成功' };
  } catch {
    return { success: false, message: '修改失败' };
  }
}

export async function addScoreRecord(
  studentId: string,
  itemId: string,
  week: string
): Promise<{ success: boolean; message: string }> {
  try {
    const [students, items, records] = await Promise.all([
      getStudents(),
      getScoreItems(),
      getValue<ScoreRecord[]>('scoreRecords', []),
    ]);

    const item = items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, message: '未找到该积分项' };
    }

    const studentIndex = students.findIndex((s) => s.id === studentId);
    if (studentIndex === -1) {
      return { success: false, message: '未找到该学生' };
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

    return { success: true, message: `成功录入 +${item.points} 分` };
  } catch {
    return { success: false, message: '录入失败' };
  }
}

export async function exchangePoints(
  studentId: string,
  points: number,
  reason: string
): Promise<{ success: boolean; message: string; details?: string }> {
  try {
    const [students, exRecords] = await Promise.all([
      getStudents(),
      getValue<ExchangeRecord[]>('exchangeRecords', []),
    ]);

    const studentIndex = students.findIndex((s) => s.id === studentId);
    if (studentIndex === -1) {
      return { success: false, message: '未找到该学生' };
    }

    const student = students[studentIndex];

    if (points <= 0) {
      return { success: false, message: '兑换积分必须大于0' };
    }

    if (points > student.totalPoints) {
      return { success: false, message: '兑换积分不能超过总积分' };
    }

    if (points >= 100) {
      const totalPoints = student.totalPoints;
      const subjects = ['语文', '数学', '英语'] as const;
      const exceededSubjects: string[] = [];
      
      for (const subject of subjects) {
        const subjectPoints = student.subjectPoints[subject];
        const subjectRatio = totalPoints > 0 ? (subjectPoints / totalPoints) * 100 : 0;
        if (subjectRatio < student.exchangeRate) {
          exceededSubjects.push(`${subject}(占比${subjectRatio.toFixed(1)}%,需≥${student.exchangeRate}%)`);
        }
      }
      
      if (exceededSubjects.length > 0) {
        return {
          success: false,
          message: '积分兑换需要平衡发展',
          details: `以下科目积分不足：${exceededSubjects.join('、')}`,
        };
      }
    }

    const subjects = ['语文', '数学', '英语'] as const;
    const totalSubjectPoints = subjects.reduce(
      (sum, subject) => sum + student.subjectPoints[subject],
      0
    );

    const deductedSubjectPoints: { 语文: number; 数学: number; 英语: number } = {
      语文: 0,
      数学: 0,
      英语: 0,
    };

    if (totalSubjectPoints > 0) {
      for (const subject of subjects) {
        const ratio = student.subjectPoints[subject] / totalSubjectPoints;
        const deductPoints = Math.round(points * ratio);
        deductedSubjectPoints[subject] = deductPoints;
        students[studentIndex].subjectPoints[subject] = Math.max(
          0,
          student.subjectPoints[subject] - deductPoints
        );
      }
    }

    students[studentIndex].totalPoints -= points;

    const newRecord: ExchangeRecord = {
      id: `exchange-${Date.now()}`,
      studentId,
      points,
      reason,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      subjectPoints: deductedSubjectPoints,
    };

    await Promise.all([
      setValue('students', students),
      setValue('exchangeRecords', [...exRecords, newRecord]),
    ]);

    return { success: true, message: `成功兑换 ${points} 积分` };
  } catch {
    return { success: false, message: '兑换失败' };
  }
}

export async function getScoreRecords(): Promise<ScoreRecord[]> {
  return getValue<ScoreRecord[]>('scoreRecords', []);
}

export async function getExchangeRecords(): Promise<ExchangeRecord[]> {
  return getValue<ExchangeRecord[]>('exchangeRecords', []);
}

export async function deleteScoreRecord(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const [records, students, items] = await Promise.all([
      getValue<ScoreRecord[]>('scoreRecords', []),
      getStudents(),
      getScoreItems(),
    ]);

    const record = records.find((r) => r.id === id);
    if (!record) {
      return { success: false, message: '未找到该记录' };
    }

    const studentIndex = students.findIndex((s) => s.id === record.studentId);
    if (studentIndex !== -1) {
      let subject: '语文' | '数学' | '英语' | undefined = record.subject;
      
      if (!subject) {
        const item = items.find((i) => i.id === record.itemId);
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
      setValue('scoreRecords', records.filter((r) => r.id !== id)),
      setValue('students', students),
    ]);

    return { success: true, message: '删除成功' };
  } catch {
    return { success: false, message: '删除失败' };
  }
}

export async function deleteExchangeRecord(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const [records, students] = await Promise.all([
      getValue<ExchangeRecord[]>('exchangeRecords', []),
      getStudents(),
    ]);

    const record = records.find((r) => r.id === id);
    if (!record) {
      return { success: false, message: '未找到该记录' };
    }

    const studentIndex = students.findIndex((s) => s.id === record.studentId);
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
      setValue('exchangeRecords', records.filter((r) => r.id !== id)),
      setValue('students', students),
    ]);

    return { success: true, message: '删除成功，积分已返还' };
  } catch {
    return { success: false, message: '删除失败' };
  }
}
