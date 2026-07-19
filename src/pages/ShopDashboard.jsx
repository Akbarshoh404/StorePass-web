import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, ApiError } from "../api/client";
import ThemeToggle from "../components/ThemeToggle";
import { StarRating } from "../components/StarRating";
import { LogoutIcon, PersonIcon, PlusIcon, EmptyBoxIcon } from "../components/Icons";
import { formatMoney, formatTime, formatDateTime, parseAmount } from "../utils/format";

export default function ShopDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastTxn, setLastTxn] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const pollRef = useRef(null);

  async function loadTransactions() {
    try {
      const data = await api.shopTransactions();
      setTransactions(data);
    } catch (err) {
      // polled every 5s — logged, not toasted, so a down backend doesn't spam toasts
      console.error("Could not load transactions:", err);
    } finally {
      setTxnLoading(false);
    }
  }

  async function loadReviews() {
    try {
      const data = await api.shopReviews(user.id);
      setReviews(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load your reviews");
    } finally {
      setReviewsLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
    loadReviews();
    pollRef.current = setInterval(loadTransactions, 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const value = parseAmount(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    setSubmitting(true);
    try {
      const txn = await api.createTransaction(value);
      setLastTxn(txn);
      setAmount("");
      toast.success(`QR ready for ${formatMoney(txn.amount)}`);
      loadTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not create transaction";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return (
    <div className="page">
      <header className="page-nav">
        <div className="brand">
          <span className="brand-mark">S</span>
          StorePass
        </div>
        <div className="nav-user">
          <span className="text-subhead text-secondary">{user.name}</span>
          <ThemeToggle />
          <Link to="/profile" className="btn btn-icon" aria-label="Profile">
            <PersonIcon />
          </Link>
          <button className="btn btn-icon" onClick={logout} aria-label="Log out">
            <LogoutIcon />
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="dashboard-columns">
          <div className="card">
            <h2 className="text-title3">New transaction</h2>
            <form className="stack" style={{ marginTop: 16 }} onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="amount">Purchase amount</label>
                <input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <PlusIcon width={18} height={18} /> Generate QR
                  </>
                )}
              </button>
            </form>

            {lastTxn && (
              <div className="qr-display pop-in" key={lastTxn.qr_token}>
                <img src={api.qrImageUrl(lastTxn.qr_token)} alt="Transaction QR code" />
                <div className="amounts">
                  {formatMoney(lastTxn.amount)} &middot;{" "}
                  <span className="cashback">+{formatMoney(lastTxn.cashback_amount)} cashback</span>
                </div>
                <p className="text-footnote text-secondary" style={{ marginTop: 8 }}>
                  Have the customer scan this in the StorePass app
                </p>
              </div>
            )}
          </div>

          <div className="card rating-summary">
            <p className="text-subhead text-secondary">Your rating</p>
            {reviewsLoading ? (
              <div className="skeleton-line" style={{ width: "50%", margin: "12px auto" }} />
            ) : avgRating != null ? (
              <>
                <div className="big-number">{avgRating.toFixed(1)}</div>
                <StarRating value={avgRating} size="lg" />
                <p className="text-footnote text-secondary">
                  from {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </p>
              </>
            ) : (
              <p className="text-subhead text-tertiary" style={{ marginTop: 12 }}>
                No reviews yet
              </p>
            )}
          </div>
        </div>

        <div className="section-heading">
          <h2 className="text-title3">Transactions</h2>
        </div>
        <div className="table-card" style={{ marginBottom: 32 }}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Amount</th>
                <th>Cashback</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {txnLoading
                ? [0, 1, 2].map((i) => (
                    <tr key={i} className="skeleton-row">
                      <td colSpan={4}>
                        <div className="skeleton-line" style={{ width: "100%" }} />
                      </td>
                    </tr>
                  ))
                : transactions.map((t, i) => (
                    <tr key={t.id} className="table-row-in" style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}>
                      <td>{formatTime(t.created_at)}</td>
                      <td>{formatMoney(t.amount)}</td>
                      <td>{formatMoney(t.cashback_amount)}</td>
                      <td>
                        <span className={`status-pill ${t.status}`}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!txnLoading && transactions.length === 0 && (
            <div className="table-empty text-subhead">No transactions yet</div>
          )}
        </div>

        <div className="section-heading">
          <h2 className="text-title3">Reviews</h2>
        </div>
        {reviewsLoading ? (
          <div className="list-card">
            <div className="skeleton-line" style={{ width: "100%", height: 60 }} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="list-card">
            <div className="empty-state">
              <EmptyBoxIcon />
              <p className="text-subhead">No reviews yet</p>
            </div>
          </div>
        ) : (
          <div className="list-card">
            {reviews.map((r) => (
              <div className="review-row" key={r.id}>
                <div className="review-row-top">
                  <span className="review-author">{r.customer_name}</span>
                  <span className="review-date">{formatDateTime(r.created_at)}</span>
                </div>
                <StarRating value={r.rating} />
                {r.comment && <p className="review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
