'use client';

import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { AuthProvider } from '../lib/auth';
import { api } from '../lib/api';
import {
  PlayCircle,
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Edit
} from 'lucide-react';

interface DashboardStats {
  totalPrograms: number;
  totalLessons: number;
  scheduledLessons: number;
  publishedLessons: number;
  recentPrograms: any[];
  recentLessons: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalLessons: 0,
    scheduledLessons: 0,
    publishedLessons: 0,
    recentPrograms: [],
    recentLessons: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [programsRes, lessonsRes] = await Promise.all([
          api.get('/programs'),
          api.get('/lessons'),
        ]);

        const programs = programsRes.data;
        const lessons = lessonsRes.data;

        setStats({
          totalPrograms: programs.length,
          totalLessons: lessons.length,
          scheduledLessons: lessons.filter((l: any) => l.status === 'SCHEDULED').length,
          publishedLessons: lessons.filter((l: any) => l.status === 'PUBLISHED').length,
          recentPrograms: programs.slice(0, 5),
          recentLessons: lessons.slice(0, 5),
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      name: 'Total Series',
      value: stats.totalPrograms,
      icon: PlayCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
    },
    {
      name: 'Total Episodes',
      value: stats.totalLessons,
      icon: BookOpen,
      color: 'text-success-400',
      bg: 'bg-success-900/20',
    },
    {
      name: 'Scheduled Drops',
      value: stats.scheduledLessons,
      icon: Clock,
      color: 'text-warning-400',
      bg: 'bg-warning-900/20',
    },
    {
      name: 'Published Episodes',
      value: stats.publishedLessons,
      icon: TrendingUp,
      color: 'text-success-400',
      bg: 'bg-success-900/20',
    },
  ];

  return (
    <AuthProvider>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Chai Shorts content management dashboard</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div key={stat.name} className="card p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bg} rounded-lg p-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                    <p className="text-2xl font-semibold text-white">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Series */}
            <div className="card">
              <div className="px-6 py-4 border-b border-slate-800">
                <h3 className="text-lg font-medium text-white">Recent Series</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : stats.recentPrograms.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No series yet</div>
                ) : (
                  stats.recentPrograms.map((program) => (
                    <div key={program.id} className="p-6 hover:bg-slate-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-100">{program.title}</p>
                          <p className="text-sm text-gray-400">
                            {program.languagePrimary} • {program.terms?.length || 0} seasons
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`status-${program.status.toLowerCase()}`}>
                            {program.status === 'PUBLISHED' ? 'Live' : program.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Episodes */}
            <div className="card">
              <div className="px-6 py-4 border-b border-slate-800">
                <h3 className="text-lg font-medium text-white">Recent Episodes</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : stats.recentLessons.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No episodes yet</div>
                ) : (
                  stats.recentLessons.map((lesson) => (
                    <div key={lesson.id} className="p-6 hover:bg-slate-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-100">{lesson.title}</p>
                          <p className="text-sm text-gray-400">
                            {lesson.term?.program?.title} • {lesson.contentType}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`status-${lesson.status.toLowerCase()}`}>
                            {lesson.status === 'PUBLISHED' ? 'Dropped' : lesson.status === 'SCHEDULED' ? 'Scheduled Drop' : lesson.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="/cms/programs/new"
                className="flex items-center gap-x-3 rounded-lg border border-slate-700 p-4 hover:bg-slate-800 transition-colors group"
              >
                <PlayCircle className="h-6 w-6 text-yellow-500 group-hover:text-yellow-400" />
                <span className="font-medium text-gray-200 group-hover:text-white">Create Series</span>
              </a>
              <a
                href="/cms/lessons/new"
                className="flex items-center gap-x-3 rounded-lg border border-slate-700 p-4 hover:bg-slate-800 transition-colors group"
              >
                <BookOpen className="h-6 w-6 text-success-500 group-hover:text-success-400" />
                <span className="font-medium text-gray-200 group-hover:text-white">Add Episode</span>
              </a>
              <a
                href="/topics"
                className="flex items-center gap-x-3 rounded-lg border border-slate-700 p-4 hover:bg-slate-800 transition-colors group"
              >
                <Users className="h-6 w-6 text-warning-500 group-hover:text-warning-400" />
                <span className="font-medium text-gray-200 group-hover:text-white">Manage Topics</span>
              </a>
              <a
                href="/catalog"
                className="flex items-center gap-x-3 rounded-lg border border-slate-700 p-4 hover:bg-slate-800 transition-colors group"
              >
                <Eye className="h-6 w-6 text-gray-400 group-hover:text-gray-300" />
                <span className="font-medium text-gray-200 group-hover:text-white">View Catalog</span>
              </a>
            </div>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  );
}