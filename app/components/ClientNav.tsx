'use client';
import React from 'react';

function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const basePath = window.location.pathname.startsWith('/student') ? '/student' : '';
    window.location.href = basePath + href;
  };
  
  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export default function ClientNav() {
  return (
    <nav className="flex gap-2 sm:gap-3 flex-wrap mt-4 pt-4 border-t border-gray-200">
      <NavLink href="/" className="btn btn-primary flex-1 sm:flex-none text-center group">
        <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        首页
      </NavLink>
      <NavLink href="/rules" className="btn btn-outline flex-1 sm:flex-none text-center group">
        <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        积分规则
      </NavLink>
      <NavLink href="/admin" className="btn btn-success flex-1 sm:flex-none text-center group">
        <svg className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        管理后台
      </NavLink>
    </nav>
  );
}
