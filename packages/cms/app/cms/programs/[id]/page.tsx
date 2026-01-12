'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CMSLayout } from '../../../components/CMSLayout';
import { SeriesMediaTab } from '../../../../components/SeriesMediaTab';
import { useAuth } from '../../../lib/auth';
import { api } from '../../../lib/api';
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
  Tag,
  Layout,
  Film
} from 'lucide-react';

function ProgramDetailContent() {
  const params = useParams();
  const { user } = useAuth();
  const programId = params.id as string;

  const [program, setProgram] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'media'>('details');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [newEpisodeData, setNewEpisodeData] = useState({
    title: '',
    durationMs: '',
    contentType: 'VIDEO',
    isPaid: false,
    contentUrl: '',
    thumbnailUrl: '',
    subtitleUrl: '',
    shouldPublish: true
  });

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

  const handlePublish = async () => {
    if (!program) return;

    // Validation: Check Required Fields
    if (!program.title) {
      alert('Please provide a Series Title before publishing.');
      return;
    }
    if (!program.description) {
      alert('Please provide a Series Description before publishing.');
      return;
    }

    // Validation: Check for at least one visual asset
    const hasAssets = program.assets && program.assets.length > 0;
    if (!hasAssets) {
      alert('Please add at least one visual asset (thumbnail/poster) before publishing.');
      return;
    }

    // Validation: Check if there are any episodes
    const hasEpisodes = program.terms?.some((term: any) => term.lessons && term.lessons.length > 0);
    if (!hasEpisodes) {
      alert('Please add at least one episode before publishing.');
      return;
    }

    if (!confirm('Are you sure you want to publish this series? It will be visible to all users.')) return;

    try {
      await api.patch(`/programs/${programId}`, {
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString()
      });
      fetchProgram();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to publish series');
    }
  };

  const handleQuickAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;

    try {
      // 1. Find or Create Season 1
      let season1 = program.terms?.find((t: any) => t.termNumber === 1);

      if (!season1) {
        // Create Season 1
        const termResponse = await api.post('/terms', {
          programId: program.id,
          title: 'Season 1',
          termNumber: 1,
          description: 'Season 1'
        });
        season1 = termResponse.data;
      }

      // 2. Calculate Lesson Number
      const existingLessons = season1.lessons || [];
      const nextLessonNumber = existingLessons.length > 0
        ? Math.max(...existingLessons.map((l: any) => l.lessonNumber)) + 1
        : 1;

      // 3. Construct Payload
      const durationMs = newEpisodeData.durationMs ? Math.round(parseFloat(newEpisodeData.durationMs) * 60 * 1000) : 0;

      const payload: any = {
        termId: season1.id,
        title: newEpisodeData.title,
        lessonNumber: nextLessonNumber,
        durationMs: durationMs,
        contentType: newEpisodeData.contentType,
        isPaid: newEpisodeData.isPaid,
        status: newEpisodeData.shouldPublish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: newEpisodeData.shouldPublish ? new Date().toISOString() : null,

        // Language handling
        contentLanguagePrimary: program.languagePrimary,
        contentLanguagesAvailable: [program.languagePrimary],

        // Content URLs
        contentUrlsByLanguage: {
          [program.languagePrimary]: newEpisodeData.contentUrl
        },

        // Assets (Thumbnail)
        assets: [] as any[]
      };

      if (newEpisodeData.thumbnailUrl) {
        // optimistically add both portrait and landscape if only one provided, or strict if backend requires specific types
        // For quick add, we'll add it as LANDSCAPE 'thumbnail' which is common for video lists
        payload.assets.push({
          assetType: 'thumbnail',
          variant: 'LANDSCAPE',
          url: newEpisodeData.thumbnailUrl,
          language: program.languagePrimary
        });
        // Also add PORTRAIT to satisfy the "2 assets" rule if publishing immediately
        payload.assets.push({
          assetType: 'thumbnail',
          variant: 'PORTRAIT',
          url: newEpisodeData.thumbnailUrl, // Re-using same URL effectively
          language: program.languagePrimary
        });
      }

      if (newEpisodeData.subtitleUrl) {
        payload.assets.push({
          assetType: 'subtitle',
          variant: 'DEFAULT',
          url: newEpisodeData.subtitleUrl,
          language: program.languagePrimary
        });
      }

      // 4. Create Lesson
      await api.post('/lessons', payload);

      // 5. Cleanup
      await fetchProgram(); // Refresh data

      // Close modal
      const modal = document.getElementById('add-episode-modal');
      if (modal) (modal as any).close();

      // Reset form
      setNewEpisodeData({
        title: '',
        durationMs: '',
        contentType: 'VIDEO',
        isPaid: false,
        contentUrl: '',
        thumbnailUrl: '',
        subtitleUrl: '',
        shouldPublish: true
      });

      alert('Episode created successfully!');

    } catch (error: any) {
      console.error('Failed to create episode:', error);
      alert(error.response?.data?.message || 'Failed to create episode');
    }
  };



  if (loading) {
    return (
      <CMSLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading series...</p>
        </div>
      </CMSLayout>
    );
  }

  if (!program) {
    return (
      <CMSLayout>
        <div className="card p-12 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Series not found</h3>
          <Link href="/cms/programs" className="text-yellow-500 hover:text-yellow-400 hover:underline">
            Back to Series
          </Link>
        </div>
      </CMSLayout>
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
    <CMSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/cms/programs" className="p-2 hover:bg-slate-800 rounded transition-colors text-gray-400 hover:text-white">
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
              {program.status !== 'PUBLISHED' && (
                <button
                  onClick={handlePublish}
                  className="btn-primary flex items-center gap-x-2 bg-green-600 hover:bg-green-700 text-white border-none"
                >
                  <Globe className="h-4 w-4" />
                  Publish Series
                </button>
              )}
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

        <div className="border-b border-slate-700 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === 'details'
                ? 'border-yellow-500 text-yellow-500'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
              <Layout className="h-4 w-4" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeTab === 'media'
                ? 'border-yellow-500 text-yellow-500'
                : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
              <Film className="h-4 w-4" />
              Media
            </button>
          </div>
        </div>

        {activeTab === 'media' && (
          <SeriesMediaTab program={program} onUpdate={fetchProgram} />
        )}

        {activeTab === 'details' && (
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">Seasons & Episodes</h2>
                  {canEdit && (
                    <button
                      onClick={() => {
                        const modal = document.getElementById('add-episode-modal');
                        if (modal) (modal as any).showModal();
                      }}
                      className="p-1 px-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors text-sm flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Episode
                    </button>
                  )}
                </div>
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
                            href={`/cms/lessons/${lesson.id}`}
                            className="flex items-center justify-between p-2 hover:bg-slate-800 rounded transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4 text-gray-500 group-hover:text-yellow-500 transition-colors" />
                              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                Episode {lesson.lessonNumber}: {lesson.title}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lesson.status)}`}>
                              {lesson.status === 'PUBLISHED' ? 'Dropped' : lesson.status === 'SCHEDULED' ? 'Scheduled Drop' : lesson.status}
                            </span>
                          </Link>
                        ))}
                        {(!term.lessons || term.lessons.length === 0) && (
                          <p className="text-xs text-gray-500 italic px-2">No episodes in this season</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!program.terms || program.terms.length === 0) && (
                    <div className="text-center py-6 border border-dashed border-slate-700/50 rounded-lg">
                      <p className="text-gray-400 mb-2">No seasons yet</p>
                      <p className="text-xs text-gray-500">Click "Add Episode" to automatically start Season 1</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
            </div>
          </div>
        )}

        {/* Add Episode Modal */}
        <dialog id="add-episode-modal" className="modal">
          <div className="modal-box bg-slate-900 border border-slate-700 text-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">Add Episode</h3>
              <form method="dialog">
                <button className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
              </form>
            </div>

            <form onSubmit={handleQuickAddEpisode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Episode Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newEpisodeData.title}
                  onChange={(e) => setNewEpisodeData({ ...newEpisodeData, title: e.target.value })}
                  className="input-field w-full"
                  placeholder="Episode Title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Content URL (Video/HLS) - {program?.languagePrimary} <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={newEpisodeData.contentUrl}
                  onChange={(e) => setNewEpisodeData({ ...newEpisodeData, contentUrl: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://example.com/video.mp4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    value={newEpisodeData.thumbnailUrl}
                    onChange={(e) => setNewEpisodeData({ ...newEpisodeData, thumbnailUrl: e.target.value })}
                    className="input-field w-full"
                    placeholder="https://example.com/thumb.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Subtitle URL (VTT)</label>
                  <input
                    type="url"
                    value={newEpisodeData.subtitleUrl}
                    onChange={(e) => setNewEpisodeData({ ...newEpisodeData, subtitleUrl: e.target.value })}
                    className="input-field w-full"
                    placeholder="https://example.com/sub.vtt"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newEpisodeData.durationMs}
                    onChange={(e) => setNewEpisodeData({ ...newEpisodeData, durationMs: e.target.value })}
                    className="input-field w-full"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <select
                    value={newEpisodeData.contentType}
                    onChange={(e) => setNewEpisodeData({ ...newEpisodeData, contentType: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="VIDEO">Video</option>
                    <option value="TEXT">Text</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEpisodeData.isPaid}
                    onChange={(e) => setNewEpisodeData({ ...newEpisodeData, isPaid: e.target.checked })}
                    className="mr-2 rounded border-gray-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-300">Premium (Paid)</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEpisodeData.shouldPublish}
                    onChange={(e) => setNewEpisodeData({ ...newEpisodeData, shouldPublish: e.target.checked })}
                    className="mr-2 rounded border-gray-600 bg-slate-800 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-green-400 font-medium">Publish Immediately</span>
                </label>
              </div>

              <div className="bg-yellow-900/20 p-3 rounded border border-yellow-900/40 text-xs text-yellow-400">
                This will automatically add to <strong>Season 1</strong>. You can add more details later.
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <form method="dialog">
                  <button className="btn-secondary">Cancel</button>
                </form>
                <button type="submit" className="btn-primary">Create Episode</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </CMSLayout>
  );
}

export default function CMSProgramDetailPage() {
  return <ProgramDetailContent />;
}
