import { Link } from 'react-router-dom';

const TMDB_IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export default function MovieCard({ movie }) {
  const posterUrl = movie.posterPath
    ? `${TMDB_IMAGE_BASE}/w500${movie.posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  return (
    <Link
      to={`/movies/${movie.tmdbId}`}
      className="group block transition transform hover:scale-105"
    >
      <div className="relative">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full rounded-lg shadow-lg"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition text-center px-4">
            <h3 className="text-white font-bold text-lg mb-2">{movie.title}</h3>
            {movie.releaseDate && (
              <p className="text-gray-300 text-sm">
                {new Date(movie.releaseDate).getFullYear()}
              </p>
            )}
            {movie.voteAverage && (
              <p className="text-letterboxd-orange font-semibold mt-2">
                ★ {movie.voteAverage.toFixed(1)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
