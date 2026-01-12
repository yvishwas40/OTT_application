'use client';

import { Layout } from '../components/Layout';
import { AuthProvider } from '../lib/auth';
import { Settings, Globe, Bell, Shield, Mail, Save, User, Smartphone } from 'lucide-react';

export default function SettingsPage() {
    return (
        <AuthProvider>
            <Layout>
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                            <p className="text-gray-600 mt-1">Manage your application configuration and preferences</p>
                        </div>
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                            <Save className="h-4 w-4" />
                            Save Changes
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar Navigation (Dummy) */}
                        <div className="lg:col-span-1">
                            <nav className="space-y-1">
                                <NavButton active icon={Globe} label="General" />
                                <NavButton icon={User} label="Account" />
                                <NavButton icon={Bell} label="Notifications" />
                                <NavButton icon={Shield} label="Security" />
                                <NavButton icon={Smartphone} label="Mobile App" />
                            </nav>
                        </div>

                        {/* Main Settings Form */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* General Section */}
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                                        <input
                                            type="text"
                                            defaultValue="My Awesome OTT"
                                            className="w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <input
                                                type="email"
                                                defaultValue="support@example.com"
                                                className="w-full rounded-lg border-gray-300 border p-2.5 pl-10 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
                                        <select className="w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                                            <option>10</option>
                                            <option>20</option>
                                            <option>50</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Features Section */}
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <Shield className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900">Features & Privacy</h2>
                                </div>
                                <div className="space-y-4">
                                    <Toggle
                                        label="Maintenance Mode"
                                        desc="Temporarily disable access to the public site"
                                    />
                                    <Toggle
                                        label="Public Registration"
                                        desc="Allow new users to sign up"
                                        checked
                                    />
                                    <Toggle
                                        label="Content Moderation"
                                        desc="Automatically flag inappropriate comments"
                                        checked
                                    />
                                </div>
                            </section>

                            {/* Notifications Section */}
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <Bell className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Email Digest</p>
                                            <p className="text-xs text-gray-500">Receive a weekly summary of activity</p>
                                        </div>
                                        <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                                            <p className="text-xs text-gray-500">Real-time alerts for new orders</p>
                                        </div>
                                        <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </Layout>
        </AuthProvider>
    );
}

function NavButton({ active, icon: Icon, label }: any) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}>
            <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
            {label}
        </button>
    )
}

function Toggle({ label, desc, checked }: any) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={checked} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
}
