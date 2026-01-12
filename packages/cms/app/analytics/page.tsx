'use client';

import { Layout } from '../components/Layout';
import { AuthProvider } from '../lib/auth';
import { BarChart3, Users, DollarSign, Activity, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <AuthProvider>
            <Layout>
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-600 mt-1">Overview of your platform's performance</p>
                        </div>
                        <div className="flex gap-3">
                            <select className="bg-white border text-sm border-gray-300 text-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 90 days</option>
                            </select>
                            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                                Export Report
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Users"
                            value="24.8k"
                            change="+12.5%"
                            trend="up"
                            icon={Users}
                            color="blue"
                        />
                        <StatCard
                            title="Total Revenue"
                            value="$84,320"
                            change="+8.2%"
                            trend="up"
                            icon={DollarSign}
                            color="green"
                        />
                        <StatCard
                            title="Active Streams"
                            value="1,429"
                            change="-2.1%"
                            trend="down"
                            icon={Activity}
                            color="purple"
                        />
                        <StatCard
                            title="Avg. Watch Time"
                            value="42m"
                            change="+4.3%"
                            trend="up"
                            icon={BarChart3}
                            color="orange"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart Section */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span>Subscriptions</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                                        <span>Ads</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dummy Chart Visualization */}
                            <div className="h-64 flex items-end justify-between gap-2 mt-4 px-2">
                                {[35, 45, 30, 60, 75, 50, 65, 80, 55, 70, 45, 60].map((height, i) => (
                                    <div key={i} className="w-full bg-gray-50 rounded-t-sm relative group">
                                        <div
                                            className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-600"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-xs text-gray-400">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                <ActivityItem
                                    title="New User Subscription"
                                    desc="Premium plan - $12.99"
                                    time="2 min ago"
                                    initials="JD"
                                    color="bg-blue-100 text-blue-600"
                                />
                                <ActivityItem
                                    title="New Comment"
                                    desc="On 'Introduction to React'"
                                    time="15 min ago"
                                    initials="AS"
                                    color="bg-purple-100 text-purple-600"
                                />
                                <ActivityItem
                                    title="System Alert"
                                    desc="Server load peak (85%)"
                                    time="1 hr ago"
                                    initials="SYS"
                                    color="bg-orange-100 text-orange-600"
                                />
                                <ActivityItem
                                    title="New User Registration"
                                    desc="via Google Auth"
                                    time="3 hrs ago"
                                    initials="MK"
                                    color="bg-green-100 text-green-600"
                                />
                            </div>
                            <button className="w-full mt-6 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                                View All Activity
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        </AuthProvider>
    );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
    const isUp = trend === 'up';
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className={`flex items-center text-sm font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {isUp ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                    {change}
                </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}

function ActivityItem({ title, desc, time, initials, color }: any) {
    return (
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${color}`}>
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 truncate">{desc}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
        </div>
    );
}
