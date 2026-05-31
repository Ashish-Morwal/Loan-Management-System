'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BorrowerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['BORROWER']}>
      {children}
    </ProtectedRoute>
  );
}
