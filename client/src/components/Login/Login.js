import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../ContextProvider/Context';

export const Login = () => {
    const { loginWithCredentials, quickLogin } = useContext(LoginContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await loginWithCredentials(email, password);
            toast.success(`Welcome back, ${data.user.name}!`);
            if (data.user.role === 'recruiter') {
                navigate('/recruiter/dashboard');
            } else if (data.user.role === 'admin') {
                navigate('/admin/analytics');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickLogin = async (role) => {
        try {
            const data = await quickLogin(role);
            toast.success(`Logged in as Demo ${role.toUpperCase()}`);
            if (role === 'recruiter') {
                navigate('/recruiter/dashboard');
            } else if (role === 'admin') {
                navigate('/admin/analytics');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.message || 'Quick login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md mb-3">
                        ATS
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Sign in to HirePulse</h1>
                    <p className="text-xs text-slate-500 mt-1">Multi-role Applicant Tracking System</p>
                </div>

                {/* 1-Click Demo Evaluation Logins */}
                <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                        One-Click Demo Credentials
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('candidate')}
                            className="px-2 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition text-center"
                        >
                            Candidate
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('recruiter')}
                            className="px-2 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 transition text-center"
                        >
                            Recruiter
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('admin')}
                            className="px-2 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition text-center"
                        >
                            Admin
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="e.g. candidate@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
                    >
                        {submitting ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="text-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};
