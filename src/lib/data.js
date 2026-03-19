export const FUND_WD_FEE   = 0.10;   // 10% withdrawal fee from Funding Account
export const TRADE_OUT_FEE = 0.25;   // 25% fee when transferring Trading → Funding
export const FREEZE_DAYS   = 20;
export const FREEZE_MS     = FREEZE_DAYS * 24 * 60 * 60 * 1000;
export const MIN_WD        = 100;    // Minimum withdrawal $100
export const MIN_DEP       = 100;    // Minimum deposit $100

// ─── Referral Level thresholds ─────────────────────────────
export const REF_LEVELS = [
  { level: 0,  label: "—",    min: 0,    max: 0,     color: "#435070", badge: "b-dim" },
  { level: 1,  label: "LV 1", min: 1,    max: 5,     color: "#8a97b8", badge: "b-dim" },
  { level: 2,  label: "LV 2", min: 6,    max: 30,    color: "#4d9fff", badge: "b-bl"  },
  { level: 3,  label: "LV 3", min: 31,   max: 120,   color: "#00d4ff", badge: "b-bl"  },
  { level: 4,  label: "LV 4", min: 121,  max: 500,   color: "#00e676", badge: "b-up"  },
  { level: 5,  label: "LV 5", min: 501,  max: 1500,  color: "#00f5c8", badge: "b-up"  },
  { level: 6,  label: "LV 6", min: 1501, max: 3000,  color: "#9b59ff", badge: "b-pu"  },
  { level: 7,  label: "LV 7", min: 3001, max: 5000,  color: "#e056fd", badge: "b-pu"  },
  { level: 10, label: "LV 10",min: 5001, max: 999999,color: "#f0a500", badge: "b-au"  },
];

export function getRefLevel(count = 0) {
  if (count <= 0) return REF_LEVELS[0];
  for (let i = REF_LEVELS.length - 1; i >= 1; i--) {
    if (count >= REF_LEVELS[i].min) return REF_LEVELS[i];
  }
  return REF_LEVELS[0];
}

