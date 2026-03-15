import { NextResponse } from 'next/server';
import { setValue } from '@/lib/kv';
import type { Config } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { newPassword } = await request.json();
    
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ success: false, message: '密码长度至少4位' });
    }
    
    const config: Config = { password: newPassword };
    await setValue('config', config);
    
    return NextResponse.json({ success: true, message: '密码修改成功' });
  } catch {
    return NextResponse.json({ success: false, message: '修改失败' });
  }
}
