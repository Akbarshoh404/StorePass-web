import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";
import ThemeToggle from "../components/ThemeToggle";
import { LogoutIcon } from "../components/Icons";
import { roleHome } from "../utils/roles";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      await updateProfile(payload);
      setPassword("");
      toast.success("Profile updated");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update profile");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <header className="page-nav">
        <Link to={roleHome(user.role)} className="brand">
          <span className="brand-mark">S</span>
          StorePass
        </Link>
        <div className="nav-user">
          <ThemeToggle />
          <button className="btn btn-icon" onClick={logout} aria-label="Log out">
            <LogoutIcon />
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1 className="text-title2">Profile</h1>
          <p className="text-subhead text-secondary" style={{ marginBottom: 24 }}>
            {user.contact} · {user.role}
          </p>

          <form className="stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Display name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
