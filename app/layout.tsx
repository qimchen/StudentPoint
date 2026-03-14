import React from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '学生积分管理系统',
  description: '家庭版学生积分管理系统，用于记录两个小朋友的学习积分和兑换情况。',
  icons: {
    icon: '/favicon.ico', // 可自行添加favicon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="max-w-6xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-3 md:mb-0">
              学生积分管理系统
            </h1>
            <p className="text-sm text-gray-500">
              记录成长 · 激励学习
            </p>
          </div>
          
          <nav className="flex gap-2 sm:gap-3 flex-wrap bg-white p-2 rounded-xl shadow-sm">
            <a href="/" className="btn btn-primary flex-1 sm:flex-none text-center">
              首页
            </a>
            <a href="/rules" className="btn btn-primary flex-1 sm:flex-none text-center">
              积分规则
            </a>
            <a href="/admin" className="btn btn-success flex-1 sm:flex-none text-center">
              管理后台
            </a>
          </nav>
        </header>
        
        <main className="mb-8">{children}</main>
        
        <footer className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
          <p>© {new Date().getFullYear()} 学生积分管理系统 | 家庭版</p>
        </footer>
      </body>
    </html>
  );
}