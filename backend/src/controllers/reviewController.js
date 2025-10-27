import {
  createReview,
  getReviewById,
  getReviewsByMovie,
  getReviewsByUser,
  getUserMovieReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
  getReviewLikeCount,
} from '../services/reviewService.js';

/**
 * Create a new review
 * POST /api/v1/reviews
 */
export async function createReviewHandler(req, res, next) {
  try {
    const { movieId, rating, reviewText, containsSpoilers, isPublic, watchedDate } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        error: 'Movie ID is required',
      });
    }

    const review = await createReview(req.db, {
      userId: req.userId,
      movieId,
      rating,
      reviewText,
      containsSpoilers,
      isPublic,
      watchedDate,
    });

    res.status(201).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get review by ID
 * GET /api/v1/reviews/:id
 */
export async function getReviewHandler(req, res, next) {
  try {
    const { id } = req.params;

    const review = await getReviewById(req.db, id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get reviews for a movie
 * GET /api/v1/reviews/movie/:movieId
 */
export async function getMovieReviewsHandler(req, res, next) {
  try {
    const { movieId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const reviews = await getReviewsByMovie(req.db, movieId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId: req.userId, // Optional, from auth middleware
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: reviews.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get reviews by a user
 * GET /api/v1/reviews/user/:username
 */
export async function getUserReviewsHandler(req, res, next) {
  try {
    const { username } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get user ID from username
    const userResult = await req.db.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const userId = userResult.rows[0].id;

    const reviews = await getReviewsByUser(req.db, userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      requestingUserId: req.userId, // Optional, from auth middleware
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: reviews.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user's review for a movie
 * GET /api/v1/reviews/my-review/:movieId
 */
export async function getMyMovieReviewHandler(req, res, next) {
  try {
    const { movieId } = req.params;

    const review = await getUserMovieReview(req.db, req.userId, movieId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a review
 * PUT /api/v1/reviews/:id
 */
export async function updateReviewHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, reviewText, containsSpoilers, isPublic, watchedDate } = req.body;

    const review = await updateReview(req.db, id, req.userId, {
      rating,
      reviewText,
      containsSpoilers,
      isPublic,
      watchedDate,
    });

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a review
 * DELETE /api/v1/reviews/:id
 */
export async function deleteReviewHandler(req, res, next) {
  try {
    const { id } = req.params;

    await deleteReview(req.db, id, req.userId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Like a review
 * POST /api/v1/reviews/:id/like
 */
export async function likeReviewHandler(req, res, next) {
  try {
    const { id } = req.params;

    await likeReview(req.db, id, req.userId);

    const likeCount = await getReviewLikeCount(req.db, id);

    res.status(200).json({
      success: true,
      data: { likeCount },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unlike a review
 * DELETE /api/v1/reviews/:id/like
 */
export async function unlikeReviewHandler(req, res, next) {
  try {
    const { id } = req.params;

    await unlikeReview(req.db, id, req.userId);

    const likeCount = await getReviewLikeCount(req.db, id);

    res.status(200).json({
      success: true,
      data: { likeCount },
    });
  } catch (error) {
    next(error);
  }
}
