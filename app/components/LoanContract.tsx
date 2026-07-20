'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Loan, Student } from '@/lib/types';
import { calcCurrentDebt, calcAccruedInterest, calcElapsedWeeks } from '@/lib/utils/loan';
import SignaturePad from './SignaturePad';

interface Props {
  loan: Loan;
  student?: Student;
  defaultSigner?: string;
  onClose: () => void;
  onSigned?: (signatureDataUrl: string, signerName: string) => Promise<void> | void;
  /** 已签署模式下用于展示已有签名（loan.contractSigned=true 时展示历史签名） */
  existingSignature?: string;
  readOnly?: boolean;
}

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n - Math.round(n)) < 0.005) return Math.round(n).toString();
  return n.toFixed(2);
};

const pct = (rate: number) => `${(rate * 100).toFixed(2)}%`;

/**
 * 仪式感借款合同组件
 * - 仿纸质合同视觉风格
 * - 展示完整条款
 * - 手写签名画板
 * - 签署后可下载合同图片保存
 */
export default function LoanContract({
  loan,
  student,
  defaultSigner = '',
  onClose,
  onSigned,
  existingSignature,
  readOnly = false,
}: Props) {
  const [signerName, setSignerName] = useState(defaultSigner || student?.name || '');
  const [signature, setSignature] = useState(existingSignature || '');
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(!!existingSignature || readOnly);
  const [now, setNow] = useState(Date.now());
  const contractRef = useRef<HTMLDivElement | null>(null);

  // 每分钟刷新一次实时欠款（签署时锁定显示）
  useEffect(() => {
    if (signed) return;
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, [signed]);

  const currentDebt = calcCurrentDebt(loan, now);
  const accruedInterest = calcAccruedInterest(loan, now);
  const elapsedWeeks = calcElapsedWeeks(loan, now);

  // 合同编号：loan-id 后六位 + 借款年份
  const contractNo = `${loan.id.slice(-6)}-${new Date(loan.borrowTimestamp).getFullYear()}`;

  const handleSign = useCallback(async () => {
    if (!signerName.trim()) {
      alert('请填写签署人姓名');
      return;
    }
    if (!signature) {
      alert('请完成手写签名');
      return;
    }
    setSubmitting(true);
    try {
      if (onSigned) {
        await onSigned(signature, signerName.trim());
      }
      setSigned(true);
    } finally {
      setSubmitting(false);
    }
  }, [signerName, signature, onSigned]);

  // 下载合同为图片：通过将合同 DOM 转为 SVG foreignObject -> canvas -> PNG
  const handleDownload = useCallback(async () => {
    const node = contractRef.current;
    if (!node) return;

    try {
      // 动态加载 html-to-image（按需加载，避免首屏 bundle 过大）
      const mod = await import('html-to-image');
      const dataUrl = await mod.toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#fffaf0',
        // 过滤掉下载按钮等不必要元素
        filter: (el) => {
          if (!(el instanceof HTMLElement)) return true;
          return !el.dataset?.contractExclude;
        },
      });
      const link = document.createElement('a');
      link.download = `借款合同-${student?.name ?? loan.studentId}-${loan.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('合同图片生成失败:', err);
      alert('合同图片生成失败，请重试');
    }
  }, [loan.id, loan.studentId, student?.name]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-4">
        {/* 合同卡片（要被导出为图片的部分） */}
        <div
          ref={contractRef}
          className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/10 rounded-2xl shadow-2xl border-4 border-double border-amber-700/40 dark:border-amber-500/30 overflow-hidden"
          style={{ fontFamily: '"STKaiti", "KaiTi", "楷体", serif' }}
        >
          {/* 合同头部：装饰横纹 + 标题 */}
          <div className="relative px-8 pt-8 pb-4 text-center border-b-2 border-amber-700/30 dark:border-amber-500/20">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-red-500 to-amber-600 opacity-60" />
            <div className="text-xs text-amber-700/70 dark:text-amber-400/70 mb-1 tracking-widest">
              STUDENT POINTS · LOAN CONTRACT
            </div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-200 tracking-wider">
              借 款 合 同
            </h1>
            <div className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-2">
              合同编号：<span className="font-mono">{contractNo}</span>
            </div>
            <div className="text-xs text-amber-700/60 dark:text-amber-400/60 mt-1">
              签订地：家庭 · 学习积分银行
            </div>
          </div>

          {/* 合同主体 */}
          <div className="px-8 py-6 space-y-5 text-amber-950 dark:text-amber-100">
            {/* 当事人信息 */}
            <section>
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">甲方（出借方）</div>
              <div className="text-base pl-4 border-l-2 border-amber-600/40 dark:border-amber-400/30">
                家庭学习积分银行（管理员代行）
              </div>
              <div className="text-sm font-semibold text-amber-800 dark:text-amber-300 mt-3 mb-2">乙方（借款方）</div>
              <div className="text-base pl-4 border-l-2 border-amber-600/40 dark:border-amber-400/30">
                姓名：<strong className="text-red-700 dark:text-red-400">{student?.name ?? loan.studentId}</strong>
                <span className="ml-4 text-sm text-amber-700/80 dark:text-amber-300/80">身份：学生</span>
              </div>
            </section>

            <div className="border-t border-dashed border-amber-700/30 dark:border-amber-500/20" />

            {/* 第一条 借款金额与用途 */}
            <section>
              <div className="font-semibold mb-2 text-amber-900 dark:text-amber-200">
                第一条　借款金额与用途
              </div>
              <p className="text-sm leading-relaxed pl-4">
                乙方向甲方借款积分 <strong className="text-red-700 dark:text-red-400 text-lg">{fmt(loan.principal)}</strong> 分，
                用于 <strong className="text-amber-900 dark:text-amber-200 underline decoration-dotted">{loan.purpose}</strong>。
                借款时间：<strong>{loan.borrowTime}</strong>。
              </p>
            </section>

            {/* 第二条 利率与计息 */}
            <section>
              <div className="font-semibold mb-2 text-amber-900 dark:text-amber-200">
                第二条　利率与计息方式
              </div>
              <p className="text-sm leading-relaxed pl-4">
                本借款按 <strong className="text-red-700 dark:text-red-400">周利率 {pct(loan.weeklyInterestRate)}</strong> 计息，
                采用 <strong>按周复利</strong> 方式计算：
              </p>
              <div className="bg-amber-100/60 dark:bg-amber-900/30 rounded-lg px-4 py-3 mt-2 text-center font-mono text-sm">
                欠款 = 本金 × (1 + 周利率)<sup>已过周数</sup>
              </div>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/70 mt-2 pl-4">
                * 越早还款，利息越少；逾期将按周累计复利。
              </p>
            </section>

            {/* 第三条 当前债务 */}
            <section>
              <div className="font-semibold mb-2 text-amber-900 dark:text-amber-200">
                第三条　当前债务状况
              </div>
              <div className="grid grid-cols-3 gap-3 pl-4">
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 text-center border border-amber-700/20 dark:border-amber-500/20">
                  <div className="text-xs text-amber-700/70 dark:text-amber-300/70">当前欠款</div>
                  <div className="text-xl font-bold text-red-700 dark:text-red-400 mt-1">{fmt(currentDebt)}</div>
                </div>
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 text-center border border-amber-700/20 dark:border-amber-500/20">
                  <div className="text-xs text-amber-700/70 dark:text-amber-300/70">其中利息</div>
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1">{fmt(accruedInterest)}</div>
                </div>
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 text-center border border-amber-700/20 dark:border-amber-500/20">
                  <div className="text-xs text-amber-700/70 dark:text-amber-300/70">已过周数</div>
                  <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">{elapsedWeeks}</div>
                </div>
              </div>
            </section>

            {/* 第四条 还款承诺 */}
            <section>
              <div className="font-semibold mb-2 text-amber-900 dark:text-amber-200">
                第四条　还款承诺
              </div>
              <p className="text-sm leading-relaxed pl-4">
                乙方承诺以现有学习积分和未来获取的积分按期归还本息。
                乙方知悉：积分可通过完成作业、考试优秀等方式获取；还款时按学科积分从高到低扣减。
              </p>
            </section>

            {/* 第五条 信用影响 */}
            <section>
              <div className="font-semibold mb-2 text-amber-900 dark:text-amber-200">
                第五条　信用影响
              </div>
              <p className="text-sm leading-relaxed pl-4">
                本合同及还款记录将纳入乙方信用档案。按时还款将提升信用评级（SSS / SS / A / B / C / D），
                逾期或欠款过多将降低评级，影响未来借款额度和利率优惠。
              </p>
            </section>

            {/* 第六条 教育意义 */}
            <section>
              <div className="font-semibold mb-2 text-amber-900 dark:text-amber-200">
                第六条　教育意义
              </div>
              <p className="text-sm leading-relaxed pl-4 italic">
                本合同旨在通过模拟金融借贷活动，帮助乙方建立正确的金钱观、信用观与责任意识，
                学会合理规划与延迟满足。每一次借款与还款都是成长的印记。
              </p>
            </section>

            <div className="border-t border-dashed border-amber-700/30 dark:border-amber-500/20" />

            {/* 签署区 */}
            <section className="pt-2">
              <div className="font-semibold mb-3 text-amber-900 dark:text-amber-200">签署区</div>
              <div className="grid grid-cols-2 gap-6">
                {/* 甲方 */}
                <div>
                  <div className="text-sm text-amber-700/80 dark:text-amber-300/80 mb-2">甲方（出借方）</div>
                  <div className="h-24 border border-amber-700/30 dark:border-amber-500/20 rounded-lg flex items-center justify-center bg-white/40 dark:bg-black/10">
                    <div className="text-center">
                      <div className="text-red-600 dark:text-red-400 text-2xl font-bold tracking-widest opacity-80" style={{ fontFamily: '"STKaiti", "KaiTi", serif' }}>
                        积分银行
                      </div>
                      <div className="text-xs text-amber-700/60 dark:text-amber-300/60 mt-1">（盖章）</div>
                    </div>
                  </div>
                  <div className="text-xs text-amber-700/70 dark:text-amber-300/70 mt-1">
                    签订日期：{loan.borrowTime.slice(0, 10)}
                  </div>
                </div>

                {/* 乙方 */}
                <div>
                  <div className="text-sm text-amber-700/80 dark:text-amber-300/80 mb-2">
                    乙方（借款方）
                    {signed && loan.contractSignTime && (
                      <span className="ml-2 text-xs text-amber-700/60 dark:text-amber-300/60">
                        已于 {loan.contractSignTime} 签署
                      </span>
                    )}
                  </div>
                  {signed ? (
                    <div className="h-24 border border-amber-700/30 dark:border-amber-500/20 rounded-lg flex items-center justify-center bg-white/40 dark:bg-black/10 overflow-hidden">
                      {signature ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={signature}
                          alt="签名"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-red-600 dark:text-red-400 text-2xl font-bold tracking-widest opacity-80" style={{ fontFamily: '"STKaiti", "KaiTi", serif' }}>
                          {loan.contractSigner || signerName}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-dashed border-amber-700/40 dark:border-amber-500/30 rounded-lg p-1 bg-white/60 dark:bg-black/10">
                      <SignaturePad
                        value={signature}
                        onChange={setSignature}
                        width={280}
                        height={90}
                        signerName={signerName || '学生'}
                      />
                    </div>
                  )}
                  <div className="text-xs text-amber-700/70 dark:text-amber-300/70 mt-1">
                    签署人：{signed ? (loan.contractSigner || signerName) : (
                      <input
                        type="text"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        placeholder="签署人姓名"
                        className="inline-block bg-transparent border-b border-amber-700/40 dark:border-amber-500/30 outline-none px-1 text-amber-900 dark:text-amber-200 w-24"
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 底部 */}
            <div className="text-center text-xs text-amber-700/60 dark:text-amber-300/50 pt-4 border-t border-amber-700/20 dark:border-amber-500/10">
              本合同一式两份，甲乙双方各执一份 · 自签署之日起生效
            </div>
          </div>
        </div>

        {/* 操作按钮区（不导出） */}
        <div className="flex flex-wrap items-center gap-3 mt-4 justify-center" data-contract-exclude>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            关闭
          </button>
          {!signed && (
            <button
              type="button"
              onClick={handleSign}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white font-semibold shadow-lg hover:from-red-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? '签署中...' : '✍️ 确认签署合同'}
            </button>
          )}
          {signed && (
            <>
              <button
                type="button"
                onClick={handleDownload}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                📥 下载合同图片
              </button>
              <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                合同已签署生效
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
