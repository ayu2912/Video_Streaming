import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const API = "http://127.0.0.1:5000/api";
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);       // 1=email, 2=otp+newpass
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(""); // shown on screen
  const [newPassword, setNewPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const safeFetch = async (url, options) => {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text) };
    } catch {
      // Server returned non-JSON (HTML error page = old server running)
      throw new Error("Server needs restart — please stop and restart your backend.");
    }
  };

  // Step 1 — send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await safeFetch(`${API}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!ok) { setError(data.message); setLoading(false); return; }
      setGeneratedOtp(data.otp);
      setStep(2);
    } catch (err) {
      setError(err.message || "Cannot reach server. Is the backend running?");
    }
    setLoading(false);
  };

  // Step 2 — verify OTP + set new password
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordRegex.test(newPassword)) {
      setError("Min 8 chars with uppercase, lowercase, number & special character (@$!%*?&).");
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await safeFetch(`${API}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (!ok) { setError(data.message); setLoading(false); return; }
      navigate("/login");
    } catch (err) {
      setError(err.message || "Cannot reach server. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page auth-bg">
      <div className="auth-overlay" />
      <div className="auth-card">
        <button
          className="back-btn-auth"
          onClick={() => step === 1 ? navigate("/login") : setStep(1)}
        >
          ← {step === 1 ? "Back to Login" : "Back"}
        </button>

        <h2>Forgot Password</h2>

        {/* Step indicator */}
        <div className="otp-steps">
          <span className={step >= 1 ? "otp-step active" : "otp-step"}>1</span>
          <div className="otp-step-line" />
          <span className={step >= 2 ? "otp-step active" : "otp-step"}>2</span>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {/* STEP 1: Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <p className="otp-hint">Enter your registered email and we'll send a reset code.</p>
            <input
              type="email"
              placeholder="Registered email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP + New Password */}
        {step === 2 && (
          <form onSubmit={handleReset}>
            {/* Show OTP on screen (no email service) */}
            <div className="otp-display">
              <p>Your reset code (sent to {email}):</p>
              <span className="otp-code">{generatedOtp}</span>
              <p className="otp-expiry">Valid for 10 minutes</p>
            </div>

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />

            <div className="password-wrapper">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span className="toggle-password" onClick={() => setShowNew((p) => !p)}>
                {showNew ? "🙈" : "👁"}
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
