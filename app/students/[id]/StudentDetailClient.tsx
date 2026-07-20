'use client';
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { Student, ScoreRecord, ScoreItem, Loan } from '../../../lib/types';
import { calcCurrentDebt, calcAccruedInterest, calcElapsedWeeks } from '../../../lib/utils/loan';
import CreditProfile from '../../components/CreditProfile';
import LoanContract from '../../components/LoanContract';
import { apiFetch } from '../../../lib/utils/api';

interface Props {
  student: Student;
  records: ScoreRecord[];
  items: ScoreItem[];
  loans: Loan[];
}

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n - Math.round(n)) < 0.005) return Math.round(n).toString();
  return n.toFixed(2);
};

const pct = (rate: number) => `${(rate * 100).toFixed(2)}%`;

interface LoanWithComputed extends Loan {
  currentDebt: number;
  accruedInterest: number;
  elapsedWeeks: number;
}

export default function StudentDetailClient({ student, records, items, loans: initialLoans }: Props) {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [now, setNow] = useState(Date.now());
  const [contractLoan, setContractLoan] = useState<Loan | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 刷新贷款数据
  const refreshLoans = useCallback(async () => {
    try {
      const res = await apiFetch('/api/loans');
      const data = (await res.json()) as Loan[];
      setLoans(data.filter((l) => l.studentId === student.id));
      setNow(Date.now());
    } catch {
      showToast('刷新失败', 'error');
    }
  }, [student.id]);

  // 计算每个贷款的实时数据
  const loansWithComputed: LoanWithComputed[] = useMemo(() => {
    return loans.map((l) => ({
      ...l,
      currentDebt: calcCurrentDebt(l, now),
      accruedInterest: calcAccruedInterest(l, now),
      elapsedWeeks: calcElapsedWeeks(l, now),
    }));
  }, [loans, now]);

  const activeLoans = loansWithComputed.filter((l) => l.status === 'active');
  const closedLoans = loansWithComputed.filter((l) => l.status === 'closed');

  // 处理合同签署完成
  const handleSigned = useCallback(
    async (signature: string, signerName: string) => {
      if (!contractLoan) return;
      const res = await apiFetch(`/api/loans/${contractLoan.id}/sign`, {
        method: 'POST',
        body: JSON.stringify({ signer: signerName, signature }),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (data.success) {
        showToast('合同签署成功', 'success');
        await refreshLoans();
        // 关闭合同弹窗，延迟一下让用户看到成功提示
        setTimeout(() => setContractLoan(null), 600);
      } else {
        showToast(data.message || '签署失败', 'error');
        throw new Error(data.message);
      }
    },
    [contractLoan, refreshLoans, showToast],
  );

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="btn btn-outline"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-2xl font-bold gradient-text">{student.name} 的信用档案</h1>
        </div>
        <button
          onClick={refreshLoans}
          className="btn btn-outline"
          type="button"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </div>

      {/* 学生基本信息 */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{student.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            当前总积分：<strong className="text-blue-600 dark:text-blue-400">{student.totalPoints}</strong>
            <span className="mx-2">·</span>
            累计积分记录：<strong>{records.length}</strong> 条
          </p>
        </div>
        <div className="hidden md:flex gap-3 text-center">
          {(['语文', '数学', '英语'] as const).map((subj) => (
            <div key={subj} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="text-xs text-gray-500">{subj}</div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{student.subjectPoints[subj]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 信用档案（完整模式） */}
      <CreditProfile student={student} loans={loans} now={now} />

      {/* 进行中贷款 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            进行中贷款
          </h3>
          <span className="badge badge-warning">{activeLoans.length} 笔</span>
        </div>
        {activeLoans.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">无进行中贷款，信用状况良好</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{loan.purpose}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      借款时间：{loan.borrowTime} · 周利率：{pct(loan.weeklyInterestRate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">当前欠款</div>
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{fmt(loan.currentDebt)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                    <div className="text-gray-500">本金</div>
                    <div className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{fmt(loan.principal)}</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                    <div className="text-gray-500">待结利息</div>
                    <div className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">{fmt(loan.accruedInterest)}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded p-2">
                    <div className="text-gray-500">已过周数</div>
                    <div className="font-bold text-gray-700 dark:text-gray-200 mt-0.5">{loan.elapsedWeeks}</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                    <div className="text-gray-500">还款次数</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">{loan.repayments.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {loan.contractSigned ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      ✓ 合同已签署 · {loan.contractSigner} · {loan.contractSignTime}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                      ⚠ 未签合同
                    </span>
                  )}
                  <button
                    onClick={() => setContractLoan(loan)}
                    className="text-xs px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors ml-auto"
                    type="button"
                  >
                    {loan.contractSigned ? '查看合同' : '签署合同'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 已结清贷款 */}
      {closedLoans.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              已结清贷款
            </h3>
            <span className="badge badge-success">{closedLoans.length} 笔</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">借款时间</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">用途</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">本金</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">周利率</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">已还总额</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300">合同</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {closedLoans.map((loan) => {
                  const repaid = loan.repayments.reduce((s, r) => s + r.amount, 0);
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{loan.borrowTime}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{loan.purpose}</td>
                      <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 font-medium">{fmt(loan.principal)}</td>
                      <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">{pct(loan.weeklyInterestRate)}</td>
                      <td className="px-3 py-2 text-right text-green-600 dark:text-green-400 font-medium">{fmt(repaid)}</td>
                      <td className="px-3 py-2 text-center">
                        {loan.contractSigned ? (
                          <span className="text-xs text-green-600 dark:text-green-400">✓ 已签</span>
                        ) : (
                          <span className="text-xs text-gray-400">未签</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => setContractLoan(loan)}
                          className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          type="button"
                        >
                          查看合同
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 合同弹窗 */}
      {contractLoan && (
        <LoanContract
          loan={contractLoan}
          student={student}
          defaultSigner={student.name}
          existingSignature={contractLoan.contractSignature}
          readOnly={contractLoan.contractSigned}
          onClose={() => setContractLoan(null)}
          onSigned={handleSigned}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
