import "../styles/Watch.css";
import { useNavigate } from "react-router-dom";

function Watch() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Sports",
      img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=600&q=75",
      path: "sports",
      desc: "Matches, highlights & replays"
    },
    {
      title: "Music",
      img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=75",
      path: "music",
      desc: "Concerts, MVs & trending hits"
    },
    {
      title: "Dance",
      img: "https://images.unsplash.com/photo-1508704019882-f9cf40e475b4?w=600&q=75",
      path: "dance",
      desc: "Performances & competitions"
    },
    {
      title: "News",
      img: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=600&q=75",
      path: "news",
      desc: "Latest global updates"
    },
    {
      title: "Gaming",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=75",
      path: "gaming",
      desc: "Gameplay videos & esports"
    },
    {
      title: "Education",
      img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=75",
      path: "education",
      desc: "Tutorials, courses & learning"
    },
    {
      title: "Comedy",
      img: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=75",
      path: "comedy",
      desc: "Skits, stand-up & funny clips"
    },
    {
      title: "Vlogs",
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=75",
      path: "vlogs",
      desc: "Daily life & lifestyle vlogs"
    },
    {
      title: "Art & Craft",
      img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=75",
      path: "art",
      desc: "DIY, drawing & creative crafts"
    },
    {
      title: "Beauty",
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=75",
      path: "beauty",
      desc: "Makeup, skincare & tutorials"
    },
  ];

  return (
    <div className="watch-page">
      <h1 className="watch-title">Browse Categories</h1>

      <div className="watch-grid">
        {categories.map((item, index) => (
          <div className="watch-card" key={index}>
            
            <div className="watch-img-wrapper">
              <img src={item.img} alt={item.title} />
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
