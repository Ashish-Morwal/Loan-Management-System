'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['COLLECTION', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}
