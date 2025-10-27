/**
 * Add movie to watchlist
 */
export async function addToWatchlist(db, userId, movieId) {
  // Check if already in watchlist
  const existing = await db.query(
    'SELECT id FROM watchlist WHERE user_id = $1 AND movie_id = $2',
    [userId, movieId]
  );

  if (existing.rows.length > 0) {
    const error = new Error('Movie already in watchlist');
    error.statusCode = 409;
    throw error;
  }

  const result = await db.query(
    `INSERT INTO watchlist (user_id, movie_id)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, movieId]
  );

  return formatWatchlistItemFromDb(result.rows[0]);
}

/**
 * Remove movie from watchlist
 */
export async function removeFromWatchlist(db, userId, movieId) {
  const result = await db.query(
    'DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2 RETURNING id',
    [userId, movieId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Movie not found in watchlist');
    error.statusCode = 404;
    throw error;
  }
}

/**
 * Get user's watchlist
 */
export async function getWatchlist(db, userId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const result = await db.query(
    `SELECT w.*,
            m.tmdb_id, m.title, m.poster_path, m.release_date, m.vote_average, m.overview
     FROM watchlist w
     JOIN movies m ON w.movie_id = m.id
     WHERE w.user_id = $1
     ORDER BY w.added_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows.map(formatWatchlistItemWithMovie);
}

/**
 * Check if movie is in user's watchlist
 */
export async function isInWatchlist(db, userId, movieId) {
  const result = await db.query(
    'SELECT id FROM watchlist WHERE user_id = $1 AND movie_id = $2',
    [userId, movieId]
  );

  return result.rows.length > 0;
}

/**
 * Get watchlist count for user
 */
export async function getWatchlistCount(db, userId) {
  const result = await db.query(
    'SELECT COUNT(*) as count FROM watchlist WHERE user_id = $1',
    [userId]
  );

  return parseInt(result.rows[0].count);
}

/**
 * Format watchlist item from database row
 */
function formatWatchlistItemFromDb(row) {
  return {
    id: row.id,
    userId: row.user_id,
    movieId: row.movie_id,
    addedAt: row.added_at,
  };
}

/**
 * Format watchlist item with movie details
 */
function formatWatchlistItemWithMovie(row) {
  return {
    id: row.id,
    userId: row.user_id,
    movieId: row.movie_id,
    addedAt: row.added_at,
    movie: {
      tmdbId: row.tmdb_id,
      title: row.title,
      posterPath: row.poster_path,
      releaseDate: row.release_date,
      voteAverage: row.vote_average ? parseFloat(row.vote_average) : null,
      overview: row.overview,
    },
  };
}
