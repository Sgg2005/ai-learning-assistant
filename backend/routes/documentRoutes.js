import express from 'express';
import{
    uploadDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

//all routers are protected
router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);
router.put('/:id', upload.single('file'), updateDocument);

export default router;

