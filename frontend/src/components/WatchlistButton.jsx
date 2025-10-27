import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { watchlistAPI } from '../api/watchlist';
import { useNavigate } from 'react-router-dom';

export default function WatchlistButton({ movieId }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated && movieId) {
      checkWatchlist();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, movieId]);

  const checkWatchlist = async () => {
    try {
      setIsChecking(true);
      const result = await watchlistAPI.check(movieId);
      setIsInWatchlist(result.isInWatchlist);
    } catch (error) {
      console.error('Failed to check watchlist:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistAPI.remove(movieId);
        setIsInWatchlist(false);
      } else {
        await watchlistAPI.add(movieId);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <button
        disabled
        className="btn-secondary opacity-50 cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-6 py-3 rounded-md font-semibold transition flex items-center gap-2 ${
        isInWatchlist
          ? 'bg-letterboxd-orange text-white hover:bg-orange-600'
          : 'bg-dark-card text-white hover:bg-gray-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className="text-xl">{isInWatchlist ? '✓' : '+'}</span>
      <span>
        {isLoading
          ? 'Updating...'
          : isInWatchlist
          ? 'In Watchlist'
          : 'Add to Watchlist'}
      </span>
    </button>
  );
}
