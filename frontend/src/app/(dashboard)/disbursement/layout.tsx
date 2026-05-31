'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DisbursementLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['DISBURSEMENT', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}
