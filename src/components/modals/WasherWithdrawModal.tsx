'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Landmark, CheckCircle2, ShieldCheck, X, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function WasherWithdrawModal({ isOpen, onClose }: Props) {
  const { washerEarnings, withdrawEarnings } = useStore();
  const [amount, setAmount] = useState<number>(washerEarnings.available);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const fee = 10;
  const net = Math.max(0, amount - fee);

  const handleWithdraw = () => {
    if (amount <= 0 || amount > washerEarnings.available) return;
    const ok = withdrawEarnings(amount);
    if (ok) {
      setSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="bg-[#0B132B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Direct Payout Transfer
              </h3>
              <p className="text-xs text-slate-300">
                Instant IMPS to your verified bank
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {!success ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Withdrawal Amount
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    max={washerEarnings.available}
                    min={100}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-transparent font-extrabold text-3xl text-[#0B132B] focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/70">
                  <span>Available Balance: ₹{washerEarnings.available}</span>
                  <button
                    onClick={() => setAmount(washerEarnings.available)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Destination Bank</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-blue-600" /> HDFC Bank (•••• {washerEarnings.bank_account_last4})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Processing Fee (Instant IMPS)</span>
                  <span className="font-medium text-slate-800">₹{fee}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between font-bold text-sm">
                  <span className="text-[#0B132B]">You&apos;ll Receive</span>
                  <span className="text-emerald-700 text-base">₹{net}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit encrypted banking rails. Zero delay payout.</span>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={amount <= 0 || amount > washerEarnings.available}
                className="w-full py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-all"
              >
                [ Withdraw ₹{amount} Now ]
              </button>
            </div>
          ) : (
            <div className="text-center py-5 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ Transfer Initiated
                </span>
                <h4 className="text-2xl font-extrabold text-[#0B132B] mt-2">
                  ₹{net}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Sent to HDFC Bank •••• {washerEarnings.bank_account_last4} via IMPS. Reference #TXN-994821.
                </p>
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-[#0B132B] text-white text-xs font-bold"
              >
                Return to Wallet
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
