import { create } from "zustand";
import { COINS, BANNERS_INIT, FUND_WD_FEE } from "./data";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const GID = {BTC:"bitcoin",ETH:"ethereum",BNB:"binancecoin",SOL:"solana",XRP:"ripple",ADA:"cardano",DOGE:"dogecoin",AVAX:"avalanche-2",DOT:"polkadot",MATIC:"matic-network"};

// ── Tokens in module scope ────────────────────────────────
let _accessToken = null;

if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem("accessToken");
  if (savedToken) _accessToken = savedToken;
}

function setTokenInternal(accessToken, refreshToken) {
  _accessToken = accessToken;
  if (typeof window !== "undefined") {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    else localStorage.removeItem("accessToken");

    if (refreshToken !== undefined) {
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      else localStorage.removeItem("refreshToken");
    }
  }
  try { useStore.setState({ _token: accessToken }); } catch (_) {}
}

async function apiFetch(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };

  if (_accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !opts._retry) {
    if (!_accessToken) return res;

    try {
      const storedRefreshToken = typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null;

      const rr = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (rr.ok) {
        const rd = await rr.json();
        const newAccess  = rd.data?.accessToken  || rd.accessToken;
        const newRefresh = rd.data?.refreshToken || rd.refreshToken;
        setTokenInternal(newAccess, newRefresh);
        return apiFetch(path, { ...opts, _retry: true });
      } else {
        setTokenInternal(null, null);
      }
    } catch (_) {}
  }

  return res;
}

function buildCharts() {
  const o = {};
  Object.keys(COINS).forEach(sym => {
    const base = COINS[sym].price, dir = COINS[sym].change >= 0 ? 1 : -1;
    let v = base * .986; const pts = [];
    for (let i = 0; i < 80; i++) { v = Math.max(base*.95, Math.min(base*1.05, v+(Math.random()-.48)*base*.004+dir*base*.0002)); pts.push(v); }
    pts.push(base); o[sym] = pts;
  });
  return o;
}
function buildCandles(sym) {
  const base = COINS[sym].price, dir = COINS[sym].change >= 0 ? 1 : -1;
  const out = []; let price = base * .985;
  for (let i = 0; i < 60; i++) {
    const o2 = price, mv = (Math.random()-.46+dir*.04)*base*.008;
    const c = Math.max(base*.92, Math.min(base*1.08, o2+mv));
    out.push({ t: Date.now()-(60-i)*60000, o:o2, h:Math.max(o2,c)+Math.random()*base*.003, l:Math.min(o2,c)-Math.random()*base*.003, c });
    price = c;
  }
  return out;
}
function buildPrices() { const p = {}; Object.keys(COINS).forEach(k => { p[k] = COINS[k].price; }); return p; }

function mapApiUser(u) {
  const uid = "OCT" + (u._id || u.id || "").slice(-6).toUpperCase();
  return {
    id: u._id||u.id, uid,
    username: u.username||u.fullName||u.email?.split("@")[0],
    name: u.fullName||u.username,
    email: u.email, phone: u.phone||"",
    avatar: (u.fullName||u.username||"?")[0].toUpperCase(),
    fundingBalance: u.fundingBalance||0,
    tradingBalance: u.tradingBalance||0,
    tradingFreezeUntil: 0,
    tier: u.tier||null,
    totalProfit: u.totalProfit||0,
    totalTrades: u.totalTrades||0,
    kycStatus: u.kycStatus||null,
    referralCode: u.referralCode||"",
    referralCount: u.teamCount||0,
    referrals: [],
    referredBy: u.referredBy||null,
    joinDate: u.createdAt?.split("T")[0]||"",
    role: u.role||"user",
  };
}

function timeAgo(date) {
  const diff = Date.now() - date;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return Math.floor(diff/60000)+"m ago";
  if (diff < 86400000) return Math.floor(diff/3600000)+"h ago";
  return Math.floor(diff/86400000)+"d ago";
}

