import { Link } from 'react-router-dom';

const TMDB_IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export default function MovieCard({ movie }) {
  const posterUrl = movie.posterPath
    ? `${TMDB_IMAGE_BASE}/w500${movie.posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  return (
    <Link
      to={`/movies/${movie.tmdbId}`}
      className="group block"
    >
      <div className="relative w-full">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full rounded-lg shadow-lg"
          style={{ display: 'block', aspectRatio: '2/3', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center pb-4">
          <div className="text-center px-4">
            <h3 className="text-white font-bold text-lg mb-1">{movie.title}</h3>
            {movie.releaseDate && (
              <p className="text-gray-300 text-sm">
                {new Date(movie.releaseDate).getFullYear()}
              </p>
            )}
            {movie.voteAverage && (
              <p className="text-letterboxd-orange font-semibold mt-1">
                ★ {movie.voteAverage.toFixed(1)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
