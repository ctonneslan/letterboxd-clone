import express from 'express';
import {
  searchMoviesHandler,
  getMovieDetailsHandler,
  getPopularMoviesHandler,
  getTrendingMoviesHandler,
  getTopRatedMoviesHandler,
  getNowPlayingMoviesHandler,
  getUpcomingMoviesHandler,
} from '../controllers/movieController.js';

const router = express.Router();

/**
 * @route   GET /api/v1/movies/search
 * @desc    Search for movies by title
 * @query   q - Search query
 * @query   page - Page number (default: 1)
 * @access  Public
 */
router.get('/search', searchMoviesHandler);

/**
 * @route   GET /api/v1/movies/popular
 * @desc    Get popular movies
 * @query   page - Page number (default: 1)
 * @access  Public
 */
router.get('/popular', getPopularMoviesHandler);

/**
 * @route   GET /api/v1/movies/trending
 * @desc    Get trending movies
 * @query   timeWindow - "day" or "week" (default: "week")
 * @query   page - Page number (default: 1)
 * @access  Public
 */
router.get('/trending', getTrendingMoviesHandler);

/**
 * @route   GET /api/v1/movies/top-rated
 * @desc    Get top rated movies
 * @query   page - Page number (default: 1)
 * @access  Public
 */
router.get('/top-rated', getTopRatedMoviesHandler);

/**
 * @route   GET /api/v1/movies/now-playing
 * @desc    Get now playing movies
 * @query   page - Page number (default: 1)
 * @access  Public
 */
router.get('/now-playing', getNowPlayingMoviesHandler);

/**
 * @route   GET /api/v1/movies/upcoming
 * @desc    Get upcoming movies
 * @query   page - Page number (default: 1)
 * @access  Public
 */
router.get('/upcoming', getUpcomingMoviesHandler);

/**
 * @route   GET /api/v1/movies/:tmdbId
 * @desc    Get movie details by TMDB ID
 * @access  Public
 */
router.get('/:tmdbId', getMovieDetailsHandler);

export default router;
