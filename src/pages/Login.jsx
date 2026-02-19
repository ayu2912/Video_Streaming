import "../styles/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isForgot, setIsForgot] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleLogin = () => {
    const storedEmail = localStorage.getItem("registeredEmail");
    const storedPassword = localStorage.getItem("registeredPassword");

    if (!emailRegex.test(email)) {
      alert("Email must end with @gmail.com");
      return;
    }

    if (email !== storedEmail || password !== storedPassword) {
      alert("Invalid email or password");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");

    // Reward system
    const currentPoints =
      parseInt(localStorage.getItem("rewardPoints")) || 0;
    localStorage.setItem("rewardPoints", currentPoints + 5);

    alert("Login successful!");
    navigate("/watch");
  };

  const handleResetPassword = () => {
    const storedEmail = localStorage.getItem("registeredEmail");

    if (email !== storedEmail) {
      alert("Email not registered");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      alert(
        "Password must contain uppercase, lowercase, number & special character"
      );
      return;
    }

    localStorage.setItem("registeredPassword", newPassword);

    alert("Password updated successfully!");
    setIsForgot(false);
  };

  return (
    <div className="auth-page auth-bg">
      <div className="auth-overlay"></div>

      <div className="auth-card">
        {!isForgot ? (
          <>
            <h2>User Login</h2>

            <input
              type="email"
              placeholder="Email (@gmail.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="btn-primary" onClick={handleLogin}>
              Login
            </button>

            <p
              style={{ cursor: "pointer", marginTop: "10px", color: "#ff4d4d" }}
              onClick={() => setIsForgot(true)}
            >
              Forgot Password?
            </p>

            <p className="auth-footer">
              Don’t have an account?{" "}
              <span onClick={() => navigate("/register")}>
                Register
              </span>
            </p>
          </>
        ) : (
          <>
            <h2>Reset Password</h2>

            <input
              type="email"
              placeholder="Enter registered Gmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              className="btn-primary"
              onClick={handleResetPassword}
            >
              Update Password
            </button>

            <p
              style={{ cursor: "pointer", marginTop: "10px", color: "#ff4d4d" }}
              onClick={() => setIsForgot(false)}
            >
              Back to Login
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
