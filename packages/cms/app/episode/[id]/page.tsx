'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ViewerHeader } from '../../components/ViewerHeader';
import { api } from '../../lib/api';
import { ArrowLeft, Play, Clock, Globe, Lock, Subtitles } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  lessonNumber: number;
  durationMs: number;
  isPaid: boolean;
  contentType: string;
  contentLanguagePrimary: string;
  contentLanguagesAvailable: string[];
  contentUrlsByLanguage: Record<string, string>;
  subtitleLanguages: string[];
  subtitleUrlsByLanguage: Record<string, string>;
  term?: {
    termNumber: number;
    program?: {
      id: string;
      title: string;
    };
  };
}

export default function EpisodePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('');
  const [videoError, setVideoError] = useState<string>('');

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await api.get(`/catalog/lessons/${episodeId}`);
        const data = response.data;
        setEpisode(data);
        
        // Set default language
        if (data.contentLanguagePrimary) {
          setSelectedLanguage(data.contentLanguagePrimary);
        } else if (data.contentLanguagesAvailable?.length > 0) {
          setSelectedLanguage(data.contentLanguagesAvailable[0]);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setVideoError('Episode not found or not published');
        } else {
          setVideoError('Failed to load episode');
        }
        console.error('Failed to fetch episode:', error);
      } finally {
        setLoading(false);
      }
    };

    if (episodeId) {
      fetchEpisode();
    }
  }, [episodeId]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVideoUrl = () => {
    if (!episode || !selectedLanguage) return '';
    return episode.contentUrlsByLanguage?.[selectedLanguage] || '';
  };

  const getSubtitleUrl = () => {
    if (!episode || !selectedSubtitle) return '';
    return episode.subtitleUrlsByLanguage?.[selectedSubtitle] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <ViewerHeader />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-slate-800 rounded-lg mb-6" />
            <div className="h-8 bg-slate-800 rounded w-1/2 mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!episode || videoError) {
    return (
      <div className="min-h-screen bg-slate-950">
        <ViewerHeader />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {videoError || 'Episode not found'}
          </h2>
          {episode?.term?.program && (
            <Link
              href={`/series/${episode.term.program.id}`}
              className="text-yellow-500 hover:text-yellow-400"
            >
              Back to Series
            </Link>
          )}
        </div>
      </div>
    );
  }

  const videoUrl = getVideoUrl();

  return (
    <div className="min-h-screen bg-slate-950">
      <ViewerHeader />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {episode.term?.program && (
          <Link
            href={`/series/${episode.term.program.id}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {episode.term.program.title}
          </Link>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Episode {episode.lessonNumber}: {episode.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDuration(episode.durationMs)}
              </span>
              {episode.isPaid && (
                <span className="flex items-center gap-2 text-yellow-500">
                  <Lock className="h-4 w-4" />
                  Premium Episode
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg overflow-hidden mb-6">
            <div className="aspect-video bg-black relative">
              {videoUrl ? (
                <video
                  key={videoUrl}
                  controls
                  className="w-full h-full"
                  crossOrigin="anonymous"
                >
                  <source src={videoUrl} type="video/mp4" />
                  {selectedSubtitle && getSubtitleUrl() && (
                    <track
                      kind="subtitles"
                      srcLang={selectedSubtitle}
                      src={getSubtitleUrl()}
                      default
                    />
                  )}
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Video URL not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {episode.contentLanguagesAvailable?.length > 1 && (
              <div className="bg-slate-900 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {episode.contentLanguagesAvailable.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {episode.subtitleLanguages?.length > 0 && (
              <div className="bg-slate-900 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Subtitles className="h-4 w-4 inline mr-2" />
                  Subtitles
                </label>
                <select
                  value={selectedSubtitle}
                  onChange={(e) => setSelectedSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">None</option>
                  {episode.subtitleLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
