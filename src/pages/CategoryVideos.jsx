import { useParams } from "react-router-dom";
import { useEffect } from "react";
import "../styles/CategoryVideos.css";

function CategoryVideos() {
  const { category } = useParams();

  const videoData = {
    sports: [
      { id: "5WJ0ZgZ6XK8", title: "Football Highlights" },
      { id: "bNpx7gpSqbY", title: "Cricket Match" },
      { id: "Ic8Y4vWbM6Q", title: "NBA Game" },
      { id: "3GwjfUFyY6M", title: "Tennis Finals" },
      { id: "XIMLoLxmTDw", title: "Olympics Highlights" },
    ],
    music: [
      { id: "kJQP7kiw5Fk", title: "Despacito" },
      { id: "OPf0YbXqDm0", title: "Uptown Funk" },
      { id: "JGwWNGJdvx8", title: "Shape of You" },
      { id: "3tmd-ClpJxA", title: "Counting Stars" },
      { id: "l482T0yNkeo", title: "Sweet Child O Mine" },
    ],
  };

  const handleWatch = (video) => {
    const history = JSON.parse(localStorage.getItem("watchHistory")) || [];

    const newEntry = {
      ...video,
      category,
      watchedAt: new Date().toLocaleString(),
    };

    const updatedHistory = [newEntry, ...history];

    localStorage.setItem("watchHistory", JSON.stringify(updatedHistory));
  };

  return (
    <div className="category-page">
      <h2 className="category-title">
        {category.toUpperCase()} Streams
      </h2>

      <div className="video-grid">
        {videoData[category]?.map((video, index) => (
          <div className="video-card" key={index}>
            <iframe
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.title}
              frameBorder="0"
              allowFullScreen
              onLoad={() => handleWatch(video)}
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryVideos;
