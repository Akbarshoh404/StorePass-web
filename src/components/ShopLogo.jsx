import { useState } from "react";
import { StoreIcon } from "./Icons";

// Falls back to a storefront icon when logoUrl is missing or fails to load
// (e.g. a broken/removed URL) instead of leaving a broken-image icon.
export default function ShopLogo({ logoUrl, size = 44, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`shop-logo ${className}`}
      style={{ width: size, height: size, flex: `0 0 ${size}px` }}
    >
      {logoUrl && !failed ? (
        <img src={logoUrl} alt="" onError={() => setFailed(true)} />
      ) : (
        <StoreIcon width={size * 0.5} height={size * 0.5} />
      )}
    </span>
  );
}
