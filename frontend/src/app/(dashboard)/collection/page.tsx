/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import api from '@/utils/axios';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Plus
} from 'lucide-react';

interface Borrower {
  fullName: string;
}

interface Loan {
  _id: string;
  borrowerId: Borrower;
  loanAmount: number;
  tenureDays: number;
  simpleInterest: number;
  totalRepayment: number;
  outstandingAmount: number;
  status: string;
}

interface Payment {
  _id: string;
  loanId: {
    borrowerId?: {
      fullName?: string;
    };
  };
  utrNumber: string;
  amount: number;
  paymentDate: string;
}

const paymentSchema = z.object({
  loanId: z.string().min(1, 'Please select a loan'),
  utrNumber: z.string().min(1, 'UTR number is required').toUpperCase(),
  amount: z.number().min(1, 'Payment amount must be at least 1'),
  paymentDate: z.string().min(1, 'Payment date is required'),
});

type PaymentInput = z.infer<typeof paymentSchema>;

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const fetchData = async () => {
    try {
      // 1. Fetch active loans (will filter on disbursed)
      const loansRes = await api.get('/loans');
      const allLoans = loansRes.data?.data || [];
      const active = allLoans.filter((l: Loan) => l.status === 'DISBURSED');
      setLoans(active);

      // 2. Fetch payments log
      const paymentsRes = await api.get('/collections');
      setPayments(paymentsRes.data?.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch data', err);
      setError('Could not retrieve collections logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setValue('loanId', loan._id);
  };

  const onSubmit = async (data: PaymentInput) => {
    setIsActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/collections', data);
      setSuccess('Payment collected successfully!');
      reset({
        loanId: '',
        utrNumber: '',
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      setSelectedLoan(null);
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to record payment.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsActionLoading(false);
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
          Collections Desk
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Monitor outstanding debt and record borrower repayment transactions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table of active loans */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden self-start">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Active Loans
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
              {loans.length} Disbursed
            </span>
          </div>

          {loans.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No active disbursed loans found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[400px] overflow-y-auto">
              {loans.map((loan) => {
                const isSelected = selectedLoan?._id === loan._id;
                return (
                  <div
                    key={loan._id}
                    onClick={() => handleSelectLoan(loan)}
                    className={`p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-650' : ''
                    }`}
                  >
                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {loan.borrowerId?.fullName || 'Borrower'}
                    </p>
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                      <span>Outstanding: ₹{loan.outstandingAmount.toLocaleString('en-IN')}</span>
                      <span>Total: ₹{loan.totalRepayment.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Record Repayment Form */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
              Collect Repayment
            </h2>

            {selectedLoan && (
              <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs space-y-1">
                <span className="block font-bold text-zinc-700 dark:text-zinc-300">Selected Loan Details:</span>
                <span className="block text-zinc-500">Borrower: {selectedLoan.borrowerId?.fullName}</span>
                <span className="block text-zinc-500">Remaining Balance: ₹{selectedLoan.outstandingAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Invisible loan ID field */}
              <input type="hidden" {...register('loanId')} />

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Unique Transaction Reference (UTR)
                </label>
                <input
                  type="text"
                  {...register('utrNumber')}
                  placeholder="UTR987654321"
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all uppercase"
                />
                {errors.utrNumber && (
                  <p className="mt-1 text-xs text-red-650">{errors.utrNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Repayment Amount (INR)
                </label>
                <input
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="2500"
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-650">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  {...register('paymentDate')}
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
                {errors.paymentDate && (
                  <p className="mt-1 text-xs text-red-650">{errors.paymentDate.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isActionLoading || !selectedLoan}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    Record Payment
                    <Plus className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Transactions log */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col self-start">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Repayment History
            </h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No repayment transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[400px] overflow-y-auto">
              {payments.map((pmt) => (
                <div key={pmt._id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {pmt.loanId?.borrowerId?.fullName || 'Borrower'}
                    </p>
                    <span className="block text-zinc-500 mt-1">UTR: {pmt.utrNumber}</span>
                    <span className="block text-zinc-400 mt-0.5">Date: {new Date(pmt.paymentDate).toLocaleDateString()}</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-450 text-sm">
                    +₹{pmt.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
