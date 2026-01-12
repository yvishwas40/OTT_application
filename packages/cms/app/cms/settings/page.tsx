'use client';

import { CMSLayout } from '../../components/CMSLayout';
import { Settings } from 'lucide-react';

export default function CMSSettingsPage() {
    return (
        <CMSLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="text-gray-400">Manage platform configuration</p>
                    </div>
                </div>

                <div className="card p-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <Settings className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Platform Settings</h3>
                    <p className="text-gray-400">
                        System configuration options will be available here.
                    </p>
                </div>
            </div>
        </CMSLayout>
    );
}
