import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Feed from "./pages/Feed";
import ClaimDetail from "./pages/ClaimDetail";
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/claim/:id" element={<ClaimDetail />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
