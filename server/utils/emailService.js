import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback testing transporter (logs emails gracefully in dev)
        transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'windows',
            buffer: true
        });
    }
    return transporter;
};

export const sendStageChangeEmail = async ({ candidateEmail, candidateName, jobTitle, companyName, oldStage, newStage, note }) => {
    try {
        const mailClient = await getTransporter();

        const stageColors = {
            applied: '#3b82f6',
            shortlisted: '#8b5cf6',
            interview: '#f59e0b',
            offered: '#10b981',
            rejected: '#ef4444'
        };

        const stageColor = stageColors[newStage] || '#3b82f6';

        const subject = `Application Status Update: ${jobTitle} at ${companyName}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #111827; margin-bottom: 12px;">Hello ${candidateName},</h2>
                <p style="color: #4b5563; line-height: 1.5;">
                    There is an update on your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
                </p>
                <div style="margin: 20px 0; padding: 16px; background-color: #f9fafb; border-left: 4px solid ${stageColor}; border-radius: 4px;">
                    <span style="font-size: 14px; color: #6b7280; text-transform: uppercase;">Current Stage</span>
                    <h3 style="margin: 4px 0 0 0; color: ${stageColor}; text-transform: capitalize;">${newStage}</h3>
                </div>
                ${note ? `<p style="color: #4b5563; font-style: italic;">Note from hiring team: "${note}"</p>` : ''}
                <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                    You can log in to your dashboard at any time to track your application timeline.
                </p>
                <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
                    Applicant Tracking System Notification Service
                </div>
            </div>
        `;

        const info = await mailClient.sendMail({
            from: process.env.EMAIL_FROM || '"ATS Hiring Team" <no-reply@ats-portal.com>',
            to: candidateEmail,
            subject,
            html
        });

        console.log(`[Email Service] Status update email queued/sent to ${candidateEmail} for stage: ${newStage}`);
        return info;
    } catch (err) {
        console.error('[Email Service Error]', err.message);
        // Do not throw so that API stage transitions don't fail if SMTP is not configured
        return null;
    }
};
