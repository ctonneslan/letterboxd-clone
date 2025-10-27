import express from 'express';
import {
  addToWatchlistHandler,
  removeFromWatchlistHandler,
  getWatchlistHandler,
  checkWatchlistHandler,
} from '../controllers/watchlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/watchlist
 * @desc    Add movie to watchlist
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, addToWatchlistHandler);

/**
 * @route   GET /api/v1/watchlist
 * @desc    Get current user's watchlist
 * @query   limit - Number of items per page (default: 20)
 * @query   offset - Offset for pagination (default: 0)
 * @access  Private (requires authentication)
 */
router.get('/', authenticate, getWatchlistHandler);

/**
 * @route   GET /api/v1/watchlist/check/:movieId
 * @desc    Check if movie is in user's watchlist
 * @access  Private (requires authentication)
 */
router.get('/check/:movieId', authenticate, checkWatchlistHandler);

/**
 * @route   DELETE /api/v1/watchlist/:movieId
 * @desc    Remove movie from watchlist
 * @access  Private (requires authentication)
 */
router.delete('/:movieId', authenticate, removeFromWatchlistHandler);

export default router;
