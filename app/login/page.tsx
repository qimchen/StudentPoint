'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn } from '../../lib/auth';
import { handleLogin } from '../../lib/actions/login';

function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkLogin = async () => {
      if (await isLoggedIn()) {
        router.push('/student/admin');
      }
    };
    checkLogin();

    if (searchParams.get('error')) {
      setError('密码错误，请重试');
    }
  }, [searchParams, router]);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');
    try {
      await handleLogin(formData);
    } catch (err) {
      setError('登录失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-2">管理员登录</h1>
        <p className="text-sm text-gray-500">请输入密码进入管理后台</p>
      </div>
      
      {error && (
        <div className="alert alert-error mb-6 animate-bounce-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      
      <form action={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="pwd" className="block text-sm font-medium text-gray-700 mb-2">
            登录密码
          </label>
          <div className="relative">
            <input
              id="pwd"
              name="pwd"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              className="input-control pr-12"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary w-full py-3 text-base"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-spinner"></div>
              <span>登录中...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              登录
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">首次使用提示</p>
            <p className="text-xs text-gray-500 mt-1">
              默认密码为 <code className="px-1.5 py-0.5 bg-white rounded text-blue-600 font-mono">admin123</code>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              登录后可在管理后台修改密码
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="card animate-fade-in">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="loading-spinner w-8 h-8 mb-4"></div>
        <p className="text-gray-500">加载中...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoadingFallback />}>
          <LoginForm />
        </Suspense>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
