import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moviesAPI } from '../api/movies';
import { reviewsAPI } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import WatchlistButton from '../components/WatchlistButton';

const TMDB_IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export default function MovieDetails() {
  const { tmdbId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tmdbId, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const movieRes = await moviesAPI.getDetails(tmdbId);
      setMovie(movieRes.movie);

      // Get movie reviews
      if (movieRes.movie.id) {
        const reviewsRes = await reviewsAPI.getByMovie(movieRes.movie.id);
        setReviews(reviewsRes.reviews || []);

        // Get current user's review if authenticated
        if (isAuthenticated) {
          try {
            const myReviewRes = await reviewsAPI.getMyMovieReview(movieRes.movie.id);
            setMyReview(myReviewRes.review);
          } catch (error) {
            // No review exists, that's okay
            setMyReview(null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (reviewData) => {
    try {
      const newReview = await reviewsAPI.create(reviewData);
      setMyReview(newReview.review);
      setShowReviewForm(false);
      // Refresh reviews to show the new one
      await fetchData();
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create review');
    }
  };

  const handleUpdateReview = async (reviewData) => {
    try {
      const updated = await reviewsAPI.update(myReview.id, reviewData);
      setMyReview(updated.review);
      setEditingReview(null);
      // Refresh reviews
      await fetchData();
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update review');
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await reviewsAPI.delete(myReview.id);
      setMyReview(null);
      setEditingReview(null);
      // Refresh reviews
      await fetchData();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!isAuthenticated) {
      alert('Please log in to like reviews');
      return;
    }

    try {
      await reviewsAPI.like(reviewId);
      // Refresh reviews to update like count
      await fetchData();
    } catch (error) {
      console.error('Failed to like review:', error);
    }
  };

  const handleUnlikeReview = async (reviewId) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await reviewsAPI.unlike(reviewId);
      // Refresh reviews to update like count
      await fetchData();
    } catch (error) {
      console.error('Failed to unlike review:', error);
    }
  };

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

            {/* Watchlist Button */}
            <div className="mt-6">
              <WatchlistButton movieId={movie.id} />
            </div>
          </div>
        </div>

        {/* User's Review Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Your Review</h2>

          {!isAuthenticated ? (
            <div className="card">
              <p className="text-gray-400">
                <Link to="/login" className="text-letterboxd-green hover:underline">
                  Log in
                </Link>{' '}
                to write a review
              </p>
            </div>
          ) : editingReview ? (
            <ReviewForm
              movieId={movie.id}
              existingReview={myReview}
              onSubmit={handleUpdateReview}
              onCancel={() => setEditingReview(null)}
            />
          ) : myReview ? (
            <div className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{user.username}</p>
                  {myReview.rating && (
                    <p className="text-letterboxd-orange text-lg">
                      ★ {myReview.rating.toFixed(1)} / 10
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingReview(myReview)}
                    className="text-sm text-letterboxd-green hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {myReview.containsSpoilers && (
                <p className="text-sm text-yellow-500 mb-2">⚠️ Contains spoilers</p>
              )}
              {myReview.reviewText && (
                <p className="text-gray-300 mb-3">{myReview.reviewText}</p>
              )}
              <p className="text-gray-500 text-sm">
                Posted {new Date(myReview.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : showReviewForm ? (
            <ReviewForm
              movieId={movie.id}
              onSubmit={handleCreateReview}
              onCancel={() => setShowReviewForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* All Reviews Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">All Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => {
                const isMyReview = user && review.user.id === user.id;
                if (isMyReview) return null; // Don't show user's review here, it's shown above

                return (
                  <div key={review.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{review.user.username}</p>
                        {review.rating && (
                          <p className="text-letterboxd-orange">
                            ★ {review.rating.toFixed(1)} / 10
                          </p>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {review.containsSpoilers && (
                      <p className="text-sm text-yellow-500 mb-2">⚠️ Contains spoilers</p>
                    )}
                    {review.reviewText && (
                      <p className="text-gray-300 mb-3">{review.reviewText}</p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <button
                        onClick={() =>
                          review.isLikedByUser
                            ? handleUnlikeReview(review.id)
                            : handleLikeReview(review.id)
                        }
                        className={`flex items-center gap-1 transition ${
                          review.isLikedByUser
                            ? 'text-letterboxd-green'
                            : 'text-gray-400 hover:text-letterboxd-green'
                        }`}
                        disabled={!isAuthenticated}
                      >
                        <span>{review.isLikedByUser ? '♥' : '♡'}</span>
                        <span>{review.likeCount || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
