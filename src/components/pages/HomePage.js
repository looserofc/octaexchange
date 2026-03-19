import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { COINS, fmtP } from "@/lib/data";
import MiniChart  from "@/components/ui/MiniChart";
import CoinIcon   from "@/components/ui/CoinIcon";
import Logo       from "@/components/ui/Logo";
import TickerTape from "@/components/ui/TickerTape";

export default function HomePage({ setPage, goAssets, goProfile }) {
  const { user, prices, charts, banners, notifs, setProfileTab } = useStore();
  const unread = notifs.filter(n => !n.read).length;
  const top5   = Object.values(COINS).slice(0, 5);
  const [greet, setGreet] = useState("Good morning");

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12)      setGreet("Good morning");
    else if (h < 17)            setGreet("Good afternoon");
    else if (h < 21)            setGreet("Good evening");
    else                        setGreet("Good night");
  }, []);

  const fundBal  = user.fundingBalance  ?? 0;
  const tradeBal = user.tradingBalance  ?? 0;
  const total    = fundBal + tradeBal;
  const kycOk    = user.kycStatus === "approved";
  const freeze   = user.tradingFreezeUntil ?? 0;
  const frozen   = Date.now() < freeze;
  const fdays    = frozen ? Math.ceil((freeze - Date.now()) / 86400000) : 0;

  // top 3 coins for price cards
  const top3 = ["BTC","ETH","SOL"];

  return (
    <div style={{ background:"var(--ink)", minHeight:"100%" }}>

      {/* Header */}
      <div className="hdr">
        <Logo/>
        <div style={{ marginLeft:"auto", display:"flex", gap:10, alignItems:"center" }}>
          <button style={{ position:"relative", color:"var(--t2)", display:"flex", padding:4 }}
            onClick={() => { setProfileTab("notifs"); setPage("profile"); }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            {unread > 0 && <span className="ndot"/>}
          </button>
          <button onClick={() => setPage("profile")}
            style={{ width:36, height:36, borderRadius:12, background:"linear-gradient(135deg,var(--gold),#c07800)", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize:13, boxShadow:"0 4px 12px rgba(240,165,0,.3)" }}>
            {user.avatar}
          </button>
        </div>
      </div>

      <TickerTape/>

      <div style={{ padding:"0 16px" }}>

        {/* KYC banner */}
        {!kycOk && (
          <div style={{ background:"rgba(255,59,92,.08)", border:"1px solid rgba(255,59,92,.2)", borderRadius:14, padding:"12px 16px", display:"flex", gap:12, alignItems:"center", marginTop:14 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>Identity Unverified</div>
              <div style={{ fontSize:11, color:"var(--t2)", marginTop:1 }}>Complete KYC to deposit & withdraw</div>
            </div>
            <button className="btn btn-gold btn-sm" style={{ fontSize:11, flexShrink:0 }}
              onClick={() => { setProfileTab("account"); setPage("profile"); }}>Verify →</button>
          </div>
        )}

        {/* Banners */}
        {banners.filter(b => b.active).map((b, i) => (
          <div key={b.id} style={{ background:`linear-gradient(135deg,${b.color}18,${b.color}06)`, border:`1px solid ${b.color}30`, borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, marginTop:12 }}>
            <span style={{ fontSize:18 }}>📢</span>
            <div>
              <div style={{ fontWeight:700, fontSize:13 }}>{b.title}</div>
              <div style={{ fontSize:11, color:"var(--t2)", marginTop:1 }}>{b.text}</div>
            </div>
          </div>
        ))}

        {/* Total Balance Card */}
        <div style={{ background:"linear-gradient(145deg,#0d1b2e,#081424)", border:"1px solid rgba(255,255,255,.06)", borderRadius:20, padding:"24px 20px 20px", marginTop:14, position:"relative", overflow:"hidden" }}>
          {/* glow */}
          <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle,rgba(240,165,0,.08),transparent 70%)", pointerEvents:"none" }}/>
          <div style={{ fontSize:11, color:"var(--t3)", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"var(--m)", marginBottom:8 }}>Total Balance</div>
          <div style={{ fontSize:36, fontWeight:900, fontFamily:"var(--m)", letterSpacing:"-1.5px", marginBottom:4 }}>
            {total.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}
          </div>
          <div style={{ fontSize:13, color:"var(--t3)", marginBottom:20 }}>USDT</div>

          {/* Quick action buttons */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[
              { icon:"⬇️", label:"Deposit",  action:() => goAssets("deposit")  },
              { icon:"⬆️", label:"Withdraw", action:() => goAssets("withdraw") },
              { icon:"↔️", label:"Transfer", action:() => goAssets("transfer") },
              { icon:"💬", label:"Support",  action:() => goProfile("support") },
            ].map(({ icon, label, action }) => (
              <button key={label} onClick={action}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:"12px 6px", cursor:"pointer", transition:"all .2s" }}>
                <span style={{ fontSize:20 }}>{icon}</span>
                <span style={{ fontSize:11, fontWeight:600, color:"var(--t2)" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Freeze warning */}
        {frozen && (
          <div style={{ background:"rgba(240,165,0,.08)", border:"1px solid rgba(240,165,0,.2)", borderRadius:12, padding:"10px 14px", marginTop:12, fontSize:12, color:"var(--gold)" }}>
            🔒 Trading account frozen for {fdays} more day{fdays !== 1 ? "s" : ""}
          </div>
        )}

        {/* Price Cards Row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:14 }}>
          {top3.map(sym => {
            const coin  = COINS[sym];
            const price = prices[sym] ?? coin.price;
            const up    = coin.change >= 0;
            return (
              <div key={sym} onClick={() => setPage("market")}
                style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:"12px 12px 10px", cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontWeight:700, fontSize:13 }}>{sym}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:up?"var(--up)":"var(--dn)", fontFamily:"var(--m)" }}>{up?"+":""}{coin.change.toFixed(2)}%</span>
                </div>
                <div style={{ fontFamily:"var(--m)", fontSize:13, fontWeight:700, marginBottom:4 }}>
                  ${fmtP(sym, price)}
                </div>
                <MiniChart data={charts[sym] ?? []} up={up} w={80} h={28} id={"home_"+sym}/>
              </div>
            );
          })}
        </div>

        {/* Signal CTA */}
        <div onClick={() => setPage("trade")}
          style={{ background:"linear-gradient(135deg,rgba(240,165,0,.1),rgba(192,120,0,.04))", border:"1px solid rgba(240,165,0,.25)", borderRadius:16, padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", marginTop:14 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:3 }}>⚡ Copy Trading</div>
            <div style={{ fontSize:12, color:"var(--t2)" }}>Enter signal code to start earning</div>
          </div>
          <div style={{ background:"linear-gradient(135deg,var(--gold),#c07800)", borderRadius:10, padding:"10px 16px", color:"#000", fontWeight:800, fontSize:13, flexShrink:0 }}>Trade →</div>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginTop:14 }}>
          {[
            { label:"Funding", value:"$"+fundBal.toLocaleString("en-US",{minimumFractionDigits:2}), sub:"Available balance", color:"var(--blue)", action:() => setPage("assets") },
            { label:"Trading", value:"$"+tradeBal.toLocaleString("en-US",{minimumFractionDigits:2}), sub: frozen?`🔒 ${fdays}d frozen`:"Ready to trade", color:"var(--up)", action:() => setPage("assets") },
          ].map(s => (
            <div key={s.label} onClick={s.action}
              style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:"14px 14px", cursor:"pointer" }}>
              <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:6, letterSpacing:".8px" }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize:18, fontWeight:900, fontFamily:"var(--m)", color:s.color, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:11, color:"var(--t3)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Market section */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:20, marginBottom:10 }}>
          <span style={{ fontSize:17, fontWeight:800 }}>Market</span>
          <span style={{ fontSize:12, color:"var(--gold)", cursor:"pointer", fontWeight:600 }} onClick={() => setPage("market")}>All &gt;</span>
        </div>

        {top5.map((coin, i) => {
          const price = prices[coin.sym] ?? coin.price;
          const up    = coin.change >= 0;
          return (
            <div key={coin.sym} onClick={() => setPage("market")}
              style={{ display:"flex", alignItems:"center", padding:"12px 0", borderBottom:"1px solid var(--ln)", cursor:"pointer" }}>
              <CoinIcon sym={coin.sym} size={40}/>
              <div style={{ flex:1, marginLeft:12 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{coin.sym}/USDT</div>
                <div style={{ fontSize:11, color:"var(--t3)", marginTop:2 }}>Vol {coin.vol}</div>
              </div>
              <div style={{ marginRight:12 }}>
                <MiniChart data={charts[coin.sym] ?? []} up={up} w={68} h={32} id={"mkt_"+coin.sym}/>
              </div>
              <div style={{ textAlign:"right", minWidth:80 }}>
                <div style={{ fontFamily:"var(--m)", fontSize:13, fontWeight:700 }}>${fmtP(coin.sym, price)}</div>
                <div style={{ fontSize:11, color:up?"var(--up)":"var(--dn)", fontWeight:700, marginTop:2 }}>{up?"+":""}{coin.change.toFixed(3)}%</div>
              </div>
            </div>
          );
        })}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}