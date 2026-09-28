import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-slate-100 flex flex-col relative -mb-16 md:mb-0">
      <div className="fixed inset-0 bg-[#080D1A] -z-30 pointer-events-none" />
      {children}
    </div>
  );
}
