export default function Logo({ size = "md" }) {
  const iconSize = size === "lg" ? 42 : 34;
  const fontSize = size === "lg" ? 22 : 19;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{
        width: iconSize, height: iconSize, borderRadius: 11,
        background: "linear-gradient(135deg, #f5a623, #e0880a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 12px rgba(245,166,35,0.35)",
      }}>
        <svg width={iconSize * 0.56} height={iconSize * 0.56} viewBox="0 0 22 22" fill="none">
          <path d="M11 2L4 8v12h4v-7h6v7h4V8L11 2z" fill="#000" opacity="0.9"/>
          <path d="M8 13h6" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{
        fontSize, fontWeight: 900, letterSpacing: "-0.8px",
        fontFamily: "'Urbanist', sans-serif",
      }}>
        Nex<span style={{ color: "var(--gold)" }}>Trade</span>
      </span>
    </div>
  );
}