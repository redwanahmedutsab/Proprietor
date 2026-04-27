import {Link} from 'react-router-dom';

const Footer = () => (
    <footer className="footer">
        <div className="container">
            <div className="footer-grid">

                <div className="footer-brand">
                    <div className="footer-logo">🏘 Proprietor</div>
                    <p className="footer-tagline">
                        Bangladesh's trusted real estate platform for buying, renting, and selling properties.
                    </p>
                </div>

                <div className="footer-col">
                    <div className="footer-heading">Browse</div>
                    <Link to="/properties?property_type=rent" className="footer-link">For Rent</Link>
                    <Link to="/properties?property_type=buy" className="footer-link">For Sale</Link>
                    <Link to="/properties?category=apartment" className="footer-link">Apartments</Link>
                    <Link to="/properties?category=house" className="footer-link">Houses</Link>
                </div>

                <div className="footer-col">
                    <div className="footer-heading">Account</div>
                    <Link to="/login" className="footer-link">Login</Link>
                    <Link to="/register" className="footer-link">Register</Link>
                    <Link to="/dashboard" className="footer-link">Dashboard</Link>
                    <Link to="/post-property" className="footer-link">Post Property</Link>
                </div>

                <div className="footer-col">
                    <div className="footer-heading">Contact</div>
                    <span className="footer-link">📧 proprietor@gmail.com</span>
                    <span className="footer-link">📞 +880 1789160352</span>
                    <span className="footer-link">📍 Dhaka, Bangladesh</span>
                </div>

            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} Proprietor. All rights reserved.</span>
            </div>
        </div>
    </footer>
);

export default Footer;
