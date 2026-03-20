import { create } from "zustand";
import { COINS, SIGNALS_INIT, ORDER_HISTORY_INIT, TX_INIT, NOTIFS_INIT, BANNERS_INIT, FUND_WD_FEE, TRADE_OUT_FEE, FREEZE_MS } from "./data";

const GID = {BTC:"bitcoin",ETH:"ethereum",BNB:"binancecoin",SOL:"solana",XRP:"ripple",ADA:"cardano",DOGE:"dogecoin",AVAX:"avalanche-2",DOT:"polkadot",MATIC:"matic-network"};

function buildCharts() {
  const o={};
  Object.keys(COINS).forEach(sym=>{
    const base=COINS[sym].price, dir=COINS[sym].change>=0?1:-1;
    let v=base*.986; const pts=[];
    for(let i=0;i<80;i++){v=Math.max(base*.95,Math.min(base*1.05,v+(Math.random()-.48)*base*.004+dir*base*.0002));pts.push(v);}
    pts.push(base); o[sym]=pts;
  });
  return o;
}

function buildCandles(sym) {
  const base=COINS[sym].price, dir=COINS[sym].change>=0?1:-1;
  const out=[]; let price=base*.985;
  for(let i=0;i<60;i++){
    const o2=price, mv=(Math.random()-.46+dir*.04)*base*.008;
    const c=Math.max(base*.92,Math.min(base*1.08,o2+mv));
    const h=Math.max(o2,c)+Math.random()*base*.003, l=Math.min(o2,c)-Math.random()*base*.003;
    out.push({t:Date.now()-(60-i)*60000,o:o2,h,l,c}); price=c;
  }
  return out;
}

function buildPrices(){const p={};Object.keys(COINS).forEach(k=>{p[k]=COINS[k].price;});return p;}

