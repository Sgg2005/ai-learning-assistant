import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true]
    },
    title: {
        type: String,
        required: [true, 'Please add a title for the document'],
        trim: true
    },
    fileName: {
        type: String,
        required: [true]
    },
    filePath: {
        type: String,
        required: [true]
    },
    fileSize: {
        type: Number,
        required: [true]
    },
    extractedText: {
        type: String,
        default: ''
    },
    chunks: [{
        content: {
            type: String,
            required: [true]
        },
        pageNumber: {
            type: Number,
            default: 0
        },
        chunkIndex: {
            type: Number,
            required: [true]
        }
    }],
    uploadDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'ready', 'failed'],
        default: 'processing'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

//index for faster queries 
documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;