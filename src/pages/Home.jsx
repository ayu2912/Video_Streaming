import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import VideoCard from "../components/VideoCard";

const API = "http://127.0.0.1:5000/api";

const TRENDING_DUMMY = [
  { id: "kJQP7kiw5Fk", title: "Despacito", category: "Music", views: "8.2B" },
  { id: "OPf0YbXqDm0", title: "Uptown Funk", category: "Music", views: "4.9B" },
  { id: "5WJ0ZgZ6XK8", title: "Football Highlights", category: "Sports", views: "12M" },
  { id: "mYfJxlgR2jw", title: "Esports Finals", category: "Gaming", views: "9M" },
  { id: "pRpeEdMmmQ0", title: "Bollywood Dance", category: "Dance", views: "320M" },
  { id: "JGwWNGJdvx8", title: "Shape of You", category: "Music", views: "5.8B" },
  { id: "hY0mTcCFpxQ", title: "Minecraft Live", category: "Gaming", views: "7M" },
  { id: "gOBEDDCyXMU", title: "World Dance Champ", category: "Dance", views: "45M" },
  { id: "3tmd-ClpJxA", title: "Counting Stars", category: "Music", views: "3.1B" },
  { id: "GPQalxIuEoM", title: "Fortnite Tournament", category: "Gaming", views: "22M" },
];

const CATEGORIES = [
  { name: "Sports",    emoji: "⚽", path: "sports" },
  { name: "Music",     emoji: "🎵", path: "music" },
  { name: "Dance",     emoji: "💃", path: "dance" },
  { name: "News",      emoji: "📰", path: "news" },
  { name: "Gaming",    emoji: "🎮", path: "gaming" },
  { name: "Education", emoji: "📚", path: "education" },
  { name: "Comedy",    emoji: "😂", path: "comedy" },
  { name: "Vlogs",     emoji: "🎥", path: "vlogs" },
  { name: "Art & Craft", emoji: "🎨", path: "art" },
  { name: "Beauty",    emoji: "💄", path: "beauty" },
];

const FEATURES = [
  { icon: "▶️", title: "Stream Videos", desc: "Watch thousands of videos in crisp HD quality, anytime." },
  { icon: "❤️", title: "Like & Comment", desc: "Engage with creators and join the conversation." },
  { icon: "🔖", title: "Save Videos", desc: "Bookmark your favorites and revisit them anytime." },
  { icon: "⬇️", title: "Download", desc: "Save videos and enjoy them offline at your convenience." },
  { icon: "🔍", title: "Smart Search", desc: "Find exactly what you're looking for in seconds." },
  { icon: "📊", title: "Watch History", desc: "Pick up right where you left off, every time." },
];

const WHY = [
  { icon: "🎯", title: "Personalized Feed", desc: "Recommendations tailored to your taste and watch habits." },
  { icon: "🔥", title: "Trending Content", desc: "Stay on top of what the world is watching right now." },
  { icon: "⏱", title: "Continue Watching", desc: "Resume videos exactly where you paused, across sessions." },
  { icon: "🔐", title: "Secure & Private", desc: "Your account and data stay safe with us." },
];

