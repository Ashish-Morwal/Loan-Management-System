'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SanctionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SANCTION', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}
