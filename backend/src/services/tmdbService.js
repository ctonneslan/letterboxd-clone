const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('WARNING: TMDB_API_KEY not configured. Movie features will not work.');
}

/**
 * Make a request to TMDB API
 */
async function tmdbRequest(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = new Error(`TMDB API error: ${response.statusText}`);
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Search for movies by query
 */
export async function searchMovies(query, page = 1, includeAdult = false) {
  if (!query || query.trim().length === 0) {
    const error = new Error('Search query is required');
    error.statusCode = 400;
    throw error;
  }

  const data = await tmdbRequest('/search/movie', {
    query: query.trim(),
    page,
    include_adult: includeAdult,
    language: 'en-US',
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(movie => formatMovieBasic(movie)),
  };
}

/**
 * Get movie details by TMDB ID
 */
export async function getMovieDetails(tmdbId) {
  const data = await tmdbRequest(`/movie/${tmdbId}`, {
    language: 'en-US',
    append_to_response: 'credits,videos,images',
  });

  return formatMovieDetailed(data);
}

/**
 * Get popular movies
 */
export async function getPopularMovies(page = 1) {
  const data = await tmdbRequest('/movie/popular', {
    page,
    language: 'en-US',
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(movie => formatMovieBasic(movie)),
  };
}

/**
 * Get trending movies
 */
export async function getTrendingMovies(timeWindow = 'week', page = 1) {
  if (!['day', 'week'].includes(timeWindow)) {
    const error = new Error('Time window must be "day" or "week"');
    error.statusCode = 400;
    throw error;
  }

  const data = await tmdbRequest(`/trending/movie/${timeWindow}`, {
    page,
    language: 'en-US',
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(movie => formatMovieBasic(movie)),
  };
}

/**
 * Get top rated movies
 */
export async function getTopRatedMovies(page = 1) {
  const data = await tmdbRequest('/movie/top_rated', {
    page,
    language: 'en-US',
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(movie => formatMovieBasic(movie)),
  };
}

/**
 * Get now playing movies
 */
export async function getNowPlayingMovies(page = 1) {
  const data = await tmdbRequest('/movie/now_playing', {
    page,
    language: 'en-US',
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(movie => formatMovieBasic(movie)),
  };
}

/**
 * Get upcoming movies
 */
export async function getUpcomingMovies(page = 1) {
  const data = await tmdbRequest('/movie/upcoming', {
    page,
    language: 'en-US',
  });

  return {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    results: data.results.map(movie => formatMovieBasic(movie)),
  };
}

/**
 * Format basic movie data from TMDB
 */
function formatMovieBasic(movie) {
  return {
    tmdbId: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    overview: movie.overview,
    releaseDate: movie.release_date,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    adult: movie.adult,
    genreIds: movie.genre_ids,
    originalLanguage: movie.original_language,
  };
}

/**
 * Format detailed movie data from TMDB
 */
function formatMovieDetailed(movie) {
  return {
    tmdbId: movie.id,
    imdbId: movie.imdb_id,
    title: movie.title,
    originalTitle: movie.original_title,
    overview: movie.overview,
    tagline: movie.tagline,
    releaseDate: movie.release_date,
    runtime: movie.runtime,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    adult: movie.adult,
    genres: movie.genres,
    productionCompanies: movie.production_companies,
    productionCountries: movie.production_countries,
    spokenLanguages: movie.spoken_languages,
    status: movie.status,
    budget: movie.budget,
    revenue: movie.revenue,
    originalLanguage: movie.original_language,
    homepage: movie.homepage,
    credits: movie.credits,
    videos: movie.videos,
    images: movie.images,
  };
}
