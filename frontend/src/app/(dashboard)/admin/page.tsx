'use client';

import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Loader2, 
  AlertCircle
} from 'lucide-react';

interface Loan {
  _id: string;
  borrowerId: {
    fullName: string;
  };
  loanAmount: number;
  tenureDays: number;
  totalRepayment: number;
  outstandingAmount: number;
  status: 'APPLIED' | 'SANCTIONED' | 'DISBURSED' | 'REJECTED' | 'CLOSED';
}

export default function AdminPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [borrowerCount, setBorrowerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const loansRes = await api.get('/loans');
        const loansList = loansRes.data?.data || [];
        setLoans(loansList);

        const borrowersRes = await api.get('/borrowers');
        setBorrowerCount(borrowersRes.data?.data?.length || 0);
      } catch (err: unknown) {
        console.error('Failed to load admin stats', err);
        setError('Failed to fetch system data. Verify staff roles in the database.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  // Compute metrics
  const totalPrincipal = loans.reduce((acc, curr) => acc + curr.loanAmount, 0);
  const totalOutstanding = loans.reduce((acc, curr) => acc + curr.outstandingAmount, 0);

  const getStatusBadge = (status: Loan['status']) => {
    switch (status) {
      case 'APPLIED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">Applied</span>;
      case 'SANCTIONED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">Sanctioned</span>;
      case 'DISBURSED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Disbursed</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">Rejected</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-800">Closed</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Admin Console
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Global analytics and operations logs of the system.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-zinc-500">Registered Borrowers</span>
            <span className="block text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">{borrowerCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-zinc-500">Total Applications</span>
            <span className="block text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">{loans.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-zinc-500">Total Sanctioned Principal</span>
            <span className="block text-xl font-extrabold text-zinc-900 dark:text-zinc-50">₹{totalPrincipal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs text-zinc-500">Total Outstanding Debt</span>
            <span className="block text-xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{totalOutstanding.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Main content table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            System Loans Overview
          </h2>
        </div>

        {loans.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No loan records found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tenure</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Repayable</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Outstanding</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-100">
                      {loan.borrowerId?.fullName || 'Unknown Borrower'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-zinc-800 dark:text-zinc-200">
                      ₹{loan.loanAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      {loan.tenureDays} Days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                      ₹{loan.totalRepayment.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-indigo-600 dark:text-indigo-400">
                      ₹{loan.outstandingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(loan.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
