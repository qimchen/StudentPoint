'use client';
import React, { useEffect } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import { login, isLoggedIn } from '../../lib/auth';

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const searchParams = useSearchParams();

  // 检查登录状态
  useEffect(() => {
    const checkLogin = async () => {
      if (await isLoggedIn()) {
        redirect('/admin');
      }
    };
    checkLogin();

    // 处理URL错误参数
    if (searchParams.get('error')) {
      setError('密码错误，请重试（默认密码：admin123）');
    }
  }, [searchParams]);

  // 处理登录提交
  const handleLogin = async (formData: FormData) => {
    'use server';
    setLoading(true);
    setError('');
    try {
      const pwd = (formData.get('pwd') as string) || '';
      const ok = await login(pwd);
      if (ok) {
        redirect('/admin');
      } else {
        redirect('/login?error=1');
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">管理员登录</h1>
          <p className="text-sm text-gray-500">请输入密码进入管理后台</p>
        </div>
        
        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}
        
        <form action={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="pwd" className="block text-sm font-medium text-gray-700 mb-1">
              登录密码
            </label>
            <input
              id="pwd"
              name="pwd"
              type="password"
              placeholder="请输入密码（默认：admin123）"
              className="input-control"
              required
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full py-2.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner mr-2"></span>
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>
        
        <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <p className="text-center">
            首次使用默认密码为 <span className="font-mono text-blue-600">admin123</span>
          </p>
          <p className="text-center mt-1">
            登录后可在管理后台修改密码（需扩展密码修改功能）
          </p>
        </div>
      </div>
    </div>
  );
}