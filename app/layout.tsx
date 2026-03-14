import React from 'react';
import './globals.css';
import type { Metadata } from 'next';

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
      <body className="max-w-5xl mx-auto px-3 py-4">
        <header className="mb-4">
          <nav className="flex gap-2 sm:gap-3 mb-3 flex-wrap text-sm md:text-base">
            <a href="/" className="btn btn-primary">
              首页
            </a>
            <a href="/rules" className="btn btn-primary">
              积分规则
            </a>
            <a href="/admin" className="btn btn-success">
              管理后台
            </a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}