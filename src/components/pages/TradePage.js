import { useState, useCallback, useEffect } from "react";
import { useStore } from "@/lib/store";
import { COINS, fmtP } from "@/lib/data";
import CoinIcon   from "@/components/ui/CoinIcon";
import Countdown  from "@/components/ui/Countdown";
import dynamic    from "next/dynamic";

const FuturesPage = dynamic(() => import("./FuturesPage"), { ssr: false });

function CopyTradeContent({ setPage }) {
  const{user,prices,activeTrades,removeTrade,orderHistory,addOrder,addToast,addTx,setUser,submitSignalCode,loadActiveTrades}=useStore();
  const[code,setCode]=useState(""),[busy,setBusy]=useState(false),[err,setErr]=useState(""),[ok,setOk]=useState("");
  const[htab,setHtab]=useState("open");
  const tradeBal=user?.tradingBalance??0;

  useEffect(() => {
    loadActiveTrades();
  }, [loadActiveTrades]);

  const submit=async()=>{
    const c=code.trim().toUpperCase();
    setErr("");setOk("");
    if(!c){setErr("Enter a signal code.");return;}
    if(tradeBal<=0){setErr("Transfer funds to Trading Account first.");return;}
    setBusy(true);
    const result=await submitSignalCode(c);
    setBusy(false);
    if(!result.success){setErr(result.message||"Invalid or expired signal code.");return;}
    const order=result.order;
    setOk(`${order.direction} signal confirmed — +$${order.profitAmount?.toFixed(2)} in 5 minutes`);
    setCode("");
  };

  const complete=useCallback(id=>{
    const t=activeTrades.find(x=>x.id===id);if(!t)return;
    const exit=prices[t.coin]??COINS[t.coin]?.price??0;
    setUser({...user,tradingBalance:(user.tradingBalance||0)+t.profit,totalProfit:(user.totalProfit||0)+t.profit,totalTrades:(user.totalTrades||0)+1});
    addOrder({id:t.id,pair:t.pair,coin:t.coin,type:"Copy Trade",side:t.side||"BUY",code:t.code,entryPrice:t.entry,exitPrice:exit,qty:t.qty||0,leverage:1,margin:0,pnl:t.profit,pnlPct:1.0,status:"CLOSED",openTime:t.openTime,closeTime:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})});
    removeTrade(id);
    addTx({id:"tx"+Date.now(),type:"trade_profit",wallet:"trading",amount:t.profit,fee:0,net:t.profit,coin:t.pair,status:"completed",date:new Date().toLocaleDateString()});
    addToast(`+$${t.profit.toFixed(2)} added to Trading Account`,"ok");
  },[activeTrades,prices,user,setUser,addOrder,removeTrade,addTx,addToast]);

  const copyOrders=orderHistory.filter(o=>o.type==="Copy Trade");

  return(
    <div>
      <div style={{padding:"12px 16px 0"}}>
        <div style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:3,letterSpacing:".8px"}}>TRADING ACCOUNT</div>
            <div style={{fontSize:22,fontWeight:900,fontFamily:"var(--m)",color:"var(--up)"}}>${tradeBal.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
          </div>
          {tradeBal<=0&&<button className="btn btn-gold btn-sm" onClick={()=>setPage("assets")}>Transfer Funds →</button>}
        </div>
      </div>

      <div style={{padding:"0 16px"}}>
        <div className="card" style={{padding:20,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,rgba(240,165,0,.15),rgba(240,165,0,.05))",border:"1px solid rgba(240,165,0,.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            {/* ── No WhatsApp/Telegram hint shown to users ── */}
            <div>
              <div style={{fontWeight:800,fontSize:16}}>Enter Signal Code</div>
              <div style={{fontSize:12,color:"var(--t2)",marginTop:1}}>Paste your signal code below</div>
            </div>
          </div>

          <input
            className="inp"
            style={{fontFamily:"var(--m)",letterSpacing:3,textTransform:"uppercase",fontSize:18,fontWeight:700,textAlign:"center",marginBottom:12,borderColor:err?"var(--dn)":""}}
            placeholder="E.G.  A3F9C12B"
            value={code}
            onChange={e=>{setCode(e.target.value.toUpperCase());setErr("");setOk("");}}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            autoComplete="off"
          />

          {err&&<div style={{background:"rgba(255,59,92,.08)",border:"1px solid rgba(255,59,92,.2)",borderRadius:10,padding:"10px 14px",marginBottom:12,color:"var(--dn)",fontSize:13}}>{err}</div>}
          {ok&&<div style={{background:"rgba(0,200,150,.08)",border:"1px solid rgba(0,200,150,.2)",borderRadius:10,padding:"10px 14px",marginBottom:12,color:"var(--up)",fontSize:13}}>{ok}</div>}

          <button className="btn btn-gold btn-block" style={{fontSize:15}} onClick={submit} disabled={busy||!code.trim()}>
            {busy?<><span className="spin"/>Validating...</>:"Submit Signal Code"}
          </button>
        </div>

        {activeTrades.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontWeight:800,fontSize:16,letterSpacing:"-.3px",marginBottom:12}}>Open Positions</div>
            {activeTrades.map(t=>{
              const coinSym=t.coin?.replace("USDT","")||t.coin;
              const p=prices[coinSym]??COINS[coinSym]?.price??0;
              return(
                <div key={t.id} className="card2" style={{padding:16,marginBottom:10,borderColor:"rgba(45,156,255,.2)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <CoinIcon sym={coinSym} size={32}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontWeight:800,fontSize:15}}>{t.pair||t.coin}</span>
                        <span className={`badge ${t.side==="BUY"||t.side==="LONG"?"b-up":"b-dn"}`} style={{fontSize:10}}>{t.side}</span>
                        <span className="badge b-dim" style={{fontSize:10}}>Copy</span>
                      </div>
                      <div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--m)",marginTop:2}}>Code: {t.code}</div>
                    </div>
                    <Countdown totalSeconds={300} onDone={()=>complete(t.id)} expiresAt={t.expiresAt}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {[["ENTRY","$"+fmtP(coinSym,t.entry),"var(--t2)"],["CURRENT","$"+fmtP(coinSym,p),"var(--t1)"],["EST. PNL","+$"+(t.profit||0).toFixed(2),"var(--up)"]].map(([l,v,c])=>(
                      <div key={l} style={{background:"var(--ink2)",borderRadius:10,padding:"10px 12px"}}>
                        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:3}}>{l}</div>
                        <div style={{fontFamily:"var(--m)",fontSize:13,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="seg" style={{marginBottom:14}}>
          <button className={`seg-btn${htab==="open"?" on":""}`} onClick={()=>setHtab("open")}>Open ({activeTrades.length})</button>
          <button className={`seg-btn${htab==="history"?" on":""}`} onClick={()=>setHtab("history")}>History ({copyOrders.length})</button>
        </div>

        {htab==="history"&&(
          <div className="card" style={{overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1.2fr .6fr .8fr .8fr .7fr .7fr",gap:4,padding:"9px 14px",borderBottom:"1px solid var(--ln)",background:"var(--ink4)"}}>
              {["Contract","Side","Entry","Exit","PnL","Status"].map((h,i)=><div key={h} style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",letterSpacing:".5px",textAlign:i>1?"right":"left"}}>{h}</div>)}
            </div>
            {copyOrders.length===0
              ?<div className="empty" style={{padding:"32px 16px"}}><div className="ei">📋</div><p style={{fontSize:13}}>No closed trades yet</p></div>
              :copyOrders.slice(0,30).map((o,i)=>{
                const pp=o.pnl>=0;
                const coinSym=o.coin?.replace("USDT","")||o.coin;
                return(
                  <div key={o.id} style={{display:"grid",gridTemplateColumns:"1.2fr .6fr .8fr .8fr .7fr .7fr",gap:4,padding:"11px 14px",borderBottom:i<copyOrders.length-1?"1px solid var(--ln)":"none",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <CoinIcon sym={coinSym} size={22}/>
                      <div><div style={{fontSize:12,fontWeight:700}}>{o.pair}</div><div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)"}}>{o.openTime}</div></div>
                    </div>
                    <div style={{textAlign:"right"}}><span className={`badge ${o.side==="BUY"||o.side==="LONG"?"b-up":"b-dn"}`} style={{fontSize:9,padding:"2px 6px"}}>{o.side}</span></div>
                    <div style={{textAlign:"right",fontFamily:"var(--m)",fontSize:11,color:"var(--t2)"}}>${fmtP(coinSym,o.entryPrice)}</div>
                    <div style={{textAlign:"right",fontFamily:"var(--m)",fontSize:11}}>${fmtP(coinSym,o.exitPrice)}</div>
                    <div style={{textAlign:"right",fontFamily:"var(--m)",fontSize:12,fontWeight:700,color:pp?"var(--up)":"var(--dn)"}}>{pp?"+":""}{o.pnl?.toFixed(2)}<div style={{fontSize:9,opacity:.7}}>{pp?"+":""}{o.pnlPct?.toFixed(1)}%</div></div>
                    <div style={{textAlign:"right"}}><span className={`badge ${o.status==="CLOSED"?"b-dim":"b-dn"}`} style={{fontSize:9,padding:"2px 6px"}}>{o.status}</span></div>
                  </div>
                );
              })
            }
          </div>
        )}

        {htab==="open"&&activeTrades.length===0&&(
          <div className="empty"><div className="ei">⚡</div><p style={{fontSize:13}}>No open trades.<br/>Enter a signal code above.</p></div>
        )}
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

export default function TradePage({ setPage }) {
  const { tradeTab, setTradeTab } = useStore();
  const [activeTab, setActiveTab] = useState("copy");

  useEffect(()=>{
    if(tradeTab&&tradeTab!==activeTab){setActiveTab(tradeTab);setTradeTab("copy");}
  },[tradeTab]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="hdr">
        <span style={{fontSize:18,fontWeight:800,letterSpacing:"-.4px"}}>Trade</span>
        {activeTab==="copy"&&<span className="badge b-bl" style={{marginLeft:"auto",fontSize:11}}>Copy Trade</span>}
        {activeTab==="futures"&&<span className="badge b-pu" style={{marginLeft:"auto",fontSize:11}}>Futures</span>}
      </div>
      <div style={{padding:"0 16px",flexShrink:0}}>
        <div className="seg" style={{margin:"10px 0 0"}}>
          <button className={`seg-btn${activeTab==="copy"?" on":""}`} onClick={()=>setActiveTab("copy")}>⚡ Copy Trade</button>
          <button className={`seg-btn${activeTab==="futures"?" on":""}`} onClick={()=>setActiveTab("futures")}>📈 Futures</button>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto"}}>
        {activeTab==="copy"   &&<CopyTradeContent setPage={setPage}/>}
        {activeTab==="futures"&&<FuturesPage setPage={setPage}/>}
      </div>
    </div>
  );
}