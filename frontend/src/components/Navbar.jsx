import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-card border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-letterboxd-green">
            Letterboxd Clone
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/movies" className="hover:text-letterboxd-green transition">
              Movies
            </Link>
            <Link to="/search" className="hover:text-letterboxd-green transition">
              Search
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={`/users/${user.username}`}
                  className="hover:text-letterboxd-green transition"
                >
                  {user.username}
                </Link>
                <Link
                  to="/watchlist"
                  className="hover:text-letterboxd-green transition"
                >
                  Watchlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-letterboxd-green transition">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
