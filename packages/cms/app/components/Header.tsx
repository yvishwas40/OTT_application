'use client';

import { useAuth } from '../lib/auth';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-800 bg-slate-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {user && (
            <div className="flex items-center gap-x-3">
              <div className="flex items-center gap-x-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-white">{user.email}</span>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-900/30 text-yellow-400 rounded border border-yellow-900/50">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-x-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}