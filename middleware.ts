import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token');
  const pathname = request.nextUrl.pathname;
  
  const isAdminPath = pathname === '/student/admin' || pathname === '/admin';
  
  if (!token && isAdminPath) {
    const loginUrl = new URL('/student/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin', '/student/admin'] };
