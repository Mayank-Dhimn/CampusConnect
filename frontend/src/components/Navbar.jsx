import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, PlusCircle, LogOut, User, LayoutDashboard, MessageSquare, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <ShoppingBag size={22} /> CampusConnect
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/marketplace">Marketplace</NavLink>
            </li>
            {user && user.role === 'student' && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/my-listings"><List size={16} className="me-1" />My Listings</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/wishlist"><Heart size={16} className="me-1" />Wishlist</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/enquiries"><MessageSquare size={16} className="me-1" />Enquiries</NavLink>
                </li>
              </>
            )}
            {user && user.role === 'admin' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin"><LayoutDashboard size={16} className="me-1" />Admin</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex gap-2 align-items-center">
            {user ? (
              <>
                {user.role === 'student' && (
                  <Link to="/add-product" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                    <PlusCircle size={16} /> Sell
                  </Link>
                )}
                <Link to="/profile" className="btn btn-outline-light btn-sm d-flex align-items-center gap-1">
                  <User size={16} /> {user.name.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
