import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import ClientNav from './components/ClientNav';

export const metadata: Metadata = {
  title: '学生积分管理系统',
  description: '家庭版学生积分管理系统，用于记录两个小朋友的学习积分和兑换情况。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="max-w-6xl mx-auto px-4 py-6 min-h-screen">
        <header className="mb-8">
          <div className="glass-card mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">学生积分管理系统</h1>
                  <p className="text-sm text-gray-500">记录成长 · 激励学习</p>
                </div>
              </div>
            </div>
            
            <ClientNav />
          </div>
        </header>
        
        <main className="mb-8">{children}</main>
        
        <footer className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2">
            <p>© {new Date().getFullYear()} 学生积分管理系统 | 家庭版</p>
            <span className="hidden md:inline text-gray-300">|</span>
            <p className="text-xs text-gray-400">陈姝淼 & 陈书辰 专属</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
