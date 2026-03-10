import express from 'express';
import {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

//all routes are protected
router.use(protect);

//generate flashcards for a document
router.post('/generate-flashcards', generateFlashcards);
router.post('/generate-quiz', generateQuiz);
router.post('/generate-summary', generateSummary);
router.post('/chat', chat);
router.post('/explain-concept', explainConcept);
router.get('/chat-history', getChatHistory);

export default router;
