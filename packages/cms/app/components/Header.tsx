'use client';

import { useAuth } from '../lib/auth';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {user && (
            <div className="flex items-center gap-x-3">
              <div className="flex items-center gap-x-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{user.email}</span>
                <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
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