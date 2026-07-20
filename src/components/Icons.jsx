const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  // Explicit intrinsic size — without this, an <svg> with no width/height
  // has no natural size (unlike <img>) and collapses to 0×0 inside any
  // flexbox parent (every .btn is inline-flex), instead of rendering
  // invisibly-oversized like it would in normal block flow. Any call site
  // can still override via props, since props spread after this.
  width: 20,
  height: 20,
};

export function StarIcon({ filled, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.4l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
    </svg>
  );
}

export function HomeIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function HistoryIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function PersonIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function ScanIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8" />
      <path d="M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8" />
      <path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16" />
      <path d="M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <path d="M4 12h16" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

export function TagIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3h6a2 2 0 0 1 2 2v6L11 20 3 12z" />
      <circle cx="15.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EmptyBoxIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
      <path d="M3 8.5V16l9 4.5 9-4.5V8.5" />
      <path d="M12 13v7.5" />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M9 5.5 15.5 12 9 18.5" />
    </svg>
  );
}

export function LogoutIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h12" />
    </svg>
  );
}

export function XIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function WalletIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M15 12h5v3.5h-5a1.75 1.75 0 0 1 0-3.5Z" />
    </svg>
  );
}

export function TrendUpIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3.5 17 9.5 11l3.5 3.5L20.5 7" />
      <path d="M14.5 7h6v6" />
    </svg>
  );
}

export function BagIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M5.5 8h13l-1 12h-11z" />
      <path d="M8.5 10.5V6.5a3.5 3.5 0 0 1 7 0v4" />
    </svg>
  );
}

export function SunIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function InfoIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.25" fill="currentColor" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function WarningIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3.5 21.5 20h-19Z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.3" r="0.25" fill="currentColor" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function LightningIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M13 3 5 13.5h5.5L11 21l8-11h-5.5Z" />
    </svg>
  );
}

export function ShieldIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3.5 19 6.5v5.5c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6.5Z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function GiftIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4.5 9.5h15v3h-15z" />
      <path d="M5.5 12.5h13V20a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Z" />
      <path d="M12 9.5V21" />
      <path d="M12 9.5C10 9.5 8 8.5 8 6.8 8 5.3 9 4.5 10 4.5c1.5 0 2 2 2 5" />
      <path d="M12 9.5c2 0 4-1 4-2.7 0-1.5-1-2.3-2-2.3-1.5 0-2 2-2 5" />
    </svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 12h15.5" />
      <path d="M13.5 6 19.5 12l-6 6" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M5 7h14" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function PowerIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3.5v8" />
      <path d="M7 6a7.2 7.2 0 1 0 10 0" />
    </svg>
  );
}

export function UsersIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M15.5 5.5a3 3 0 0 1 0 5.8" />
      <path d="M17 13.5a5.2 5.2 0 0 1 3.5 5" />
    </svg>
  );
}

export function ReceiptIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5Z" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </svg>
  );
}

export function EditIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17Z" />
      <path d="M13.5 8 16 10.5" />
    </svg>
  );
}

export function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.08.72-2.46 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.26a12 12 0 0 0 0 10.8l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.6l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function StoreIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M4 9.5 5 4h14l1 5.5" />
      <path d="M4 9.5a2.25 2.25 0 0 0 4.5 0 2.25 2.25 0 0 0 4.5 0 2.25 2.25 0 0 0 4.5 0 2.25 2.25 0 0 0 4.5 0" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M10 20v-5.5h4V20" />
    </svg>
  );
}

export function PinIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function PhoneIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M6.5 3h3l1.5 4.5-2.5 1.5a12 12 0 0 0 6.5 6.5l1.5-2.5L21 14.5v3a2 2 0 0 1-2.1 2c-6.6-.5-12-5.9-12.5-12.5A2 2 0 0 1 6.5 3Z" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
