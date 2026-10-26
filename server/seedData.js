import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import CandidateProfile from './models/CandidateProfile.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/ats';

export const seedDatabase = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URL);
        }

        console.log('--- Seeding Database with Demo Accounts and Jobs ---');

        // Check if users already exist
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log('Database already has users. Skipping full wipe to preserve data.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const candidatePass = await bcrypt.hash('Candidate@123', salt);
        const recruiterPass = await bcrypt.hash('Recruiter@123', salt);
        const adminPass = await bcrypt.hash('Admin@123', salt);

        // 1. Create Users
        const candidate = await User.create({
            name: 'Alex Morgan',
            email: 'candidate@example.com',
            passwordHash: candidatePass,
            role: 'candidate'
        });

        const recruiter = await User.create({
            name: 'Sarah Jenkins',
            email: 'recruiter@example.com',
            passwordHash: recruiterPass,
            role: 'recruiter',
            companyName: 'FinTech Innovations'
        });

        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@example.com',
            passwordHash: adminPass,
            role: 'admin',
            companyName: 'Platform Ops'
        });

        // 2. Create Candidate Profile
        await CandidateProfile.create({
            userId: candidate._id,
            headline: 'Senior Full Stack Engineer (MERN & Cloud)',
            skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'Docker', 'TailwindCSS'],
            experienceYears: 4,
            expectedCtc: 2400000,
            education: [
                {
                    institution: 'National Institute of Technology',
                    degree: 'Bachelor of Technology',
                    fieldOfStudy: 'Computer Science & Engineering',
                    startYear: 2018,
                    endYear: 2022
                }
            ],
            resumes: [
                {
                    url: '/api/files/sample-resume.pdf',
                    name: 'Alex_Morgan_Resume_2024.pdf',
                    fileId: 'sample-resume.pdf'
                }
            ],
            portfolioLinks: ['https://github.com/alex-morgan', 'https://alexmorgan.dev']
        });

        // 3. Create Sample Jobs
        const jobs = await Job.create([
            {
                recruiterId: recruiter._id,
                companyName: 'FinTech Innovations',
                title: 'Senior MERN Stack Developer',
                description: 'We are seeking an experienced Full Stack Developer to lead the architecture of our core payments portal. You will build highly scalable RESTful services with Node.js/Express and dynamic interfaces using React 18 and TailwindCSS.',
                skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
                location: 'Bangalore, India (Hybrid)',
                workMode: 'Hybrid',
                minExp: 3,
                ctcRange: { min: 2000000, max: 3200000 },
                status: 'active',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                recruiterId: recruiter._id,
                companyName: 'FinTech Innovations',
                title: 'Backend Node.js Engineer',
                description: 'Design and deploy high-throughput microservices handling millions of financial transactions daily. Heavy focus on MongoDB indexing, caching with Redis, and robust API security.',
                skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'AWS'],
                location: 'Remote',
                workMode: 'Remote',
                minExp: 2,
                ctcRange: { min: 1600000, max: 2500000 },
                status: 'active',
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
            },
            {
                recruiterId: recruiter._id,
                companyName: 'FinTech Innovations',
                title: 'Frontend React Architect',
                description: 'Craft elegant, accessible, and performant user interfaces for our wealth management suite. Deep expertise in React hooks, state management, and modern CSS frameworks required.',
                skills: ['React', 'TailwindCSS', 'Redux', 'JavaScript', 'HTML5'],
                location: 'Mumbai, India',
                workMode: 'On-site',
                minExp: 4,
                ctcRange: { min: 2200000, max: 3500000 },
                status: 'active',
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
            }
        ]);

        // 4. Create Sample Application
        await Application.create({
            jobId: jobs[0]._id,
            candidateId: candidate._id,
            resumeUrl: '/api/files/sample-resume.pdf',
            coverNote: 'Excited about the role! I have 4 years of hands-on experience building production MERN applications.',
            stage: 'shortlisted',
            stageHistory: [
                {
                    stage: 'applied',
                    changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    changedBy: candidate._id,
                    note: 'Applied online'
                },
                {
                    stage: 'shortlisted',
                    changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    changedBy: recruiter._id,
                    note: 'Strong portfolio and relevant MERN stack background.'
                }
            ],
            recruiterNotes: [
                {
                    note: 'Passed initial resume screening with 85% skill match. Schedule technical round.',
                    author: 'Sarah Jenkins',
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                }
            ]
        });

        console.log('--- Demo Data Seeded Successfully ---');
        console.log('Candidate: candidate@example.com / Candidate@123');
        console.log('Recruiter: recruiter@example.com / Recruiter@123');
        console.log('Admin:     admin@example.com / Admin@123');
    } catch (error) {
        console.error('Seed error:', error);
    }
};

// If run directly: node seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
    seedDatabase().then(() => process.exit(0));
}
