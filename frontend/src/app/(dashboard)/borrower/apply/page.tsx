/* eslint-disable react-hooks/incompatible-library */
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/utils/axios';
import { 
  User, 
  FileText, 
  Sliders, 
  CheckCircle, 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  AlertCircle,
  Clock
} from 'lucide-react';

// Form validation schemas
const step1Schema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format (e.g. ABCDE1234F)'),
    dob: z.string().min(1, 'Date of birth is required').refine((val) => {
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 23 && age <= 50;
    }, 'Age must be between 23 and 50 years to be eligible'),
    monthlySalary: z.number().min(25000, 'Monthly salary must be at least 25,000 to be eligible'),
    employmentMode: z.enum(['Salaried', 'SelfEmployed', 'Unemployed']),
  })
  .refine((data) => data.employmentMode !== 'Unemployed', {
    message: 'Unemployed borrowers are not eligible for loans',
    path: ['employmentMode'],
  });

const step3Schema = z.object({
  loanAmount: z.number().min(1000, 'Minimum loan amount is 1,000'),
  tenureDays: z.number().min(7, 'Minimum tenure is 7 days'),
});

type Step1Input = z.infer<typeof step1Schema>;
type Step3Input = z.infer<typeof step3Schema>;

interface WizardState {
  step: number;
  personalDetails: Step1Input;
  salarySlipPath: string | null;
  salarySlipName: string | null;
  loanConfig: Step3Input;
  hasProfile: boolean;
}

const defaultWizardState: WizardState = {
  step: 1,
  personalDetails: {
    fullName: '',
    pan: '',
    dob: '',
    monthlySalary: 25000,
    employmentMode: 'Salaried',
  },
  salarySlipPath: null,
  salarySlipName: null,
  loanConfig: {
    loanAmount: 10000,
    tenureDays: 30,
  },
  hasProfile: false,
};

