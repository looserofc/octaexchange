import { useStore } from "@/lib/store";
import { COINS, fmtPrice } from "@/lib/data";
import TickerTape from "@/components/ui/TickerTape";
import MiniChart  from "@/components/ui/MiniChart";
import CoinIcon   from "@/components/ui/CoinIcon";
import Logo       from "@/components/ui/Logo";

export default function HomePage({ setPage }) {
  const { user, prices, charts, banners, notifs, setProfileTab } = useStore();
  const unread   = notifs.filter((n) => !n.read).length;
  const topCoins = Object.values(COINS).slice(0, 6);

  return (
    <div>
      {/* Header */}
      <div className="hdr">
        <Logo />
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{ position: "relative", color: "var(--c2)", display: "flex" }} onClick={() => { setProfileTab("notifs"); setPage("profile"); }}>
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {unread > 0 && <span className="ndot" />}
          </button>
          <button onClick={() => setPage("profile")} style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg,var(--gold),#e0880a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", fontWeight: 900, fontSize: 13, letterSpacing: "-0.5px",
          }}>
            {user.avatar}
          </button>
        </div>
      </div>

      <TickerTape />

      {/* Banners */}
      {banners.filter((b) => b.active).length > 0 && (
        <div style={{ padding: "14px 16px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {banners.filter((b) => b.active).map((b, i) => (
              <div key={b.id} className={`au d${i + 1}`} style={{
                background: `linear-gradient(135deg,${b.color}22,${b.color}08)`,
                border: `1px solid ${b.color}33`,
                borderRadius: 14, padding: "13px 16px",
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "var(--c2)", lineHeight: 1.5 }}>{b.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balance card */}
      <div style={{ padding: "14px 16px 0" }}>
        <div className="glow-card au" style={{ padding: 24 }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--c2)", fontFamily: "var(--fm)", letterSpacing: "1.5px", marginBottom: 8 }}>
              PORTFOLIO VALUE
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "var(--fm)", letterSpacing: "-1.5px", marginBottom: 2, lineHeight: 1 }}>
              ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--fm)", marginBottom: 20 }}>
              ▲ +${user.totalProfit.toFixed(2)} all time profit
            </div>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Tier",       val: user.tier.name,          color: user.tier.color },
                { label: "Per Signal", val: `+$${user.tier.profit}`, color: "var(--green)" },
                { label: "Trades",     val: user.totalTrades,        color: "var(--gold)" },
              ].map((item) => (
                <div key={item.label} style={{
                  background: "rgba(255,255,255,0.05)", borderRadius: 20,
                  padding: "6px 12px", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: 11, color: "var(--c3)" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: item.color, fontFamily: "var(--fm)" }}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-gold"    style={{ flex: 1, padding: "11px 0", fontSize: 13 }} onClick={() => setPage("assets")}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Deposit
              </button>
              <button className="btn btn-outline" style={{ flex: 1, padding: "11px 0", fontSize: 13 }} onClick={() => setPage("assets")}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
                Withdraw
              </button>
              <button className="btn btn-ghost"   style={{ flex: 1, padding: "11px 0", fontSize: 13 }} onClick={() => setPage("trade")}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Trade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trade CTA */}
      <div style={{ padding: "14px 16px 0" }}>
        <div
          onClick={() => setPage("trade")}
          style={{
            background: "linear-gradient(135deg,rgba(245,166,35,0.1),rgba(220,130,10,0.05))",
            border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: 18, padding: "16px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", transition: "background 0.2s",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3 }}>⚡ Enter Signal Code</div>
            <div style={{ fontSize: 12, color: "var(--c2)" }}>Paste your code to start trading</div>
          </div>
          <div style={{
            background: "linear-gradient(135deg,var(--gold),#e0880a)",
            borderRadius: 12, padding: "10px 18px",
            color: "#000", fontWeight: 800, fontSize: 13, flexShrink: 0,
          }}>
            Trade →
          </div>
        </div>
      </div>

      {/* Markets */}
      <div style={{ padding: "20px 16px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.3px" }}>Markets</span>
        <span style={{ fontSize: 12, color: "var(--gold)", cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("market")}>
          View All
        </span>
      </div>

      {/* Market rows — full-width, stacked, no overflow */}
      <div style={{ paddingBottom: 8 }}>
        {topCoins.map((coin, i) => {
          const price = prices[coin.sym] ?? coin.price;
          const up    = coin.change >= 0;
          return (
            <div
              key={coin.sym}
              onClick={() => setPage("market")}
              className={`au d${Math.min(i + 1, 6)}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid var(--b1)",
                cursor: "pointer",
                transition: "background 0.15s",
                /* KEY FIX: min-width 0 prevents flex children from overflowing */
                minWidth: 0,
                overflow: "hidden",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              {/* Icon — fixed size, no shrink */}
              <div style={{ flexShrink: 0 }}>
                <CoinIcon sym={coin.sym} size={40} />
              </div>

              {/* Name — takes up remaining space, truncates */}
              <div style={{ flex: 1, marginLeft: 12, minWidth: 0, overflow: "hidden" }}>
                <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {coin.sym}<span style={{ color: "var(--c3)", fontWeight: 500 }}>/USDT</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--c3)", marginTop: 2, whiteSpace: "nowrap" }}>{coin.name}</div>
              </div>

              {/* Chart — fixed width, no shrink */}
              <div style={{ flexShrink: 0, marginLeft: 8 }}>
                <MiniChart data={charts[coin.sym] ?? []} up={up} w={68} h={32} id={coin.sym} />
              </div>

              {/* Price — fixed min-width, right-aligned */}
              <div style={{ textAlign: "right", marginLeft: 10, flexShrink: 0, minWidth: 82 }}>
                <div style={{ fontFamily: "var(--fm)", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                  ${fmtPrice(coin.sym, price)}
                </div>
                <span className={`badge ${up ? "badge-up" : "badge-dn"}`} style={{ marginTop: 4, fontSize: 10 }}>
                  {up ? "+" : ""}{coin.change.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}