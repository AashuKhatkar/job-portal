import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';

export const CandidateProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);

    const [headline, setHeadline] = useState('');
    const [experienceYears, setExperienceYears] = useState(0);
    const [expectedCtc, setExpectedCtc] = useState(0);
    const [skillsInput, setSkillsInput] = useState('');
    const [skills, setSkills] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [portfolioInput, setPortfolioInput] = useState('');
    const [portfolioLinks, setPortfolioLinks] = useState([]);

    // Education
    const [education, setEducation] = useState([]);
    const [newEdu, setNewEdu] = useState({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await api.getProfile();
            if (data) {
                setHeadline(data.headline || '');
                setExperienceYears(data.experienceYears || 0);
                setExpectedCtc(data.expectedCtc || 0);
                setSkills(data.skills || []);
                setResumes(data.resumes || []);
                setPortfolioLinks(data.portfolioLinks || []);
                setEducation(data.education || []);
            }
        } catch (err) {
            toast.error('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAddSkill = (e) => {
        e.preventDefault();
        const trimmed = skillsInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
            setSkillsInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleAddPortfolio = (e) => {
        e.preventDefault();
        const trimmed = portfolioInput.trim();
        if (trimmed && !portfolioLinks.includes(trimmed)) {
            setPortfolioLinks([...portfolioLinks, trimmed]);
            setPortfolioInput('');
        }
    };

    const handleAddEducation = (e) => {
        e.preventDefault();
        if (!newEdu.institution || !newEdu.degree) {
            toast.warning('Institution and degree are required.');
            return;
        }
        setEducation([...education, { ...newEdu }]);
        setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' });
    };

    const handleRemoveEducation = (index) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size exceeds 2MB limit.');
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
            await api.uploadResume(file);
            toast.success('Resume securely uploaded and saved to profile!');
            fetchProfile();
        } catch (err) {
            toast.error(err.message || 'Failed to upload resume.');
        } finally {
            setUploadingResume(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.updateProfile({
                headline,
                experienceYears,
                expectedCtc,
                skills,
                portfolioLinks,
                education
            });
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-slate-400">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Candidate Profile Builder
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                    Your Professional Credentials
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Recruiters match against your indexed skills and private resumes when evaluating applications.
                </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Overview & Compensation
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Professional Headline
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Senior Full Stack Engineer (MERN & Cloud)"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Experience (Years)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={experienceYears}
                                onChange={(e) => setExperienceYears(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Expected CTC (Annual ₹)
                            </label>
                            <input
                                type="number"
                                step="50000"
                                min="0"
                                value={expectedCtc}
                                onChange={(e) => setExpectedCtc(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Skills & Competencies (Indexed for Matching)
                    </h2>

                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Add a skill (e.g. React, Node.js, AWS)..."
                            value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                        >
                            + Add Skill
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {skills.map((s, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                            >
                                <span>{s}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(s)}
                                    className="text-indigo-400 hover:text-indigo-700 font-bold ml-1"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Resumes Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Resumes (Private Documents)
                            </h2>
                            <p className="text-xs text-slate-500">
                                PDF/DOCX only, maximum 2MB. Protected by IDOR guards & served via signed links.
                            </p>
                        </div>
                    </div>

                    {resumes.length > 0 && (
                        <div className="space-y-2">
                            {resumes.map((r, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>📄</span>
                                        <span className="font-semibold text-slate-800">{r.name}</span>
                                        <span className="text-slate-400">
                                            • {new Date(r.uploadedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <a
                                        href={`http://localhost:8080${r.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 font-bold hover:underline"
                                    >
                                        Download Securely
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                        <label className="cursor-pointer block">
                            <span className="text-xs font-bold text-indigo-600 hover:underline">
                                {uploadingResume ? 'Uploading...' : '+ Upload Resume File (PDF / DOCX)'}
                            </span>
                            <span className="block text-[11px] text-slate-400 mt-1">
                                Maximum 2 MB • Server-validated MIME type
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

                {/* Education Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Education & Qualifications
                    </h2>

                    {education.length > 0 && (
                        <div className="space-y-2">
                            {education.map((edu, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                                >
                                    <div>
                                        <div className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</div>
                                        <div className="text-slate-500">{edu.institution} ({edu.startYear} - {edu.endYear})</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEducation(i)}
                                        className="text-rose-500 hover:text-rose-700 font-bold"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <input
                            type="text"
                            placeholder="Institution Name"
                            value={newEdu.institution}
                            onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                            className="px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            placeholder="Degree (e.g. B.Tech, M.S.)"
                            value={newEdu.degree}
                            onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                            className="px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            placeholder="Field of Study (e.g. Computer Science)"
                            value={newEdu.fieldOfStudy}
                            onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                            className="px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                placeholder="Start"
                                value={newEdu.startYear}
                                onChange={(e) => setNewEdu({ ...newEdu, startYear: e.target.value })}
                                className="w-1/2 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                            />
                            <input
                                type="number"
                                placeholder="End"
                                value={newEdu.endYear}
                                onChange={(e) => setNewEdu({ ...newEdu, endYear: e.target.value })}
                                className="w-1/2 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddEducation}
                        className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                        + Add Education Entry
                    </button>
                </div>

                {/* Portfolio Links */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Portfolio & Online Presence
                    </h2>

                    <div className="flex space-x-2">
                        <input
                            type="url"
                            placeholder="https://github.com/your-username or portfolio URL"
                            value={portfolioInput}
                            onChange={(e) => setPortfolioInput(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddPortfolio}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                        >
                            + Add Link
                        </button>
                    </div>

                    <div className="space-y-1">
                        {portfolioLinks.map((link, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">
                                    {link}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setPortfolioLinks(portfolioLinks.filter((_, i) => i !== idx))}
                                    className="text-rose-500 font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition text-sm disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};
