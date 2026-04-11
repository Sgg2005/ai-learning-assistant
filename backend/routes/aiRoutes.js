import express from 'express';
import {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatSessions,
    getChatSession,
    renameChatSession,
    deleteChatSession,
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate-flashcards', generateFlashcards);
router.post('/generate-quiz', generateQuiz);
router.post('/generate-summary', generateSummary);
router.post('/chat', chat);
router.post('/explain-concept', explainConcept);

// chat sessions
router.get('/chat-sessions', getChatSessions);
router.get('/chat-sessions/:sessionId', getChatSession);
router.put('/chat-sessions/:sessionId', renameChatSession);
router.delete('/chat-sessions/:sessionId', deleteChatSession);

export default router;