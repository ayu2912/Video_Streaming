function VideoCard({ thumbnail, title, creator, viewers, isLive }) {
  return (
    <div className="video-card">
      <div className="thumbnail-wrapper">
        <img src={thumbnail} alt={title} />

        {isLive && <span className="live-badge">LIVE</span>}
      </div>

      <div className="video-info">
        <h4 className="video-title">{title}</h4>
        <p className="video-creator">{creator}</p>
        <p className="video-viewers">{viewers} watching</p>
      </div>
    </div>
  );
}

export default VideoCard;
