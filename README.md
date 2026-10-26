# Project 10: Job Portal & Applicant Tracking System (ATS)

A production-grade, two-sided MERN hiring platform with multi-role access control, faceted job search, server-enforced hiring state machine, secure access-controlled resume storage, and MongoDB aggregation analytics.

Built according to the **Hitbullseye Project 10: Job Portal & Applicant Tracking System** specification.

---

## ⚡ Quick Demo Evaluation Credentials

Use the **1-Click Demo Switcher Banner** at the top of the web app, or sign in using these pre-seeded demo accounts:

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Candidate** | `candidate@example.com` | `Candidate@123` | Search jobs with faceted filters, 1-click apply, view application pipeline tracker, manage profile & private resumes |
| **Recruiter** | `recruiter@example.com` | `Recruiter@123` | Post openings, view ranked applicants (match score %), move stages with state machine enforcement, add notes |
| **Admin** | `admin@example.com` | `Admin@123` | Platform-wide aggregation analytics (users, jobs, applications stage breakdown) |

---

## 🚀 Key Architectural Features

### 1. Multi-Role Architecture & IDOR Prevention
- Strict role separation (`candidate`, `recruiter`, `admin`) enforced by server-side middleware on every route.
- **IDOR Protection**: 
  - Recruiters can only access applicants and resumes for jobs they own.
  - Candidates can only access their own profile and private documents.
  - Resumes are served through signed, access-controlled endpoints (`/api/files/:filename?token=...`), never public unauthenticated links.

### 2. High-Performance Faceted Search
- Fast faceted search (`GET /api/jobs?role=&location=&minExp=&ctc=&skills=&workMode=&page=&limit=`).
- Backed by MongoDB **compound indexes** (`{ skills: 1, location: 1, minExp: 1, status: 1 }`) and text search indexes.

### 3. Application State Machine
- Permitted pipeline transitions enforced server-side:
  - `applied` ➔ `shortlisted` / `rejected`
  - `shortlisted` ➔ `interview` / `rejected`
  - `interview` ➔ `offered` / `rejected`
  - `offered` ➔ `rejected`
- **Duplicate Prevention**: Backed by a unique compound database index on `{ jobId: 1, candidateId: 1 }` (returns 409 Conflict if candidate tries to apply twice).
- **Email Notifications**: Automated templated status change emails dispatched via Nodemailer.

### 4. Recruiter & Admin Analytics
- MongoDB aggregation pipelines calculate real-time hiring funnel metrics:
  - Pipeline stage breakdown (`applied`, `shortlisted`, `interview`, `offered`, `rejected`)
  - Active vs. closed jobs
  - Application-to-offer conversion rate percentage

### 5. Secure File Uploads
- Max file size: 2MB.
- File formats: PDF and DOCX only.
- Validated by MIME type on the server, not just the file extension.

### 6. Security Hardening
- `helmet` security headers.
- `cors` whitelisting.
- `express-rate-limit` on authentication and application submissions.
- `express-mongo-sanitize` for NoSQL injection prevention.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, React Toastify, Context API.
- **Backend**: Node.js, Express, Mongoose, Multer, Nodemailer, JWT, Helmet, Express-Rate-Limit.
- **Database**: MongoDB (Local or MongoDB Atlas).

---

## 📋 Core Data Models

- **`User`**: `{ name, email, passwordHash, role, companyName, companyId }`
- **`CandidateProfile`**: `{ userId, headline, skills[] (indexed), experienceYears, education[], resumes[], expectedCtc, portfolioLinks[] }`
- **`Job`**: `{ recruiterId, companyName, title, description, skills[], location, workMode, minExp, ctcRange, status, deadline }` with compound index `{ skills: 1, location: 1, minExp: 1, status: 1 }`
- **`Application`**: `{ jobId, candidateId, resumeUrl, coverNote, stage, stageHistory[], recruiterNotes[] }` with unique compound index `{ jobId: 1, candidateId: 1 }`

---

## 🔌 Key API Endpoints

- `POST /api/auth/register` - Create candidate or recruiter account
- `POST /api/auth/login` - Authenticate with rate limiting & issue JWT
- `GET /api/jobs` - Faceted search with filters & pagination
- `POST /api/jobs` - Post job opening (recruiter only)
- `PATCH /api/jobs/:id/close` - Close job posting (recruiter owner only)
- `GET /api/jobs/:id/applicants` - View ranked applicants & match score (recruiter owner only)
- `POST /api/applications` - One-click apply (candidate only; duplicate prevented by DB index)
- `GET /api/applications/me` - Candidate's application tracker & pipeline stepper
- `PATCH /api/applications/:id/stage` - Enforce state machine stage transition & trigger email
- `POST /api/applications/:id/notes` - Add internal recruiter evaluation note
- `POST /api/uploads/resume` - Upload resume (max 2MB, PDF/DOCX)
- `GET /api/files/:filename` - Access-controlled / signed resume download
- `GET /api/analytics/recruiter` - Recruiter funnel aggregation pipeline
- `GET /api/analytics/admin` - Platform-wide statistics

---

## 🚀 Running the Project

### 1. Server Setup
```bash
cd server
npm install
```

Configure `.env` in `server/.env`:
```env
PORT=8080
MONGODB_URL=mongodb://127.0.0.1:27017/ats
JWT_SECRET=ats_super_secret_jwt_key_2024
```

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:8080
# Database automatically seeds demo data on first start!
```

### 2. Client Setup
```bash
cd client
npm install
npm start
# Client opens on http://localhost:3000
```

---

## 🎓 Placement & Interview Discussion Points

- **How do you enforce that a recruiter can only view applicants for jobs they own?**
  - In `server/controllers/jobController.js` (`getJobApplicants`) and `server/controllers/applicationController.js` (`updateApplicationStage`), we verify `String(job.recruiterId) === String(req.user._id)`. Unauthorized requests receive `403 Forbidden`.
- **What is IDOR, and how did you prevent it on the resume download endpoint?**
  - Insecure Direct Object Reference occurs when a user accesses a file simply by guessing the URL/ID. We prevent this in `server/controllers/fileController.js` by checking either a short-lived HMAC signed token or verifying that the requester is either the uploader or the recruiter of the job the candidate applied for.
- **How do you prevent duplicate applications? Why is a unique index better than a find-then-insert check?**
  - We use MongoDB compound unique indexing: `ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true })`. A `find-then-insert` check suffers from race conditions under concurrent requests. The unique database index guarantees atomicity.
- **How do you model and enforce valid application-stage transitions?**
  - In `server/controllers/applicationController.js`, `PERMITTED_TRANSITIONS` defines an acyclic state machine graph (`applied -> shortlisted/rejected -> interview -> offered`). The server rejects invalid skips with `400 Bad Request`.
