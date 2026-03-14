import { initData, db } from '@/lib/kv';

export default async function Home() {
  await initData();
  const students = await db.get('students');
  const records = await db.get('scoreRecords');
  const exRecords = await db.get('exchangeRecords');

  const thisWeek = new Date().toISOString().slice(0, 10);
  const weekRecords = records.filter(r => r.week === thisWeek);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📊 积分总览</h1>
      {students.map(s => (
        <div key={s.id} className="card">
          <h2 className="text-xl font-bold text-blue-600">{s.name}</h2>
          <p>总积分：{s.totalPoints}</p>
          <p>语文：{s.subjectPoints.语文} | 数学：{s.subjectPoints.数学} | 英语：{s.subjectPoints.英语}</p>
          <p className="mt-2">本周新增：{weekRecords.filter(r => r.studentId === s.id).reduce((t, r) => t + r.points, 0)}</p>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6 mb-2">⏳ 兑换历史</h2>
      <div className="card">
        {exRecords.map(r => (
          <p key={r.id}>{r.createTime} {students.find(s => s.id === r.studentId)?.name} 兑换 {r.points} 分 | {r.reason}</p>
        ))}
      </div>
    </div>
  );
}