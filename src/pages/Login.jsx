import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";
import { auth, googleProvider } from "../firebase";
import ThemeToggle from "../components/ThemeToggle";
import { GoogleIcon } from "../components/Icons";
import { roleHome } from "../utils/roles";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorNonce, setErrorNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

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

  async function handleGoogleSignIn() {
    setError("");
    setGoogleSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const user = await loginWithGoogle(idToken);
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user") {
        // user just changed their mind — not an error worth surfacing
        return;
      }
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err?.code === "auth/operation-not-allowed") {
        setError("Google sign-in isn't enabled for this Firebase project yet — enable it under Authentication → Sign-in method → Google in the Firebase console.");
      } else if (err?.code === "auth/unauthorized-domain") {
        setError("This domain isn't authorized for Google sign-in — add it under Authentication → Settings → Authorized domains in the Firebase console.");
      } else if (err?.code) {
        setError(`Could not sign in with Google (${err.code})`);
      } else {
        setError("Could not sign in with Google");
      }
      setErrorNonce((n) => n + 1);
    } finally {
      setGoogleSubmitting(false);
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

        <button
          type="button"
          className="btn btn-secondary auth-google-btn"
          onClick={handleGoogleSignIn}
          disabled={googleSubmitting || submitting}
        >
          {googleSubmitting ? <span className="spinner" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

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
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
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
          <button type="submit" className="btn btn-primary" disabled={submitting || googleSubmitting}>
            {submitting ? <span className="spinner" /> : "Sign in"}
          </button>
        </form>

        <p className="text-subhead auth-switch">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>

        <p className="text-subhead auth-switch">
          New to StorePass? <Link to="/register">Sign up</Link> — or use Google above, it works for
          both.
        </p>
      </div>
    </div>
  );
}
