import React from 'react';
import { initData, getValue } from '@/lib/kv';
import type {
  Student,
  ScoreRecord,
  ExchangeRecord,
  ScoreItem,
} from '@/lib/types';

export default async function Home(): Promise<React.JSX.Element> {
  await initData();

  const [students, records, exRecords, items] = await Promise.all([
    getValue<Student[]>('students', []),
    getValue<ScoreRecord[]>('scoreRecords', []),
    getValue<ExchangeRecord[]>('exchangeRecords', []),
    getValue<ScoreItem[]>('scoreItems', []),
  ]);

  const thisWeek = new Date().toISOString().slice(0, 10);

  const recordsByStudent = new Map<string, ScoreRecord[]>();
  records.forEach((r) => {
    const list = recordsByStudent.get(r.studentId) ?? [];
    list.push(r);
    recordsByStudent.set(r.studentId, list);
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">📊 积分总览</h1>

      {students.map((s) => {
        const allRecords = recordsByStudent.get(s.id) ?? [];
        const weekRecords = allRecords.filter((r) => r.week === thisWeek);

        const itemStat = new Map<string, number>();
        allRecords.forEach((r) => {
          const item = items.find((i) => i.id === r.itemId);
          if (!item) return;
          const key = `${item.subject}-${item.name}`;
          itemStat.set(key, (itemStat.get(key) ?? 0) + r.points);
        });

        return (
          <div key={s.id} className="card">
            <h2 className="text-xl font-bold text-blue-600 mb-1">{s.name}</h2>
            <p className="text-sm mb-1">
              当前总积分：
              <span className="font-semibold">{s.totalPoints}</span>
            </p>
            <p className="text-sm mb-1">
              语文：{s.subjectPoints.语文} ｜ 数学：{s.subjectPoints.数学} ｜ 英语：
              {s.subjectPoints.英语}
            </p>
            <p className="mt-2 text-sm font-semibold">本周新增积分明细（{thisWeek}）</p>
            {weekRecords.length === 0 ? (
              <p className="text-xs text-gray-500 mt-1">本周暂无积分记录</p>
            ) : (
              <ul className="mt-1 space-y-1 text-xs md:text-sm">
                {weekRecords.map((r) => {
                  const item = items.find((i) => i.id === r.itemId);
                  return (
                    <li key={r.id}>
                      {r.createTime}：{item?.subject}
                      {item ? `-${item.name}` : ''} +{r.points}
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="mt-3 text-sm font-semibold">累计积分来源统计</p>
            {itemStat.size === 0 ? (
              <p className="text-xs text-gray-500 mt-1">暂无历史积分记录</p>
            ) : (
              <ul className="mt-1 space-y-1 text-xs md:text-sm">
                {Array.from(itemStat.entries()).map(([key, sum]) => (
                  <li key={key}>
                    {key}：{sum} 分
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      <section className="card">
        <h2 className="text-xl font-bold mb-2">⏳ 积分兑换历史</h2>
        {exRecords.length === 0 ? (
          <p className="text-sm text-gray-500">暂时还没有兑换记录</p>
        ) : (
          <ul className="space-y-1 text-xs md:text-sm">
            {exRecords.map((r) => {
              const student = students.find((s) => s.id === r.studentId);
              return (
                <li key={r.id}>
                  {r.createTime}{' '}
                  {student ? student.name : '未知学生'} 兑换 {r.points} 分 ｜{' '}
                  {r.reason}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}