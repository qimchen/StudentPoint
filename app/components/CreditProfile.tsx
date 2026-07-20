'use client';
import React from 'react';
import type { Loan, Student } from '@/lib/types';
import { calcCreditReport, CreditLevel } from '@/lib/utils/credit';

interface Props {
  student: Student;
  loans: Loan[];
  compact?: boolean;        // 紧凑模式（用于首页卡片）
  now?: number;
}

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n - Math.round(n)) < 0.005) return Math.round(n).toString();
  return n.toFixed(2);
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * 信用档案展示组件
 * 展示信用评级、信用分、债务概览、还款历史等
 */
export default function CreditProfile({ student, loans, compact = false, now = Date.now() }: Props) {
  const report = calcCreditReport(loans, student.id, now);
  const level = report.level;

  if (compact) {
    // 紧凑模式：用于首页学生卡片
    return (
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        {/* 信用评级横幅 */}
        <div className={`relative rounded-xl p-3 bg-gradient-to-r ${level.color} text-white shadow-md overflow-hidden`}>
          <div className="absolute -right-4 -top-4 text-6xl opacity-20 select-none">{level.icon}</div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-xs opacity-90">信用评级</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-wider">{level.grade}</span>
                <span className="text-sm opacity-90">{level.label}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-90">信用分</div>
              <div className="text-2xl font-bold">{report.score}</div>
            </div>
          </div>
        </div>

        {/* 三栏统计：欠款/利息/已还 */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
            <div className="text-gray-500 dark:text-gray-400">当前欠款</div>
            <div className="text-base font-bold text-red-600 dark:text-red-400 mt-0.5">
              {fmt(report.activeDebt)}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
            <div className="text-gray-500 dark:text-gray-400">待结利息</div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {fmt(report.activeInterest)}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
            <div className="text-gray-500 dark:text-gray-400">累计已还</div>
            <div className="text-base font-bold text-green-600 dark:text-green-400 mt-0.5">
              {fmt(report.totalRepaid)}
            </div>
          </div>
        </div>

        {/* 进行中贷款列表 */}
        {report.activeCount > 0 && (
          <div className="space-y-1 mt-2">
            {loans
              .filter((l) => l.studentId === student.id && l.status === 'active')
              .map((loan) => {
                const weeks = Math.floor((now - loan.lastResetTimestamp) / (7 * 24 * 60 * 60 * 1000));
                const debt = loan.currentPrincipal * Math.pow(1 + loan.weeklyInterestRate, Math.max(0, weeks));
                return (
                  <div key={loan.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-gray-600 dark:text-gray-300 truncate flex items-center gap-1">
                      {loan.purpose}
                      <span className="text-gray-400">· {(loan.weeklyInterestRate * 100).toFixed(2)}%/周</span>
                      {!loan.contractSigned && (
                        <span className="text-amber-500">· 未签合同</span>
                      )}
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-bold whitespace-nowrap ml-2">
                      欠 {fmt(debt)}
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {/* 底部摘要 */}
        <div className="flex justify-between text-xs text-gray-400 pt-1">
          <span>
            累计借出 {fmt(report.totalBorrowed)} · 已结清 {report.closedCount} 笔
          </span>
          <span>进行中 {report.activeCount} 笔</span>
        </div>
      </div>
    );
  }

  // 完整模式：用于学生详情页
  return (
    <div className="space-y-5">
      {/* 信用评级大卡片 */}
      <div className={`relative rounded-2xl p-6 bg-gradient-to-br ${level.color} text-white shadow-xl overflow-hidden`}>
        <div className="absolute -right-8 -top-8 text-9xl opacity-20 select-none">{level.icon}</div>
        <div className="absolute -left-4 -bottom-4 text-7xl opacity-10 select-none">{level.icon}</div>
        <div className="relative">
          <div className="text-sm opacity-90 mb-1">{student.name} 的信用档案</div>
          <div className="flex items-baseline gap-4 mb-3">
            <span className="text-5xl font-bold tracking-wider">{level.grade}</span>
            <span className="text-2xl font-semibold opacity-95">{level.label}</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-5xl font-bold">{report.score}</span>
            <span className="text-lg opacity-80 mb-1">/ 100 分</span>
          </div>
          {/* 信用分进度条 */}
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${report.score}%` }}
            />
          </div>
          <p className="text-sm opacity-90 mt-3">{level.description}</p>
        </div>
      </div>

      {/* 信用建议 */}
      <div className="card mb-0">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">信用建议</div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{report.advice}</p>
          </div>
        </div>
      </div>

      {/* 债务概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card mb-0">
          <div className="text-xs text-gray-500 mb-1">当前总欠款</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{fmt(report.activeDebt)}</div>
        </div>
        <div className="card mb-0">
          <div className="text-xs text-gray-500 mb-1">待结利息</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmt(report.activeInterest)}</div>
        </div>
        <div className="card mb-0">
          <div className="text-xs text-gray-500 mb-1">累计已还</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(report.totalRepaid)}</div>
        </div>
        <div className="card mb-0">
          <div className="text-xs text-gray-500 mb-1">累计借入</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmt(report.totalBorrowed)}</div>
        </div>
      </div>

      {/* 贷款笔数统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card mb-0 text-center">
          <div className="text-xs text-gray-500 mb-1">进行中</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{report.activeCount}</div>
          <div className="text-xs text-gray-400">笔</div>
        </div>
        <div className="card mb-0 text-center">
          <div className="text-xs text-gray-500 mb-1">已结清</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{report.closedCount}</div>
          <div className="text-xs text-gray-400">笔</div>
        </div>
        <div className="card mb-0 text-center">
          <div className="text-xs text-gray-500 mb-1">按时结清</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{report.onTimeRepayments}</div>
          <div className="text-xs text-gray-400">笔</div>
        </div>
        <div className="card mb-0 text-center">
          <div className="text-xs text-gray-500 mb-1">已签合同</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{report.contractSignedCount}</div>
          <div className="text-xs text-gray-400">笔</div>
        </div>
      </div>

      {/* 信用历史时间轴 */}
      {report.oldestLoanTimestamp && (
        <div className="card mb-0">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">信用历史</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            自 <strong>{formatDate(report.oldestLoanTimestamp)}</strong> 开启信用之旅，至今已记录
            <strong className="text-purple-600 dark:text-purple-400 mx-1">
              {report.closedCount + report.activeCount}
            </strong>
            笔借贷。按时还款 {report.onTimeRepayments} 笔，逾期已结清 {report.overdueClosedCount} 笔。
          </div>
        </div>
      )}
    </div>
  );
}
