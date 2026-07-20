import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { StarRating } from "../components/StarRating";
import { useScrollReveal } from "../utils/useScrollReveal";
import {
  ScanIcon,
  WalletIcon,
  StarIcon,
  LightningIcon,
  ShieldIcon,
  StoreIcon,
  ArrowRightIcon,
  GiftIcon,
  TagIcon,
  DownloadIcon,
} from "../components/Icons";

const MOBILE_APP_URL = "https://github.com/Akbarshoh404/StorePass-mobile/releases";

const STEPS = [
  {
    icon: StoreIcon,
    title: "Browse shops",
    body: "Explore independent shops on StorePass — sneakers, clothing, gear, and more, each with real customer reviews.",
  },
  {
    icon: ScanIcon,
    title: "Scan at checkout",
    body: "Your cashier hands you a QR code. Scan it in the app and cashback lands instantly in that shop's wallet.",
  },
  {
    icon: StarIcon,
    title: "Rate your visit",
    body: "A quick one-tap rating after every purchase — it takes five seconds and helps other shoppers decide.",
  },
];

const FEATURES = [
  {
    icon: WalletIcon,
    title: "A wallet per shop",
    body: "Cashback stays tied to the shop that earned it — clear, separate balances, not one blended total.",
  },
  {
    icon: LightningIcon,
    title: "Instant, automatic",
    body: "No punch cards, no waiting for a statement. Cashback is credited the moment you scan.",
  },
  {
    icon: ShieldIcon,
    title: "Real reviews only",
    body: "Every review is tied to an actual claimed purchase — no drive-by ratings.",
  },
];

const CATEGORIES = [
  "Sneakers",
  "Clothing",
  "Books",
  "Coffee",
  "Home goods",
  "Electronics",
  "Gifts",
  "Sports gear",
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <span className="brand-mark">S</span>
          StorePass
        </div>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost">
            Sign in
          </Link>
          <Link to="/register" className="btn btn-primary landing-cta-btn">
            Get started
          </Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy fade-up">
            <span className="eyebrow">
              <StoreIcon width={15} height={15} /> Multi-shop cashback
            </span>
            <h1>
              Shop local,
              <br />
              <em>earn</em> as you go.
            </h1>
            <p className="hero-sub">
              StorePass is a directory of independent shops that pay you cashback
              automatically. Scan a code at checkout, watch it land in that shop's
              wallet, and help other shoppers with a quick review.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary hero-cta primary-glow">
                Create your account <ArrowRightIcon width={18} height={18} />
              </Link>
              <Link to="/login" className="btn btn-fill hero-cta">
                Sign in
              </Link>
            </div>
            <p className="hero-note text-footnote text-secondary">
              Free for customers. Shops are onboarded by the StorePass team.
            </p>
          </div>

          <div className="hero-visual fade-up delay-1">
            <div className="demo-ring" aria-hidden="true" />
            <div className="demo-shop-card">
              <span className="category-pill">Sneakers</span>
              <span className="shop-name">Northside Sneakers</span>
              <span className="rating-inline">
                <StarRating value={4.5} />
                4.5 · 128 reviews
              </span>
              <div className="wallet-line">
                <span className="text-footnote text-secondary">Your balance</span>
                <span className="amount">$12.80</span>
              </div>
            </div>
            <div className="demo-badge">
              <span className="dot">
                <TagIcon />
              </span>
              2% cashback
            </div>
            <div className="demo-toast">
              <span className="demo-toast-icon">
                <GiftIcon width={16} height={16} />
              </span>
              <div>
                <div className="demo-toast-title">Cashback earned</div>
                <div className="demo-toast-sub">+$4.20 just now</div>
              </div>
            </div>
          </div>
        </section>

        <div className="marquee-section" aria-hidden="true">
          <div className="marquee-track">
            {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
              <span className="marquee-chip" key={i}>
                <StoreIcon /> {c}
              </span>
            ))}
          </div>
        </div>

        <section className="steps-section">
          <span className="section-eyebrow">Process</span>
          <h2 className="section-title">How it works</h2>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <StepCard key={s.title} step={s} index={i} />
            ))}
          </div>
        </section>

        <section className="features-section">
          <span className="section-eyebrow">Why StorePass</span>
          <h2 className="section-title">Why shoppers like it</h2>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </section>

        <DownloadBand />
        <CtaBand />
      </main>

      <footer className="landing-footer">
        <div className="brand">
          <span className="brand-mark small">S</span>
          StorePass
        </div>
        <nav className="footer-links">
          <Link to="/login">Sign in</Link>
          <Link to="/register">Sign up</Link>
        </nav>
        <p className="text-footnote text-secondary">
          A multi-shop cashback demo platform. Not affiliated with any real payment network.
        </p>
      </footer>
    </div>
  );
}

function StepCard({ step: s, index }) {
  const ref = useScrollReveal();
  return (
    <div className="step-card reveal" ref={ref} style={{ transitionDelay: `${index * 0.08}s` }}>
      <span className="step-number">{index + 1}</span>
      <span className="step-icon">
        <s.icon />
      </span>
      <h3>{s.title}</h3>
      <p>{s.body}</p>
    </div>
  );
}

function FeatureCard({ feature: f, index }) {
  const ref = useScrollReveal();
  return (
    <div className="feature-card reveal" ref={ref} style={{ transitionDelay: `${index * 0.08}s` }}>
      <span className="feature-icon">
        <f.icon />
      </span>
      <h3>{f.title}</h3>
      <p>{f.body}</p>
    </div>
  );
}

function DownloadBand() {
  const ref = useScrollReveal();
  return (
    <section className="download-band reveal-scale" ref={ref}>
      <div className="download-band-inner">
        <div className="download-copy">
          <span className="eyebrow eyebrow-light">
            <ScanIcon width={15} height={15} /> Free · Android
          </span>
          <h2>
            Get StorePass
            <br />
            on your phone.
          </h2>
          <p>
            Scan QR codes at checkout, watch cashback land instantly, and
            check every shop's wallet on the go — the full StorePass
            experience, built for Android.
          </p>
          <a href={MOBILE_APP_URL} target="_blank" rel="noreferrer" className="btn download-band-cta">
            <DownloadIcon width={20} height={20} /> Download the app
          </a>
        </div>
        <div className="download-visual" aria-hidden="true">
          <div className="download-phone">
            <div className="download-phone-notch" />
            <div className="download-phone-screen">
              <span className="download-phone-mark">S</span>
              <div className="download-phone-line" style={{ width: "70%" }} />
              <div className="download-phone-line" style={{ width: "45%" }} />
              <div className="download-phone-card" />
            </div>
          </div>
          <div className="download-orb download-orb-1" />
          <div className="download-orb download-orb-2" />
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  const ref = useScrollReveal();
  return (
    <section className="cta-band reveal-scale" ref={ref}>
      <h2>Find your next favorite shop</h2>
      <p>Sign up in under a minute — it's just a name, a phone or email, and a password.</p>
      <Link to="/register" className="btn btn-primary hero-cta">
        Get started <ArrowRightIcon width={18} height={18} />
      </Link>
    </section>
  );
}
