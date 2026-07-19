import { useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import ThemeToggle from "../components/ThemeToggle";

export default function ForgotPassword() {
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.forgotPassword(contact);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
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
        <h1 className="text-title1 auth-title">Reset your password</h1>
        <p className="text-subhead text-secondary auth-subtitle">
          Enter the phone or email on your account
        </p>

        {sent ? (
          <>
            <p className="text-subhead" style={{ marginTop: 16 }}>
              If an account exists for that contact, a reset code has been issued. This demo
              doesn't send real email/SMS — ask whoever is running the backend to check its
              console output for the code.
            </p>
            <p className="text-subhead auth-switch">
              Have a code? <Link to="/reset-password">Enter it here</Link>
            </p>
          </>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
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
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Send reset code"}
            </button>
          </form>
        )}

        <p className="text-subhead auth-switch">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
