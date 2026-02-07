import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">O</div>
          <span className="logo-text">Oracle</span>
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Feed
          </Link>
          <Link
            to="/leaderboard"
            className={`nav-link ${location.pathname === "/leaderboard" ? "active" : ""}`}
          >
            Leaderboard
          </Link>
        </div>
        <div className="navbar-user">
          <Link to="/user/alice" className="user-chip">
            <div className="user-avatar">A</div>
            <span>alice</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
