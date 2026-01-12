import { useState, useEffect } from 'react';
import { api } from '../app/lib/api';
import { Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface EpisodeMediaTabProps {
    lesson: any; // Using any to match existing pattern, ideally should be typed
    onUpdate: () => void;
}

export function EpisodeMediaTab({ lesson, onUpdate }: EpisodeMediaTabProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Media URLs State
    const [contentUrl, setContentUrl] = useState('');
    const [subtitleUrl, setSubtitleUrl] = useState('');

    // New Thumbnail State
    const [newThumbnail, setNewThumbnail] = useState({
        language: 'en',
        variant: 'LANDSCAPE',
        url: ''
    });

    // Initialize state from lesson prop
    useEffect(() => {
        if (lesson) {
            const primaryLang = lesson.contentLanguagePrimary || 'en';

            // Safely access contentUrlsByLanguage
            const contentUrls = lesson.contentUrlsByLanguage || {};
            setContentUrl(contentUrls[primaryLang] || '');

            // Safely access subtitleUrlsByLanguage
            const subtitleUrls = lesson.subtitleUrlsByLanguage || {};
            setSubtitleUrl(subtitleUrls[primaryLang] || '');
        }
    }, [lesson]);

    const handleSaveMedia = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const primaryLang = lesson.contentLanguagePrimary || 'en';

            // Construct payload preserving potential other language URLs 
            // (though UI only exposes primary currently as per requirements)
            const updatedContentUrls = {
                ...(lesson.contentUrlsByLanguage || {}),
                [primaryLang]: contentUrl
            };

            const updatedSubtitleUrls = {
                ...(lesson.subtitleUrlsByLanguage || {}),
                [primaryLang]: subtitleUrl
            };

            // Add primary language to available lists if not present
            const contentLangs = new Set(lesson.contentLanguagesAvailable || []);
            if (contentUrl) contentLangs.add(primaryLang);

            const subtitleLangs = new Set(lesson.subtitleLanguages || []);
            if (subtitleUrl) subtitleLangs.add(primaryLang);

            await api.patch(`/lessons/${lesson.id}`, {
                contentUrlsByLanguage: updatedContentUrls,
                subtitleUrlsByLanguage: updatedSubtitleUrls,
                contentLanguagesAvailable: Array.from(contentLangs),
                subtitleLanguages: Array.from(subtitleLangs)
            });

            setSuccess('Media updated successfully');
            onUpdate();
        } catch (err: any) {
            console.error('Failed to update media:', err);
            setError(err.response?.data?.message || 'Failed to update media');
        } finally {
            setLoading(false);
        }
    };

    const handleAddThumbnail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThumbnail.url) return;

        setLoading(true);
        setError('');

        try {
            await api.post('/assets/lessons', {
                lessonId: lesson.id,
                language: newThumbnail.language,
                variant: newThumbnail.variant,
                assetType: 'thumbnail',
                url: newThumbnail.url,
            });

            setNewThumbnail(prev => ({ ...prev, url: '' }));
            onUpdate();
        } catch (err: any) {
            console.error('Failed to add thumbnail:', err);
            setError(err.response?.data?.message || 'Failed to add thumbnail');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteThumbnail = async (assetId: string) => {
        if (!confirm('Delete this thumbnail?')) return;

        setLoading(true);
        try {
            await api.delete(`/assets/lessons/${assetId}`);
            onUpdate();
        } catch (err: any) {
            console.error('Failed to delete thumbnail:', err);
            setError(err.response?.data?.message || 'Failed to delete thumbnail');
        } finally {
            setLoading(false);
        }
    };

    if (!lesson) return null;

    const thumbnails = (lesson.assets || []).filter((a: any) => a.assetType === 'thumbnail');

    return (
        <div className="space-y-8">
            {/* Media URLs Section */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Episode Media URLs</h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-900/30 border border-green-900/50 rounded-lg text-green-400 text-sm">
                        {success}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Video Content URL ({lesson.contentLanguagePrimary})
                        </label>
                        <input
                            type="url"
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            className="input-field w-full"
                            placeholder="https://example.com/video.mp4"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Primary language video source (HLS/MP4)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Subtitle URL ({lesson.contentLanguagePrimary})
                        </label>
                        <input
                            type="url"
                            value={subtitleUrl}
                            onChange={(e) => setSubtitleUrl(e.target.value)}
                            className="input-field w-full"
                            placeholder="https://example.com/captions.vtt"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Primary language subtitles (VTT format)
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSaveMedia}
                            disabled={loading}
                            className="btn-primary flex items-center gap-x-2 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? 'Saving...' : 'Save Media'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Thumbnails Section */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Thumbnails</h2>

                {/* Existing Thumbnails */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {thumbnails.map((asset: any) => (
                        <div key={asset.id} className="group relative border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                            <div className="aspect-video relative">
                                <img
                                    src={asset.url}
                                    alt={`${asset.variant} ${asset.language}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDeleteThumbnail(asset.id)}
                                        className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                                        title="Delete Thumbnail"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-800 border-t border-slate-700">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-gray-300">{asset.variant}</span>
                                    <span className="text-gray-500 uppercase">{asset.language}</span>
                                </div>
                                <div className="mt-1 text-xs text-gray-600 truncate" title={asset.url}>
                                    {asset.url}
                                </div>
                            </div>
                        </div>
                    ))}

                    {thumbnails.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-500 border-2 border-dashed border-slate-700 rounded-lg">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No thumbnails uploaded</p>
                        </div>
                    )}
                </div>

                {/* Add New Thumbnail Form */}
                <div className="border-t border-slate-700 pt-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-4">Add New Thumbnail</h3>
                    <form onSubmit={handleAddThumbnail} className="flex gap-4 items-end bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="w-32">
                            <label className="block text-xs text-gray-400 mb-1">Language</label>
                            <select
                                value={newThumbnail.language}
                                onChange={(e) => setNewThumbnail({ ...newThumbnail, language: e.target.value })}
                                className="input-field w-full py-1.5 text-sm"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="te">Telugu</option>
                                <option value="hi">Hindi</option>
                            </select>
                        </div>

                        <div className="w-32">
                            <label className="block text-xs text-gray-400 mb-1">Variant</label>
                            <select
                                value={newThumbnail.variant}
                                onChange={(e) => setNewThumbnail({ ...newThumbnail, variant: e.target.value })}
                                className="input-field w-full py-1.5 text-sm"
                            >
                                <option value="LANDSCAPE">Landscape</option>
                                <option value="PORTRAIT">Portrait</option>
                                <option value="SQUARE">Square</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs text-gray-400 mb-1">Image URL</label>
                            <input
                                type="url"
                                value={newThumbnail.url}
                                onChange={(e) => setNewThumbnail({ ...newThumbnail, url: e.target.value })}
                                className="input-field w-full py-1.5 text-sm"
                                placeholder="https://..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !newThumbnail.url}
                            className="btn-primary py-1.5 px-4 flex items-center gap-x-2 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
