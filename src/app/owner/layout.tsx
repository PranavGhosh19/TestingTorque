'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { checkIsOwnerAuthenticated } from '@/lib/authGuards';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, isLoggedIn, user, role } = useStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Authentication entry routes (owner login page)
  const isLoginRoute =
    pathname === '/owner/login' || pathname.startsWith('/owner/login/');

  useEffect(() => {
    // If it's the owner login page, allow access
    if (isLoginRoute) {
      setIsAuthorized(true);
      return;
    }

    // Always check if the car owner is logged in
    const authed = checkIsOwnerAuthenticated(isHydrated, isLoggedIn, user, role);

    if (authed) {
      setIsAuthorized(true);
    } else {
      // If not logged in, always go to landing page
      setIsAuthorized(false);
      router.replace('/');
    }
  }, [pathname, isHydrated, isLoggedIn, user, role, isLoginRoute, router]);

  // If on login page, render immediately
  if (isLoginRoute) {
    return <>{children}</>;
  }

  // If authorized as owner, render children
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
          <span>Verifying owner authorization...</span>
        </div>
      </div>
    </div>
  );
}
