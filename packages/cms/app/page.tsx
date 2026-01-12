'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ViewerHeader } from './components/ViewerHeader';
import { api } from './lib/api';
import { PlayCircle, Clock, Globe } from 'lucide-react';
import Image from 'next/image';

interface Series {
  id: string;
  title: string;
  description: string;
  languagePrimary: string;
  assets?: Array<{
    id: string;
    url: string;
    variant: string;
    language: string;
    assetType: string;
  }>;
  terms?: Array<{
    lessons: Array<{
      id: string;
    }>;
  }>;
}

export default function OTTHomePage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await api.get('/catalog/programs');
        setSeries(response.data.items || []);
      } catch (error) {
        console.error('Failed to fetch series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  const getPosterUrl = (seriesItem: Series) => {
    const asset = seriesItem.assets?.find(
      (a) => a.assetType === 'poster' && a.variant === 'PORTRAIT' && a.language === seriesItem.languagePrimary
    );
    return asset?.url || 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const getEpisodeCount = (seriesItem: Series) => {
    return seriesItem.terms?.reduce((total, term) => total + (term.lessons?.length || 0), 0) || 0;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <ViewerHeader />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Browse Series</h2>
          <p className="text-gray-400">Discover short-form content</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-16">
            <PlayCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No series available</h3>
            <p className="text-gray-400">Check back soon for new content</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {series.map((seriesItem) => (
              <Link
                key={seriesItem.id}
                href={`/series/${seriesItem.id}`}
                className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 hover:scale-105 transition-transform duration-200"
              >
                <Image
                  src={getPosterUrl(seriesItem)}
                  alt={seriesItem.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                      {seriesItem.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {seriesItem.languagePrimary}
                      </span>
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />
                        {getEpisodeCount(seriesItem)} episodes
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
