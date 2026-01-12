'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ViewerHeader } from '../../components/ViewerHeader';
import { api } from '../../lib/api';
import { ArrowLeft, PlayCircle, Clock, Globe, Lock } from 'lucide-react';
import Image from 'next/image';

interface Episode {
  id: string;
  title: string;
  lessonNumber: number;
  durationMs: number;
  isPaid: boolean;
  contentType: string;
}

interface Series {
  id: string;
  title: string;
  description: string;
  languagePrimary: string;
  languagesAvailable: string[];
  assets?: Array<{
    id: string;
    url: string;
    variant: string;
    language: string;
    assetType: string;
  }>;
  terms?: Array<{
    id: string;
    termNumber: number;
    title: string;
    lessons: Episode[];
  }>;
}

export default function SeriesDetailPage() {
  const params = useParams();
  const seriesId = params.id as string;
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await api.get(`/catalog/programs/${seriesId}`);
        setSeries(response.data);
      } catch (error) {
        console.error('Failed to fetch series:', error);
      } finally {
        setLoading(false);
      }
    };

    if (seriesId) {
      fetchSeries();
    }
  }, [seriesId]);

  const getPosterUrl = () => {
    if (!series) return '';
    const asset = series.assets?.find(
      (a) => a.assetType === 'poster' && a.variant === 'PORTRAIT' && a.language === series.languagePrimary
    );
    return asset?.url || 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <ViewerHeader />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-slate-800 rounded-lg mb-6" />
            <div className="h-8 bg-slate-800 rounded w-1/3 mb-4" />
            <div className="h-4 bg-slate-800 rounded w-2/3 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-800 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-slate-950">
        <ViewerHeader />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Series not found</h2>
          <Link href="/" className="text-yellow-500 hover:text-yellow-400">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const allEpisodes = series.terms?.flatMap((term) =>
    term.lessons.map((lesson) => ({ ...lesson, season: term.termNumber }))
  ) || [];

  return (
    <div className="min-h-screen bg-slate-950">
      <ViewerHeader />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800">
              <Image
                src={getPosterUrl()}
                alt={series.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-4">{series.title}</h1>
            
            <div className="flex items-center gap-4 mb-6 text-gray-400">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {series.languagePrimary}
              </span>
              <span className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                {allEpisodes.length} Episodes
              </span>
            </div>

            {series.description && (
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {series.description}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Episodes</h2>
          
          {allEpisodes.length === 0 ? (
            <p className="text-gray-400">No episodes available yet</p>
          ) : (
            <div className="space-y-2">
              {allEpisodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/episode/${episode.id}`}
                  className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-yellow-500 font-bold group-hover:bg-yellow-500/20 transition-colors">
                    {episode.lessonNumber}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1 truncate group-hover:text-yellow-400 transition-colors">
                      {episode.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(episode.durationMs)}
                      </span>
                      {episode.isPaid && (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Lock className="h-3 w-3" />
                          Premium
                        </span>
                      )}
                      {!episode.isPaid && (
                        <span className="text-green-400">Free</span>
                      )}
                    </div>
                  </div>

                  <PlayCircle className="h-6 w-6 text-gray-400 group-hover:text-yellow-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
