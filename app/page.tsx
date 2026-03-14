import React from 'react';
import { initData, getValue } from '../lib/kv';
import type { Student, ScoreRecord, ExchangeRecord, ScoreItem } from '../lib/types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PieController
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PieController
);

export default async function Home() {
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

  // 构建图表数据
  const buildChartData = () => {
    // 1. 学生总分对比（柱状图）
    const barData = {
      labels: students.map(s => s.name),
      datasets: [
        {
          label: '语文',
          data: students.map(s => s.subjectPoints.语文),
          backgroundColor: '#3b82f6',
        },
        {
          label: '数学',
          data: students.map(s => s.subjectPoints.数学),
          backgroundColor: '#10b981',
        },
        {
          label: '英语',
          data: students.map(s => s.subjectPoints.英语),
          backgroundColor: '#f59e0b',
        },
      ],
    };

    // 2. 积分来源占比（饼图）- 取第一个学生示例
    const firstStudent = students[0];
    const pieData = firstStudent ? (() => {
      const itemStat = new Map<string, number>();
      const studentRecords = recordsByStudent.get(firstStudent.id) ?? [];
      studentRecords.forEach((r) => {
        const item = items.find((i) => i.id === r.itemId);
        if (!item) return;
        const key = `${item.subject}-${item.name}`;
        itemStat.set(key, (itemStat.get(key) ?? 0) + r.points);
      });

      return {
        labels: Array.from(itemStat.keys()),
        datasets: [
          {
            data: Array.from(itemStat.values()),
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
            ],
          },
        ],
      };
    })() : { labels: [], datasets: [{ data: [] }] };

    return { barData, pieData };
  };

  const { barData, pieData } = buildChartData();
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        font: { size: 14 },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📊 积分总览</h1>
        <div className="flex gap-2">
          <span className="stat-card">
            <span className="stat-value">{students.reduce((sum, s) => sum + s.totalPoints, 0)}</span>
            <span className="stat-label">总积分</span>
          </span>
          <span className="stat-card">
            <span className="stat-value">{exRecords.length}</span>
            <span className="stat-label">兑换次数</span>
          </span>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">📈 学科积分对比</h2>
          <div className="h-80">
            <Bar 
              data={barData} 
              options={{ ...chartOptions, title: { text: '各学生学科积分分布' } }} 
            />
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">🥧 积分来源占比（{students[0]?.name || '暂无数据'}）</h2>
          <div className="h-80 flex items-center justify-center">
            {pieData.labels.length > 0 ? (
              <Pie 
                data={pieData} 
                options={{ ...chartOptions, title: { text: '积分来源统计' } }} 
              />
            ) : (
              <p className="text-gray-500 text-sm">暂无积分数据</p>
            )}
          </div>
        </div>
      </div>

      {/* 学生详情 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold text-blue-600">{s.name}</h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  总积分：{s.totalPoints}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-sm text-gray-500">语文</div>
                  <div className="font-bold">{s.subjectPoints.语文}</div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-sm text-gray-500">数学</div>
                  <div className="font-bold">{s.subjectPoints.数学}</div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-sm text-gray-500">英语</div>
                  <div className="font-bold">{s.subjectPoints.英语}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <span>📅 本周新增（{thisWeek}）</span>
                </h3>
                {weekRecords.length === 0 ? (
                  <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded p-2">本周暂无积分记录</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">
                    {weekRecords.map((r) => {
                      const item = items.find((i) => i.id === r.itemId);
                      return (
                        <li key={r.id} className="flex justify-between">
                          <span>{item?.subject}-{item?.name}</span>
                          <span className="text-green-600 font-medium">+{r.points}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <span>📋 累计积分来源</span>
                </h3>
                {itemStat.size === 0 ? (
                  <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded p-2">暂无历史积分记录</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">
                    {Array.from(itemStat.entries()).map(([key, sum]) => (
                      <li key={key} className="flex justify-between">
                        <span>{key}</span>
                        <span className="font-medium">{sum} 分</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 兑换历史 */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-1">
          <span>⏳ 积分兑换历史</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
            共 {exRecords.length} 条
          </span>
        </h2>
        {exRecords.length === 0 ? (
          <p className="text-sm text-gray-500 bg-gray-50 rounded p-3">暂时还没有兑换记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学生</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">兑换积分</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">兑换原因</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exRecords.map((r) => {
                  const student = students.find((s) => s.id === r.studentId);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{r.createTime}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-medium">{student?.name || '未知学生'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-red-600">-{r.points}</td>
                      <td className="px-3 py-2 text-gray-600">{r.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}