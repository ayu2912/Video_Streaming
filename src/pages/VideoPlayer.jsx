import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/VideoPlayer.css";

const API = "http://127.0.0.1:5000/api";

function formatTime(secs) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  const [video, setVideo] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showReply, setShowReply] = useState({});
  const [replyText, setReplyText] = useState({});
  const [error, setError] = useState("");
  const [resumeFrom, setResumeFrom] = useState(0);

  const token = sessionStorage.getItem("token");
  const userEmail = sessionStorage.getItem("userEmail") || "";
  const myUsername = userEmail.split("@")[0];
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchVideo();
    recordView();
    return () => {
      clearInterval(progressInterval.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [id]);

  // Init YouTube IFrame API — only for YouTube videos
  useEffect(() => {
    if (!video || !video.youtubeId) return;

    const createPlayer = () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = new window.YT.Player("yt-player", {
        width: "100%",
        height: "100%",
        videoId: video.youtubeId,
        playerVars: { start: resumeFrom, rel: 0 },
        events: { onStateChange: handlePlayerState },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }
  }, [video?.youtubeId]);

  const handlePlayerState = (e) => {
    if (e.data === window.YT?.PlayerState?.PLAYING) {
      progressInterval.current = setInterval(saveProgress, 10000);
    } else {
      clearInterval(progressInterval.current);
      saveProgress();
    }
  };

  const saveProgress = async () => {
    if (!playerRef.current?.getCurrentTime) return;
    const secs = Math.floor(playerRef.current.getCurrentTime());
    if (secs < 5) return;
    const dur = playerRef.current?.getDuration ? Math.floor(playerRef.current.getDuration()) : 0;
    try {
      await fetch(`${API}/videos/${id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ progress: secs, duration: dur }),
      });
    } catch {}
  };

  const fetchVideo = async () => {
    try {
      const res = await fetch(`${API}/videos/${id}`, { headers: authHeader });
      const data = await res.json();
      setVideo(data);
      setLiked(data.isLiked);
      setSaved(data.isSaved);
      setLikeCount(data.likes.length);
      setComments(data.comments || []);
      setResumeFrom(data.progress || 0);
    } catch {
      setError("Failed to load video");
    }
  };

  const recordView = async () => {
    try {
      await fetch(`${API}/videos/${id}/view`, { method: "POST", headers: authHeader });
      const vRes = await fetch(`${API}/videos/${id}`, { headers: authHeader });
      const vData = await vRes.json();
      await fetch(`${API}/users/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ videoId: id, title: vData.title, youtubeId: vData.youtubeId, category: vData.category }),
      });
    } catch {}
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`${API}/videos/${id}/like`, { method: "POST", headers: authHeader });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likes);
    } catch {}
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/users/save/${id}`, { method: "POST", headers: authHeader });
      const data = await res.json();
      setSaved(data.saved);
    } catch {}
  };

  const handleDownload = async () => {
    try {
      await fetch(`${API}/users/download/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title: video.title, youtubeId: video.youtubeId, category: video.category }),
      });
      window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, "_blank");
    } catch {}
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${API}/videos/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ text: commentText }),
      });
      setComments(await res.json());
      setCommentText("");
    } catch {}
  };

  const handleCommentLike = async (commentId) => {
    try {
      const res = await fetch(`${API}/videos/${id}/comment/${commentId}/like`, {
        method: "POST",
        headers: authHeader,
      });
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, likes: data.likes } : c))
      );
    } catch {}
  };

  const handleReply = async (commentId) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;
    try {
      const res = await fetch(`${API}/videos/${id}/comment/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }
      const replies = await res.json();
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, replies } : c))
      );
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setShowReply((prev) => ({ ...prev, [commentId]: false }));
    } catch {}
  };

  const sortedComments = [...comments].sort((a, b) =>
    (b.likes?.length || 0) - (a.likes?.length || 0)
  );

  if (error) return <p style={{ color: "red", padding: "2rem" }}>{error}</p>;
  if (!video) return <p style={{ color: "white", padding: "2rem" }}>Loading...</p>;

  return (
    <div className="player-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="player-layout">
        {/* LEFT: Video + Info */}
        <div className="player-left">
          <div className="player-iframe-wrapper">
            {video.youtubeId ? (
              <div id="yt-player" />
            ) : (
              <video
                src={video.videoUrl}
                controls
                style={{ width: "100%", height: "100%", background: "#000" }}
              />
            )}
          </div>

          <div className="player-info">
            <h2>{video.title}</h2>
            {video.description && <p className="video-description">{video.description}</p>}
            {resumeFrom > 0 && (
              <p className="resume-hint">▶ Resumed from {formatTime(resumeFrom)}</p>
            )}
            <div className="player-meta">
              <span>📂 {video.category}</span>
              <span>👁 {video.views} views</span>

              <button className={`like-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
                {liked ? "❤️" : "🤍"} {likeCount}
              </button>

              <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
                {saved ? "🔖 Saved" : "🔖 Save"}
              </button>

              <button className="download-btn" onClick={handleDownload}>⬇ Download</button>
            </div>
          </div>
        </div>

        {/* RIGHT: Comments */}
        <div className="player-right">
          <h3>Comments</h3>

          <div className="comment-input-row">
            <input
              type="text"
              placeholder={`Comment as ${myUsername}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <button onClick={handleComment}>Post</button>
          </div>

          <div className="comments-list">
            {sortedComments.length === 0 && (
              <p className="no-comments">No comments yet. Be the first!</p>
            )}

            {sortedComments.map((c) => {
              const commenter = c.email?.split("@")[0] || "User";
              return (
                <div key={c._id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-username">{commenter}</span>
                  </div>

                  <p className="comment-text">{c.text}</p>

                  <div className="comment-actions">
                    <button className="comment-like-btn" onClick={() => handleCommentLike(c._id)}>
                      ❤️ {c.likes?.length || 0}
                    </button>
                    {!showReply[c._id] && (
                      <button
                        className="reply-toggle-btn"
                        onClick={() => setShowReply((p) => ({ ...p, [c._id]: true }))}
                      >
                        💬 Reply
                      </button>
                    )}
                  </div>

                  {/* Replies */}
                  {c.replies?.length > 0 && (
                    <div className="replies-list">
                      {c.replies.map((r, i) => (
                        <div key={i} className="reply-item">
                          <span className="reply-username">{r.email?.split("@")[0] || "User"}</span>
                          <p>{r.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {showReply[c._id] && (
                    <div className="reply-input-row">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText[c._id] || ""}
                        onChange={(e) => setReplyText((p) => ({ ...p, [c._id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleReply(c._id)}
                        autoFocus
                      />
                      <button onClick={() => handleReply(c._id)}>Send</button>
                      <button
                        className="cancel-reply-btn"
                        onClick={() => setShowReply((p) => ({ ...p, [c._id]: false }))}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
