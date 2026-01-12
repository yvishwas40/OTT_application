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
  Calendar,
  Globe,
  Play,
  Clock,
  Archive,
  CheckCircle
} from 'lucide-react';

function LessonEditorContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [newThumbnail, setNewThumbnail] = useState({ language: 'en', variant: 'PORTRAIT', url: '' });
  const [newContentUrl, setNewContentUrl] = useState({ language: 'en', url: '' });
  const [newSubtitle, setNewSubtitle] = useState({ language: 'en', url: '' });
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${lessonId}`);
      setLesson(response.data);
      setEditData({
        title: response.data.title,
        contentType: response.data.contentType,
        durationMs: response.data.durationMs,
        isPaid: response.data.isPaid,
        contentLanguagePrimary: response.data.contentLanguagePrimary,
        contentLanguagesAvailable: response.data.contentLanguagesAvailable || [],
        contentUrlsByLanguage: response.data.contentUrlsByLanguage || {},
        subtitleLanguages: response.data.subtitleLanguages || [],
        subtitleUrlsByLanguage: response.data.subtitleUrlsByLanguage || {},
      });
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.patch(`/lessons/${lessonId}`, editData);
      setEditing(false);
      await fetchLesson();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update lesson');
    }
  };

  const handlePublish = async () => {
    if (!confirm('Drop this episode now?')) return;
    try {
      await api.post(`/lessons/${lessonId}/publish`);
      await fetchLesson();
      alert('Episode dropped successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to drop episode');
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select both date and time');
      return;
    }
    const publishAt = new Date(`${scheduleDate}T${scheduleTime}`);
    if (publishAt <= new Date()) {
      alert('Schedule time must be in the future');
      return;
    }
    try {
      await api.post(`/lessons/${lessonId}/schedule`, { publishAt: publishAt.toISOString() });
      await fetchLesson();
      alert('Episode scheduled for drop successfully!');
      setScheduleDate('');
      setScheduleTime('');
      const modal = document.getElementById('schedule-modal');
      if (modal) (modal as any).close();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to schedule episode drop');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this episode?')) return;
    try {
      await api.post(`/lessons/${lessonId}/archive`);
      await fetchLesson();
      alert('Episode archived successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to archive episode');
    }
  };

  const handleAddThumbnail = async () => {
    try {
      await api.post('/assets/lessons', {
        lessonId,
        language: newThumbnail.language,
        variant: newThumbnail.variant,
        assetType: 'thumbnail',
        url: newThumbnail.url,
      });
      setNewThumbnail({ language: 'en', variant: 'PORTRAIT', url: '' });
      await fetchLesson();
      const modal = document.getElementById('thumbnail-modal') as any;
      if (modal) modal.close();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add thumbnail');
    }
  };

  const handleDeleteThumbnail = async (assetId: string) => {
    if (!confirm('Delete this thumbnail?')) return;
    try {
      await api.delete(`/assets/lessons/${assetId}`);
      await fetchLesson();
    } catch (error) {
      console.error('Failed to delete thumbnail:', error);
    }
  };

  const handleAddContentUrl = () => {
    if (!newContentUrl.url) return;
    const contentUrls = { ...editData.contentUrlsByLanguage };
    contentUrls[newContentUrl.language] = newContentUrl.url;
    const languages = editData.contentLanguagesAvailable || [];
    if (!languages.includes(newContentUrl.language)) {
      languages.push(newContentUrl.language);
    }
    setEditData({
      ...editData,
      contentUrlsByLanguage: contentUrls,
      contentLanguagesAvailable: languages,
    });
    setNewContentUrl({ language: 'en', url: '' });
  };

  const handleRemoveContentUrl = (language: string) => {
    const contentUrls = { ...editData.contentUrlsByLanguage };
    delete contentUrls[language];
    const languages = (editData.contentLanguagesAvailable || []).filter((l: string) => l !== language);
    setEditData({
      ...editData,
      contentUrlsByLanguage: contentUrls,
      contentLanguagesAvailable: languages,
    });
  };

  const handleAddSubtitle = () => {
    if (!newSubtitle.url) return;
    const subtitleUrls = { ...editData.subtitleUrlsByLanguage };
    subtitleUrls[newSubtitle.language] = newSubtitle.url;
    const languages = editData.subtitleLanguages || [];
    if (!languages.includes(newSubtitle.language)) {
      languages.push(newSubtitle.language);
    }
    setEditData({
      ...editData,
      subtitleUrlsByLanguage: subtitleUrls,
      subtitleLanguages: languages,
    });
    setNewSubtitle({ language: 'en', url: '' });
  };

  const handleRemoveSubtitle = (language: string) => {
    const subtitleUrls = { ...editData.subtitleUrlsByLanguage };
    delete subtitleUrls[language];
    const languages = (editData.subtitleLanguages || []).filter((l: string) => l !== language);
    setEditData({
      ...editData,
      subtitleUrlsByLanguage: subtitleUrls,
      subtitleLanguages: languages,
    });
  };

  if (loading) {
    return (
      <Layout>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading episode...</p>
          </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="card p-12 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Episode not found</h3>
          <Link href="/lessons" className="text-yellow-500 hover:text-yellow-400 hover:underline">
            Back to Episodes
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
          <Link href="/lessons" className="p-2 hover:bg-slate-800 rounded transition-colors text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(lesson.status)}`}>
                {lesson.status === 'PUBLISHED' ? 'Dropped' : lesson.status === 'SCHEDULED' ? 'Scheduled Drop' : lesson.status}
              </span>
              {lesson.publishedAt && (
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  Published {new Date(lesson.publishedAt).toLocaleDateString()}
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
                  <button onClick={() => { setEditing(false); fetchLesson(); }} className="btn-secondary flex items-center gap-x-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {lesson.status === 'DRAFT' && (
                    <button onClick={handlePublish} className="bg-success-600 hover:bg-success-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-x-2">
                      <CheckCircle className="h-4 w-4" />
                      Drop Episode
                    </button>
                  )}
                  {lesson.status === 'DRAFT' && (
                    <button
                      onClick={() => {
                        const modal = document.getElementById('schedule-modal');
                        if (modal) (modal as any).showModal();
                      }}
                      className="bg-warning-600 hover:bg-warning-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-x-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Drop
                    </button>
                  )}
                  {lesson.status !== 'ARCHIVED' && (
                    <button onClick={handleArchive} className="btn-secondary flex items-center gap-x-2">
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                  )}
                  <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-x-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Episode Details */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Episode Details</h2>
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
                    <p className="text-gray-100">{lesson.title}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Content Type</label>
                    {editing ? (
                      <select
                        value={editData.contentType}
                        onChange={(e) => setEditData({ ...editData, contentType: e.target.value })}
                        className="input-field"
                      >
                        <option value="VIDEO">Video</option>
                        <option value="TEXT">Text</option>
                      </select>
                    ) : (
                      <p className="text-gray-100">{lesson.contentType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration (minutes)</label>
                    {editing ? (
                      <input
                        type="number"
                        value={editData.durationMs ? Math.floor(editData.durationMs / 60000) : 0}
                        onChange={(e) => setEditData({ ...editData, durationMs: parseInt(e.target.value) * 60000 })}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-100">{lesson.durationMs ? `${Math.floor(lesson.durationMs / 60000)} min` : 'N/A'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Access</label>
                  {editing ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editData.isPaid}
                        onChange={(e) => setEditData({ ...editData, isPaid: e.target.checked })}
                        className="mr-2 rounded border-gray-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-300">Premium Episode (Requires Subscription)</span>
                    </label>
                  ) : (
                    <p className="text-gray-100">{lesson.isPaid ? 'Premium' : 'Free'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Primary Language</label>
                  {editing ? (
                    <select
                      value={editData.contentLanguagePrimary}
                      onChange={(e) => setEditData({ ...editData, contentLanguagePrimary: e.target.value })}
                      className="input-field"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  ) : (
                    <p className="text-gray-100">{lesson.contentLanguagePrimary}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content URLs */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Content URLs</h2>
              <div className="space-y-4">
                {Object.entries(editData.contentUrlsByLanguage || {}).map(([lang, url]: [string, any]) => (
                  <div key={lang} className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-700">
                    <span className="text-xs font-bold uppercase w-8 text-gray-400">{lang}</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-yellow-400 truncate hover:underline">
                      {url}
                    </a>
                    {editing && (
                      <button
                        onClick={() => handleRemoveContentUrl(lang)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {editing && (
                  <div className="flex gap-2 items-end">
                    <div className="w-24">
                      <label className="text-xs text-gray-400">Lang</label>
                      <select
                        value={newContentUrl.language}
                        onChange={(e) => setNewContentUrl({ ...newContentUrl, language: e.target.value })}
                        className="input-field py-1 text-sm"
                      >
                        <option value="en">en</option>
                        <option value="es">es</option>
                        <option value="fr">fr</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400">URL (HLS/Video)</label>
                      <input
                        type="text"
                        value={newContentUrl.url}
                        onChange={(e) => setNewContentUrl({ ...newContentUrl, url: e.target.value })}
                        className="input-field py-1 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      onClick={handleAddContentUrl}
                      className="btn-primary py-1 px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Subtitles */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Subtitles</h2>
              <div className="space-y-4">
                {Object.entries(editData.subtitleUrlsByLanguage || {}).map(([lang, url]: [string, any]) => (
                  <div key={lang} className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-700">
                    <span className="text-xs font-bold uppercase w-8 text-gray-400">{lang}</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-yellow-400 truncate hover:underline">
                      {url}
                    </a>
                    {editing && (
                      <button
                        onClick={() => handleRemoveSubtitle(lang)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {editing && (
                  <div className="flex gap-2 items-end">
                    <div className="w-24">
                      <label className="text-xs text-gray-400">Lang</label>
                      <select
                        value={newSubtitle.language}
                        onChange={(e) => setNewSubtitle({ ...newSubtitle, language: e.target.value })}
                        className="input-field py-1 text-sm"
                      >
                        <option value="en">en</option>
                        <option value="es">es</option>
                        <option value="fr">fr</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400">URL (VTT)</label>
                      <input
                        type="text"
                        value={newSubtitle.url}
                        onChange={(e) => setNewSubtitle({ ...newSubtitle, url: e.target.value })}
                        className="input-field py-1 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      onClick={handleAddSubtitle}
                      className="btn-primary py-1 px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Episode Thumbnails */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Episode Thumbnails</h2>
                {canEdit && (
                  <button
                    onClick={() => {
                      const modal = document.getElementById('thumbnail-modal');
                      if (modal) (modal as any).showModal();
                    }}
                    className="p-1 text-yellow-500 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {lesson.assets?.filter((a: any) => a.assetType === 'thumbnail').map((asset: any) => (
                  <div key={asset.id} className="border border-slate-700 rounded p-2 bg-slate-900/50">
                    <div className="aspect-video bg-slate-800 rounded mb-2 relative overflow-hidden">
                      <img src={asset.url} alt={`${asset.variant} ${asset.language}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{asset.variant} - {asset.language}</span>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteThumbnail(asset.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!lesson.assets || lesson.assets.filter((a: any) => a.assetType === 'thumbnail').length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">No thumbnails</p>
                )}
              </div>
            </div>

            {/* Episode Info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Episode Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Series</span>
                  <p className="text-gray-200 font-medium">{lesson.term?.program?.title}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Season</span>
                  <p className="text-gray-200 font-medium">Season {lesson.term?.termNumber}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Episode Number</span>
                  <p className="text-gray-200 font-medium">{lesson.lessonNumber}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-400">{new Date(lesson.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-400">{new Date(lesson.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Thumbnail Modal */}
        <dialog id="thumbnail-modal" className="modal">
          <div className="modal-box bg-slate-900 border border-slate-700 text-gray-100">
            <h3 className="font-bold text-lg mb-4 text-white">Add Thumbnail</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Language</label>
                <select
                  value={newThumbnail.language}
                  onChange={(e) => setNewThumbnail({ ...newThumbnail, language: e.target.value })}
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
                  value={newThumbnail.variant}
                  onChange={(e) => setNewThumbnail({ ...newThumbnail, variant: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="PORTRAIT">Portrait</option>
                  <option value="LANDSCAPE">Landscape</option>
                  <option value="SQUARE">Square</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                <input
                  type="text"
                  value={newThumbnail.url}
                  onChange={(e) => setNewThumbnail({ ...newThumbnail, url: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button type="button" onClick={handleAddThumbnail} className="btn-primary">Add</button>
                <button type="submit" className="btn-secondary">Cancel</button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* Schedule Modal */}
        <dialog id="schedule-modal" className="modal">
          <div className="modal-box bg-slate-900 border border-slate-700 text-gray-100">
            <h3 className="font-bold text-lg mb-4 text-white">Schedule Drop</h3>
            <p className="text-gray-400 mb-4 text-sm">Select when this episode should be dropped.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button type="button" onClick={handleSchedule} className="btn-primary">Schedule</button>
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

export default function LessonDetailPage() {
  return (
    <AuthProvider>
      <LessonEditorContent />
    </AuthProvider>
  );
}
