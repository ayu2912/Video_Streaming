import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";

const CATEGORIES = [
  ["sports", "Sports"], ["music", "Music"], ["dance", "Dance"],
  ["news", "News"], ["gaming", "Gaming"], ["education", "Education"],
  ["comedy", "Comedy"], ["vlogs", "Vlogs"], ["art", "Art & Craft"], ["beauty", "Beauty"],
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("token"));
  const [showWatchMenu, setShowWatchMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [avatar, setAvatar] = useState(sessionStorage.getItem("userAvatar") || "");

  const watchRef = useRef(null);
  const profileRef = useRef(null);

  const email = sessionStorage.getItem("userEmail") || "";
  const username = email.split("@")[0];

  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem("token"));
    setAvatar(sessionStorage.getItem("userAvatar") || "");
  }, [location]);

  // Sync avatar when updated from Profile page
  useEffect(() => {
    const onAvatarUpdate = () => setAvatar(sessionStorage.getItem("userAvatar") || "");
    window.addEventListener("avatarUpdated", onAvatarUpdate);
    return () => window.removeEventListener("avatarUpdated", onAvatarUpdate);
  }, []);

  // Click-outside + ESC to close dropdowns
  useEffect(() => {
    const handleClick = (e) => {
      if (watchRef.current && !watchRef.current.contains(e.target)) setShowWatchMenu(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") { setShowWatchMenu(false); setShowProfileMenu(false); }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userAvatar");
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="StreamNest Logo" className="logo-img" />
        <span className="brand-name">Stream<span className="brand-accent">Nest</span></span>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {isLoggedIn && (
          <div className="watch-wrapper" ref={watchRef}>
            <button
              className="watch-btn"
              onClick={() => { setShowWatchMenu((p) => !p); setShowProfileMenu(false); }}
            >
              Watch ▾
            </button>
            {showWatchMenu && (
              <div className="watch-dropdown">
                {CATEGORIES.map(([path, label]) => (
                  <Link key={path} to={`/watch/${path}`} onClick={() => setShowWatchMenu(false)}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {!isLoggedIn && <Link to="/login">Login</Link>}
        {!isLoggedIn && <Link to="/register">Register</Link>}

        {isLoggedIn && (
          <div className="profile-wrapper" ref={profileRef}>
            <button
              className="nav-avatar-btn"
              onClick={() => { setShowProfileMenu((p) => !p); setShowWatchMenu(false); }}
              title={username}
            >
              {avatar
                ? <img src={avatar} alt="avatar" className="nav-avatar-img" />
                : <span className="nav-avatar-initial">{username[0]?.toUpperCase() || "U"}</span>
              }
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="pd-user">
                  <div className="pd-avatar">
                    {avatar
                      ? <img src={avatar} alt="avatar" />
                      : <span>{username[0]?.toUpperCase() || "U"}</span>
                    }
                  </div>
                  <div>
                    <strong>{username}</strong>
                    <p>{email}</p>
                  </div>
                </div>
                <div className="pd-divider" />
                <button onClick={() => { navigate("/profile"); setShowProfileMenu(false); }}>👤 Profile</button>
                <button onClick={() => { navigate("/upload"); setShowProfileMenu(false); }}>+ Upload Video</button>
                <div className="pd-divider" />
                <button className="pd-logout" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
