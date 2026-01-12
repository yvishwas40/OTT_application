'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { LogIn, User } from 'lucide-react';

export function ViewerHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-yellow-500">Chai Shorts</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'ADMIN' || user.role === 'EDITOR' ? (
                  <Link
                    href="/cms"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    CMS
                  </Link>
                ) : null}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors border border-yellow-500/50 rounded-lg hover:bg-yellow-500/10"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
