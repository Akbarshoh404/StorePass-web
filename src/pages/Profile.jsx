import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { ApiError } from "../api/client";
import {
  EditIcon,
  ShieldIcon,
  LogoutIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  ChevronRightIcon,
  DownloadIcon,
} from "../components/Icons";
import { roleHome } from "../utils/roles";

const MOBILE_APP_URL = "https://github.com/Akbarshoh404/StorePass-mobile/releases";

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const initial = user.name ? user.name[0].toUpperCase() : "?";
  const role = user.role[0].toUpperCase() + user.role.slice(1);

  return (
    <div className="page">
      <div className="profile-hero">
        <div className="profile-hero-nav">
          <Link to={roleHome(user.role)} className="profile-hero-back" aria-label="Back">
            <ChevronRightIcon style={{ transform: "rotate(180deg)" }} />
          </Link>
          <button className="profile-hero-back" onClick={logout} aria-label="Log out">
            <LogoutIcon />
          </button>
        </div>
        <div className="profile-avatar">{initial}</div>
        <h1 className="profile-name">{user.name}</h1>
        <p className="profile-contact">{user.contact}</p>
        <span className="profile-role-pill">{role}</span>
      </div>

      <div className="page-content narrow">
        <p className="settings-group-title">Account</p>
        <div className="list-card">
          <button className="list-row settings-row" onClick={() => setNameModalOpen(true)}>
            <span className="icon">
              <EditIcon />
            </span>
            <div className="main">
              <div className="title">Display name</div>
              <div className="subtitle">{user.name}</div>
            </div>
            <ChevronRightIcon width={18} height={18} />
          </button>
          <button className="list-row settings-row" onClick={() => setPasswordModalOpen(true)}>
            <span className="icon">
              <ShieldIcon />
            </span>
            <div className="main">
              <div className="title">Password</div>
              <div className="subtitle">
                {user.has_password ? "Set — you can sign in with it anytime" : "Not set — sign-in only works via Google"}
              </div>
            </div>
            {!user.has_password && <span className="danger-badge">Unprotected</span>}
            <ChevronRightIcon width={18} height={18} />
          </button>
        </div>

        <p className="settings-group-title">Preferences</p>
        <div className="list-card" style={{ marginBottom: 32 }}>
          <div className="list-row settings-row">
            <span className="icon">{theme === "dark" ? <MoonIcon /> : <SunIcon />}</span>
            <div className="main">
              <div className="title">Appearance</div>
              <div className="subtitle">{theme === "dark" ? "Dark" : "Light"}</div>
            </div>
            <button
              type="button"
              className={`toggle-switch ${theme === "dark" ? "on" : ""}`}
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </div>
        </div>

        <p className="settings-group-title">App</p>
        <div className="list-card" style={{ marginBottom: 32 }}>
          <a className="list-row settings-row" href={MOBILE_APP_URL} target="_blank" rel="noreferrer">
            <span className="icon">
              <DownloadIcon />
            </span>
            <div className="main">
              <div className="title">Get the mobile app</div>
              <div className="subtitle">Scan and check wallets on the go</div>
            </div>
            <ChevronRightIcon width={18} height={18} />
          </a>
        </div>

        <div className="list-card" style={{ marginBottom: 32 }}>
          <button className="list-row settings-row danger" onClick={logout}>
            <span className="icon danger">
              <LogoutIcon />
            </span>
            <div className="main">
              <div className="title">Sign out</div>
            </div>
          </button>
        </div>
      </div>

      {nameModalOpen && <EditNameModal onClose={() => setNameModalOpen(false)} />}
      {passwordModalOpen && (
        <SetPasswordModal hasPassword={user.has_password} onClose={() => setPasswordModalOpen(false)} />
      )}
    </div>
  );
}

function EditNameModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await updateProfile({ name });
      toast.success("Display name updated");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update profile");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="scan-sheet-backdrop" onClick={onClose}>
      <div className="scan-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2 className="text-title3">Display name</h2>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>
        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="profile-name">Display name</label>
            <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <span className="spinner" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SetPasswordModal({ hasPassword, onClose }) {
  const { updateProfile } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
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
      const payload = { password };
      if (hasPassword) payload.current_password = currentPassword;
      await updateProfile(payload);
      toast.success(hasPassword ? "Password updated" : "Password set");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="scan-sheet-backdrop" onClick={onClose}>
      <div className="scan-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2 className="text-title3">{hasPassword ? "Change password" : "Set a password"}</h2>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>
        {!hasPassword && (
          <p className="text-footnote text-secondary" style={{ marginBottom: 16 }}>
            You currently sign in with Google only. Add a password so you can sign in without it too.
          </p>
        )}
        <form className="stack" onSubmit={handleSubmit}>
          {hasPassword && (
            <div className="field">
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <span className="spinner" /> : hasPassword ? "Update password" : "Set password"}
          </button>
        </form>
      </div>
    </div>
  );
}
