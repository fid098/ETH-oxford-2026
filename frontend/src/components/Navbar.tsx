import { Link, useLocation } from "react-router-dom";
import { useCurrentUser } from "../state/currentUser";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const { currentUser, setCurrentUser, users } = useCurrentUser();

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
            className={`nav-link ${
              location.pathname === "/leaderboard" ? "active" : ""
            }`}
          >
            Leaderboard
          </Link>
        </div>
        <div className="navbar-user">
          <Link to={`/user/${currentUser}`} className="user-chip">
            <div className="user-avatar">{currentUser[0].toUpperCase()}</div>
            <span>{currentUser}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
