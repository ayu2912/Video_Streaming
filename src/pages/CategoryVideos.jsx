import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/CategoryVideos.css";
import VideoCard from "../components/VideoCard";

function CategoryVideos() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/videos/category/${category}`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <div className="category-page">
      <button className="back-btn-auth" onClick={() => navigate(-1)}>← Back</button>
      <h2 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)} Videos</h2>

      {loading && <p style={{ color: "#aaa" }}>Loading...</p>}

      <div className="feed-grid">
        {!loading && videos.length === 0 && (
          <p style={{ color: "#aaa" }}>No videos available for this category.</p>
        )}
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}

export default CategoryVideos;
