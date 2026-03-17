// Real SVG coin icons for each cryptocurrency

const ICONS = {
  BTC: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F7931A"/>
      <path d="M22.3 14.2c.3-2-1.2-3.1-3.3-3.8l.7-2.8-1.7-.4-.7 2.7-.9-.2.7-2.7-1.7-.4-.7 2.8c-.2 0-1.3-.3-1.3-.3l-2.3-.6-.4 1.8s1.3.3 1.2.3c.7.2.8.7.8 1l-.8 3.3c0 0 .2 0 .2.1-.1 0-.2-.1-.2-.1l-1.2 4.7c-.1.2-.3.6-.9.4 0 .1-1.2-.3-1.2-.3l-.8 2 2.2.5 1.2.3-.7 2.8 1.7.4.7-2.8.9.2-.7 2.8 1.7.4.7-2.8c2.9.5 5-.2 5.9-2.3.7-1.7 0-2.7-1.3-3.4.9-.2 1.6-.8 1.8-2zm-3.2 4.5c-.5 2-3.9 1-5 .7l.9-3.5c1.1.3 4.6.8 4.1 2.8zm.5-4.6c-.5 1.8-3.3 1-4.3.7l.8-3.1c1 .2 4 .7 3.5 2.4z" fill="white"/>
    </svg>
  ),
  ETH: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path d="M16 6v7.4l6.3 2.8L16 6z" fill="white" fillOpacity="0.6"/>
      <path d="M16 6L9.7 16.2l6.3-2.8V6z" fill="white"/>
      <path d="M16 21.5v4.5l6.3-8.7L16 21.5z" fill="white" fillOpacity="0.6"/>
      <path d="M16 26v-4.5l-6.3-4.2L16 26z" fill="white"/>
      <path d="M16 20.3l6.3-3.7-6.3-2.9v6.6z" fill="white" fillOpacity="0.2"/>
      <path d="M9.7 16.6l6.3 3.7v-6.6l-6.3 2.9z" fill="white" fillOpacity="0.6"/>
    </svg>
  ),
  BNB: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
      <path d="M12.1 14.4L16 10.5l3.9 3.9 2.3-2.3L16 5.9 9.8 12.1l2.3 2.3zM6 16l2.3-2.3 2.3 2.3-2.3 2.3L6 16zm6.1 1.6L16 21.5l3.9-3.9 2.3 2.3-6.2 6.2-6.2-6.2 2.3-2.3zm9.3-1.6 2.3-2.3 2.3 2.3-2.3 2.3-2.3-2.3zm-5.5 0-2.2-2.2h-1.5l3.7 3.7 3.7-3.7H18l-2.1 2.2z" fill="white"/>
    </svg>
  ),
  SOL: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#9945FF"/>
      <path d="M9 20.5h10.8c.2 0 .3.1.4.2l1.8 2c.1.1 0 .3-.2.3H10.6c-.2 0-.3-.1-.4-.2l-1.8-2c-.1-.1 0-.3.2-.3zm0-5.5h10.8c.2 0 .3.1.4.2l1.8 2c.1.1 0 .3-.2.3H10.6c-.2 0-.3-.1-.4-.2l-1.8-2c-.1-.1 0-.3.2-.3zm13-3.5-1.8 2c-.1.1-.2.2-.4.2H9c-.2 0-.3-.2-.2-.3l1.8-2c.1-.1.2-.2.4-.2H22c.2 0 .3.2.2.3z" fill="white"/>
    </svg>
  ),
  XRP: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#00AAE4"/>
      <path d="M22.7 8h2.5l-5.8 5.8c-1.9 1.9-5 1.9-6.8 0L6.8 8H9.3l4.6 4.6c1.2 1.2 3.1 1.2 4.3 0L22.7 8zM9.3 24H6.8l5.8-5.8c1.9-1.9 5-1.9 6.8 0l5.8 5.8h-2.5l-4.6-4.6c-1.2-1.2-3.1-1.2-4.3 0L9.3 24z" fill="white"/>
    </svg>
  ),
  ADA: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#0033AD"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
      <circle cx="16" cy="8"  r="2" fill="white" opacity="0.8"/>
      <circle cx="16" cy="24" r="2" fill="white" opacity="0.8"/>
      <circle cx="8"  cy="16" r="2" fill="white" opacity="0.8"/>
      <circle cx="24" cy="16" r="2" fill="white" opacity="0.8"/>
      <circle cx="10.3" cy="10.3" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="21.7" cy="10.3" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="10.3" cy="21.7" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="21.7" cy="21.7" r="1.5" fill="white" opacity="0.5"/>
    </svg>
  ),
  DOGE: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#C2A633"/>
      <path d="M11 9h5.5c4.1 0 7 2.8 7 7s-2.9 7-7 7H11V9zm3 2.5v9h2.5c2.4 0 4-1.7 4-4.5s-1.6-4.5-4-4.5H14z" fill="white"/>
      <path d="M9 15h5v2H9z" fill="white"/>
    </svg>
  ),
  AVAX: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#E84142"/>
      <path d="M16 7l-8.5 15h5.1l3.4-6 3.4 6H24L16 7z" fill="white"/>
    </svg>
  ),
  DOT: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#E6007A"/>
      <circle cx="16" cy="9"  r="3.5" fill="white"/>
      <circle cx="16" cy="23" r="3.5" fill="white"/>
      <circle cx="9"  cy="14" r="3.5" fill="white" opacity="0.6"/>
      <circle cx="23" cy="14" r="3.5" fill="white" opacity="0.6"/>
      <circle cx="9"  cy="19" r="3.5" fill="white" opacity="0.4"/>
      <circle cx="23" cy="19" r="3.5" fill="white" opacity="0.4"/>
    </svg>
  ),
  MATIC: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#8247E5"/>
      <path d="M20.3 13.7c-.3-.2-.7-.2-1 0l-2.4 1.4-1.6.9-2.4 1.4c-.3.2-.7.2-1 0l-1.9-1.1c-.3-.2-.5-.5-.5-.9V13c0-.4.2-.7.5-.9l1.9-1.1c.3-.2.7-.2 1 0l1.9 1.1c.3.2.5.5.5.9v1.4l1.6-.9v-1.5c0-.4-.2-.7-.5-.9l-3.4-2c-.3-.2-.7-.2-1 0l-3.5 2c-.3.2-.5.5-.5.9v4c0 .4.2.7.5.9l3.5 2c.3.2.7.2 1 0l2.4-1.4 1.6-.9 2.4-1.4c.3-.2.7-.2 1 0l1.9 1.1c.3.2.5.5.5.9v2.4c0 .4-.2.7-.5.9l-1.9 1.1c-.3.2-.7.2-1 0l-1.9-1.1c-.3-.2-.5-.5-.5-.9v-1.4l-1.6.9v1.5c0 .4.2.7.5.9l3.5 2c.3.2.7.2 1 0l3.5-2c.3-.2.5-.5.5-.9V15c0-.4-.2-.7-.5-.9l-3.6-2.4z" fill="white"/>
    </svg>
  ),
  USDT: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#26A17B"/>
      <path d="M17.8 17.4v-.1c3.5-.2 6.1-.9 6.1-1.8s-2.6-1.6-6.1-1.8v-1.2h4.9V10H9.3v2.5h4.9v1.2c-3.5.2-6.1.9-6.1 1.8s2.6 1.6 6.1 1.8v4.3h3.6v-4.2zm0-1c-3.3.2-5.8.8-5.8 1.5s2.5 1.3 5.8 1.5 5.8-.8 5.8-1.5-2.5-1.3-5.8-1.5z" fill="white"/>
    </svg>
  ),
};

// Fallback for unknown coins
function FallbackIcon({ sym, size }) {
  const COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f97316','#14b8a6'];
  const color = COLORS[sym?.charCodeAt(0) % COLORS.length] || '#3b82f6';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.35,
      fontFamily: 'var(--fm)', flexShrink: 0,
    }}>
      {sym?.slice(0, 2) ?? '?'}
    </div>
  );
}

export default function CoinIcon({ sym, size = 36 }) {
  const Icon = ICONS[sym];
  if (Icon) {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', display: 'flex' }}>
        <Icon size={size} />
      </div>
    );
  }
  return <FallbackIcon sym={sym} size={size} />;
}