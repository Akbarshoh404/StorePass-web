import { useEffect, useState } from "react";
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
  TrashIcon,
  StoreIcon,
  UsersIcon,
  ReceiptIcon,
  StarIcon,
  DownloadIcon,
  XIcon,
  EditIcon,
} from "../components/Icons";
import { formatMoney, formatDateTime } from "../utils/format";

const TABS = [
  { key: "shops", label: "Shops", icon: StoreIcon },
  { key: "customers", label: "Customers", icon: UsersIcon },
  { key: "transactions", label: "Transactions", icon: ReceiptIcon },
  { key: "reviews", label: "Reviews", icon: StarIcon },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("shops");
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);

  async function loadShops() {
    setShopsLoading(true);
    try {
      setShops(await api.admin.listShops());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load shops");
    } finally {
      setShopsLoading(false);
    }
  }

  useEffect(() => {
    loadShops();
  }, []);

  return (
    <div className="page">
      <header className="page-nav">
        <div className="brand">
          <span className="brand-mark">S</span>
          StorePass
        </div>
        <nav className="nav-tabs" aria-label="Sections">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => setTab(key)}
              aria-current={tab === key ? "page" : undefined}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>
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
        <div className="tab-panel fade-up" key={tab}>
          {tab === "shops" && (
            <ShopsTab shops={shops} loading={shopsLoading} onChanged={loadShops} />
          )}
          {tab === "customers" && <CustomersTab shops={shops} />}
          {tab === "transactions" && <TransactionsTab shops={shops} />}
          {tab === "reviews" && <ReviewsTab shops={shops} />}
        </div>
      </div>
    </div>
  );
}

