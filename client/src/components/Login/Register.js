import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';
import { LoginContext } from '../ContextProvider/Context';

export const Register = () => {
    const { setUser } = useContext(LoginContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('candidate');
    const [companyName, setCompanyName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await api.register({
                name,
                email,
                password,
                role,
                companyName: role === 'recruiter' ? companyName : ''
            });

            setUser(data.user);
            localStorage.setItem('ats_user', JSON.stringify(data.user));
            localStorage.setItem('ats_token', data.token);

            toast.success('Account successfully registered!');
            if (role === 'recruiter') {
                navigate('/recruiter/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.message || 'Registration failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md mb-3">
                        ATS
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Create an Account</h1>
                    <p className="text-xs text-slate-500 mt-1">Join the hiring marketplace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Alex Morgan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="e.g. alex@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Account Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole('candidate')}
                                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                                    role === 'candidate'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                Candidate
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('recruiter')}
                                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                                    role === 'recruiter'
                                        ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                Recruiter
                            </button>
                        </div>
                    </div>

                    {role === 'recruiter' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Company Name
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. FinTech Innovations"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition text-sm disabled:opacity-50"
                    >
                        {submitting ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                </form>

                <div className="text-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
};
