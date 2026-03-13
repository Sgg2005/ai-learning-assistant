import express from 'express';
import {
    getDashboard,
} from '../controllers/progressController.js';
import protect from '../middleware/auth.js';

//to protect all routes in this file
const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);

export default router;