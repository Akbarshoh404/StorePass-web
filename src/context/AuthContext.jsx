import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // The session cookie is shared per-browser, not per-tab. Testing both roles
  // in one browser (very common for this demo) means logging into the second
  // account silently swaps the identity behind any tab still open on the
  // first — without this, a stale tab keeps showing the old role's UI until
  // it hits a confusing 403. Re-check identity whenever the tab regains focus
  // so a stale tab's role-gated routes redirect immediately instead.
  useEffect(() => {
    function revalidateOnFocus() {
      if (document.visibilityState === "visible") {
        api.me().then(setUser).catch(() => setUser(null));
      }
    }
    window.addEventListener("focus", revalidateOnFocus);
    document.addEventListener("visibilitychange", revalidateOnFocus);
    return () => {
      window.removeEventListener("focus", revalidateOnFocus);
      document.removeEventListener("visibilitychange", revalidateOnFocus);
    };
  }, []);

  const login = useCallback(async (contact, password) => {
    const loggedInUser = await api.login({ contact, password });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (name, contact, password) => {
    const newUser = await api.register({ name, contact, password });
    setUser(newUser);
    return newUser;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const loggedInUser = await api.loginWithGoogle(idToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await api.updateMe(payload);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const refreshed = await api.me();
    setUser(refreshed);
    return refreshed;
  }, []);

  // Non-throwing variant of refresh, safe to call speculatively (e.g. right
  // before opening the scanner) to catch a session swap even when no
  // focus/visibility event fired — two tabs open side by side, for instance.
  const revalidate = useCallback(async () => {
    try {
      const current = await api.me();
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, updateProfile, logout, refresh, revalidate }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
