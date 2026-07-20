import { initData, getValue } from '../lib/kv';
import type { Student, ScoreRecord, ExchangeRecord, ScoreItem, Loan } from '../lib/types';
import HomeClient from './components/HomeClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function Home() {
  await initData();

  const [students, records, exRecords, items, loans] = await Promise.all([
    getValue<Student[]>('students', []),
    getValue<ScoreRecord[]>('scoreRecords', []),
    getValue<ExchangeRecord[]>('exchangeRecords', []),
    getValue<ScoreItem[]>('scoreItems', []),
    getValue<Loan[]>('loans', []),
  ]);

  return (
    <HomeClient
      students={students}
      records={records}
      exRecords={exRecords}
      items={items}
      loans={loans}
    />
  );
}
