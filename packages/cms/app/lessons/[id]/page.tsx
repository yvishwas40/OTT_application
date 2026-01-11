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
    if (!confirm('Publish this lesson now?')) return;
    try {
      await api.post(`/lessons/${lessonId}/publish`);
      await fetchLesson();
      alert('Lesson published successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to publish lesson');
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
      alert('Lesson scheduled successfully!');
      setScheduleDate('');
      setScheduleTime('');
      const modal = document.getElementById('schedule-modal');
      if (modal) (modal as any).close();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to schedule lesson');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this lesson?')) return;
    try {
      await api.post(`/lessons/${lessonId}/archive`);
      await fetchLesson();
      alert('Lesson archived successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to archive lesson');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading lesson...</p>
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="card p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lesson not found</h3>
          <Link href="/programs" className="text-primary-600 hover:underline">
            Back to Programs
          </Link>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-success-100 text-success-700';
      case 'SCHEDULED': return 'bg-warning-100 text-warning-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'ARCHIVED': return 'bg-error-100 text-error-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/programs/${lesson.term?.programId}`} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(lesson.status)}`}>
                {lesson.status}
              </span>
              {lesson.publishedAt && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Published {new Date(lesson.publishedAt).toLocaleDateString()}
                </div>
              )}
              {lesson.publishAt && lesson.status === 'SCHEDULED' && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Scheduled {new Date(lesson.publishAt).toLocaleString()}
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
                  <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-x-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  {lesson.status === 'DRAFT' && (
                    <>
                      <button onClick={handlePublish} className="btn-success flex items-center gap-x-2">
                        <CheckCircle className="h-4 w-4" />
                        Publish Now
                      </button>
                      <button
                        onClick={() => {
                          const modal = document.getElementById('schedule-modal');
                          if (modal) (modal as any).showModal();
                        }}
                        className="btn-warning flex items-center gap-x-2"
                      >
                        <Clock className="h-4 w-4" />
                        Schedule
                      </button>
                    </>
                  )}
                  {lesson.status !== 'ARCHIVED' && (
                    <button onClick={handleArchive} className="btn-secondary flex items-center gap-x-2">
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Details */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="input-field w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{lesson.title}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                    {editing ? (
                      <select
                        value={editData.contentType}
                        onChange={(e) => setEditData({ ...editData, contentType: e.target.value })}
                        className="input-field w-full"
                      >
                        <option value="VIDEO">Video</option>
                        <option value="ARTICLE">Article</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{lesson.contentType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (ms)</label>
                    {editing ? (
                      <input
                        type="number"
                        value={editData.durationMs || ''}
                        onChange={(e) => setEditData({ ...editData, durationMs: e.target.value ? parseInt(e.target.value) : null })}
                        className="input-field w-full"
                        disabled={editData.contentType === 'ARTICLE'}
                      />
                    ) : (
                      <p className="text-gray-900">{lesson.durationMs ? `${Math.floor(lesson.durationMs / 60000)} min` : 'N/A'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    {editing ? (
                      <input
                        type="checkbox"
                        checked={editData.isPaid || false}
                        onChange={(e) => setEditData({ ...editData, isPaid: e.target.checked })}
                        className="rounded"
                      />
                    ) : (
                      <input type="checkbox" checked={lesson.isPaid} disabled className="rounded" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Paid Content</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Content Language</label>
                  {editing ? (
                    <select
                      value={editData.contentLanguagePrimary}
                      onChange={(e) => setEditData({ ...editData, contentLanguagePrimary: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{lesson.contentLanguagePrimary}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content URLs */}
            {editing && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Content URLs</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={newContentUrl.language}
                      onChange={(e) => setNewContentUrl({ ...newContentUrl, language: e.target.value })}
                      className="input-field"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                    <input
                      type="text"
                      value={newContentUrl.url}
                      onChange={(e) => setNewContentUrl({ ...newContentUrl, url: e.target.value })}
                      className="input-field flex-1"
                      placeholder="https://example.com/video.mp4"
                    />
                    <button onClick={handleAddContentUrl} className="btn-primary">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(editData.contentUrlsByLanguage || {}).map(([lang, url]: [string, any]) => (
                      <div key={lang} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700 w-16">{lang}</span>
                        <span className="text-sm text-gray-600 flex-1 truncate">{url}</span>
                        <button
                          onClick={() => handleRemoveContentUrl(lang)}
                          className="p-1 text-error-600 hover:bg-error-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Subtitles */}
            {editing && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subtitles</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={newSubtitle.language}
                      onChange={(e) => setNewSubtitle({ ...newSubtitle, language: e.target.value })}
                      className="input-field"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                    <input
                      type="text"
                      value={newSubtitle.url}
                      onChange={(e) => setNewSubtitle({ ...newSubtitle, url: e.target.value })}
                      className="input-field flex-1"
                      placeholder="https://example.com/subtitle.vtt"
                    />
                    <button onClick={handleAddSubtitle} className="btn-primary">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(editData.subtitleUrlsByLanguage || {}).map(([lang, url]: [string, any]) => (
                      <div key={lang} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700 w-16">{lang}</span>
                        <span className="text-sm text-gray-600 flex-1 truncate">{url}</span>
                        <button
                          onClick={() => handleRemoveSubtitle(lang)}
                          className="p-1 text-error-600 hover:bg-error-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnails */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Thumbnails</h2>
                {canEdit && (
                  <button
                    onClick={() => {
                      const modal = document.getElementById('thumbnail-modal');
                      if (modal) (modal as any).showModal();
                    }}
                    className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {lesson.assets?.filter((a: any) => a.assetType === 'thumbnail').map((asset: any) => (
                  <div key={asset.id} className="border border-gray-200 rounded p-2">
                    <div className="aspect-video bg-gray-100 rounded mb-2 relative overflow-hidden">
                      <img src={asset.url} alt={`${asset.variant} ${asset.language}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>{asset.variant} - {asset.language}</span>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteThumbnail(asset.id)}
                          className="text-error-600 hover:text-error-700"
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

            {/* Lesson Info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Program:</span>
                  <p className="text-gray-900 font-medium">{lesson.term?.program?.title}</p>
                </div>
                <div>
                  <span className="text-gray-600">Term:</span>
                  <p className="text-gray-900 font-medium">Term {lesson.term?.termNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Lesson Number:</span>
                  <p className="text-gray-900 font-medium">{lesson.lessonNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Thumbnail Modal */}
        <dialog id="thumbnail-modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Thumbnail</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                <select
                  value={newThumbnail.variant}
                  onChange={(e) => setNewThumbnail({ ...newThumbnail, variant: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="PORTRAIT">Portrait</option>
                  <option value="LANDSCAPE">Landscape</option>
                  <option value="SQUARE">Square</option>
                  <option value="BANNER">Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
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
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Schedule Publishing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="input-field w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
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

export default function LessonEditorPage() {
  return (
    <AuthProvider>
      <LessonEditorContent />
    </AuthProvider>
  );
}

