import { getValue } from '../../lib/kv';
import type { Student, ScoreItem } from '../../lib/types';
import RulesClient from './components/RulesClient';

export const dynamic = 'force-dynamic';

export default async function Rules() {
  const [students, scoreItems] = await Promise.all([
    getValue<Student[]>('students', []),
    getValue<ScoreItem[]>('scoreItems', []),
  ]);

  return <RulesClient students={students} scoreItems={scoreItems} />;
}
