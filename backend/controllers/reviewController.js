import pool from "../config/db.js";

export async function createReview(req, res) {
  const { movieId, rating, reviewText, isSpoiler, watchedDate } = req.body;
  const userId = req.user.userId;

  if (!movieId) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  if (rating && (rating < 0 || rating > 5)) {
    return res.status(400).json({ error: "Rating must be between 0 and 5" });
  }

  try {
    // Check if movie exists in our database, if not we should fetch it first
    const movieCheck = await pool.query("SELECT id FROM movies WHERE id = $1", [
      movieId,
    ]);

    if (movieCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Movie not found. Please fetch movie details first",
      });
    }

    // Create or update review
    const result = await pool.query(
      `
        INSERT INTO reviews (user_id, movie_id, rating, review_text, is_spoiler, watched_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, movie_id)
        DO UPDATE SET
            rating = EXCLUDED.rating,
            review_text = EXCLUDED.review_text,
            is_spoiler = EXCLUDED.is_spoiler,
            watched_date = EXCLUDED.watched_date,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *`,
      [userId, movieId, rating, reviewText, isSpoiler || false, watchedDate]
    );

    res.status(201).json({
      message: "Review saved successfully",
      review: result.rows[0],
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
}

export async function updateReview(req, res) {
  const { id } = req.params;
  const { rating, reviewText, isSpoiler, watchedDate } = req.body;
  const userId = req.user.userId;

  try {
    // Check if review exists and belongs to user
    const reviewCheck = await pool.query(
      "SELECT * FROM reviews WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (reviewCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Review not found or unauthorized" });
    }

    const result = await pool.query(
      ` UPDATE reviews
        SET rating = COALESCE($1, rating),
            review_text = COALESCE($2, review_text),
            is_spoiler = COALESCE($3, is_spoiler),
            watched_date = COALESCE($4, watched_date),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND user_id = $6
        RETURNING *`,
      [rating, reviewText, isSpoiler, watchedDate, id, userId]
    );

    res.json({
      message: "Review updated successfully",
      review: result.rows[0],
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
}

export async function deleteReview(req, res) {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Review not found or unauthorized" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
}

export async function getMovieReviews(req, res) {
  const { movieId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT 
         r.*,
         u.username,
         u.display_name,
         u.avatar_url,
         (SELECT COUNT(*) FROM likes WHERE review_id = r.id) as like_count,
         CASE WHEN $2::integer IS NOT NULL 
           THEN EXISTS(SELECT 1 FROM likes WHERE review_id = r.id AND user_id = $2)
           ELSE false
         END as user_has_liked
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.movie_id = $1
       ORDER BY r.created_at DESC
       LIMIT $3 OFFSET $4`,
      [movieId, req.user?.userId || null, limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM reviews WHERE movie_id = $1",
      [movieId]
    );

    res.json({
      reviews: result.rows,
      totalCount: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Get movie reviews error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

export async function getUserReviews(req, res) {
  const { username } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Get user ID from username
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const targetUserId = userResult.rows[0].id;
    const result = await pool.query(
      `SELECT 
         r.*,
         m.title,
         m.poster_path,
         m.release_date,
         (SELECT COUNT(*) FROM likes WHERE review_id = r.id) as like_count
       FROM reviews r
       JOIN movies m ON r.movie_id = m.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [targetUserId, limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM reviews WHERE user_id = $1",
      [targetUserId]
    );
    res.json({
      reviews: result.rows,
      totalCount: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

export async function likeReview(req, res) {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Check if review exists
    const reviewCheck = await pool.query(
      "SELECT id FROM reviews WHERE id = $1",
      [id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    await pool.query(
      "INSERT INTO likes (user_id, review_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, id]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM likes WHERE review_id = $1",
      [id]
    );

    res.json({
      message: "Review liked",
      likeCount: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error("Like review error:", error);
    res.status(500).json({ error: "Failed to like review" });
  }
}

export async function unlikeReview(req, res) {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      "DELETE FROM likes WHERE user_id = $1 AND review_id = $2",
      [userId, id]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM likes WHERE review_id = $1",
      [id]
    );

    res.json({
      message: "Review unliked",
      likeCount: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error("Unlike review error:", error);
    res.status(500).json({ error: "Failed to unlike review" });
  }
}
