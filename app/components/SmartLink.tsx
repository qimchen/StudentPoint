'use client';
import React from 'react';

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SmartLink({ href, children, className }: SmartLinkProps) {
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
