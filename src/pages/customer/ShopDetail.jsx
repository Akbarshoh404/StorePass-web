import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import CustomerNav from "../../components/CustomerNav";
import ScanSheet from "../../components/ScanSheet";
import { StarRating } from "../../components/StarRating";
import { ScanIcon, WalletIcon, TagIcon, EmptyBoxIcon } from "../../components/Icons";
import { formatMoney, formatDateTime } from "../../utils/format";

export default function ShopDetail() {
  const toast = useToast();
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanOpen, setScanOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [shopData, reviewData] = await Promise.all([api.shopDetail(id), api.shopReviews(id)]);
      setShop(shopData);
      setReviews(reviewData);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load this shop");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleClaimed() {
    await load();
  }

  return (
    <div className="page">
      <CustomerNav active="directory" />
      <div className="page-content narrow">
        <Link to="/shops" className="btn btn-ghost" style={{ marginBottom: 16, paddingLeft: 0 }}>
          ← Back to shops
        </Link>

        {loading || !shop ? (
          <div className="shop-hero">
            <div className="skeleton-line" style={{ width: "30%" }} />
            <div className="skeleton-line" style={{ width: "60%", marginTop: 12 }} />
          </div>
        ) : (
          <>
            <div className="shop-hero fade-up">
              <div className="shop-hero-top">
                <div>
                  <span className="category-pill">{shop.category}</span>
                  <h1 className="text-title1" style={{ marginTop: 8 }}>
                    {shop.name}
                  </h1>
                  {shop.average_rating != null ? (
                    <span className="rating-inline" style={{ marginTop: 6 }}>
                      <StarRating value={shop.average_rating} size="lg" />
                      {shop.average_rating.toFixed(1)} · {shop.review_count} review
                      {shop.review_count === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <p className="text-footnote text-tertiary" style={{ marginTop: 6 }}>
                      No reviews yet
                    </p>
                  )}
                </div>
                <span className="text-footnote text-secondary">
                  Earn {(shop.cashback_rate * 100).toFixed(0)}% cashback here
                </span>
              </div>
              <p className="shop-desc">{shop.description || "No description yet."}</p>

              <div className="shop-hero-actions">
                <div className="wallet-mini">
                  <span className="icon">
                    <WalletIcon />
                  </span>
                  <div>
                    <div className="amount">{formatMoney(shop.wallet_balance || 0)}</div>
                    <div className="label">Your balance here</div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: "auto", marginLeft: "auto" }} onClick={() => setScanOpen(true)}>
                  <ScanIcon width={18} height={18} /> Scan to earn cashback
                </button>
              </div>
            </div>

            <div className="section-heading">
              <h2 className="text-title3">Your visits</h2>
            </div>
            <VisitList items={shop.my_transactions || []} />

            <div className="section-heading" style={{ marginTop: 32 }}>
              <h2 className="text-title3">Reviews</h2>
            </div>
            <ReviewList items={reviews} />
          </>
        )}
      </div>

      {scanOpen && <ScanSheet onClose={() => setScanOpen(false)} onClaimed={handleClaimed} />}
    </div>
  );
}

function VisitList({ items }) {
  if (items.length === 0) {
    return (
      <div className="list-card">
        <div className="empty-state">
          <EmptyBoxIcon />
          <p className="text-subhead">No visits yet — scan a QR code at checkout</p>
        </div>
      </div>
    );
  }
  return (
    <div className="list-card" style={{ marginBottom: 32 }}>
      {items.map((t) => (
        <div className="list-row" key={t.id}>
          <span className="icon">
            <TagIcon />
          </span>
          <div className="main">
            <div className="title">{formatMoney(t.amount)} purchase</div>
            <div className="subtitle">{formatDateTime(t.claimed_at)}</div>
          </div>
          <div className="value">+{formatMoney(t.cashback_amount)}</div>
        </div>
      ))}
    </div>
  );
}

function ReviewList({ items }) {
  if (items.length === 0) {
    return (
      <div className="list-card">
        <div className="empty-state">
          <EmptyBoxIcon />
          <p className="text-subhead">No reviews yet — be the first to visit and review</p>
        </div>
      </div>
    );
  }
  return (
    <div className="list-card">
      {items.map((r) => (
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
  );
}
