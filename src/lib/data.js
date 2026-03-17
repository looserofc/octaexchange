// ─────────────────────────────────────────────────────────
//  TIERS
// ─────────────────────────────────────────────────────────
export const TIERS = [
  { id: 1,  name: "Tier 1",  price: 100,  profit: 1,  color: "#8a97b8" },
  { id: 2,  name: "Tier 2",  price: 200,  profit: 2,  color: "#4d9fff" },
  { id: 3,  name: "Tier 3",  price: 300,  profit: 3,  color: "#00d4ff" },
  { id: 4,  name: "Tier 4",  price: 500,  profit: 5,  color: "#00e676" },
  { id: 5,  name: "Tier 5",  price: 700,  profit: 7,  color: "#00f5c8" },
  { id: 6,  name: "Tier 6",  price: 1000, profit: 10, color: "#9b59ff" },
  { id: 7,  name: "Tier 7",  price: 1200, profit: 12, color: "#e056fd" },
  { id: 8,  name: "Tier 8",  price: 1500, profit: 15, color: "#ffd166" },
  { id: 9,  name: "Tier 9",  price: 2000, profit: 20, color: "#f0b429" },
  { id: 10, name: "Tier 10", price: 3000, profit: 30, color: "#ff6b35" },
];

// ─────────────────────────────────────────────────────────
//  COINS
// ─────────────────────────────────────────────────────────
export const COINS = {
  BTC:   { sym: "BTC",   name: "Bitcoin",    price: 67842.30, change: 2.34,  vol: "28.4B", mktcap: "1.33T", color: "#F7931A" },
  ETH:   { sym: "ETH",   name: "Ethereum",   price: 3521.80,  change: -0.87, vol: "14.2B", mktcap: "423B",  color: "#627EEA" },
  BNB:   { sym: "BNB",   name: "BNB",        price: 589.20,   change: 1.23,  vol: "2.8B",  mktcap: "85B",   color: "#F3BA2F" },
  SOL:   { sym: "SOL",   name: "Solana",     price: 182.45,   change: 5.12,  vol: "4.1B",  mktcap: "83B",   color: "#9945FF" },
  XRP:   { sym: "XRP",   name: "Ripple",     price: 0.6234,   change: -1.45, vol: "1.9B",  mktcap: "34B",   color: "#00AAE4" },
  ADA:   { sym: "ADA",   name: "Cardano",    price: 0.4821,   change: 3.21,  vol: "0.9B",  mktcap: "17B",   color: "#0033AD" },
  DOGE:  { sym: "DOGE",  name: "Dogecoin",   price: 0.1842,   change: 3.78,  vol: "1.1B",  mktcap: "26B",   color: "#C2A633" },
  AVAX:  { sym: "AVAX",  name: "Avalanche",  price: 38.92,    change: -2.14, vol: "0.6B",  mktcap: "16B",   color: "#E84142" },
  DOT:   { sym: "DOT",   name: "Polkadot",   price: 7.84,     change: 1.05,  vol: "0.4B",  mktcap: "11B",   color: "#E6007A" },
  MATIC: { sym: "MATIC", name: "Polygon",    price: 0.8921,   change: 4.33,  vol: "0.7B",  mktcap: "9B",    color: "#8247E5" },
};

// ─────────────────────────────────────────────────────────
//  INITIAL SIGNAL CODES  (admin generates these)
// ─────────────────────────────────────────────────────────
export const SIGNALS_INIT = {
  BTC9421: { coin: "BTC", pair: "BTC/USDT", created: Date.now() - 600_000,  ttl: 3_600_000 },
  ETH7364: { coin: "ETH", pair: "ETH/USDT", created: Date.now() - 300_000,  ttl: 3_600_000 },
  SOL1982: { coin: "SOL", pair: "SOL/USDT", created: Date.now() - 120_000,  ttl: 3_600_000 },
  BNB4471: { coin: "BNB", pair: "BNB/USDT", created: Date.now() -  60_000,  ttl: 3_600_000 },
};

