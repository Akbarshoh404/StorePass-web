import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { StoreIcon, WalletIcon, PersonIcon, LogoutIcon } from "./Icons";

export default function CustomerNav({ active }) {
  const { logout } = useAuth();

  return (
    <header className="page-nav customer-nav">
      <Link to="/shops" className="brand">
        <span className="brand-mark">S</span>
        StorePass
      </Link>
      <nav className="nav-tabs" aria-label="Sections">
        <Link
          to="/shops"
          className={active === "directory" ? "active" : ""}
          aria-current={active === "directory" ? "page" : undefined}
        >
          <StoreIcon /> Shops
        </Link>
        <Link
          to="/wallets"
          className={active === "wallets" ? "active" : ""}
          aria-current={active === "wallets" ? "page" : undefined}
        >
          <WalletIcon /> My wallets
        </Link>
      </nav>
      <div className="nav-user">
        <ThemeToggle />
        <Link to="/profile" className="btn btn-icon" aria-label="Profile">
          <PersonIcon />
        </Link>
        <button className="btn btn-icon" onClick={logout} aria-label="Log out">
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}
