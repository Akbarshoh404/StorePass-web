// Trailing slash stripped defensively — a request URL is built as
// `${API_URL}${path}` where path already starts with "/", so a trailing
// slash on the env var produces "https://host//auth/login". Vercel's edge
// normalizes that double slash with a 308 redirect that never reaches this
// app (so it has no CORS headers), which the browser then blocks — looks
// exactly like "API unreachable" for what's really just a URL formatting slip.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  const opts = { method, credentials: "include" };

  if (body) {
    const form = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, value);
    });
    opts.body = form;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, opts);
  } catch {
    // fetch throws a raw TypeError for network failures / CORS blocks /
    // "server isn't there at all" — normalize it so callers only ever see
    // ApiError, and the message actually points at the likely cause.
    throw new ApiError(
      `Could not reach the StorePass API at ${API_URL}. Is the backend running there?`,
      0
    );
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(data?.detail || "Something went wrong", res.status);
  }
  if (!isJson) {
    // Every endpoint this client calls returns JSON on success (the one
    // exception, the QR image, is fetched via a plain <img src>, not this
    // function). A 200 with a non-JSON body means something other than the
    // StorePass API answered — silently returning null here would let a
    // caller's array (`.map`/`.filter`) crash the whole render.
    throw new ApiError(
      `Unexpected response from ${API_URL}${path} — check VITE_API_URL points at the StorePass backend.`,
      res.status
    );
  }
  return data;
}

function withShopFilter(path, shopId) {
  return shopId ? `${path}?shop_id=${shopId}` : path;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  forgotPassword: (contact) => request("/auth/forgot-password", { method: "POST", body: { contact } }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),
  loginWithGoogle: (idToken) => request("/auth/google", { method: "POST", body: { id_token: idToken } }),
  me: () => request("/users/me"),
  updateMe: (payload) => request("/users/me", { method: "PUT", body: payload }),

  // Shop directory (customer-facing)
  listShops: () => request("/shops"),
  shopDetail: (id) => request(`/shops/${id}`),
  shopReviews: (id) => request(`/shops/${id}/reviews`),

  // Shop self-service
  updateMyShop: (payload) => request("/shops/me", { method: "PATCH", body: payload }),

  // Transactions
  createTransaction: (amount) => request("/transactions/create", { method: "POST", body: { amount } }),
  createRedemption: (amount) => request("/transactions/redeem", { method: "POST", body: { amount } }),
  claimTransaction: (qrToken) => request("/transactions/claim", { method: "POST", body: { qr_token: qrToken } }),
  voidTransaction: (id) => request(`/transactions/${id}/void`, { method: "POST" }),
  myTransactions: () => request("/transactions/mine"),
  shopTransactions: () => request("/transactions/shop-mine"),
  shopAnalytics: () => request("/transactions/shop-mine/analytics"),
  qrImageUrl: (token) => `${API_URL}/transactions/qr/${token}`,
  exportShopTransactionsUrl: () => `${API_URL}/transactions/shop-mine/export`,

  // Reviews
  createReview: (payload) => request("/reviews", { method: "POST", body: payload }),
  replyToReview: (id, reply) => request(`/reviews/${id}/reply`, { method: "POST", body: { reply } }),

  // Wallets
  myWallets: () => request("/wallets/mine"),
  walletEntries: (shopId) => request(`/wallets/${shopId}/entries`),

  // Admin
  admin: {
    createShop: (payload) => request("/admin/shops", { method: "POST", body: payload }),
    updateShop: (id, payload) => request(`/admin/shops/${id}`, { method: "PATCH", body: payload }),
    listShops: () => request("/admin/shops"),
    listCustomers: () => request("/admin/customers"),
    updateCustomer: (id, payload) => request(`/admin/customers/${id}`, { method: "PATCH", body: payload }),
    suspendCustomer: (id) => request(`/admin/customers/${id}/suspend`, { method: "POST" }),
    reactivateCustomer: (id) => request(`/admin/customers/${id}/reactivate`, { method: "POST" }),
    adjustWallet: (payload) => request("/admin/wallets/adjust", { method: "POST", body: payload }),
    voidTransaction: (id) => request(`/admin/transactions/${id}/void`, { method: "POST" }),
    listTransactions: (shopId) => request(withShopFilter("/admin/transactions", shopId)),
    exportTransactionsUrl: (shopId) => `${API_URL}${withShopFilter("/admin/transactions/export", shopId)}`,
    listReviews: (shopId) => request(withShopFilter("/admin/reviews", shopId)),
    deleteReview: (id) => request(`/admin/reviews/${id}`, { method: "DELETE" }),
  },
};