// ─────────────────────────────────────────────────────────
//  TRADING PAIRS
// ─────────────────────────────────────────────────────────
export const PAIRS = [
  "BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT",
  "XRP/USDT", "ADA/USDT", "DOGE/USDT", "AVAX/USDT",
];

// ─────────────────────────────────────────────────────────
//  DEPOSIT NETWORKS
// ─────────────────────────────────────────────────────────
export const NETWORKS = [
  { id: "trc20", name: "TRC20 (USDT)", fee: "1 USDT",   min: 10,  address: "TRc9WmJ4xV8nKpL3qRsD7fYbE2gHu6tNv" },
  { id: "erc20", name: "ERC20 (USDT)", fee: "5 USDT",   min: 50,  address: "0x742d35Cc6634C0532925a3b8D4C9e7E4a5Bf8" },
  { id: "bep20", name: "BEP20 (USDT)", fee: "0.5 USDT", min: 10,  address: "0xBEP20abc123def456ghi789jkl012mno345pqr" },
];

// ─────────────────────────────────────────────────────────
//  SAMPLE ORDER HISTORY
// ─────────────────────────────────────────────────────────
export const ORDER_HISTORY_INIT = [
  { id: "oh1", pair: "BTC/USDT", coin: "BTC", code: "BTC8821", profit: 2, tierPrice: 200, startTime: "09:30", endTime: "09:35", date: "2025-01-15" },
  { id: "oh2", pair: "ETH/USDT", coin: "ETH", code: "ETH5541", profit: 2, tierPrice: 200, startTime: "11:12", endTime: "11:17", date: "2025-01-15" },
  { id: "oh3", pair: "SOL/USDT", coin: "SOL", code: "SOL3319", profit: 3, tierPrice: 300, startTime: "15:44", endTime: "15:49", date: "2025-01-14" },
  { id: "oh4", pair: "BTC/USDT", coin: "BTC", code: "BTC6652", profit: 2, tierPrice: 200, startTime: "10:00", endTime: "10:05", date: "2025-01-14" },
  { id: "oh5", pair: "BNB/USDT", coin: "BNB", code: "BNB2293", profit: 2, tierPrice: 200, startTime: "16:20", endTime: "16:25", date: "2025-01-13" },
];

// ─────────────────────────────────────────────────────────
//  TRANSACTION HISTORY
// ─────────────────────────────────────────────────────────
export const TX_HISTORY_INIT = [
  { id: "tx1", type: "deposit",      amount: 200, network: "TRC20",   status: "completed", date: "2025-01-10", hash: "TX8a4f21b9c...e7d2" },
  { id: "tx2", type: "trade_profit", amount: 2,   coin: "BTC/USDT",   status: "completed", date: "2025-01-12" },
  { id: "tx3", type: "trade_profit", amount: 2,   coin: "ETH/USDT",   status: "completed", date: "2025-01-13" },
  { id: "tx4", type: "withdrawal",   amount: 50,  network: "TRC20",   status: "pending",   date: "2025-01-14", address: "TRx8F4a2...9Kp3" },
];

// ─────────────────────────────────────────────────────────
//  ADMIN – MOCK USERS
// ─────────────────────────────────────────────────────────
export const MOCK_USERS_INIT = [
  { id: "u1", name: "Alice Chen",    email: "alice@gmail.com",  phone: "+1-555-0101", joined: "2024-09-15", tier: 3, balance: 4821.50,  earnings: 312.00,  withdrawn: 200.00 },
  { id: "u2", name: "Bob Williams",  email: "bob@gmail.com",    phone: "+1-555-0102", joined: "2024-10-02", tier: 5, balance: 12400.00, earnings: 980.00,  withdrawn: 500.00 },
  { id: "u3", name: "Carlos Ruiz",   email: "carlos@gmail.com", phone: "+1-555-0103", joined: "2024-11-18", tier: 2, balance: 892.00,   earnings: 48.00,   withdrawn: 0.00 },
  { id: "u4", name: "Dina Patel",    email: "dina@gmail.com",   phone: "+1-555-0104", joined: "2024-12-01", tier: 7, balance: 28400.00, earnings: 2400.00, withdrawn: 1200.00 },
  { id: "u5", name: "Erik Jensen",   email: "erik@gmail.com",   phone: "+1-555-0105", joined: "2025-01-05", tier: 1, balance: 450.00,   earnings: 12.00,   withdrawn: 0.00 },
];

