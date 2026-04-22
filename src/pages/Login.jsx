import "../styles/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed"); return; }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userEmail", data.email);

      // Load avatar into sessionStorage
      try {
        const meRes = await fetch("http://127.0.0.1:5000/api/users/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const me = await meRes.json();
        if (me.avatar) sessionStorage.setItem("userAvatar", me.avatar);
      } catch {}

      setError("");
      navigate("/");
    } catch {
      setError("Error connecting to server");
    }
  };

  return (
    <div className="auth-page auth-bg">
      <div className="auth-overlay" />
      <div className="auth-card">
        <button className="back-btn-auth" onClick={() => navigate("/")}>← Back</button>
        <h2>Sign In</h2>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="toggle-password" onClick={() => setShowPassword((p) => !p)}>
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          <button type="submit" className="btn-primary">Sign In</button>
        </form>

        <p
          className="forgot-link"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

        <p className="auth-footer">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
