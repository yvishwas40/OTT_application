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
      case 'PUBLISHED': return 'bg-success-100 text-success-700';
      case 'SCHEDULED': return 'bg-warning-100 text-warning-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'ARCHIVED': return 'bg-error-100 text-error-700';
      default: return 'bg-gray-100 text-gray-700';
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
              <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
              <p className="text-gray-600">Manage your educational programs</p>
            </div>
            <button className="btn-primary flex items-center gap-x-2">
              <Plus className="h-4 w-4" />
              Create Program
            </button>
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
                      placeholder="Search programs..."
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
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="PUBLISHED">Published</option>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading programs...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-gray-400 mb-4">
                <PlayCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Create your first program to get started.'}
              </p>
              {!searchTerm && !statusFilter && (
                <button className="btn-primary">
                  Create Program
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPrograms.map((program: any) => (
                <div key={program.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-w-3 aspect-h-4 relative">
                    <Image
                      src={getPosterUrl(program)}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(program.status)}`}>
                        {program.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                      {program.title}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>{program.languagePrimary}</span>
                      <span className="mx-2">•</span>
                      <span>{program.terms?.length || 0} terms</span>
                    </div>

                    {program.publishedAt && (
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Published {new Date(program.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/programs/${program.id}`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link 
                          href={`/programs/${program.id}`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                      <button className="p-1.5 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
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