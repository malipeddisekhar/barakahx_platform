const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config – local disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${timestamp}-${safeOriginal}`);
    },
});

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
    storage,
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
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const resource = new Resource({
            title,
            subject,
            category: category || 'placement',
            description: description || '',
            fileUrl,
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
            // Delete old file
            const oldFilePath = path.join(uploadDir, path.basename(resource.fileUrl));
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
            const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
            resource.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
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

        // Delete file from disk
        const filePath = path.join(uploadDir, path.basename(resource.fileUrl));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await resource.deleteOne();
        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
