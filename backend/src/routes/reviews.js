import express from 'express';
import {
  createReviewHandler,
  getReviewHandler,
  getMovieReviewsHandler,
  getUserReviewsHandler,
  getMyMovieReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
  likeReviewHandler,
  unlikeReviewHandler,
} from '../controllers/reviewController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/reviews
 * @desc    Create a new review
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, createReviewHandler);

/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get review by ID
 * @access  Public
 */
router.get('/:id', getReviewHandler);

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update a review
 * @access  Private (requires authentication, must be review owner)
 */
router.put('/:id', authenticate, updateReviewHandler);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete a review
 * @access  Private (requires authentication, must be review owner)
 */
router.delete('/:id', authenticate, deleteReviewHandler);

/**
 * @route   POST /api/v1/reviews/:id/like
 * @desc    Like a review
 * @access  Private (requires authentication)
 */
router.post('/:id/like', authenticate, likeReviewHandler);

/**
 * @route   DELETE /api/v1/reviews/:id/like
 * @desc    Unlike a review
 * @access  Private (requires authentication)
 */
router.delete('/:id/like', authenticate, unlikeReviewHandler);

/**
 * @route   GET /api/v1/reviews/movie/:movieId
 * @desc    Get all reviews for a movie
 * @query   limit - Number of reviews per page (default: 20)
 * @query   offset - Offset for pagination (default: 0)
 * @access  Public (optionally authenticated to see like status)
 */
router.get('/movie/:movieId', optionalAuthenticate, getMovieReviewsHandler);

/**
 * @route   GET /api/v1/reviews/user/:username
 * @desc    Get all reviews by a user
 * @query   limit - Number of reviews per page (default: 20)
 * @query   offset - Offset for pagination (default: 0)
 * @access  Public (shows only public reviews unless viewing own profile)
 */
router.get('/user/:username', optionalAuthenticate, getUserReviewsHandler);

/**
 * @route   GET /api/v1/reviews/my-review/:movieId
 * @desc    Get current user's review for a specific movie
 * @access  Private (requires authentication)
 */
router.get('/my-review/:movieId', authenticate, getMyMovieReviewHandler);

export default router;
