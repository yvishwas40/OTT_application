'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { AuthProvider, useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  Globe,
  Tag
} from 'lucide-react';

function ProgramDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const programId = params.id as string;

  const [program, setProgram] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [newPosterUrl, setNewPosterUrl] = useState({ language: 'en', variant: 'PORTRAIT', url: '' });

  useEffect(() => {
    fetchProgram();
    fetchTopics();
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const response = await api.get(`/programs/${programId}`);
      setProgram(response.data);
      setEditData({
        title: response.data.title,
        description: response.data.description,
        languagePrimary: response.data.languagePrimary,
        languagesAvailable: response.data.languagesAvailable,
      });
      setSelectedTopics(response.data.topics?.map((pt: any) => pt.topicId) || []);
    } catch (error) {
      console.error('Failed to fetch program:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await api.get('/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const handleSave = async () => {
    try {
      await api.patch(`/programs/${programId}`, {
        ...editData,
        topics: {
          set: selectedTopics.map(topicId => ({ topicId })),
        },
      });
      setEditing(false);
      await fetchProgram();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update program');
    }
  };

  const handleAddPoster = async () => {
    try {
      await api.post('/assets/programs', {
        programId,
        language: newPosterUrl.language,
        variant: newPosterUrl.variant,
        assetType: 'poster',
        url: newPosterUrl.url,
      });
      setNewPosterUrl({ language: 'en', variant: 'PORTRAIT', url: '' });
      fetchProgram();
      const modal = document.getElementById('poster-modal') as any;
      if (modal) modal.close();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add poster');
    }
  };

  const handleDeletePoster = async (assetId: string) => {
    if (!confirm('Delete this poster?')) return;
    try {
      await api.delete(`/assets/programs/${assetId}`);
      fetchProgram();
    } catch (error) {
      console.error('Failed to delete poster:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading series...</p>
          </div>
      </Layout>
    );
  }

  if (!program) {
    return (
      <Layout>
        <div className="card p-12 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Series not found</h3>
          <Link href="/programs" className="text-yellow-500 hover:text-yellow-400 hover:underline">
            Back to Series
          </Link>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-success-900/30 text-success-400 border border-success-900/50';
      case 'SCHEDULED': return 'bg-warning-900/30 text-warning-400 border border-warning-900/50';
      case 'DRAFT': return 'bg-slate-800 text-gray-400 border border-slate-700';
      case 'ARCHIVED': return 'bg-red-900/30 text-red-400 border border-red-900/50';
      default: return 'bg-slate-800 text-gray-400 border border-slate-700';
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/programs" className="p-2 hover:bg-slate-800 rounded transition-colors text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Series Control Room: {program.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(program.status)}`}>
                {program.status === 'PUBLISHED' ? 'Live' : program.status === 'SCHEDULED' ? 'Scheduled Drop' : program.status}
              </span>
              {program.publishedAt && (
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  Published {new Date(program.publishedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} className="btn-primary flex items-center gap-x-2">
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button onClick={() => { setEditing(false); fetchProgram(); }} className="btn-secondary flex items-center gap-x-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-x-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Series Details */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Series Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-100">{program.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  {editing ? (
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="input-field"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">{program.description || 'No description'}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Primary Language</label>
                    {editing ? (
                      <select
                        value={editData.languagePrimary}
                        onChange={(e) => setEditData({ ...editData, languagePrimary: e.target.value })}
                        className="input-field"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    ) : (
                      <p className="text-gray-100">{program.languagePrimary}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Available Languages</label>
                    {editing ? (
                      <div className="space-y-2 mt-2">
                        {['en', 'es', 'fr'].map(lang => (
                          <label key={lang} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editData.languagesAvailable?.includes(lang) || false}
                              onChange={(e) => {
                                const langs = editData.languagesAvailable || [];
                                if (e.target.checked) {
                                  setEditData({ ...editData, languagesAvailable: [...langs, lang] });
                                } else {
                                  setEditData({ ...editData, languagesAvailable: langs.filter((l: string) => l !== lang) });
                                }
                              }}
                              className="mr-2 rounded border-gray-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
                            />
                            <span className="text-sm text-gray-300">{lang}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-100">{program.languagesAvailable?.join(', ') || 'None'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Topics */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Topics</h2>
                {canEdit && editing && (
                  <div className="flex items-center gap-2">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !selectedTopics.includes(e.target.value)) {
                          setSelectedTopics([...selectedTopics, e.target.value]);
                        }
                      }}
                      className="input-field py-1 text-sm"
                    >
                      <option value="">Add Topic</option>
                      {topics.filter((t: any) => !selectedTopics.includes(t.id)).map((topic: any) => (
                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {program.topics?.map((pt: any) => (
                  <span key={pt.topicId} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-yellow-400 rounded-full text-sm border border-slate-700">
                    <Tag className="h-3 w-3" />
                    {pt.topic?.name}
                    {canEdit && editing && (
                      <button
                        onClick={() => setSelectedTopics(selectedTopics.filter(id => id !== pt.topicId))}
                        className="hover:text-yellow-300 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                {(!program.topics || program.topics.length === 0) && (
                  <p className="text-gray-500 text-sm">No topics assigned</p>
                )}
              </div>
            </div>

            {/* Seasons & Episodes */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Seasons & Episodes</h2>
              <div className="space-y-4">
                {program.terms?.map((term: any) => (
                  <div key={term.id} className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-200">
                        Season {term.termNumber}: {term.title || 'Untitled'}
                      </h3>
                      <span className="text-sm text-gray-500">{term.lessons?.length || 0} episodes</span>
                    </div>
                    <div className="space-y-2">
                      {term.lessons?.map((lesson: any) => (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.id}`}
                          className="flex items-center justify-between p-2 hover:bg-slate-800 rounded transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-300">
                              Episode {lesson.lessonNumber}: {lesson.title}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lesson.status)}`}>
                            {lesson.status === 'PUBLISHED' ? 'Dropped' : lesson.status === 'SCHEDULED' ? 'Scheduled Drop' : lesson.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                {(!program.terms || program.terms.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No seasons yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Series Posters */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Series Posters</h2>
                {canEdit && (
                  <button
                    onClick={() => {
                      const modal = document.getElementById('poster-modal');
                      if (modal) (modal as any).showModal();
                    }}
                    className="p-1 text-yellow-500 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {program.assets?.filter((a: any) => a.assetType === 'poster').map((asset: any) => (
                  <div key={asset.id} className="border border-slate-800 rounded p-2 bg-slate-900/50">
                    <div className="aspect-video bg-slate-800 rounded mb-2 relative overflow-hidden">
                      <img src={asset.url} alt={`${asset.variant} ${asset.language}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{asset.variant} - {asset.language}</span>
                      {canEdit && (
                        <button
                          onClick={() => handleDeletePoster(asset.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!program.assets || program.assets.filter((a: any) => a.assetType === 'poster').length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">No posters</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Poster Modal */}
        <dialog id="poster-modal" className="modal">
          <div className="modal-box bg-slate-900 border border-slate-700 text-gray-100">
            <h3 className="font-bold text-lg mb-4 text-white">Add Poster</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Language</label>
                <select
                  value={newPosterUrl.language}
                  onChange={(e) => setNewPosterUrl({ ...newPosterUrl, language: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Variant</label>
                <select
                  value={newPosterUrl.variant}
                  onChange={(e) => setNewPosterUrl({ ...newPosterUrl, variant: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="PORTRAIT">Portrait</option>
                  <option value="LANDSCAPE">Landscape</option>
                  <option value="SQUARE">Square</option>
                  <option value="BANNER">Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                <input
                  type="text"
                  value={newPosterUrl.url}
                  onChange={(e) => setNewPosterUrl({ ...newPosterUrl, url: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button type="button" onClick={handleAddPoster} className="btn-primary">Add</button>
                <button type="submit" className="btn-secondary">Cancel</button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </Layout>
  );
}

export default function ProgramDetailPage() {
  return (
    <AuthProvider>
      <ProgramDetailContent />
    </AuthProvider>
  );
}
