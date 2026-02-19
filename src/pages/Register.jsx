import "../styles/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleRegister = () => {
    if (!emailRegex.test(email)) {
      alert("Email must contain @ and end with @gmail.com");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    // Store credentials
    localStorage.setItem("registeredEmail", email);
    localStorage.setItem("registeredPassword", password);

    alert("Registration successful! Please login.");

    // ✅ Redirect to login (NO auto login)
    navigate("/login");
  };

  return (
    <div className="auth-page auth-bg">
      <div className="auth-overlay"></div>

      <div className="auth-card">
        <h2>Register</h2>

        <input
          type="email"
          placeholder="Email (must be @gmail.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="password-hint">
          Password must contain uppercase, lowercase, number & special character
        </p>

        <button className="btn-primary" onClick={handleRegister}>
          Register
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
