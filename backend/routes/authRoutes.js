import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// POST /register
router.post('/register', register);

// POST /login
router.post('/login', login);

export default router;
