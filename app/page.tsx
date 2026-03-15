import { initData, getValue } from '../lib/kv';
import type { Student, ScoreRecord, ExchangeRecord, ScoreItem } from '../lib/types';
import HomeClient from './components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await initData();

  const [students, records, exRecords, items] = await Promise.all([
    getValue<Student[]>('students', []),
    getValue<ScoreRecord[]>('scoreRecords', []),
    getValue<ExchangeRecord[]>('exchangeRecords', []),
    getValue<ScoreItem[]>('scoreItems', []),
  ]);

  return (
    <HomeClient 
      students={students} 
      records={records} 
      exRecords={exRecords} 
      items={items} 
    />
  );
}
