import express from 'express';
import {
    getFlashcards,
    getAllFlashcardSets,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet,
    renameFlashcardSet,
} from '../controllers/flashcardController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getFlashcards);
router.get('/:documentId', getAllFlashcardSets);
router.post('/:cardId/review', reviewFlashcard);
router.put('/:cardId/star', toggleStarFlashcard);
router.put('/:id/rename', renameFlashcardSet);
router.delete('/:id', deleteFlashcardSet);

export default router;