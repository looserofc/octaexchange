import { useState } from "react";
import { useStore } from "@/lib/store";
import { COINS, fmtP } from "@/lib/data";
import MiniChart         from "@/components/ui/MiniChart";
import TradingViewChart  from "@/components/ui/TradingViewChart";
import CoinIcon          from "@/components/ui/CoinIcon";

// Period options — label shown to user, val sent to TradingView
const PERIODS = [
  { label:"1m",  val:"1"   },
  { label:"5m",  val:"5"   },
  { label:"15m", val:"15"  },
  { label:"1H",  val:"60"  },
  { label:"4H",  val:"240" },
  { label:"1D",  val:"1D"  },
  { label:"1W",  val:"1W"  },
];

function fmtFull(p) {
  if (!p) return "$0";
  if (p < 0.0001) return "$" + p.toFixed(8);
  if (p < 0.01)   return "$" + p.toFixed(6);
  if (p < 1)      return "$" + p.toFixed(4);
  return "$" + p.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

export default function MarketPage({ setPage }) {
  const { prices, charts } = useStore();
  const [filter, setFilter] = useState("All");
  const [sel,    setSel]    = useState(null);
  const [period, setPeriod] = useState("60"); // default 1H

  const all   = Object.values(COINS);
  const shown = filter === "Gainers"
    ? [...all].sort((a, b) => b.change - a.change)
    : filter === "Losers"
    ? [...all].sort((a, b) => a.change - b.change)
    : all;

  // ── Coin Detail View ────────────────────────────────────
  if (sel) {
    const coin = COINS[sel];
    const lp   = prices[sel] ?? coin.price;
    const up   = coin.change >= 0;

    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>

        {/* Header */}
        <div className="hdr">
          <button onClick={() => setSel(null)}
            style={{ color:"var(--t2)", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <CoinIcon sym={coin.sym} size={26}/>
          <div style={{ fontWeight:800, fontSize:16 }}>
            {coin.sym}<span style={{ color:"var(--t3)", fontWeight:500 }}>/USDT</span>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto" }}>

          {/* Price bar */}
          <div style={{ padding:"12px 16px 10px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:30, fontWeight:900, fontFamily:"var(--m)", letterSpacing:"-1px", lineHeight:1, color:up?"var(--up)":"var(--dn)" }}>
                {fmtFull(lp)}
              </div>
              <div style={{ fontSize:12, color:"var(--t2)", marginTop:5, fontFamily:"var(--m)" }}>
                ≈ {fmtFull(lp)} &nbsp;
                <span style={{ color:up?"var(--up)":"var(--dn)", fontWeight:700 }}>
                  {up ? "+" : ""}{coin.change.toFixed(3)}%
                </span>
              </div>
            </div>
            <span className={`badge ${up?"b-up":"b-dn"}`} style={{ fontSize:13, marginTop:4 }}>
              {up ? "+" : ""}{coin.change.toFixed(2)}%
            </span>
          </div>

          {/* Period tabs */}
          <div style={{ padding:"0 16px 8px" }}>
            <div style={{ display:"flex", gap:2 }}>
              {PERIODS.map(p => (
                <button key={p.val} onClick={() => setPeriod(p.val)}
                  style={{
                    flex:1, padding:"7px 0", borderRadius:8, border:"none",
                    background: period === p.val ? "var(--ln2)" : "transparent",
                    color: period === p.val ? "var(--t1)" : "var(--t3)",
                    fontFamily:"var(--m)", fontSize:11, fontWeight:700,
                    cursor:"pointer", transition:"all .18s",
                    borderBottom: period === p.val ? "2px solid var(--gold)" : "2px solid transparent",
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* TradingView live chart */}
          <div style={{ borderTop:"1px solid var(--ln)" }}>
            <TradingViewChart sym={coin.sym} interval={period} height={320}/>
          </div>

          {/* Stats grid */}
          <div style={{ padding:"16px 16px 80px" }}>
            <div className="card" style={{ padding:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  ["MARKET CAP",  "$" + coin.mktcap],
                  ["24H VOLUME",  "$" + coin.vol],
                  ["24H HIGH",    fmtFull(lp * 1.015)],
                  ["24H LOW",     fmtFull(lp * 0.985)],
                  ["CIRCULATING", coin.mktcap],
                  ["SYMBOL",      coin.sym],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:4, letterSpacing:".8px" }}>{l}</div>
                    <div style={{ fontFamily:"var(--m)", fontSize:14, fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── Market List View ────────────────────────────────────
  return (
    <div>
      <div className="hdr">
        <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-.4px" }}>Markets</span>
        <div style={{ marginLeft:"auto" }}>
          <div className="seg" style={{ width:190 }}>
            {["All", "Gainers", "Losers"].map(f => (
              <button key={f} className={`seg-btn${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview stats */}
      <div style={{ padding:"12px 16px 0" }}>
        <div className="sx" style={{ paddingBottom:12 }}>
          {[
            { label:"Market Cap", value:"$2.41T", change:"+1.2%", up:true  },
            { label:"24H Volume", value:"$89.3B", change:"+5.4%", up:true  },
            { label:"BTC Dom.",   value:"52.4%",  change:"-0.3%", up:false },
          ].map(x => (
            <div key={x.label} className="card" style={{ padding:"10px 14px", minWidth:110, flexShrink:0 }}>
              <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:4, letterSpacing:".5px" }}>{x.label.toUpperCase()}</div>
              <div style={{ fontSize:15, fontWeight:800, fontFamily:"var(--m)", color:"var(--blue)", marginBottom:2 }}>{x.value}</div>
              <div style={{ fontSize:11, fontFamily:"var(--m)", color:x.up?"var(--up)":"var(--dn)" }}>{x.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 88px", gap:8, padding:"8px 16px", borderBottom:"1px solid var(--ln)" }}>
        {["ASSET", "7D CHART", "PRICE"].map((h, i) => (
          <div key={h} style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", letterSpacing:".8px", textAlign:i===2?"right":i===1?"center":"left" }}>{h}</div>
        ))}
      </div>

      {/* Coin rows */}
      {shown.map(coin => {
        const price = prices[coin.sym] ?? coin.price;
        const up    = coin.change >= 0;
        return (
          <div key={coin.sym} onClick={() => { setSel(coin.sym); setPeriod("60"); }}
            style={{ display:"grid", gridTemplateColumns:"1fr 80px 88px", gap:8, alignItems:"center", padding:"11px 16px", borderBottom:"1px solid var(--ln)", cursor:"pointer", transition:"background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.025)"}
            onMouseLeave={e => e.currentTarget.style.background = ""}>

            <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
              <CoinIcon sym={coin.sym} size={38}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, whiteSpace:"nowrap" }}>{coin.sym}</div>
                <div style={{ fontSize:11, color:"var(--t3)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{coin.name}</div>
              </div>
            </div>

            <div style={{ display:"flex", justifyContent:"center" }}>
              <MiniChart data={charts[coin.sym] ?? []} up={up} w={76} h={34} id={coin.sym}/>
            </div>

            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"var(--m)", fontSize:13, fontWeight:700, marginBottom:4 }}>
                ${fmtP(coin.sym, price)}
              </div>
              <span className={`badge ${up?"b-up":"b-dn"}`} style={{ fontSize:10 }}>
                {up ? "+" : ""}{coin.change.toFixed(2)}%
              </span>
            </div>

          </div>
        );
      })}
      <div style={{ height:16 }}/>
    </div>
  );
}