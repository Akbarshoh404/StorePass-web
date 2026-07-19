# StorePass — Frontend

React client for **StorePass**, a multi-shop cashback and loyalty platform.
Talks to the [backend](../backend) JSON API over cookie-based sessions
(`credentials: 'include'`) — there's no JWT or token to manage on the client.

## Tech stack

- **React 19** + **Vite**
- **react-router-dom** for routing
- **html5-qrcode** for in-browser camera QR scanning
- **Firebase Auth** for "Sign in with Google" (`src/firebase.js`)
- Plain CSS with custom properties — no UI framework

## Setup

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` if the backend isn't running at the default URL:

```
VITE_API_URL=http://localhost:8000
```

## Run

```bash
npm run dev
```

Opens on `http://localhost:5173`. Make sure the [backend](../backend) is
running first (`uvicorn main:app --reload` from `backend/`), and that its
`FRONTEND_ORIGINS` env var includes `http://localhost:5173` (that's the
default, so no change needed unless you use a different port).

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Pages

| Route              | Who          | What                                                                     |
| ------------------- | ------------- | --------------------------------------------------------------------------- |
| `/`                 | logged out    | Marketing landing page — hero, how-it-works, features, CTA.               |
| `/login`            | anyone        | Sign in — checks admin/customer/shop accounts uniformly, plus "Continue with Google". |
| `/register`         | anyone        | Create a **customer** account (shops are added by the admin, not self-registered). |
| `/forgot-password`  | anyone        | Request a reset code (printed to the backend console — no email provider is set up). |
| `/reset-password`   | anyone        | Enter the code + set a new password.                                      |
| `/profile`          | any signed-in | Edit display name/password, sign out — same for all three roles.          |
| `/shops`            | customer      | Directory of active shops — search, category, rating, your wallet balance per shop. |
| `/shops/:id`        | customer      | Shop detail — scan to earn, your wallet + visit history there, all reviews. |
| `/wallets`          | customer      | All of your non-zero wallets across shops, at a glance.                    |
| `/shop`             | shop          | Generate a purchase QR, see your transactions, see your reviews + average rating. |
| `/admin`            | admin         | Shops (add/edit/deactivate + stats), Customers, Transactions, Reviews (moderate). |

### Sign in with Google

`src/firebase.js` initializes Firebase with the `storepass-e4a43` project's
web config and exports `auth` + a `GoogleAuthProvider`. `Login.jsx` calls
`signInWithPopup(auth, googleProvider)`, takes the resulting
`result.user.getIdToken()`, and POSTs it to `api.loginWithGoogle` —
the backend verifies it and logs in the same way password login does. One
button covers both sign-in and sign-up (the backend creates the account on
first use).

**Google must be enabled as a sign-in provider** in the Firebase console
(Authentication → Sign-in method → Google) before this works — a fresh
Firebase project has no providers enabled by default. If it's not, the
button fails with `auth/operation-not-allowed`, which now surfaces as a
specific, actionable error message instead of a generic one. Also check
Authentication → Settings → Authorized domains if you're testing from
somewhere other than `localhost`.

`/` shows the landing page when logged out, otherwise redirects to the right
place for the session's role (`utils/roles.js#roleHome`). `ProtectedRoute`
(`src/components/ProtectedRoute.jsx`) guards every role-specific route,
bouncing unauthenticated visitors to `/login` and wrong-role visitors to
their own home.

### The required review prompt

Per the product spec, submitting a review is required to close the prompt
after a successful scan — `ScanSheet` has no close button while showing the
rating step (`src/components/ScanSheet.jsx`), only after the review is
actually submitted. Star tap is required; the comment is optional.

### Stale-session handling

The session cookie is shared per browser, not per tab. Testing multiple
roles from one browser — likely, with three roles to try — means signing
into a second account silently swaps the identity behind any tab still open
on the first. `AuthContext` re-checks identity on window focus/visibility,
and `ScanSheet` re-checks again right before scanning (covering two tabs
open side by side, where a focus event never fires). Either path shows a
plain toast explaining what happened and routes to the correct dashboard,
instead of a bare "Forbidden for this role" 403.

