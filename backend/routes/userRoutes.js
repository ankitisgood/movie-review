import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /users/:id - Get user profile with reviews
router.get('/:id', getUserProfile);

// PUT /users/:id - Update user profile
router.put('/:id', updateUserProfile);

// GET /users/:id/watchlist - Get user's watchlist
router.get('/:id/watchlist', getUserWatchlist);

// POST /users/:id/watchlist - Add movie to watchlist
router.post('/:id/watchlist', addToWatchlist);

// DELETE /users/:id/watchlist/:movieId - Remove movie from watchlist
router.delete('/:id/watchlist/:movieId', removeFromWatchlist);

export default router;
