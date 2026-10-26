import React, { useState, useEffect, useContext } from 'react';
import { api } from '../../utils/api';
import { LoginContext } from '../../components/ContextProvider/Context';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export const JobPortal = () => {
    const { user } = useContext(LoginContext);

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ totalCount: 0, currentPage: 1, totalPages: 1 });

    // Faceted filters
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [workMode, setWorkMode] = useState('all');
    const [minExp, setMinExp] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');

    // Apply Modal state
    const [selectedJob, setSelectedJob] = useState(null);
    const [candidateProfile, setCandidateProfile] = useState(null);
    const [selectedResumeUrl, setSelectedResumeUrl] = useState('');
    const [coverNote, setCoverNote] = useState('');
    const [uploadingResume, setUploadingResume] = useState(false);
    const [applying, setApplying] = useState(false);

    const commonSkills = ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express', 'TailwindCSS', 'AWS', 'Python'];

    const fetchJobs = async (page = 1) => {
        setLoading(true);
        try {
            const data = await api.getJobs({
                search,
                location,
                workMode,
                minExp,
                skills: selectedSkill,
                page,
                limit: 9
            });
            setJobs(data.jobs || []);
            setPagination(data.pagination || { totalCount: 0, currentPage: 1, totalPages: 1 });
        } catch (err) {
            toast.error('Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs(1);
    }, [workMode, minExp, selectedSkill]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchJobs(1);
    };

    const handleOpenApplyModal = async (job) => {
        if (!user) {
            toast.info('Please log in as a candidate to apply.');
            return;
        }
        if (user.role !== 'candidate') {
            toast.warning(`Only candidates can apply. You are currently logged in as '${user.role}'. Use the banner above to switch to Candidate.`);
            return;
        }

        setSelectedJob(job);
        setCoverNote('');

        try {
            const profile = await api.getProfile();
            setCandidateProfile(profile);
            if (profile.resumes && profile.resumes.length > 0) {
                setSelectedResumeUrl(profile.resumes[0].url);
            } else {
                setSelectedResumeUrl('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check: 2MB max
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size exceeds 2MB limit. Please upload a smaller PDF or DOCX file.');
            return;
        }

        const allowedExtensions = ['.pdf', '.docx', '.doc'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            toast.error('Only PDF and DOCX files are allowed.');
            return;
        }

        setUploadingResume(true);
        try {
            const data = await api.uploadResume(file);
            setSelectedResumeUrl(data.file.url);
            toast.success('Resume uploaded successfully (Private & Encrypted)!');
            const updatedProfile = await api.getProfile();
            setCandidateProfile(updatedProfile);
        } catch (err) {
            toast.error(err.message || 'Failed to upload resume.');
        } finally {
            setUploadingResume(false);
        }
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        if (!selectedResumeUrl) {
            toast.error('Please choose or upload a resume to submit your application.');
            return;
        }

        setApplying(true);
        try {
            await api.applyForJob({
                jobId: selectedJob._id,
                resumeUrl: selectedResumeUrl,
                coverNote
            });
            toast.success(`Application successfully submitted for ${selectedJob.title}!`, { autoClose: 3500 });
            setSelectedJob(null);
        } catch (err) {
            // Duplicate prevention handling
            toast.error(err.message || 'Failed to submit application.');
        } finally {
            setApplying(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Competitive';
        return `₹${(amount / 100000).toFixed(1)} LPA`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-indigo-400/30">
                        Hitbullseye Project 10 • Verified Architecture
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
                        Discover & Track High-Impact Tech Careers
                    </h1>
                    <p className="text-indigo-200 text-sm sm:text-base leading-relaxed mb-6">
                        Explore openings with transparent salary bands, structured interview pipelines, and server-validated role access.
                    </p>
                </div>
            </div>

            {/* Faceted Search & Filters */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2 relative">
                            <input
                                type="text"
                                placeholder="Search by role, skill, or keyword (e.g. MERN, React, Backend)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Location (e.g. Bangalore, Remote)..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full h-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center justify-center space-x-2"
                            >
                                <span>Filter Jobs</span>
                            </button>
                        </div>
                    </div>

                    {/* Secondary Facets */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-sm">
                        {/* Work Mode */}
                        <div className="flex items-center space-x-1">
                            <span className="text-slate-500 text-xs font-semibold uppercase mr-2">Work Mode:</span>
                            {['all', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setWorkMode(mode)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                        workMode === mode
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {mode === 'all' ? 'All' : mode}
                                </button>
                            ))}
                        </div>

                        {/* Experience */}
                        <div className="flex items-center space-x-2">
                            <span className="text-slate-500 text-xs font-semibold uppercase">Min Experience:</span>
                            <select
                                value={minExp}
                                onChange={(e) => setMinExp(e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Any</option>
                                <option value="0">Freshers / 0+ yrs</option>
                                <option value="2">2+ years</option>
                                <option value="3">3+ years</option>
                                <option value="5">5+ years</option>
                            </select>
                        </div>

                        {/* Skills Chips */}
                        <div className="flex items-center flex-wrap gap-1.5">
                            <span className="text-slate-500 text-xs font-semibold uppercase mr-1">Skill Filter:</span>
                            {commonSkills.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
                                    className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition ${
                                        selectedSkill === skill
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {skill}
                                </button>
                            ))}
                            {selectedSkill && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedSkill('')}
                                    className="text-xs text-rose-500 hover:underline font-semibold ml-1"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Jobs Listing */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                        Available Openings ({pagination.totalCount})
                    </h2>
                    {user?.role === 'recruiter' && (
                        <Link
                            to="/recruiter/post-job"
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                        >
                            + Post New Opening
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">No matching jobs found</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            Try adjusting your filters or search terms.
                        </p>
                        <button
                            onClick={() => {
                                setSearch('');
                                setLocation('');
                                setWorkMode('all');
                                setMinExp('');
                                setSelectedSkill('');
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div
                                key={job._id}
                                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div>
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                                                {job.companyName}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900 mt-0.5 leading-snug">
                                                {job.title}
                                            </h3>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                                                job.workMode === 'Remote'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : job.workMode === 'Hybrid'
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}
                                        >
                                            {job.workMode}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-3 text-xs text-slate-500 mb-4">
                                        <span>📍 {job.location}</span>
                                        <span>•</span>
                                        <span>💼 {job.minExp ? `${job.minExp}+ yrs exp` : 'Entry Level'}</span>
                                    </div>

                                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                                        {job.description}
                                    </p>

                                    {/* Skills Tags */}
                                    <div className="flex flex-wrap gap-1 mb-5">
                                        {job.skills?.slice(0, 4).map((s, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                        {job.skills?.length > 4 && (
                                            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[11px]">
                                                +{job.skills.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Compensation</div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {job.ctcRange?.min
                                                ? `${formatCurrency(job.ctcRange.min)} - ${formatCurrency(job.ctcRange.max)}`
                                                : 'Disclosed on apply'}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleOpenApplyModal(job)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                                    >
                                        One-Click Apply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                        <button
                            disabled={pagination.currentPage <= 1}
                            onClick={() => fetchJobs(pagination.currentPage - 1)}
                            className="px-3 py-1.5 border rounded-lg text-xs font-semibold disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-slate-500 font-medium">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            disabled={pagination.currentPage >= pagination.totalPages}
                            onClick={() => fetchJobs(pagination.currentPage + 1)}
                            className="px-3 py-1.5 border rounded-lg text-xs font-semibold disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* One-Click Apply Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-bold text-indigo-600 uppercase">One-Click Application</span>
                                <h3 className="text-xl font-black text-slate-900">{selectedJob.title}</h3>
                                <p className="text-xs text-slate-500">{selectedJob.companyName} • {selectedJob.location}</p>
                            </div>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleApplySubmit} className="space-y-4">
                            {/* Resume Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Select Resume (Private & Access Controlled)
                                </label>

                                {candidateProfile?.resumes?.length > 0 ? (
                                    <div className="space-y-2 mb-2">
                                        {candidateProfile.resumes.map((r, i) => (
                                            <label
                                                key={i}
                                                className={`flex items-center p-3 rounded-xl border cursor-pointer text-xs transition ${
                                                    selectedResumeUrl === r.url
                                                        ? 'border-indigo-600 bg-indigo-50/50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="resume"
                                                    checked={selectedResumeUrl === r.url}
                                                    onChange={() => setSelectedResumeUrl(r.url)}
                                                    className="text-indigo-600 mr-3"
                                                />
                                                <span className="font-semibold text-slate-800">{r.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-amber-600 mb-2">
                                        No resume found on your profile. Please upload one below.
                                    </p>
                                )}

                                {/* File Upload Constraint (PDF/DOCX only, max 2MB) */}
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50">
                                    <label className="cursor-pointer block">
                                        <span className="text-xs font-semibold text-indigo-600 hover:underline">
                                            {uploadingResume ? 'Uploading & Encrypting...' : '+ Upload New Resume (PDF / DOCX)'}
                                        </span>
                                        <span className="block text-[10px] text-slate-400 mt-0.5">
                                            Maximum size: 2MB (Server MIME-type validated)
                                        </span>
                                        <input
                                            type="file"
                                            accept=".pdf,.docx,.doc"
                                            onChange={handleResumeUpload}
                                            disabled={uploadingResume}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Optional Cover Note */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                                    Cover Note (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Brief note to the recruiter explaining why you're a great fit..."
                                    value={coverNote}
                                    onChange={(e) => setCoverNote(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-500 flex items-center space-x-2">
                                <span>🔒</span>
                                <span>
                                    <strong>IDOR Protection Enabled:</strong> Only the assigned recruiter of this job can view your resume. Duplicate submissions are strictly prevented.
                                </span>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedJob(null)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={applying || !selectedResumeUrl}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                                >
                                    {applying ? 'Submitting...' : 'Confirm Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
