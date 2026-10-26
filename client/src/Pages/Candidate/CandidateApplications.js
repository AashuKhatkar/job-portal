import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const STAGES = ['applied', 'shortlisted', 'interview', 'offered'];

export const CandidateApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await api.getMyApplications();
            setApplications(data || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load your applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const getStageIndex = (stage) => {
        if (stage === 'rejected') return -1;
        return STAGES.indexOf(stage);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        My Applications & Pipeline Tracker
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Track live server-side stage transitions and notes from hiring teams.
                    </p>
                </div>
                <Link
                    to="/"
                    className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                    Browse More Jobs
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading your applications...</div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                    <div className="text-4xl mb-3">📄</div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No applications submitted yet</h3>
                    <p className="text-slate-500 text-xs mb-4">
                        Discover open roles in the Job Portal and apply with 1-click.
                    </p>
                    <Link
                        to="/"
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                    >
                        Explore Openings
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {applications.map((app) => {
                        const job = app.jobId || {};
                        const currentStageIdx = getStageIndex(app.stage);
                        const isRejected = app.stage === 'rejected';

                        return (
                            <div
                                key={app._id}
                                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                            {job.companyName || 'Hiring Company'}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                                            {job.title || 'Position'}
                                        </h3>
                                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                                            <span>📍 {job.location}</span>
                                            <span>•</span>
                                            <span>💼 {job.workMode}</span>
                                            <span>•</span>
                                            <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${
                                                isRejected
                                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                    : app.stage === 'offered'
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                            }`}
                                        >
                                            Stage: {app.stage}
                                        </span>
                                    </div>
                                </div>

                                {/* Pipeline Visual Progress Bar */}
                                <div className="my-6 px-4">
                                    {isRejected ? (
                                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center text-xs text-rose-700 font-semibold">
                                            Application marked as Not Selected. We appreciate your time and effort!
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            {/* Track line */}
                                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                                            <div
                                                className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
                                                style={{
                                                    width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%`
                                                }}
                                            ></div>

                                            {/* Stepper Dots */}
                                            <div className="relative z-10 flex justify-between">
                                                {STAGES.map((s, idx) => {
                                                    const isComplete = idx <= currentStageIdx;
                                                    const isCurrent = idx === currentStageIdx;

                                                    return (
                                                        <div key={s} className="flex flex-col items-center">
                                                            <div
                                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                                                    isCurrent
                                                                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                                                        : isComplete
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-white border-2 border-slate-300 text-slate-400'
                                                                }`}
                                                            >
                                                                {isComplete ? '✓' : idx + 1}
                                                            </div>
                                                            <span
                                                                className={`mt-2 text-[11px] font-bold capitalize ${
                                                                    isCurrent
                                                                        ? 'text-indigo-600'
                                                                        : isComplete
                                                                        ? 'text-slate-800'
                                                                        : 'text-slate-400'
                                                                }`}
                                                            >
                                                                {s}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Timeline History */}
                                {app.stageHistory && app.stageHistory.length > 0 && (
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                                            Activity History
                                        </h4>
                                        <div className="space-y-2">
                                            {app.stageHistory.map((hist, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg"
                                                >
                                                    <span className="font-bold text-indigo-600 uppercase text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                                        {hist.stage}
                                                    </span>
                                                    <span className="flex-1">
                                                        {hist.note || `Stage updated to ${hist.stage}`}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                        {new Date(hist.changedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
