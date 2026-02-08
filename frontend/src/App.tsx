import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/Toast";
import Feed from "./pages/Feed";
import ClaimDetail from "./pages/ClaimDetail";
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";
import { CurrentUserProvider } from "./state/currentUser";
import MarketAnalytics from "./pages/MarketAnalytics";

function App() {
  return (
    <CurrentUserProvider>
      <Navbar />
      <ToastContainer />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/claim/:id" element={<ClaimDetail />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/analytics" element={<MarketAnalytics />} />
        </Routes>
      </div>
    </CurrentUserProvider>
  );
}

export default App;