export const useStore = create((set,get)=>({
  user:null, setUser:(u)=>set({user:u}), logout:()=>set({user:null}),
  page:"home", setPage:(p)=>set({page:p}),
  assetsTab:"overview", setAssetsTab:(t)=>set({assetsTab:t}),
  tradeTab:"copy",       setTradeTab:(t)=>set({tradeTab:t}),
  profileTab:"account", setProfileTab:(t)=>set({profileTab:t}),
  profileScreen:null,   setProfileScreen:(s)=>set({profileScreen:s}),
  adminAuthed:false, setAdminAuthed:(v)=>set({adminAuthed:v}),
  adminRole:null,    setAdminRole:(r)=>set({adminRole:r}),
  showAdmin:false,   setShowAdmin:(v)=>set({showAdmin:v}),

  prices:buildPrices(),
  charts:buildCharts(),
  candles:(()=>{const c={};Object.keys(COINS).forEach(k=>{c[k]=buildCandles(k);});return c;})(),
  _ct:{}, // candle tick counters per sym

  wick:null, setWick:(w)=>set({wick:w}),

  fetchRealPrices:async()=>{
    try{
      const ids=Object.values(GID).join(",");
      const r=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,{cache:"no-store"});
      if(!r.ok)return;
      const data=await r.json();
      const np={...get().prices};
      Object.entries(GID).forEach(([sym,id])=>{if(data[id]?.usd)np[sym]=data[id].usd;});
      set({prices:np});
    }catch(_){}
  },

  tickPrices:()=>{
    set(state=>{
      const np={...state.prices}, nc={...state.charts}, nk={...state.candles};
      const wick=state.wick, nct={...state._ct};
      let nextWick=wick;

      Object.keys(COINS).forEach(sym=>{
        const base=COINS[sym].price;

        // ── Wick animation ────────────────────────
        if(wick&&wick.sym===sym){
          const elapsed=Date.now()-wick.startAt, half=wick.durationMs/2;
          if(elapsed<wick.durationMs){
            if(elapsed<half){const pct=elapsed/half;np[sym]=wick.startPrice+(wick.targetPrice-wick.startPrice)*pct;}
            else{const pct=(elapsed-half)/half;np[sym]=wick.targetPrice+(wick.startPrice-wick.targetPrice)*pct;}
          }else{np[sym]=wick.startPrice;nextWick=null;}
        }else{
          const drift=(Math.random()-.485)*.003;
          np[sym]=Math.max(base*.85,Math.min(base*1.15,(np[sym]||base)*(1+drift)));
        }

        // ── Sparkline ─────────────────────────────
        const arr=[...(nc[sym]||[]).slice(1)]; arr.push(np[sym]); nc[sym]=arr;

        // ── OHLC candles ──────────────────────────
        const canArr=[...(nk[sym]||[])];
        if(canArr.length>0){
          const last={...canArr[canArr.length-1]};
          last.c=np[sym]; last.h=Math.max(last.h,np[sym]); last.l=Math.min(last.l,np[sym]);
          // Inject wick extremes into candle so it shows on chart
          if(wick&&wick.sym===sym){last.h=Math.max(last.h,wick.targetPrice);last.l=Math.min(last.l,wick.targetPrice);}
          canArr[canArr.length-1]=last;
          // New candle every 30 ticks
          nct[sym]=(nct[sym]||0)+1;
          if(nct[sym]>=30){
            canArr.push({t:Date.now(),o:np[sym],h:np[sym],l:np[sym],c:np[sym]});
            if(canArr.length>120)canArr.shift();
            nct[sym]=0;
          }
          nk[sym]=canArr;
        }
      });
      return{prices:np,charts:nc,candles:nk,wick:nextWick,_ct:nct};
    });
  },

  signals:{...SIGNALS_INIT},
  addSignal:(code,data)=>set(s=>({signals:{...s.signals,[code]:data}})),

  activeTrades:[],
  addTrade:(t)=>set(s=>({activeTrades:[...s.activeTrades,t]})),
  removeTrade:(id)=>set(s=>({activeTrades:s.activeTrades.filter(t=>t.id!==id)})),

  futPos:[],
  openFuture:(pos)=>set(s=>({futPos:[...s.futPos,pos]})),
  closeFuture:(id,exitPrice,reason="CLOSED")=>{
    const{futPos,user,setUser,orderHistory,addToast}=get();
    const pos=futPos.find(p=>p.id===id); if(!pos)return;
    const pnl=pos.side==="LONG"?(exitPrice-pos.entry)*pos.qty*pos.leverage:(pos.entry-exitPrice)*pos.qty*pos.leverage;
    const pnlPct=(pnl/pos.margin)*100;
    if(user)setUser({...user,tradingBalance:Math.max(0,(user.tradingBalance||0)+pnl)});
    set({
      futPos:futPos.filter(p=>p.id!==id),
      orderHistory:[{id:pos.id,pair:pos.pair,coin:pos.coin,type:"Futures",side:pos.side,entryPrice:pos.entry,exitPrice,qty:pos.qty,leverage:pos.leverage,margin:pos.margin,pnl:parseFloat(pnl.toFixed(2)),pnlPct:parseFloat(pnlPct.toFixed(2)),status:reason,openTime:pos.openTime,closeTime:new Date().toLocaleString("en-US",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})},...orderHistory],
    });
    if(reason==="LIQUIDATED")addToast(`LIQUIDATED: ${pos.pair} -$${pos.margin.toFixed(2)}`,"err");
    else addToast(`Closed ${pos.pair} ${pnl>=0?"+":""}$${pnl.toFixed(2)}`,"ok");
  },

  orderHistory:[...ORDER_HISTORY_INIT],
  addOrder:(o)=>set(s=>({orderHistory:[o,...s.orderHistory]})),
  txHistory:[...TX_INIT],
  addTx:(tx)=>set(s=>({txHistory:[tx,...s.txHistory]})),
  notifs:[...NOTIFS_INIT],
  markRead:(id)=>set(s=>({notifs:s.notifs.map(n=>n.id===id?{...n,read:true}:n)})),
  markAllRead:()=>set(s=>({notifs:s.notifs.map(n=>({...n,read:true}))})),
  addNotif:(n)=>set(s=>({notifs:[n,...s.notifs]})),
  banners:[...BANNERS_INIT],
  addBanner:(b)=>set(s=>({banners:[...s.banners,b]})),
  toggleBanner:(id)=>set(s=>({banners:s.banners.map(b=>b.id===id?{...b,active:!b.active}:b)})),
  deleteBanner:(id)=>set(s=>({banners:s.banners.filter(b=>b.id!==id)})),
  toasts:[],
  addToast:(msg,type="info")=>{
    const id=Date.now()+Math.random();
    set(s=>({toasts:[...s.toasts,{id,msg,type}]}));
    setTimeout(()=>set(s=>({toasts:s.toasts.filter(t=>t.id!==id)})),4000);
  },
  removeToast:(id)=>set(s=>({toasts:s.toasts.filter(t=>t.id!==id)})),

  transferToTrading:(amount)=>{
    const{user,setUser,addTx,addToast}=get();
    if(!user||amount<=0||amount>(user.fundingBalance||0)){addToast("Insufficient funding balance","err");return;}
    const freeze=Date.now()+FREEZE_MS;
    setUser({...user,fundingBalance:(user.fundingBalance||0)-amount,tradingBalance:(user.tradingBalance||0)+amount,tradingFreezeUntil:freeze});
    addTx({id:"tx"+Date.now(),type:"transfer_in",wallet:"trading",amount,fee:0,net:amount,note:"Funding → Trading (20-day freeze)",status:"completed",date:new Date().toLocaleDateString()});
    addToast(`$${amount} moved. Frozen ${20} days.`,"info");
  },

  transferToFunding:(amount)=>{
    const{user,setUser,addTx,addToast}=get();
    if(!user)return;
    if(Date.now()<(user.tradingFreezeUntil||0)){
      const d=Math.ceil(((user.tradingFreezeUntil||0)-Date.now())/86400000);
      addToast(`Frozen — ${d} day${d!==1?"s":""} remaining`,"err");return;
    }
    if(amount<=0||amount>(user.tradingBalance||0)){addToast("Insufficient trading balance","err");return;}
    const fee=amount*TRADE_OUT_FEE, net=amount-fee;
    setUser({...user,tradingBalance:(user.tradingBalance||0)-amount,fundingBalance:(user.fundingBalance||0)+net});
    addTx({id:"tx"+Date.now(),type:"transfer_out",wallet:"funding",amount,fee,net,note:"Trading → Funding (25% fee)",status:"completed",date:new Date().toLocaleDateString()});
    addToast(`$${net.toFixed(2)} received after 25% fee`,"ok");
  },
}));