import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ThemeToggle";

export default function ResetPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await api.resetPassword({ token, password });
      toast.success("Password updated — sign in with your new password");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card fade-up">
        <div className="auth-topbar">
          <ThemeToggle />
        </div>
        <Link to="/" className="auth-mark" aria-label="Back to home">
          S
        </Link>
        <h1 className="text-title1 auth-title">Enter your reset code</h1>
        <p className="text-subhead text-secondary auth-subtitle">
          Paste the code from{" "}
          <Link to="/forgot-password">the reset request</Link> and choose a new password
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="token">Reset code</label>
            <input
              id="token"
              type="text"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <span className="spinner" /> : "Reset password"}
          </button>
        </form>

        <p className="text-subhead auth-switch">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
