import {
  searchMovies,
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getMovieDetails as getTmdbMovieDetails,
} from '../services/tmdbService.js';
import { getOrFetchMovie, saveMovieFromTmdb } from '../services/movieService.js';

/**
 * Search for movies
 * GET /api/v1/movies/search?q=query&page=1
 */
export async function searchMoviesHandler(req, res, next) {
  try {
    const { q, page = 1 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required',
      });
    }

    const results = await searchMovies(q, parseInt(page));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get movie details by TMDB ID
 * GET /api/v1/movies/:tmdbId
 */
export async function getMovieDetailsHandler(req, res, next) {
  try {
    const { tmdbId } = req.params;

    if (!tmdbId || isNaN(tmdbId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid TMDB ID is required',
      });
    }

    // Get or fetch movie (will cache in database)
    const movie = await getOrFetchMovie(req.db, parseInt(tmdbId));

    res.status(200).json({
      success: true,
      data: { movie },
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found',
      });
    }
    next(error);
  }
}

/**
 * Get popular movies
 * GET /api/v1/movies/popular?page=1
 */
export async function getPopularMoviesHandler(req, res, next) {
  try {
    const { page = 1 } = req.query;

    const results = await getPopularMovies(parseInt(page));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get trending movies
 * GET /api/v1/movies/trending?timeWindow=week&page=1
 */
export async function getTrendingMoviesHandler(req, res, next) {
  try {
    const { timeWindow = 'week', page = 1 } = req.query;

    const results = await getTrendingMovies(timeWindow, parseInt(page));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get top rated movies
 * GET /api/v1/movies/top-rated?page=1
 */
export async function getTopRatedMoviesHandler(req, res, next) {
  try {
    const { page = 1 } = req.query;

    const results = await getTopRatedMovies(parseInt(page));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get now playing movies
 * GET /api/v1/movies/now-playing?page=1
 */
export async function getNowPlayingMoviesHandler(req, res, next) {
  try {
    const { page = 1 } = req.query;

    const results = await getNowPlayingMovies(parseInt(page));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get upcoming movies
 * GET /api/v1/movies/upcoming?page=1
 */
export async function getUpcomingMoviesHandler(req, res, next) {
  try {
    const { page = 1 } = req.query;

    const results = await getUpcomingMovies(parseInt(page));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}
