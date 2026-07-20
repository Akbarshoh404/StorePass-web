import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, ApiError } from "../api/client";
import ThemeToggle from "../components/ThemeToggle";
import { StarRating } from "../components/StarRating";
import {
  LogoutIcon,
  PersonIcon,
  PlusIcon,
  MinusIcon,
  EmptyBoxIcon,
  CheckIcon,
  DownloadIcon,
  ReplyIcon,
  XIcon,
} from "../components/Icons";
import { formatMoney, formatTime, formatDateTime, parseAmount } from "../utils/format";

export default function ShopDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState("earn");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastTxn, setLastTxn] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [celebrateTxn, setCelebrateTxn] = useState(null);
  const pollRef = useRef(null);
  // loadTransactions runs on a setInterval set up once (empty-dep effect
  // below), so it can't rely on the `lastTxn` state closure staying fresh —
  // a ref mirrors it instead.
  const lastTxnRef = useRef(null);

  function trackLastTxn(txn) {
    lastTxnRef.current = txn;
    setLastTxn(txn);
  }

  async function loadTransactions() {
    try {
      const data = await api.shopTransactions();
      setTransactions(data);
      const tracked = lastTxnRef.current;
      if (tracked && tracked.status === "pending") {
        const updated = data.find((t) => t.id === tracked.id);
        if (updated && updated.status === "claimed") {
          lastTxnRef.current = updated;
          setLastTxn(updated);
          setCelebrateTxn(updated);
          loadAnalytics();
        }
      }
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

  async function loadAnalytics() {
    try {
      setAnalytics(await api.shopAnalytics());
    } catch (err) {
      console.error("Could not load analytics:", err);
    }
  }

  useEffect(() => {
    loadTransactions();
    loadReviews();
    loadAnalytics();
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
      const txn = mode === "redeem" ? await api.createRedemption(value) : await api.createTransaction(value);
      trackLastTxn(txn);
      setAmount("");
      toast.success(mode === "redeem" ? `Redeem QR ready for ${formatMoney(value)}` : `QR ready for ${formatMoney(txn.amount)}`);
      loadTransactions();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not create transaction";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVoid(txn) {
    try {
      await api.voidTransaction(txn.id);
      toast.success("Transaction voided");
      if (lastTxnRef.current?.id === txn.id) {
        lastTxnRef.current = null;
        setLastTxn(null);
      }
      loadTransactions();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not void transaction");
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
            <div className="mode-toggle">
              <button
                type="button"
                className={mode === "earn" ? "active" : ""}
                onClick={() => setMode("earn")}
              >
                <PlusIcon width={16} height={16} /> Earn
              </button>
              <button
                type="button"
                className={mode === "redeem" ? "active" : ""}
                onClick={() => setMode("redeem")}
              >
                <MinusIcon width={16} height={16} /> Redeem
              </button>
            </div>
            <h2 className="text-title3">{mode === "redeem" ? "Redeem cashback" : "New transaction"}</h2>
            <form className="stack" style={{ marginTop: 16 }} onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="amount">{mode === "redeem" ? "Amount to redeem" : "Purchase amount"}</label>
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
                ) : mode === "redeem" ? (
                  <>
                    <MinusIcon width={18} height={18} /> Generate redeem QR
                  </>
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
                  {lastTxn.kind === "redeem" ? (
                    <>-{formatMoney(lastTxn.amount)}</>
                  ) : (
                    <>
                      {formatMoney(lastTxn.amount)} &middot;{" "}
                      <span className="cashback">+{formatMoney(lastTxn.cashback_amount)} cashback</span>
                    </>
                  )}
                </div>
                <p className="text-footnote text-secondary" style={{ marginTop: 8 }}>
                  Have the customer scan this in the StorePass app
                </p>
                {lastTxn.status === "pending" && (
                  <button
                    className="btn btn-ghost"
                    style={{ marginTop: 8, width: "auto" }}
                    onClick={() => handleVoid(lastTxn)}
                  >
                    Cancel this QR
                  </button>
                )}
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

        {analytics && (
          <>
            <div className="section-heading">
              <h2 className="text-title3">Analytics</h2>
            </div>
            <div className="stat-strip" style={{ marginBottom: 32 }}>
              <div className="stat-tile">
                <div className="value">
                  {analytics.claimed_count}/{analytics.generated_count}
                </div>
                <div className="label">Claim rate ({Math.round(analytics.claim_rate * 100)}%)</div>
              </div>
              <div className="stat-tile">
                <div className="value">{formatMoney(analytics.total_redeemed)}</div>
                <div className="label">Total redeemed</div>
              </div>
              <div className="stat-tile">
                <div className="value">{analytics.total_customers}</div>
                <div className="label">Customers served</div>
              </div>
              <div className="stat-tile">
                <div className="value">{Math.round(analytics.repeat_customer_rate * 100)}%</div>
                <div className="label">Repeat customers ({analytics.repeat_customers})</div>
              </div>
            </div>
            {analytics.daily_revenue.length > 0 && (
              <div className="table-card" style={{ marginBottom: 32 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Revenue</th>
                      <th>Cashback issued</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.daily_revenue
                      .slice()
                      .reverse()
                      .map((row) => (
                        <tr key={row.date}>
                          <td>{row.date}</td>
                          <td className="numeric">{formatMoney(row.revenue)}</td>
                          <td className="numeric">{formatMoney(row.cashback)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <ShopProfilePanel />

        <div className="admin-toolbar">
          <h2 className="text-title3">Transactions</h2>
          <a className="btn btn-ghost" href={api.exportShopTransactionsUrl()} style={{ width: "auto" }}>
            <DownloadIcon width={16} height={16} /> Export CSV
          </a>
        </div>
        <div className="table-card" style={{ marginBottom: 32 }}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Kind</th>
                <th>Amount</th>
                <th>Cashback</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {txnLoading
                ? [0, 1, 2].map((i) => (
                    <tr key={i} className="skeleton-row">
                      <td colSpan={6}>
                        <div className="skeleton-line" style={{ width: "100%" }} />
                      </td>
                    </tr>
                  ))
                : transactions.map((t, i) => (
                    <tr key={t.id} className="table-row-in" style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}>
                      <td>{formatTime(t.created_at)}</td>
                      <td>{t.kind === "redeem" ? "Redeem" : "Earn"}</td>
                      <td>{t.kind === "redeem" ? `-${formatMoney(t.amount)}` : formatMoney(t.amount)}</td>
                      <td>{t.kind === "redeem" ? "—" : formatMoney(t.cashback_amount)}</td>
                      <td>
                        <span className={`status-pill ${t.status}`}>{t.status}</span>
                      </td>
                      <td>
                        {t.status === "pending" && (
                          <button className="btn btn-icon icon-btn-danger" onClick={() => handleVoid(t)} aria-label="Void">
                            <XIcon width={16} height={16} />
                          </button>
                        )}
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
              <ReviewRow key={r.id} review={r} onReplied={loadReviews} />
            ))}
          </div>
        )}
      </div>

      {celebrateTxn && (
        <div className="scan-sheet-backdrop" onClick={() => setCelebrateTxn(null)}>
          <div className="scan-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="result-burst">
              <div className="check">
                <CheckIcon />
              </div>
              {celebrateTxn.kind === "redeem" ? (
                <>
                  <p className="text-title2">Redeemed!</p>
                  <p className="text-subhead text-secondary">
                    -{formatMoney(celebrateTxn.amount)} from a customer's wallet
                  </p>
                </>
              ) : (
                <>
                  <p className="text-title2">Cashback claimed!</p>
                  <p className="text-subhead text-secondary">
                    {formatMoney(celebrateTxn.amount)} purchase &middot; +{formatMoney(celebrateTxn.cashback_amount)}{" "}
                    cashback
                  </p>
                </>
              )}
              <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setCelebrateTxn(null)}>
                Nice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopProfilePanel() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    category: user.category || "",
    description: user.description || "",
    logo_url: user.logo_url || "",
    address: user.address || "",
    phone: user.phone || "",
    hours: user.hours || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.updateMyShop(form);
      await refresh();
      toast.success("Shop profile updated");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update shop profile");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-title-row">
        <h2 className="text-title3">Shop profile</h2>
        <button className="btn btn-ghost" style={{ width: "auto" }} onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Edit"}
        </button>
      </div>
      {open && (
        <div className="card add-shop-panel" style={{ marginBottom: 32 }}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="sp-name">Shop name</label>
              <input id="sp-name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="sp-category">Category</label>
              <input
                id="sp-category"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                required
              />
            </div>
            <div className="field span-2">
              <label htmlFor="sp-desc">Description</label>
              <input id="sp-desc" value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
            <div className="field span-2">
              <label htmlFor="sp-logo">Logo URL</label>
              <input
                id="sp-logo"
                type="url"
                value={form.logo_url}
                onChange={(e) => setField("logo_url", e.target.value)}
              />
            </div>
            <div className="field span-2">
              <label htmlFor="sp-address">Address</label>
              <input id="sp-address" value={form.address} onChange={(e) => setField("address", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sp-phone">Phone</label>
              <input id="sp-phone" type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="sp-hours">Hours</label>
              <input id="sp-hours" value={form.hours} onChange={(e) => setField("hours", e.target.value)} />
            </div>
            {error && (
              <p className="form-error" style={{ gridColumn: "1 / -1" }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary" style={{ gridColumn: "1 / -1" }} disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Save changes"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ReviewRow({ review, onReplied }) {
  const toast = useToast();
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await api.replyToReview(review.id, reply.trim());
      toast.success("Reply posted");
      setReplying(false);
      onReplied();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not post reply");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="review-row">
      <div className="review-row-top">
        <span className="review-author">{review.customer_name}</span>
        <span className="review-date">{formatDateTime(review.created_at)}</span>
      </div>
      <StarRating value={review.rating} />
      {review.comment && <p className="review-comment">{review.comment}</p>}

      {review.shop_reply ? (
        <div className="shop-reply">
          <span className="shop-reply-label">Your reply</span>
          <p>{review.shop_reply}</p>
        </div>
      ) : replying ? (
        <form className="stack" style={{ marginTop: 12 }} onSubmit={handleSubmit}>
          <textarea
            rows={2}
            placeholder="Write a reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ width: "auto" }} disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Post reply"}
            </button>
            <button type="button" className="btn btn-ghost" style={{ width: "auto" }} onClick={() => setReplying(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="btn btn-ghost" style={{ width: "auto", marginTop: 8 }} onClick={() => setReplying(true)}>
          <ReplyIcon width={16} height={16} /> Reply
        </button>
      )}
    </div>
  );
}
