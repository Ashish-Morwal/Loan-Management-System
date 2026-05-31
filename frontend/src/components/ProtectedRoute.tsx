'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <div className="absolute h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content before redirect finishes
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
