'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CMSLayout } from '../../../components/CMSLayout';
import { api } from '../../../lib/api';
import { ArrowLeft, Save, X, Tag } from 'lucide-react';

export default function CreateSeriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Topics state
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    languagePrimary: 'en',
    languagesAvailable: ['en'],
    posterUrl: '', // Portrait
    landscapePosterUrl: '' // Landscape
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await api.get('/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }

      if (!formData.languagePrimary) {
        setError('Primary language is required');
        setLoading(false);
        return;
      }

      if (selectedTopicIds.length === 0) {
        setError('At least one topic is required');
        setLoading(false);
        return;
      }

      // Ensure primary language is in available languages
      const languagesAvailable = formData.languagesAvailable.includes(formData.languagePrimary)
        ? formData.languagesAvailable
        : [...formData.languagesAvailable, formData.languagePrimary];

      const response = await api.post('/programs', {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        languagePrimary: formData.languagePrimary,
        languagesAvailable: languagesAvailable,
        topicIds: selectedTopicIds
      });

      // Add Portrait Poster if provided
      if (formData.posterUrl) {
        try {
          await api.post('/assets/programs', {
            programId: response.data.id,
            language: formData.languagePrimary,
            variant: 'PORTRAIT',
            assetType: 'poster',
            url: formData.posterUrl
          });
        } catch (assetError) {
          console.error('Failed to add portrait poster:', assetError);
        }
      }

      // Add Landscape Poster if provided
      if (formData.landscapePosterUrl) {
        try {
          await api.post('/assets/programs', {
            programId: response.data.id,
            language: formData.languagePrimary,
            variant: 'LANDSCAPE',
            assetType: 'poster',
            url: formData.landscapePosterUrl
          });
        } catch (assetError) {
          console.error('Failed to add landscape poster:', assetError);
        }
      }

      // Redirect to the newly created series detail page
      router.push(`/cms/programs/${response.data.id}`);
    } catch (error: any) {
      console.error('Failed to create series:', error);
      setError(error.response?.data?.message || 'Failed to create series. Please try again.');
      setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (formData.languagesAvailable.includes(lang)) {
      // Don't allow removing the primary language
      if (lang === formData.languagePrimary) {
        setError('Cannot remove primary language from available languages');
        return;
      }
      setFormData({
        ...formData,
        languagesAvailable: formData.languagesAvailable.filter(l => l !== lang),
      });
    } else {
      setFormData({
        ...formData,
        languagesAvailable: [...formData.languagesAvailable, lang],
      });
    }
    setError('');
  };

  const toggleTopic = (topicId: string) => {
    if (selectedTopicIds.includes(topicId)) {
      setSelectedTopicIds(selectedTopicIds.filter(id => id !== topicId));
    } else {
      setSelectedTopicIds([...selectedTopicIds, topicId]);
    }
  };

  const availableLanguages = ['en', 'es', 'fr', 'te', 'hi']; // Including Telugu for Chai Shorts

  return (
    <CMSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/cms/programs" className="p-2 hover:bg-slate-800 rounded transition-colors text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Create New Series</h1>
            <p className="text-gray-400">Add a new short-form series to Chai Shorts</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Series Information</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Series Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    setError('');
                  }}
                  className="input-field"
                  placeholder="Enter series title"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Enter series description"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Portrait Poster URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/poster_portrait.jpg"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Vertical poster (2:3) for lists and cards.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Landscape Poster URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.landscapePosterUrl}
                    onChange={(e) => setFormData({ ...formData, landscapePosterUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/poster_landscape.jpg"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Horizontal poster (16:9) for feature banners.
                  </p>
                </div>
              </div>

              {/* Topics Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Topics <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700 min-h-[3rem]">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${selectedTopicIds.includes(topic.id)
                          ? 'bg-yellow-600 border-yellow-500 text-white'
                          : 'bg-slate-800 border-slate-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                        }`}
                    >
                      <Tag className="h-3 w-3" />
                      {topic.name}
                    </button>
                  ))}
                  {topics.length === 0 && (
                    <p className="text-xs text-gray-500">No topics available.</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select at least one topic.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Primary Language <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.languagePrimary}
                    onChange={(e) => {
                      const newPrimary = e.target.value;
                      setFormData({
                        ...formData,
                        languagePrimary: newPrimary,
                        // Ensure primary is always in available languages
                        languagesAvailable: formData.languagesAvailable.includes(newPrimary)
                          ? formData.languagesAvailable
                          : [...formData.languagesAvailable, newPrimary],
                      });
                      setError('');
                    }}
                    className="input-field"
                    required
                    disabled={loading}
                  >
                    <option value="en">English</option>
                    <option value="te">Telugu</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Primary language for this series</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Available Languages
                  </label>
                  <div className="space-y-2 mt-2">
                    {availableLanguages.map((lang) => (
                      <label key={lang} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.languagesAvailable.includes(lang)}
                          onChange={() => toggleLanguage(lang)}
                          disabled={loading || (lang === formData.languagePrimary)}
                          className="mr-2 rounded border-gray-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-300">
                          {lang === 'en' ? 'English' :
                            lang === 'te' ? 'Telugu' :
                              lang === 'hi' ? 'Hindi' :
                                lang === 'es' ? 'Spanish' : 'French'}
                          {lang === formData.languagePrimary && (
                            <span className="ml-2 text-xs text-yellow-500">(Primary)</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Languages in which this series is available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link
              href="/cms/programs"
              className="btn-secondary flex items-center gap-x-2"
              onClick={(e) => loading && e.preventDefault()}
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create Series'}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="card p-4 bg-yellow-900/20 border border-yellow-900/50">
          <p className="text-sm text-yellow-400">
            <strong>Note:</strong> The series will be created as a <strong>Draft</strong>.
            After creating, you can add more assets, episodes, and then publish it to make it visible on the OTT platform.
          </p>
        </div>
      </div>
    </CMSLayout>
  );
}
