import { useState } from "react";
import { useStore } from "@/lib/store";
import { COINS, PAIRS, LEVERAGES, fmtP } from "@/lib/data";
import CoinIcon from "@/components/ui/CoinIcon";
import TradingViewChart from "@/components/ui/TradingViewChart";

// ── Popup Modal for ineligible trade ───────────────────────
function IneligibleModal({ onClose }) {
  return (
    <div style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,.82)",backdropFilter:"blur(6px)",
      zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20
    }}>
      <div style={{
        background:"var(--ink3)",border:"1px solid rgba(255,59,92,.3)",
        borderRadius:22,padding:28,width:"100%",maxWidth:360,textAlign:"center",
        animation:"fadeUp .35s cubic-bezier(.22,1,.36,1) both"
      }}>
        <div style={{fontSize:52,marginBottom:14}}>🚫</div>
        <div style={{fontWeight:900,fontSize:18,marginBottom:10,color:"var(--t1)"}}>
          Not Eligible for Trading
        </div>
        <div style={{
          background:"rgba(255,59,92,.08)",border:"1px solid rgba(255,59,92,.2)",
          borderRadius:14,padding:"14px 16px",marginBottom:18,fontSize:13,
          color:"var(--t2)",lineHeight:1.7
        }}>
          ⚠️ Futures trading requires a minimum deposit of{" "}
          <strong style={{color:"var(--dn)"}}>$3,000</strong>.
          <br/>
          Please deposit the required amount to unlock futures trading.
        </div>
        <div style={{fontSize:12,color:"var(--t3)",marginBottom:18,lineHeight:1.6}}>
          Upgrade your account tier to access leveraged futures positions.
        </div>
        <button
          className="btn btn-gold btn-block"
          onClick={onClose}
        >
          Got It
        </button>
      </div>
    </div>
  );
}

