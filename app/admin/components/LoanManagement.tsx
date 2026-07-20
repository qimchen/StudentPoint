'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/utils/api';
import type { Loan, Student } from '@/lib/types';
import LoanContract from '@/app/components/LoanContract';
import Link from 'next/link';

interface LoanWithComputed extends Loan {
  studentName?: string;
  currentDebt: number;
  accruedInterest: number;
  elapsedWeeks: number;
}

interface Props {
  students: Student[];
  onRefresh: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n - Math.round(n)) < 0.005) return Math.round(n).toString();
  return n.toFixed(2);
};

const pct = (rate: number) => `${(rate * 100).toFixed(2)}%`;

export default function LoanManagement({ students, onRefresh, showToast }: Props) {
  const [loans, setLoans] = useState<LoanWithComputed[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');

  // 新建借款表单（步骤1）
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    studentId: '',
    principal: 100,
    weeklyInterestRate: 2.5, // 百分比输入，提交时转为小数
    purpose: '',
    signer: '',
    contractSigned: true,
  });

  // 步骤2：合同签约（创建借款后弹出）
  const [pendingLoan, setPendingLoan] = useState<Loan | null>(null);
  const [pendingStudent, setPendingStudent] = useState<Student | null>(null);

  // 查看已有合同
  const [viewLoan, setViewLoan] = useState<Loan | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // 还款弹窗
  const [repayTarget, setRepayTarget] = useState<LoanWithComputed | null>(null);
  const [repayAmount, setRepayAmount] = useState<number>(0);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/loans');
      const data = (await res.json()) as LoanWithComputed[];
      setLoans(data);
    } catch {
      showToast('贷款数据加载失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { studentId, principal, weeklyInterestRate, purpose, signer, contractSigned } = createForm;
    if (!studentId) {
      showToast('请选择学生', 'error');
      return;
    }
    if (principal <= 0) {
      showToast('本金必须为正数', 'error');
      return;
    }
    if (!purpose.trim()) {
      showToast('请填写借款用途', 'error');
      return;
    }
    if (contractSigned && !signer.trim()) {
      showToast('已勾选合同签署，请填写签署人姓名', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 步骤1：创建借款（不带 signer，先创建为未签合同状态）
      const res = await apiFetch('/api/loans', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          principal,
          weeklyInterestRate: weeklyInterestRate / 100,
          purpose: purpose.trim(),
          // 不传 signer，先创建未签状态，签约后再调 sign API
        }),
      });
      const data = (await res.json()) as { success: boolean; message: string; loan?: Loan };
      if (data.success && data.loan) {
        showToast('借款已创建，请完成合同签署', 'success');
        setShowCreate(false);
        const stu = students.find((s) => s.id === studentId) ?? null;
        // 步骤2：弹出合同签署界面
        setPendingStudent(stu);
        setPendingLoan(data.loan);
        setCreateForm({
          studentId: '',
          principal: 100,
          weeklyInterestRate: 2.5,
          purpose: '',
          signer: signer || stu?.name || '',
          contractSigned: true,
        });
        await fetchLoans();
        onRefresh();
      } else {
        showToast(data.message || '创建失败', 'error');
      }
    } catch {
      showToast('创建借款失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 合同签约完成回调（新建借款的步骤2）
  const handlePendingSigned = useCallback(
    async (signature: string, signerName: string) => {
      if (!pendingLoan) return;
      const res = await apiFetch(`/api/loans/${pendingLoan.id}/sign`, {
        method: 'POST',
        body: JSON.stringify({ signer: signerName, signature }),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (data.success) {
        showToast('合同签署成功', 'success');
        setPendingLoan(null);
        setPendingStudent(null);
        await fetchLoans();
        onRefresh();
      } else {
        showToast(data.message || '签署失败', 'error');
        throw new Error(data.message);
      }
    },
    [pendingLoan, fetchLoans, onRefresh, showToast],
  );

  // 列表中已有贷款的补签
  const handleViewSigned = useCallback(
    async (signature: string, signerName: string) => {
      if (!viewLoan) return;
      const res = await apiFetch(`/api/loans/${viewLoan.id}/sign`, {
        method: 'POST',
        body: JSON.stringify({ signer: signerName, signature }),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (data.success) {
        showToast('合同签署成功', 'success');
        setViewLoan(null);
        await fetchLoans();
        onRefresh();
      } else {
        showToast(data.message || '签署失败', 'error');
        throw new Error(data.message);
      }
    },
    [viewLoan, fetchLoans, onRefresh, showToast],
  );

  const handleRepay = async () => {
    if (!repayTarget) return;
    if (repayAmount <= 0) {
      showToast('还款金额必须为正数', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/loans/${repayTarget.id}/repay`, {
        method: 'POST',
        body: JSON.stringify({ amount: repayAmount }),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (data.success) {
        showToast(data.message, 'success');
        setRepayTarget(null);
        setRepayAmount(0);
        await fetchLoans();
        onRefresh();
      } else {
        showToast(data.message, 'error');
      }
    } catch {
      showToast('还款失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (loan: LoanWithComputed, force: boolean) => {
    if (!confirm(`确认删除 ${loan.studentName} 的这笔借款？${force ? '（强制删除进行中贷款）' : ''}`)) return;
    try {
      const res = await apiFetch(`/api/loans/${loan.id}?force=${force ? '1' : '0'}`, { method: 'DELETE' });
      const data = (await res.json()) as { success: boolean; message: string };
      if (data.success) {
        showToast(data.message, 'success');
        await fetchLoans();
      } else {
        showToast(data.message, 'error');
      }
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const filtered = loans.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (filterStudent !== 'all' && l.studentId !== filterStudent) return false;
    return true;
  });

  // 统计
  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalDebt = activeLoans.reduce((sum, l) => sum + l.currentDebt, 0);
  const totalAccruedInterest = activeLoans.reduce((sum, l) => sum + l.accruedInterest, 0);
  const totalBorrowed = loans.reduce((sum, l) => sum + l.principal, 0);

  return (
    <div className="space-y-5">
      {/* 汇总卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card mb-0">
          <div className="text-xs text-gray-500 mb-1">进行中贷款</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activeLoans.length}</div>
        </div>
        <div className="card mb-0">
          <div className="text-xs text-gray-500 mb-1">当前总欠款</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{fmt(totalDebt)}</div>
        </div>
        <div className="card mb-0">
          <div className="text-xs text-gray-500 mb-1">待结利息</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmt(totalAccruedInterest)}</div>
        </div>
        <div className="card mb-0">
          <div className="text-xs text-gray-500 mb-1">累计借出</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmt(totalBorrowed)}</div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'closed')}
              className="input-control w-auto"
            >
              <option value="all">全部状态</option>
              <option value="active">进行中</option>
              <option value="closed">已结清</option>
            </select>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="input-control w-auto"
            >
              <option value="all">全部学生</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={fetchLoans}
              className="btn btn-outline"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新
            </button>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建借款
          </button>
        </div>
      </div>

      {/* 贷款列表 */}
      <div className="card">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="badge badge-primary">贷款列表</span>
          <span className="text-xs text-gray-500">共 {filtered.length} 条 · 利率按周复利</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无贷款记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">学生</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">借款时间</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">本金</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">周利率</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">当前欠款</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">待结利息</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300">已过周数</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300">合同</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300">状态</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((loan) => {
                  const stu = students.find((s) => s.id === loan.studentId);
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-800 dark:text-gray-100">{loan.studentName ?? '未知'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{loan.purpose}</div>
                        {stu && (
                          <Link
                            href={`/students/${stu.id}`}
                            className="text-[10px] text-purple-500 hover:underline"
                          >
                            查看信用档案 →
                          </Link>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{loan.borrowTime}</td>
                      <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 font-medium">{fmt(loan.principal)}</td>
                      <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">{pct(loan.weeklyInterestRate)}</td>
                      <td className="px-3 py-2 text-right text-red-600 dark:text-red-400 font-bold">{fmt(loan.currentDebt)}</td>
                      <td className="px-3 py-2 text-right text-amber-600 dark:text-amber-400">{fmt(loan.accruedInterest)}</td>
                      <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">{loan.elapsedWeeks}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => setViewLoan(loan)}
                          className={`text-xs underline hover:no-underline ${
                            loan.contractSigned
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                          title={loan.contractSigned ? `${loan.contractSigner} · ${loan.contractSignTime}` : '点击查看/补签合同'}
                        >
                          {loan.contractSigned ? '✓ 已签' : '未签 · 补签'}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`badge ${loan.status === 'active' ? 'badge-warning' : 'badge-success'}`}>
                          {loan.status === 'active' ? '进行中' : '已结清'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {loan.status === 'active' && (
                          <button
                            onClick={() => {
                              setRepayTarget(loan);
                              setRepayAmount(Math.ceil(loan.currentDebt));
                            }}
                            className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 mr-1"
                          >
                            还款
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(loan, loan.status === 'active')}
                          className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 新建借款弹窗（步骤1） */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </span>
              新建借款
            </h3>
            <p className="text-xs text-gray-500 mb-4">步骤 1/2 · 填写借款信息，创建后将进入合同签署</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">学生 *</label>
                <select
                  value={createForm.studentId}
                  onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                  className="input-control"
                  required
                >
                  <option value="">请选择学生</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}（默认利率 {pct(s.weeklyInterestRate ?? 0.025)}）</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">本金（积分）*</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={createForm.principal}
                    onChange={(e) => setCreateForm({ ...createForm, principal: Number(e.target.value) })}
                    className="input-control"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">周利率（%）*</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={createForm.weeklyInterestRate}
                    onChange={(e) => setCreateForm({ ...createForm, weeklyInterestRate: Number(e.target.value) })}
                    className="input-control"
                    placeholder="如 2.5 表示 2.5%"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">借款用途 *</label>
                <input
                  type="text"
                  value={createForm.purpose}
                  onChange={(e) => setCreateForm({ ...createForm, purpose: e.target.value })}
                  className="input-control"
                  placeholder="如 兑换玩具、置换平板"
                  required
                />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300">
                <strong>下一步：</strong>创建借款后将弹出仪式感合同页面，
                由学生本人或管理员代为手写签名，签署后可下载合同图片保存。
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-outline flex-1">取消</button>
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                  {submitting ? '创建中...' : '创建并签署合同'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 还款弹窗 */}
      {repayTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRepayTarget(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">还款 - {repayTarget.studentName}</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">当前欠款</span>
                <span className="text-red-600 dark:text-red-400 font-bold">{fmt(repayTarget.currentDebt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">其中利息</span>
                <span className="text-amber-600 dark:text-amber-400">{fmt(repayTarget.accruedInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">已还款次数</span>
                <span>{repayTarget.repayments.length} 次</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">还款金额</label>
              <input
                type="number"
                min={1}
                step={1}
                value={repayAmount}
                onChange={(e) => setRepayAmount(Number(e.target.value))}
                className="input-control"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setRepayAmount(Math.ceil(repayTarget.currentDebt))}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                >
                  全部还清 ({fmt(repayTarget.currentDebt)})
                </button>
                <button
                  onClick={() => setRepayAmount(Math.ceil(repayTarget.currentPrincipal))}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                >
                  仅还本金 ({fmt(repayTarget.currentPrincipal)})
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                还款将等额扣减学生现有积分（按科目从高到低扣）。
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRepayTarget(null)} className="btn btn-outline flex-1">取消</button>
              <button type="button" onClick={handleRepay} disabled={submitting} className="btn btn-primary flex-1">
                {submitting ? '处理中...' : '确认还款'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建借款后的合同签约弹窗（步骤2） */}
      {pendingLoan && pendingStudent && (
        <LoanContract
          loan={pendingLoan}
          student={pendingStudent}
          defaultSigner={createForm.signer || pendingStudent.name}
          onClose={() => {
            // 关闭即视为放弃签约（贷款已创建为未签状态）
            if (confirm('放弃签署合同？借款已创建为未签状态，可稍后补签。')) {
              setPendingLoan(null);
              setPendingStudent(null);
            }
          }}
          onSigned={handlePendingSigned}
        />
      )}

      {/* 查看已有合同/补签弹窗 */}
      {viewLoan && (
        <LoanContract
          loan={viewLoan}
          student={students.find((s) => s.id === viewLoan.studentId)}
          defaultSigner={viewLoan.contractSigner || students.find((s) => s.id === viewLoan.studentId)?.name || ''}
          existingSignature={viewLoan.contractSignature}
          readOnly={viewLoan.contractSigned}
          onClose={() => setViewLoan(null)}
          onSigned={handleViewSigned}
        />
      )}
    </div>
  );
}
