'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { AuthProvider } from '../lib/auth';
import { api } from '../lib/api';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Globe,
  PlayCircle
} from 'lucide-react';
import Image from 'next/image';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, topicsRes] = await Promise.all([
          api.get('/programs', { params: { status: statusFilter || undefined, language: languageFilter || undefined, topicId: topicFilter || undefined } }),
          api.get('/topics')
        ]);
        setPrograms(programsRes.data);
        setTopics(topicsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, languageFilter, topicFilter]);

  const filteredPrograms = programs.filter((program: any) => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || program.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-success-900/30 text-success-400 border border-success-900/50';
      case 'SCHEDULED': return 'bg-warning-900/30 text-warning-400 border border-warning-900/50';
      case 'DRAFT': return 'bg-slate-800 text-gray-400 border border-slate-700';
      case 'ARCHIVED': return 'bg-red-900/30 text-red-400 border border-red-900/50';
      default: return 'bg-slate-800 text-gray-400 border border-slate-700';
    }
  };

  const getPosterUrl = (program: any) => {
    const asset = program.assets?.find((a: any) =>
      a.assetType === 'poster' &&
      a.variant === 'PORTRAIT' &&
      a.language === program.languagePrimary
    );
    return asset?.url || 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  return (
    <AuthProvider>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Series</h1>
              <p className="text-gray-400">Manage your short-form series</p>
            </div>
            <Link href="/programs/new" className="btn-primary flex items-center gap-x-2">
              <Plus className="h-4 w-4" />
              Create Series
            </Link>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search series..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled Drop</option>
                    <option value="PUBLISHED">Live</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="sm:w-48">
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Languages</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div className="sm:w-48">
                  <select
                    value={topicFilter}
                    onChange={(e) => setTopicFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Topics</option>
                    {topics.map((topic: any) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Programs Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading series...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-gray-400 mb-4">
                <PlayCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No series found</h3>
              <p className="text-gray-400 mb-6">
                Get started by creating your first series.
              </p>
              <Link href="/programs/new" className="btn-primary inline-flex items-center gap-x-2">
                <Plus className="h-4 w-4" />
                Create Series
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPrograms.map((program: any) => (
                <div key={program.id} className="card overflow-hidden hover:border-yellow-500/50 transition-colors duration-200">
                  <div className="aspect-[2/3] relative w-full bg-slate-800">
                    <Image
                      src={getPosterUrl(program)}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold backdrop-blur-sm ${getStatusColor(program.status)}`}>
                        {program.status === 'PUBLISHED' ? 'Live' : program.status === 'SCHEDULED' ? 'Scheduled Drop' : program.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900">
                    <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                      {program.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="flex items-center text-xs text-gray-400">
                        <Globe className="h-3 w-3 mr-1" />
                        {program.languagePrimary}
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(program.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-800 mt-3">
                      <div className="flex space-x-2">
                        <Link href={`/programs/${program.id}`} className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-slate-800 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                        </Link>
                        {/* 
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-slate-800 rounded transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        */}
                      </div>
                      <Link
                        href={`/programs/${program.id}`}
                        className="flex items-center text-sm text-yellow-500 hover:text-yellow-400 font-medium"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </AuthProvider>
  );
}