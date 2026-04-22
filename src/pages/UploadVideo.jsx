import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UploadVideo.css";

const CATEGORIES = ["Sports", "Music", "Dance", "News", "Gaming", "Education", "Comedy", "Vlogs", "Art", "Beauty"];
const API = "http://127.0.0.1:5000/api";

function UploadVideo() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Sports",
    videoInput: "",
    thumbnail: "",
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Auto-preview YouTube thumbnail
    if (name === "videoInput") {
      const ytMatch = value.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      setPreview(ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg` : "");
    }

    if (name === "thumbnail" && value) setPreview(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.videoInput.trim()) {
      setError("Title and video URL are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/videos/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Upload failed"); return; }
      navigate(`/video/${data._id}`);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <button className="back-btn-upload" onClick={() => navigate(-1)}>← Back</button>
        <h2>Upload a Video</h2>
        <p className="upload-sub">Share your video with the StreamNest community</p>

        {error && <div className="upload-error">{error}</div>}

        <form onSubmit={handleSubmit} className="upload-form">

          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title"
              placeholder="Give your video a title"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="What is this video about?"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Video URL */}
          <div className="form-group">
            <label>Video URL *</label>
            <input
              name="videoInput"
              placeholder="Paste a YouTube link or direct video URL (mp4, etc.)"
              value={form.videoInput}
              onChange={handleChange}
            />
            <span className="form-hint">
              Supports: youtube.com/watch?v=... · youtu.be/... · direct .mp4 links
            </span>
          </div>

          {/* Thumbnail */}
          <div className="form-group">
            <label>Thumbnail URL <span className="optional">(optional)</span></label>
            <input
              name="thumbnail"
              placeholder="Paste an image URL for the thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="thumb-preview">
              <label>Thumbnail Preview</label>
              <img src={preview} alt="thumbnail preview" />
            </div>
          )}

          <button type="submit" className="upload-submit-btn" disabled={loading}>
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadVideo;
