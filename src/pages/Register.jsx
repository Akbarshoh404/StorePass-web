import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      const user = await register(name, contact, password);
      toast.success(`Welcome to StorePass, ${user.name.split(" ")[0]}!`);
      navigate("/shops", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create account");
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
        <h1 className="text-title1 auth-title">Create your account</h1>
        <p className="text-subhead text-secondary auth-subtitle">
          Join StorePass to earn cashback at shops near you
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="contact">Phone or email</label>
            <input
              id="contact"
              type="text"
              autoComplete="username"
              placeholder="you@example.com or phone number"
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
              autoComplete="new-password"
              placeholder="Create a password"
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
            {submitting ? <span className="spinner" /> : "Sign up"}
          </button>
        </form>

        <p className="text-footnote text-secondary auth-demo-hint">
          Shops are added by the platform admin, not self-registered. Sign in
          with a shop or admin account instead if that's what you're after.
        </p>

        <p className="text-subhead auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
