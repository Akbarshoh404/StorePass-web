import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";
import ThemeToggle from "../components/ThemeToggle";
import { roleHome } from "../utils/roles";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorNonce, setErrorNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(contact, password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in");
      setErrorNonce((n) => n + 1);
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
        <h1 className="text-title1 auth-title">Welcome back</h1>
        <p className="text-subhead text-secondary auth-subtitle">Sign in to StorePass</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="contact">Phone or email</label>
            <input
              id="contact"
              type="text"
              autoComplete="username"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="form-error shake" key={errorNonce}>
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <span className="spinner" /> : "Sign in"}
          </button>
        </form>

        <p className="text-footnote text-secondary auth-demo-hint">
          <strong>Demo accounts</strong>
          <br />
          Admin — admin@storepass.demo / admin123
          <br />
          Shop — shop1@storepass.demo / shop123
          <br />
          Customer — customer@storepass.demo / customer123
        </p>

        <p className="text-subhead auth-switch">
          New to StorePass? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
