import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';

export const AdminDashboardPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const data = await api.getAdminAnalytics();
            setAnalytics(data);
        } catch (err) {
            toast.error(err.message || 'Failed to load admin analytics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    if (loading) {
        return <div className="text-center py-20 text-slate-400">Loading admin analytics...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Platform Administrator
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                    System-Wide Metrics & Funnel Oversight
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Real-time MongoDB aggregation metrics for users, postings, and global applications.
                </p>
            </div>

            {analytics && (
                <div className="space-y-8">
                    {/* High Level Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase">Total Users</span>
                            <div className="text-3xl font-black text-slate-900 mt-1">{analytics.users?.total || 0}</div>
                            <div className="text-xs text-slate-500 mt-1">
                                {analytics.users?.candidates || 0} Candidates • {analytics.users?.recruiters || 0} Recruiters
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase">Total Job Openings</span>
                            <div className="text-3xl font-black text-indigo-600 mt-1">{analytics.jobs?.total || 0}</div>
                            <div className="text-xs text-slate-500 mt-1">
                                {analytics.jobs?.active || 0} Active • {(analytics.jobs?.total || 0) - (analytics.jobs?.active || 0)} Closed
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase">Total Applications</span>
                            <div className="text-3xl font-black text-purple-600 mt-1">{analytics.applications?.total || 0}</div>
                            <div className="text-xs text-slate-500 mt-1">
                                Processed across all pipelines
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase">System Status</span>
                            <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center space-x-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                <span>Operational</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                IDOR Protection Active
                            </div>
                        </div>
                    </div>

                    {/* Stage Breakdown Table */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
                            Global Application Stage Distribution
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {['applied', 'shortlisted', 'interview', 'offered', 'rejected'].map((stage) => {
                                const count = analytics.applications?.stageBreakdown?.[stage] || 0;
                                return (
                                    <div key={stage} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                        <div className="text-2xl font-black text-slate-800">{count}</div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mt-1">{stage}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
