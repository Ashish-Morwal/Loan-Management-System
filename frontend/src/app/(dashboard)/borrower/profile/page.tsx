'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import api from '@/utils/axios';
import { 
  FileText, 
  PlusCircle, 
  Briefcase, 
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  XCircle,
  CheckCircle2
} from 'lucide-react';

interface BorrowerProfile {
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: string;
  salarySlipPath?: string;
}

interface Loan {
  _id: string;
  loanAmount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  outstandingAmount: number;
  status: 'APPLIED' | 'SANCTIONED' | 'DISBURSED' | 'REJECTED' | 'CLOSED';
  createdAt: string;
}

export default function BorrowerProfilePage() {
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Borrower Profile
        try {
          const profileRes = await api.get('/borrowers/me');
          setProfile(profileRes.data?.data || null);
        } catch (profileErr: unknown) {
          if (axios.isAxiosError(profileErr) && profileErr.response?.status === 404) {
            setProfile(null); // No profile created yet
          } else {
            throw profileErr;
          }
        }

        // 2. Fetch Borrower Loans
        const loansRes = await api.get('/loans/me');
        setLoans(loansRes.data?.data || []);
      } catch (err: unknown) {
        console.error('Failed to load dashboard data', err);
        setError('Failed to load dashboard statistics. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: Loan['status']) => {
    switch (status) {
      case 'APPLIED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
            <Clock className="h-3 w-3 mr-1" />
            Applied
          </span>
        );
      case 'SANCTIONED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Sanctioned
          </span>
        );
      case 'DISBURSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Disbursed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
            Closed
          </span>
        );
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
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Borrower Profile
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Monitor your loan applications and repayment schedules.
          </p>
        </div>
        {profile && (
          <Link
            href="/borrower/apply"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all space-x-2"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Apply for New Loan</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {!profile ? (
        /* Empty Profile Invitation Panel */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center rounded-2xl shadow-sm space-y-6">
          <div className="h-16 w-16 bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto">
            <PlusCircle className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Create Your Borrower Profile
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              To apply for loans, you first need to establish your borrowing profile and verify your financial criteria. It takes less than 3 minutes.
            </p>
          </div>
          <Link
            href="/borrower/apply"
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/10 transition-all"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Profile Details Card */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6 self-start">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              Profile Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Full Name</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{profile.fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">PAN</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">{profile.pan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Date of Birth</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {new Date(profile.dob).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Net Salary</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{profile.monthlySalary.toLocaleString('en-IN')}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Employment Mode</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{profile.employmentMode}</span>
              </div>
            </div>

            {profile.salarySlipPath && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate flex-1">
                  Salary slip uploaded
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">
                  Verified
                </span>
              </div>
            )}
          </div>

          {/* Active / Prior Loans Table */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Loan Applications
              </h2>
              <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-600 dark:text-zinc-400 font-medium">
                {loans.length} Total
              </span>
            </div>

            {loans.length === 0 ? (
              <div className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
                <Briefcase className="h-10 w-10 text-zinc-400" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No active applications</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    You haven&apos;t requested any loans yet. Click the button above to configure your first application.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Requested Amt
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Tenure
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Total Repay
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Outstanding
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {loans.map((loan) => (
                      <tr key={loan._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-zinc-900 dark:text-zinc-100">
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
      )}
    </div>
  );
}

// Inline helper to resolve the missing arrow import in Lucide
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
