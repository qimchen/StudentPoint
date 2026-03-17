'use server';
import { redirect } from 'next/navigation';
import { login } from '../../lib/auth';

export async function handleLogin(formData: FormData) {
  const pwd = (formData.get('pwd') as string) || '';
  const ok = await login(pwd);
  if (ok) {
    redirect('/student/admin');
  } else {
    redirect('/student/login?error=1');
  }
}
