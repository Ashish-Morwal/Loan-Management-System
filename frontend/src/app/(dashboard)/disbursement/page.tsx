/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/utils/axios';
import { 
  DollarSign, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

interface Borrower {
  _id: string;
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: string;
  user: {
    name: string;
    email: string;
  };
}

interface Loan {
  _id: string;
  borrowerId: Borrower;
  loanAmount: number;
  tenureDays: number;
  simpleInterest: number;
  totalRepayment: number;
  status: string;
  reason?: string;
  createdAt: string;
}

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSanctionedLoans = async () => {
    try {
      const response = await api.get('/disbursements/sanctioned');
      const data = response.data?.data || [];
      setLoans(data);
      setSelectedLoan(null);
    } catch (err: unknown) {
      console.error('Failed to fetch disbursement data', err);
      setError('Could not retrieve sanctioned applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSanctionedLoans();
  }, []);

  const handleDisburse = async (id: string) => {
    setIsActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/disbursements/${id}/disburse`);
      setSuccess('Loan capital successfully disbursed to borrower account!');
      await fetchSanctionedLoans();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to process disbursement.');
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
          Disbursement Desk
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Verify sanction parameters and disburse capital to approved borrowers.
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
        {/* Table of sanctioned loans */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden self-start">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Sanctioned Applications
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
              {loans.length} Awaiting Payout
            </span>
          </div>

          {loans.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No sanctioned loans currently awaiting disbursement.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {loans.map((loan) => {
                    const isSelected = selectedLoan?._id === loan._id;
                    return (
                      <tr 
                        key={loan._id}
                        onClick={() => setSelectedLoan(loan)}
                        className={`cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                          isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {loan.borrowerId?.fullName || 'Unknown'}
                          </div>
                          <span className="text-xs text-zinc-500 block">
                            Sanction Reason: {loan.reason || 'None provided'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="block font-bold text-zinc-850 dark:text-zinc-200">
                            ₹{loan.loanAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-xs text-zinc-500">{loan.tenureDays} Days</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected evaluation detail card */}
        <div className="lg:col-span-5">
          {!selectedLoan ? (
            <div className="h-full border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center rounded-2xl flex flex-col items-center justify-center text-zinc-500">
              <DollarSign className="h-12 w-12 mb-4 text-zinc-400" />
              <p className="text-sm font-semibold">Select a sanctioned loan to process disbursement.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                Disbursement Payout
              </h2>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Borrower Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-zinc-500">Name</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedLoan.borrowerId.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">PAN</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">{selectedLoan.borrowerId.pan}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Financial Terms
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-zinc-500">Principal Disbursing</span>
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-lg">₹{selectedLoan.loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Tenure Term</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedLoan.tenureDays} Days</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-zinc-500">Sanction Comments</span>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      {selectedLoan.reason || 'No comments provided during sanction.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => handleDisburse(selectedLoan._id)}
                  disabled={isActionLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Disbursing Funds...
                    </>
                  ) : (
                    <>
                      Disburse Loan Capital
                      <ArrowUpRight className="ml-1.5 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
