
// ─────────────────────────────────────────────────────────
//  SVG Icons for each nav item
// ─────────────────────────────────────────────────────────
function HomeIcon({ filled }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function TradeIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function AssetsIcon({ filled }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function ProfileIcon({ filled }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
//  Nav items config
// ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",    label: "Home" },
  { id: "market",  label: "Market" },
  { id: "trade",   label: "Trade",  special: true },
  { id: "assets",  label: "Assets" },
  { id: "profile", label: "Profile" },
];

function NavIcon({ id, active }) {
  switch (id) {
    case "home":    return <HomeIcon    filled={active} />;
    case "market":  return <MarketIcon />;
    case "trade":   return <TradeIcon />;
    case "assets":  return <AssetsIcon  filled={active} />;
    case "profile": return <ProfileIcon filled={active} />;
    default:        return null;
  }
}

// ─────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────
export default function BottomNav({ page, setPage }) {
  return (
    <nav className="nav">
      {NAV_ITEMS.map((item) => {
        const active = page === item.id;
        return (
          <button
            key={item.id}
            className={[
              "nav-btn",
              item.special ? "nav-trade-btn" : "",
              active ? "active" : "",
            ].join(" ")}
            onClick={() => setPage(item.id)}
            aria-label={item.label}
          >
            <NavIcon id={item.id} active={active} />
            <span className="nav-label">{item.label}</span>
            {active && !item.special && <span className="nav-dot" />}
          </button>
        );
      })}
    </nav>
  );
}
