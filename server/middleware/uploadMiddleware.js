import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('private_uploads/resumes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `resume-${req.user ? req.user._id : 'guest'}-${uniqueSuffix}${ext}`);
    }
});

const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
];

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and DOCX documents (up to 2MB) are allowed.'), false);
    }
};

export const resumeUpload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB max
    },
    fileFilter
});
