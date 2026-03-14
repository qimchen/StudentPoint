import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '学生积分管理系统' };

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="max-w-4xl mx-auto p-3">
        <nav className="flex gap-3 mb-5 flex-wrap">
          <a href="/" className="btn btn-primary">首页</a>
          <a href="/rules" className="btn btn-primary">积分规则</a>
          <a href="/admin" className="btn btn-success">管理后台</a>
        </nav>
        {children}
      </body>
    </html>
  );
}