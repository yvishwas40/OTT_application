'use client';

import { Layout } from '../components/Layout';
import { AuthProvider } from '../lib/auth';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <AuthProvider>
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                            <p className="text-gray-600">Track your platform performance</p>
                        </div>
                    </div>

                    <div className="card p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <BarChart3 className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                        <p className="text-gray-600">
                            Detailed analytics and reporting features are currently under development.
                        </p>
                    </div>
                </div>
            </Layout>
        </AuthProvider>
    );
}
