import express from 'express';
import { body } from 'express-validator';
import {
  register,
  verifyEmail,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// validation middleware
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body().custom((value, { req }) => {
    const hasEmail = !!req.body.email;
    const hasUsername = !!req.body.username;
    if (!hasEmail && !hasUsername) {
      throw new Error('Please provide email or username');
    }
    return true;
  }),
];

const verifyEmailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
];

// public routes
router.post('/register', registerValidation, register);
router.post('/verify-email', verifyEmailValidation, verifyEmail);
router.post('/login', loginValidation, login);

// protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;