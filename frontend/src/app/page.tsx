'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  Calculator, 
  Sparkles,
  Loader2
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Real-time calculator state for the landing page hero card
  const [loanAmount, setLoanAmount] = useState(25000);
  const [tenureDays, setTenureDays] = useState(30);

  const interestRate = 12; // 12% Fixed SI
  const simpleInterest = Math.round(((loanAmount * interestRate * tenureDays) / (365 * 100)) * 100) / 100;
  const totalRepayment = Math.round((loanAmount + simpleInterest) * 100) / 100;

  useEffect(() => {
    if (!loading && user) {
      // Auto-redirect authenticated users to their dashboard
      const role = user.role;
      if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'BORROWER') {
        router.push('/borrower/profile');
      } else if (role === 'SANCTION') {
        router.push('/sanction');
      } else if (role === 'DISBURSEMENT') {
        router.push('/disbursement');
      } else if (role === 'COLLECTION') {
        router.push('/collection');
      }
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans text-zinc-900 dark:text-zinc-50 relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-950/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-500/10 dark:bg-violet-950/10 blur-[130px] pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Loan Management System
          </span>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/30">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" />
            Next-Gen Lending Protocol
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-zinc-950 dark:text-zinc-50">
            Instant digital loans,{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              zero friction.
            </span>
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0">
            Antigravity Loans provides simple, transparent borrowing with a flat 12% per annum simple interest rate. Secure, automated validation under 3 minutes.
          </p>

          {/* Key Eligibility Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 pt-4">
            <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <span className="block text-xs text-zinc-500">Employment Mode</span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Salaried & Self-Employed</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <span className="block text-xs text-zinc-500">Age Requirements</span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">23 to 50 Years Old</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 group"
            >
              Apply For Loan
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              Member Sign In
            </Link>
          </div>
        </div>

        {/* Live Interest Calculator Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto relative">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center space-x-3 text-zinc-800 dark:text-zinc-200 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <Calculator className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold">Interactive Calculator</h2>
            </div>

            {/* Principal Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Loan Amount</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">₹{loanAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Tenure Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tenure (Days)</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{tenureDays} Days</span>
              </div>
              <input
                type="range"
                min="7"
                max="365"
                step="1"
                value={tenureDays}
                onChange={(e) => setTenureDays(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-zinc-50/50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Interest Rate</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">12% Per Annum</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Interest Accrued</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">₹{simpleInterest.toLocaleString('en-IN')}</span>
              </div>
              <hr className="border-zinc-200 dark:border-zinc-800" />
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Total Repayment</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-lg">
                  ₹{totalRepayment.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Link 
              href="/register" 
              className="w-full inline-flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10"
            >
              Get This Loan
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 space-y-4 sm:space-y-0">
          <span>&copy; 2026 Loan Management System. All rights reserved.</span>
          <span className="flex space-x-4">
            <span className="hover:text-zinc-800 dark:hover:text-zinc-100 cursor-pointer">Privacy</span>
            <span>&middot;</span>
            <span className="hover:text-zinc-800 dark:hover:text-zinc-100 cursor-pointer">Terms</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