## Design

Per the product's own design direction (and the "avoid generic AI purple/
pink gradient, one deliberate accent color" guidance pulled from the
referenced UI/UX design principles — there's no actual "ui-ux-pro-max"
skill installed in this environment, so this was applied by hand): **one**
accent color (indigo, `--color-accent` in `src/styles/tokens.css`) used
consistently everywhere — no secondary brand gradient scattered across
buttons, cards, and icons. Generous whitespace, soft rounded cards
(`--radius-lg`/`--radius-xl`), restrained shadows, and a single consistent
nav/tab pattern shared across the customer, shop, and admin surfaces so it
reads as one product rather than three apps stitched together.

Theme defaults to the OS preference (`prefers-color-scheme`) but is
overridable — a sun/moon toggle (`ThemeContext` + `ThemeToggle`) is
available wherever the nav appears, persisted to `localStorage` and applied
via `[data-theme]` on `<html>` (set inline in `index.html` before React
mounts, so there's no flash of the wrong theme).

Camera-based QR scanning requires `localhost` or HTTPS — testing on a real
phone over your LAN IP won't get camera access unless you tunnel it (e.g.
ngrok) or deploy behind HTTPS. The scan sheet always offers a manual
token-entry fallback for this reason.

Action feedback (claim results, profile saves, sign-in, session issues,
review submission) goes through a toast system (`ToastContext` +
`.toast-stack` in `base.css`) — stacked, animated, auto-dismissing
notifications, top-right on desktop and bottom on phone widths.

## Project layout

```
frontend/src/
  firebase.js                    Firebase app init + GoogleAuthProvider (Google sign-in)
  api/client.js                 fetch wrapper + full endpoint surface, incl. api.admin.*
  context/
    AuthContext.jsx               current identity, login/register/loginWithGoogle/updateProfile/logout
    ThemeContext.jsx               light/dark theme, persisted to localStorage
    ToastContext.jsx               stacked, animated notifications
  components/
    ProtectedRoute.jsx            role-gated route wrapper (role prop optional — any signed-in user)
    CustomerNav.jsx                 shared nav for the three customer pages
    ScanSheet.jsx                   camera scan + manual entry + claim + required review step
    StarRating.jsx                  StarRating (display) and StarInput (tap-to-rate)
    ThemeToggle.jsx                 sun/moon theme switch
    SplashScreen.jsx                 branded loading state (no blank flash)
    Icons.jsx                      inline SVG icon set, incl. GoogleIcon
  pages/
    Landing.jsx                     marketing landing page
    Login.jsx / Register.jsx       auth screens (Login has the Google button)
    ForgotPassword.jsx / ResetPassword.jsx   password reset flow
    Profile.jsx                     /profile — name/password editing, any role
    customer/
      ShopDirectory.jsx              /shops — search + shop cards
      ShopDetail.jsx                 /shops/:id — scan, wallet, visits, reviews
      MyWallets.jsx                   /wallets — all shops at a glance
    ShopDashboard.jsx                /shop — QR creation, transactions, reviews + rating
    AdminDashboard.jsx               /admin — Shops/Customers/Transactions/Reviews tabs
  styles/
    tokens.css                     design tokens — one accent color, type scale, spacing
    base.css                       reset, buttons, inputs, cards, tables, toasts, skeletons, stars
    auth.css                       login/register screen
    app-shell.css                   shared nav/tabs chrome (customer, shop, admin)
    directory.css                   shop directory/detail/wallets, scan + review modal
    shop-dashboard.css               QR display, rating summary card
    admin.css                       add-shop form, filters, toggle switch, stat tiles
    landing.css                     landing page hero/steps/features/CTA
  utils/
    format.js                      money/date formatting helpers
    roles.js                        role → home route mapping
```
