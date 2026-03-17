'use server';
import { redirect } from 'next/navigation';
import { login } from '../../lib/auth';

export async function handleLogin(formData: FormData) {
  const pwd = (formData.get('pwd') as string) || '';
  const ok = await login(pwd);
  if (ok) {
    redirect('/admin');
  } else {
    redirect('/login?error=1');
  }
}
