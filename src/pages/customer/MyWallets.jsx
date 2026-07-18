import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import CustomerNav from "../../components/CustomerNav";
import { EmptyBoxIcon } from "../../components/Icons";
import { formatMoney } from "../../utils/format";

export default function MyWallets() {
  const toast = useToast();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myWallets()
      .then(setWallets)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Could not load your wallets"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="page">
      <CustomerNav active="wallets" />
      <div className="page-content">
        <div className="page-title-row">
          <div>
            <p className="text-subhead text-secondary">All shops</p>
            <h1 className="text-title1">My wallets</h1>
          </div>
          {!loading && wallets.length > 0 && (
            <span className="text-subhead text-secondary">{formatMoney(total)} total across {wallets.length} shop{wallets.length === 1 ? "" : "s"}</span>
          )}
        </div>

        {loading ? (
          <div className="wallet-grid">
            {[0, 1].map((i) => (
              <div className="wallet-card-item" key={i}>
                <div className="skeleton-line" style={{ width: "50%" }} />
                <div className="skeleton-line" style={{ width: "70%", marginTop: 10 }} />
              </div>
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="list-card">
            <div className="empty-state">
              <EmptyBoxIcon />
              <p className="text-subhead">No wallets yet</p>
              <p className="text-footnote text-tertiary" style={{ marginTop: 4 }}>
                Scan a QR code at any shop to start earning cashback
              </p>
              <Link to="/shops" className="btn btn-primary" style={{ width: "auto", marginTop: 16 }}>
                Browse shops
              </Link>
            </div>
          </div>
        ) : (
          <div className="wallet-grid">
            {wallets.map((w, i) => (
              <Link
                to={`/shops/${w.shop_id}`}
                className="wallet-card-item fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}
                key={w.shop_id}
              >
                <span className="category-pill">{w.shop_category}</span>
                <span className="shop-name text-headline">{w.shop_name}</span>
                <span className="amount">{formatMoney(w.balance)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