function mapTx(t) {
  let displayType = t.type;
  if (t.type === "transfer_out") {
    displayType = t.toWallet === "trading" ? "transfer_in" : "transfer_out";
  }
  if (t.type === "trade_pnl") displayType = "trade_profit";
  const labelMap = {
    deposit:"Deposit", withdrawal:"Withdrawal", transfer_in:"Transfer In",
    transfer_out:"Transfer Out", trade_profit:"Trade Profit", referral_bonus:"Referral Bonus",
  };
  return {
    id: t._id, type: displayType, label: labelMap[displayType] || t.type,
    wallet: t.toWallet || t.fromWallet || "funding", amount: t.amount,
    fee: t.fee || 0, net: t.netAmount || t.amount, network: t.network || "",
    status: t.status, date: t.createdAt?.split("T")[0] || new Date().toLocaleDateString(),
    hash: t.txId || "", address: t.walletAddress || "", coin: t.coin || "", note: t.note || "",
  };
}

function mapOrder(o) {
  return {
    id: o._id, pair: o.coin, coin: o.coin?.replace("USDT","") || "BTC",
    type: "Copy Trade", side: o.direction === "LONG" ? "BUY" : "SELL",
    code: o.signalCode || "", entryPrice: o.entryPrice ?? 0, exitPrice: o.exitPrice ?? 0,
    qty: 0, leverage: 1, margin: 0, pnl: o.profitAmount || 0, pnlPct: o.profitPercent || 1,
    status: o.status === "completed" ? "CLOSED" : (o.status || "CLOSED").toUpperCase(),
    openTime: o.openedAt ? new Date(o.openedAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "",
    closeTime: o.closedAt ? new Date(o.closedAt).toLocaleString("en-US",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}) : "",
  };
}