export default function ApplyPage() {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(defaultWizardState);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Sync state with sessionStorage and fetch existing database profile
  useEffect(() => {
    const loadInitialData = async () => {
      let initialWizardState = defaultWizardState;
      const cached = sessionStorage.getItem('loan_wizard_state');
      if (cached) {
        try {
          initialWizardState = JSON.parse(cached);
        } catch (e) {
          console.error('Failed to parse cached state', e);
        }
      }

      try {
        const response = await api.get('/borrowers/me');
        if (response.data?.data) {
          const profile = response.data.data;
          
          // Format Date of Birth for input date format (yyyy-MM-dd)
          let formattedDob = '';
          if (profile.dob) {
            formattedDob = new Date(profile.dob).toISOString().split('T')[0];
          }

          initialWizardState = {
            ...initialWizardState,
            personalDetails: {
              fullName: profile.fullName || '',
              pan: profile.pan || '',
              dob: formattedDob,
              monthlySalary: profile.monthlySalary || 25000,
              employmentMode: profile.employmentMode || 'Salaried',
            },
            salarySlipPath: profile.salarySlipPath || null,
            hasProfile: true,
          };
        }
      } catch (err: unknown) {
        // A 404 is normal for first-time profile creation, so only log unexpected issues
        if (axios.isAxiosError(err) && err.response?.status !== 404) {
          console.error('Failed to retrieve borrower profile', err);
        }
      } finally {
        setState(initialWizardState);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Save wizard state to sessionStorage whenever it changes
  const updateState = (updated: Partial<WizardState>) => {
    setState((prev) => {
      const next = { ...prev, ...updated };
      sessionStorage.setItem('loan_wizard_state', JSON.stringify(next));
      return next;
    });
  };

  // Step Forms Initialization
  const {
    register: registerS1,
    handleSubmit: handleSubmitS1,
    formState: { errors: errorsS1 },
  } = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),
    values: state.personalDetails,
  });

  const {
    register: registerS3,
    handleSubmit: handleSubmitS3,
    watch: watchS3,
    formState: { errors: errorsS3 },
  } = useForm<Step3Input>({
    resolver: zodResolver(step3Schema),
    values: state.loanConfig,
  });

  // Watch values for real-time computations in Step 3
  const loanAmountWatch = watchS3('loanAmount') || 0;
  const tenureDaysWatch = watchS3('tenureDays') || 0;

  // Real-time computation formulas matching Simple Interest guidelines
  const simpleInterest = Math.round(((loanAmountWatch * 12 * tenureDaysWatch) / (365 * 100)) * 100) / 100;
  const totalRepayment = Math.round((loanAmountWatch + simpleInterest) * 100) / 100;

  // Transition: Step 1 (Personal Details) Submission
  const handleStep1Submit = async (data: Step1Input) => {
    setIsActionLoading(true);
    setError(null);
    try {
      if (state.hasProfile) {
        // Update existing profile
        await api.put('/borrowers/me', data);
      } else {
        // Create new profile
        await api.post('/borrowers', data);
      }
      updateState({
        step: 2,
        personalDetails: data,
        hasProfile: true,
      });
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to save profile details. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  // Transition: Step 2 (Salary Slip) Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsActionLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('salarySlip', file);

    try {
      const response = await api.post('/upload/salary-slip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.data?.salarySlipPath) {
        updateState({
          salarySlipPath: response.data.data.salarySlipPath,
          salarySlipName: file.name,
        });
        setSuccessMessage('Salary slip uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to upload salary slip.');
      } else {
        setError('An unexpected error occurred during upload.');
      }
    } finally {
      setIsActionLoading(false);
      // Reset input value to allow uploading the same file again if necessary
      e.target.value = '';
    }
  };

  const handleStep2Next = () => {
    if (!state.salarySlipPath) {
      setError('Please upload your salary slip before proceeding.');
      return;
    }
    setError(null);
    updateState({ step: 3 });
  };

  // Transition: Step 3 (Loan Config) Submission
  const handleStep3Submit = (data: Step3Input) => {
    updateState({
      step: 4,
      loanConfig: data,
    });
  };

  // Final Action: Step 4 Application Submission
  const handleFinalSubmit = async () => {
    setIsActionLoading(true);
    setError(null);

    try {
      const payload = {
        loanAmount: state.loanConfig.loanAmount,
        tenureDays: state.loanConfig.tenureDays,
      };

      await api.post('/loans', payload);
      
      // Clear wizard storage on success
      sessionStorage.removeItem('loan_wizard_state');
      setState(defaultWizardState);
      
      router.push('/borrower/profile?success=true');
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to submit loan application.');
      } else {
        setError('An unexpected error occurred during submission.');
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

  const steps = [
    { num: 1, name: 'Personal Details', icon: User },
    { num: 2, name: 'Salary Slip', icon: Upload },
    { num: 3, name: 'Loan Configuration', icon: Sliders },
    { num: 4, name: 'Review & Submit', icon: CheckCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Apply for a Loan
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Complete the 4-step wizard to submit your loan application.
        </p>
      </div>

      {/* Stepper visual progress bar */}
      <div className="mb-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = state.step > s.num;
            const isActive = state.step === s.num;

            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <span className={`block text-xs font-semibold uppercase tracking-wider ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'
                    }`}>
                      Step {s.num}
                    </span>
                    <span className={`block text-sm font-bold ${
                      isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {s.name}
                    </span>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className="hidden md:block h-6 w-6 text-zinc-300 dark:text-zinc-700" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start text-emerald-800 dark:text-emerald-300">
          <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Steps Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Step 1: Personal Details */}
        {state.step === 1 && (
          <form onSubmit={handleSubmitS1(handleStep1Submit)} className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              1. Personal & Employment Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  {...registerS1('fullName')}
                  className="block w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
                {errorsS1.fullName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorsS1.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  PAN Card Number
                </label>
                <input
                  type="text"
                  {...registerS1('pan')}
                  className="block w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 uppercase outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="ABCDE1234F"
                />
                {errorsS1.pan && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorsS1.pan.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...registerS1('dob')}
                  className="block w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
                <span className="block text-xs text-zinc-500 mt-1">Must be between 23 and 50 years old.</span>
                {errorsS1.dob && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorsS1.dob.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Monthly Net Salary (INR)
                </label>
                <input
                  type="number"
                  {...registerS1('monthlySalary', { valueAsNumber: true })}
                  className="block w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="30000"
                />
                <span className="block text-xs text-zinc-500 mt-1">Must be at least 25,000.</span>
                {errorsS1.monthlySalary && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorsS1.monthlySalary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Employment Mode
                </label>
                <select
                  {...registerS1('employmentMode')}
                  className="block w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                >
                  <option value="Salaried">Salaried</option>
                  <option value="SelfEmployed">Self Employed</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
                {errorsS1.employmentMode && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorsS1.employmentMode.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="submit"
                disabled={isActionLoading}
                className="flex items-center py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isActionLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Salary Slip Upload */}
        {state.step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              2. Upload Financial Verification
            </h2>

            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl p-10 text-center transition-all">
              <input
                type="file"
                id="salary-slip-upload"
                onChange={handleFileUpload}
                accept=".pdf,image/*"
                className="hidden"
                disabled={isActionLoading}
              />
              <label 
                htmlFor="salary-slip-upload"
                className="flex flex-col items-center cursor-pointer justify-center"
              >
                <div className="h-16 w-16 bg-indigo-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 hover:scale-105 transition-transform">
                  <Upload className="h-8 w-8" />
                </div>
                <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  Choose a file or drag it here
                </span>
                <span className="block text-xs text-zinc-500">
                  Accepts PDF or Image files up to 5MB.
                </span>
              </label>
            </div>

            {state.salarySlipPath && (
              <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/10">
                <div className="flex items-center min-w-0">
                  <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {state.salarySlipName || 'salary-slip.pdf'}
                    </p>
                    <span className="text-xs text-zinc-500 truncate block">
                      Saved Path: {state.salarySlipPath}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Verified
                </span>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => updateState({ step: 1 })}
                className="flex items-center py-2.5 px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <ChevronLeft className="mr-1 h-5 w-5" />
                Back
              </button>
              <button
                onClick={handleStep2Next}
                disabled={isActionLoading || !state.salarySlipPath}
                className="flex items-center py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isActionLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Loan Configuration */}
        {state.step === 3 && (
          <form onSubmit={handleSubmitS3(handleStep3Submit)} className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              3. Configure Loan Terms
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Requested Loan Amount (INR)
                </label>
                <input
                  type="number"
                  {...registerS3('loanAmount', { valueAsNumber: true })}
                  className="block w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="10000"
                />
                {errorsS3.loanAmount && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorsS3.loanAmount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tenure Days
                </label>
                <input
                  type="number"
                  {...registerS3('tenureDays', { valueAsNumber: true })}
                  className="block w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  placeholder="30"
                />
                {errorsS3.tenureDays && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorsS3.tenureDays.message}</p>
                )}
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
                Real-Time Computation (Interest rate: 12% per annum)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <span className="block text-xs text-zinc-500">Interest Accrued</span>
                  <span className="block text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    ₹{Number.isNaN(simpleInterest) ? '0.00' : simpleInterest.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500">Total Repayment Balance</span>
                  <span className="block text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    ₹{Number.isNaN(totalRepayment) ? '0.00' : totalRepayment.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500">Daily Accumulation</span>
                  <span className="block text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    ₹{Number.isNaN(simpleInterest) || tenureDaysWatch === 0 ? '0.00' : (Math.round((simpleInterest / tenureDaysWatch) * 100) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => updateState({ step: 2 })}
                className="flex items-center py-2.5 px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <ChevronLeft className="mr-1 h-5 w-5" />
                Back
              </button>
              <button
                type="submit"
                className="flex items-center py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all"
              >
                Next
                <ChevronRight className="ml-1 h-5 w-5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Review & Submit */}
        {state.step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              4. Review Application Summary
            </h2>

            <div className="space-y-6">
              {/* Profile Details Block */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-zinc-500">Name</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{state.personalDetails.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">PAN</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase">{state.personalDetails.pan}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">DOB</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{state.personalDetails.dob}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Salary</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">₹{state.personalDetails.monthlySalary.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Employment Mode</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{state.personalDetails.employmentMode}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded slip Block */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center">
                <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mr-4" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-300">Financial Verification</h3>
                  <p className="text-xs text-zinc-500 truncate max-w-sm sm:max-w-md">
                    Path: {state.salarySlipPath}
                  </p>
                </div>
                <span className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Uploaded
                </span>
              </div>

              {/* Loan Configuration Details Block */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
                  Loan Terms
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="block text-zinc-500">Principal</span>
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">₹{state.loanConfig.loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Tenure</span>
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{state.loanConfig.tenureDays} Days</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Simple Interest</span>
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">₹{simpleInterest.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500">Total Repayment</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">₹{totalRepayment.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60 p-3 rounded-xl">
                  <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span>
                    Your loan status will initially be recorded as <strong>APPLIED</strong>. Once submitted, it will be evaluated by the Sanction module.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => updateState({ step: 3 })}
                disabled={isActionLoading}
                className="flex items-center py-2.5 px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <ChevronLeft className="mr-1 h-5 w-5" />
                Back
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isActionLoading}
                className="flex items-center py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle className="ml-1.5 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
