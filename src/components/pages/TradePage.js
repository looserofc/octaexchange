import { useState, useRef, useCallback } from "react";
import { useStore } from "@/lib/store";
import { COINS, PAIRS, fmtP } from "@/lib/data";
import CoinIcon          from "@/components/ui/CoinIcon";
import TradingViewChart  from "@/components/ui/TradingViewChart";
import Countdown         from "@/components/ui/Countdown";

// Ineligible popup for Buy Long / Sell Short
function IneligibleModal({ onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.82)", backdropFilter:"blur(6px)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"var(--ink3)", border:"1px solid rgba(255,59,92,.3)", borderRadius:22, padding:28, width:"100%", maxWidth:360, textAlign:"center", animation:"fadeUp .35s cubic-bezier(.22,1,.36,1) both" }}>
        <div style={{ fontSize:52, marginBottom:14 }}>🚫</div>
        <div style={{ fontWeight:900, fontSize:18, marginBottom:10 }}>Not Eligible for Trading</div>
        <div style={{ background:"rgba(255,59,92,.08)", border:"1px solid rgba(255,59,92,.2)", borderRadius:14, padding:"14px 16px", marginBottom:18, fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>
          ⚠️ Contract trading requires a minimum deposit of <strong style={{ color:"var(--dn)" }}>$3,000</strong>.<br/>
          Please deposit the required amount to unlock trading.
        </div>
        <button className="btn btn-gold btn-block" onClick={onClose}>Got It</button>
      </div>
    </div>
  );
}

