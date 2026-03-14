'use server';
import { cookies } from 'next/headers';
import { getValue, setValue } from './kv';
import type { Config } from './types';

/**
 * 管理员登录校验。
 * @param {string} password 输入的密码
 * @returns {Promise<boolean>} 是否登录成功
 */
export async function login(password: string): Promise<boolean> {
  const config = await getValue<Config>('config', { password: 'admin123' });
  if (config.password === password) {
    cookies().set('admin_token', 'logged_in', { maxAge: 30 * 24 * 60 * 60 });
    return true;
  }
  return false;
}

/**
 * 修改管理员密码。
 * @param {string} newPwd 新密码
 * @returns {Promise<boolean>} 是否修改成功
 */
export async function updatePassword(newPwd: string): Promise<boolean> {
  const next: Config = { password: newPwd };
  await setValue('config', next);
  return true;
}

/**
 * 校验当前是否已登录。
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn(): boolean {
  return cookies().has('admin_token');
}

/**
 * 登出管理员。
 * @returns {void} 无返回
 */
export function logout(): void {
  cookies().delete('admin_token');
}