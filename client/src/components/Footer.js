import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 mt-auto py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                        H
                    </div>
                    <span className="font-bold text-slate-800 text-sm">HirePulse ATS</span>
                    <span>• Multi-Role Hiring Platform</span>
                </div>

                <div className="flex items-center space-x-6">
                    <Link to="/" className="hover:text-indigo-600 font-medium transition">
                        Job Board
                    </Link>
                    <Link to="/my-applications" className="hover:text-indigo-600 font-medium transition">
                        Tracker
                    </Link>
                    <Link to="/recruiter/dashboard" className="hover:text-indigo-600 font-medium transition">
                        Recruiter Funnel
                    </Link>
                    <Link to="/admin/analytics" className="hover:text-indigo-600 font-medium transition">
                        Admin Metrics
                    </Link>
                </div>

                <div className="text-slate-400">
                    © {new Date().getFullYear()} HirePulse. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
