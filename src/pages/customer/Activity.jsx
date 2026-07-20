import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import CustomerNav from "../../components/CustomerNav";
import { EmptyBoxIcon, TagIcon } from "../../components/Icons";
import { formatMoney, formatDateTime } from "../../utils/format";

export default function Activity() {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myTransactions()
      .then(setTransactions)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Could not load your activity"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <CustomerNav active="activity" />
      <div className="page-content">
        <div className="page-title-row">
          <div>
            <p className="text-subhead text-secondary">Everywhere</p>
            <h1 className="text-title1">Activity</h1>
          </div>
        </div>

        {loading ? (
          <div className="list-card">
            <div className="skeleton-line" style={{ width: "100%", height: 60 }} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="list-card">
            <div className="empty-state">
              <EmptyBoxIcon />
              <p className="text-subhead">No activity yet</p>
              <p className="text-footnote text-tertiary" style={{ marginTop: 4 }}>
                Scan a QR code at any shop to see it here
              </p>
              <Link to="/shops" className="btn btn-primary" style={{ width: "auto", marginTop: 16 }}>
                Browse shops
              </Link>
            </div>
          </div>
        ) : (
          <div className="list-card">
            {transactions.map((t) => (
              <div className="list-row" key={t.id}>
                <span className="icon">
                  <TagIcon />
                </span>
                <div className="main">
                  <div className="title">
                    {t.shop_name} &middot; {t.kind === "redeem" ? "Redeemed" : "Purchase"}
                  </div>
                  <div className="subtitle">{formatDateTime(t.claimed_at || t.created_at)}</div>
                </div>
                <div className="value" style={{ color: t.kind === "redeem" ? "var(--color-danger)" : undefined }}>
                  {t.kind === "redeem" ? `-${formatMoney(t.amount)}` : `+${formatMoney(t.cashback_amount)}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
