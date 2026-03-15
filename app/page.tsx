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
  PieController,
  PointElement,
  LineElement,
  LineController,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

export const dynamic = 'force-dynamic';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PieController, PointElement, LineElement, LineController, Filler
);

export default async function Home() {
  await initData();

  const [students, records, exRecords, items] = await Promise.all([
    getValue<Student[]>('students', []),
    getValue<ScoreRecord[]>('scoreRecords', []),
    getValue<ExchangeRecord[]>('exchangeRecords', []),
    getValue<ScoreItem[]>('scoreItems', []),
  ]);

  const today = new Date();
  const thisWeek = today.toISOString().slice(0, 10);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const recordsByStudent = new Map<string, ScoreRecord[]>();
  records.forEach((r) => {
    const list = recordsByStudent.get(r.studentId) ?? [];
    list.push(r);
    recordsByStudent.set(r.studentId, list);
  });

  const buildChartData = () => {
    const barData = {
      labels: students.map(s => s.name),
      datasets: [
        {
          label: '语文',
          data: students.map(s => s.subjectPoints.语文),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: '数学',
          data: students.map(s => s.subjectPoints.数学),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: '英语',
          data: students.map(s => s.subjectPoints.英语),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgb(245, 158, 11)',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };

    const doughnutData = students.map((student) => {
      const itemStat = new Map<string, number>();
      const studentRecords = recordsByStudent.get(student.id) ?? [];
      studentRecords.forEach((r) => {
        const item = items.find((i) => i.id === r.itemId);
        if (!item) return;
        const key = item.name;
        itemStat.set(key, (itemStat.get(key) ?? 0) + r.points);
      });
      return {
        student,
        data: {
          labels: Array.from(itemStat.keys()).slice(0, 6),
          datasets: [{
            data: Array.from(itemStat.values()).slice(0, 6),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
            ],
            borderColor: '#fff',
            borderWidth: 3,
          }],
        },
      };
    });

    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      last7Days.push(d.toISOString().slice(0, 10));
    }

    const lineData = {
      labels: last7Days.map(d => d.slice(5)),
      datasets: students.map((s, idx) => {
        const studentRecords = recordsByStudent.get(s.id) ?? [];
        const dailyPoints = last7Days.map(day => {
          return studentRecords
            .filter(r => r.week === day)
            .reduce((sum, r) => sum + r.points, 0);
        });
        const colors = ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'];
        return {
          label: s.name,
          data: dailyPoints,
          borderColor: colors[idx],
          backgroundColor: colors[idx].replace('rgb', 'rgba').replace(')', ', 0.1)'),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        };
      }),
    };

    return { barData, doughnutData, lineData };
  };

  const { barData, doughnutData, lineData } = buildChartData();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle' as const,
        },
      },
    },
  };

  const totalPoints = students.reduce((sum, s) => sum + s.totalPoints, 0);
  const totalExchanges = exRecords.length;
  const totalExchangedPoints = exRecords.reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">积分总览</h1>
          <p className="text-sm text-gray-500 mt-1">记录成长 · 激励学习</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="stat-card hover-lift">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="stat-value">{totalPoints}</span>
              <span className="stat-label">总积分</span>
            </div>
          </div>
          <div className="stat-card hover-lift">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="stat-value">{records.length}</span>
              <span className="stat-label">积分记录</span>
            </div>
          </div>
          <div className="stat-card hover-lift">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="stat-value">{totalExchangedPoints}</span>
              <span className="stat-label">已兑换</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">�</span>
              学科积分对比
            </h2>
          </div>
          <div className="h-72">
            <Bar 
              data={barData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: false },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                },
              }} 
            />
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">📈</span>
              近7天积分趋势
            </h2>
          </div>
          <div className="h-72">
            <Line 
              data={lineData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: false },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                },
              }} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {students.map((s) => {
          const allRecords = recordsByStudent.get(s.id) ?? [];
          const weekRecords = allRecords.filter((r) => r.week === thisWeek);
          const weekPoints = weekRecords.reduce((sum, r) => sum + r.points, 0);

          const itemStat = new Map<string, number>();
          allRecords.forEach((r) => {
            const item = items.find((i) => i.id === r.itemId);
            if (!item) return;
            const key = item.name;
            itemStat.set(key, (itemStat.get(key) ?? 0) + r.points);
          });

          const studentDoughnut = doughnutData.find(d => d.student.id === s.id);

          return (
            <div key={s.id} className="card hover-lift">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                    s.id === 'chen-shumiao' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                  }`}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{s.name}</h2>
                    <p className="text-xs text-gray-500">今日新增 {weekPoints} 分</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{s.totalPoints}</p>
                  <p className="text-xs text-gray-500">总积分</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['语文', '数学', '英语'] as const).map((subject) => {
                  const colors = {
                    语文: 'from-blue-400 to-blue-600',
                    数学: 'from-green-400 to-green-600',
                    英语: 'from-amber-400 to-amber-600',
                  };
                  const icons = {
                    语文: '📖',
                    数学: '🔢',
                    英语: '🔤',
                  };
                  return (
                    <div key={subject} className="bg-gray-50 rounded-xl p-3 text-center hover:bg-gray-100 transition-colors">
                      <div className={`w-8 h-8 mx-auto mb-1 rounded-lg bg-gradient-to-br ${colors[subject]} flex items-center justify-center text-white text-sm`}>
                        {icons[subject]}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{subject}</div>
                      <div className="font-bold text-lg">{s.subjectPoints[subject]}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-gray-600">
                    <span>📅</span> 今日新增
                  </h3>
                  {weekRecords.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">暂无积分记录</p>
                    </div>
                  ) : (
                    <ul className="space-y-1.5 text-sm max-h-28 overflow-y-auto">
                      {weekRecords.slice(0, 5).map((r) => {
                        const item = items.find((i) => i.id === r.itemId);
                        return (
                          <li key={r.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-1.5">
                            <span className="text-gray-600 truncate">{item?.name}</span>
                            <span className="text-green-600 font-bold text-xs">+{r.points}</span>
                          </li>
                        );
                      })}
                      {weekRecords.length > 5 && (
                        <li className="text-xs text-gray-400 text-center">还有 {weekRecords.length - 5} 条...</li>
                      )}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-gray-600">
                    <span>🥧</span> 积分来源
                  </h3>
                  {studentDoughnut && studentDoughnut.data.labels.length > 0 ? (
                    <div className="h-28">
                      <Doughnut 
                        data={studentDoughnut.data} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          cutout: '60%',
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 text-center h-28 flex items-center justify-center">
                      <p className="text-xs text-gray-400">暂无数据</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">⏳</span>
            积分兑换历史
          </h2>
          <span className="badge badge-primary">
            共 {exRecords.length} 条
          </span>
        </div>
        {exRecords.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p>暂时还没有兑换记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学生</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">兑换积分</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">兑换原因</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {exRecords.slice(0, 10).map((r) => {
                  const student = students.find((s) => s.id === r.studentId);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">{r.createTime}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium">{student?.name || '未知学生'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="badge badge-danger">-{r.points}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {exRecords.length > 10 && (
              <p className="text-center text-xs text-gray-500 mt-3">
                仅显示最近10条记录
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
