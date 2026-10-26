import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';

export const RecruiterDashboardPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selected job for applicant review
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [applicantsData, setApplicantsData] = useState(null);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    // Note modal or input state
    const [newNote, setNewNote] = useState({});

    // Permitted state machine transitions
    const PERMITTED_ACTIONS = {
        applied: [
            { stage: 'shortlisted', label: 'Shortlist', color: 'bg-purple-600 hover:bg-purple-700' },
            { stage: 'rejected', label: 'Reject', color: 'bg-rose-600 hover:bg-rose-700' }
        ],
        shortlisted: [
            { stage: 'interview', label: 'Schedule Interview', color: 'bg-amber-600 hover:bg-amber-700' },
            { stage: 'rejected', label: 'Reject', color: 'bg-rose-600 hover:bg-rose-700' }
        ],
        interview: [
            { stage: 'offered', label: 'Extend Offer', color: 'bg-emerald-600 hover:bg-emerald-700' },
            { stage: 'rejected', label: 'Reject', color: 'bg-rose-600 hover:bg-rose-700' }
        ],
        offered: [
            { stage: 'rejected', label: 'Revoke / Reject', color: 'bg-rose-600 hover:bg-rose-700' }
        ],
        rejected: [
            { stage: 'applied', label: 'Reopen', color: 'bg-slate-600 hover:bg-slate-700' }
        ]
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, jobsRes] = await Promise.all([
                api.getRecruiterAnalytics(),
                api.getMyJobs()
            ]);
            setAnalytics(analyticsRes);
            setMyJobs(jobsRes || []);
            if (jobsRes?.length > 0 && !selectedJobId) {
                loadApplicants(jobsRes[0]._id);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to load recruiter data.');
        } finally {
            setLoading(false);
        }
    };

    const loadApplicants = async (jobId) => {
        setSelectedJobId(jobId);
        setLoadingApplicants(true);
        try {
            const data = await api.getJobApplicants(jobId);
            setApplicantsData(data);
        } catch (err) {
            toast.error(err.message || 'Failed to load applicants.');
        } finally {
            setLoadingApplicants(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStageTransition = async (applicationId, nextStage) => {
        try {
            await api.updateStage(applicationId, nextStage, `Moved to ${nextStage} stage by recruiter.`);
            toast.success(`Application updated to '${nextStage.toUpperCase()}'! Email notification sent.`);
            loadApplicants(selectedJobId);
            api.getRecruiterAnalytics().then(setAnalytics);
        } catch (err) {
            toast.error(err.message || 'Stage transition rejected by server state machine.');
        }
    };

    const handleAddNote = async (applicationId) => {
        const noteText = newNote[applicationId];
        if (!noteText || !noteText.trim()) return;

        try {
            await api.addRecruiterNote(applicationId, noteText);
            toast.success('Internal note added.');
            setNewNote({ ...newNote, [applicationId]: '' });
            loadApplicants(selectedJobId);
        } catch (err) {
            toast.error(err.message || 'Failed to add note.');
        }
    };

    const handleCloseJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to close this job posting? Candidates will no longer be able to apply.')) {
            return;
        }
        try {
            await api.closeJob(jobId);
            toast.success('Job posting closed.');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to close job.');
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-slate-400">Loading recruiter dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Recruiter Portal
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                        Applicant Funnel & Pipeline Analytics
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Review ranked applicants, manage state machine transitions, and monitor hiring velocity.
                    </p>
                </div>
            </div>

            {/* Analytics & Funnel Overview Cards */}
            {analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Active Jobs</span>
                        <div className="text-3xl font-black text-slate-900 mt-1">{analytics.activeJobs}</div>
                        <span className="text-[11px] text-slate-500">{analytics.totalJobs} total postings</span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Total Candidates</span>
                        <div className="text-3xl font-black text-indigo-600 mt-1">{analytics.totalApplications}</div>
                        <span className="text-[11px] text-slate-500">Across your openings</span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Offers Extended</span>
                        <div className="text-3xl font-black text-emerald-600 mt-1">{analytics.funnel?.offered || 0}</div>
                        <span className="text-[11px] text-slate-500">{analytics.funnel?.interview || 0} in interview</span>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Conversion Rate</span>
                        <div className="text-3xl font-black text-purple-600 mt-1">{analytics.conversionRate}%</div>
                        <span className="text-[11px] text-slate-500">Application to offer</span>
                    </div>
                </div>
            )}

            {/* Visual Funnel Bar */}
            {analytics?.funnel && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                    <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                        Hiring Funnel Stage Distribution (MongoDB Aggregation Pipeline)
                    </h2>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="font-bold text-blue-900 text-lg">{analytics.funnel.applied}</div>
                            <div className="text-blue-600 text-[11px] font-semibold uppercase mt-0.5">Applied</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="font-bold text-purple-900 text-lg">{analytics.funnel.shortlisted}</div>
                            <div className="text-purple-600 text-[11px] font-semibold uppercase mt-0.5">Shortlisted</div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="font-bold text-amber-900 text-lg">{analytics.funnel.interview}</div>
                            <div className="text-amber-600 text-[11px] font-semibold uppercase mt-0.5">Interview</div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="font-bold text-emerald-900 text-lg">{analytics.funnel.offered}</div>
                            <div className="text-emerald-600 text-[11px] font-semibold uppercase mt-0.5">Offered</div>
                        </div>
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                            <div className="font-bold text-rose-900 text-lg">{analytics.funnel.rejected}</div>
                            <div className="text-rose-600 text-[11px] font-semibold uppercase mt-0.5">Rejected</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Section: Job Selector & Applicant Review */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Your Posted Jobs List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                            Your Jobs ({myJobs.length})
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {myJobs.map((job) => (
                            <div
                                key={job._id}
                                onClick={() => loadApplicants(job._id)}
                                className={`p-4 rounded-2xl border cursor-pointer transition ${
                                    selectedJobId === job._id
                                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{job.title}</h3>
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            job.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {job.status}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mb-2">
                                    📍 {job.location} • {job.workMode}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                    <span className="font-semibold text-indigo-700">
                                        👥 {job.applicantCount} Applicant{job.applicantCount === 1 ? '' : 's'}
                                    </span>
                                    {job.status === 'active' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCloseJob(job._id);
                                            }}
                                            className="text-rose-500 hover:text-rose-700 font-semibold text-[11px]"
                                        >
                                            Close Job
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Applicants for Selected Job */}
                <div className="lg:col-span-2">
                    {loadingApplicants ? (
                        <div className="text-center py-20 text-slate-400">Loading applicants...</div>
                    ) : !applicantsData || applicantsData.applicants?.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <div className="text-4xl mb-3">📬</div>
                            <h3 className="text-base font-bold text-slate-800">No applicants yet for this job</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Candidates will appear here ranked by skill match score once they apply.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                    Ranked Applicants for: <span className="text-indigo-600">{applicantsData.job.title}</span> ({applicantsData.totalCount})
                                </h2>
                                <span className="text-[11px] text-slate-500">
                                    Sorted by Skill Match %
                                </span>
                            </div>

                            <div className="space-y-4">
                                {applicantsData.applicants.map((item) => {
                                    const allowedTransitions = PERMITTED_ACTIONS[item.stage] || [];

                                    return (
                                        <div
                                            key={item.applicationId}
                                            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="text-base font-black text-slate-900">
                                                            {item.candidate?.name || 'Candidate'}
                                                        </h3>
                                                        {/* Skill Match Badge */}
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                                item.matchScore >= 70
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : item.matchScore >= 40
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {item.matchScore}% Match
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {item.candidate?.headline || 'Applicant'} • {item.candidate?.experienceYears} yrs exp • Expected: ₹{(item.candidate?.expectedCtc / 100000).toFixed(1)} LPA
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        {item.stage}
                                                    </span>
                                                    <div className="text-[10px] text-slate-400 mt-1">
                                                        Applied: {new Date(item.appliedAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Candidate Skills */}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {item.candidate?.skills?.map((s, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Cover Note */}
                                            {item.coverNote && (
                                                <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 italic mb-3">
                                                    "{item.coverNote}"
                                                </div>
                                            )}

                                            {/* Resume Download & State Machine Transitions */}
                                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                                <a
                                                    href={`http://localhost:8080${item.resumeUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                                                >
                                                    <span>📄 Download Resume (Secure URL)</span>
                                                </a>

                                                {/* Permitted State Machine Action Buttons */}
                                                <div className="flex items-center space-x-2">
                                                    {allowedTransitions.map((trans) => (
                                                        <button
                                                            key={trans.stage}
                                                            onClick={() => handleStageTransition(item.applicationId, trans.stage)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition shadow-sm ${trans.color}`}
                                                        >
                                                            {trans.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Recruiter Internal Notes */}
                                            <div className="mt-4 pt-3 border-t border-slate-100">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">
                                                    Internal Recruiter Notes ({item.recruiterNotes?.length || 0})
                                                </span>

                                                {item.recruiterNotes?.length > 0 && (
                                                    <div className="space-y-1.5 mb-2">
                                                        {item.recruiterNotes.map((n, idx) => (
                                                            <div key={idx} className="bg-amber-50/60 border border-amber-200/60 p-2 rounded-lg text-xs text-amber-900">
                                                                <span className="font-bold text-[10px] text-amber-700 uppercase mr-1">
                                                                    {n.author}:
                                                                </span>
                                                                <span>{n.note}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Add an internal evaluation note..."
                                                        value={newNote[item.applicationId] || ''}
                                                        onChange={(e) => setNewNote({ ...newNote, [item.applicationId]: e.target.value })}
                                                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddNote(item.applicationId)}
                                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg"
                                                    >
                                                        Save Note
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
