
/**
 * Reusable sticky header bar.
 *
 * Usage:
 *   <Header title="Markets" right={<SomeButton />} />
 *   <Header left={<Logo />} right={<Avatar />} />
 */
export default function Header({ title, left, right, children }) {
  return (
    <div className="hdr">
      {left  && left}
      {title && <span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span>}
      {children}
      {right && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>{right}</div>}
    </div>
  );
}
