import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { COINS, fmtPrice } from "@/lib/data";
import MiniChart        from "@/components/ui/MiniChart";
import TradingViewChart from "@/components/ui/TradingViewChart";
import CoinIcon         from "@/components/ui/CoinIcon";

const INTERVAL_MAP = { "1H": "60", "4H": "240", "1D": "D", "1W": "W" };

export default function MarketPage() {
  const { prices, charts } = useStore();
  const [filter,   setFilter]   = useState("All");
  const [selected, setSelected] = useState(null);
  const [period,   setPeriod]   = useState("1H");
  const [chartH,   setChartH]   = useState(400);

  // Calculate available height for chart on mount
  useEffect(() => {
    const hdr  = 56;  // header
    const nav  = 64;  // bottom nav
    const info = 130; // price header + period selector
    const stats = 0;  // we'll put stats below
    const available = window.innerHeight - hdr - nav - info;
    // Use most of available space, min 300, max 520
    setChartH(Math.min(520, Math.max(300, available)));
  }, []);

  const allCoins = Object.values(COINS);
  const displayed =
    filter === "Gainers" ? [...allCoins].sort((a, b) => b.change - a.change) :
    filter === "Losers"  ? [...allCoins].sort((a, b) => a.change - b.change) :
    allCoins;

  // ── Coin detail ──────────────────────────────────────────
  if (selected) {
    const coin      = COINS[selected];
    const livePrice = prices[selected] ?? coin.price;
    const up        = coin.change >= 0;

    const fmtFull = (p) => {
      if (!p) return "$0";
      if (p < 0.01)  return "$" + p.toFixed(6);
      if (p < 1)     return "$" + p.toFixed(4);
      return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
      /* Full-height flex column — chart fills all available space */
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* Header */}
        <div className="hdr" style={{ flexShrink: 0 }}>
          <button onClick={() => setSelected(null)} style={{ color: "var(--c2)", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <CoinIcon sym={coin.sym} size={26} />
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            {coin.sym}<span style={{ color: "var(--c3)", fontWeight: 500 }}>/USDT</span>
          </div>
        </div>

        {/* Price row + period selector — compact */}
        <div style={{ flexShrink: 0, padding: "10px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--fm)", letterSpacing: "-1px", lineHeight: 1 }}>
              {fmtFull(livePrice)}
            </div>
            <div style={{ fontSize: 12, color: "var(--c2)", marginTop: 3 }}>{coin.name}</div>
          </div>
          <span className={`badge ${up ? "badge-up" : "badge-dn"}`} style={{ fontSize: 13, flexShrink: 0 }}>
            {up ? "+" : ""}{coin.change.toFixed(2)}%
          </span>
        </div>

        {/* Period selector */}
        <div style={{ flexShrink: 0, padding: "0 16px 8px" }}>
          <div className="seg">
            {["1H", "4H", "1D", "1W"].map((p) => (
              <button key={p} className={`seg-btn${period === p ? " active" : ""}`} onClick={() => setPeriod(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* TradingView chart — flex:1 fills ALL remaining height */}
        <div style={{ flex: 1, minHeight: 0, borderTop: "1px solid var(--b1)", borderBottom: "1px solid var(--b1)", overflow: "hidden" }}>
          <TradingViewChart
            sym={coin.sym}
            interval={INTERVAL_MAP[period] ?? "60"}
            height="100%"
          />
        </div>

        {/* Stats — scrollable below chart */}
        <div style={{ flexShrink: 0, overflowY: "auto", padding: "14px 16px 80px" }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                ["MARKET CAP",  "$" + coin.mktcap],
                ["24H VOLUME",  "$" + coin.vol],
                ["24H HIGH",    fmtFull(livePrice * 1.015)],
                ["24H LOW",     fmtFull(livePrice * 0.985)],
                ["CIRCULATING", coin.mktcap],
                ["SYMBOL",      coin.sym],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", marginBottom: 4, letterSpacing: "0.8px" }}>{label}</div>
                  <div style={{ fontFamily: "var(--fm)", fontSize: 14, fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────
  return (
    <div>
      <div className="hdr">
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px" }}>Markets</span>
        <div style={{ marginLeft: "auto" }}>
          <div className="seg" style={{ width: 190 }}>
            {["All", "Gainers", "Losers"].map((f) => (
              <button key={f} className={`seg-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview stats */}
      <div style={{ padding: "12px 16px 0" }}>
        <div className="scroll-x" style={{ paddingBottom: 12 }}>
          {[
            { label: "Market Cap",  value: "$2.41T", change: "+1.2%", up: true },
            { label: "24H Volume",  value: "$89.3B", change: "+5.4%", up: true },
            { label: "BTC Dom.",    value: "52.4%",  change: "-0.3%", up: false },
          ].map((x) => (
            <div key={x.label} className="card" style={{ padding: "10px 14px", minWidth: 110, flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", marginBottom: 4, letterSpacing: "0.5px" }}>{x.label.toUpperCase()}</div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--fm)", color: "var(--cyan)", marginBottom: 2 }}>{x.value}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--fm)", color: x.up ? "var(--green)" : "var(--red)" }}>{x.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 88px", gap: 8, padding: "8px 16px", borderBottom: "1px solid var(--b1)" }}>
        {["ASSET", "7D CHART", "PRICE"].map((h) => (
          <div key={h} style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", letterSpacing: "0.8px", textAlign: h === "PRICE" ? "right" : h === "7D CHART" ? "center" : "left" }}>{h}</div>
        ))}
      </div>

      {displayed.map((coin) => {
        const price = prices[coin.sym] ?? coin.price;
        const up    = coin.change >= 0;
        return (
          <div key={coin.sym} onClick={() => setSelected(coin.sym)}
            style={{ display: "grid", gridTemplateColumns: "1fr 80px 88px", gap: 8, alignItems: "center", padding: "11px 16px", borderBottom: "1px solid var(--b1)", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <CoinIcon sym={coin.sym} size={38} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>{coin.sym}</div>
                <div style={{ fontSize: 11, color: "var(--c3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{coin.name}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <MiniChart data={charts[coin.sym] ?? []} up={up} w={76} h={34} id={coin.sym} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--fm)", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>${fmtPrice(coin.sym, price)}</div>
              <span className={`badge ${up ? "badge-up" : "badge-dn"}`} style={{ fontSize: 10 }}>{up ? "+" : ""}{coin.change.toFixed(2)}%</span>
            </div>
          </div>
        );
      })}
      <div style={{ height: 16 }} />
    </div>
  );
}