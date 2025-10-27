import express from 'express';
import {
  createListHandler,
  getListHandler,
  getUserListsHandler,
  updateListHandler,
  deleteListHandler,
  addMovieToListHandler,
  removeMovieFromListHandler,
} from '../controllers/listController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/lists
 * @desc    Create a new list
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, createListHandler);

/**
 * @route   GET /api/v1/lists/:id
 * @desc    Get list by ID with items
 * @access  Public (optionally authenticated for private lists)
 */
router.get('/:id', optionalAuthenticate, getListHandler);

/**
 * @route   PUT /api/v1/lists/:id
 * @desc    Update a list
 * @access  Private (requires authentication, must be list owner)
 */
router.put('/:id', authenticate, updateListHandler);

/**
 * @route   DELETE /api/v1/lists/:id
 * @desc    Delete a list
 * @access  Private (requires authentication, must be list owner)
 */
router.delete('/:id', authenticate, deleteListHandler);

/**
 * @route   POST /api/v1/lists/:id/items
 * @desc    Add movie to list
 * @access  Private (requires authentication, must be list owner)
 */
router.post('/:id/items', authenticate, addMovieToListHandler);

/**
 * @route   DELETE /api/v1/lists/:id/items/:movieId
 * @desc    Remove movie from list
 * @access  Private (requires authentication, must be list owner)
 */
router.delete('/:id/items/:movieId', authenticate, removeMovieFromListHandler);

/**
 * @route   GET /api/v1/lists/user/:username
 * @desc    Get all lists by a user
 * @query   limit - Number of lists per page (default: 20)
 * @query   offset - Offset for pagination (default: 0)
 * @access  Public (shows only public lists unless viewing own profile)
 */
router.get('/user/:username', optionalAuthenticate, getUserListsHandler);

export default router;
