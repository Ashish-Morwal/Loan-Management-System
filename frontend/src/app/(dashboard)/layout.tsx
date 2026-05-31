'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  LayoutDashboard, 
  User, 
  CheckSquare, 
  DollarSign, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  Briefcase
} from 'lucide-react';

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const SIDEBAR_LINKS: SidebarLink[] = [
  {
    name: 'Admin Panel',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['ADMIN'],
  },
  {
    name: 'My Profile',
    href: '/borrower/profile',
    icon: User,
    roles: ['BORROWER'],
  },
  {
    name: 'Apply for Loan',
    href: '/borrower/apply',
    icon: Briefcase,
    roles: ['BORROWER'],
  },
  {
    name: 'Sanction Desk',
    href: '/sanction',
    icon: CheckSquare,
    roles: ['SANCTION', 'ADMIN'],
  },
  {
    name: 'Disbursements',
    href: '/disbursement',
    icon: DollarSign,
    roles: ['DISBURSEMENT', 'ADMIN'],
  },
  {
    name: 'Collections',
    href: '/collection',
    icon: CreditCard,
    roles: ['COLLECTION', 'ADMIN'],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredLinks = SIDEBAR_LINKS.filter(
    (link) => user && link.roles.includes(user.role)
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Logo area */}
            <div className="flex items-center h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Loan Management System
              </span>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* User details at bottom */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.name}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
              {/* Close Button */}
              <div className="absolute top-0 right-0 -mr-12 pt-4">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-black/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Logo area */}
              <div className="flex items-center h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Loan Management System
                </span>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {filteredLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User details at bottom */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {user?.name}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex flex-col flex-1 min-h-screen md:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center ml-auto space-x-4">
              <span className="hidden sm:inline-block text-sm text-zinc-500 dark:text-zinc-400">
                Welcome back,
              </span>
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {user?.name}
              </span>
            </div>
          </header>

          {/* Main Dashboard Pages */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
