export const FUND_WD_FEE   = 0.05;  // 5% platform fee only — no network fee
export const TRADE_OUT_FEE = 0.25;
export const FREEZE_MS     = 0;
export const MIN_WD        = 10;

// ── 10 Tiers ─────────────────────────────────────────────
export const TIERS = [
  {id:1,  name:"Tier 1",  price:100,  profit:1,  color:"#8a97b8"},
  {id:2,  name:"Tier 2",  price:200,  profit:2,  color:"#4d9fff"},
  {id:3,  name:"Tier 3",  price:300,  profit:3,  color:"#00d4ff"},
  {id:4,  name:"Tier 4",  price:500,  profit:5,  color:"#00e676"},
  {id:5,  name:"Tier 5",  price:700,  profit:7,  color:"#00f5c8"},
  {id:6,  name:"Tier 6",  price:1000, profit:10, color:"#9b59ff"},
  {id:7,  name:"Tier 7",  price:1200, profit:12, color:"#e056fd"},
  {id:8,  name:"Tier 8",  price:1500, profit:15, color:"#ffd166"},
  {id:9,  name:"Tier 9",  price:2000, profit:20, color:"#f0b429"},
  {id:10, name:"Tier 10", price:3000, profit:30, color:"#ff6b35"},
];

export const COINS = {
  BTC:  {sym:"BTC",  name:"Bitcoin",   price:67842.30,change: 2.34,vol:"28.4B",mktcap:"1.33T",color:"#F7931A"},
  ETH:  {sym:"ETH",  name:"Ethereum",  price:3521.80, change:-0.87,vol:"14.2B",mktcap:"423B", color:"#627EEA"},
  BNB:  {sym:"BNB",  name:"BNB",       price:589.20,  change: 1.23,vol:"2.8B", mktcap:"85B",  color:"#F3BA2F"},
  SOL:  {sym:"SOL",  name:"Solana",    price:182.45,  change: 5.12,vol:"4.1B", mktcap:"83B",  color:"#9945FF"},
  XRP:  {sym:"XRP",  name:"Ripple",    price:0.6234,  change:-1.45,vol:"1.9B", mktcap:"34B",  color:"#00AAE4"},
  ADA:  {sym:"ADA",  name:"Cardano",   price:0.4821,  change: 3.21,vol:"0.9B", mktcap:"17B",  color:"#0033AD"},
  DOGE: {sym:"DOGE", name:"Dogecoin",  price:0.1842,  change: 3.78,vol:"1.2B", mktcap:"26B",  color:"#C2A633"},
  AVAX: {sym:"AVAX", name:"Avalanche", price:38.87,   change:-2.14,vol:"0.8B", mktcap:"16B",  color:"#E84142"},
  DOT:  {sym:"DOT",  name:"Polkadot",  price:7.85,    change: 1.05,vol:"0.4B", mktcap:"10B",  color:"#E6007A"},
  MATIC:{sym:"MATIC",name:"Polygon",   price:0.8938,  change: 4.33,vol:"0.6B", mktcap:"8B",   color:"#8247E5"},
};

// ── Networks — updated deposit fees: TRC20=$1, BEP20=$0.01, ERC20=$0.6
// Note: network fee here is ONLY added to the deposit total the user must send.
// Withdrawals have NO network fee — only 5% platform fee (FUND_WD_FEE above).
export const NETWORKS = [
  {id:"trc20", name:"TRC20 (USDT)", fee:1,    feeLabel:"$1",     min:10,  address:"TA3JYRziYUNCFbfVkmVXK1atU3fBD5j1oK"},
  {id:"erc20", name:"ERC20 (USDT)", fee:0.6,  feeLabel:"$0.60",  min:50,  address:"0xF598f9d8B16079Bd88c1229696118b8e32697D5f"},
  {id:"bep20", name:"BEP20 (USDT)", fee:0.01, feeLabel:"$0.01",  min:10,  address:"0xF598f9d8B16079Bd88c1229696118b8e32697D5f"},
];

export const PAIRS     = ["BTC/USDT","ETH/USDT","BNB/USDT","SOL/USDT","XRP/USDT","ADA/USDT","DOGE/USDT","AVAX/USDT"];
export const LEVERAGES = [1,2,3,5,10,20,50,100];
export const BANNERS_INIT = [{id:"b1",title:"🎉 Welcome to OctaExchange",text:"Start your trading journey with us today",color:"#f0a500",active:true}];

export const REF_LEVELS = [
  {level:0, label:"LV 0", min:0,    max:4,      color:"#435070"},
  {level:1, label:"LV 1", min:5,    max:29,     color:"#8a97b8"},
  {level:2, label:"LV 2", min:30,   max:99,     color:"#4d9fff"},
  {level:3, label:"LV 3", min:100,  max:499,    color:"#00d4ff"},
  {level:4, label:"LV 4", min:500,  max:999,    color:"#00e676"},
  {level:5, label:"LV 5", min:1000, max:1999,   color:"#00f5c8"},
  {level:6, label:"LV 6", min:2000, max:4999,   color:"#9b59ff"},
  {level:7, label:"LV 7", min:5000, max:999999, color:"#f0a500"},
];

export function getRefLevel(count=0){
  if(count<=0)return REF_LEVELS[0];
  for(let i=REF_LEVELS.length-1;i>=1;i--){if(count>=REF_LEVELS[i].min)return REF_LEVELS[i];}
  return REF_LEVELS[0];
}
export function fmtP(sym,p){
  if(!p&&p!==0)return"0.00";
  if(p<0.001)return p.toFixed(6);
  if(p<1)return p.toFixed(4);
  if(p>=10000)return p.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  return p.toFixed(2);
}
export function initials(n=""){return n.split(" ").filter(Boolean).map(w=>w[0].toUpperCase()).slice(0,2).join("");}
export function genCode(pair){return pair.split("/")[0]+Math.floor(1000+Math.random()*9000);}
export function genUID(){return"OCT"+String(Math.floor(100000+Math.random()*900000));}

export const MOCK_USERS=[],DEP_REQS=[],WD_REQS=[],KYC_REQS=[],ADMIN_CODES_INIT=[],SIGNALS_INIT={},ORDER_HISTORY_INIT=[],TX_INIT=[],NOTIFS_INIT=[];