import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesAPI } from '../api/movies';
import MovieCard from '../components/MovieCard';
import { useDebounce } from '../hooks/useDebounce';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim() && debouncedQuery !== searchParams.get('q')) {
      setSearchParams({ q: debouncedQuery.trim() });
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const results = await moviesAPI.search(searchQuery);
      setMovies(results.results || []);
    } catch (error) {
      console.error('Failed to search movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Search Movies</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for a movie..."
            className="input-field flex-1"
            autoFocus
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !query.trim()}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Type to search automatically, or press Enter
        </p>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-2xl">Searching...</div>
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <>
          {movies.length > 0 ? (
            <>
              <p className="text-gray-400 mb-6">
                Found {movies.length} {movies.length === 1 ? 'result' : 'results'} for "{searchParams.get('q')}"
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {movies.map((movie) => (
                  <MovieCard key={movie.tmdbId} movie={movie} />
                ))}
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-xl mb-4">
                No movies found for "{searchParams.get('q')}"
              </p>
              <p className="text-gray-500">
                Try searching for a different movie title
              </p>
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!loading && !hasSearched && (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-xl">
            Enter a movie title to start searching
          </p>
        </div>
      )}
    </div>
  );
}
