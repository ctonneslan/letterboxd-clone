import { getMovieDetails as getTmdbMovieDetails } from './tmdbService.js';

/**
 * Save or update movie in database from TMDB data
 */
export async function saveMovieFromTmdb(db, tmdbMovieData) {
  const {
    tmdbId,
    imdbId,
    title,
    originalTitle,
    overview,
    tagline,
    releaseDate,
    runtime,
    posterPath,
    backdropPath,
    voteAverage,
    voteCount,
    popularity,
    adult,
    genres,
    productionCompanies,
    productionCountries,
    spokenLanguages,
    status,
    budget,
    revenue,
    originalLanguage,
  } = tmdbMovieData;

  // Check if movie already exists
  const existing = await db.query(
    'SELECT id, tmdb_id FROM movies WHERE tmdb_id = $1',
    [tmdbId]
  );

  if (existing.rows.length > 0) {
    // Update existing movie
    const result = await db.query(
      `UPDATE movies SET
        title = $1,
        original_title = $2,
        overview = $3,
        tagline = $4,
        release_date = $5,
        runtime = $6,
        poster_path = $7,
        backdrop_path = $8,
        imdb_id = $9,
        vote_average = $10,
        vote_count = $11,
        popularity = $12,
        genres = $13,
        production_companies = $14,
        production_countries = $15,
        spoken_languages = $16,
        status = $17,
        budget = $18,
        revenue = $19,
        original_language = $20,
        adult = $21,
        updated_at = CURRENT_TIMESTAMP
      WHERE tmdb_id = $22
      RETURNING *`,
      [
        title,
        originalTitle,
        overview,
        tagline,
        releaseDate,
        runtime,
        posterPath,
        backdropPath,
        imdbId,
        voteAverage,
        voteCount,
        popularity,
        JSON.stringify(genres),
        JSON.stringify(productionCompanies),
        JSON.stringify(productionCountries),
        JSON.stringify(spokenLanguages),
        status,
        budget,
        revenue,
        originalLanguage,
        adult,
        tmdbId,
      ]
    );

    return result.rows[0];
  } else {
    // Insert new movie
    const result = await db.query(
      `INSERT INTO movies (
        tmdb_id,
        title,
        original_title,
        overview,
        tagline,
        release_date,
        runtime,
        poster_path,
        backdrop_path,
        imdb_id,
        vote_average,
        vote_count,
        popularity,
        genres,
        production_companies,
        production_countries,
        spoken_languages,
        status,
        budget,
        revenue,
        original_language,
        adult
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        tmdbId,
        title,
        originalTitle,
        overview,
        tagline,
        releaseDate,
        runtime,
        posterPath,
        backdropPath,
        imdbId,
        voteAverage,
        voteCount,
        popularity,
        JSON.stringify(genres),
        JSON.stringify(productionCompanies),
        JSON.stringify(productionCountries),
        JSON.stringify(spokenLanguages),
        status,
        budget,
        revenue,
        originalLanguage,
        adult,
      ]
    );

    return result.rows[0];
  }
}

/**
 * Get movie from database by TMDB ID
 */
export async function getMovieByTmdbId(db, tmdbId) {
  const result = await db.query(
    'SELECT * FROM movies WHERE tmdb_id = $1',
    [tmdbId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return formatMovieFromDb(result.rows[0]);
}

/**
 * Get movie from database by internal UUID
 */
export async function getMovieById(db, id) {
  const result = await db.query(
    'SELECT * FROM movies WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return formatMovieFromDb(result.rows[0]);
}

/**
 * Get or fetch movie details
 * Checks database first, fetches from TMDB if not found
 */
export async function getOrFetchMovie(db, tmdbId) {
  // Try to get from database first
  let movie = await getMovieByTmdbId(db, tmdbId);

  // If not in database, fetch from TMDB and save
  if (!movie) {
    const tmdbData = await getTmdbMovieDetails(tmdbId);
    const savedMovie = await saveMovieFromTmdb(db, tmdbData);
    movie = formatMovieFromDb(savedMovie);
  }

  return movie;
}

/**
 * Search movies in database
 */
export async function searchMoviesInDb(db, query, limit = 20, offset = 0) {
  const result = await db.query(
    `SELECT * FROM movies
     WHERE title ILIKE $1 OR original_title ILIKE $1
     ORDER BY popularity DESC
     LIMIT $2 OFFSET $3`,
    [`%${query}%`, limit, offset]
  );

  return result.rows.map(formatMovieFromDb);
}

/**
 * Get popular movies from database
 */
export async function getPopularMoviesFromDb(db, limit = 20, offset = 0) {
  const result = await db.query(
    `SELECT * FROM movies
     ORDER BY popularity DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows.map(formatMovieFromDb);
}

/**
 * Format movie data from database row
 */
function formatMovieFromDb(row) {
  return {
    id: row.id,
    tmdbId: row.tmdb_id,
    imdbId: row.imdb_id,
    title: row.title,
    originalTitle: row.original_title,
    overview: row.overview,
    tagline: row.tagline,
    releaseDate: row.release_date,
    runtime: row.runtime,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    voteAverage: parseFloat(row.vote_average),
    voteCount: row.vote_count,
    popularity: parseFloat(row.popularity),
    adult: row.adult,
    genres: row.genres,
    productionCompanies: row.production_companies,
    productionCountries: row.production_countries,
    spokenLanguages: row.spoken_languages,
    status: row.status,
    budget: row.budget,
    revenue: row.revenue,
    originalLanguage: row.original_language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
