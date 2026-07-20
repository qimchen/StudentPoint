'use client';
import React, { useMemo, useState } from 'react';

/**
 * 独立贷款计算器
 * 用于在借款前评估成本：输入本金、周利率、周数，模拟复利债务增长
 * 不依赖任何后端 API，纯前端实时计算
 */
export default function LoanCalculator() {
  const [principal, setPrincipal] = useState<number>(100);
  const [weeklyRate, setWeeklyRate] = useState<number>(1); // 百分比，支持 0.01
  const [weeks, setWeeks] = useState<number>(4);

  // 复利计算：每周欠款 = 本金 × (1 + 周利率)^周数
  const projection = useMemo(() => {
    const rate = weeklyRate / 100;
    const rows: Array<{ week: number; debt: number; interest: number; weeklyGain: number }> = [];
    let prevDebt = principal;

    for (let w = 0; w <= weeks; w++) {
      const debt = principal * Math.pow(1 + rate, w);
      const interest = debt - principal;
      const weeklyGain = w === 0 ? 0 : debt - prevDebt;
      rows.push({ week: w, debt, interest, weeklyGain });
      prevDebt = debt;
    }
    return rows;
  }, [principal, weeklyRate, weeks]);

  const finalRow = projection[projection.length - 1] ?? { debt: 0, interest: 0 };
  const interestRatio = principal > 0 ? (finalRow.interest / finalRow.debt) * 100 : 0;

  // 数值格式化：整数显示整数，小数显示 2 位
  const fmt = (n: number) => {
    if (Math.abs(n - Math.round(n)) < 0.005) return Math.round(n).toString();
    return n.toFixed(2);
  };

  // 输入校验
  const principalValid = principal > 0 && Number.isFinite(principal);
  const rateValid = weeklyRate >= 0 && weeklyRate <= 100 && Number.isFinite(weeklyRate);
  const weeksValid = Number.isInteger(weeks) && weeks >= 1 && weeks <= 52;

  const allValid = principalValid && rateValid && weeksValid;

  // 最大欠款（用于柱状图比例）
  const maxDebt = Math.max(...projection.map((r) => r.debt), 1);

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </span>
          贷款成本评估器
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          借款前模拟复利债务增长。利息按周复利计算（利滚利），可在借款前评估总成本。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              本金（积分）
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className={`input-control ${!principalValid ? 'border-red-400' : ''}`}
              placeholder="如 100"
            />
            {!principalValid && (
              <p className="text-xs text-red-500 mt-1">必须为正数</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              周利率（%）
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={weeklyRate}
              onChange={(e) => setWeeklyRate(Number(e.target.value))}
              className={`input-control ${!rateValid ? 'border-red-400' : ''}`}
              placeholder="如 1 或 0.01"
            />
            {!rateValid && (
              <p className="text-xs text-red-500 mt-1">范围 0~100，支持 0.01%</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              周数
            </label>
            <input
              type="number"
              min={1}
              max={52}
              step={1}
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className={`input-control ${!weeksValid ? 'border-red-400' : ''}`}
              placeholder="1~52"
            />
            {!weeksValid && (
              <p className="text-xs text-red-500 mt-1">1~52 的整数</p>
            )}
          </div>
        </div>

        {/* 快捷预设 */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">快捷预设：</span>
          {[
            { label: '低息 0.05%/周 × 12 周', rate: 0.05, weeks: 12 },
            { label: '常规 1%/周 × 4 周', rate: 1, weeks: 4 },
            { label: '高息 5%/周 × 8 周', rate: 5, weeks: 8 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setWeeklyRate(preset.rate);
                setWeeks(preset.weeks);
              }}
              className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 汇总卡片 */}
      {allValid && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card mb-0">
            <div className="text-xs text-gray-500 mb-1">期末总欠款</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {fmt(finalRow.debt)}
            </div>
            <div className="text-xs text-gray-400 mt-1">第 {weeks} 周末</div>
          </div>

          <div className="card mb-0">
            <div className="text-xs text-gray-500 mb-1">累计利息</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {fmt(finalRow.interest)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              占还款 {interestRatio.toFixed(2)}%
            </div>
          </div>

          <div className="card mb-0">
            <div className="text-xs text-gray-500 mb-1">本金</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {fmt(principal)}
            </div>
            <div className="text-xs text-gray-400 mt-1">实际借款</div>
          </div>
        </div>
      )}

      {/* 每周明细 */}
      {allValid && (
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="badge badge-warning">每周明细</span>
            <span className="text-xs text-gray-500">复利公式：欠款 = 本金 × (1 + 周利率)^周数</span>
          </h3>

          {/* 柱状图 */}
          <div className="mb-4 overflow-x-auto">
            <div className="flex items-end gap-1 h-32 min-w-full" style={{ minWidth: `${projection.length * 12}px` }}>
              {projection.map((row) => {
                const heightPct = (row.debt / maxDebt) * 100;
                return (
                  <div
                    key={row.week}
                    className="flex-1 flex flex-col items-center justify-end group relative"
                    style={{ minWidth: '12px' }}
                  >
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-purple-500 to-purple-300 transition-all hover:from-purple-600 hover:to-purple-400"
                      style={{ height: `${heightPct}%` }}
                      title={`第 ${row.week} 周：${fmt(row.debt)}`}
                    />
                    <span className="text-[9px] text-gray-400 mt-1">{row.week}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">周数</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">欠款</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">累计利息</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">本周增长</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {projection.map((row, idx) => (
                  <tr
                    key={row.week}
                    className={
                      idx === projection.length - 1
                        ? 'bg-red-50 dark:bg-red-900/20 font-semibold'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }
                  >
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                      {row.week === 0 ? '起借' : `第 ${row.week} 周`}
                    </td>
                    <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">
                      {fmt(row.debt)}
                    </td>
                    <td className="px-3 py-2 text-right text-amber-600 dark:text-amber-400">
                      {fmt(row.interest)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {row.week === 0 ? '—' : `+${fmt(row.weeklyGain)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
            <strong>评估提示：</strong>
            {weeklyRate === 0 ? (
              <>当前利率为 0，无利息产生，期末仅需偿还本金 {fmt(principal)} 积分。</>
            ) : (
              <>
                借款 {fmt(principal)} 积分，{weeks} 周后需偿还 <strong>{fmt(finalRow.debt)}</strong> 积分，
                其中利息 <strong>{fmt(finalRow.interest)}</strong> 积分（占 {interestRatio.toFixed(2)}%）。
                {interestRatio > 50 && (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    {' '}⚠️ 利息已超过还款的一半，请谨慎评估还款能力。
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
