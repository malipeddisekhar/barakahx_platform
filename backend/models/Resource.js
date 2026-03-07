const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        category: {
            type: String,
            enum: ['placement', 'academics', 'aptitude', 'resume'],
            default: 'placement',
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        fileUrl: {
            type: String,
            required: [true, 'File URL is required'],
        },
        fileName: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        filePublicId: {
            type: String,
            default: '',
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

module.exports = mongoose.model('Resource', resourceSchema);
