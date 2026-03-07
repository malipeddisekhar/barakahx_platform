const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;
const Resource = require('../models/Resource');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

// Configure Cloudinary from env vars
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: upload a buffer to Cloudinary and return { secure_url, public_id }
function uploadToCloudinary(buffer, publicId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'barakahx', resource_type: 'raw', public_id: publicId, access_mode: 'public' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
}

// Multer – memory storage (no disk writes on server)
const fileFilter = (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC and DOCX files are allowed'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── GET /api/resources ─ public ─────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET /api/resources/:id/download ─────────────────────────────────────────
// WHY this approach (private_download_url + stream):
//   - The Cloudinary account has CDN delivery restrictions, so the plain
//     secure_url returns 401 when fetched from the browser.
//   - private_download_url generates an AUTHENTICATED URL using the API key
//     and HMAC-SHA1 signature embedded as query params — goes to
//     api.cloudinary.com (not the CDN), bypasses ALL delivery restrictions.
//   - We stream the bytes from Cloudinary → our server → browser.
//     responseType:'stream' means nothing is buffered in RAM: safe on Render.
//   - The browser ONLY talks to our server (authenticated by JWT).
//     It NEVER contacts Cloudinary directly, so CDN 401 is impossible.
router.get('/:id/download', authMiddleware, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        const { fileUrl, filePublicId, fileName } = resource;
        console.log(`[DOWNLOAD] id=${req.params.id} fileName=${fileName} publicId=${filePublicId}`);

        // Guard: legacy resources with no Cloudinary public_id
        if (!filePublicId || !fileUrl || !fileUrl.startsWith('https://res.cloudinary.com')) {
            console.error(`[DOWNLOAD] Legacy resource — fileUrl="${fileUrl}"`);
            return res.status(410).json({
                message: 'This file needs to be re-uploaded by the admin.',
            });
        }

        // Build an authenticated Cloudinary API download URL.
        // This uses API key + secret (HMAC signature) — always works.
        const authUrl = cloudinary.utils.private_download_url(filePublicId, null, {
            resource_type: 'raw',
            type: 'upload',
        });

        console.log(`[DOWNLOAD] Fetching via authenticated API for: ${fileName}`);

        const upstream = await axios({
            method: 'GET',
            url: authUrl,
            responseType: 'stream',
            timeout: 60000,
        });

        const safeFileName = (fileName || 'download').replace(/[^\w\s.\-]/g, '_');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
        res.setHeader('Content-Type', upstream.headers['content-type'] || 'application/octet-stream');
        if (upstream.headers['content-length']) {
            res.setHeader('Content-Length', upstream.headers['content-length']);
        }

        upstream.data.on('error', (streamErr) => {
            console.error(`[DOWNLOAD] Stream error: ${streamErr.message}`);
            if (!res.headersSent) res.status(500).end();
        });
        upstream.data.pipe(res);
    } catch (err) {
        console.error(`[DOWNLOAD] Exception: ${err.message}`);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Download failed. Please try again.' });
        }
    }
});



// ─── GET /api/resources/:id ─ authenticated users only ───────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── POST /api/resources ─ admin only ────────────────────────────────────────
router.post('/', authMiddleware, requireRole('admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'A file is required' });
        }

        const { title, subject, category, description } = req.body;
        if (!title || !subject) {
            return res.status(400).json({ message: 'Title and subject are required' });
        }

        const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
        const safeOriginal = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const publicId = `${Date.now()}-${safeOriginal}`;
        const uploaded = await uploadToCloudinary(req.file.buffer, publicId);
        const fileUrl = uploaded.secure_url;
        const filePublicId = uploaded.public_id;

        const resource = new Resource({
            title,
            subject,
            category: category || 'placement',
            description: description || '',
            fileUrl,
            filePublicId,
            fileName: req.file.originalname,
            fileType: ext,
            // Admin is env-based (id = 'admin', not a valid ObjectId) — skip uploadedBy
            ...(req.user.role !== 'admin' && { uploadedBy: req.user._id }),
        });

        await resource.save();
        res.status(201).json(resource);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
});

// ─── PUT /api/resources/:id ─ admin only ────────────────────────────────────
router.put('/:id', authMiddleware, requireRole('admin'), upload.single('file'), async (req, res) => {
    try {
        const { title, subject, category, description } = req.body;
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        resource.title = title || resource.title;
        resource.subject = subject || resource.subject;
        resource.category = category || resource.category;
        resource.description = description !== undefined ? description : resource.description;

        // Replace file if new file uploaded
        if (req.file) {
            // Delete old file from Cloudinary
            if (resource.filePublicId) {
                await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: 'raw' });
            }
            const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
            const safeOriginal = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const publicId = `${Date.now()}-${safeOriginal}`;
            const uploaded = await uploadToCloudinary(req.file.buffer, publicId);
            resource.fileUrl = uploaded.secure_url;
            resource.filePublicId = uploaded.public_id;
            resource.fileName = req.file.originalname;
            resource.fileType = ext;
        }

        await resource.save();
        res.json(resource);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── DELETE /api/resources/:id ─ admin only ────────────────────────────────
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        // Delete file from Cloudinary
        if (resource.filePublicId) {
            await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: 'raw' });
        }

        await resource.deleteOne();
        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
