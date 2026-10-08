'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { checkIsWasherAuthenticated } from '@/lib/authGuards';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function WasherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, isLoggedIn, user, role } = useStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Authentication entry routes (login, first-time password set, otp verification)
  const isAuthRoute =
    pathname === '/washer/login' ||
    pathname.startsWith('/washer/login/') ||
    pathname.startsWith('/washer/auth') ||
    pathname === '/washer/set-password' ||
    pathname.startsWith('/washer/set-password/');

  useEffect(() => {
    // If it's a login or auth setup page, allow access
    if (isAuthRoute) {
      setIsAuthorized(true);
      return;
    }

    // Always check if the washer partner is logged in
    const authed = checkIsWasherAuthenticated(isHydrated, isLoggedIn, user, role);

    if (authed) {
      setIsAuthorized(true);
    } else {
      // If not logged in, always go to landing page
      setIsAuthorized(false);
      router.replace('/');
    }
  }, [pathname, isHydrated, isLoggedIn, user, role, isAuthRoute, router]);

  // If on login or auth setup page, render immediately
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // If authorized as washer partner, render children
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
          <span>Verifying partner authorization...</span>
        </div>
      </div>
    </div>
  );
}
