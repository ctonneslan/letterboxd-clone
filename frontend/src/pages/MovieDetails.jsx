import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { moviesAPI } from '../api/movies';
import { reviewsAPI } from '../api/reviews';

const TMDB_IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export default function MovieDetails() {
  const { tmdbId } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await moviesAPI.getDetails(tmdbId);
        setMovie(movieRes.data.movie);

        // Get movie reviews
        if (movieRes.data.movie.id) {
          const reviewsRes = await reviewsAPI.getByMovie(movieRes.data.movie.id);
          setReviews(reviewsRes.data.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tmdbId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Movie not found</div>
      </div>
    );
  }

  const posterUrl = movie.posterPath
    ? `${TMDB_IMAGE_BASE}/w500${movie.posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const backdropUrl = movie.backdropPath
    ? `${TMDB_IMAGE_BASE}/original${movie.backdropPath}`
    : null;

  return (
    <div>
      {backdropUrl && (
        <div
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg to-transparent"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 -mt-32 relative z-10">
          <div className="md:w-1/3">
            <img src={posterUrl} alt={movie.title} className="w-full rounded-lg shadow-2xl" />
          </div>

          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            {movie.releaseDate && (
              <p className="text-gray-400 text-xl mb-4">
                {new Date(movie.releaseDate).getFullYear()}
              </p>
            )}

            {movie.tagline && <p className="text-gray-300 italic mb-4">{movie.tagline}</p>}

            {movie.overview && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Overview</h2>
                <p className="text-gray-300">{movie.overview}</p>
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-dark-card px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.runtime && (
              <p className="text-gray-400 mb-2">Runtime: {movie.runtime} minutes</p>
            )}

            {movie.voteAverage && (
              <p className="text-letterboxd-orange text-xl font-semibold">
                ★ {movie.voteAverage.toFixed(1)} / 10
              </p>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{review.user.username}</p>
                      {review.rating && (
                        <p className="text-letterboxd-orange">★ {review.rating.toFixed(1)}</p>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {review.reviewText && <p className="text-gray-300">{review.reviewText}</p>}
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                    <span>{review.likeCount} likes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
