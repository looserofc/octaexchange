import { create } from "zustand";
import {
  COINS, SIGNALS_INIT,
  ORDER_HISTORY_INIT, TX_HISTORY_INIT,
  NOTIFS_INIT, BANNERS_INIT,
} from "./data";

// ── CoinGecko ID map ───────────────────────────────────────
const GECKO_IDS = {
  BTC:   "bitcoin",
  ETH:   "ethereum",
  BNB:   "binancecoin",
  SOL:   "solana",
  XRP:   "ripple",
  ADA:   "cardano",
  DOGE:  "dogecoin",
  AVAX:  "avalanche-2",
  DOT:   "polkadot",
  MATIC: "matic-network",
};

// ── Build initial chart data ───────────────────────────────
function buildCharts() {
  const charts = {};
  Object.keys(COINS).forEach((sym) => {
    const base  = COINS[sym].price;
    const trend = COINS[sym].change >= 0 ? 1 : -1;
    let   cur   = base * 0.987;
    const pts   = [];
    for (let i = 0; i < 80; i++) {
      cur = Math.max(base * 0.95, Math.min(base * 1.05, cur + (Math.random() - 0.48) * base * 0.004 + trend * base * 0.0002));
      pts.push(cur);
    }
    pts.push(base);
    charts[sym] = pts;
  });
  return charts;
}

function buildInitialPrices() {
  const p = {};
  Object.keys(COINS).forEach((k) => { p[k] = COINS[k].price; });
  return p;
}

export const useStore = create((set, get) => ({
  // ── Auth ─────────────────────────────────────────────────
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),

  // ── Navigation ───────────────────────────────────────────
  page: "home",
  setPage: (page) => set({ page }),
  profileTab: "account",
  setProfileTab: (tab) => set({ profileTab: tab }),

  // ── Admin ────────────────────────────────────────────────
  showAdmin:    false,
  setShowAdmin: (v) => set({ showAdmin: v }),
  adminAuthed:  false,
  setAdminAuthed: (v) => set({ adminAuthed: v }),

  // ── Prices (real from CoinGecko, fallback to simulated) ──
  prices:       buildInitialPrices(),
  charts:       buildCharts(),
  pricesFetched: false,

  // Fetch real prices from CoinGecko (free, no API key needed)
  fetchRealPrices: async () => {
    try {
      const ids = Object.values(GECKO_IDS).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("CoinGecko fetch failed");
      const data = await res.json();

      const newPrices = { ...get().prices };
      Object.entries(GECKO_IDS).forEach(([sym, geckoId]) => {
        const entry = data[geckoId];
        if (entry?.usd) newPrices[sym] = entry.usd;
      });
      set({ prices: newPrices, pricesFetched: true });
    } catch (e) {
      // Silently fall back to simulated prices
      console.warn("CoinGecko unavailable, using simulated prices");
    }
  },

  // Simulate small price drift between real fetches
  tickPrices: () => {
    set((state) => {
      const newPrices = { ...state.prices };
      const newCharts = { ...state.charts };
      Object.keys(COINS).forEach((sym) => {
        const base  = COINS[sym].price;
        const drift = (Math.random() - 0.485) * 0.003;
        newPrices[sym] = Math.max(base * 0.85, Math.min(base * 1.15, newPrices[sym] * (1 + drift)));
        const arr = [...newCharts[sym].slice(1)];
        arr.push(newPrices[sym]);
        newCharts[sym] = arr;
      });
      return { prices: newPrices, charts: newCharts };
    });
  },

  // ── Signals ───────────────────────────────────────────────
  signals: { ...SIGNALS_INIT },
  addSignal: (code, data) =>
    set((s) => ({ signals: { ...s.signals, [code]: data } })),

  // ── Active Trades ─────────────────────────────────────────
  activeTrades: [],
  addTrade:    (t)  => set((s) => ({ activeTrades: [...s.activeTrades, t] })),
  removeTrade: (id) => set((s) => ({ activeTrades: s.activeTrades.filter((t) => t.id !== id) })),

  // ── Order History ─────────────────────────────────────────
  orderHistory: [...ORDER_HISTORY_INIT],
  addOrder: (o) => set((s) => ({ orderHistory: [o, ...s.orderHistory] })),

  // ── Transactions ──────────────────────────────────────────
  txHistory: [...TX_HISTORY_INIT],
  addTx: (tx) => set((s) => ({ txHistory: [tx, ...s.txHistory] })),

  // ── Notifications ─────────────────────────────────────────
  notifs: [...NOTIFS_INIT],
  markNotifRead: (id) => set((s) => ({ notifs: s.notifs.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllRead:   ()   => set((s) => ({ notifs: s.notifs.map((n) => ({ ...n, read: true })) })),
  addNotif:      (n)  => set((s) => ({ notifs: [n, ...s.notifs] })),

  // ── Banners ───────────────────────────────────────────────
  banners:      [...BANNERS_INIT],
  addBanner:    (b)  => set((s) => ({ banners: [...s.banners, b] })),
  toggleBanner: (id) => set((s) => ({ banners: s.banners.map((b) => b.id === id ? { ...b, active: !b.active } : b) })),
  deleteBanner: (id) => set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),

  // ── Toast ─────────────────────────────────────────────────
  toasts: [],
  addToast: (msg, type = "info") => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ── Admin data ────────────────────────────────────────────
  adminUsers:            [],
  setAdminUsers:         (u) => set({ adminUsers: u }),
  depositRequests:       [],
  setDepositRequests:    (d) => set({ depositRequests: d }),
  withdrawalRequests:    [],
  setWithdrawalRequests: (w) => set({ withdrawalRequests: w }),
  adminCodes:            [],
  prependAdminCode:      (c) => set((s) => ({ adminCodes: [c, ...s.adminCodes] })),
}));