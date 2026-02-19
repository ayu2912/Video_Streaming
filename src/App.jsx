import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Watch from "./pages/Watch";
import CategoryVideos from "./pages/CategoryVideos";
import Profile from "./pages/Profile.jsx";


import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED WATCH ROUTES */}
        <Route
          path="/watch"
          element={
            <ProtectedRoute>
              <Watch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watch/:category"
          element={
            <ProtectedRoute>
              <CategoryVideos />
            </ProtectedRoute>
          }
        />

        <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
        />

      </Routes>
    </Router>
  );
}

export default App;
