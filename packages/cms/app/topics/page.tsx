'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { AuthProvider } from '../lib/auth';
import { api } from '../lib/api';
import {
    Plus,
    Search,
    Tags,
    Edit,
    Trash2,
    Calendar
} from 'lucide-react';

export default function TopicsPage() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/topics');
                setTopics(response.data);
            } catch (error) {
                console.error('Failed to fetch topics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredTopics = topics.filter((topic: any) => {
        return topic.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <AuthProvider>
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Topics</h1>
                            <p className="text-gray-400">Manage program categories and topics</p>
                        </div>
                        <button className="btn-primary flex items-center gap-x-2">
                            <Plus className="h-4 w-4" />
                            Create Topic
                        </button>
                    </div>

                    <div className="card p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10 w-full md:w-1/2"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                            <p className="text-gray-400 mt-4">Loading topics...</p>
                        </div>
                    ) : filteredTopics.length === 0 ? (
                        <div className="card p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Tags className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No topics found</h3>
                            <p className="text-gray-400 mb-6">
                                {searchTerm ? 'Try adjusting your search.' : 'Create your first topic to get started.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredTopics.map((topic: any) => (
                                <div key={topic.id} className="card p-4 hover:border-slate-700 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <span className="p-2 bg-slate-800 text-primary-500 rounded-lg mr-3 border border-slate-700">
                                                <Tags className="h-5 w-5" />
                                            </span>
                                            <h3 className="text-lg font-semibold text-white">{topic.name}</h3>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-slate-800 rounded transition-colors">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-slate-800 rounded transition-colors">
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
