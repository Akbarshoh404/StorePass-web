import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import CustomerNav from "../../components/CustomerNav";
import { StarRating } from "../../components/StarRating";
import { SearchIcon, EmptyBoxIcon, WalletIcon } from "../../components/Icons";
import { formatMoney } from "../../utils/format";

export default function ShopDirectory() {
  const toast = useToast();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .listShops()
      .then(setShops)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Could not load shops"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [shops, query]);

  return (
    <div className="page">
      <CustomerNav active="directory" />
      <div className="page-content">
        <div className="page-title-row">
          <div>
            <p className="text-subhead text-secondary">Discover</p>
            <h1 className="text-title1">Shops on StorePass</h1>
          </div>
        </div>

        <div className="search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by shop or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="shop-grid">
            {[0, 1, 2].map((i) => (
              <div className="shop-card" key={i}>
                <div className="skeleton-line" style={{ width: "40%" }} />
                <div className="skeleton-line" style={{ width: "80%", marginTop: 10 }} />
                <div className="skeleton-line" style={{ width: "60%" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="list-card">
            <div className="empty-state">
              <EmptyBoxIcon />
              <p className="text-subhead">
                {shops.length === 0 ? "No shops on the platform yet" : "No shops match your search"}
              </p>
            </div>
          </div>
        ) : (
          <div className="shop-grid">
            {filtered.map((shop, i) => (
              <Link
                to={`/shops/${shop.id}`}
                className="shop-card fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 0.03}s` }}
                key={shop.id}
              >
                <span className="category-pill">{shop.category}</span>
                <span className="shop-name">{shop.name}</span>
                <p className="shop-desc">{shop.description || "No description yet."}</p>
                <div className="shop-meta">
                  {shop.average_rating != null ? (
                    <span className="rating-inline">
                      <StarRating value={shop.average_rating} />
                      {shop.average_rating.toFixed(1)} ({shop.review_count})
                    </span>
                  ) : (
                    <span className="text-caption text-tertiary">No reviews yet</span>
                  )}
                  {shop.wallet_balance > 0 && (
                    <span className="wallet-badge">
                      <WalletIcon width={12} height={12} /> {formatMoney(shop.wallet_balance)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
