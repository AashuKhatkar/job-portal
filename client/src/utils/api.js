const BASE_URL = 'http://localhost:8080/api';

const getHeaders = (isMultipart = false) => {
    const headers = {};
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('ats_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
};

export const api = {
    // Auth
    async login(email, password) {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return handleResponse(res);
    },

    async register(data) {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    async getMe() {
        const res = await fetch(`${BASE_URL}/auth/me`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    // Jobs
    async getJobs(params = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                searchParams.append(key, val);
            }
        });
        const res = await fetch(`${BASE_URL}/jobs?${searchParams.toString()}`);
        return handleResponse(res);
    },

    async getJobById(id) {
        const res = await fetch(`${BASE_URL}/jobs/${id}`);
        return handleResponse(res);
    },

    async createJob(jobData) {
        const res = await fetch(`${BASE_URL}/jobs`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(jobData)
        });
        return handleResponse(res);
    },

    async closeJob(id) {
        const res = await fetch(`${BASE_URL}/jobs/${id}/close`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    async getMyJobs() {
        const res = await fetch(`${BASE_URL}/jobs/my/listings`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    async getJobApplicants(jobId) {
        const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    // Applications & State Machine
    async applyForJob({ jobId, resumeUrl, coverNote }) {
        const res = await fetch(`${BASE_URL}/applications`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ jobId, resumeUrl, coverNote })
        });
        return handleResponse(res);
    },

    async getMyApplications() {
        const res = await fetch(`${BASE_URL}/applications/me`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    async updateStage(applicationId, stage, note) {
        const res = await fetch(`${BASE_URL}/applications/${applicationId}/stage`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ stage, note })
        });
        return handleResponse(res);
    },

    async addRecruiterNote(applicationId, note) {
        const res = await fetch(`${BASE_URL}/applications/${applicationId}/notes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ note })
        });
        return handleResponse(res);
    },

    // Profile & Resumes
    async getProfile() {
        const res = await fetch(`${BASE_URL}/profile`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    async updateProfile(profileData) {
        const res = await fetch(`${BASE_URL}/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(profileData)
        });
        return handleResponse(res);
    },

    async uploadResume(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${BASE_URL}/uploads/resume`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData
        });
        return handleResponse(res);
    },

    // Analytics
    async getRecruiterAnalytics() {
        const res = await fetch(`${BASE_URL}/analytics/recruiter`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    async getAdminAnalytics() {
        const res = await fetch(`${BASE_URL}/analytics/admin`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    }
};
