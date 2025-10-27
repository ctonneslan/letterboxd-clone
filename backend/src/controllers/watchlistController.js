import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  isInWatchlist,
  getWatchlistCount,
} from '../services/watchlistService.js';

/**
 * Add movie to watchlist
 * POST /api/v1/watchlist
 */
export async function addToWatchlistHandler(req, res, next) {
  try {
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        error: 'Movie ID is required',
      });
    }

    const item = await addToWatchlist(req.db, req.userId, movieId);

    res.status(201).json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove movie from watchlist
 * DELETE /api/v1/watchlist/:movieId
 */
export async function removeFromWatchlistHandler(req, res, next) {
  try {
    const { movieId } = req.params;

    await removeFromWatchlist(req.db, req.userId, movieId);

    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's watchlist
 * GET /api/v1/watchlist
 */
export async function getWatchlistHandler(req, res, next) {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const watchlist = await getWatchlist(req.db, req.userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const count = await getWatchlistCount(req.db, req.userId);

    res.status(200).json({
      success: true,
      data: {
        watchlist,
        totalCount: count,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: watchlist.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check if movie is in watchlist
 * GET /api/v1/watchlist/check/:movieId
 */
export async function checkWatchlistHandler(req, res, next) {
  try {
    const { movieId } = req.params;

    const inWatchlist = await isInWatchlist(req.db, req.userId, movieId);

    res.status(200).json({
      success: true,
      data: { inWatchlist },
    });
  } catch (error) {
    next(error);
  }
}
