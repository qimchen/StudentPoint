'use client';
import { login } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  async function handleSubmit(e) {
    e.preventDefault();
    const pwd = e.target.pwd.value;
    if (await login(pwd)) router.push('/admin');
    else alert('密码错误');
  }

  return (
    <div className="card">
      <h1 className="text-xl font-bold mb-3">管理员登录</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="pwd" type="password" placeholder="密码" className="w-full p-2 border rounded" />
        <button className="btn btn-primary w-full">登录</button>
      </form>
    </div>
  );
}