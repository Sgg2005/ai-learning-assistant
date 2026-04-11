import Document from "../models/Document.js";
import FlashCard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from "../utils/textChunker.js";

// @desc    Get AI-generated flashcards for a document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10} = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'documentId is required',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const cards = await geminiService.generateFlashcards(document.extractedText, parseInt(count));

        const flashcardSet = new FlashCard({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
        });

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate quiz from document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
    try{
        const { documentId, questionCount = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(questionCount)
        );

        const quiz = new Quiz({
            userId: req.user._id,
            documentId: document._id,
            title: `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        await quiz.save();

        res.status(200).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate summary for a document
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const summary = await geminiService.generateSummary(document.extractedText);

        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary: summary
            },
            message: 'Summary generated successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Chat with AI about a document
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
    try {
        const { documentId, message, sessionId } = req.body;

        if (!documentId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and question',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const relevantChunks = findRelevantChunks(document.chunks, message);
        const chunkIndices = relevantChunks.map(chunk => chunk.chunkIndex);

        // get existing session or create new one
        let chatHistory;
        if (sessionId) {
            chatHistory = await ChatHistory.findOne({
                _id: sessionId,
                userId: req.user._id,
                documentId: document._id
            });
        }

        if (!chatHistory) {
            chatHistory = new ChatHistory({
                userId: req.user._id,
                documentId: document._id,
                sessionName: message.slice(0, 40),
                messages: []
            });
        }

        const answer = await geminiService.chatWithContext(message, relevantChunks);

        chatHistory.messages.push(
            { role: 'user', content: message, timestamp: new Date(), relevantChunks: [] },
            { role: 'assistant', content: answer, timestamp: new Date(), relevantChunks: chunkIndices }
        );

        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                question: message,
                answer,
                relevantChunks: chunkIndices,
                sessionId: chatHistory._id,
                sessionName: chatHistory.sessionName
            },
            message: 'Response generated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Explain a concept from the document
// @route   POST /api/ai/explain-concept
// @access  Private
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and concept',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        const relevantChunks = findRelevantChunks(document.chunks, concept);
        const context = relevantChunks.map(chunk => chunk.text).join('\n\n');

        const explaination = await geminiService.explainConcept(concept, context);

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation: explaination,
                relevantChunks: relevantChunks.map(chunk => chunk.chunkIndex)
            },
            message: 'Explanation generated successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all chat sessions for a document
// @route   GET /api/ai/chat-sessions?documentId=xxx
// @access  Private
export const getChatSessions = async (req, res, next) => {
    try {
        const { documentId } = req.query;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const sessions = await ChatHistory.find({
            userId: req.user._id,
            documentId: documentId
        }).select('sessionName createdAt updatedAt messages').sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: sessions,
            message: 'Sessions retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single chat session
// @route   GET /api/ai/chat-sessions/:sessionId
// @access  Private
export const getChatSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        const session = await ChatHistory.findOne({
            _id: sessionId,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: session,
            message: 'Session retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Rename a chat session
// @route   PUT /api/ai/chat-sessions/:sessionId
// @access  Private
export const renameChatSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { sessionName } = req.body;

        if (!sessionName) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a session name',
                statusCode: 400
            });
        }

        const session = await ChatHistory.findOneAndUpdate(
            { _id: sessionId, userId: req.user._id },
            { sessionName },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: session,
            message: 'Session renamed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a chat session
// @route   DELETE /api/ai/chat-sessions/:sessionId
// @access  Private
export const deleteChatSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        const session = await ChatHistory.findOneAndDelete({
            _id: sessionId,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};