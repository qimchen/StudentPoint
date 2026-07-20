import { initData, getValue } from '../../../lib/kv';
import type { Student, ScoreRecord, ScoreItem, Loan } from '../../../lib/types';
import StudentDetailClient from './StudentDetailClient';
import { notFound } from 'next/navigation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function StudentDetailPage({ params }: PageProps) {
  await initData();

  const [students, records, items, loans] = await Promise.all([
    getValue<Student[]>('students', []),
    getValue<ScoreRecord[]>('scoreRecords', []),
    getValue<ScoreItem[]>('scoreItems', []),
    getValue<Loan[]>('loans', []),
  ]);

  const student = students.find((s) => s.id === params.id);
  if (!student) {
    notFound();
  }

  const studentLoans = loans.filter((l) => l.studentId === params.id);
  const studentRecords = records.filter((r) => r.studentId === params.id);

  return (
    <StudentDetailClient
      student={student}
      records={studentRecords}
      items={items}
      loans={studentLoans}
    />
  );
}
