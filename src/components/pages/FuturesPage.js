import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { COINS, LEVERAGES, fmtP } from "@/lib/data";
import CoinIcon    from "@/components/ui/CoinIcon";
import TradingViewChart from "@/components/ui/TradingViewChart";

const SYMS = ["BTC","ETH","BNB","SOL","XRP","ADA"];
const PERIODS = ["1M","5M","15M","1H","4H","1D"];
const TV_INTERVAL = { "1M":"1","5M":"5","15M":"15","1H":"60","4H":"240","1D":"D" };

export default function FuturesPage({ setPage }) {
  const { user, prices, futPos, openFuture, closeFuture, orderHistory, addToast } = useStore();
  const [sym,     setSym]     = useState("BTC");
  const [period,  setPeriod]  = useState("1H");
  const [side,    setSide]    = useState("LONG");
  const [lev,     setLev]     = useState(10);
  const [margin,  setMargin]  = useState("");
  const [tpPct,   setTpPct]   = useState("2");
  const [slPct,   setSlPct]   = useState("1");

  const pair     = sym + "/USDT";
  const lp       = prices[sym] ?? COINS[sym]?.price ?? 0;
  const tradeBal = user?.tradingBalance ?? 0;
  const mAmt     = parseFloat(margin) || 0;
  const posSize  = mAmt * lev;
  const qty      = posSize / (lp || 1);
  const tpPrice  = side === "LONG" ? lp*(1+parseFloat(tpPct)/100) : lp*(1-parseFloat(tpPct)/100);
  const slPrice  = side === "LONG" ? lp*(1-parseFloat(slPct)/100) : lp*(1+parseFloat(slPct)/100);
  const liqPrice = side === "LONG" ? lp*(1-1/lev*.9) : lp*(1+1/lev*.9);

  // Auto-check liquidation / TP / SL
  useEffect(() => {
    futPos.forEach(pos => {
      const p = prices[pos.coin] ?? 0; if (!p) return;
      if (pos.side==="LONG"  && p <= pos.liqPrice) { closeFuture(pos.id, p, "LIQUIDATED"); return; }
      if (pos.side==="SHORT" && p >= pos.liqPrice) { closeFuture(pos.id, p, "LIQUIDATED"); return; }
      if (pos.tp && pos.side==="LONG"  && p >= pos.tp) { closeFuture(pos.id, p, "CLOSED"); addToast(`TP hit: ${pos.pair}`,"ok"); return; }
      if (pos.tp && pos.side==="SHORT" && p <= pos.tp) { closeFuture(pos.id, p, "CLOSED"); addToast(`TP hit: ${pos.pair}`,"ok"); return; }
      if (pos.sl && pos.side==="LONG"  && p <= pos.sl) { closeFuture(pos.id, p, "CLOSED"); addToast(`SL hit: ${pos.pair}`,"err"); return; }
      if (pos.sl && pos.side==="SHORT" && p >= pos.sl) { closeFuture(pos.id, p, "CLOSED"); addToast(`SL hit: ${pos.pair}`,"err"); return; }
    });
  }, [prices]);

  const placeOrder = () => {
    if (tradeBal < 3000)   { addToast("Minimum $3,000 required in Trading Account for Futures","err"); return; }
    if (mAmt <= 0)        { addToast("Enter margin amount","err"); return; }
    if (mAmt > tradeBal)  { addToast("Insufficient trading balance","err"); return; }
    openFuture({
      id:       "f"+Date.now(), pair, coin:sym, side, entry:lp,
      qty:      parseFloat(qty.toFixed(6)), leverage:lev,
      margin:   mAmt, posSize:parseFloat(posSize.toFixed(2)),
      tp:       parseFloat(tpPct)>0 ? parseFloat(tpPrice.toFixed(4)) : null,
      sl:       parseFloat(slPct)>0 ? parseFloat(slPrice.toFixed(4)) : null,
      liqPrice: parseFloat(liqPrice.toFixed(4)),
      openTime: new Date().toLocaleString("en-US",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),
    });
    useStore.getState().setUser({ ...user, tradingBalance: tradeBal - mAmt });
    addToast(`${side} ${pair} opened — ${lev}x leverage`,"ok");
    setMargin("");
  };

  const totalUnreal = futPos.reduce((acc, pos) => {
    const p = prices[pos.coin] ?? pos.entry;
    const pnl = pos.side==="LONG" ? (p-pos.entry)*pos.qty*pos.leverage : (pos.entry-p)*pos.qty*pos.leverage;
    return acc + pnl;
  }, 0);

  const futHistory = orderHistory.filter(o => o.type==="Futures");

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      {/* Header — pair selector */}
      <div className="hdr" style={{gap:6}}>
        <div className="sx" style={{flex:1,gap:6,paddingBottom:0}}>
          {SYMS.map(s=>(
            <button key={s} onClick={()=>setSym(s)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${sym===s?"var(--gold)":"var(--ln)"}`,background:sym===s?"rgba(240,165,0,.1)":"var(--ink2)",color:sym===s?"var(--gold)":"var(--t2)",fontFamily:"var(--m)",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",paddingBottom:76}}>
        {/* Price bar */}
        <div style={{padding:"10px 16px",background:"var(--ink2)",borderBottom:"1px solid var(--ln)",display:"flex",alignItems:"center",gap:16}}>
          <CoinIcon sym={sym} size={24}/>
          <div>
            <div style={{fontFamily:"var(--m)",fontSize:20,fontWeight:900,letterSpacing:"-1px"}}>${fmtP(sym,lp)}</div>
            <div style={{fontSize:11,color:COINS[sym]?.change>=0?"var(--up)":"var(--dn)",fontFamily:"var(--m)"}}>{COINS[sym]?.change>=0?"+":""}{COINS[sym]?.change?.toFixed(2)}%</div>
          </div>
          {futPos.length>0&&(
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)"}}>Unrealized PnL</div>
              <div style={{fontFamily:"var(--m)",fontSize:14,fontWeight:800,color:totalUnreal>=0?"var(--up)":"var(--dn)"}}>{totalUnreal>=0?"+":""}{totalUnreal.toFixed(2)} USDT</div>
            </div>
          )}
        </div>

        {/* Period selector */}
        <div style={{padding:"8px 16px",background:"var(--ink3)",borderBottom:"1px solid var(--ln)",display:"flex",gap:2,overflow:"auto"}}>
          {PERIODS.map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 10px",borderRadius:6,border:"none",background:period===p?"var(--gold)":"transparent",color:period===p?"#000":"var(--t2)",fontFamily:"var(--m)",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>
              {p}
            </button>
          ))}
        </div>

        {/* Candle chart — admin wicks show here */}
        <div style={{borderBottom:"1px solid var(--ln)"}}>
          <TradingViewChart sym={sym} interval={TV_INTERVAL[period]??"60"} height={460}/>
        </div>

        {/* Order form */}
        <div style={{padding:"14px 16px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontWeight:800,fontSize:15}}>Place Order</span>
            <div style={{fontSize:12,color:"var(--t2)"}}>Balance: <strong style={{color:"var(--up)",fontFamily:"var(--m)"}}>${tradeBal.toFixed(2)}</strong></div>
          </div>

          {/* LONG / SHORT */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {["LONG","SHORT"].map(s=>(
              <button key={s} onClick={()=>setSide(s)} style={{padding:"12px 0",borderRadius:12,border:`2px solid ${side===s?(s==="LONG"?"var(--up)":"var(--dn)"):"var(--ln)"}`,background:side===s?(s==="LONG"?"rgba(0,200,150,.12)":"rgba(255,59,92,.12)"):"var(--ink3)",color:side===s?(s==="LONG"?"var(--up)":"var(--dn)"):"var(--t2)",fontWeight:800,fontSize:14,cursor:"pointer",transition:"all .2s"}}>
                {s==="LONG"?"▲ LONG":"▼ SHORT"}
              </button>
            ))}
          </div>

          {/* Leverage */}
          <div className="fg">
            <label className="lbl">Leverage — {lev}x</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {LEVERAGES.map(l=>(
                <button key={l} onClick={()=>setLev(l)} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${lev===l?"var(--gold)":"var(--ln)"}`,background:lev===l?"rgba(240,165,0,.1)":"var(--ink2)",color:lev===l?"var(--gold)":"var(--t2)",fontFamily:"var(--m)",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {l}x
                </button>
              ))}
            </div>
          </div>

          {/* Margin */}
          <div className="fg">
            <label className="lbl">Margin (USDT)</label>
            <div className="iw">
              <input className="inp" type="number" placeholder="Enter margin amount" value={margin} onChange={e=>setMargin(e.target.value)} style={{paddingRight:52}}/>
              <button className="isuf" onClick={()=>setMargin((tradeBal*.5).toFixed(2))}>50%</button>
            </div>
          </div>

          {/* TP / SL */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div className="fg" style={{marginBottom:0}}>
              <label className="lbl">Take Profit %</label>
              <input className="inp" type="number" placeholder="e.g. 2" value={tpPct} onChange={e=>setTpPct(e.target.value)} style={{padding:"10px 12px",fontSize:13}}/>
            </div>
            <div className="fg" style={{marginBottom:0}}>
              <label className="lbl">Stop Loss %</label>
              <input className="inp" type="number" placeholder="e.g. 1" value={slPct} onChange={e=>setSlPct(e.target.value)} style={{padding:"10px 12px",fontSize:13}}/>
            </div>
          </div>

          {/* Calculation summary */}
          {mAmt>0&&(
            <div style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  ["Position Size","$"+posSize.toFixed(2),"var(--t1)"],
                  ["Quantity",qty.toFixed(6)+" "+sym,"var(--t2)"],
                  ["Entry Price","$"+fmtP(sym,lp),"var(--t1)"],
                  ["Liq. Price","$"+fmtP(sym,liqPrice),"var(--dn)"],
                  ["Take Profit",parseFloat(tpPct)>0?"$"+fmtP(sym,tpPrice):"—","var(--up)"],
                  ["Stop Loss",parseFloat(slPct)>0?"$"+fmtP(sym,slPrice):"—","var(--dn)"],
                ].map(([l,v,c])=>(
                  <div key={l}>
                    <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:2}}>{l}</div>
                    <div style={{fontFamily:"var(--m)",fontSize:12,fontWeight:700,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={placeOrder} style={{width:"100%",padding:"14px 0",borderRadius:14,border:"none",background:side==="LONG"?"linear-gradient(135deg,#00c896,#008f6a)":"linear-gradient(135deg,#ff3b5c,#c01535)",color:side==="LONG"?"#000":"#fff",fontWeight:800,fontSize:16,cursor:"pointer",opacity:1,transition:"all .2s",marginBottom:16,fontFamily:"var(--f)"}}>
            {side==="LONG"?"▲ Open Long":"▼ Open Short"} {lev}x
          </button>
        </div>

        {/* Open futures positions */}
        {futPos.length>0&&(
          <div style={{padding:"0 16px 14px"}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>Open Positions ({futPos.length})</div>
            {futPos.map(pos=>{
              const p=prices[pos.coin]??pos.entry;
              const pnl=pos.side==="LONG"?(p-pos.entry)*pos.qty*pos.leverage:(pos.entry-p)*pos.qty*pos.leverage;
              const pnlPct=(pnl/pos.margin)*100, pp=pnl>=0;
              return(
                <div key={pos.id} style={{background:"var(--ink3)",border:`1px solid ${pp?"rgba(0,200,150,.2)":"rgba(255,59,92,.2)"}`,borderRadius:14,padding:14,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <CoinIcon sym={pos.coin} size={28}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontWeight:800,fontSize:14}}>{pos.pair}</span>
                        <span className={`badge ${pos.side==="LONG"?"b-up":"b-dn"}`} style={{fontSize:10}}>{pos.side}</span>
                        <span className="badge b-au" style={{fontSize:10}}>{pos.leverage}x</span>
                      </div>
                      <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--m)",marginTop:1}}>Opened {pos.openTime}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"var(--m)",fontSize:16,fontWeight:900,color:pp?"var(--up)":"var(--dn)"}}>{pp?"+":""}{pnl.toFixed(2)}</div>
                      <div style={{fontSize:10,color:pp?"var(--up)":"var(--dn)",fontFamily:"var(--m)"}}>{pp?"+":""}{pnlPct.toFixed(2)}%</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                    {[["Entry","$"+fmtP(pos.coin,pos.entry),"var(--t1)"],["Current","$"+fmtP(pos.coin,p),"var(--t1)"],["Liq.","$"+fmtP(pos.coin,pos.liqPrice),"var(--dn)"],["Margin","$"+pos.margin.toFixed(2),"var(--t2)"]].map(([l,v,c])=>(
                      <div key={l} style={{background:"var(--ink2)",borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:2}}>{l}</div>
                        <div style={{fontSize:11,fontWeight:700,fontFamily:"var(--m)",color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {(pos.tp||pos.sl)&&(
                    <div style={{display:"flex",gap:8,marginBottom:12}}>
                      {pos.tp&&<div style={{flex:1,background:"rgba(0,200,150,.08)",border:"1px solid rgba(0,200,150,.15)",borderRadius:8,padding:"6px 10px",fontSize:11}}>
                        <span style={{color:"var(--t3)",marginRight:4}}>TP</span><span style={{color:"var(--up)",fontFamily:"var(--m)",fontWeight:700}}>${fmtP(pos.coin,pos.tp)}</span>
                      </div>}
                      {pos.sl&&<div style={{flex:1,background:"rgba(255,59,92,.08)",border:"1px solid rgba(255,59,92,.15)",borderRadius:8,padding:"6px 10px",fontSize:11}}>
                        <span style={{color:"var(--t3)",marginRight:4}}>SL</span><span style={{color:"var(--dn)",fontFamily:"var(--m)",fontWeight:700}}>${fmtP(pos.coin,pos.sl)}</span>
                      </div>}
                    </div>
                  )}
                  <button onClick={()=>closeFuture(pos.id,p,"CLOSED")} className="btn btn-ghost btn-sm btn-block" style={{border:"1px solid var(--ln2)"}}>Close Position at Market</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Futures history */}
        {futHistory.length>0&&(
          <div style={{padding:"0 16px 16px"}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>Futures History</div>
            <div className="card" style={{overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1.2fr .6fr .7fr .7fr .5fr .8fr",gap:4,padding:"9px 14px",borderBottom:"1px solid var(--ln)",background:"var(--ink4)"}}>
                {["Contract","Side","Entry","Exit","Lvg","PnL"].map((h,i)=>(
                  <div key={h} style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",textAlign:i>1?"right":"left"}}>{h}</div>
                ))}
              </div>
              {futHistory.slice(0,20).map((o,i)=>{
                const pp=o.pnl>=0;
                return(
                  <div key={o.id} style={{display:"grid",gridTemplateColumns:"1.2fr .6fr .7fr .7fr .5fr .8fr",gap:4,padding:"10px 14px",borderBottom:i<futHistory.length-1?"1px solid var(--ln)":"none",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <CoinIcon sym={o.coin} size={20}/>
                      <div><div style={{fontSize:11,fontWeight:700}}>{o.pair}</div><div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--m)"}}>{o.openTime}</div></div>
                    </div>
                    <div style={{textAlign:"right"}}><span className={`badge ${o.side==="LONG"?"b-up":"b-dn"}`} style={{fontSize:9,padding:"2px 5px"}}>{o.side}</span></div>
                    <div style={{textAlign:"right",fontFamily:"var(--m)",fontSize:10,color:"var(--t2)"}}>${fmtP(o.coin,o.entryPrice)}</div>
                    <div style={{textAlign:"right",fontFamily:"var(--m)",fontSize:10}}>${fmtP(o.coin,o.exitPrice)}</div>
                    <div style={{textAlign:"right",fontFamily:"var(--m)",fontSize:10,color:"var(--t2)"}}>{o.leverage}x</div>
                    <div style={{textAlign:"right",fontFamily:"var(--m)",fontSize:11,fontWeight:700,color:pp?"var(--up)":"var(--dn)"}}>
                      {pp?"+":""}{o.pnl?.toFixed(2)}
                      {o.status==="LIQUIDATED"&&<div style={{fontSize:9,color:"var(--dn)"}}>LIQ</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}