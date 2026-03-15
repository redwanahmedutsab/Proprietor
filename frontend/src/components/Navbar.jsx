import {Link} from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">Proprietor</div>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li>Take a Tour</li>
                <li>Pages</li>
                <li>Blog</li>
                <li>Contact</li>
            </ul>
        </nav>
    );
}