/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/utils/axios';
import { 
  Check, 
  X, 
  FileText, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface Borrower {
  _id: string;
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: string;
  salarySlipPath?: string;
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
  createdAt: string;
}

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAppliedLoans = async () => {
    try {
      const response = await api.get('/sanctions/applied');
      const data = response.data?.data || [];
      setLoans(data);
      setSelectedLoan(null);
    } catch (err: unknown) {
      console.error('Failed to fetch sanction data', err);
      setError('Could not retrieve pending sanction applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliedLoans();
  }, []);

  const handleDecision = async (id: string, decision: 'approve' | 'reject') => {
    setIsActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/sanctions/${id}/${decision}`, { reason });
      setSuccess(`Loan application successfully ${decision === 'approve' ? 'approved' : 'rejected'}!`);
      setReason('');
      await fetchAppliedLoans();
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || `Failed to process decision.`);
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
          Sanction Desk
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Review applied loans and make approval or rejection decisions.
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
        {/* Loans List Table */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden self-start">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Pending Applications
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
              {loans.length} Pending
            </span>
          </div>

          {loans.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No pending loan applications to evaluate.
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
                          <span className="text-xs text-zinc-500 truncate block max-w-xs">
                            {loan.borrowerId?.user?.email}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="block font-bold text-zinc-800 dark:text-zinc-200">
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

        {/* Selected Application Evaluation Card */}
        <div className="lg:col-span-5">
          {!selectedLoan ? (
            <div className="h-full border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center rounded-2xl flex flex-col items-center justify-center text-zinc-500">
              <ShieldCheck className="h-12 w-12 mb-4 text-zinc-400" />
              <p className="text-sm font-semibold">Select an application from the list to evaluate.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                Evaluation Details
              </h2>

              {/* Borrower details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Borrower Profile
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-zinc-500">Name</span>
                    <span className="font-semibold text-zinc-850 dark:text-zinc-200">{selectedLoan.borrowerId.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">PAN</span>
                    <span className="font-semibold text-zinc-850 dark:text-zinc-200 uppercase">{selectedLoan.borrowerId.pan}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Salary</span>
                    <span className="font-semibold text-zinc-850 dark:text-zinc-200">₹{selectedLoan.borrowerId.monthlySalary.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Employment</span>
                    <span className="font-semibold text-zinc-850 dark:text-zinc-200">{selectedLoan.borrowerId.employmentMode}</span>
                  </div>
                </div>

                {selectedLoan.borrowerId.salarySlipPath && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl flex items-center border border-zinc-200 dark:border-zinc-800 text-xs">
                    <FileText className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" />
                    <span className="truncate flex-1 font-medium text-zinc-600 dark:text-zinc-400">
                      Salary Slip File Attached
                    </span>
                    <a 
                      href={`${api.defaults.baseURL?.replace('/api/v1', '')}/${selectedLoan.borrowerId.salarySlipPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      View File
                    </a>
                  </div>
                )}
              </div>

              {/* Loan Configuration */}
              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Configured Terms
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-zinc-500">Requested Principal</span>
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">₹{selectedLoan.loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Tenure</span>
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{selectedLoan.tenureDays} Days</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Simple Interest</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">₹{selectedLoan.simpleInterest.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Total Repayment</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">₹{selectedLoan.totalRepayment.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Decision Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                  Review Reason / Comments
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide approval sanction parameters or rejection causes..."
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all h-20 resize-none"
                />

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleDecision(selectedLoan._id, 'reject')}
                    disabled={isActionLoading}
                    className="flex justify-center items-center py-3 px-4 border border-zinc-300 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Loan
                  </button>
                  <button
                    onClick={() => handleDecision(selectedLoan._id, 'approve')}
                    disabled={isActionLoading}
                    className="flex justify-center items-center py-3 px-4 border border-transparent bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Loan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
