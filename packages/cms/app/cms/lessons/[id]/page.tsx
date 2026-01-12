'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CMSLayout } from '../../../components/CMSLayout';
import { EpisodeMediaTab } from '../../../../components/EpisodeMediaTab';
import { useAuth } from '../../../lib/auth';
import { api } from '../../../lib/api';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Calendar,
  Clock,
  Archive,
  CheckCircle,
  Layout,
  Film
} from 'lucide-react';

function LessonEditorContent() {
  const params = useParams();
  const { user } = useAuth();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'media'>('details');

  // Edit State for Details Tab
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Schedule State
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

  if (loading) {
    return (
      <CMSLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading episode...</p>
        </div>
      </CMSLayout>
    );
  }

  if (!lesson) {
    return (
      <CMSLayout>
        <div className="card p-12 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Episode not found</h3>
          <Link href="/cms/lessons" className="text-yellow-500 hover:text-yellow-400 hover:underline">
            Back to Episodes
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
          <Link href="/cms/lessons" className="p-2 hover:bg-slate-800 rounded transition-colors text-gray-400 hover:text-white">
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
              {activeTab === 'details' && (
                <>
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
                    <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-x-2">
                      <Edit className="h-4 w-4" />
                      Edit Details
                    </button>
                  )}
                </>
              )}

              {!editing && (
                <>
                  {lesson.status === 'DRAFT' && (
                    <button onClick={handlePublish} className="bg-success-600 hover:bg-success-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-x-2">
                      <CheckCircle className="h-4 w-4" />
                      Drop
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
                      Schedule
                    </button>
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

        {/* Tabs */}
        <div className="border-b border-slate-700">
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

        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Details */}
            <div className="lg:col-span-2 space-y-6">
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
                        <option value="te">Telugu</option>
                        <option value="hi">Hindi</option>
                      </select>
                    ) : (
                      <p className="text-gray-100">{lesson.contentLanguagePrimary}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Episode Info */}
            <div className="space-y-6">
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
        )}

        {/* Media Tab Content */}
        {activeTab === 'media' && (
          <EpisodeMediaTab lesson={lesson} onUpdate={fetchLesson} />
        )}

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
    </CMSLayout>
  );
}

export default function CMSLessonDetailPage() {
  return <LessonEditorContent />;
}