export const TIERS = [
  {id:1, name:"Tier 1",  price:100,  profit:1,  color:"#8a97b8"},
  {id:2, name:"Tier 2",  price:200,  profit:2,  color:"#4d9fff"},
  {id:3, name:"Tier 3",  price:300,  profit:3,  color:"#00d4ff"},
  {id:4, name:"Tier 4",  price:500,  profit:5,  color:"#00e676"},
  {id:5, name:"Tier 5",  price:700,  profit:7,  color:"#00f5c8"},
  {id:6, name:"Tier 6",  price:1000, profit:10, color:"#9b59ff"},
  {id:7, name:"Tier 7",  price:1200, profit:12, color:"#e056fd"},
  {id:8, name:"Tier 8",  price:1500, profit:15, color:"#ffd166"},
  {id:9, name:"Tier 9",  price:2000, profit:20, color:"#f0b429"},
  {id:10,name:"Tier 10", price:3000, profit:30, color:"#ff6b35"},
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

export const NETWORKS = [
  {id:"trc20",name:"TRC20 (USDT)",fee:"1 USDT",  min:10, address:"TRc9WmJ4xV8nKpL3qRsD7fYbE2gHu6tNv"},
  {id:"erc20",name:"ERC20 (USDT)",fee:"5 USDT",  min:50, address:"0x742d35Cc6634C0532925a3b8D4C9e7E4a5Bf8"},
  {id:"bep20",name:"BEP20 (USDT)",fee:"0.5 USDT",min:10, address:"0xBEP20abc123def456ghi789jkl012mno345pqr"},
];

export const PAIRS     = ["BTC/USDT","ETH/USDT","BNB/USDT","SOL/USDT","XRP/USDT","ADA/USDT","DOGE/USDT","AVAX/USDT"];
export const LEVERAGES = [1,2,3,5,10,20,50,100];

export const SIGNALS_INIT = {
  BTC9421:{coin:"BTC",pair:"BTC/USDT",side:"BUY", created:Date.now()-600_000,ttl:3_600_000},
  ETH7364:{coin:"ETH",pair:"ETH/USDT",side:"SELL",created:Date.now()-300_000,ttl:3_600_000},
  SOL1982:{coin:"SOL",pair:"SOL/USDT",side:"BUY", created:Date.now()-120_000,ttl:3_600_000},
  BNB4471:{coin:"BNB",pair:"BNB/USDT",side:"BUY", created:Date.now()-60_000, ttl:3_600_000},
};

export const ORDER_HISTORY_INIT = [
  {id:"oh1",pair:"BTC/USDT",coin:"BTC",type:"Copy Trade",side:"BUY", code:"BTC8821",entryPrice:66842.10,exitPrice:67510.52,qty:0.003,leverage:1, margin:200,pnl:2.00, pnlPct:1.00, status:"CLOSED",    openTime:"2025-01-15 09:30",closeTime:"2025-01-15 09:35"},
  {id:"oh2",pair:"ETH/USDT",coin:"ETH",type:"Copy Trade",side:"SELL",code:"ETH5541",entryPrice:3540.20, exitPrice:3504.80, qty:0.056,leverage:1, margin:200,pnl:2.00, pnlPct:1.00, status:"CLOSED",    openTime:"2025-01-15 11:12",closeTime:"2025-01-15 11:17"},
  {id:"oh3",pair:"BTC/USDT",coin:"BTC",type:"Futures",   side:"LONG",code:"—",      entryPrice:65000,   exitPrice:63700,   qty:0.015,leverage:10,margin:100,pnl:-19.5,pnlPct:-19.5,status:"LIQUIDATED",openTime:"2025-01-13 10:00",closeTime:"2025-01-13 10:08"},
];

export const TX_INIT = [
  {id:"tx1",type:"deposit",      wallet:"funding", amount:200,fee:0,  net:200, network:"TRC20",        status:"completed",date:"2025-01-10",hash:"TX8a4f..."},
  {id:"tx2",type:"transfer_in",  wallet:"trading", amount:200,fee:0,  net:200, note:"Funding→Trading", status:"completed",date:"2025-01-10"},
  {id:"tx3",type:"trade_profit", wallet:"trading", amount:2,  fee:0,  net:2,   coin:"BTC/USDT",        status:"completed",date:"2025-01-12"},
];

export const NOTIFS_INIT = [
  {id:"n1",title:"Trade Completed!", body:"BTC/USDT copy trade earned +$2.00",     time:"2m ago", read:false},
  {id:"n2",title:"Signal Ready",     body:"New signal shared in WhatsApp group",   time:"15m ago",read:false},
  {id:"n3",title:"Deposit Approved", body:"$200 credited to your Funding Account", time:"1h ago", read:true },
];

export const BANNERS_INIT = [
  {id:"b1",title:"🎉 Welcome Bonus",text:"Deposit today & get 10% bonus on Tier 3+",color:"#f0a500",active:true},
];

export const MOCK_USERS = [
  {id:"u1",name:"Alice Chen",   username:"alicechen",   email:"alice@gmail.com", phone:"+1-555-0101",joined:"2024-09-15",tier:3,fundBal:2200, tradeBal:2621,earnings:312, withdrawn:200, kycStatus:"approved", referralCode:"NXT11111", referredBy:null,         referredCount:7,   referredMembers:["bobwilliams","carlosruiz"]},
  {id:"u2",name:"Bob Williams", username:"bobwilliams", email:"bob@gmail.com",   phone:"+1-555-0102",joined:"2024-10-02",tier:5,fundBal:4800, tradeBal:7600,earnings:980, withdrawn:500, kycStatus:"approved", referralCode:"NXT22222", referredBy:"alicechen",  referredCount:35,  referredMembers:["carlosruiz"]},
  {id:"u3",name:"Carlos Ruiz",  username:"carlosruiz",  email:"carlos@gmail.com",phone:"+1-555-0103",joined:"2024-11-18",tier:2,fundBal:892,  tradeBal:0,   earnings:48,  withdrawn:0,   kycStatus:"pending",  referralCode:"NXT33333", referredBy:"alicechen",  referredCount:0,   referredMembers:[]},
  {id:"u4",name:"Dina Patel",   username:"dinapatel",   email:"dina@gmail.com",  phone:"+1-555-0104",joined:"2024-12-01",tier:7,fundBal:8400, tradeBal:20000,earnings:2400,withdrawn:1200,kycStatus:"approved", referralCode:"NXT44444", referredBy:"bobwilliams",referredCount:125, referredMembers:["erikjensen"]},
  {id:"u5",name:"Erik Jensen",  username:"erikjensen",  email:"erik@gmail.com",  phone:"+1-555-0105",joined:"2025-01-05",tier:1,fundBal:450,  tradeBal:0,   earnings:12,  withdrawn:0,   kycStatus:"none",     referralCode:"NXT55555", referredBy:"carlosruiz", referredCount:2,   referredMembers:[]},
];

export const DEP_REQS = [
  {id:"d1",user:"Alice Chen",  tier:"Tier 3",network:"TRC20",hash:"TX8a4f21...e7d2",amount:300,status:"pending" },
  {id:"d2",user:"Bob Williams",tier:"Tier 5",network:"ERC20",hash:"0x9f3a...8e11",  amount:700,status:"approved"},
  {id:"d3",user:"Carlos Ruiz", tier:"Tier 2",network:"BEP20",hash:"0x1234...9900",  amount:200,status:"pending" },
];

export const WD_REQS = [
  {id:"w1",user:"Alice Chen",amount:200, network:"TRC20",address:"TRx8F4a2...9Kp3",status:"pending" },
  {id:"w2",user:"Dina Patel",amount:1200,network:"ERC20",address:"0x9a2b...4c5d",   status:"approved"},
];

export const KYC_REQS = [
  {id:"k1",user:"Alice Chen",  email:"alice@gmail.com", phone:"+1-555-0101",submitted:"2025-01-14",fullName:"Alice Chen",  address:"123 Main St, NYC",cnicF:"cnic_front_alice.jpg", cnicB:"cnic_back_alice.jpg", status:"pending" },
  {id:"k2",user:"Bob Williams",email:"bob@gmail.com",   phone:"+1-555-0102",submitted:"2025-01-10",fullName:"Bob Williams",address:"456 Oak Ave, LA", cnicF:"cnic_front_bob.jpg",   cnicB:"cnic_back_bob.jpg",   status:"approved"},
  {id:"k3",user:"Carlos Ruiz", email:"carlos@gmail.com",phone:"+1-555-0103",submitted:"2025-01-15",fullName:"Carlos Ruiz", address:"789 Pine Rd, TX", cnicF:"cnic_front_carlos.jpg",cnicB:"cnic_back_carlos.jpg",status:"pending" },
];

export const ADMIN_CODES_INIT = [
  {code:"BTC9421",pair:"BTC/USDT",side:"BUY", created:"09:20",expires:"10:20",used:14,status:"active" },
  {code:"ETH7364",pair:"ETH/USDT",side:"SELL",created:"08:45",expires:"09:45",used:22,status:"expired"},
  {code:"SOL1982",pair:"SOL/USDT",side:"BUY", created:"10:00",expires:"11:00",used:8, status:"active" },
];

export function fmtP(sym,p){
  if(!p&&p!==0)return"0.00";
  if(p<0.001)return p.toFixed(6);
  if(p<1)return p.toFixed(4);
  if(p>=10000)return p.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  return p.toFixed(2);
}
export function initials(n=""){return n.split(" ").filter(Boolean).map(w=>w[0].toUpperCase()).slice(0,2).join("");}
export function genCode(pair){return pair.split("/")[0]+Math.floor(1000+Math.random()*9000);}