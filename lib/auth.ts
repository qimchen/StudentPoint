'use server';
import { cookies } from 'next/headers';
import { db } from './kv';

// 登录校验
export async function login(password: string) {
  const config = await db.get('config');
  if (config?.password === password) {
    cookies().set('admin_token', 'logged_in', { maxAge: 30 * 24 * 60 * 60 });
    return true;
  }
  return false;
}

// 修改密码
export async function updatePassword(newPwd: string) {
  await db.set('config', { password: newPwd });
  return true;
}

// 校验登录状态
export function isLoggedIn() {
  return cookies().has('admin_token');
}

// 登出
export function logout() {
  cookies().delete('admin_token');
}