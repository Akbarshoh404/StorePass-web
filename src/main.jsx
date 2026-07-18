import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/auth.css";
import "./styles/app-shell.css";
import "./styles/directory.css";
import "./styles/shop-dashboard.css";
import "./styles/admin.css";
import "./styles/landing.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