function ShopsTab({ shops, loading, onChanged }) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    contact: "",
    password: "",
    description: "",
    logo_url: "",
    address: "",
    phone: "",
    hours: "",
    cashback_rate: "1",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    const rate = Number(form.cashback_rate) / 100;
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      setError("Cashback rate must be a number between 0 and 100");
      return;
    }
    setSubmitting(true);
    try {
      await api.admin.createShop({ ...form, cashback_rate: rate });
      toast.success(`${form.name} added`);
      setForm({
        name: "",
        category: "",
        contact: "",
        password: "",
        description: "",
        logo_url: "",
        address: "",
        phone: "",
        hours: "",
        cashback_rate: "1",
      });
      setShowForm(false);
      onChanged();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not create shop";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(shop) {
    try {
      await api.admin.updateShop(shop.id, { is_active: !shop.is_active });
      toast.success(`${shop.name} ${shop.is_active ? "deactivated" : "reactivated"}`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update shop");
    }
  }

  return (
    <>
      <div className="stat-strip">
        <div className="stat-tile">
          <div className="value">{shops.length}</div>
          <div className="label">Total shops</div>
        </div>
        <div className="stat-tile">
          <div className="value">{shops.filter((s) => s.is_active).length}</div>
          <div className="label">Active</div>
        </div>
        <div className="stat-tile">
          <div className="value">{shops.reduce((sum, s) => sum + s.total_transactions, 0)}</div>
          <div className="label">Transactions</div>
        </div>
        <div className="stat-tile">
          <div className="value">
            {formatMoney(shops.reduce((sum, s) => sum + s.total_cashback_issued, 0))}
          </div>
          <div className="label">Cashback issued</div>
        </div>
      </div>

      <div className="page-title-row">
        <h2 className="text-title3">Shops</h2>
        <button className="btn btn-fill" style={{ width: "auto" }} onClick={() => setShowForm((s) => !s)}>
          <PlusIcon width={18} height={18} /> Add shop
        </button>
      </div>

      {showForm && (
        <div className="card add-shop-panel">
          <form className="form-grid" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="s-name">Shop name</label>
              <input
                id="s-name"
                placeholder="Nike Downtown"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="s-category">Category</label>
              <input
                id="s-category"
                placeholder="Sneakers, clothing, sports gear…"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="s-contact">Login contact (email/phone)</label>
              <input
                id="s-contact"
                placeholder="shop@example.com"
                value={form.contact}
                onChange={(e) => setField("contact", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="s-password">Temporary password</label>
              <input
                id="s-password"
                type="text"
                placeholder="Temporary password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="s-rate">Cashback rate (%)</label>
              <input
                id="s-rate"
                type="text"
                inputMode="decimal"
                placeholder="1"
                value={form.cashback_rate}
                onChange={(e) => setField("cashback_rate", e.target.value)}
                required
              />
            </div>
            <div className="field span-2">
              <label htmlFor="s-desc">Description</label>
              <input
                id="s-desc"
                placeholder="Optional — shown on the shop's public page"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
            <div className="field span-2">
              <label htmlFor="s-logo">Logo URL</label>
              <input
                id="s-logo"
                type="url"
                placeholder="Optional — https://…"
                value={form.logo_url}
                onChange={(e) => setField("logo_url", e.target.value)}
              />
            </div>
            <div className="field span-2">
              <label htmlFor="s-address">Address</label>
              <input
                id="s-address"
                placeholder="Optional"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="s-phone">Phone</label>
              <input
                id="s-phone"
                type="tel"
                placeholder="Optional"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="s-hours">Hours</label>
              <input
                id="s-hours"
                placeholder="Optional — e.g. Mon–Fri 9–6"
                value={form.hours}
                onChange={(e) => setField("hours", e.target.value)}
              />
            </div>
            {error && (
              <p className="form-error span-2" style={{ gridColumn: "1 / -1" }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary" style={{ gridColumn: "1 / -1" }} disabled={submitting}>
              {submitting ? <span className="spinner" /> : "Create shop"}
            </button>
          </form>
        </div>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Shop</th>
              <th>Category</th>
              <th>Rate</th>
              <th>Transactions</th>
              <th>Cashback issued</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [0, 1].map((i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={7}>
                      <div className="skeleton-line" style={{ width: "100%" }} />
                    </td>
                  </tr>
                ))
              : shops.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="text-headline">{s.name}</div>
                      <div className="text-footnote text-secondary">{s.contact}</div>
                    </td>
                    <td>{s.category}</td>
                    <td>{(s.cashback_rate * 100).toFixed(0)}%</td>
                    <td className="numeric">{s.total_transactions}</td>
                    <td className="numeric">{formatMoney(s.total_cashback_issued)}</td>
                    <td>{s.average_rating != null ? `${s.average_rating.toFixed(1)} ★` : "—"}</td>
                    <td>
                      <div className="table-row-actions">
                        <span className={`status-pill ${s.is_active ? "active" : "inactive"}`}>
                          {s.is_active ? "active" : "inactive"}
                        </span>
                        <button
                          className={`toggle-switch ${s.is_active ? "on" : ""}`}
                          onClick={() => toggleActive(s)}
                          aria-label={s.is_active ? `Deactivate ${s.name}` : `Reactivate ${s.name}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && shops.length === 0 && (
          <div className="table-empty text-subhead">No shops yet — add the first one above</div>
        )}
      </div>
    </>
  );
}

function CustomersTab({ shops }) {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustingCustomer, setAdjustingCustomer] = useState(null);

  function load() {
    setLoading(true);
    api.admin
      .listCustomers()
      .then(setCustomers)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Could not load customers"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleActive(customer) {
    try {
      if (customer.is_active) {
        await api.admin.suspendCustomer(customer.id);
        toast.success(`${customer.name} suspended`);
      } else {
        await api.admin.reactivateCustomer(customer.id);
        toast.success(`${customer.name} reactivated`);
      }
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update customer");
    }
  }

  return (
    <>
      <div className="page-title-row">
        <h2 className="text-title3">Customers</h2>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Joined</th>
              <th>Wallets</th>
              <th>Total balance</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [0, 1].map((i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={7}>
                      <div className="skeleton-line" style={{ width: "100%" }} />
                    </td>
                  </tr>
                ))
              : customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.contact}</td>
                    <td>{formatDateTime(c.created_at)}</td>
                    <td className="numeric">{c.wallet_count}</td>
                    <td className="numeric">{formatMoney(c.total_balance)}</td>
                    <td>
                      <div className="table-row-actions">
                        <span className={`status-pill ${c.is_active ? "active" : "inactive"}`}>
                          {c.is_active ? "active" : "suspended"}
                        </span>
                        <button
                          className={`toggle-switch ${c.is_active ? "on" : ""}`}
                          onClick={() => toggleActive(c)}
                          aria-label={c.is_active ? `Suspend ${c.name}` : `Reactivate ${c.name}`}
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-icon"
                        onClick={() => setAdjustingCustomer(c)}
                        aria-label={`Adjust ${c.name}'s wallet balance`}
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && customers.length === 0 && (
          <div className="table-empty text-subhead">No customers have registered yet</div>
        )}
      </div>

      {adjustingCustomer && (
        <AdjustWalletModal
          customer={adjustingCustomer}
          shops={shops}
          onClose={() => setAdjustingCustomer(null)}
          onAdjusted={load}
        />
      )}
    </>
  );
}

function AdjustWalletModal({ customer, shops, onClose, onAdjusted }) {
  const toast = useToast();
  const [shopId, setShopId] = useState(shops[0]?.id || "");
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const deltaValue = Number(delta);
    if (!shopId) {
      setError("Choose a shop");
      return;
    }
    if (!Number.isFinite(deltaValue) || deltaValue === 0) {
      setError("Enter a non-zero amount (negative to deduct)");
      return;
    }
    setSubmitting(true);
    try {
      await api.admin.adjustWallet({ customer_id: customer.id, shop_id: shopId, delta: deltaValue, note });
      toast.success(`${customer.name}'s balance adjusted`);
      onAdjusted();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not adjust balance");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="scan-sheet-backdrop" onClick={onClose}>
      <div className="scan-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2 className="text-title3">Adjust {customer.name}'s balance</h2>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>
        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="adj-shop">Shop</label>
            <select id="adj-shop" value={shopId} onChange={(e) => setShopId(Number(e.target.value))} required>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="adj-delta">Amount (negative to deduct)</label>
            <input
              id="adj-delta"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 5 or -5"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="adj-note">Note (optional)</label>
            <input id="adj-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for correction" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <span className="spinner" /> : "Apply adjustment"}
          </button>
        </form>
      </div>
    </div>
  );
}

function TransactionsTab({ shops }) {
  const toast = useToast();
  const [shopId, setShopId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.admin
      .listTransactions(shopId || undefined)
      .then(setTransactions)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Could not load transactions"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [shopId]);

  async function handleVoid(txn) {
    try {
      await api.admin.voidTransaction(txn.id);
      toast.success("Transaction voided");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not void transaction");
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="text-title3">Transactions</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select className="filter-select" value={shopId} onChange={(e) => setShopId(e.target.value)}>
            <option value="">All shops</option>
            {shops.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <a className="btn btn-ghost" href={api.admin.exportTransactionsUrl(shopId || undefined)} style={{ width: "auto" }}>
            <DownloadIcon width={16} height={16} /> Export
          </a>
        </div>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shop</th>
              <th>Customer</th>
              <th>Kind</th>
              <th>Amount</th>
              <th>Cashback</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [0, 1].map((i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={8}>
                      <div className="skeleton-line" style={{ width: "100%" }} />
                    </td>
                  </tr>
                ))
              : transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDateTime(t.created_at)}</td>
                    <td>{t.shop_name}</td>
                    <td>{t.customer_name || "—"}</td>
                    <td>{t.kind === "redeem" ? "Redeem" : "Earn"}</td>
                    <td className="numeric">{t.kind === "redeem" ? `-${formatMoney(t.amount)}` : formatMoney(t.amount)}</td>
                    <td className="numeric">{t.kind === "redeem" ? "—" : formatMoney(t.cashback_amount)}</td>
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
        {!loading && transactions.length === 0 && (
          <div className="table-empty text-subhead">No transactions yet</div>
        )}
      </div>
    </>
  );
}

function ReviewsTab({ shops }) {
  const toast = useToast();
  const [shopId, setShopId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.admin
      .listReviews(shopId || undefined)
      .then(setReviews)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Could not load reviews"))
      .finally(() => setLoading(false));
  }

  useEffect(load, [shopId]);

  async function handleDelete(review) {
    try {
      await api.admin.deleteReview(review.id);
      toast.success("Review removed");
      setReviews((list) => list.filter((r) => r.id !== review.id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove review");
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <h2 className="text-title3">Reviews</h2>
        <select className="filter-select" value={shopId} onChange={(e) => setShopId(e.target.value)}>
          <option value="">All shops</option>
          {shops.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shop</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [0, 1].map((i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={6}>
                      <div className="skeleton-line" style={{ width: "100%" }} />
                    </td>
                  </tr>
                ))
              : reviews.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDateTime(r.created_at)}</td>
                    <td>{r.shop_name}</td>
                    <td>{r.customer_name}</td>
                    <td>
                      <StarRating value={r.rating} />
                    </td>
                    <td className="review-comment-cell">{r.comment || "—"}</td>
                    <td>
                      <button
                        className="btn btn-icon icon-btn-danger"
                        onClick={() => handleDelete(r)}
                        aria-label="Remove review"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && reviews.length === 0 && (
          <div className="table-empty text-subhead">No reviews yet</div>
        )}
      </div>
    </>
  );
}