function ContinueCard({ item }) {
  const navigate = useNavigate();
  const pct = Math.min((item.progress / item.duration) * 100, 100);
  const mins = Math.floor(item.progress / 60);
  const secs = String(item.progress % 60).padStart(2, "0");
  return (
    <div className="vc-card" onClick={() => navigate(`/video/${item.videoId}`)}>
      <div className="vc-thumb-wrap">
        <img src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`} alt={item.title} />
        <div className="vc-progress-bar">
          <div className="vc-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="vc-info">
        <h4>{item.title}</h4>
        <div className="vc-meta">
          <span>📂 {item.category}</span>
          <span>▶ {mins}:{secs}</span>
        </div>
      </div>
    </div>
  );
}

// ── Component for the video row inside the feed ──────────────────────────────
function VideoRow({ title, list }) {
  if (!list || list.length === 0) return null;
  return (
    <section className="feed-section">
      <h3 className="section-title">{title}</h3>
      <div className="feed-grid">
        {list.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem("token");
  const email = sessionStorage.getItem("userEmail") || "";
  const username = email.split("@")[0];

  const [videos, setVideos] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(
    () => JSON.parse(localStorage.getItem("recentSearches") || "[]")
  );
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`${API}/videos`)
      .then((r) => r.json())
      .then((d) => setVideos(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${API}/videos/trending`)
      .then((r) => r.json())
      .then((d) => setTrending(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch(`${API}/videos/recommended`)
      .then((r) => r.json())
      .then((d) => setRecommended(Array.isArray(d) ? d : []))
      .catch(() => {});

    const token = sessionStorage.getItem("token");
    fetch(`${API}/users/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setContinueWatching(
            d
              .filter((v) => v.progress > 0 && v.duration > 0 && v.progress < v.duration * 0.9)
              .sort((a, b) => new Date(b.updatedAt || b.watchedAt) - new Date(a.updatedAt || a.watchedAt))
              .slice(0, 8)
          );
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    setShowSuggestions(true);
    clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/videos/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
        setSearchResults(Array.isArray(data) ? data : []);
      } catch {}
    }, 300);
  };

  const handleSuggestionClick = (video) => {
    saveRecentSearch(video.title);
    setShowSuggestions(false);
    setSearch("");
    navigate(`/video/${video._id}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      saveRecentSearch(search.trim());
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const clearRecentSearch = (term, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const goLogin = () => navigate("/login");

  // ── NOT LOGGED IN: full landing page ────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="landing">

        {/* 1. HERO */}
        <section className="hero hero-bg">
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-left">
              <div className="hero-eyebrow">🎬 VIDEO STREAMING</div>
              <h1>Watch. Stream.<br /><span>Discover.</span></h1>
              <p>
                A next-generation video platform — explore trending videos,
                connect with creators, and never miss a moment.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => navigate("/register")}>
                  Get Started Free
                </button>
                <button className="btn-secondary" onClick={goLogin}>
                  Sign In
                </button>
              </div>
              <div className="hero-stats">
                <div className="stat"><span>25+</span><p>Videos</p></div>
                <div className="stat"><span>10</span><p>Categories</p></div>
                <div className="stat"><span>HD</span><p>Quality</p></div>
              </div>
            </div>

            <div className="hero-right">
              <div className="preview-card">
                <div className="live-badge">
                  ▶ ON DEMAND
                </div>
                <div className="preview-content">
                  <h3>Video Streaming</h3>
                  <p>Thousands of videos, anytime</p>
                  <div className="loading-bars">
                    <span /><span /><span /><span /><span />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-scroll-hint">↓ Scroll to explore</div>
        </section>

        {/* 2. TRENDING VIDEOS */}
        <section className="landing-section trending-section">
          <div className="section-header">
            <h2>🔥 Trending Right Now</h2>
            <button className="see-all-btn" onClick={goLogin}>See All →</button>
          </div>
          <div className="trending-scroll" ref={scrollRef}>
            {TRENDING_DUMMY.map((v) => (
              <div
                key={v.id}
                className="trending-card"
                onClick={goLogin}
                title="Sign in to watch"
              >
                <div className="trending-thumb-wrap">
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.title}
                  />
                  <div className="trending-play-overlay">▶</div>
                  <div className="trending-lock">🔒 Sign in to watch</div>
                </div>
                <p className="trending-title">{v.title}</p>
                <span className="trending-meta">{v.category} · {v.views} views</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. CATEGORIES */}
        <section className="landing-section categories-section">
          <div className="section-header centered">
            <h2>Browse by Category</h2>
            <p>Pick a genre and dive in</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <button key={cat.name} className="category-chip" onClick={goLogin}>
                <span className="cat-emoji">{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. FEATURES */}
        <section className="landing-section features-section">
          <div className="section-header centered">
            <h2>Everything You Need</h2>
            <p>A complete streaming experience in one place</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. WHY JOIN US */}
        <section className="landing-section why-section">
          <div className="why-inner">
            <div className="why-left">
              <h2>Why Join StreamNest?</h2>
              <p>Built for viewers who want more than just a video player.</p>
              <button className="btn-primary" onClick={() => navigate("/register")}>
                Create Free Account
              </button>
            </div>
            <div className="why-grid">
              {WHY.map((w) => (
                <div key={w.title} className="why-card">
                  <div className="why-icon">{w.icon}</div>
                  <div>
                    <h4>{w.title}</h4>
                    <p>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CTA */}
        <section className="landing-section cta-section">
          <div className="cta-glow" />
          <h2>Start Watching Now</h2>
          <p>Join thousands of viewers streaming every day</p>
          <div className="cta-buttons">
            <button className="btn-primary cta-btn" onClick={() => navigate("/register")}>
              Register Free
            </button>
            <button className="btn-secondary cta-btn" onClick={goLogin}>
              Log In
            </button>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="footer-logo">Stream<span>Nest</span></span>
              <p>Your go-to platform for unlimited streaming.</p>
            </div>
            <div className="footer-links">
              <h5>Platform</h5>
              <a onClick={goLogin}>Browse Videos</a>
              <a onClick={goLogin}>Categories</a>
              <a onClick={goLogin}>Trending</a>
            </div>
            <div className="footer-links">
              <h5>Account</h5>
              <a onClick={() => navigate("/register")}>Register</a>
              <a onClick={goLogin}>Login</a>
            </div>
            <div className="footer-links">
              <h5>Company</h5>
              <a>About</a>
              <a>Contact</a>
              <a>Privacy Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 StreamNest. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  // ── LOGGED IN: video feed ────────────────────────────────────────────────────
  return (
    <div className="feed-page">
      <div className="feed-header">
        <h2>Welcome back, <span>{username}</span> 👋</h2>
        <div className="search-wrapper" ref={searchRef}>
          <input
            className="search-bar"
            type="text"
            placeholder="🔍 Search videos..."
            value={search}
            onChange={handleSearch}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleSearchKeyDown}
          />
          {showSuggestions && (suggestions.length > 0 || (!search && recentSearches.length > 0)) && (
            <div className="search-dropdown">
              {!search && recentSearches.length > 0 && (
                <>
                  <div className="search-dropdown-label">Recent Searches</div>
                  {recentSearches.map((term) => (
                    <div key={term} className="search-suggestion recent" onClick={() => setSearch(term)}>
                      <span>🕐 {term}</span>
                      <button onClick={(e) => clearRecentSearch(term, e)}>✕</button>
                    </div>
                  ))}
                </>
              )}
              {search && suggestions.length > 0 && (
                <>
                  <div className="search-dropdown-label">Suggestions</div>
                  {suggestions.map((v) => (
                    <div key={v._id} className="search-suggestion" onClick={() => handleSuggestionClick(v)}>
                      <span>🔍 {v.title}</span>
                      <span className="suggestion-cat">{v.category}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {search && (
        <>
          {searchResults.length === 0
            ? <p className="no-results">No videos found for "{search}"</p>
            : <VideoRow title={`Results for "${search}"`} list={searchResults} />
          }
        </>
      )}

      {!search && (
        <>
          {loading ? (
            <div className="skeleton-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-thumb" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {continueWatching.length > 0 && (
                <section className="feed-section">
                  <h3 className="section-title">▶ Continue Watching</h3>
                  <div className="feed-grid">
                    {continueWatching.map((item) => (
                      <ContinueCard key={item.videoId} item={item} />
                    ))}
                  </div>
                </section>
              )}
              <VideoRow title="🔥 Trending Now" list={trending} />
              <VideoRow title="⭐ Recommended for You" list={recommended} />
              <VideoRow title="All Videos" list={videos} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
