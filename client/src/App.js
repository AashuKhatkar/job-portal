import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { JobPortal } from './Pages/Jobs/JobPortal';
import { CandidateApplications } from './Pages/Candidate/CandidateApplications';
import { CandidateProfilePage } from './Pages/Candidate/CandidateProfilePage';
import { RecruiterDashboardPage } from './Pages/Recruiter/RecruiterDashboardPage';
import { PostJobPage } from './Pages/Recruiter/PostJobPage';
import { AdminDashboardPage } from './Pages/Admin/AdminDashboardPage';
import { Login } from './components/Login/Login';
import { Register } from './components/Login/Register';

function App() {
    return (
        <div className="App flex flex-col min-h-screen">
            <Routes>
                <Route path="/" element={<Navbar />}>
                    {/* Core Job Portal */}
                    <Route index element={<JobPortal />} />
                    <Route path="jobs" element={<JobPortal />} />

                    {/* Candidate Routes */}
                    <Route path="my-applications" element={<CandidateApplications />} />
                    <Route path="profile" element={<CandidateProfilePage />} />

                    {/* Recruiter Routes */}
                    <Route path="recruiter/dashboard" element={<RecruiterDashboardPage />} />
                    <Route path="recruiter/post-job" element={<PostJobPage />} />

                    {/* Admin Routes */}
                    <Route path="admin/analytics" element={<AdminDashboardPage />} />

                    {/* Auth Routes */}
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Register />} />

                    {/* Backward-compatibility routes */}
                    <Route path="all-jobs" element={<JobPortal />} />
                    <Route path="post-job" element={<PostJobPage />} />
                    <Route path="recruiter/review" element={<RecruiterDashboardPage />} />
                    <Route path="my-jobs" element={<CandidateApplications />} />

                    {/* Catch all fallback */}
                    <Route path="*" element={<JobPortal />} />
                </Route>
            </Routes>
            <Footer />
        </div>
    );
}

export default App;
