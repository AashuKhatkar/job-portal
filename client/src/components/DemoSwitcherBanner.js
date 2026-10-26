import React, { useContext } from 'react';
import { LoginContext } from './ContextProvider/Context';
import { toast } from 'react-toastify';

export const DemoSwitcherBanner = () => {
    const { user, quickLogin, logout } = useContext(LoginContext);

    const handleQuickSwitch = async (role) => {
        try {
            await quickLogin(role);
            toast.success(`Switched to demo ${role.toUpperCase()} account!`, { autoClose: 2000 });
        } catch (err) {
            toast.error(err.message || 'Failed to switch demo account');
        }
    };

    return (
        <aside aria-label="Demo Role Switcher" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs px-4 py-2 border-b border-indigo-800/50 shadow-inner">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                        Demo Evaluator
                    </span>
                    <span className="text-slate-300 hidden sm:inline">
                        1-Click Role Switcher (Project 10 Specification):
                    </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    <button
                        onClick={() => handleQuickSwitch('candidate')}
                        className={`px-2.5 py-1 rounded transition font-medium flex items-center space-x-1 ${
                            user?.role === 'candidate'
                                ? 'bg-indigo-600 text-white shadow ring-2 ring-indigo-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                        title="Login as Alex Morgan (Candidate)"
                    >
                        <span>👤</span>
                        <span>Candidate</span>
                    </button>

                    <button
                        onClick={() => handleQuickSwitch('recruiter')}
                        className={`px-2.5 py-1 rounded transition font-medium flex items-center space-x-1 ${
                            user?.role === 'recruiter'
                                ? 'bg-purple-600 text-white shadow ring-2 ring-purple-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                        title="Login as Sarah Jenkins (Recruiter @ FinTech Innovations)"
                    >
                        <span>💼</span>
                        <span>Recruiter</span>
                    </button>

                    <button
                        onClick={() => handleQuickSwitch('admin')}
                        className={`px-2.5 py-1 rounded transition font-medium flex items-center space-x-1 ${
                            user?.role === 'admin'
                                ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                        title="Login as System Admin"
                    >
                        <span>🛡️</span>
                        <span>Admin</span>
                    </button>

                    {user && (
                        <div className="flex items-center pl-2 border-l border-slate-700 space-x-2">
                            <span className="text-slate-400 hidden md:inline">
                                Signed in as: <strong className="text-slate-100">{user.name}</strong> ({user.role})
                            </span>
                            <button
                                onClick={logout}
                                className="text-rose-400 hover:text-rose-300 underline font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
