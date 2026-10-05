'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Car, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function OnboardingPage() {
  const router = useRouter();
  const { setRole } = useStore();

  const handleSelect = (selectedRole: 'owner' | 'washer') => {
    setRole(selectedRole);
    if (selectedRole === 'owner') {
      router.push('/auth/signup');
    } else {
      router.push('/washer/login');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Welcome to Torque Care
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            How will you use Torque Care?
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Personalize your experience in one tap.
          </p>
        </div>

        <div className="space-y-4 text-left">
          {/* Option 1: Car Owner */}
          <button
            onClick={() => handleSelect('owner')}
            className="w-full p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-600 transition-all shadow-xs group flex items-start gap-4 text-left active:scale-[0.99]"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shrink-0">
              🚗
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B132B] group-hover:text-blue-600 transition-colors">
                  I own a vehicle
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Add your car or bike, subscribe to daily washes, view morning photo proof, and book Sunday priority.
              </p>
            </div>
          </button>

          {/* Option 2: Washer Partner */}
          <button
            onClick={() => handleSelect('washer')}
            className="w-full p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-emerald-600 transition-all shadow-xs group flex items-start gap-4 text-left active:scale-[0.99]"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shrink-0">
              🧼
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B132B] group-hover:text-emerald-600 transition-colors">
                  I provide washing services
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                See your morning route, take fast Before & After proof photos, track weekly earnings, and request covered leaves.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
