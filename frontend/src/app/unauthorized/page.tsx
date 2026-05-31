'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center font-sans text-zinc-900 dark:text-zinc-50">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">
            Access Denied
          </h1>
          <p className="text-sm text-zinc-650 dark:text-zinc-400">
            Your authenticated staff role does not possess the credentials to access this dashboard partition.
          </p>
        </div>
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-650 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Workspace
        </Link>
      </div>
    </div>
  );
}
