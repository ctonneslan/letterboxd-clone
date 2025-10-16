import pool from "../config/db.js";
import * as tmdb from "../services/tmdbService.js";

export async function search(req, res) {
  const { query, page } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }
  try {
    const results = await tmdb.searchMovies(query, page);
    res.json(results);
  } catch (error) {
    console.error("Search error", error);
    res.status(500).json({ error: "Failed to search movies" });
  }
}

export async function getDetails(req, res) {
  const { id } = req.params;

  try {
    // Check if movie is cached in our database
    const cached = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
    if (cached.rows.length > 0) {
      // Return cached result
      return res.json(cached.rows[0]);
    }

    // Fetch from TMDB
    const movieData = await tmdb.getMovieDetails(id);

    // Cache in database
    const result = await pool.query(
      `INSERT INTO movies (id, title, poster_path, backdrop_path, release_date, overview, runtime, genres, tmdb_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            poster_path = EXCLUDED.poster_path,
            backdrop_path = EXCLUDED.backdrop_path,
            release_date = EXCLUDED.release_date,
            overview = EXCLUDED.overview,
            runtime = EXCLUDED.runtime,
            genres = EXCLUDED.genres,
            tmdb_rating = EXCLUDED.tmdb_rating
        RETURNING *`,
      [
        movieData.id,
        movieData.title,
        movieData.poster_path,
        movieData.backdrop_path,
        movieData.release_date,
        movieData.overview,
        movieData.runtime,
        JSON.stringify(movieData.genres),
        movieData.vote_average,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get movie details error:", error);
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
}

export async function getPopular(req, res) {
  const { page } = req.query;

  try {
    const results = await tmdb.getPopularMovies(page);
    res.json(results);
  } catch (error) {
    console.error("Get popular movies error:", error);
    res.status(500).json({ error: "Failed to fetch popular movies" });
  }
}

export async function getTrending(req, res) {
  const { timeWindow = "week" } = req.query;

  try {
    const results = await tmdb.getTrendingMovies(timeWindow);
    res.json(results);
  } catch (error) {
    console.error("Get trending movies error:", error);
    res.status(500).json({ error: "Failed to fetch trending movies" });
  }
}
