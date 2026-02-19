import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="StreamNest Logo" className="logo-img" />
      </div>

      <div className="nav-links">

        <Link to="/">Home</Link>

        {/* WATCH DROPDOWN (Only when logged in) */}
        {isLoggedIn && (
          <div className="watch-wrapper">
            <button
              className="watch-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Watch ▾
            </button>

            {showDropdown && (
              <div className="watch-dropdown">
                <Link to="/watch/sports">Sports</Link>
                <Link to="/watch/music">Music</Link>
                <Link to="/watch/dance">Dance</Link>
                <Link to="/watch/news">News</Link>
                <Link to="/watch/gaming">Gaming</Link>
              </div>
            )}
          </div>
        )}

        {/* PROFILE ICON (Only when logged in) */}
        {isLoggedIn && (
          <div
            className="profile-icon"
            onClick={() => navigate("/profile")}
          >
            👤
          </div>
        )}

        {/* LOGIN / REGISTER (When NOT logged in) */}
        {!isLoggedIn && <Link to="/login">Login</Link>}
        {!isLoggedIn && <Link to="/register">Register</Link>}

        {/* LOGOUT (Only when logged in) */}
        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
