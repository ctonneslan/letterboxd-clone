import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { watchlistAPI } from '../api/watchlist';
import MovieCard from '../components/MovieCard';

export default function Watchlist() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchWatchlist();
  }, [isAuthenticated, navigate]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await watchlistAPI.getAll();
      setMovies(data.watchlist || []);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Watchlist</h1>

      {movies.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-xl mb-4">Your watchlist is empty</p>
          <p className="text-gray-500 mb-6">
            Add movies you want to watch to keep track of them
          </p>
          <button
            onClick={() => navigate('/movies')}
            className="btn-primary"
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-400 mb-6">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in your watchlist
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((item) => (
              <MovieCard key={item.movie.tmdbId} movie={item.movie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
