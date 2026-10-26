import React, { useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const PostJobPage = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [workMode, setWorkMode] = useState('Remote');
    const [minExp, setMinExp] = useState(2);
    const [ctcMin, setCtcMin] = useState(1500000);
    const [ctcMax, setCtcMax] = useState(2500000);
    const [deadline, setDeadline] = useState('');

    const [skillsInput, setSkillsInput] = useState('');
    const [skills, setSkills] = useState(['React', 'Node.js', 'MongoDB']);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !location.trim()) {
            toast.warning('Title, description, and location are required.');
            return;
        }

        setSubmitting(true);
        try {
            await api.createJob({
                title,
                description,
                skills,
                location,
                workMode,
                minExp: Number(minExp),
                ctcRange: { min: Number(ctcMin), max: Number(ctcMax) },
                deadline: deadline ? new Date(deadline) : null
            });
            toast.success(`Job "${title}" successfully published!`);
            navigate('/recruiter/dashboard');
        } catch (err) {
            toast.error(err.message || 'Failed to post job.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-8">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Recruiter Console
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                    Post a New Job Opening
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Positions are indexed in MongoDB for high-performance faceted search.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Job Title *
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Lead Full Stack Architect"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                            Location *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Bangalore, India"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                            Work Mode
                        </label>
                        <select
                            value={workMode}
                            onChange={(e) => setWorkMode(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="On-site">On-site</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                            Min Experience (Yrs)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={minExp}
                            onChange={(e) => setMinExp(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                            CTC Min (₹ Annual)
                        </label>
                        <input
                            type="number"
                            step="50000"
                            value={ctcMin}
                            onChange={(e) => setCtcMin(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                            CTC Max (₹ Annual)
                        </label>
                        <input
                            type="number"
                            step="50000"
                            value={ctcMax}
                            onChange={(e) => setCtcMax(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Required Skills (Indexed for Candidate Match Score)
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            placeholder="Add skill (e.g. React, Docker, Python)..."
                            value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                        >
                            + Add Skill
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((s, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
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

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Job Description *
                    </label>
                    <textarea
                        rows="5"
                        placeholder="Detail the responsibilities, tech stack, and qualifications for this role..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Application Deadline (Optional)
                    </label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/recruiter/dashboard')}
                        className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                    >
                        {submitting ? 'Publishing...' : 'Publish Opening'}
                    </button>
                </div>
            </form>
        </div>
    );
};