// Copy Trading signal input screen
function CopyTradingScreen({ onBack }) {
  const { user, signals, prices, activeTrades, addTrade, removeTrade, orderHistory, addOrder, addToast, addTx, setUser } = useStore();
  const [code, setCode]   = useState("");
  const [busy, setBusy]   = useState(false);
  const [err,  setErr]    = useState("");
  const [ok,   setOk]     = useState("");
  const [tab,  setTab]    = useState("open");
  const used = useRef(new Set());
  const tradeBal = user.tradingBalance ?? 0;

  const submit = () => {
    const c = code.trim().toUpperCase();
    setErr(""); setOk("");
    if (!c)              { setErr("Enter a signal code."); return; }
    if (tradeBal <= 0)   { setErr("Transfer funds to Trading Account first."); return; }
    if (used.current.has(c)) { setErr("Already used this code."); return; }
    const sig = signals[c];
    if (!sig)            { setErr("Invalid signal code. Check WhatsApp group."); return; }
    if (Date.now() - sig.created > sig.ttl) { setErr("Signal code has expired."); return; }
    setBusy(true);
    setTimeout(() => {
      const profit = user.tier.profit ?? 2;
      const entry  = prices[sig.coin] ?? COINS[sig.coin]?.price ?? 0;
      addTrade({ id:"t"+Date.now(), pair:sig.pair, coin:sig.coin, code:c, profit, side:sig.side||"BUY", entry, qty:parseFloat((profit/(entry*.01||1)).toFixed(6)), openTime:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) });
      used.current.add(c); setCode("");
      setOk(`${sig.side||"BUY"} signal confirmed — +$${profit.toFixed(2)} in 5 minutes`);
      addToast(`Copy Trade: ${sig.pair} ${sig.side||"BUY"}`, "ok");
      setBusy(false);
    }, 700);
  };

  const complete = useCallback(id => {
    const t = activeTrades.find(x => x.id === id); if (!t) return;
    const exit = prices[t.coin] ?? COINS[t.coin]?.price ?? 0;
    setUser({ ...user, tradingBalance:(user.tradingBalance||0)+t.profit, totalProfit:(user.totalProfit||0)+t.profit, totalTrades:(user.totalTrades||0)+1 });
    addOrder({ id:t.id, pair:t.pair, coin:t.coin, type:"Copy Trade", side:t.side||"BUY", code:t.code, entryPrice:t.entry, exitPrice:exit, qty:t.qty, leverage:1, margin:user.tier?.price??200, pnl:t.profit, pnlPct:1.0, status:"CLOSED", openTime:t.openTime, closeTime:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) });
    removeTrade(id);
    addTx({ id:"tx"+Date.now(), type:"trade_profit", wallet:"trading", amount:t.profit, fee:0, net:t.profit, coin:t.pair, status:"completed", date:new Date().toLocaleDateString() });
    addToast(`+$${t.profit.toFixed(2)} added to Trading Account`, "ok");
  }, [activeTrades, prices, user, setUser, addOrder, removeTrade, addTx, addToast]);

  const copyOrders = orderHistory.filter(o => o.type === "Copy Trade");

  return (
    <div>
      <div className="hdr">
        <button onClick={onBack} style={{ color:"var(--t2)", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Back
        </button>
        <span style={{ fontWeight:800, fontSize:17 }}>Copy Trading</span>
        {activeTrades.length > 0 && <span className="badge b-bl" style={{ marginLeft:"auto" }}>{activeTrades.length} live</span>}
      </div>
      <div style={{ padding:"12px 16px 0" }}>
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:3, letterSpacing:".8px" }}>TRADING ACCOUNT</div>
            <div style={{ fontSize:22, fontWeight:900, fontFamily:"var(--m)", color:"var(--up)" }}>${tradeBal.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
          </div>
          {tradeBal <= 0 && <button className="btn btn-gold btn-sm" onClick={() => useStore.getState().setPage("assets")}>Fund →</button>}
        </div>

        <div className="card" style={{ padding:20, marginBottom:16 }}>
          <input className="inp" style={{ fontFamily:"var(--m)", letterSpacing:3, textTransform:"uppercase", fontSize:18, fontWeight:700, textAlign:"center", marginBottom:12, borderColor:err?"var(--dn)":"" }}
            placeholder="E.G.  BTC9421" value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setErr(""); setOk(""); }}
            onKeyDown={e => e.key==="Enter" && submit()}/>
          {err && <div style={{ background:"rgba(255,59,92,.08)", border:"1px solid rgba(255,59,92,.2)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"var(--dn)", fontSize:13 }}>{err}</div>}
          {ok  && <div style={{ background:"rgba(0,200,150,.08)", border:"1px solid rgba(0,200,150,.2)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"var(--up)", fontSize:13 }}>{ok}</div>}
          <button className="btn btn-gold btn-block" style={{ fontSize:15, background:"linear-gradient(135deg,#a855f7,#7c3aed)" }} onClick={submit} disabled={busy||!code.trim()}>
            {busy ? <><span className="spin spin-w"/>Validating...</> : "Submit Signal Code"}
          </button>
          <div style={{ marginTop:12, background:"rgba(45,156,255,.06)", border:"1px solid rgba(45,156,255,.12)", borderRadius:10, padding:"10px 14px" }}>
            <div style={{ fontSize:11, color:"var(--blue)", fontFamily:"var(--m)", fontWeight:700, marginBottom:4 }}>DEMO CODES</div>
            <div style={{ fontSize:11, color:"var(--t2)", fontFamily:"var(--m)", letterSpacing:1 }}>BTC9421 · ETH7364 · SOL1982 · BNB4471</div>
          </div>
        </div>

        {activeTrades.length > 0 && activeTrades.map(t => {
          const p = prices[t.coin] ?? COINS[t.coin]?.price ?? 0;
          return (
            <div key={t.id} className="card2" style={{ padding:16, marginBottom:10, borderColor:"rgba(45,156,255,.2)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <CoinIcon sym={t.coin} size={32}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontWeight:800, fontSize:15 }}>{t.pair}</span>
                    <span className={`badge ${t.side==="BUY"?"b-up":"b-dn"}`} style={{ fontSize:10 }}>{t.side}</span>
                  </div>
                  <div style={{ fontSize:11, color:"var(--t2)", fontFamily:"var(--m)", marginTop:2 }}>Code: {t.code}</div>
                </div>
                <Countdown totalSeconds={300} onDone={() => complete(t.id)}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {[["ENTRY","$"+fmtP(t.coin,t.entry),"var(--t2)"],["CURRENT","$"+fmtP(t.coin,p),"var(--t1)"],["EST. PNL","+$"+t.profit.toFixed(2),"var(--up)"]].map(([l,v,c]) => (
                  <div key={l} style={{ background:"var(--ink2)", borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:3 }}>{l}</div>
                    <div style={{ fontFamily:"var(--m)", fontSize:13, fontWeight:700, color:c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="seg" style={{ marginBottom:14 }}>
          <button className={`seg-btn${tab==="open"?" on":""}`} onClick={() => setTab("open")}>Open ({activeTrades.length})</button>
          <button className={`seg-btn${tab==="history"?" on":""}`} onClick={() => setTab("history")}>History ({copyOrders.length})</button>
        </div>

        {tab === "history" && (
          <div className="card" style={{ overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1.2fr .6fr .8fr .8fr .7fr .7fr", gap:4, padding:"9px 14px", borderBottom:"1px solid var(--ln)", background:"var(--ink4)" }}>
              {["Contract","Side","Entry","Exit","PnL","Status"].map((h,i) => (
                <div key={h} style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", textAlign:i>1?"right":"left" }}>{h}</div>
              ))}
            </div>
            {copyOrders.length === 0
              ? <div className="empty" style={{ padding:"32px 16px" }}><div className="ei">📋</div><p>No closed trades yet</p></div>
              : copyOrders.slice(0,30).map((o,i) => {
                  const pp = o.pnl >= 0;
                  return (
                    <div key={o.id} style={{ display:"grid", gridTemplateColumns:"1.2fr .6fr .8fr .8fr .7fr .7fr", gap:4, padding:"11px 14px", borderBottom:i<copyOrders.length-1?"1px solid var(--ln)":"none", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <CoinIcon sym={o.coin} size={22}/>
                        <div><div style={{ fontSize:12, fontWeight:700 }}>{o.pair}</div><div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)" }}>{o.openTime}</div></div>
                      </div>
                      <div style={{ textAlign:"right" }}><span className={`badge ${o.side==="BUY"||o.side==="LONG"?"b-up":"b-dn"}`} style={{ fontSize:9, padding:"2px 6px" }}>{o.side}</span></div>
                      <div style={{ textAlign:"right", fontFamily:"var(--m)", fontSize:11, color:"var(--t2)" }}>${fmtP(o.coin,o.entryPrice)}</div>
                      <div style={{ textAlign:"right", fontFamily:"var(--m)", fontSize:11 }}>${fmtP(o.coin,o.exitPrice)}</div>
                      <div style={{ textAlign:"right", fontFamily:"var(--m)", fontSize:12, fontWeight:700, color:pp?"var(--up)":"var(--dn)" }}>{pp?"+":""}{o.pnl?.toFixed(2)}</div>
                      <div style={{ textAlign:"right" }}><span className={`badge ${o.status==="CLOSED"?"b-dim":"b-dn"}`} style={{ fontSize:9, padding:"2px 6px" }}>{o.status}</span></div>
                    </div>
                  );
                })
            }
          </div>
        )}
        {tab === "open" && activeTrades.length === 0 && (
          <div className="empty"><div className="ei">⚡</div><p style={{ fontSize:13 }}>No open trades.<br/>Enter a signal code above.</p></div>
        )}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// Records screen
function RecordsScreen({ onBack }) {
  const { orderHistory } = useStore();
  const [tab, setTab] = useState("contract");
  const contractOrders = orderHistory.filter(o => o.type === "Futures");
  const copyOrders     = orderHistory.filter(o => o.type === "Copy Trade");
  const list = tab === "contract" ? contractOrders : copyOrders;

  return (
    <div>
      <div className="hdr">
        <button onClick={onBack} style={{ color:"var(--t2)", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Back
        </button>
        <span style={{ fontWeight:800, fontSize:17 }}>Trade Details</span>
      </div>
      <div style={{ padding:"0 16px" }}>
        <div style={{ display:"flex", borderBottom:"1px solid var(--ln)", marginBottom:16, marginTop:4 }}>
          {["contract","copy"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex:1, padding:"12px 0", background:"none", border:"none", borderBottom:`2.5px solid ${tab===t?"var(--pu)":"transparent"}`, color:tab===t?"var(--pu)":"var(--t3)", fontFamily:"var(--f)", fontSize:14, fontWeight:700, cursor:"pointer", transition:"all .2s" }}>
              {t === "contract" ? "Contract Trade" : "Copy Trading"}
            </button>
          ))}
        </div>
        {list.length === 0
          ? <div className="empty" style={{ paddingTop:60 }}><div className="ei">📭</div><p>No Data</p></div>
          : list.map((o, i) => {
              const pp = o.pnl >= 0;
              return (
                <div key={o.id} style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:14, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <CoinIcon sym={o.coin} size={32}/>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>{o.pair}</div>
                        <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:1 }}>{o.openTime}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"var(--m)", fontSize:16, fontWeight:900, color:pp?"var(--up)":"var(--dn)" }}>{pp?"+":""}{o.pnl?.toFixed(2)} USDT</div>
                      <span className={`badge ${o.status==="CLOSED"||o.status==="closed"?"b-dim":"b-dn"}`} style={{ fontSize:9, marginTop:4, display:"inline-block" }}>{o.status}</span>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {[["Side",o.side,o.side==="BUY"||o.side==="LONG"?"var(--up)":"var(--dn)"],["Entry","$"+fmtP(o.coin,o.entryPrice),"var(--t2)"],["Exit","$"+fmtP(o.coin,o.exitPrice),"var(--t1)"]].map(([l,v,c]) => (
                      <div key={l} style={{ background:"var(--ink2)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
        }
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// Main TradePage
export default function TradePage() {
  const { prices } = useStore();
  const [sym,        setSym]        = useState("BTC");
  const [period,     setPeriod]     = useState("60");
  const [showPopup,  setShowPopup]  = useState(false);
  const [screen,     setScreen]     = useState(null); // "copy" | "records"

  const coin = COINS[sym];
  const lp   = prices[sym] ?? coin?.price ?? 0;
  const up   = (coin?.change ?? 0) >= 0;

  const PERIODS = [
    { label:"1m",  val:"1"   },
    { label:"5m",  val:"5"   },
    { label:"15m", val:"15"  },
    { label:"1h",  val:"60"  },
    { label:"4h",  val:"240" },
    { label:"1d",  val:"D"   },
  ];

  if (screen === "copy")    return <CopyTradingScreen onBack={() => setScreen(null)}/>;
  if (screen === "records") return <RecordsScreen     onBack={() => setScreen(null)}/>;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      {showPopup && <IneligibleModal onClose={() => setShowPopup(false)}/>}

      {/* Pair selector header */}
      <div style={{ flexShrink:0, padding:"10px 16px 0" }}>
        <div style={{ display:"flex", overflowX:"auto", gap:6, paddingBottom:8 }}>
          {PAIRS.map(p => {
            const s = p.split("/")[0];
            return (
              <button key={p} onClick={() => setSym(s)}
                style={{ padding:"7px 14px", borderRadius:20, flexShrink:0, border:`1.5px solid ${s===sym?"var(--gold)":"var(--ln)"}`, background:s===sym?"rgba(240,165,0,.1)":"transparent", color:s===sym?"var(--gold)":"var(--t3)", fontFamily:"var(--m)", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                {p}
              </button>
            );
          })}
        </div>

        {/* Price display */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <CoinIcon sym={sym} size={28}/>
          <div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
              <span style={{ fontFamily:"var(--m)", fontSize:26, fontWeight:900, color:up?"var(--up)":"var(--dn)", letterSpacing:"-1px" }}>
                {fmtP(sym, lp)}
              </span>
            </div>
            <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)" }}>
              ≈ ${fmtP(sym, lp)} &nbsp;
              <span style={{ color:up?"var(--up)":"var(--dn)" }}>{up?"+":""}{coin?.change?.toFixed(3)}%</span>
            </div>
          </div>
        </div>

        {/* Period tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:4 }}>
          {PERIODS.map(p => (
            <button key={p.val} onClick={() => setPeriod(p.val)}
              style={{ padding:"5px 10px", borderRadius:6, border:"none", background:period===p.val?"var(--ln2)":"transparent", color:period===p.val?"var(--t1)":"var(--t3)", fontFamily:"var(--m)", fontSize:11, fontWeight:700, cursor:"pointer" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ borderTop:"1px solid var(--ln)", borderBottom:"1px solid var(--ln)", flexShrink:0 }}>
        <TradingViewChart sym={sym} interval={period} height={300}/>
      </div>

      {/* Action buttons */}
      <div style={{ flexShrink:0, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <button onClick={() => setShowPopup(true)}
            style={{ padding:"15px 0", borderRadius:14, border:"none", background:"linear-gradient(135deg,#00c896,#008f6a)", color:"#000", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:"var(--f)" }}>
            Buy Long
          </button>
          <button onClick={() => setShowPopup(true)}
            style={{ padding:"15px 0", borderRadius:14, border:"none", background:"linear-gradient(135deg,#ff3b5c,#c01535)", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:"var(--f)" }}>
            Sell Short
          </button>
        </div>

        <button onClick={() => setScreen("copy")}
          style={{ padding:"14px 0", borderRadius:14, border:"none", background:"linear-gradient(135deg,#a855f7,#7c3aed)", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"var(--f)" }}>
          Copy Trading
        </button>

        <button onClick={() => setScreen("records")}
          style={{ padding:"13px 0", borderRadius:14, border:"1px solid var(--ln2)", background:"var(--ink3)", color:"var(--t1)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"var(--f)" }}>
          Records
        </button>
      </div>
    </div>
  );
}