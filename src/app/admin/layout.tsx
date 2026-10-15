'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { checkIsAdminAuthenticated } from '@/lib/authGuards';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, isLoggedIn, user, role } = useStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // /admin/login is the URL-accessible login page
  const isLoginPage =
    pathname === '/admin/login' || pathname.startsWith('/admin/login/');

  useEffect(() => {
    // If it's the login page, allow immediately without restrictions
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }

    // Always check if the admin is logged in
    const authed = checkIsAdminAuthenticated(isHydrated, isLoggedIn, user, role);

    if (authed) {
      setIsAuthorized(true);
    } else {
      // If not logged in, always go to landing page
      setIsAuthorized(false);
      router.replace('/');
    }
  }, [pathname, isHydrated, isLoggedIn, user, role, isLoginPage, router]);

  // If login page, render immediately
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If authorized as admin, render children
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Otherwise, render sleek verification state while navigating to landing page
  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      <div className="flex flex-col items-center gap-4 text-center">
        <TorqueLogo emblemSize={44} />
        <div className="flex items-center gap-2 text-xs text-white/50 font-mono mt-2">
          <div className="w-2 h-2 rounded-full bg-[#2DD4A0] animate-ping" />
          <span>Verifying administrator authorization...</span>
        </div>
      </div>
    </div>
  );
}