// ─────────────────────────────────────────────────────────
//  ADMIN – DEPOSIT REQUESTS
// ─────────────────────────────────────────────────────────
export const DEPOSIT_REQUESTS_INIT = [
  { id: "d1", user: "Alice Chen",   tier: "Tier 3", network: "TRC20", hash: "TX8a4f21b9c3...e7d2", amount: 300, status: "pending" },
  { id: "d2", user: "Bob Williams", tier: "Tier 5", network: "ERC20", hash: "0x9f3a2b4c...8e11",   amount: 700, status: "approved" },
  { id: "d3", user: "Carlos Ruiz",  tier: "Tier 2", network: "BEP20", hash: "0x1234abcd...9900",   amount: 200, status: "pending" },
];

// ─────────────────────────────────────────────────────────
//  ADMIN – WITHDRAWAL REQUESTS
// ─────────────────────────────────────────────────────────
export const WITHDRAWAL_REQUESTS_INIT = [
  { id: "w1", user: "Alice Chen", amount: 200,  network: "TRC20", address: "TRx8F4a2...9Kp3", status: "pending" },
  { id: "w2", user: "Dina Patel", amount: 1200, network: "ERC20", address: "0x9a2b...4c5d",   status: "approved" },
];

// ─────────────────────────────────────────────────────────
//  BANNERS
// ─────────────────────────────────────────────────────────
export const BANNERS_INIT = [
  { id: "b1", title: "🎉 Welcome Bonus",    text: "Deposit today & get 10% bonus on Tier 3+", color: "#f0b429", active: true },
  { id: "b2", title: "📊 New Signal Codes", text: "Check WhatsApp for today's BTC signals!",   color: "#00d4ff", active: true },
];

// ─────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────
export const NOTIFS_INIT = [
  { id: "n1", title: "Trade Completed!", body: "Your BTC/USDT trade earned +$2.00",           time: "2m ago",  read: false },
  { id: "n2", title: "Signal Code Ready", body: "New ETH7364 code shared in group",            time: "15m ago", read: false },
  { id: "n3", title: "Deposit Approved",  body: "$200 deposit has been credited to your wallet", time: "1h ago", read: true },
];

// ─────────────────────────────────────────────────────────
//  ADMIN SIGNAL CODES (table view)
// ─────────────────────────────────────────────────────────
export const ADMIN_CODES_INIT = [
  { code: "BTC9421", pair: "BTC/USDT", created: "14:20", expires: "15:20", used: 14, status: "active" },
  { code: "ETH7364", pair: "ETH/USDT", created: "13:45", expires: "14:45", used: 22, status: "active" },
  { code: "SOL1982", pair: "SOL/USDT", created: "12:30", expires: "13:30", used: 31, status: "expired" },
  { code: "BNB4471", pair: "BNB/USDT", created: "15:00", expires: "16:00", used: 8,  status: "active" },
];

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────

/** Format a price number for display */
export function fmtPrice(sym, price) {
  if (!price) return "0.00";
  if (price < 1)    return price.toFixed(4);
  if (price >= 1000) return (price / 1000).toFixed(2) + "K";
  return price.toFixed(2);
}

/** Generate a new signal code string like "BTC9421" */
export function genSignalCode(pair) {
  const coin = pair.split("/")[0];
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `${coin}${num}`;
}

/** Get initials from a full name */
export function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
