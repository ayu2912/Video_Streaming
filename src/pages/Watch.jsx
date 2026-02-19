import "../styles/Watch.css";
import { useNavigate } from "react-router-dom";

function Watch() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Sports",
      img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
      path: "sports",
      desc: "Live matches & highlights"
    },
    {
      title: "Music",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
      path: "music",
      desc: "Concerts & trending hits"
    },
    {
      title: "Dance",
      img: "https://images.unsplash.com/photo-1508704019882-f9cf40e475b4",
      path: "dance",
      desc: "Performances & competitions"
    },
    {
      title: "News",
      img: "https://images.unsplash.com/photo-1581090700227-1e37b190418e",
      path: "news",
      desc: "Latest global updates"
    },
    {
      title: "Gaming",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
      path: "gaming",
      desc: "Live streams & esports"
    },
  ];

  return (
    <div className="watch-page">
      <h1 className="watch-title">Explore Live Streams</h1>

      <div className="watch-grid">
        {categories.map((item, index) => (
          <div className="watch-card" key={index}>
            
            <div className="watch-img-wrapper">
              <img src={item.img} alt={item.title} />
              <span className="live-badge">LIVE</span>
            </div>

            <div className="watch-info">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <button
                className="watch-btn"
                onClick={() => navigate(`/watch/${item.path}`)}
              >
                View
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Watch;
