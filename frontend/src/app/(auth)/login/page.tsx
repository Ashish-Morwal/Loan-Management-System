'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import api from '@/utils/axios';
import { AuthResponse } from '@/types/auth';
import { AlertCircle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      
      const { token, user } = response.data.data;
      
      // Update local storage and context
      login(token, user);

      // Perform role-based routing
      const role = user.role;
      if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'BORROWER') {
        router.push('/borrower/profile');
      } else if (role === 'SANCTION') {
        router.push('/sanction');
      } else if (role === 'DISBURSEMENT') {
        router.push('/disbursement');
      } else if (role === 'COLLECTION') {
        router.push('/collection');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      console.error(err);
      let message = 'Login failed. Please check your credentials.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">
          Sign In
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Access your loan dashboard or staff console.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`block w-full px-4 py-3 rounded-xl border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 ${
              errors.email
                ? 'border-red-300 focus:ring-red-500'
                : 'border-zinc-300 dark:border-zinc-700'
            }`}
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={`block w-full px-4 py-3 rounded-xl border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all duration-200 ${
              errors.password
                ? 'border-red-300 focus:ring-red-500'
                : 'border-zinc-300 dark:border-zinc-700'
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Logging in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">New borrower? </span>
        <Link 
          href="/register" 
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
