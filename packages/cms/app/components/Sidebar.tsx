'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PlayCircle,
  BookOpen,
  Tags,
  Settings,
  Globe,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Series', href: '/programs', icon: PlayCircle },
  { name: 'Episodes', href: '/lessons', icon: BookOpen },
  { name: 'Topics', href: '/topics', icon: Tags },
  { name: 'Public Catalog', href: '/catalog', icon: Globe },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 border-r border-slate-800 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-yellow-500">Chai Shorts CMS</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200
                          ${isActive
                            ? 'bg-slate-800 text-yellow-400 border-r-2 border-yellow-500'
                            : 'text-gray-400 hover:text-yellow-400 hover:bg-slate-800'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${isActive ? 'text-yellow-500' : 'text-gray-500 group-hover:text-yellow-500'
                            }`}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}