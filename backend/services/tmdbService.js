import "../config/env.js"; // Load environment variables first
import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function searchMovies(query, page = 1) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
        include_adult: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error("TMDB search error:", error);
    throw new Error("Failed to search movies");
  }
}

export async function getMovieDetails(movieId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "credits,videos",
      },
    });
    return response.data;
  } catch (error) {
    console.error("TMDB movie details error:", error);
    throw new Error("Failed to fetch movie details");
  }
}

export async function getPopularMovies(page = 1) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error("TMDB popular movies error:", error);
    throw new Error("Failed to fetch popular movies");
  }
}

export async function getTrendingMovies(timeWindow = "week") {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/trending/movie/${timeWindow}`,
      {
        params: {
          api_key: TMDB_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("TMDB trending movies error", error);
    throw new Error("Failed to fetch trending movies");
  }
}