export const useStore = create((set, get) => ({
  page:"home",         setPage:p=>set({page:p}),
  assetsTab:"overview",setAssetsTab:t=>set({assetsTab:t}),
  tradeTab:"copy",     setTradeTab:t=>set({tradeTab:t}),
  profileTab:"account",setProfileTab:t=>set({profileTab:t}),
  profileScreen:null,  setProfileScreen:s=>set({profileScreen:s}),
  adminAuthed:false,   setAdminAuthed:v=>set({adminAuthed:v}),
  adminRole:null,      setAdminRole:r=>set({adminRole:r}),
  showAdmin:false,     setShowAdmin:v=>set({showAdmin:v}),

  _token: null,
  setToken: (t) => { setTokenInternal(t); },

  user:null, setUser:u=>set({user:u}),

  pendingVolume: {
    requirement: 0, current: 0, remaining: 0,
    completed: false, progress: 0, message: 'No active pending volume',
  },
  setPendingVolume: (pv) => set({ pendingVolume: pv }),

  initSession: async () => {
    if (!_accessToken) return;

    try {
      const res = await apiFetch('/user/me');

      if (res.ok) {
        const data = await res.json();
        const user = data.data?.user || data.user;
        if (!user) return;

        if (user.role === "main_admin") {
          get().setAdminAuthed(true);
          get().setAdminRole("main");
          get().setShowAdmin(true);
          set({ user });
          return;
        }
        if (user.role === "sub_admin") {
          get().setAdminAuthed(true);
          get().setAdminRole("second");
          get().setShowAdmin(true);
          set({ user });
          return;
        }

        set({ user: mapApiUser(user) });
        get().fetchUserHistory();
        get().fetchNotifs();
        get().loadActiveTrades();
        get().fetchPendingVolume();
        get().startTradePolling();
      } else {
        setTokenInternal(null, null);
      }
    } catch (_) {
      // Network error — keep token, don't log user out
    }
  },

  fetchUserHistory: async () => {
    try {
      const txRes = await apiFetch("/user/transactions?limit=50");
      if (txRes.ok) {
        const txData = await txRes.json();
        set({ txHistory: (txData.data?.transactions || []).map(mapTx) });
      }
    } catch (_) {}
    try {
      const ordRes = await apiFetch("/trade/copy/history?limit=30");
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        set({ orderHistory: (ordData.data?.orders || []).map(mapOrder) });
      }
    } catch (_) {}
  },

  fetchPendingVolume: async () => {
    try {
      const res = await apiFetch("/user/pending-volume");
      if (!res.ok) return;
      const { pendingVolume } = (await res.json()).data;
      set({ pendingVolume });
    } catch (_) {}
  },

  login: async (email, password) => {
    const { addToast, setAdminAuthed, setAdminRole, setShowAdmin, fetchUserHistory, fetchNotifs, loadActiveTrades, fetchPendingVolume } = get();
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include", body:JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success:false, message: data.message||"Invalid email or password" };

      const { accessToken, refreshToken, user } = data.data;
      setTokenInternal(accessToken, refreshToken);

      if (user.role === "main_admin") {
        setAdminAuthed(true); setAdminRole("main"); setShowAdmin(true);
        set({ user }); addToast("Welcome, Main Admin!", "ok");
        return { success:true, isAdmin:true };
      }
      if (user.role === "sub_admin") {
        setAdminAuthed(true); setAdminRole("second"); setShowAdmin(true);
        set({ user }); addToast("Welcome, Admin!", "ok");
        return { success:true, isAdmin:true };
      }

      set({ user: mapApiUser(user) });
      addToast("Welcome back!", "ok");
      fetchUserHistory();
      fetchNotifs();
      loadActiveTrades();
      fetchPendingVolume();
      get().startTradePolling();
      return { success:true };
    } catch (_) {
      return { success:false, message:"Network error — is the server running?" };
    }
  },

  register: async (username, email, password, referralCode) => {
    const { addToast, fetchPendingVolume } = get();
    try {
      const res = await fetch(`${API}/auth/register`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include", body:JSON.stringify({ fullName:username, email, password, referralCode }),
      });
      const data = await res.json();
      if (!res.ok) return { success:false, message:data.message||"Registration failed" };
      const { accessToken, refreshToken, user } = data.data;
      setTokenInternal(accessToken, refreshToken);
      set({ user: mapApiUser({...user, fullName:username, username}) });
      addToast("Welcome to OctaExchange! 🎉", "ok");
      fetchPendingVolume();
      return { success:true };
    } catch (_) {
      return { success:false, message:"Network error — is the server running?" };
    }
  },

  logout: async () => {
    try { await apiFetch("/auth/logout", { method:"POST" }); } catch (_) {}
    setTokenInternal(null, null);
    get().stopTradePolling();
    set({
      user:null, adminAuthed:false, adminRole:null, showAdmin:false,
      page:"home", activeTrades:[], orderHistory:[], txHistory:[], notifs:[],
      _tradePoller: null,
      pendingVolume: { requirement:0, current:0, remaining:0, completed:false, progress:0, message:'No active pending volume' },
    });
  },

  refreshBalances: async () => {
    try {
      const res = await apiFetch("/user/balances");
      if (!res.ok) return;
      const { fundingBalance, tradingBalance } = (await res.json()).data;
      set(s => ({ user: s.user ? {...s.user, fundingBalance, tradingBalance} : s.user }));
    } catch (_) {}
  },

  forgotPassword: async (email) => {
    try {
      const res = await apiFetch("/auth/forgot-password",{method:"POST",body:JSON.stringify({email})});
      return {success:res.ok, message:(await res.json()).message};
    } catch (_) { return {success:false, message:"Network error"}; }
  },

  verifyOtp: async (email, otp) => {
    try {
      const res = await apiFetch("/auth/verify-email",{method:"POST",body:JSON.stringify({email,otp})});
      return {success:res.ok, message:(await res.json()).message};
    } catch (_) { return {success:false, message:"Network error"}; }
  },

  verifyResetOtp: async (email, otp) => {
    try {
      const res = await apiFetch("/auth/verify-reset",{method:"POST",body:JSON.stringify({email,otp})});
      return {success:res.ok, message:(await res.json()).message};
    } catch (_) { return {success:false, message:"Network error"}; }
  },

  resetPassword: async (email, otp, newPassword) => {
    const { addToast } = get();
    try {
      const res = await apiFetch("/auth/reset-password",{method:"POST",body:JSON.stringify({email,otp,newPassword})});
      const data = await res.json();
      if (res.ok) addToast("Password reset! Please log in.","ok");
      return {success:res.ok, message:data.message};
    } catch (_) { return {success:false, message:"Network error"}; }
  },

  submitDeposit: async ({ amount, network, txId }) => {
    const { addToast, addTx } = get();
    try {
      const netMap = {trc20:"TRC20",erc20:"ERC20",bep20:"BEP20"};
      const res = await apiFetch("/deposit/submit",{method:"POST",body:JSON.stringify({amount, network:netMap[network]||network.toUpperCase(), txId})});
      const data = await res.json();
      if (!res.ok) { addToast(data.message||"Deposit failed","err"); return {success:false, message:data.message}; }
      addTx({ id:"tx"+Date.now(), type:"deposit", label:"Deposit", wallet:"funding", amount, fee:0, net:amount, network:network.toUpperCase(), status:"pending", date:new Date().toLocaleDateString(), hash:txId });
      addToast("Deposit submitted — admin will credit your account","info");
      return {success:true};
    } catch (_) { addToast("Network error","err"); return {success:false}; }
  },

  submitWithdrawal: async ({ amount, network, walletAddress }) => {
    const { addToast, addTx, user, setUser } = get();
    try {
      const netMap = {trc20:"TRC20",erc20:"ERC20",bep20:"BEP20"};
      const res = await apiFetch("/withdraw/submit",{method:"POST",body:JSON.stringify({amount, network:netMap[network]||network.toUpperCase(), walletAddress})});
      const data = await res.json();
      if (!res.ok) { addToast(data.message||"Withdrawal failed","err"); return {success:false, message:data.message}; }
      const newFundBal = data.data?.fundingBalance ?? (user.fundingBalance - amount);
      const fee = parseFloat((amount*FUND_WD_FEE).toFixed(2));
      setUser({...user, fundingBalance:newFundBal});
      addTx({ id:"tx"+Date.now(), type:"withdrawal", label:"Withdrawal", wallet:"funding", amount, fee, net:amount-fee, network:network.toUpperCase(), status:"pending", date:new Date().toLocaleDateString(), address:walletAddress });
      addToast("Withdrawal submitted","info");
      return {success:true};
    } catch (_) { addToast("Network error","err"); return {success:false}; }
  },

  transferToTrading: async (amount) => {
    const { addToast, addTx, user, setUser, fetchPendingVolume } = get();
    if (!user||amount<=0||amount>(user.fundingBalance||0)) { addToast("Insufficient funding balance","err"); return; }
    try {
      const res = await apiFetch("/transfer",{method:"POST",body:JSON.stringify({amount, direction:"funding_to_trading"})});
      const data = await res.json();
      if (!res.ok) { addToast(data.message||"Transfer failed","err"); return; }
      const { fundingBalance, tradingBalance, pendingVolume } = data.data;
      setUser({...user, fundingBalance, tradingBalance});
      set({ pendingVolume });
      addTx({ id:"tx"+Date.now(), type:"transfer_in", label:"Transfer In", wallet:"trading", amount, fee:0, net:data.data.transferred||amount, note:`Pending Volume: Need $${pendingVolume.requirement.toFixed(2)} to transfer without fees`, status:"completed", date:new Date().toLocaleDateString() });
      addToast(`Transfer successful! Pending volume: $${pendingVolume.requirement.toFixed(2)} required`,"ok");
    } catch (_) { addToast("Network error","err"); }
  },

  transferToFunding: async (amount) => {
    const { addToast, addTx, user, setUser } = get();
    if (!user||amount<=0||amount>(user.tradingBalance||0)) { addToast("Insufficient trading balance","err"); return; }
    try {
      const res = await apiFetch("/transfer",{method:"POST",body:JSON.stringify({amount, direction:"trading_to_funding"})});
      const data = await res.json();
      if (!res.ok) { addToast(data.message||"Transfer failed","err"); return; }
      const { fundingBalance, tradingBalance, feeApplied, fee, feePercentage, pendingVolume } = data.data;
      setUser({...user, fundingBalance, tradingBalance});
      set({ pendingVolume });
      addTx({ id:"tx"+Date.now(), type:"transfer_out", label:"Transfer Out", wallet:"funding", amount, fee:fee||0, net:amount-(fee||0), note:feeApplied?`Transfer with ${feePercentage}% fee (pending volume incomplete)`:`Transfer with 0% fee (pending volume completed)`, status:"completed", date:new Date().toLocaleDateString() });
      if (feeApplied) addToast(`Transfer completed with ${feePercentage}% fee ($${fee.toFixed(2)}). Pending: $${pendingVolume.remaining.toFixed(2)} remaining.`,"info");
      else addToast(`Transfer completed with 0% fee! ✅`,"ok");
    } catch (_) { addToast("Network error","err"); }
  },

  submitSignalCode: async (code) => {
    const { addToast, addTrade, user, prices } = get();
    if ((user?.tradingBalance??0)<=0) return {success:false, message:"Transfer funds to Trading Account first."};
    try {
      const res = await apiFetch("/trade/copy/submit-signal",{method:"POST",body:JSON.stringify({signalCode:code, clientPrices:prices})});
      const data = await res.json();
      if (!res.ok) return {success:false, message:data.message||"Invalid signal code"};
      const order = data.data.order;
      const coinSym = order.coin?.replace("USDT","")||"BTC";
      addTrade({
        id:order._id, pair:order.coin, coin:coinSym,
        code:order.signalCode||code, profit:order.profitAmount,
        side:order.direction==="LONG"?"BUY":"SELL",
        entry:order.entryPrice||get().prices[coinSym]||0, qty:0,
        openTime:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),
        expiresAt:order.expiresAt, _apiId:order._id,
      });
      addToast(`${order.direction} signal confirmed — +$${order.profitAmount?.toFixed(2)} in 5 minutes`,"ok");
      return {success:true, order};
    } catch (_) { return {success:false, message:"Network error"}; }
  },

  loadActiveTrades: async () => {
    try {
      const res = await apiFetch("/trade/copy/active");
      if (!res.ok) return;
      const data = await res.json();
      const trades = (data.data?.orders || []).map(order => ({
        id:order._id, pair:order.coin, coin:order.coin?.replace("USDT","")||"BTC",
        code:order.signalCode, profit:order.profitAmount,
        side:order.direction==="LONG"?"BUY":"SELL", entry:order.entryPrice||0, qty:0,
        openTime:new Date(order.createdAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),
        expiresAt:order.expiresAt, _apiId:order._id,
      }));
      set({ activeTrades: trades });
    } catch (_) {}
  },

  _tradePoller: null,
  startTradePolling: () => {
    const { _tradePoller, loadActiveTrades } = get();
    if (_tradePoller) return;
    const poll = async () => {
      const prevTrades = [...get().activeTrades];
      await loadActiveTrades();
      const currTrades = get().activeTrades;
      const prevIds = new Set(prevTrades.map(t => t.id));
      const currIds = new Set(currTrades.map(t => t.id));
      const completed = [...prevIds].some(id => !currIds.has(id));
      if (completed) setTimeout(() => { get().fetchUserHistory(); }, 3000);
    };
    const id = setInterval(poll, 10000);
    set({ _tradePoller: id });
  },

  stopTradePolling: () => {
    const { _tradePoller } = get();
    if (_tradePoller) { clearInterval(_tradePoller); set({ _tradePoller: null }); }
  },

  fetchNotifs: async () => {
    try {
      const res = await apiFetch("/user/notifications");
      if (!res.ok) return;
      const notifications = (await res.json()).data.notifications;
      const notifs = notifications.map(n => ({
        id:n._id, title:n.title, body:n.message,
        time:timeAgo(new Date(n.createdAt)), read:n.isRead, type:n.type,
      }));
      set({ notifs });
      const hasNewBonus = notifications.some(n => n.type === 'referral' && !n.isRead);
      if (hasNewBonus) get().refreshBalances();
    } catch (_) {}
  },

  fetchTeam: async () => {
    try {
      const res = await apiFetch("/user/team");
      if (!res.ok) return;
      const { total, members } = (await res.json()).data;
      set(s => ({
        user: s.user ? {
          ...s.user, referralCount: total,
          referrals: members.map(m => ({
            id:m._id, name:m.fullName, email:m.email,
            joined:new Date(m.createdAt).toLocaleDateString(),
            kycStatus:m.kycStatus, tier:m.tier||'Bronze',
            deposited:true, earned:5, status:'active',
          }))
        } : s.user
      }));
    } catch (_) {}
  },

  generateSignal: async ({ coin, direction, tier, expiryMinutes }) => {
    const { addToast, addSignal } = get();
    try {
      const res = await apiFetch("/admin/signals/generate",{method:"POST",body:JSON.stringify({coin,direction,tier:tier||"All",expiryMinutes:expiryMinutes||15})});
      const data = await res.json();
      if (!res.ok) { addToast(data.message||"Failed","err"); return null; }
      const sig = data.data.signal;
      addSignal(sig.code,{coin:sig.coin.replace("USDT",""),pair:sig.coin,side:sig.direction==="LONG"?"BUY":"SELL",created:Date.now(),ttl:(expiryMinutes||15)*60*1000});
      addToast(`Signal ${sig.code} generated!`,"ok");
      return sig;
    } catch (_) { addToast("Network error","err"); return null; }
  },

  fetchSignals: async () => {
    try {
      const res = await apiFetch("/admin/signals");
      if (!res.ok) return [];
      const data = await res.json();
      return data.data?.signals || data.signals || [];
    } catch (_) { return []; }
  },

  approveDeposit: async (id) => {
    const { addToast } = get();
    try {
      const res = await apiFetch(`/admin/deposits/${id}/approve`,{method:"PUT",body:JSON.stringify({note:"Approved"})});
      if (res.ok) addToast("Deposit approved ✅","ok"); else addToast((await res.json()).message||"Failed","err");
      return res.ok;
    } catch (_) { addToast("Network error","err"); return false; }
  },

  rejectDeposit: async (id) => {
    const { addToast } = get();
    try {
      const res = await apiFetch(`/admin/deposits/${id}/reject`,{method:"PUT",body:JSON.stringify({note:"Rejected"})});
      if (res.ok) addToast("Deposit rejected","info"); else addToast((await res.json()).message||"Failed","err");
      return res.ok;
    } catch (_) { addToast("Network error","err"); return false; }
  },

  approveWithdrawal: async (id) => {
    const { addToast } = get();
    try {
      const res = await apiFetch(`/admin/withdrawals/${id}/approve`,{method:"PUT",body:JSON.stringify({note:"Approved"})});
      if (res.ok) addToast("Withdrawal approved ✅","ok");
      return res.ok;
    } catch (_) { return false; }
  },

  rejectWithdrawal: async (id) => {
    const { addToast } = get();
    try {
      const res = await apiFetch(`/admin/withdrawals/${id}/reject`,{method:"PUT",body:JSON.stringify({note:"Rejected"})});
      if (res.ok) addToast("Withdrawal rejected + refunded","info");
      return res.ok;
    } catch (_) { return false; }
  },

  fetchAdminDeposits: async (status = "pending") => {
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await apiFetch(`/admin/deposits${qs}`);
      if (!res.ok) return [];
      return (await res.json()).data?.deposits?.map(d=>({
        id:d._id, user:d.userId?.fullName||"Unknown",
        uid:d.userId?"OCT"+String(d.userId._id||d.userId).slice(-6).toUpperCase():"—",
        tier:d.tier||"—", network:d.network||"—", hash:d.txId||"—",
        amount:d.amount, status:d.status, date:d.createdAt?.split("T")[0]||"",
      })) || [];
    } catch (_) { return []; }
  },

  fetchAdminWithdrawals: async (status = "pending") => {
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await apiFetch(`/admin/withdrawals${qs}`);
      if (!res.ok) return [];
      return (await res.json()).data?.withdrawals?.map(w=>({
        id:w._id, user:w.userId?.fullName||"Unknown",
        uid:w.userId?"OCT"+String(w.userId._id||w.userId).slice(-6).toUpperCase():"—",
        amount:w.amount, fee:w.fee||0, netAmount:w.netAmount||w.amount,
        network:w.network, address:w.walletAddress||"—",
        status:w.status, date:w.createdAt?.split("T")[0]||"",
      })) || [];
    } catch (_) { return []; }
  },

  fetchAdminUsers: async () => {
    try {
      const res = await apiFetch("/admin/users");
      if (!res.ok) return [];
      return (await res.json()).data?.users?.map(u => ({
        id:u._id, name:u.fullName||u.email?.split("@")[0]||"—",
        email:u.email||"—", phone:u.phone||"",
        joined:u.createdAt?.split("T")[0]||"", tier:u.tier||"No Tier",
        fundBal:u.fundingBalance||0, tradeBal:u.tradingBalance||0,
        earnings:u.totalProfit||0, withdrawn:0, kycStatus:u.kycStatus||"none",
        referralCount:u.teamCount||0, referralCode:u.referralCode||"",
        uid:"OCT"+(u._id||"").slice(-6).toUpperCase(), isHidden:u.isHidden||false,
        referredBy:u.referredBy?`${u.referredBy.fullName} (${u.referredBy.referralCode})`:null,
        referredById:u.referredBy?._id||null,
      })) || [];
    } catch (_) { return []; }
  },

  fetchAdminDashboard: async () => {
    try {
      const res = await apiFetch('/admin/dashboard');
      if (!res.ok) return null;
      return (await res.json()).data || null;
    } catch (_) { return null; }
  },

  updateAdminUser: async (userId, updates) => {
    const { addToast } = get();
    try {
      const body = {};
      if (updates.name      !== undefined) body.fullName       = updates.name;
      if (updates.email     !== undefined) body.email          = updates.email;
      if (updates.phone     !== undefined) body.phone          = updates.phone;
      if (updates.fundBal   !== undefined) body.fundingBalance = updates.fundBal;
      if (updates.tradeBal  !== undefined) body.tradingBalance = updates.tradeBal;
      if (updates.earnings  !== undefined) body.totalProfit    = updates.earnings;
      if (updates.kycStatus !== undefined) body.kycStatus      = updates.kycStatus;
      if (updates.tier      !== undefined) body.tier           = updates.tier;
      const res = await apiFetch(`/admin/users/${userId}`,{method:"PUT",body:JSON.stringify(body)});
      const data = await res.json();
      if (res.ok) addToast("User updated ✅","ok"); else addToast(data.message||"Update failed","err");
      return res.ok;
    } catch (_) { return false; }
  },

  broadcastNotif: async (title, body) => {
    const { addToast } = get();
    try {
      const res = await apiFetch("/admin/notifications/broadcast",{method:"POST",body:JSON.stringify({title,message:body,type:"broadcast"})});
      if (res.ok) addToast("Notification sent! ✅","ok");
      return res.ok;
    } catch (_) { return false; }
  },

  setPriceWick: async (sym, targetPrice, durationSeconds) => {
    const { addToast, prices, setWick } = get();
    setWick({sym, startPrice:prices[sym], targetPrice, startAt:Date.now(), durationMs:durationSeconds*1000});
    try {
      await apiFetch("/admin/price-wick",{method:"PUT",body:JSON.stringify({
        symbol:sym+"USDT",
        wickPercent:Math.abs((targetPrice-prices[sym])/prices[sym]*100),
        direction:targetPrice>prices[sym]?"up":"down",
        durationSeconds,
      })});
    } catch (_) {}
    addToast(`Wick applied to ${sym}`,"ok");
  },

  prices:buildPrices(),
  charts:buildCharts(),
  candles:(()=>{ const c={}; Object.keys(COINS).forEach(k=>{c[k]=buildCandles(k);}); return c; })(),
  _ct:{}, wick:null, setWick:w=>set({wick:w}),

  fetchRealPrices: async () => {
    try {
      const r = await fetch(`${API}/prices`, { cache: "no-store" });
      if (!r.ok) return;
      const data = await r.json();
      const np = {...get().prices};
      Object.entries(GID).forEach(([sym,id]) => { if(data[id]?.usd) np[sym]=data[id].usd; });
      set({prices:np});
    } catch (_) {}
  },

  tickPrices: () => {
    set(state => {
      const np={...state.prices}, nc={...state.charts}, nk={...state.candles};
      const wick=state.wick, nct={...state._ct}; let nextWick=wick;
      Object.keys(COINS).forEach(sym => {
        const base=COINS[sym].price;
        if (wick&&wick.sym===sym) {
          const elapsed=Date.now()-wick.startAt, half=wick.durationMs/2;
          if (elapsed<wick.durationMs) {
            if (elapsed<half) { const pct=elapsed/half; np[sym]=wick.startPrice+(wick.targetPrice-wick.startPrice)*pct; }
            else { const pct=(elapsed-half)/half; np[sym]=wick.targetPrice+(wick.startPrice-wick.targetPrice)*pct; }
          } else { np[sym]=wick.startPrice; nextWick=null; }
        } else {
          const drift=(Math.random()-.485)*.003;
          np[sym]=Math.max(base*.85,Math.min(base*1.15,(np[sym]||base)*(1+drift)));
        }
        const arr=[...(nc[sym]||[]).slice(1)]; arr.push(np[sym]); nc[sym]=arr;
        const canArr=[...(nk[sym]||[])];
        if (canArr.length>0) {
          const last={...canArr[canArr.length-1]};
          last.c=np[sym]; last.h=Math.max(last.h,np[sym]); last.l=Math.min(last.l,np[sym]);
          if (wick&&wick.sym===sym) { last.h=Math.max(last.h,wick.targetPrice); last.l=Math.min(last.l,wick.targetPrice); }
          canArr[canArr.length-1]=last;
          nct[sym]=(nct[sym]||0)+1;
          if (nct[sym]>=30) { canArr.push({t:Date.now(),o:np[sym],h:np[sym],l:np[sym],c:np[sym]}); if(canArr.length>120)canArr.shift(); nct[sym]=0; }
          nk[sym]=canArr;
        }
      });
      return {prices:np, charts:nc, candles:nk, wick:nextWick, _ct:nct};
    });
  },

  signals:{},
  addSignal:(code,data)=>set(s=>({signals:{...s.signals,[code]:data}})),
  activeTrades:[],
  addTrade:t=>set(s=>({activeTrades:[...s.activeTrades,t]})),
  removeTrade:id=>set(s=>({activeTrades:s.activeTrades.filter(t=>t.id!==id)})),
  futPos:[],
  openFuture:pos=>set(s=>({futPos:[...s.futPos,pos]})),
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

  orderHistory:[],
  addOrder:o=>set(s=>({orderHistory:[o,...s.orderHistory]})),
  txHistory:[],
  addTx:tx=>set(s=>({txHistory:[tx,...s.txHistory]})),

  notifs:[],
  markRead:id=>set(s=>({notifs:s.notifs.map(n=>n.id===id?{...n,read:true}:n)})),
  markAllRead:()=>set(s=>({notifs:s.notifs.map(n=>({...n,read:true}))})),
  addNotif:n=>set(s=>({notifs:[n,...s.notifs]})),

  banners:[...BANNERS_INIT],
  addBanner:b=>set(s=>({banners:[...s.banners,b]})),
  toggleBanner:id=>set(s=>({banners:s.banners.map(b=>b.id===id?{...b,active:!b.active}:b)})),
  deleteBanner:id=>set(s=>({banners:s.banners.filter(b=>b.id!==id)})),

  toasts:[],
  addToast:(msg,type="info")=>{
    const id=Date.now()+Math.random();
    set(s=>({toasts:[...s.toasts,{id,msg,type}]}));
    setTimeout(()=>set(s=>({toasts:s.toasts.filter(t=>t.id!==id)})),4000);
  },
  removeToast:id=>set(s=>({toasts:s.toasts.filter(t=>t.id!==id)})),
}));