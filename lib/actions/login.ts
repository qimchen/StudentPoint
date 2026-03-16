'use server';
import { login } from '../../lib/auth';

export async function handleLogin(formData: FormData): Promise<{ success: boolean; redirect?: string }> {
  const pwd = (formData.get('pwd') as string) || '';
  const ok = await login(pwd);
  if (ok) {
    return { success: true, redirect: '/admin' };
  } else {
    return { success: false, redirect: '/login?error=1' };
  }
}
