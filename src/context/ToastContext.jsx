import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckIcon, XIcon, InfoIcon, WarningIcon } from "../components/Icons";

const ToastContext = createContext(null);
const ICONS = { success: CheckIcon, error: WarningIcon, info: InfoIcon };
const DURATION = 4200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 220);
  }, []);

  const notify = useCallback(
    (message, type = "info") => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, message, type, leaving: false }]);
      setTimeout(() => dismiss(id), DURATION);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (message) => notify(message, "success"),
    error: (message) => notify(message, "error"),
    info: (message) => notify(message, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" role="region" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || InfoIcon;
          return (
            <div key={t.id} className={`toast toast-${t.type} ${t.leaving ? "leaving" : ""}`}>
              <span className="toast-icon">
                <Icon width={18} height={18} />
              </span>
              <span className="toast-message">{t.message}</span>
              <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <XIcon width={14} height={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
