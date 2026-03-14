import React from 'react';
import { redirect } from 'next/navigation';
import { login, isLoggedIn } from '../../lib/auth';

/**
 * 处理登录表单提交。
 * @param {FormData} formData 表单数据
 * @returns {Promise<void>} 无返回
 */
async function handleLogin(formData: FormData): Promise<void> {
  'use server';
  const pwd = (formData.get('pwd') as string) || '';
  const ok = await login(pwd);
  if (ok) {
    redirect('/admin');
  } else {
    redirect('/login?error=1');
  }
}

export default function LoginPage(): React.JSX.Element {
  if (isLoggedIn()) {
    redirect('/admin');
  }

  return (
    <div className="card max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-3 text-center">管理员登录</h1>
      <form action={handleLogin} className="space-y-3">
        <input
          name="pwd"
          type="password"
          placeholder="请输入密码（默认：admin123）"
          className="w-full p-2 border rounded text-sm md:text-base"
          required
        />
        <button className="btn btn-primary w-full text-sm md:text-base">
          登录
        </button>
      </form>
      <p className="mt-2 text-xs text-gray-500 text-center md:text-sm">
        首次使用默认密码为 <span className="font-mono">admin123</span>，登录后可在管理后台修改。
      </p>
    </div>
  );
}