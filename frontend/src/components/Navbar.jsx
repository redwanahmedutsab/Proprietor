// src/components/Navbar.jsx
import {useState} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const {user, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setDropOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="nav-inner">

                {/* Logo */}
                <Link to="/" className="nav-logo">
                    🏘 <span>Proprietor</span>
                </Link>

                {/* Desktop links */}
                <div className="nav-links">
                    <Link to="/"
                          className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
                    <Link to="/properties"
                          className={`nav-link ${isActive('/properties') ? 'active' : ''}`}>Properties</Link>
                    <Link to="/developers"
                          className={`nav-link ${isActive('/developers') ? 'active' : ''}`}>Developers</Link>
                </div>

                {/* Right side */}
                <div className="nav-right">
                    {isAuthenticated ? (
                        <>
                            <button
                                className="btn-nav-post"
                                onClick={() => navigate('/post-property')}
                            >
                                + Post Property
                            </button>

                            {/* User dropdown */}
                            <div className="user-menu">
                                <button
                                    className="user-avatar-btn"
                                    onClick={() => setDropOpen((p) => !p)}
                                >
                                    {user?.profile_picture ? (
                                        <img src={user.profile_picture} alt="" className="avatar-img"/>
                                    ) : (
                                        <div className="avatar-initials">
                                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                                        </div>
                                    )}
                                    <span className="avatar-name">{user?.first_name}</span>
                                    <span className="dropdown-arrow">{dropOpen ? '▴' : '▾'}</span>
                                </button>

                                {dropOpen && (
                                    <div className="dropdown-menu">
                                        <Link to="/dashboard" className="drop-item"
                                              onClick={() => setDropOpen(false)}>
                                            👤 Dashboard
                                        </Link>
                                        <Link to="/wishlist" className="drop-item"
                                              onClick={() => setDropOpen(false)}>
                                            ❤️ Saved Properties
                                        </Link>
                                        <div className="drop-divider"/>
                                        <button className="drop-item danger" onClick={handleLogout}>
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-nav-login">Login</Link>
                            <Link to="/register" className="btn-nav-register">Register</Link>
                        </>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="hamburger"
                        onClick={() => setMenuOpen((p) => !p)}
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    <Link to="/" className="mob-link" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/properties" className="mob-link" onClick={() => setMenuOpen(false)}>Properties</Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="mob-link"
                                  onClick={() => setMenuOpen(false)}>Dashboard</Link>
                            <Link to="/post-property" className="mob-link" onClick={() => setMenuOpen(false)}>Post
                                Property</Link>
                            <button className="mob-link mob-logout" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mob-link" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="mob-link" onClick={() => setMenuOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
