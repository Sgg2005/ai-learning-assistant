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
            userId: req.user.id,
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
            status: 'failed'
        });
    }
};

// @desc    Get all documents for the authenticated user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as : 'flashcardsSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as : 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardsCount: { $size: '$flashcardsSets' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
    next(error);
    }
};

// @desc    Get a document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        //get counts of associated flashcards and quizzes
        const flashcardsCount = await FlashCard.countDocuments({ documentId: document._id, userId: req.user._id });
        const quizCount  = await Quiz.countDocuments ({ documentId: document._id, userId: req.user._id });
        
        //update last accessed date
        document.lastAccessed = Date.now();
        await document.save();
        
        //combine document data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardsCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });
    } catch (error) {
    next(error);
    }
};

// @desc    Delet document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
        const  document = await Document.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        //delete associated flashcards and quizzes
        await fs.unlink(document.filePath).catch(() => {});

        //delete document
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
    next(error);
    }
};
