'use client';

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-400/20 dark:bg-violet-900/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-10 px-6 sm:px-10 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
