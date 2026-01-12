'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CMSLayout } from '../../../components/CMSLayout';
import { api } from '../../../lib/api';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';

export default function CreateEpisodePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);

  const [formData, setFormData] = useState({
    termId: '',
    lessonNumber: '',
    title: '',
    contentType: 'VIDEO',
    durationMs: '',
    isPaid: false,
    contentLanguagePrimary: 'en',
    contentLanguagesAvailable: ['en'],
    contentUrl: '',
    thumbnailUrl: '',
    subtitleUrl: '',
    shouldPublish: true
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (formData.termId) {
      // Extract programId from term
      const term = terms.find(t => t.id === formData.termId);
      if (term) {
        fetchTerms(term.programId);
      }
    }
  }, [formData.termId]);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(response.data);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchTerms = async (programId: string) => {
    if (!programId) return;
    setLoadingTerms(true);
    try {
      const response = await api.get('/terms', { params: { programId } });
      setTerms(response.data);
    } catch (error) {
      console.error('Failed to fetch terms:', error);
    } finally {
      setLoadingTerms(false);
    }
  };

  const handleProgramChange = (programId: string) => {
    if (programId) {
      fetchTerms(programId);
      setFormData({ ...formData, termId: '' }); // Reset term selection
    } else {
      setTerms([]);
      setFormData({ ...formData, termId: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.termId) {
        setError('Please select a season');
        setLoading(false);
        return;
      }

      if (!formData.title.trim()) {
        setError('Title is required');
        setLoading(false);
        return;
      }

      if (!formData.lessonNumber || parseInt(formData.lessonNumber) < 1) {
        setError('Episode number must be at least 1');
        setLoading(false);
        return;
      }

      if (!formData.contentLanguagePrimary) {
        setError('Primary language is required');
        setLoading(false);
        return;
      }

      // Ensure primary language is in available languages
      const languagesAvailable = formData.contentLanguagesAvailable.includes(formData.contentLanguagePrimary)
        ? formData.contentLanguagesAvailable
        : [...formData.contentLanguagesAvailable, formData.contentLanguagePrimary];

      const response = await api.post('/lessons', {
        termId: formData.termId,
        lessonNumber: parseInt(formData.lessonNumber),
        title: formData.title.trim(),
        contentType: formData.contentType,
        durationMs: formData.durationMs ? parseInt(formData.durationMs) * 60000 : null,
        isPaid: formData.isPaid,
        contentLanguagePrimary: formData.contentLanguagePrimary,
        contentLanguagesAvailable: languagesAvailable,
        contentUrlsByLanguage: {
          [formData.contentLanguagePrimary]: formData.contentUrl
        },
        subtitleLanguages: formData.subtitleUrl ? [formData.contentLanguagePrimary] : [],
        subtitleUrlsByLanguage: formData.subtitleUrl ? {
          [formData.contentLanguagePrimary]: formData.subtitleUrl
        } : {},
        status: formData.shouldPublish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: formData.shouldPublish ? new Date().toISOString() : null
      });

      // Add Thumbnail if provided
      if (formData.thumbnailUrl) {
        try {
          await api.post('/assets/lessons', {
            lessonId: response.data.id,
            language: formData.contentLanguagePrimary,
            variant: 'LANDSCAPE',
            assetType: 'thumbnail',
            url: formData.thumbnailUrl
          });
        } catch (assetError) {
          console.error('Failed to add thumbnail', assetError);
        }
      }

      // Redirect to the newly created episode editor page
      router.push(`/cms/lessons/${response.data.id}`);
    } catch (error: any) {
      console.error('Failed to create episode:', error);
      setError(error.response?.data?.message || 'Failed to create episode. Please try again.');
      setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (formData.contentLanguagesAvailable.includes(lang)) {
      if (lang === formData.contentLanguagePrimary) {
        setError('Cannot remove primary language from available languages');
        return;
      }
      setFormData({
        ...formData,
        contentLanguagesAvailable: formData.contentLanguagesAvailable.filter(l => l !== lang),
      });
    } else {
      setFormData({
        ...formData,
        contentLanguagesAvailable: [...formData.contentLanguagesAvailable, lang],
      });
    }
    setError('');
  };

  const availableLanguages = ['en', 'te', 'hi', 'es', 'fr'];
  const selectedProgram = programs.find(p => {
    const programTerms = terms.length > 0 ? terms[0]?.programId : null;
    return programTerms ? p.id === programTerms : false;
  });

  return (
    <CMSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/cms/lessons" className="p-2 hover:bg-slate-800 rounded transition-colors text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Create New Episode</h1>
            <p className="text-gray-400">Add a new episode to a series</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Episode Information</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Series <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedProgram?.id || ''}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    className="input-field"
                    required
                    disabled={loading || loadingPrograms}
                  >
                    <option value="">Select a series</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Season <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.termId}
                    onChange={(e) => {
                      setFormData({ ...formData, termId: e.target.value });
                      setError('');
                    }}
                    className="input-field"
                    required
                    disabled={loading || loadingTerms || !selectedProgram}
                  >
                    <option value="">Select a season</option>
                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        Season {term.termNumber} {term.title ? `- ${term.title}` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedProgram && terms.length === 0 && !loadingTerms && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No seasons found. Create a season first in the series detail page.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Episode Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lessonNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, lessonNumber: e.target.value });
                      setError('');
                    }}
                    className="input-field"
                    placeholder="1"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Episode number in this season</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Content Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                    className="input-field"
                    required
                    disabled={loading}
                  >
                    <option value="VIDEO">Video</option>
                    <option value="TEXT">Text</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Episode Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    setError('');
                  }}
                  className="input-field"
                  placeholder="Enter episode title"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.durationMs}
                    onChange={(e) => setFormData({ ...formData, durationMs: e.target.value })}
                    className="input-field"
                    placeholder="2"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Duration in minutes (e.g., 2 for 2 minutes)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Access Type
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                      className="mr-2 rounded border-gray-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-300">Premium Episode (Requires Subscription)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Content URL (Video/HLS) - {formData.contentLanguagePrimary} <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={formData.contentUrl}
                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/video.mp4"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/thumb.jpg"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subtitle URL (VTT)
                  </label>
                  <input
                    type="url"
                    value={formData.subtitleUrl}
                    onChange={(e) => setFormData({ ...formData, subtitleUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/sub.vtt"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shouldPublish}
                    onChange={(e) => setFormData({ ...formData, shouldPublish: e.target.checked })}
                    className="mr-2 rounded border-gray-600 bg-slate-800 text-green-500 focus:ring-green-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-green-400 font-medium">Publish Immediately</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  If checked, the episode will be live immediately. Otherwise, it will be saved as Draft.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Primary Language <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.contentLanguagePrimary}
                    onChange={(e) => {
                      const newPrimary = e.target.value;
                      setFormData({
                        ...formData,
                        contentLanguagePrimary: newPrimary,
                        contentLanguagesAvailable: formData.contentLanguagesAvailable.includes(newPrimary)
                          ? formData.contentLanguagesAvailable
                          : [...formData.contentLanguagesAvailable, newPrimary],
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
                          checked={formData.contentLanguagesAvailable.includes(lang)}
                          onChange={() => toggleLanguage(lang)}
                          disabled={loading || (lang === formData.contentLanguagePrimary)}
                          className="mr-2 rounded border-gray-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-300">
                          {lang === 'en' ? 'English' :
                            lang === 'te' ? 'Telugu' :
                              lang === 'hi' ? 'Hindi' :
                                lang === 'es' ? 'Spanish' : 'French'}
                          {lang === formData.contentLanguagePrimary && (
                            <span className="ml-2 text-xs text-yellow-500">(Primary)</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link
              href="/cms/lessons"
              className="btn-secondary flex items-center gap-x-2"
              onClick={(e) => loading && e.preventDefault()}
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.termId}
              className="btn-primary flex items-center gap-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create Episode'}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="card p-4 bg-yellow-900/20 border border-yellow-900/50">
          <p className="text-sm text-yellow-400">
            <strong>Note:</strong> The episode will be created as a <strong>Draft</strong>.
            After creating, you can add content URLs, thumbnails, and subtitles, then publish it.
          </p>
        </div>
      </div>
    </CMSLayout>
  );
}
