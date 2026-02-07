import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCurrentUser } from "../state/currentUser";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const {
    currentUser,
    walletStatus,
    walletError,
    walletAddress,
  } = useCurrentUser();

  const isWalletUser = currentUser.startsWith("0x");
  const avatarLabel = isWalletUser ? "W" : currentUser[0].toUpperCase();
  const displayName = isWalletUser
    ? `${currentUser.slice(0, 6)}...${currentUser.slice(-4)}`
    : currentUser;

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
          <div className="wallet-connect">
            <ConnectButton chainStatus="icon" showBalance={false} />
            {walletStatus === "signing" && (
              <span className="wallet-status">Awaiting signature...</span>
            )}
            {walletStatus === "verifying" && (
              <span className="wallet-status">Verifying...</span>
            )}
            {walletStatus === "authenticated" && walletAddress && (
              <span className="wallet-status wallet-ok">Wallet linked</span>
            )}
            {walletStatus === "error" && (
              <span className="wallet-status wallet-error">
                {walletError ?? "Wallet sign-in failed"}
              </span>
            )}
          </div>
          <Link to={`/user/${currentUser}`} className="user-chip">
            <div className="user-avatar">{avatarLabel}</div>
            <span>{displayName}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
