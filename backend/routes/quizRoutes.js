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

router.get('/:documentId', getQuizzes);
router.get('/quiz/:id', getQuizById);
router.post('/submit/:quizId', submitQuiz);
router.get('/results/:quizId', getQuizResults);
router.delete('/:id', deleteQuiz);
router.patch('/:id/rename', renameQuiz);  

export default router;