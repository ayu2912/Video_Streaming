import { useNavigate } from "react-router-dom";
import "../styles/VideoCard.css";

function getThumb(video) {
  if (video.thumbnail) return video.thumbnail;
  if (video.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
  return "https://placehold.co/320x180/0f172a/94a3b8?text=No+Thumbnail";
}

function VideoCard({ video, progress, duration }) {
  const navigate = useNavigate();
  const pct = progress > 0 && duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;

  return (
    <div className="vc-card" onClick={() => navigate(`/video/${video._id}`)}>
      <div className="vc-thumb-wrap">
        <img src={getThumb(video)} alt={video.title} />
        {video.uploadedBy && <span className="vc-badge">Uploaded</span>}
        {pct > 0 && (
          <div className="vc-progress-bar">
            <div className="vc-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      <div className="vc-info">
        <h4>{video.title}</h4>
        <div className="vc-meta">
          <span>📂 {video.category}</span>
          <span>👁 {video.views} views</span>
          <span>❤️ {video.likes?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
