import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { COINS, fmtP } from "@/lib/data";
import MiniChart  from "@/components/ui/MiniChart";
import CoinIcon   from "@/components/ui/CoinIcon";
import Logo       from "@/components/ui/Logo";
import TickerTape from "@/components/ui/TickerTape";

function Spark({ data, color = "var(--up)" }) {
  if (!data || data.length < 2) return null;
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1,W=200,H=44;
  const pts=data.map((v,i)=>`${((i/(data.length-1))*W).toFixed(1)},${(H-4-((v-min)/range)*(H-8)).toFixed(1)}`).join(" ");
  const fill=`0,${H} ${pts} ${W},${H}`;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H,display:"block"}} preserveAspectRatio="none">
      <defs><linearGradient id="hsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={fill} fill="url(#hsg)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function useProfitHist(total) {
  const pts=[]; let v=0;
  for(let i=0;i<14;i++){v=Math.max(0,v+Math.random()*(total/10)+(total/30));pts.push(parseFloat(v.toFixed(2)));}
  pts[pts.length-1]=total; return pts;
}

export default function HomePage({ setPage }) {
  const { user, prices, charts, banners, notifs, setProfileTab } = useStore();
  const unread  = notifs.filter(n=>!n.read).length;

  // Navigation helpers — setPage is the navigate function from App.js
  const goDeposit  = () => { setPage("assets", { tab:"deposit"  }); };
  const goWithdraw = () => { setPage("assets", { tab:"withdraw" }); };
  const goTransfer = () => { setPage("assets", { tab:"transfer" }); };
  const goSupport  = () => { setPage("profile", { screen:"support" }); };
  const goCopyTrade = () => { setPage("trade"); };
  const goFutures   = () => { setPage("futures"); };
  const goAssets    = () => { setPage("assets"); };
  const goProfile   = () => { setPage("profile"); };

  const top5    = Object.values(COINS).slice(0,5);
  const ppts    = useProfitHist(user.totalProfit??84.20);
  const[greet,setGreet]=useState("Good morning");
  useEffect(()=>{const h=new Date().getHours();if(h>=5&&h<12)setGreet("Good morning");else if(h<17)setGreet("Good afternoon");else if(h<21)setGreet("Good evening");else setGreet("Good night");},[]);

  const fundBal  = user.fundingBalance  ?? 0;
  const tradeBal = user.tradingBalance  ?? 0;
  const freeze   = user.tradingFreezeUntil ?? 0;
  const frozen   = Date.now() < freeze;
  const fdays    = frozen ? Math.ceil((freeze-Date.now())/86400000) : 0;
  const kycOk    = user.kycStatus==="approved";

  return(
    <div>
      <div className="hdr">
        <Logo/>
        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          <button style={{position:"relative",color:"var(--t2)",display:"flex",padding:4}} onClick={()=>{setProfileTab("notifs");setPage("profile");}}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            {unread>0&&<span className="ndot"/>}
          </button>
          <button onClick={()=>setPage("profile")} style={{width:36,height:36,borderRadius:12,background:"linear-gradient(135deg,var(--gold),#c07800)",display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontWeight:900,fontSize:13,boxShadow:"0 4px 12px rgba(240,165,0,.3)"}}>
            {user.avatar}
          </button>
        </div>
      </div>

      <TickerTape/>

      <div style={{padding:"0 0 8px"}}>
        {/* KYC warning */}
        {!kycOk&&(
          <div className="au" style={{margin:"14px 16px 0"}}>
            <div style={{background:"rgba(255,59,92,.08)",border:"1px solid rgba(255,59,92,.2)",borderRadius:14,padding:"12px 16px",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:22,flexShrink:0}}>🔐</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:13,marginBottom:2}}>KYC Required</div>
                <div style={{fontSize:12,color:"var(--t2)"}}>Complete identity verification before depositing or withdrawing.</div>
              </div>
              <button className="btn btn-gold btn-sm" style={{fontSize:11,flexShrink:0}} onClick={()=>{setProfileTab("account");setPage("profile");}}>Verify →</button>
            </div>
          </div>
        )}

        {/* Banners */}
        {banners.filter(b=>b.active).map((b,i)=>(
          <div key={b.id} className={`au d${i+1}`} style={{margin:"12px 16px 0"}}>
            <div style={{background:`linear-gradient(135deg,${b.color}18,${b.color}06)`,border:`1px solid ${b.color}30`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:18,flexShrink:0}}>📢</span>
              <div><div style={{fontWeight:800,fontSize:13,marginBottom:2}}>{b.title}</div><div style={{fontSize:12,color:"var(--t2)"}}>{b.text}</div></div>
            </div>
          </div>
        ))}

        {/* Dual wallet */}
        <div style={{padding:"14px 16px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div className="wf" style={{padding:16}}>
            <div style={{fontSize:9,color:"var(--blue2)",fontFamily:"var(--m)",letterSpacing:"1px",marginBottom:5}}>FUNDING</div>
            <div style={{fontSize:20,fontWeight:900,fontFamily:"var(--m)",letterSpacing:"-1px"}}>${fundBal.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            <div style={{fontSize:10,color:"var(--t3)",marginTop:3}}>5% withdrawal fee</div>

          </div>
          <div className="wt" style={{padding:16}}>
            <div style={{fontSize:9,color:"var(--up2)",fontFamily:"var(--m)",letterSpacing:"1px",marginBottom:5}}>TRADING</div>
            <div style={{fontSize:20,fontWeight:900,fontFamily:"var(--m)",letterSpacing:"-1px"}}>${tradeBal.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            <div style={{fontSize:10,color:frozen?"var(--gold)":"var(--t3)",marginTop:3}}>{frozen?`🔒 ${fdays}d freeze`:"25% exit fee"}</div>

          </div>
        </div>

        {/* Quick Actions */}
        <div style={{padding:"10px 16px 0",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {[
            {emoji:"⬇️",label:"Deposit",  color:"#2d9cff", go:goDeposit},
            {emoji:"⬆️",label:"Withdraw", color:"#ff3b5c", go:goWithdraw},
            {emoji:"↔️",label:"Transfer", color:"#00c896", go:goTransfer},
            {emoji:"💬",label:"Support",  color:"#a855f7", go:goSupport},
          ].map(btn=>(
            <button key={btn.label} onClick={btn.go}
              style={{padding:"13px 4px",borderRadius:14,border:"1.5px solid var(--ln)",background:"var(--ink3)",color:"var(--t2)",fontFamily:"var(--f)",fontWeight:700,fontSize:11,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all .18s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=btn.color;e.currentTarget.style.color=btn.color;e.currentTarget.style.background=btn.color+"14";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--ln)";e.currentTarget.style.color="var(--t2)";e.currentTarget.style.background="var(--ink3)";}}
            >
              <span style={{fontSize:22}}>{btn.emoji}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Hero balance + sparkline */}
        <div style={{padding:"12px 16px 0"}}>
          <div className="hero au" style={{padding:"18px 20px 0"}}>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{fontSize:11,color:"var(--t2)",marginBottom:4}}>{greet}, <strong style={{color:"var(--t1)"}}>{user.name?.split(" ")[0]}</strong> 👋</div>
              <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",letterSpacing:"1.5px",marginBottom:4,textTransform:"uppercase"}}>Total Portfolio</div>
              <div style={{fontSize:34,fontWeight:900,fontFamily:"var(--m)",letterSpacing:"-1.5px",lineHeight:1}}>${(fundBal+tradeBal).toLocaleString("en-US",{minimumFractionDigits:2})}</div>
              <div style={{marginTop:8,marginBottom:16,display:"flex",gap:8,flexWrap:"wrap"}}>
                <span className="badge b-up" style={{fontSize:12}}>▲ +${user.totalProfit?.toFixed(2)??0} profit</span>
                <span className="badge b-au" style={{fontSize:11}}>{user.tier?.name} · +${user.tier?.profit??0}/trade</span>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <button className="btn btn-gold" style={{flex:1,padding:"10px 0",fontSize:12}} onClick={goCopyTrade}>⚡ Copy Trade</button>
                <button className="btn btn-outline" style={{flex:1,padding:"10px 0",fontSize:12}} onClick={goFutures}>📈 Futures</button>
                <button className="btn btn-ghost" style={{flex:1,padding:"10px 0",fontSize:12}} onClick={goAssets}>💳 Wallet</button>
              </div>
              <div style={{marginLeft:-20,marginRight:-20,opacity:.7}}><Spark data={ppts}/></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{padding:"14px 16px 0"}}>
          <div className="sx">
            {[{label:"Trades",value:user.totalTrades??42,color:"var(--blue)",icon:"⚡",go:goCopyTrade},{label:"Profit",value:"$"+(user.totalProfit??84.20).toFixed(2),color:"var(--up)",icon:"💰",go:goCopyTrade},{label:"Team",value:user.referralCount??0,color:"var(--pu)",icon:"👥",go:goProfile},{label:"Tier",value:user.tier?.name??"No Tier",color:"var(--gold)",icon:"🏆",go:goDeposit}].map(s=>(
              <div key={s.label} className="sp" style={{minWidth:110,cursor:"pointer"}} onClick={s.go}>
                <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
                <div style={{fontFamily:"var(--m)",fontSize:16,fontWeight:700,color:s.color}}>{s.value}</div>
                <div style={{fontSize:10,color:"var(--t3)",marginTop:2,fontFamily:"var(--m)"}}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Signal CTA */}
        <div style={{padding:"14px 16px 0"}}>
          <div onClick={goCopyTrade} style={{background:"linear-gradient(135deg,rgba(240,165,0,.1),rgba(192,120,0,.04))",border:"1px solid rgba(240,165,0,.2)",borderRadius:18,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",transition:"all .2s"}}>
            <div><div style={{fontWeight:800,fontSize:15,marginBottom:3}}>⚡ Enter Signal Code</div><div style={{fontSize:12,color:"var(--t2)"}}>Paste your code from WhatsApp group</div></div>
            <div style={{background:"linear-gradient(135deg,var(--gold),#c07800)",borderRadius:12,padding:"10px 18px",color:"#000",fontWeight:800,fontSize:13,flexShrink:0}}>Trade →</div>
          </div>
        </div>

        {/* Referral */}
        <div style={{padding:"14px 16px 0"}}>
          <div style={{background:"linear-gradient(135deg,rgba(240,165,0,.08),rgba(240,165,0,.03))",border:"1px solid rgba(240,165,0,.2)",borderRadius:16,padding:"14px 16px"}} className="au d3">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div><div style={{fontWeight:800,fontSize:14}}>🎁 Refer & Earn</div><div style={{fontSize:12,color:"var(--t2)",marginTop:2}}>Invite friends, earn $5 per referral</div></div>
              <span className="badge b-au" style={{fontSize:11}}>{user.referrals?.length??0} referred</span>
            </div>
            <div style={{background:"var(--ink2)",border:"1px solid var(--ln2)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"var(--m)",fontSize:12,color:"var(--t2)",letterSpacing:1}}>REF: <strong style={{color:"var(--gold)"}}>{user.referralCode??"NXT00000"}</strong></span>
              <button className="btn btn-gold btn-sm" style={{fontSize:11,padding:"6px 12px"}} onClick={()=>{navigator.clipboard?.writeText(user.referralCode??"NXT00000");useStore.getState().addToast("Referral code copied!","ok");}}>📋 Copy</button>
            </div>
          </div>
        </div>

        {/* Market preview */}
        <div style={{padding:"20px 16px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:17,fontWeight:800,letterSpacing:"-.3px"}}>Markets</span>
          <span style={{fontSize:12,color:"var(--gold)",cursor:"pointer",fontWeight:600}} onClick={()=>setPage("market")}>View All →</span>
        </div>

        {top5.map((coin,i)=>{
          const price=prices[coin.sym]??coin.price, up=coin.change>=0;
          return(
            <div key={coin.sym} className={`au d${Math.min(i+1,6)}`} onClick={()=>setPage("market")} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid var(--ln)",cursor:"pointer",transition:"background .15s",minWidth:0}}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.02)")}
              onMouseLeave={e=>(e.currentTarget.style.background="")}>
              <div style={{flexShrink:0}}><CoinIcon sym={coin.sym} size={40}/></div>
              <div style={{flex:1,marginLeft:12,minWidth:0,overflow:"hidden"}}>
                <div style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap"}}>{coin.sym}<span style={{color:"var(--t3)",fontWeight:500}}>/USDT</span></div>
                <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>{coin.name}</div>
              </div>
              <div style={{flexShrink:0,marginLeft:8}}><MiniChart data={charts[coin.sym]??[]} up={up} w={68} h={32} id={coin.sym}/></div>
              <div style={{textAlign:"right",marginLeft:10,flexShrink:0,minWidth:80}}>
                <div style={{fontFamily:"var(--m)",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>${fmtP(coin.sym,price)}</div>
                <span className={`badge ${up?"b-up":"b-dn"}`} style={{marginTop:4,fontSize:10}}>{up?"+":""}{coin.change.toFixed(2)}%</span>
              </div>
            </div>
          );
        })}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}