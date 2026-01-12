import { useState, useEffect } from 'react';
import { api } from '../app/lib/api';
import { Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface SeriesMediaTabProps {
    program: any;
    onUpdate: () => void;
}

export function SeriesMediaTab({ program, onUpdate }: SeriesMediaTabProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // New Asset State
    const [newAsset, setNewAsset] = useState({
        language: program.languagePrimary || 'en',
        variant: 'PORTRAIT',
        type: 'poster',
        url: ''
    });

    if (!program) return null;

    const assets = program.assets || [];

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAsset.url) return;

        setLoading(true);
        setError('');

        try {
            await api.post('/assets/programs', {
                programId: program.id,
                language: newAsset.language,
                variant: newAsset.variant,
                assetType: newAsset.type,
                url: newAsset.url,
            });

            setNewAsset(prev => ({ ...prev, url: '' }));
            onUpdate();
        } catch (err: any) {
            console.error('Failed to add asset:', err);
            setError(err.response?.data?.message || 'Failed to add asset');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAsset = async (assetId: string) => {
        if (!confirm('Delete this asset?')) return;

        setLoading(true);
        try {
            await api.delete(`/assets/programs/${assetId}`);
            onUpdate();
        } catch (err: any) {
            console.error('Failed to delete asset:', err);
            setError(err.response?.data?.message || 'Failed to delete asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Visual Assets Section */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Visual Assets (Posters & Thumbnails)</h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Existing Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {assets.map((asset: any) => (
                        <div key={asset.id} className="group relative border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                            <div className={`relative ${asset.variant === 'PORTRAIT' ? 'aspect-[2/3]' : 'aspect-video'}`}>
                                <img
                                    src={asset.url}
                                    alt={`${asset.variant} ${asset.language}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDeleteAsset(asset.id)}
                                        className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                                        title="Delete Asset"
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
                                <div className="flex justify-between items-center text-xs mt-1">
                                    <span className="text-yellow-500 capitalize">{asset.assetType}</span>
                                </div>
                                <div className="mt-1 text-xs text-gray-600 truncate" title={asset.url}>
                                    {asset.url}
                                </div>
                            </div>
                        </div>
                    ))}

                    {assets.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-500 border-2 border-dashed border-slate-700 rounded-lg">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No assets uploaded</p>
                        </div>
                    )}
                </div>

                {/* Add New Asset Form */}
                <div className="border-t border-slate-700 pt-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-4">Add New Asset</h3>
                    <form onSubmit={handleAddAsset} className="flex flex-wrap gap-4 items-end bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="w-32">
                            <label className="block text-xs text-gray-400 mb-1">Type</label>
                            <select
                                value={newAsset.type}
                                onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                className="input-field w-full py-1.5 text-sm"
                            >
                                <option value="thumbnail">Thumbnail</option>
                                <option value="poster">Poster</option>
                            </select>
                        </div>

                        <div className="w-32">
                            <label className="block text-xs text-gray-400 mb-1">Language</label>
                            <select
                                value={newAsset.language}
                                onChange={(e) => setNewAsset({ ...newAsset, language: e.target.value })}
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
                                value={newAsset.variant}
                                onChange={(e) => setNewAsset({ ...newAsset, variant: e.target.value })}
                                className="input-field w-full py-1.5 text-sm"
                            >
                                <option value="PORTRAIT">Portrait</option>
                                <option value="LANDSCAPE">Landscape</option>
                                <option value="SQUARE">Square</option>
                                <option value="BANNER">Banner</option>
                            </select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs text-gray-400 mb-1">Image URL</label>
                            <input
                                type="url"
                                value={newAsset.url}
                                onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                                className="input-field w-full py-1.5 text-sm"
                                placeholder="https://..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !newAsset.url}
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
