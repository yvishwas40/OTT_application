'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CMSLayout } from '../../components/CMSLayout';
import { api } from '../../lib/api';
import {
    Plus,
    Search,
    BookOpen,
    Edit,
    Trash2,
    Calendar,
    Globe,
    Video,
    FileText
} from 'lucide-react';

export default function CMSLessonsPage() {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/lessons', {
                    params: {
                        status: statusFilter || undefined
                    }
                });
                setLessons(response.data);
            } catch (error) {
                console.error('Failed to fetch lessons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [statusFilter]);

    const filteredLessons = lessons.filter((lesson: any) => {
        const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || lesson.status === statusFilter;
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

    const getContentTypeIcon = (type: string) => {
        return type === 'VIDEO' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
    };

    return (
        <CMSLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Episodes</h1>
                        <p className="text-gray-400">Manage your short-form episodes</p>
                    </div>
                    <Link href="/cms/lessons/new" className="btn-primary flex items-center gap-x-2">
                        <Plus className="h-4 w-4" />
                        Create Episode
                    </Link>
                </div>

                <div className="card p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="Search episodes..."
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
                                    <option value="PUBLISHED">Dropped</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                        <p className="text-gray-400 mt-4">Loading episodes...</p>
                    </div>
                ) : filteredLessons.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <BookOpen className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No episodes found</h3>
                        <p className="text-gray-400 mb-6">
                            {searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Create your first episode to get started.'}
                        </p>
                        <Link href="/cms/lessons/new" className="btn-primary inline-flex items-center gap-x-2">
                            <Plus className="h-4 w-4" />
                            Create Episode
                        </Link>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <ul className="divide-y divide-slate-800">
                            {filteredLessons.map((lesson: any) => (
                                <li key={lesson.id}>
                                    <div className="px-4 py-4 sm:px-6 hover:bg-slate-800 transition-colors flex items-center justify-between">
                                        <div className="flex items-center min-w-0 flex-1">
                                            <div className="flex-shrink-0 mr-4 text-gray-400">
                                                {getContentTypeIcon(lesson.contentType)}
                                            </div>
                                            <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-500 truncate">{lesson.title}</p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-400">
                                                        <Globe className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" />
                                                        <span className="truncate">{lesson.contentLanguagePrimary}</span>
                                                    </p>
                                                </div>
                                                <div className="hidden md:block">
                                                    <div>
                                                        <p className="text-sm">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                                                                {lesson.status === 'PUBLISHED' ? 'Dropped' : lesson.status === 'SCHEDULED' ? 'Scheduled Drop' : lesson.status}
                                                            </span>
                                                        </p>
                                                        {lesson.publishedAt && (
                                                            <p className="mt-2 flex items-center text-sm text-gray-400">
                                                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" />
                                                                Dropped on {new Date(lesson.publishedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-5 flex-shrink-0 flex space-x-2">
                                            <Link
                                                href={`/cms/lessons/${lesson.id}`}
                                                className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-slate-700 rounded-full transition-colors"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </CMSLayout>
    );
}
