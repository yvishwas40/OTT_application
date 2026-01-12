'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { AuthProvider } from '../lib/auth';
import { api } from '../lib/api';
import {
    Globe,
    Search,
    ExternalLink
} from 'lucide-react';
import Image from 'next/image';

export default function CatalogPage() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/programs', {
                    params: { status: 'PUBLISHED' }
                });
                setPrograms(response.data);
            } catch (error) {
                console.error('Failed to fetch catalog:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredPrograms = programs.filter((program: any) => {
        return program.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Public Catalog</h1>
                            <p className="text-gray-400">View your published content as it appears to users</p>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search catalog..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-10 w-full md:w-1/2 text-white bg-slate-900 border-slate-700"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                            <p className="text-gray-400 mt-4">Loading catalog...</p>
                        </div>
                    ) : filteredPrograms.length === 0 ? (
                        <div className="card p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Globe className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No published content</h3>
                            <p className="text-gray-400 mb-6">
                                Publish some programs to see them here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredPrograms.map((program: any) => (
                                <div key={program.id} className="card overflow-hidden hover:border-primary-500/50 transition-colors duration-200">
                                    <div className="aspect-[2/3] relative w-full">
                                        <Image
                                            src={getPosterUrl(program)}
                                            alt={program.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-success-900/80 text-success-400 backdrop-blur-sm border border-success-500/30">
                                                LIVE
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900">
                                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                                            {program.title}
                                        </h3>

                                        <div className="flex justify-between items-center pt-3 border-t border-slate-800 mt-3">
                                            <div className="text-xs text-gray-400">
                                                {program.languagePrimary}
                                            </div>
                                            <Link
                                                href={`/programs/${program.id}`}
                                                className="flex items-center text-sm text-primary-500 hover:text-primary-400 font-medium"
                                            >
                                                View Details <ExternalLink className="ml-1 h-3 w-3" />
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
