import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const [watchHistory, setWatchHistory] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(sessionStorage.getItem("userAvatar") || "");

  const email = sessionStorage.getItem("userEmail") || "Not logged in";
  const username = email.split("@")[0];
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  useEffect(() => {
    if (!token) return;

    fetch("http://127.0.0.1:5000/api/users/history", { headers })
      .then((r) => r.json()).then(setWatchHistory).catch(() => {});

    fetch("http://127.0.0.1:5000/api/users/saved", { headers })
      .then((r) => r.json()).then(setSavedVideos).catch(() => {});

    fetch("http://127.0.0.1:5000/api/users/liked", { headers })
      .then((r) => r.json()).then(setLikedVideos).catch(() => {});

    fetch("http://127.0.0.1:5000/api/users/mycomments", { headers })
      .then((r) => r.json()).then(setMyComments).catch(() => {});

    fetch("http://127.0.0.1:5000/api/users/downloads", { headers })
      .then((r) => r.json()).then(setDownloads).catch(() => {});

    fetch("http://127.0.0.1:5000/api/users/uploads", { headers })
      .then((r) => r.json()).then((d) => setMyUploads(Array.isArray(d) ? d : [])).catch(() => {});

    fetch("http://127.0.0.1:5000/api/users/me", { headers })
      .then((r) => r.json())
      .then((d) => {
        if (d.avatar) {
          setAvatarUrl(d.avatar);
          sessionStorage.setItem("userAvatar", d.avatar);
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/avatar", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.avatar) {
        setAvatarUrl(data.avatar);
        sessionStorage.setItem("userAvatar", data.avatar);
        window.dispatchEvent(new Event("avatarUpdated"));
      }
    } catch {}
  };

  const handleChangePassword = async () => {
    if (!passwordRegex.test(newPassword)) {
      setMessage("Min 8 chars with uppercase, lowercase, number & special character (@$!%*?&).");
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.message || "Failed"); return; }
      setMessage("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
    } catch {
      setMessage("Error connecting to server.");
    }
  };

  const handleRemoveHistory = async (videoId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/users/history/${videoId}`, {
        method: "DELETE",
        headers,
      });
      setWatchHistory((prev) => prev.filter((v) => v.videoId !== videoId));
    } catch {}
  };

  const handleUnsave = async (videoId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/users/save/${videoId}`, {
        method: "POST",
        headers,
      });
      setSavedVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch {}
  };

  const handleUnlike = async (videoId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/videos/${videoId}/like`, {
        method: "POST",
        headers,
      });
      setLikedVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch {}
  };

  const handleDeleteComment = async (videoId, commentId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/users/comment/${videoId}/${commentId}`, {
        method: "DELETE",
        headers,
      });
      setMyComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch {}
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video? This cannot be undone.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/videos/${videoId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) setMyUploads((prev) => prev.filter((v) => v._id !== videoId));
    } catch {}
  };

  const sidebarItems = [
    { key: "overview",       label: "Overview" },
    { key: "uploads",        label: "My Uploads" },
    { key: "upload",         label: "Upload Video" },
    { key: "history",        label: "Watch History" },
    { key: "saved",          label: "Saved" },
    { key: "liked",          label: "Liked" },
    { key: "comments",       label: "My Comments" },
    { key: "downloads",      label: "Downloads" },
    { key: "changePassword", label: "Change Password" },
  ];

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <h3>My Account</h3>
        <ul>
          {sidebarItems.map((item) => (
            <li
              key={item.key}
              className={activeSection === item.key ? "active" : ""}
              onClick={() => item.key === "upload" ? navigate("/upload") : setActiveSection(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="profile-content">

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <>
            <h2>Profile Overview</h2>
            <div className="profile-card">
              <div className="profile-avatar-wrap">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="profile-avatar-img" />
                  : <div className="profile-avatar-initial">{username[0]?.toUpperCase() || "U"}</div>
                }
                <label className="avatar-upload-btn" title="Change photo">
                  📷
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
              </div>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Member Since:</strong> 2026</p>
              <p><strong>Videos Watched:</strong> {watchHistory.length}</p>
              <p><strong>Videos Liked:</strong> {likedVideos.length}</p>
              <p><strong>Videos Saved:</strong> {savedVideos.length}</p>
              <p><strong>Comments Posted:</strong> {myComments.length}</p>
              <button className="action-btn" style={{ marginTop: "1rem" }} onClick={() => navigate("/upload")}>
                + Upload Video
              </button>
            </div>
          </>
        )}

        {/* MY UPLOADS */}
        {activeSection === "uploads" && (
          <>
            <h2>My Uploads</h2>
            {myUploads.length === 0 ? (
              <p className="empty-msg">You haven't uploaded any videos yet.</p>
            ) : (
              <div className="history-grid">
                {myUploads.map((video) => (
                  <div key={video._id} className="history-card">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={video.title}
                      onClick={() => navigate(`/video/${video._id}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <div>
                      <h4 onClick={() => navigate(`/video/${video._id}`)} style={{ cursor: "pointer" }}>
                        {video.title}
                      </h4>
                      <p>Category: {video.category}</p>
                      <span>👁 {video.views} views · ❤️ {video.likes?.length || 0}</span>
                      <br />
                      <button
                        className="action-btn remove-btn"
                        style={{ marginTop: "8px" }}
                        onClick={() => handleDeleteVideo(video._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* WATCH HISTORY */}
        {activeSection === "history" && (
          <>
            <h2>Watch History</h2>
            {watchHistory.length === 0 ? (
              <p className="empty-msg">No videos watched yet.</p>
            ) : (
              <div className="history-grid">
                {watchHistory.map((video, i) => (
                  <div key={i} className="history-card">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={video.title}
                      onClick={() => navigate(`/video/${video.videoId}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <div>
                      <h4 onClick={() => navigate(`/video/${video.videoId}`)} style={{ cursor: "pointer" }}>
                        {video.title}
                      </h4>
                      <p>Category: {video.category}</p>
                      <span>Watched: {new Date(video.watchedAt).toLocaleString()}</span>
                      {video.progress > 0 && (
                        <p className="resume-label">
                          ▶ Resume at {Math.floor(video.progress / 60)}:{String(video.progress % 60).padStart(2, "0")}
                        </p>
                      )}
                      <button
                        className="action-btn remove-btn"
                        onClick={() => handleRemoveHistory(video.videoId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SAVED VIDEOS */}
        {activeSection === "saved" && (
          <>
            <h2>Saved Videos</h2>
            {savedVideos.length === 0 ? (
              <p className="empty-msg">No saved videos yet. Hit Save on any video to save it here.</p>
            ) : (
              <div className="history-grid">
                {savedVideos.map((video, i) => (
                  <div key={i} className="history-card">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={video.title}
                      onClick={() => navigate(`/video/${video._id}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <div>
                      <h4 onClick={() => navigate(`/video/${video._id}`)} style={{ cursor: "pointer" }}>
                        {video.title}
                      </h4>
                      <p>Category: {video.category}</p>
                      <button
                        className="action-btn remove-btn"
                        onClick={() => handleUnsave(video._id)}
                      >
                        Unsave
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* LIKED VIDEOS */}
        {activeSection === "liked" && (
          <>
            <h2>Liked Videos</h2>
            {likedVideos.length === 0 ? (
              <p className="empty-msg">No liked videos yet. Hit the heart on any video to like it.</p>
            ) : (
              <div className="history-grid">
                {likedVideos.map((video, i) => (
                  <div key={i} className="history-card">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={video.title}
                      onClick={() => navigate(`/video/${video._id}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <div>
                      <h4 onClick={() => navigate(`/video/${video._id}`)} style={{ cursor: "pointer" }}>
                        {video.title}
                      </h4>
                      <p>Category: {video.category}</p>
                      <button
                        className="action-btn unlike-btn"
                        onClick={() => handleUnlike(video._id)}
                      >
                        Unlike
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MY COMMENTS */}
        {activeSection === "comments" && (
          <>
            <h2>My Comments</h2>
            {myComments.length === 0 ? (
              <p className="empty-msg">You haven't commented on any videos yet.</p>
            ) : (
              <div className="comments-profile-list">
                {myComments.map((c, i) => (
                  <div key={i} className="comment-profile-item">
                    <img
                      src={`https://img.youtube.com/vi/${c.youtubeId}/default.jpg`}
                      alt={c.videoTitle}
                      onClick={() => navigate(`/video/${c.videoId}`)}
                    />
                    <div className="comment-profile-body">
                      <p className="comment-video-title" onClick={() => navigate(`/video/${c.videoId}`)}>
                        {c.videoTitle}
                      </p>
                      <p className="comment-body">"{c.text}"</p>
                      <span className="comment-date">{new Date(c.createdAt).toLocaleString()}</span>
                      <button
                        className="icon-delete-btn"
                        title="Delete comment"
                        onClick={() => handleDeleteComment(c.videoId, c.commentId)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* DOWNLOADS */}
        {activeSection === "downloads" && (
          <>
            <h2>Downloads</h2>
            <p className="section-note">
              Videos you downloaded — opens on YouTube for offline saving via YouTube Premium.
            </p>
            {downloads.length === 0 ? (
              <p className="empty-msg">No downloads yet. Hit the Download button on any video.</p>
            ) : (
              <div className="history-grid">
                {downloads.map((video, i) => (
                  <div key={i} className="history-card">
                    <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title} />
                    <div>
                      <h4>{video.title}</h4>
                      <p>Category: {video.category}</p>
                      <span>Downloaded: {new Date(video.downloadedAt).toLocaleString()}</span>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="yt-download-link"
                      >
                        Open on YouTube
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CHANGE PASSWORD */}
        {activeSection === "changePassword" && (
          <>
            <h2>Change Password</h2>
            <div className="password-card">
              <input
                type="password"
                placeholder="Enter Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={handleChangePassword}>Update Password</button>
              {message && <p className="password-message">{message}</p>}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Profile;
