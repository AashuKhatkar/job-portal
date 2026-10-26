import React, { useContext } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LoginContext } from './ContextProvider/Context';
import { DemoSwitcherBanner } from './DemoSwitcherBanner';

export const Navbar = () => {
    const { user, logout } = useContext(LoginContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            {/* Reviewer / Evaluator quick role switcher */}
            <DemoSwitcherBanner />

            {/* Main Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                    ATS
                                </div>
                                <div>
                                    <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                                        HirePulse
                                    </span>
                                    <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-widest block">
                                        Applicant Tracking System
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-1">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                    isActive('/') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                Job Portal
                            </Link>

                            {user?.role === 'candidate' && (
                                <>
                                    <Link
                                        to="/my-applications"
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                            isActive('/my-applications') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        My Applications
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                            isActive('/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        Profile & Resume
                                    </Link>
                                </>
                            )}

                            {user?.role === 'recruiter' && (
                                <>
                                    <Link
                                        to="/recruiter/dashboard"
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                            isActive('/recruiter/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        Recruiter Funnel
                                    </Link>
                                    <Link
                                        to="/recruiter/post-job"
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                            isActive('/recruiter/post-job') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        + Post Job
                                    </Link>
                                </>
                            )}

                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin/analytics"
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                        isActive('/admin/analytics') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    Platform Analytics
                                </Link>
                            )}
                        </nav>

                        {/* Auth / Account Controls */}
                        <div className="flex items-center space-x-3">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                        <div className="text-xs text-slate-500 capitalize">
                                            {user.role} {user.companyName ? `• ${user.companyName}` : ''}
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/login');
                                        }}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/login"
                                        className="text-sm font-semibold px-4 py-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Page content */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};
