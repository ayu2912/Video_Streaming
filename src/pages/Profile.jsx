import { useState, useEffect } from "react";
import "../styles/Profile.css";

function Profile() {
  const [activeSection, setActiveSection] = useState("overview");
  const [points, setPoints] = useState(0);

  // Change Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const email = localStorage.getItem("registeredEmail");
  const memberSince =
    localStorage.getItem("memberSince") || "February 2026";

  // Strong Password Regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  useEffect(() => {
    const storedPoints =
      parseInt(localStorage.getItem("rewardPoints")) || 0;
    setPoints(storedPoints);
  }, []);

  // Change Password Function
  const handleChangePassword = () => {
    const storedPassword = localStorage.getItem("registeredPassword");

    if (oldPassword !== storedPassword) {
      setMessage("Old password is incorrect.");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setMessage(
        "New password must contain uppercase, lowercase, number & special character (min 8 chars)"
      );
      return;
    }

    localStorage.setItem("registeredPassword", newPassword);
    setMessage("Password changed successfully ✅");
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <h3>My Account</h3>
        <ul>
          <li
            className={activeSection === "overview" ? "active" : ""}
            onClick={() => setActiveSection("overview")}
          >
            Overview
          </li>

          <li
            className={activeSection === "rewards" ? "active" : ""}
            onClick={() => setActiveSection("rewards")}
          >
            Rewards
          </li>

          <li
            className={activeSection === "history" ? "active" : ""}
            onClick={() => setActiveSection("history")}
          >
            Watch History
          </li>

          <li
            className={activeSection === "subscription" ? "active" : ""}
            onClick={() => setActiveSection("subscription")}
          >
            Subscription
          </li>

          <li
            className={activeSection === "changePassword" ? "active" : ""}
            onClick={() => setActiveSection("changePassword")}
          >
            Change Password
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div className="profile-content">

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <>
            <h2>Profile Overview</h2>
            <div className="profile-card">
              <div className="profile-avatar">👤</div>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Member Since:</strong> {memberSince}</p>
              <p><strong>Total Coins:</strong> {points}</p>
            </div>
          </>
        )}

        {/* REWARDS */}
        {activeSection === "rewards" && (
          <>
            <h2>My Rewards</h2>
            <div className="reward-card">
              <h3>⭐ Total Reward Points</h3>
              <div className="reward-points">{points}</div>
              <p>Keep logging in daily to earn more coins!</p>
            </div>
          </>
        )}

        {/* WATCH HISTORY */}
        {/* WATCH HISTORY */}
{activeSection === "history" && (
  <>
    <h2>Watch History</h2>

    {JSON.parse(localStorage.getItem("watchHistory"))?.length > 0 ? (
      <div className="history-grid">
        {JSON.parse(localStorage.getItem("watchHistory")).map(
          (video, index) => (
            <div className="history-card" key={index}>
              <img
                src={`https://img.youtube.com/vi/${video.id}/0.jpg`}
                alt={video.title}
              />
              <div>
                <h4>{video.title}</h4>
                <p>Category: {video.category}</p>
                <span>Watched: {video.watchedAt}</span>
              </div>
            </div>
          )
        )}
      </div>
    ) : (
      <p>No videos watched yet.</p>
    )}
  </>
)}


        {/* SUBSCRIPTION */}
        {activeSection === "subscription" && (
          <h2>Subscription Plans (Coming Soon)</h2>
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

              <button onClick={handleChangePassword}>
                Update Password
              </button>

              {message && (
                <p className="password-message">{message}</p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Profile;
