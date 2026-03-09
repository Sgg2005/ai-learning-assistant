import { error } from 'console';
import Document from '../models/Document.js';
import FlashCard  from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if(!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                statusCode: 400
            });
        }

        const { title } = req.body;
        
        if(!title){
            //delete uploaded file if title is not provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'please provide a title for the document',
                statusCode: 400
            });
        }

        //construct the URL for the uploaded file
        const baseURL = 'https://localhost:' + (process.env.PORT || 8000);
        const fileURL = `${baseURL}/uploads/${req.file.filename}`;

        //create document record
        const document = await Document.create({
            userId: req.user.userid,
            title,
            fileName: req.file.filename,
            filePath: fileURL, //store the URL in the database
            fileSize: req.file.size,
            status: 'processing'
        });

        //process the PDF file in the background
        processPDF(document._id, req.file.path).catch((err) => {
            console.error('PDF processing error:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully and is being processed'
        });
    }catch (error) {
        //clean up file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
    }
};

//helper function to process PDF document
const processPDF = async (documentId, filePath) => {
    try {
        const { text, numPages } = await extractTextFromPDF(filePath);

        //create chunks
        const chunks = chunkText(text, 500,50);

        //update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });
    console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'error'
        });
    }
};

// @desc    Get all documents for the authenticated user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.find({ userId: req.user.userid });
    }catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
    }
};

// @desc    Get a document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        
    }catch (error) {
    next(error);
    }
};

// @desc    Delet document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
        
    }catch (error) {
    next(error);
    }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res, next) => {
    try {
        
    }catch (error) {
    next(error);
    }

};
