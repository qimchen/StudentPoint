import React from 'react';
import Link from 'next/link';
import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import ThemeToggle from './components/ThemeToggle';
import MobileNav from './components/MobileNav';

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
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="max-w-6xl mx-auto px-4 py-6 min-h-screen pb-24 md:pb-6">
        <ThemeProvider>
          <header className="mb-8">
            <div className="glass-card mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg animate-float">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">学生积分管理系统</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">记录成长 · 激励学习</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
              
              <nav className="hidden md:flex gap-2 sm:gap-3 flex-wrap mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/" className="btn btn-primary flex-1 sm:flex-none text-center group">
                  <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  首页
                </Link>
                <Link href="/rules" className="btn btn-outline flex-1 sm:flex-none text-center group">
                  <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  积分规则
                </Link>
                <Link href="/admin" className="btn btn-success flex-1 sm:flex-none text-center group">
                  <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  管理后台
                </Link>
              </nav>
            </div>
          </header>
          
          <main className="mb-8">{children}</main>
          
          <footer className="text-center text-sm text-gray-500 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700 hidden md:block">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <p>© {new Date().getFullYear()} 学生积分管理系统 | 家庭版</p>
              <span className="hidden md:inline text-gray-300 dark:text-gray-600">|</span>
              <p className="text-xs text-gray-400">陈姝淼 & 陈书辰 专属</p>
            </div>
          </footer>
          
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
