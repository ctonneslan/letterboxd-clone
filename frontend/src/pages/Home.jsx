import { useState, useEffect } from 'react';
import { moviesAPI } from '../api/movies';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [popularRes, trendingRes] = await Promise.all([
          moviesAPI.getPopular(1),
          moviesAPI.getTrending('week', 1),
        ]);

        setPopular(popularRes.results.slice(0, 6));
        setTrending(trendingRes.results.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Popular Movies</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {popular.map((movie) => (
            <MovieCard key={movie.tmdbId} movie={movie} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Trending This Week</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {trending.map((movie) => (
            <MovieCard key={movie.tmdbId} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