export default function FuturesPage() {
  const { user, prices, futPos, openFuture, closeFuture, addToast } = useStore();

  const [sym,    setSym]    = useState("BTC");
  const [side,   setSide]   = useState("LONG");
  const [lev,    setLev]    = useState(10);
  const [mAmt,   setMAmt]   = useState("");
  const [tpPct,  setTpPct]  = useState("");
  const [slPct,  setSlPct]  = useState("");
  const [period, setPeriod] = useState("60");
  const [showPopup, setShowPopup] = useState(false);

  const tradeBal = user?.tradingBalance ?? 0;
  const lp       = prices[sym] ?? COINS[sym]?.price ?? 0;

  const posSize  = (parseFloat(mAmt) || 0) * lev;
  const qty      = lp > 0 ? posSize / lp : 0;
  const liqPct   = side === "LONG" ? (1 / lev) * 0.9 : (1 / lev) * 0.9;
  const liqPrice = side === "LONG" ? lp * (1 - liqPct) : lp * (1 + liqPct);
  const tpPrice  = parseFloat(tpPct) > 0 ? (side === "LONG" ? lp * (1 + parseFloat(tpPct) / 100) : lp * (1 - parseFloat(tpPct) / 100)) : 0;
  const slPrice  = parseFloat(slPct) > 0 ? (side === "LONG" ? lp * (1 - parseFloat(slPct) / 100) : lp * (1 + parseFloat(slPct) / 100)) : 0;

  const PERIODS = [
    {label:"1m",  val:"1"},
    {label:"5m",  val:"5"},
    {label:"15m", val:"15"},
    {label:"1H",  val:"60"},
    {label:"4H",  val:"240"},
    {label:"1D",  val:"D"},
  ];

  // Always show popup — futures require $3000 min deposit
  const placeOrder = () => {
    setShowPopup(true);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {showPopup && <IneligibleModal onClose={() => setShowPopup(false)} />}

      {/* Header */}
      <div className="hdr">
        <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-.4px" }}>Futures</span>
        <span className="badge b-dn" style={{ fontSize:10, marginLeft:"auto" }}>
          Min. $3,000 Deposit
        </span>
      </div>

      <div style={{ flex:1, overflowY:"auto" }}>
        {/* Pair selector */}
        <div style={{ padding:"12px 16px 8px" }}>
          <div className="sx">
            {PAIRS.map(p => {
              const s = p.split("/")[0];
              const active = s === sym;
              return (
                <button key={p} onClick={() => setSym(s)}
                  style={{ padding:"7px 14px", borderRadius:10, border:`1.5px solid ${active?"var(--gold)":"var(--ln)"}`,
                    background:active?"rgba(240,165,0,.1)":"var(--ink2)", color:active?"var(--gold)":"var(--t2)",
                    fontFamily:"var(--m)", fontSize:11, fontWeight:700, flexShrink:0 }}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price header */}
        <div style={{ padding:"4px 16px 8px", display:"flex", alignItems:"center", gap:12 }}>
          <CoinIcon sym={sym} size={28}/>
          <div>
            <div style={{ fontFamily:"var(--m)", fontSize:22, fontWeight:900, letterSpacing:"-1px", lineHeight:1 }}>
              ${fmtP(sym, lp)}
            </div>
            <div style={{ fontSize:11, color:"var(--t3)", marginTop:2 }}>{sym}/USDT Perpetual</div>
          </div>
        </div>

        {/* Period tabs */}
        <div style={{ padding:"0 16px 8px" }}>
          <div className="sx" style={{ gap:6 }}>
            {PERIODS.map(p => (
              <button key={p.val} onClick={() => setPeriod(p.val)}
                style={{ padding:"5px 12px", borderRadius:8,
                  border:`1.5px solid ${period===p.val?"var(--gold)":"var(--ln)"}`,
                  background:period===p.val?"rgba(240,165,0,.1)":"transparent",
                  color:period===p.val?"var(--gold)":"var(--t3)",
                  fontFamily:"var(--m)", fontSize:11, fontWeight:700, flexShrink:0 }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* TradingView Chart */}
        <div style={{ borderTop:"1px solid var(--ln)", borderBottom:"1px solid var(--ln)", marginBottom:16 }}>
          <TradingViewChart sym={sym} interval={period} height={320}/>
        </div>

        {/* Order form */}
        <div style={{ padding:"0 16px" }}>

          {/* Ineligible Notice */}
          <div style={{
            background:"rgba(255,59,92,.06)",border:"1px solid rgba(255,59,92,.18)",
            borderRadius:12,padding:"10px 14px",marginBottom:14,
            fontSize:12,color:"var(--t2)",lineHeight:1.6
          }}>
            🔒 Futures trading requires a minimum deposit of{" "}
            <strong style={{color:"var(--dn)"}}>$3,000</strong>.
            Placing an order will prompt an eligibility check.
          </div>

          {/* Long / Short toggle */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            {["LONG","SHORT"].map(s => (
              <button key={s} onClick={() => setSide(s)}
                style={{ padding:"11px 0", borderRadius:12,
                  border:`2px solid ${side===s?(s==="LONG"?"var(--up)":"var(--dn)"):"var(--ln)"}`,
                  background:side===s?(s==="LONG"?"rgba(0,200,150,.12)":"rgba(255,59,92,.12)"):"var(--ink2)",
                  color:side===s?(s==="LONG"?"var(--up)":"var(--dn)"):"var(--t2)",
                  fontWeight:800, fontSize:14 }}>
                {s==="LONG"?"▲ Long":"▼ Short"}
              </button>
            ))}
          </div>

          {/* Leverage */}
          <div className="fg">
            <label className="lbl">Leverage</label>
            <div className="sx" style={{ gap:6 }}>
              {LEVERAGES.map(l => (
                <button key={l} onClick={() => setLev(l)}
                  style={{ padding:"6px 11px", borderRadius:8,
                    border:`1.5px solid ${lev===l?"var(--gold)":"var(--ln)"}`,
                    background:lev===l?"rgba(240,165,0,.1)":"var(--ink2)",
                    color:lev===l?"var(--gold)":"var(--t2)",
                    fontFamily:"var(--m)", fontSize:11, fontWeight:700, flexShrink:0 }}>
                  {l}x
                </button>
              ))}
            </div>
          </div>

          {/* Margin input */}
          <div className="fg">
            <label className="lbl">Margin (USDT)</label>
            <div className="iw">
              <input className="inp" type="number" placeholder="Enter margin amount" value={mAmt}
                onChange={e => setMAmt(e.target.value)}
                style={{ paddingRight:80 }}/>
              <button className="isuf" onClick={() => setMAmt(String(Math.floor(tradeBal)))}>MAX</button>
            </div>
            <div style={{ fontSize:11, color:"var(--t3)", marginTop:4, fontFamily:"var(--m)" }}>
              Available: ${tradeBal.toFixed(2)}
            </div>
          </div>

          {/* TP / SL */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div className="fg">
              <label className="lbl">Take Profit %</label>
              <input className="inp" type="number" placeholder="e.g. 5" value={tpPct}
                onChange={e => setTpPct(e.target.value)} style={{ padding:"10px 14px" }}/>
            </div>
            <div className="fg">
              <label className="lbl">Stop Loss %</label>
              <input className="inp" type="number" placeholder="e.g. 3" value={slPct}
                onChange={e => setSlPct(e.target.value)} style={{ padding:"10px 14px" }}/>
            </div>
          </div>

          {/* Calculation summary */}
          {parseFloat(mAmt) > 0 && (
            <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  ["Position Size", "$"+posSize.toFixed(2), "var(--t1)"],
                  ["Quantity", qty.toFixed(6)+" "+sym, "var(--t2)"],
                  ["Entry Price", "$"+fmtP(sym,lp), "var(--t1)"],
                  ["Liq. Price", "$"+fmtP(sym,liqPrice), "var(--dn)"],
                  ["Take Profit", parseFloat(tpPct)>0?"$"+fmtP(sym,tpPrice):"—", "var(--up)"],
                  ["Stop Loss", parseFloat(slPct)>0?"$"+fmtP(sym,slPrice):"—", "var(--dn)"],
                ].map(([l,v,c]) => (
                  <div key={l}>
                    <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:2 }}>{l}</div>
                    <div style={{ fontFamily:"var(--m)", fontSize:12, fontWeight:700, color:c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Long / Short buttons */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <button onClick={() => { setSide("LONG"); placeOrder(); }}
              style={{ padding:"14px 0", borderRadius:14, border:"none",
                background:"linear-gradient(135deg,#00c896,#008f6a)", color:"#000",
                fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"var(--f)" }}>
              ▲ Open Long
            </button>
            <button onClick={() => { setSide("SHORT"); placeOrder(); }}
              style={{ padding:"14px 0", borderRadius:14, border:"none",
                background:"linear-gradient(135deg,#ff3b5c,#c01535)", color:"#fff",
                fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"var(--f)" }}>
              ▼ Open Short
            </button>
          </div>
        </div>

        {/* Open positions (read-only display) */}
        {futPos.length > 0 && (
          <div style={{ padding:"0 16px 14px" }}>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:12 }}>Open Positions ({futPos.length})</div>
            {futPos.map(pos => {
              const p = prices[pos.coin] ?? pos.entry;
              const pnl = pos.side==="LONG" ? (p-pos.entry)*pos.qty*pos.leverage : (pos.entry-p)*pos.qty*pos.leverage;
              const pnlPct = (pnl/pos.margin)*100, pp = pnl >= 0;
              return (
                <div key={pos.id} style={{ background:"var(--ink3)", border:`1px solid ${pp?"rgba(0,200,150,.2)":"rgba(255,59,92,.2)"}`, borderRadius:14, padding:14, marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <CoinIcon sym={pos.coin} size={28}/>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontWeight:800, fontSize:14 }}>{pos.pair}</span>
                        <span className={`badge ${pos.side==="LONG"?"b-up":"b-dn"}`} style={{ fontSize:10 }}>{pos.side}</span>
                        <span className="badge b-au" style={{ fontSize:10 }}>{pos.leverage}x</span>
                      </div>
                      <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:1 }}>Opened {pos.openTime}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"var(--m)", fontSize:16, fontWeight:900, color:pp?"var(--up)":"var(--dn)" }}>{pp?"+":""}{pnl.toFixed(2)}</div>
                      <div style={{ fontSize:10, color:pp?"var(--up)":"var(--dn)", fontFamily:"var(--m)" }}>{pp?"+":""}{pnlPct.toFixed(2)}%</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:12 }}>
                    {[["Entry","$"+fmtP(pos.coin,pos.entry),"var(--t1)"],["Current","$"+fmtP(pos.coin,p),"var(--t1)"],["Liq.","$"+fmtP(pos.coin,pos.liqPrice),"var(--dn)"],["Margin","$"+pos.margin.toFixed(2),"var(--t2)"]].map(([l,v,c]) => (
                      <div key={l} style={{ background:"var(--ink2)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:11, fontWeight:700, fontFamily:"var(--m)", color:c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => closeFuture(pos.id, p, "CLOSED")} className="btn btn-ghost btn-sm btn-block" style={{ border:"1px solid var(--ln2)" }}>Close Position at Market</button>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}