import express from 'express';
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    updateNotes
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

//all routers are protected
router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
router.patch('/:id/notes', protect, updateNotes);

export default router;
