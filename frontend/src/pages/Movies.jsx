import { useState, useEffect } from 'react';
import { moviesAPI } from '../api/movies';
import MovieCard from '../components/MovieCard';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [category, setCategory] = useState('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let response;
        switch (category) {
          case 'popular':
            response = await moviesAPI.getPopular();
            break;
          case 'trending':
            response = await moviesAPI.getTrending();
            break;
          case 'top-rated':
            response = await moviesAPI.getTopRated();
            break;
          default:
            response = await moviesAPI.getPopular();
        }
        setMovies(response.results);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [category]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Discover Movies</h1>

      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setCategory('popular')}
          className={`px-6 py-2 rounded-md font-semibold ${
            category === 'popular' ? 'bg-letterboxd-green text-dark-bg' : 'bg-dark-card'
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => setCategory('trending')}
          className={`px-6 py-2 rounded-md font-semibold ${
            category === 'trending' ? 'bg-letterboxd-green text-dark-bg' : 'bg-dark-card'
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setCategory('top-rated')}
          className={`px-6 py-2 rounded-md font-semibold ${
            category === 'top-rated' ? 'bg-letterboxd-green text-dark-bg' : 'bg-dark-card'
          }`}
        >
          Top Rated
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-2xl">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.tmdbId} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
