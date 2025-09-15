import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import {
  getMovies,
  getMovieById,
  createMovie,
  getMovieReviews,
  addMovieReview,
  uploadPoster
} from '../controllers/movieController.js';

const router = express.Router();

// GET /movies - Get all movies with pagination and filters
router.get('/', getMovies);

// GET /movies/:id - Get movie details with reviews
router.get('/:id', getMovieById);

// POST /movies - Create movie (admin only)
router.post('/', authMiddleware, adminMiddleware, createMovie);

// GET /movies/:id/reviews - Get reviews for a specific movie
router.get('/:id/reviews', getMovieReviews);

// POST /movies/:id/reviews - Add review for a movie (auth required)
router.post('/:id/reviews', authMiddleware, addMovieReview);

// POST /movies/uploadPoster - Upload movie poster (admin only)
router.post('/uploadPoster', authMiddleware, adminMiddleware, uploadSingle, handleUploadError, uploadPoster);

export default router;
