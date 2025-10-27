import { sanitizeString } from '../utils/validation.js';

/**
 * Create a new review
 */
export async function createReview(db, reviewData) {
  const { userId, movieId, rating, reviewText, containsSpoilers, isPublic, watchedDate } = reviewData;

  // Validate rating if provided
  if (rating !== null && rating !== undefined) {
    if (rating < 0.5 || rating > 5.0 || (rating * 2) % 1 !== 0) {
      const error = new Error('Rating must be between 0.5 and 5.0 in 0.5 increments');
      error.statusCode = 400;
      throw error;
    }
  }

  // Check if review already exists for this user and movie
  const existing = await db.query(
    'SELECT id FROM reviews WHERE user_id = $1 AND movie_id = $2',
    [userId, movieId]
  );

  if (existing.rows.length > 0) {
    const error = new Error('You have already reviewed this movie. Use update instead.');
    error.statusCode = 409;
    throw error;
  }

  const sanitizedReviewText = reviewText ? sanitizeString(reviewText) : null;

  const result = await db.query(
    `INSERT INTO reviews (user_id, movie_id, rating, review_text, contains_spoilers, is_public, watched_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, movieId, rating, sanitizedReviewText, containsSpoilers ?? false, isPublic ?? true, watchedDate]
  );

  return formatReviewFromDb(result.rows[0]);
}

/**
 * Get review by ID
 */
export async function getReviewById(db, reviewId) {
  const result = await db.query(
    `SELECT r.*,
            u.username, u.display_name, u.avatar_url,
            m.tmdb_id, m.title, m.poster_path, m.release_date,
            (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as like_count
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN movies m ON r.movie_id = m.id
     WHERE r.id = $1`,
    [reviewId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return formatReviewWithDetails(result.rows[0]);
}

/**
 * Get reviews for a movie
 */
export async function getReviewsByMovie(db, movieId, options = {}) {
  const { limit = 20, offset = 0, userId = null } = options;

  const result = await db.query(
    `SELECT r.*,
            u.username, u.display_name, u.avatar_url,
            (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as like_count,
            ${userId ? `(SELECT COUNT(*) > 0 FROM review_likes WHERE review_id = r.id AND user_id = $4) as user_has_liked` : 'false as user_has_liked'}
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.movie_id = $1 AND r.is_public = true
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    userId ? [movieId, limit, offset, userId] : [movieId, limit, offset]
  );

  return result.rows.map(formatReviewWithDetails);
}

/**
 * Get reviews by a user
 */
export async function getReviewsByUser(db, userId, options = {}) {
  const { limit = 20, offset = 0, requestingUserId = null } = options;

  // If requestingUserId is different from userId, only show public reviews
  const publicCheck = requestingUserId === userId ? '' : 'AND r.is_public = true';

  const result = await db.query(
    `SELECT r.*,
            m.tmdb_id, m.title, m.poster_path, m.release_date,
            (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as like_count
     FROM reviews r
     JOIN movies m ON r.movie_id = m.id
     WHERE r.user_id = $1 ${publicCheck}
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows.map(formatReviewWithDetails);
}

/**
 * Get user's review for a specific movie
 */
export async function getUserMovieReview(db, userId, movieId) {
  const result = await db.query(
    `SELECT r.*,
            (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as like_count
     FROM reviews r
     WHERE r.user_id = $1 AND r.movie_id = $2`,
    [userId, movieId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return formatReviewFromDb(result.rows[0], parseInt(result.rows[0].like_count));
}

/**
 * Update a review
 */
export async function updateReview(db, reviewId, userId, updates) {
  const { rating, reviewText, containsSpoilers, isPublic, watchedDate } = updates;

  // Verify ownership
  const ownership = await db.query(
    'SELECT user_id FROM reviews WHERE id = $1',
    [reviewId]
  );

  if (ownership.rows.length === 0) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  if (ownership.rows[0].user_id !== userId) {
    const error = new Error('You do not have permission to edit this review');
    error.statusCode = 403;
    throw error;
  }

  // Validate rating if provided
  if (rating !== null && rating !== undefined) {
    if (rating < 0.5 || rating > 5.0 || (rating * 2) % 1 !== 0) {
      const error = new Error('Rating must be between 0.5 and 5.0 in 0.5 increments');
      error.statusCode = 400;
      throw error;
    }
  }

  // Build dynamic update query
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (rating !== undefined) {
    fields.push(`rating = $${paramCount}`);
    values.push(rating);
    paramCount++;
  }

  if (reviewText !== undefined) {
    fields.push(`review_text = $${paramCount}`);
    values.push(reviewText ? sanitizeString(reviewText) : null);
    paramCount++;
  }

  if (containsSpoilers !== undefined) {
    fields.push(`contains_spoilers = $${paramCount}`);
    values.push(containsSpoilers);
    paramCount++;
  }

  if (isPublic !== undefined) {
    fields.push(`is_public = $${paramCount}`);
    values.push(isPublic);
    paramCount++;
  }

  if (watchedDate !== undefined) {
    fields.push(`watched_date = $${paramCount}`);
    values.push(watchedDate);
    paramCount++;
  }

  if (fields.length === 0) {
    return await getReviewById(db, reviewId);
  }

  values.push(reviewId);

  const query = `
    UPDATE reviews
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return formatReviewFromDb(result.rows[0]);
}

/**
 * Delete a review
 */
export async function deleteReview(db, reviewId, userId) {
  // Verify ownership
  const ownership = await db.query(
    'SELECT user_id FROM reviews WHERE id = $1',
    [reviewId]
  );

  if (ownership.rows.length === 0) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  if (ownership.rows[0].user_id !== userId) {
    const error = new Error('You do not have permission to delete this review');
    error.statusCode = 403;
    throw error;
  }

  await db.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
}

/**
 * Like a review
 */
export async function likeReview(db, reviewId, userId) {
  // Check if review exists
  const reviewExists = await db.query(
    'SELECT id FROM reviews WHERE id = $1',
    [reviewId]
  );

  if (reviewExists.rows.length === 0) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if already liked
  const existing = await db.query(
    'SELECT id FROM review_likes WHERE review_id = $1 AND user_id = $2',
    [reviewId, userId]
  );

  if (existing.rows.length > 0) {
    const error = new Error('You have already liked this review');
    error.statusCode = 409;
    throw error;
  }

  await db.query(
    'INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2)',
    [reviewId, userId]
  );
}

/**
 * Unlike a review
 */
export async function unlikeReview(db, reviewId, userId) {
  const result = await db.query(
    'DELETE FROM review_likes WHERE review_id = $1 AND user_id = $2 RETURNING id',
    [reviewId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Like not found');
    error.statusCode = 404;
    throw error;
  }
}

/**
 * Get like count for a review
 */
export async function getReviewLikeCount(db, reviewId) {
  const result = await db.query(
    'SELECT COUNT(*) as count FROM review_likes WHERE review_id = $1',
    [reviewId]
  );

  return parseInt(result.rows[0].count);
}

/**
 * Check if user has liked a review
 */
export async function hasUserLikedReview(db, reviewId, userId) {
  const result = await db.query(
    'SELECT id FROM review_likes WHERE review_id = $1 AND user_id = $2',
    [reviewId, userId]
  );

  return result.rows.length > 0;
}

/**
 * Format review from database row
 */
function formatReviewFromDb(row, likeCount = null) {
  return {
    id: row.id,
    userId: row.user_id,
    movieId: row.movie_id,
    rating: row.rating ? parseFloat(row.rating) : null,
    reviewText: row.review_text,
    containsSpoilers: row.contains_spoilers,
    isPublic: row.is_public,
    watchedDate: row.watched_date,
    likeCount: likeCount !== null ? likeCount : (row.like_count ? parseInt(row.like_count) : 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Format review with user and movie details
 */
function formatReviewWithDetails(row) {
  const review = formatReviewFromDb(row);

  if (row.username) {
    review.user = {
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    };
  }

  if (row.tmdb_id) {
    review.movie = {
      tmdbId: row.tmdb_id,
      title: row.title,
      posterPath: row.poster_path,
      releaseDate: row.release_date,
    };
  }

  if (row.user_has_liked !== undefined) {
    review.userHasLiked = row.user_has_liked;
  }

  return review;
}
