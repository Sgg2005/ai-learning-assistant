import express from 'express';
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
    renameQuiz  
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/quiz/:id', getQuizById);
router.get('/results/:quizId', getQuizResults);
router.post('/:quizId/submit', submitQuiz);
router.patch('/:id/rename', renameQuiz);
router.delete('/:id', deleteQuiz);
router.get('/:documentId', getQuizzes);

export default router;