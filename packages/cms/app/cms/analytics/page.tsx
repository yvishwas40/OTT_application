'use client';

import { CMSLayout } from '../../components/CMSLayout';
import { BarChart3 } from 'lucide-react';

export default function CMSAnalyticsPage() {
    return (
        <CMSLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Analytics</h1>
                        <p className="text-gray-400">Track your platform performance</p>
                    </div>
                </div>

                <div className="card p-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <BarChart3 className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
                    <p className="text-gray-400">
                        Detailed analytics and reporting features are currently under development.
                    </p>
                </div>
            </div>
        </CMSLayout>
    );
}
