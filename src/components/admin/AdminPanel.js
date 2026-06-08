import { useState, useEffect, useRef, useMemo } from "react";
import { useStore } from "@/lib/store";
import { PAIRS, COINS, getRefLevel, TIERS } from "@/lib/data";

function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
    hour:  "2-digit",
    minute:"2-digit",
    hour12: true,
  });
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const PAGE_SIZE = 50;

const MENU_MAIN = [
  {id:"dash",   icon:"📊", label:"Dashboard"},
  {id:"users",  icon:"👥", label:"Users"},
  {id:"team",   icon:"🌐", label:"My Team"},
  {id:"codes",  icon:"🔑", label:"Signals"},
  {id:"price",  icon:"📈", label:"Price Control"},
  {id:"deps",   icon:"⬇",  label:"Deposits"},
  {id:"wds",    icon:"⬆",  label:"Withdrawals"},
  {id:"kyc",    icon:"🪪",  label:"KYC"},
  {id:"salary", icon:"💰", label:"Salary"},
  {id:"banners",icon:"🖼",  label:"Banners"},
  {id:"notifs", icon:"🔔", label:"Notifs"},
  {id:"notify", icon:"📨", label:"Notify User"},
];

const MENU_SUB = [
  {id:"dash",  icon:"📊", label:"Dashboard"},
  {id:"users", icon:"👥", label:"Users"},
  {id:"team",  icon:"🌐", label:"My Team"},
  {id:"codes", icon:"🔑", label:"Signals"},
  {id:"deps",  icon:"⬇",  label:"Deposits"},
  {id:"wds",   icon:"⬆",  label:"Withdrawals"},
  {id:"kyc",   icon:"🪪",  label:"KYC"},
];

function SB({s}){
  const c=s==="approved"||s==="active"?"b-up":s==="pending"?"b-au":"b-dn";
  return <span className={`badge ${c}`} style={{fontSize:10}}>{s}</span>;
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const range = new Set([1, totalPages, page, page - 1, page + 1].filter(p => p >= 1 && p <= totalPages));
  const sorted = [...range].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push("...");
    pages.push(sorted[i]);
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 0", flexWrap: "wrap" }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: page === 1 ? "var(--t3)" : "var(--t2)", fontSize: 12, fontWeight: 700, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>
        ‹ Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} style={{ color: "var(--t3)", fontSize: 12, padding: "0 4px" }}>…</span>
        ) : (
          <button key={p} onClick={() => onPage(p)}
            style={{ padding: "6px 11px", borderRadius: 8, border: `1.5px solid ${p === page ? "var(--gold)" : "var(--ln)"}`, background: p === page ? "rgba(240,165,0,.15)" : "var(--ink3)", color: p === page ? "var(--gold)" : "var(--t2)", fontSize: 12, fontWeight: 700, cursor: "pointer", minWidth: 34 }}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: page === totalPages ? "var(--t3)" : "var(--t2)", fontSize: 12, fontWeight: 700, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>
        Next ›
      </button>
      <span style={{ fontSize: 11, color: "var(--t3)", marginLeft: 4 }}>Page {page} of {totalPages}</span>
    </div>
  );
}

function SearchBar({ value, onSearch, placeholder }) {
  return (
    <div className="iw" style={{ marginBottom: 14 }}>
      <input
        className="inp"
        placeholder={placeholder ?? "Search..."}
        value={value ?? ""}
        onChange={e => onSearch(e.target.value)}
        style={{ paddingLeft: 40, fontSize: 13 }}
      />
      <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", pointerEvents: "none" }}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
    </div>
  );
}

function ModalField({ label, value, onChange, type = "text" }) {
  return (
    <div className="fg">
      <label className="lbl" style={{ fontSize: 10, letterSpacing: "1px", color: "var(--t3)", fontFamily: "var(--m)" }}>{label.toUpperCase()}</label>
      <input className="inp" type={type} value={value} autoComplete="off" onChange={e => onChange(e.target.value)} style={{ padding: "11px 14px", fontSize: 14, background: "var(--ink)" }}/>
    </div>
  );
}

function EditModal({ user, onSave, onClose }) {
  const [name,  setName]  = useState(user.name       || "");
  const [email, setEmail] = useState(user.email      || "");
  const [phone, setPhone] = useState(user.phone      || "");
  const [fb,    setFb]    = useState(String(user.fundBal   ?? 0));
  const [tb,    setTb]    = useState(String(user.tradeBal  ?? 0));
  const [earn,  setEarn]  = useState(String(user.earnings  ?? 0));
  const [wd,    setWd]    = useState(String(user.withdrawn ?? 0));
  const [tier,  setTier]  = useState(String(user.tier      ?? ""));
  const [kyc,   setKyc]   = useState(user.kycStatus  ?? "none");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const save = () => {
    onSave({ ...user, name, email, phone, fundBal: parseFloat(fb)||0, tradeBal: parseFloat(tb)||0, earnings: parseFloat(earn)||0, withdrawn: parseFloat(wd)||0, tier, kycStatus: kyc });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(8px)", zIndex: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "var(--ink3)", border: "1px solid var(--ln2)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 440, maxHeight: "92dvh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Edit User</div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>UID: <span style={{ color: "var(--gold)", fontFamily: "var(--m)" }}>{user.uid || "—"}</span></div>
          </div>
          <button onClick={onClose} style={{ color: "var(--t3)", fontSize: 22, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
        <ModalField label="Full Name / Username" value={name}  onChange={setName}/>
        <ModalField label="Email"                value={email} onChange={setEmail} type="email"/>
        <ModalField label="Phone"                value={phone} onChange={setPhone} type="tel"/>
        <ModalField label="Funding Balance ($)"  value={fb}    onChange={setFb}    type="number"/>
        <ModalField label="Trading Balance ($)"  value={tb}    onChange={setTb}    type="number"/>
        <ModalField label="Total Earned ($)"     value={earn}  onChange={setEarn}  type="number"/>
        <ModalField label="Withdrawn ($)"        value={wd}    onChange={setWd}    type="number"/>
        <div className="fg">
          <label className="lbl" style={{ fontSize: 10, letterSpacing: "1px", color: "var(--t3)", fontFamily: "var(--m)" }}>TIER (SUBSCRIPTION)</label>
          <select value={tier} onChange={e => setTier(e.target.value)} className="inp" style={{ padding: "11px 14px", fontSize: 13, background: "var(--ink)" }}>
            <option value="">No Tier</option>
            {TIERS.map(t => (<option key={t.id} value={String(t.id)}>{t.name} — ${t.price.toLocaleString()} (+${t.profit}/trade)</option>))}
          </select>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>Setting tier activates it immediately for the user.</div>
        </div>
        <div className="fg">
          <label className="lbl" style={{ fontSize: 10, letterSpacing: "1px", color: "var(--t3)", fontFamily: "var(--m)" }}>KYC STATUS</label>
          <select value={kyc} onChange={e => setKyc(e.target.value)} className="inp" style={{ padding: "11px 14px", fontSize: 13, background: "var(--ink)" }}>
            {["none","pending","approved","rejected"].map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-gold"  style={{ flex: 2 }} onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

async function af(path, opts = {}) {
  try {
    const token = useStore.getState()._token;
    const h = { "Content-Type": "application/json", ...(opts.headers || {}) };
    if (token) h["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API}${path}`, { ...opts, headers: h, credentials: "include" });
    if (res.status === 401 && !opts._retry) {
      const rr = await fetch(`${API}/auth/refresh`, { method: "POST", credentials: "include" });
      if (rr.ok) {
        const rd = await rr.json();
        const newToken = rd.data?.accessToken || rd.accessToken;
        useStore.getState().setToken(newToken);
        return af(path, { ...opts, _retry: true });
      }
    }
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, status: res.status };
  } catch (e) {
    return { ok: false, data: { message: "Network error" }, status: 0 };
  }
}

function FilterRow({ value, onChange, opts, onRefresh }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {opts.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)}
          style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${value === v ? "var(--gold)" : "var(--ln)"}`, background: value === v ? "rgba(240,165,0,.1)" : "var(--ink3)", color: value === v ? "var(--gold)" : "var(--t2)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          {label}
        </button>
      ))}
      <button onClick={onRefresh} style={{ marginLeft: "auto", padding: "7px 12px", borderRadius: 10, border: "1px solid var(--ln)", background: "var(--ink3)", color: "var(--t3)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>🔄 Refresh</button>
    </div>
  );
}

function DepositedBadge() {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: "rgba(0,200,150,.15)", color: "var(--up)", border: "1px solid rgba(0,200,150,.3)" }}>✓ Deposited</span>
  );
}

function usePagination(items, pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  useEffect(() => { setPage(1); }, [items.length]);
  return { page: safePage, totalPages, slice, setPage };
}

export default function AdminPanel({ onExit, role }) {
  const isMain = role === "main";
  const MENU   = isMain ? MENU_MAIN : MENU_SUB;

  const {
  addToast, addSignal, banners, addBanner, toggleBanner, deleteBanner,
  addNotif, prices, setWick,
  generateSignal, fetchSignals, approveDeposit, rejectDeposit,
  approveWithdrawal, rejectWithdrawal,
  fetchAdminDeposits, fetchAdminWithdrawals, fetchAdminUsers, fetchAdminDashboard,
  fetchAdminUserTeam,
  updateAdminUser, broadcastNotif, sendNotifToUser, setPriceWick,
  sendSalary, fetchSalaryHistory,
  _adminDashboard, _adminUsers, _adminDeps, _adminWds,
} = useStore();

  const [sec,       setSec]      = useState("dash");
  const [users,     setUsers]    = useState([]);
  const [deps,      setDeps]     = useState([]);
  const [wds,       setWds]      = useState([]);
  const [kycs,      setKycs]     = useState([]);
  const [dashboard, setDashboard]= useState(null);

  const HISTORY_STORAGE_KEY = "octatrade_admin_signal_history";
  const [codes,         setCodes]        = useState([]);
  const [signalHistory, setSignalHistory]= useState([]);
  const signalHistoryRef = useRef([]);

  const [editU,    setEditU]   = useState(null);
  const [loading,  setLoading] = useState(false);
  const [depF,     setDepF]    = useState("pending");
  const [wdF,      setWdF]     = useState("pending");
  const [kycF,     setKycF]    = useState("pending");
  const [previewImage, setPreviewImage] = useState(null);

  const [uQ,       setUQ]       = useState("");
const [userFilter, setUserFilter] = useState("all");
const [dQ,  setDQ]  = useState("");
const [wQ,  setWQ]  = useState("");
const [kQ,  setKQ]  = useState("");

  const [selPair, setSelPair] = useState(PAIRS[0]);
  const [selSide, setSelSide] = useState("BUY");
  const [gCode,   setGCode]   = useState("");
  const [gBusy,   setGBusy]   = useState(false);
  const [wSym,    setWSym]    = useState("BTC");
  const [wTarget, setWTarget] = useState("");
  const [wDur,    setWDur]    = useState("60");
  const [nb, setNb] = useState({ title: "", text: "", color: "#f0a500" });
  const [nf, setNf] = useState({ title: "", body: "" });

  // ── Notify User state ──────────────────────────────────────────────────────
  const [notifySearch,   setNotifySearch]   = useState("");
  // ── Salary state ───────────────────────────────────────────
const [salaryAmount,     setSalaryAmount]    = useState("");
const [salaryNote,       setSalaryNote]      = useState("");
const [salarySelected,   setSalarySelected]  = useState([]);
const [salarySearch,     setSalarySearch]    = useState("");
const [salarySending,    setSalarySending]   = useState(false);
const [salaryHistory,    setSalaryHistory]   = useState([]);
const [salaryHistPage,   setSalaryHistPage]  = useState(1);
const [salaryHistTotal,  setSalaryHistTotal] = useState(0);
const [salaryTab,        setSalaryTab]       = useState("send");
const [salaryLoading,    setSalaryLoading]   = useState(false);
  const [notifySelected, setNotifySelected] = useState(null);
  const [notifyTitle,    setNotifyTitle]    = useState("");
  const [notifyBody,     setNotifyBody]     = useState("");
  const [notifySending,  setNotifySending]  = useState(false);
  const [notifyLoading,  setNotifyLoading]  = useState(false);

  const [teamSearch,  setTeamSearch]  = useState("");
  const [teamResult,  setTeamResult]  = useState(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamTab,     setTeamTab]     = useState("referrals");
  const [teamMemberQ, setTeamMemberQ] = useState("");

  const timerRef     = useRef(null);
  const userPollRef  = useRef(null);
  const codesPollRef = useRef(null);

  // ── When store cache updates, push data into local state ──────────────────
  // This runs whenever the background pre-fetch finishes and saves data
  // to the store cache. It copies that data into local state so the
  // dashboard and stats show real numbers without clicking any tab.
  useEffect(() => {
    if (_adminDashboard && !dashboard) setDashboard(_adminDashboard);
    if (_adminUsers.length > 0 && users.length === 0) setUsers(_adminUsers);
    if (_adminDeps.length > 0 && deps.length === 0) setDeps(_adminDeps);
    if (_adminWds.length > 0 && wds.length === 0) setWds(_adminWds);
  // eslint-disable-next-line
  }, [_adminDashboard, _adminUsers, _adminDeps, _adminWds]);

  const persistHistory = (history) => {
    try { window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history)); } catch (e) {}
  };

  useEffect(() => {
    if (!isMain) return;
    try {
      const saved = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) { signalHistoryRef.current = parsed; setSignalHistory(parsed); }
      }
    } catch (e) {}
  }, [isMain]);

  // ── On mount: only load dashboard stats ───────────────────────────────────
// Everything else loads lazily when tab is opened
useEffect(() => {
  // Load only dashboard on mount — lightweight
  loadDashboardOnly();
  // Refresh only dashboard stats every 30 seconds
  timerRef.current = setInterval(loadDashboardOnly, 30_000);
  return () => clearInterval(timerRef.current);
// eslint-disable-next-line
}, []);

  // ── Lazy load tab data when tab is first opened ────────────────────────────
// Each tab loads its data ONLY when the admin navigates to it
// Filter changes also trigger a reload
useEffect(() => {
  if (sec === "users") load("users", userFilter);
// eslint-disable-next-line
}, [sec, userFilter]);

useEffect(() => {
  if (sec === "deps") load("deps");
// eslint-disable-next-line
}, [depF, sec === "deps" ? sec : null]);

useEffect(() => {
  if (sec === "wds") load("wds");
// eslint-disable-next-line
}, [wdF, sec === "wds" ? sec : null]);

useEffect(() => {
  if (sec === "kyc") load("kyc");
// eslint-disable-next-line
}, [kycF, sec === "kyc" ? sec : null]);

  // ── Reload codes when switching to codes tab ───────────────────────────────
  useEffect(() => {
    if (sec === "codes") {
      load("codes");
      codesPollRef.current = setInterval(() => load("codes"), 15_000);
    } else {
      if (codesPollRef.current) clearInterval(codesPollRef.current);
    }
    return () => { if (codesPollRef.current) clearInterval(codesPollRef.current); };
  // eslint-disable-next-line
  }, [sec]);

  // ── Auto-load users when navigating to Notify User tab ────────────────────
  useEffect(() => {
    if (sec === "notify" && users.length === 0) {
      loadUsersForNotify();
    }
  // eslint-disable-next-line
  }, [sec]);

  useEffect(() => {
  if (sec === "salary") {
    if (users.length === 0) loadUsersForNotify();
    loadSalaryHistory(1);
  }
// eslint-disable-next-line
}, [sec]);

  const loadUsers = async () => {
    const d = await fetchAdminUsers();
    if (Array.isArray(d)) setUsers(d);
  };

  // // ── Load ALL data at once — runs on mount and every 60s ───────────────────
  // const loadAll = async () => {
  //   try {
  //     // Run all fetches in parallel — do NOT set loading state here
  //     // to avoid blanking out the UI on background refreshes
  //     const [usersData, dashData, depsData, wdsData] = await Promise.all([
  //       fetchAdminUsers(),
  //       fetchAdminDashboard(),
  //       fetchAdminDeposits("pending"),
  //       fetchAdminWithdrawals("pending"),
  //     ]);

  //     if (Array.isArray(usersData) && usersData.length > 0) setUsers(usersData);
  //     if (dashData) setDashboard(dashData);

  //     // Only update deps/wds if we are currently showing pending
  //     // Don't overwrite "All History" view with just pending data
  //     if (Array.isArray(depsData) && depsData.length > 0 && depF === "pending") setDeps(depsData);
  //     if (Array.isArray(wdsData) && wdsData.length > 0 && wdF === "pending") setWds(wdsData);

  //     // Load KYC silently
  //     const kycStatus = kycF;
  //     const r = await af(`/admin/kyc?status=${kycStatus}&limit=1000`);
  //     if (r.ok) {
  //       const raw = r.data.data?.users || r.data.users || [];
  //       const arr = Array.isArray(raw) ? raw : [];
  //       if (arr.length > 0 || kycStatus === "pending") {
  //         setKycs(arr.map(u => ({
  //           id:        u._id,
  //           user:      u.kycName || u.kycFullName || u.fullName || "—",
  //           email:     u.email   || "",
  //           phone:     u.kycPhone || u.phone || "",
  //           uid:       "OCT" + (u._id || "").slice(-6).toUpperCase(),
  //           address:   u.kycAddress || "",
  //           submitted: u.kycSubmittedAt ? fmtDateTime(u.kycSubmittedAt) : fmtDateTime(u.createdAt),
  //           status:    u.kycStatus,
  //           kycFront:  u.kycFront || u.kycDocFront || null,
  //           kycBack:   u.kycBack  || u.kycDocBack  || null,
  //         })));
  //       }
  //     }
  //   } catch (_) {}
  // };

  // ── Load only dashboard stats — runs every 30 seconds ─────────────────────
// Does NOT load users, deposits, withdrawals, or KYC
// Only fetches the 5 numbers shown on the dashboard
const loadDashboardOnly = async () => {
  try {
    const stats = await fetchAdminDashboard();
    if (stats) setDashboard(stats);
  } catch (_) {}
};

const loadUsersForNotify = async () => {
    setNotifyLoading(true);
    const d = await fetchAdminUsers();
    if (Array.isArray(d)) setUsers(d);
    setNotifyLoading(false);
  };


  const loadSalaryHistory = async (page = 1) => {
  setSalaryLoading(true);
  const result = await fetchSalaryHistory(page);
  setSalaryHistory(result.logs || []);
  setSalaryHistTotal(result.total || 0);
  setSalaryHistPage(page);
  setSalaryLoading(false);
};



  const load = async (s, filter = "") => {
  setLoading(true);
  if (s === "dash") {
    const stats = await fetchAdminDashboard();
    if (stats) setDashboard(stats);
  }
  if (s === "users") {
    const d = await fetchAdminUsers(filter === "all" ? "" : filter);
    if (Array.isArray(d)) setUsers(d);
  }
  if (s === "notify") {
    const d = await fetchAdminUsers();
    if (Array.isArray(d)) setUsers(d);
  }
    if (s === "deps") {
      const statusParam = !isMain ? "pending" : depF === "all" ? "" : depF;
      const d = await fetchAdminDeposits(statusParam);
      if (Array.isArray(d)) setDeps(d);
    }
    if (s === "wds") {
      const statusParam = !isMain ? "pending" : wdF === "all" ? "" : wdF;
      const d = await fetchAdminWithdrawals(statusParam);
      if (Array.isArray(d)) setWds(d);
    }
    if (s === "kyc") {
      const status = kycF;
      const r = await af(`/admin/kyc?status=${status}&limit=1000`);
      if (r.ok) {
        const raw = r.data.data?.users || r.data.users || r.data.data || [];
        const arr = Array.isArray(raw) ? raw : [];
        setKycs(arr.map(u => ({
          id:        u._id,
          user:      u.kycName || u.kycFullName || u.fullName || u.name || "—",
          email:     u.email   || "",
          phone:     u.kycPhone || u.phone || "",
          uid:       "OCT" + (u._id || "").slice(-6).toUpperCase(),
          address:   u.kycAddress || "",
          submitted: u.kycSubmittedAt ? fmtDateTime(u.kycSubmittedAt) : fmtDateTime(u.createdAt),
          status:    u.kycStatus,
          kycFront:  u.kycFront || u.kycDocFront || null,
          kycBack:   u.kycBack  || u.kycDocBack  || null,
        })));
      }
    }
    if (s === "codes") {
      const signals = await fetchSignals();
      if (Array.isArray(signals)) {
        const now = Date.now();
        const activeSignals = signals.filter(sig => {
          const expiresMs = new Date(sig.expiresAt).getTime();
          return !isNaN(expiresMs) && expiresMs > now;
        });
        if (isMain) {
          const mergedById = {};
          signals.forEach(sig => {
            const expiresMs = new Date(sig.expiresAt).getTime();
            mergedById[sig._id] = { ...sig, isExpired: isNaN(expiresMs) ? false : expiresMs <= now };
          });
          signalHistoryRef.current.forEach(sig => {
            if (!mergedById[sig._id]) {
              mergedById[sig._id] = { ...sig, isExpired: !sig.expiresAt ? true : new Date(sig.expiresAt).getTime() <= now };
            }
          });
          const mergedHistory = Object.values(mergedById).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const expiredHistory = mergedHistory.filter(sig => sig.isExpired);
          signalHistoryRef.current = expiredHistory;
          setSignalHistory(expiredHistory);
          persistHistory(expiredHistory);
        } else {
          signalHistoryRef.current = [];
          setSignalHistory([]);
          persistHistory([]);
        }
        setCodes(activeSignals.map(sig => ({
          code: sig.code, pair: sig.coin.replace("USDT", ""),
          side: sig.direction === "LONG" ? "BUY" : "SELL",
          created: new Date(sig.createdAt).toLocaleString(),
          expires: new Date(sig.expiresAt).toLocaleString(),
          used: sig.usageCount || 0, status: "active",
        })));
      }
    }
    setLoading(false);
  };

  const refresh = () => { load(sec); addToast("Refreshed", "info"); };

  const normaliseTeamMember = (m) => {
    let refBy = null;
    if (m.referredBy) {
      if (typeof m.referredBy === "object" && m.referredBy !== null) {
        refBy = m.referredBy.fullName || m.referredBy.name || null;
      } else if (typeof m.referredBy === "string") {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(m.referredBy);
        if (isObjectId) {
          const match = users.find(u => u.id === m.referredBy || u.id?.toString() === m.referredBy);
          refBy = match ? match.name : null;
        } else {
          refBy = m.referredBy;
        }
      }
    }
    if (!refBy) {
      refBy = m.referredByName || m.referredByUser?.fullName || m.referredByUser?.name || m.referrer?.fullName || m.referrer?.name || m.referredByInfo?.fullName || m.referredByInfo?.name || m.parent?.fullName || m.parent?.name || null;
    }
    if (refBy && refBy.includes(" (")) refBy = refBy.split(" (")[0].trim();
    return { ...m, referredBy: refBy };
  };

  const doTeamSearch = async () => {
    if (!teamSearch.trim()) return;
    setTeamLoading(true);
    setTeamResult(null);
    const q = teamSearch.trim().toLowerCase();
    const found = users.find(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.uid?.toLowerCase().includes(q)
    );
    if (found) {
      const data = await fetchAdminUserTeam(found.id);
      if (data) {
        const idToName = {};
        users.forEach(u => { if (u.id) idToName[String(u.id)] = u.name; });
        if (found.id) idToName[String(found.id)] = found.name;
        (data.myReferrals?.members || []).forEach(m => { if (m.id) idToName[String(m.id)] = m.name; });
        (data.myTeam?.members || []).forEach(m => { if (m.id) idToName[String(m.id)] = m.name; });

        const normaliseWithMap = (m) => {
          let refBy = null;
          if (m.referredBy) {
            if (typeof m.referredBy === "object" && m.referredBy !== null) {
              refBy = m.referredBy.fullName || m.referredBy.name || null;
            } else if (typeof m.referredBy === "string") {
              const isObjectId = /^[0-9a-fA-F]{24}$/.test(m.referredBy);
              if (isObjectId) { refBy = idToName[m.referredBy] || null; }
              else { refBy = m.referredBy; }
            }
          }
          if (!refBy) { refBy = m.referredByName || m.referredByUser?.fullName || m.referredByUser?.name || m.referrer?.fullName || m.referrer?.name || null; }
          if (refBy && refBy.includes(" (")) refBy = refBy.split(" (")[0].trim();
          return { ...m, referredBy: refBy };
        };

        const normalised = {
          ...data,
          searchedUser: found,
          myReferrals: data.myReferrals ? { ...data.myReferrals, members: (data.myReferrals.members || []).map(normaliseWithMap) } : data.myReferrals,
          myTeam: data.myTeam ? { ...data.myTeam, members: (data.myTeam.members || []).map(normaliseWithMap) } : data.myTeam,
        };
        setTeamResult(normalised);
      } else {
        setTeamResult({ error: "Failed to load team data." });
      }
    } else {
      setTeamResult({ error: "User not found. Make sure users are loaded — visit the Users tab first." });
    }
    setTeamLoading(false);
  };

  const q = s => (s || "").toLowerCase();
  const visU = isMain ? users : users.filter(u => !u.isHidden);

  const fu = useMemo(() => visU.filter(u => {
    if (!uQ) return true;
    const qq = q(uQ);
    return q(u.name).includes(qq) || q(u.email).includes(qq) || q(u.phone).includes(qq) || q(u.uid).includes(qq);
  }), [visU, uQ]);

  const fd = useMemo(() => deps.filter(d => {
    if (!dQ) return true;
    const qq = q(dQ);
    return q(d.user).includes(qq) || q(d.email).includes(qq) || q(d.phone).includes(qq) || q(d.uid).includes(qq) || q(d.hash).includes(qq);
  }), [deps, dQ]);

  const fw = useMemo(() => wds.filter(w => {
    if (!wQ) return true;
    const qq = q(wQ);
    return q(w.user).includes(qq) || q(w.email).includes(qq) || q(w.phone).includes(qq) || q(w.uid).includes(qq) || q(w.address).includes(qq);
  }), [wds, wQ]);

  const fk = useMemo(() => kycs.filter(k => {
    if (!kQ) return true;
    const qq = q(kQ);
    return q(k.user).includes(qq) || q(k.email).includes(qq) || q(k.phone).includes(qq) || q(k.uid).includes(qq);
  }), [kycs, kQ]);

  const usersPag = usePagination(fu);
  const depsPag  = usePagination(fd);
  const wdsPag   = usePagination(fw);
  const kycPag   = usePagination(fk);

  const saveU = async (u) => {
    await updateAdminUser(u.id, { name: u.name, email: u.email, phone: u.phone, fundBal: u.fundBal, tradeBal: u.tradeBal, earnings: u.earnings, withdrawn: u.withdrawn, kycStatus: u.kycStatus, tier: u.tier });
    setUsers(p => p.map(x => x.id === u.id ? { ...x, ...u } : x));
  };

  const delU = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    const r = await af(`/admin/users/${id}`, { method: "DELETE" });
    if (r.ok) { setUsers(p => p.filter(x => x.id !== id)); addToast("User deleted", "info"); }
    else addToast("Delete failed", "err");
  };

  const toggleBan = async (id, name) => {
  const u = users.find(x => x.id === id);
  const isBanned = u?.isBanned || false;
  if (!window.confirm(`${isBanned ? "Unban" : "Ban"} ${name}?`)) return;
  const r = await af(`/admin/users/${id}/ban`, { method: "PUT" });
  if (r.ok) {
    setUsers(p => p.map(x => x.id === id ? { ...x, isBanned: !x.isBanned } : x));
    addToast(isBanned ? `${name} unbanned ✅` : `${name} banned 🔨`, "info");
  } else {
    addToast(r.data?.message || "Failed to toggle ban", "err");
  }
};
  
  const toggleHide = async (id) => {
  const r = await af(`/admin/users/${id}/hide`, { method: "PUT" });
  if (r.ok) {
    const u = users.find(x => x.id === id);
    setUsers(p => p.map(x => x.id === id ? { ...x, isHidden: !x.isHidden } : x));
    addToast(u?.isHidden ? "User now visible to Admin" : "User hidden from Admin", "info");
  } else { addToast(r.data?.message || "Failed to update visibility", "err"); }
};

  // ── Helper: refresh dashboard stats silently after any action ─────────────
  const refreshDash = async () => {
    const stats = await fetchAdminDashboard();
    if (stats) setDashboard(stats);
  };

  const appD = async id => {
    const ok = await approveDeposit(id);
    if (ok) {
      setDeps(p => p.map(d => d.id === id ? { ...d, status: "approved" } : d));
      refreshDash(); // update Dep Pending count instantly
    }
  };
  const rejD = async id => {
    const ok = await rejectDeposit(id);
    if (ok) {
      setDeps(p => p.map(d => d.id === id ? { ...d, status: "rejected" } : d));
      refreshDash();
    }
  };
  const appW = async id => {
    const ok = await approveWithdrawal(id);
    if (ok) {
      setWds(p => p.map(w => w.id === id ? { ...w, status: "approved" } : w));
      refreshDash(); // update WD Pending count instantly
    }
  };
  const rejW = async id => {
    const ok = await rejectWithdrawal(id);
    if (ok) {
      setWds(p => p.map(w => w.id === id ? { ...w, status: "rejected" } : w));
      refreshDash();
    }
  };

  const appK = async id => {
    const r = await af(`/admin/kyc/${id}/approve`, { method: "PUT" });
    if (r.ok) {
      setKycs(p => p.map(k => k.id === id ? { ...k, status: "approved" } : k));
      addToast("KYC approved ✅", "ok");
      refreshDash(); // update KYC Pending count instantly ✅
    }
    else addToast(r.data?.message || "Failed", "err");
  };
  const rejK = async id => {
    const reason = window.prompt("Rejection reason (optional):") || "Documents unclear";
    const r = await af(`/admin/kyc/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) });
    if (r.ok) {
      setKycs(p => p.map(k => k.id === id ? { ...k, status: "rejected" } : k));
      addToast("KYC rejected", "info");
      refreshDash();
    }
    else addToast(r.data?.message || "Failed", "err");
  };

  const genSig = async () => {
    setGBusy(true);
    const coin = selPair.split("/")[0];
    const sig = await generateSignal({ coin: coin + "USDT", direction: selSide === "BUY" ? "LONG" : "SHORT", tier: "All", expiryMinutes: 15 });
    if (sig) {
      setGCode(sig.code);
      const now = new Date(), exp = new Date(now.getTime() + 900_000);
      const fmt = d => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      setCodes(p => [{ code: sig.code, pair: selPair, side: selSide, created: fmt(now), expires: fmt(exp), used: 0, status: "active" }, ...p]);
    }
    setGBusy(false);
  };

  const STATS_MAIN = [
    { icon: "👥", label: "Total Users",  value: users.length || "—" },
    { icon: "✅", label: "KYC Verified", value: users.filter(u => u.kycStatus === "approved").length || 0 },
    { icon: "🔑", label: "Active Codes", value: codes.filter(c => c.status === "active").length },
    { icon: "⬆",  label: "WD Pending",   value: dashboard?.pendingWithdrawals ?? wds.filter(w => w.status === "pending").length },
    { icon: "⬇",  label: "Dep Pending",  value: dashboard?.pendingDeposits ?? deps.filter(d => d.status === "pending").length },
    { icon: "🪪",  label: "KYC Pending",  value: dashboard?.pendingKyc ?? kycs.filter(k => k.status === "pending").length },
  ];
  const STATS_SUB = [
    { icon: "👥", label: "Users",        value: visU.length || "—" },
    { icon: "🔑", label: "Active Codes", value: codes.filter(c => c.status === "active").length },
    { icon: "⬇",  label: "Dep Pending",  value: deps.filter(d => d.status === "pending").length },
    { icon: "⬆",  label: "WD Pending",   value: wds.filter(w => w.status === "pending").length },
    { icon: "🪪",  label: "KYC Pending",  value: dashboard?.pendingKyc ?? kycs.filter(k => k.status === "pending").length },
  ];
  const STATS = isMain ? STATS_MAIN : STATS_SUB;

  const imgUrl = (p) => {
    if (!p) return null;
    if (/^(https?:|data:)/.test(p)) return p;
    const base = API.replace("/api", "");
    return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
  };

  // ── Notify User filtered results ───────────────────────────────────────────
  const notifyResults = useMemo(() => {
    if (!notifySearch.trim()) return [];
    const qq = notifySearch.toLowerCase();
    return users.filter(u =>
      u.name?.toLowerCase().includes(qq) ||
      u.email?.toLowerCase().includes(qq) ||
      u.phone?.toLowerCase().includes(qq) ||
      u.uid?.toLowerCase().includes(qq)
    ).slice(0, 10);
  }, [users, notifySearch]);

  const handleNotifyReset = () => {
    setNotifySelected(null);
    setNotifySearch("");
    setNotifyTitle("");
    setNotifyBody("");
  };

  const handleNotifySend = async () => {
    if (!notifySelected?.id) { addToast("No user selected", "err"); return; }
    if (!notifyTitle.trim())  { addToast("Title is required", "err"); return; }
    if (!notifyBody.trim())   { addToast("Message is required", "err"); return; }
    setNotifySending(true);
    const ok = await sendNotifToUser(notifySelected.id, notifyTitle.trim(), notifyBody.trim());
    if (ok) {
      addToast(`Notification sent to ${notifySelected.name} ✅`, "ok");
      handleNotifyReset();
    } else {
      addToast("Failed to send notification — check console", "err");
    }
    setNotifySending(false);
  };

  const PageInfo = ({ total, pag }) => (
    <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 6 }}>
      Showing {Math.min((pag.page - 1) * PAGE_SIZE + 1, total)}–{Math.min(pag.page * PAGE_SIZE, total)} of {total}
    </div>
  );

  return (
    <>
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}>
          <img src={previewImage} alt="KYC preview" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}/>
        </div>
      )}
      {editU && <EditModal user={editU} onSave={saveU} onClose={() => setEditU(null)}/>}

      <div style={{ width: "100%", maxWidth: "var(--max)", margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column", background: "var(--ink)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ height: 52, flexShrink: 0, background: "var(--ink2)", borderBottom: "1px solid var(--ln)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
          <button onClick={onExit} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--t2)", background: "none", border: "none", cursor: "pointer" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Exit
          </button>
          <span style={{ fontSize: 16, fontWeight: 800 }}>Admin Panel</span>
          <span className={`badge ${isMain ? "b-pu" : "b-au"}`} style={{ marginLeft: "auto", fontSize: 10 }}>{isMain ? "MAIN ADMIN" : "ADMIN"}</span>
          <button onClick={onExit} style={{ fontSize: 11, color: "var(--dn)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Log Out</button>
        </div>

        {/* Nav */}
        <div style={{ flexShrink: 0, background: "var(--ink2)", borderBottom: "1px solid var(--ln)", overflowX: "auto", display: "flex" }}>
          {MENU.map(m => (
            <button key={m.id} onClick={() => setSec(m.id)}
              style={{ padding: "11px 12px", background: "none", border: "none", borderBottom: sec === m.id ? "2.5px solid var(--gold)" : "2.5px solid transparent", color: sec === m.id ? "var(--gold)" : "var(--t3)", fontFamily: "var(--f)", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

          {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
          {sec === "dash" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Overview</span>
                <button onClick={refresh} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: "var(--t3)", fontSize: 11, cursor: "pointer" }}>🔄 Refresh</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
                {STATS.map(s => (
                  <div key={s.label} className="astat">
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--m)", color: "var(--gold)" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", marginTop: 3, lineHeight: 1.2 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--ink3)", border: "1px solid var(--ln)", borderRadius: 12, padding: "12px 16px", fontSize: 12, color: "var(--t3)", lineHeight: 1.8 }}>
  🔄 Dashboard auto-refreshes every 30 seconds · Other tabs load on demand · Stats update instantly after actions
</div>
            </div>
          )}

          {/* ── USERS ─────────────────────────────────────────────────────── */}
          {sec === "users" && (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: "var(--t3)" }}>
        {fu.length} user{fu.length !== 1 ? "s" : ""}
        {isMain && users.filter(u => u.isHidden).length > 0 && (
          <span style={{ marginLeft: 8, fontSize: 10, color: "var(--dn)", fontWeight: 700 }}>({users.filter(u => u.isHidden).length} hidden from Admin)</span>
        )}
      </span>
      <button onClick={() => load("users", userFilter)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: "var(--t3)", fontSize: 11, cursor: "pointer" }}>🔄</button>
    </div>

    {/* ── User Filter Tabs ── */}
    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {[
        { id: "all",       label: "👥 All Users" },
        { id: "deposited", label: "✅ Deposited" },
      ].map(f => (
        <button key={f.id} onClick={() => { setUserFilter(f.id); setUQ(""); usersPag.setPage(1); }}
          style={{
            padding: "7px 14px", borderRadius: 10,
            border: `1.5px solid ${userFilter === f.id ? "var(--gold)" : "var(--ln)"}`,
            background: userFilter === f.id ? "rgba(240,165,0,.1)" : "var(--ink3)",
            color: userFilter === f.id ? "var(--gold)" : "var(--t2)",
            fontWeight: 700, fontSize: 12, cursor: "pointer",
          }}>
          {f.label}
        </button>
      ))}
    </div>

    <SearchBar value={uQ} onSearch={v => { setUQ(v); }} placeholder="Search name, email, phone or UID..."/>
              {loading && <div style={{ textAlign: "center", padding: 20, color: "var(--t3)" }}>Loading users...</div>}
              {!loading && fu.length === 0 && <div className="empty"><div className="ei">👥</div><p style={{ fontSize: 13 }}>No users found</p></div>}
              {!loading && fu.length > 0 && (<><PageInfo total={fu.length} pag={usersPag}/><Pagination page={usersPag.page} totalPages={usersPag.totalPages} onPage={usersPag.setPage}/></>)}
              {usersPag.slice.map(u => (
                <div key={u.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,var(--gold),#c07800)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
                      {(u.name || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
  <span
    style={{ fontWeight: 700, fontSize: 13, cursor: "pointer" }}
    onClick={() => { navigator.clipboard?.writeText(u.name || ""); addToast("Name copied!", "ok"); }}
    title="Click to copy name"
  >
    {u.name}
  </span>
  {isMain && u.isHidden && (<span style={{ fontSize: 9, fontWeight: 700, background: "rgba(255,59,92,.15)", color: "var(--dn)", border: "1px solid rgba(255,59,92,.3)", borderRadius: 4, padding: "2px 5px" }}>HIDDEN</span>)}
</div>
<div
  style={{ fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
  onClick={() => { navigator.clipboard?.writeText(u.email || ""); addToast("Email copied!", "ok"); }}
  title="Click to copy email"
>
  {u.email}
</div>
<div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)" }}>{u.phone || ""}{u.phone ? " · " : ""}{u.joined}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <span className="badge b-au" style={{ fontSize: 9 }}>{u.tier || "No Tier"}</span>
                      {(() => { const lv = getRefLevel(u.referralCount ?? 0); return lv.level > 0 ? <span style={{ display: "inline-flex", background: lv.color + "18", border: "1px solid " + lv.color + "40", borderRadius: 20, padding: "2px 7px", fontSize: 9, fontWeight: 900, fontFamily: "var(--m)", color: lv.color }}>★ {lv.label}</span> : null; })()}
                      <SB s={u.kycStatus ?? "none"}/>
                      {(u.hasDeposit || (u.fundBal > 0) || (u.tradeBal > 0) || (u.earnings > 0) || (u.withdrawn > 0)) && <DepositedBadge/>}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 8 }}>
                    {[["Funding","$"+(u.fundBal??0).toFixed(0),"var(--blue)"],["Trading","$"+(u.tradeBal??0).toFixed(0),"var(--up)"],["Earned","$"+(u.earnings??0).toFixed(0),"var(--gold)"],["Withdrawn","$"+(u.withdrawn??0).toFixed(0),"var(--dn)"]].map(([l,v,c]) => (
                      <div key={l} style={{ background: "var(--ink2)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: "var(--t3)", fontFamily: "var(--m)", marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--m)", color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "var(--ink2)", borderRadius: 10, padding: "8px 12px", marginBottom: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
  <span style={{ fontSize: 11, color: "var(--t3)" }}>
  UID:{" "}
  <strong
    style={{ fontFamily: "var(--m)", color: "var(--gold)", letterSpacing: 1, cursor: "pointer" }}
    onClick={() => { navigator.clipboard?.writeText(u.uid || ""); addToast("UID copied!", "ok"); }}
    title="Click to copy UID"
  >
    {u.uid || "—"}
  </strong>
</span>
  <span style={{ fontSize: 11, color: "var(--t3)" }}>
    Ref Code:{" "}
    <strong
      style={{ fontFamily: "var(--m)", color: "var(--pu)", letterSpacing: 1, cursor: "pointer" }}
      onClick={() => { navigator.clipboard?.writeText(u.referralCode || ""); addToast("Referral code copied!", "ok"); }}
      title="Click to copy"
    >
      {u.referralCode || "—"}
    </strong>
  </span>
  <span style={{ fontSize: 11, color: "var(--t3)" }}>
    Ref by: <span style={{ color: "var(--blue)" }}>{u.referredBy || "—"}</span>
  </span>
  <span style={{ fontSize: 11, color: "var(--t3)" }}>
    Referrals: <strong style={{ color: getRefLevel(u.referralCount || 0).color }}>{u.referralCount || 0}</strong>
  </span>
</div>
                  {isMain && (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
    <button className="btn btn-outline btn-sm" style={{ flex: "1 1 70px" }} onClick={() => setEditU(u)}>✏️ Edit</button>
    <button className="btn btn-red btn-sm"     style={{ flex: "1 1 70px" }} onClick={() => delU(u.id, u.name)}>🗑 Delete</button>
    <button onClick={() => toggleBan(u.id, u.name)}
      style={{ flex: "1 1 70px", padding: "7px 10px", borderRadius: 8,
        border: `1.5px solid ${u.isBanned ? "rgba(0,200,150,.4)" : "rgba(255,59,92,.4)"}`,
        background: u.isBanned ? "rgba(0,200,150,.08)" : "rgba(255,59,92,.08)",
        color: u.isBanned ? "var(--up)" : "var(--dn)",
        fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
      {u.isBanned ? "✅ Unban" : "🔨 Ban"}
    </button>
    <button onClick={() => toggleHide(u.id)}
      style={{ flex: "1 1 70px", padding: "7px 10px", borderRadius: 8,
        border: `1.5px solid ${u.isHidden ? "rgba(255,59,92,.4)" : "rgba(255,165,0,.3)"}`,
        background: u.isHidden ? "rgba(255,59,92,.08)" : "rgba(255,165,0,.08)",
        color: u.isHidden ? "var(--dn)" : "var(--gold)",
        fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
      {u.isHidden ? "👁 Show" : "🚫 Hide"}
    </button>
  </div>
)}
                </div>
              ))}
              {!loading && fu.length > 0 && (<Pagination page={usersPag.page} totalPages={usersPag.totalPages} onPage={usersPag.setPage}/>)}
            </div>
          )}

          {/* ── MY TEAM ───────────────────────────────────────────────────── */}
          {sec === "team" && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>🌐 My Team Lookup</div>
              <div style={{ background: "var(--ink3)", border: "1px solid var(--ln)", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "var(--t3)", lineHeight: 1.7 }}>
                Search any user to view their <strong style={{ color: "var(--gold)" }}>My Referrals</strong> (direct, deposited) and <strong style={{ color: "var(--blue)" }}>My Team</strong> (downline deposits).
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <div className="iw" style={{ flex: 1, marginBottom: 0 }}>
                  <input className="inp" placeholder="Search by name, email or UID..." value={teamSearch} onChange={e => setTeamSearch(e.target.value)} onKeyDown={e => { if (e.key === "Enter") doTeamSearch(); }} style={{ paddingLeft: 40, fontSize: 13 }}/>
                  <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", pointerEvents: "none" }}>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                </div>
                <button className="btn btn-gold" style={{ padding: "0 18px", fontSize: 13, flexShrink: 0 }} disabled={teamLoading || !teamSearch.trim()} onClick={doTeamSearch}>
                  {teamLoading ? "..." : "Search"}
                </button>
              </div>
              {users.length === 0 && (
                <div style={{ background: "rgba(240,165,0,.06)", border: "1px solid rgba(240,165,0,.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--t2)", marginBottom: 12 }}>
                  ⚠️ Users list is empty. Visit the <strong style={{ color: "var(--gold)" }}>Users</strong> tab first.
                </div>
              )}
              {teamResult?.error && (
                <div style={{ background: "rgba(255,59,92,.08)", border: "1px solid rgba(255,59,92,.2)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "var(--dn)" }}>❌ {teamResult.error}</div>
              )}
              {teamResult && !teamResult.error && (
                <div>
                  <div style={{ background: "var(--ink3)", border: "1px solid var(--ln2)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", marginBottom: 8, letterSpacing: 1 }}>SEARCHED USER</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,var(--gold),#c07800)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                        {(teamResult.user?.name || teamResult.searchedUser?.name || "?")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{teamResult.user?.name || teamResult.searchedUser?.name}</div>
                        <div style={{ fontSize: 11, color: "var(--t2)" }}>{teamResult.user?.email || teamResult.searchedUser?.email}</div>
                        <div style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--m)", fontWeight: 700, marginTop: 2, letterSpacing: 1 }}>UID: OCT{String(teamResult.user?.id || "").slice(-6).toUpperCase()}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <div style={{ textAlign: "center", background: "rgba(0,200,150,.1)", border: "1px solid rgba(0,200,150,.2)", borderRadius: 10, padding: "8px 14px" }}>
                          <div style={{ fontFamily: "var(--m)", fontSize: 20, fontWeight: 900, color: "var(--up)" }}>{teamResult.myReferrals?.total || 0}</div>
                          <div style={{ fontSize: 9, color: "var(--t3)", marginTop: 2 }}>REFERRALS</div>
                        </div>
                        <div style={{ textAlign: "center", background: "rgba(45,156,255,.1)", border: "1px solid rgba(45,156,255,.2)", borderRadius: 10, padding: "8px 14px" }}>
                          <div style={{ fontFamily: "var(--m)", fontSize: 20, fontWeight: 900, color: "var(--blue)" }}>{teamResult.myTeam?.total || 0}</div>
                          <div style={{ fontSize: 9, color: "var(--t3)", marginTop: 2 }}>TEAM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[["referrals",`👥 My Referrals (${teamResult.myReferrals?.total || 0})`,"var(--up)"],["team",`🌐 My Team (${teamResult.myTeam?.total || 0})`,"var(--blue)"]].map(([id, label, color]) => (
                      <button key={id} onClick={() => { setTeamTab(id); setTeamMemberQ(""); }}
                        style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${teamTab === id ? color : "var(--ln)"}`, background: teamTab === id ? color + "18" : "var(--ink3)", color: teamTab === id ? color : "var(--t2)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="iw" style={{ marginBottom: 14 }}>
                    <input className="inp" placeholder="Filter by name, email or UID..." value={teamMemberQ} onChange={e => setTeamMemberQ(e.target.value)} style={{ paddingLeft: 40, fontSize: 13 }}/>
                    <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", pointerEvents: "none" }}>
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                  </div>
                  {teamTab === "referrals" && (
                    <div>
                      {(teamResult.myReferrals?.members || []).length === 0 && (<div className="empty"><div className="ei">👥</div><p style={{ fontSize: 13 }}>No qualified referrals yet</p></div>)}
                      {(teamResult.myReferrals?.members || []).filter(m => !teamMemberQ || m.name?.toLowerCase().includes(teamMemberQ.toLowerCase()) || m.email?.toLowerCase().includes(teamMemberQ.toLowerCase()) || m.uid?.toLowerCase().includes(teamMemberQ.toLowerCase())).map(m => (
                        <div key={String(m.id)} style={{ background: "var(--ink3)", border: "1px solid var(--ln)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,var(--blue),#1a6fa8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{(m.name || "?")[0].toUpperCase()}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                              <div style={{ fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                              <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", marginTop: 2 }}>{m.uid} · Joined {m.joined}</div>
                              {m.referredBy && (<div style={{ fontSize: 10, color: "var(--blue)", fontFamily: "var(--m)", marginTop: 2 }}>👤 Ref by: <strong>{m.referredBy}</strong></div>)}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                              <span className="badge b-au" style={{ fontSize: 9 }}>{m.tier}</span>
                              <SB s={m.kycStatus}/>
                              <DepositedBadge/>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {teamTab === "team" && (
                    <div>
                      {(teamResult.myTeam?.members || []).length === 0 && (<div className="empty"><div className="ei">🌐</div><p style={{ fontSize: 13 }}>No team members yet</p></div>)}
                      {(teamResult.myTeam?.members || []).filter(m => !teamMemberQ || m.name?.toLowerCase().includes(teamMemberQ.toLowerCase()) || m.email?.toLowerCase().includes(teamMemberQ.toLowerCase()) || m.uid?.toLowerCase().includes(teamMemberQ.toLowerCase())).map(m => (
                        <div key={String(m.id)} style={{ background: "var(--ink3)", border: "1px solid var(--ln)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,var(--up),#009966)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{(m.name || "?")[0].toUpperCase()}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                              <div style={{ fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</div>
                              <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", marginTop: 2 }}>{m.uid} · Joined {m.joined}</div>
                              {m.referredBy && (<div style={{ fontSize: 10, color: "var(--blue)", fontFamily: "var(--m)", marginTop: 2 }}>👤 Ref by: <strong>{m.referredBy}</strong></div>)}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                              <span className="badge b-au" style={{ fontSize: 9 }}>{m.tier}</span>
                              <SB s={m.kycStatus}/>
                              <DepositedBadge/>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── SIGNALS ───────────────────────────────────────────────────── */}
          {sec === "codes" && (
            <div>
              <div className="card" style={{ padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🔑 Generate Signal Code</div>
                <div style={{ marginBottom: 14 }}>
                  <div className="lbl" style={{ marginBottom: 8 }}>Trading Pair</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {PAIRS.map(p => (<button key={p} onClick={() => setSelPair(p)} style={{ padding: "6px 11px", borderRadius: 8, border: selPair === p ? "1.5px solid var(--gold)" : "1px solid var(--ln)", background: selPair === p ? "rgba(240,165,0,.1)" : "var(--ink2)", color: selPair === p ? "var(--gold)" : "var(--t2)", fontFamily: "var(--m)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{p}</button>))}
                  </div>
                  <div className="lbl" style={{ marginBottom: 8 }}>Direction</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {["BUY", "SELL"].map(s => (<button key={s} onClick={() => setSelSide(s)} style={{ padding: "10px 0", borderRadius: 10, border: `2px solid ${selSide === s ? (s === "BUY" ? "var(--up)" : "var(--dn)") : "var(--ln)"}`, background: selSide === s ? (s === "BUY" ? "rgba(0,200,150,.12)" : "rgba(255,59,92,.12)") : "var(--ink2)", color: selSide === s ? (s === "BUY" ? "var(--up)" : "var(--dn)") : "var(--t2)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>{s === "BUY" ? "▲ BUY" : "▼ SELL"}</button>))}
                  </div>
                </div>
                {gCode && (
                  <div style={{ background: "rgba(240,165,0,.08)", border: "1px solid rgba(240,165,0,.25)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", marginBottom: 4 }}>GENERATED CODE — valid 15 min</div>
                      <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--m)", color: "var(--gold)", letterSpacing: 4 }}>{gCode}</div>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard?.writeText(gCode); addToast("Copied!", "ok"); }}>📋 Copy</button>
                  </div>
                )}
                <button className="btn btn-purple btn-block" onClick={genSig} disabled={gBusy}>{gBusy ? <><span className="spin spin-w"/>Generating...</> : "⚡ Generate Code"}</button>
              </div>
              <div className="card" style={{ padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🔑 Active Signal Codes</div>
                {codes.length === 0 && <div className="empty"><div className="ei">🔑</div><p style={{ fontSize: 13 }}>No active codes</p></div>}
                {codes.map((item, i) => (
                  <div key={i} style={{ background: "var(--ink3)", border: "1px solid var(--ln)", borderRadius: 12, padding: "13px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontFamily: "var(--m)", fontSize: 15, fontWeight: 900, color: item.status === "active" ? "var(--gold)" : "var(--t3)", letterSpacing: 1 }}>{item.code}</span>
                        <span className={`badge ${item.side === "BUY" ? "b-up" : "b-dn"}`} style={{ fontSize: 9 }}>{item.side}</span>
                        <SB s={item.status}/>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)" }}>{item.pair} · Created {item.created} · Exp {item.expires}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--m)", fontSize: 18, fontWeight: 900, color: "var(--blue)" }}>{item.used}</div>
                      <div style={{ fontSize: 10, color: "var(--t3)" }}>users</div>
                    </div>
                  </div>
                ))}
              </div>
              {isMain && (
                <div className="card" style={{ padding: 18, marginTop: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>📚 Signal History</div>
                  {signalHistory.length === 0 && <div className="empty"><div className="ei">📚</div><p style={{ fontSize: 13 }}>No signal history available</p></div>}
                  {signalHistory.map(signal => (
                    <div key={signal._id} style={{ background: "var(--ink3)", border: "1px solid var(--ln)", borderRadius: 12, padding: "13px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontFamily: "var(--m)", fontSize: 15, fontWeight: 900, color: signal.isExpired ? "var(--t3)" : "var(--gold)", letterSpacing: 1 }}>{signal.code}</span>
                          <span className={`badge ${signal.direction === "LONG" ? "b-up" : "b-dn"}`} style={{ fontSize: 9 }}>{signal.direction === "LONG" ? "BUY" : "SELL"}</span>
                          <SB s={signal.isExpired ? "expired" : "active"}/>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)" }}>
                          {signal.coin} · {signal.tier} · Created {new Date(signal.createdAt).toLocaleDateString()} · Exp {new Date(signal.expiresAt).toLocaleDateString()}
                          {signal.createdBy && <span> · By {signal.createdBy.fullName || signal.createdBy.email}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--m)", fontSize: 18, fontWeight: 900, color: "var(--blue)" }}>{signal.usageCount || 0}</div>
                        <div style={{ fontSize: 10, color: "var(--t3)" }}>users</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PRICE CONTROL ─────────────────────────────────────────────── */}
          {sec === "price" && isMain && (
            <div>
              <div style={{ background: "rgba(255,59,92,.08)", border: "1px solid rgba(255,59,92,.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
                ⚠️ <strong style={{ color: "var(--dn)" }}>Demo Only</strong> — Price manipulation for demonstration purposes.
              </div>
              <div className="card" style={{ padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>📈 Launch Price Wick</div>
                <div style={{ marginBottom: 14 }}>
                  <div className="lbl" style={{ marginBottom: 8 }}>Select Coin</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.keys(COINS).map(s => (<button key={s} onClick={() => setWSym(s)} style={{ padding: "6px 12px", borderRadius: 8, border: wSym === s ? "1.5px solid var(--gold)" : "1px solid var(--ln)", background: wSym === s ? "rgba(240,165,0,.1)" : "var(--ink2)", color: wSym === s ? "var(--gold)" : "var(--t2)", fontFamily: "var(--m)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{s}</button>))}
                  </div>
                </div>
                <div style={{ background: "var(--ink2)", border: "1px solid var(--ln)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--t2)", fontSize: 13 }}>Current {wSym}</span>
                  <span style={{ fontFamily: "var(--m)", fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>${(prices[wSym] ?? COINS[wSym]?.price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="fg">
                  <label className="lbl">Target Price ($)</label>
                  <input className="inp" type="number" value={wTarget} onChange={e => setWTarget(e.target.value)} placeholder={`e.g. ${((prices[wSym] ?? COINS[wSym]?.price ?? 0) * 1.05).toFixed(2)}`}/>
                  {wTarget && parseFloat(wTarget) > 0 && (
                    <div style={{ fontSize: 11, color: parseFloat(wTarget) > (prices[wSym] ?? 0) ? "var(--up)" : "var(--dn)", marginTop: 4 }}>
                      {parseFloat(wTarget) > (prices[wSym] ?? 0) ? "▲ Pump" : "▼ Dump"} — {Math.abs(((parseFloat(wTarget) - (prices[wSym] ?? 0)) / (prices[wSym] || 1)) * 100).toFixed(2)}%
                    </div>
                  )}
                </div>
                <div className="fg">
                  <label className="lbl">Duration (seconds)</label>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    {["10","30","60","120","300"].map(d => (<button key={d} onClick={() => setWDur(d)} style={{ padding: "6px 12px", borderRadius: 8, border: wDur === d ? "1.5px solid var(--blue)" : "1px solid var(--ln)", background: wDur === d ? "rgba(45,156,255,.1)" : "var(--ink2)", color: wDur === d ? "var(--blue)" : "var(--t2)", fontFamily: "var(--m)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{d}s</button>))}
                  </div>
                  <input className="inp" type="number" value={wDur} onChange={e => setWDur(e.target.value)}/>
                </div>
                <button className="btn btn-gold btn-block" onClick={async () => {
                  const t = parseFloat(wTarget), d = parseInt(wDur);
                  if (!t || t <= 0) { addToast("Enter target price", "err"); return; }
                  if (!d || d <= 0) { addToast("Enter duration", "err"); return; }
                  await setPriceWick(wSym, t, d);
                }}>🚀 Launch Wick</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "BTC +5%", sym: "BTC", mult: 1.05, dur: 60,  c: "var(--up)" },
                  { label: "BTC -5%", sym: "BTC", mult: 0.95, dur: 60,  c: "var(--dn)" },
                  { label: "ETH +10%",sym: "ETH", mult: 1.10, dur: 120, c: "var(--up)" },
                  { label: "ETH -10%",sym: "ETH", mult: 0.90, dur: 120, c: "var(--dn)" },
                  { label: "SOL +8%", sym: "SOL", mult: 1.08, dur: 60,  c: "var(--up)" },
                  { label: "BNB -7%", sym: "BNB", mult: 0.93, dur: 90,  c: "var(--dn)" },
                ].map(p => (
                  <button key={p.label} onClick={() => {
                    const sp = prices[p.sym] ?? COINS[p.sym]?.price ?? 0;
                    setWick({ sym: p.sym, targetPrice: sp * p.mult, durationMs: p.dur * 1000, startPrice: sp, startAt: Date.now() });
                    addToast(`${p.label} launched`, "ok");
                  }} style={{ padding: "12px 10px", borderRadius: 12, border: `1px solid ${p.c}30`, background: `${p.c}10`, color: p.c, fontWeight: 700, fontSize: 12, cursor: "pointer", textAlign: "center" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── DEPOSITS ──────────────────────────────────────────────────── */}
          {sec === "deps" && (
            <div>
              {isMain && <FilterRow value={depF} onChange={v => { setDepF(v); depsPag.setPage(1); }} onRefresh={refresh} opts={[["pending","⏳ Pending"],["approved","✅ Approved"],["rejected","❌ Rejected"],["all","📋 All History"]]}/>}
              {!isMain && <div style={{ marginBottom: 14, display: "flex", justifyContent: "flex-end" }}><button onClick={refresh} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: "var(--t3)", fontSize: 11, cursor: "pointer" }}>🔄 Refresh</button></div>}
              <SearchBar value={dQ} onSearch={v => { setDQ(v); depsPag.setPage(1); }} placeholder="Search name, email, phone, UID or TX hash..."/>
              {loading && <div style={{ textAlign: "center", padding: 20, color: "var(--t3)" }}>Loading deposits...</div>}
              {!loading && fd.length === 0 && <div className="empty"><div className="ei">⬇️</div><p style={{ fontSize: 13 }}>No deposits found</p></div>}
              {!loading && fd.length > 0 && (<><PageInfo total={fd.length} pag={depsPag}/><Pagination page={depsPag.page} totalPages={depsPag.totalPages} onPage={depsPag.setPage}/></>)}
              {depsPag.slice.map(d => (
                <div key={d.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{d.user}</div>
                      <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>{d.tier || "—"} · {d.network}</div>
                      {d.date && <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{d.date}</div>}
                      {d.uid && <div style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--m)", fontWeight: 700, marginTop: 2, letterSpacing: 1 }}>UID: {d.uid}</div>}
                    </div>
                    <SB s={d.status}/>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8, marginBottom: d.status === "pending" ? 12 : 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", marginBottom: 2 }}>TX HASH</div>
                      <div style={{ fontSize: 11, fontFamily: "var(--m)", color: "var(--blue)", wordBreak: "break-all" }}>{d.hash}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--m)", fontSize: 18, fontWeight: 900, color: "var(--up)" }}>+${d.amount}</div>
                    </div>
                  </div>
                  {d.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-green btn-sm" style={{ flex: 1 }} onClick={() => appD(d.id)}>✓ Approve</button>
                      <button className="btn btn-red btn-sm"   style={{ flex: 1 }} onClick={() => rejD(d.id)}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
              {!loading && fd.length > 0 && (<Pagination page={depsPag.page} totalPages={depsPag.totalPages} onPage={depsPag.setPage}/>)}
            </div>
          )}

          {/* ── WITHDRAWALS ───────────────────────────────────────────────── */}
          {sec === "wds" && (
            <div>
              {isMain && <FilterRow value={wdF} onChange={v => { setWdF(v); wdsPag.setPage(1); }} onRefresh={refresh} opts={[["pending","⏳ Pending"],["approved","✅ Approved"],["rejected","❌ Rejected"],["all","📋 All History"]]}/>}
              {!isMain && <div style={{ marginBottom: 14, display: "flex", justifyContent: "flex-end" }}><button onClick={refresh} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: "var(--t3)", fontSize: 11, cursor: "pointer" }}>🔄 Refresh</button></div>}
              <SearchBar value={wQ} onSearch={v => { setWQ(v); wdsPag.setPage(1); }} placeholder="Search name, email, phone, UID or wallet address..."/>
              {loading && <div style={{ textAlign: "center", padding: 20, color: "var(--t3)" }}>Loading withdrawals...</div>}
              {!loading && fw.length === 0 && <div className="empty"><div className="ei">⬆️</div><p style={{ fontSize: 13 }}>No withdrawals found</p></div>}
              {!loading && fw.length > 0 && (<><PageInfo total={fw.length} pag={wdsPag}/><Pagination page={wdsPag.page} totalPages={wdsPag.totalPages} onPage={wdsPag.setPage}/></>)}
              {wdsPag.slice.map(w => (
                <div key={w.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{w.user}</div>
                      <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 2 }}>{w.network}</div>
                      {w.date && <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{w.date}</div>}
                      {w.uid && <div style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--m)", fontWeight: 700, marginTop: 2, letterSpacing: 1 }}>UID: {w.uid}</div>}
                    </div>
                    <SB s={w.status}/>
                  </div>
                  <div style={{ background: "var(--ink2)", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", marginBottom: 2 }}>WALLET ADDRESS</div>
                    <div style={{ fontSize: 11, fontFamily: "var(--m)", color: "var(--blue)", wordBreak: "break-all" }}>{w.address}</div>
                  </div>
                  <div style={{ marginBottom: w.status === "pending" ? 12 : 0 }}>
                    <div style={{ fontFamily: "var(--m)", fontSize: 18, fontWeight: 900, color: "var(--dn)" }}>-${w.amount}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 3, lineHeight: 1.7 }}>Platform fee (5%): -${(w.amount * 0.05).toFixed(2)}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--up)", marginTop: 2 }}>User receives: ${(w.amount - w.amount * 0.05).toFixed(2)}</div>
                  </div>
                  {w.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-green btn-sm" style={{ flex: 1 }} onClick={() => appW(w.id)}>✓ Approve</button>
                      <button className="btn btn-red btn-sm"   style={{ flex: 1 }} onClick={() => rejW(w.id)}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
              {!loading && fw.length > 0 && (<Pagination page={wdsPag.page} totalPages={wdsPag.totalPages} onPage={wdsPag.setPage}/>)}
            </div>
          )}

          {/* ── KYC ───────────────────────────────────────────────────────── */}
          {sec === "kyc" && (
            <div>
              <FilterRow value={kycF} onChange={v => { setKycF(v); kycPag.setPage(1); }} onRefresh={refresh}
                opts={isMain ? [["pending","⏳ Pending"],["approved","✅ Approved"],["rejected","❌ Rejected"],["all","📋 All"]] : [["pending","⏳ Pending"]]}/>
              <SearchBar value={kQ} onSearch={v => { setKQ(v); kycPag.setPage(1); }} placeholder="Search name, email, phone or UID..."/>
              {loading && <div style={{ textAlign: "center", padding: 20, color: "var(--t3)" }}>Loading KYC...</div>}
              {!loading && fk.length === 0 && <div className="empty"><div className="ei">🪪</div><p style={{ fontSize: 13 }}>No KYC requests found</p></div>}
              {!loading && fk.length > 0 && (<><PageInfo total={fk.length} pag={kycPag}/><Pagination page={kycPag.page} totalPages={kycPag.totalPages} onPage={kycPag.setPage}/></>)}
              {kycPag.slice.map(k => (
                <div key={k.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{k.user}</div>
                      <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>{k.email}{k.phone ? ` · ${k.phone}` : ""}</div>
                      {k.address && <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>📍 {k.address}</div>}
                      <div style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--m)", fontWeight: 700, marginTop: 3, letterSpacing: 1 }}>UID: {k.uid}</div>
                      <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>Submitted: {k.submitted}</div>
                    </div>
                    <SB s={k.status}/>
                  </div>
                  {(k.kycFront || k.kycBack) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      {[["CNIC Front", k.kycFront], ["CNIC Back", k.kycBack]].map(([label, url]) => {
                        const full = imgUrl(url);
                        return (
                          <div key={label} style={{ background: "var(--ink2)", border: "1px solid var(--ln2)", borderRadius: 10, overflow: "hidden" }}>
                            {full ? <button onClick={() => setPreviewImage(full)} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }}><img src={full} alt={label} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}/></button>
                              : <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 24 }}>🪪</span></div>}
                            <div style={{ padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", fontWeight: 700 }}>{label}</span>
                              {full && <button onClick={() => setPreviewImage(full)} style={{ all: "unset", cursor: "pointer", fontSize: 10, color: "var(--blue)", textDecoration: "underline", fontWeight: 700 }}>View</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {k.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-green btn-sm" style={{ flex: 1 }} onClick={() => appK(k.id)}>✓ Approve KYC</button>
                      <button className="btn btn-red btn-sm"   style={{ flex: 1 }} onClick={() => rejK(k.id)}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
              {!loading && fk.length > 0 && (<Pagination page={kycPag.page} totalPages={kycPag.totalPages} onPage={kycPag.setPage}/>)}
            </div>
          )}

          {/* ── BANNERS ───────────────────────────────────────────────────── */}
          {sec === "banners" && isMain && (
            <div>
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Add Banner</div>
                <div className="fg"><label className="lbl">Title</label><input className="inp" placeholder="e.g. 🎉 Welcome Bonus" value={nb.title} onChange={e => setNb(p => ({ ...p, title: e.target.value }))}/></div>
                <div className="fg"><label className="lbl">Message</label><input className="inp" placeholder="Banner text..." value={nb.text} onChange={e => setNb(p => ({ ...p, text: e.target.value }))}/></div>
                <div className="fg">
                  <label className="lbl">Color</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["#f0a500","#00c896","#2d9cff","#a855f7","#ff3b5c"].map(c => (<button key={c} onClick={() => setNb(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: nb.color === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer" }}/>))}
                  </div>
                </div>
                <button className="btn btn-gold btn-sm" onClick={() => {
                  if (!nb.title) return;
                  addBanner({ id: "b" + Date.now(), ...nb, active: true });
                  setNb({ title: "", text: "", color: "#f0a500" });
                  addToast("Banner added", "ok");
                }}>Add Banner</button>
              </div>
              {banners.map(b => (
                <div key={b.id} style={{ background: `linear-gradient(135deg,${b.color}18,${b.color}08)`, border: `1px solid ${b.color}30`, borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.text}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleBanner(b.id)}>{b.active ? "Hide" : "Show"}</button>
                    <button className="btn btn-red btn-sm" onClick={() => { deleteBanner(b.id); addToast("Removed", "info"); }}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── NOTIFS (Broadcast) ────────────────────────────────────────── */}
          {sec === "notifs" && isMain && (
            <div>
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Send Notification to All Users</div>
                <div className="fg"><label className="lbl">Title</label><input className="inp" placeholder="Notification title" value={nf.title} onChange={e => setNf(p => ({ ...p, title: e.target.value }))}/></div>
                <div className="fg"><label className="lbl">Message</label><textarea className="inp" rows={3} placeholder="Message body..." value={nf.body} onChange={e => setNf(p => ({ ...p, body: e.target.value }))} style={{ resize: "none" }}/></div>
                <button className="btn btn-gold btn-sm" onClick={async () => {
                  if (!nf.title) { addToast("Title required", "err"); return; }
                  await broadcastNotif(nf.title, nf.body);
                  addNotif({ id: "n" + Date.now(), title: nf.title, body: nf.body, time: "just now", read: false });
                  setNf({ title: "", body: "" });
                }}>Send to All Users</button>
              </div>
            </div>
          )}

          {/* ── NOTIFY USER ───────────────────────────────────────────────── */}
          {sec === "notify" && isMain && (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>📨 Notify User</div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>
                  Search a user by name, email, phone or UID — select them and send a notification.
                </div>
              </div>

              {/* Users not loaded warning */}
              {users.length === 0 && (
                <div style={{ background: "rgba(240,165,0,.06)", border: "1px solid rgba(240,165,0,.25)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--t2)" }}>
                    {notifyLoading ? "⏳ Loading users..." : "⚠️ No users loaded yet."}
                  </span>
                  {!notifyLoading && (
                    <button className="btn btn-outline btn-sm" onClick={loadUsersForNotify}>
                      Load Users
                    </button>
                  )}
                </div>
              )}

              {/* Search — only show when no user is selected yet */}
              {!notifySelected && (
                <>
                  <SearchBar
                    value={notifySearch}
                    onSearch={v => setNotifySearch(v)}
                    placeholder="Search by name, email, phone or UID..."
                  />

                  {/* Results list */}
                  {notifySearch.trim().length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      {notifyResults.length === 0 ? (
                        <div style={{ background: "var(--ink3)", border: "1px solid var(--ln)", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                          <div style={{ fontSize: 20, marginBottom: 6 }}>🔍</div>
                          <div style={{ fontSize: 13, color: "var(--t3)" }}>No users found for "{notifySearch}"</div>
                          {users.length === 0 && (
                            <div style={{ fontSize: 11, color: "var(--dn)", marginTop: 6 }}>
                              Users list is empty — click "Load Users" above first.
                            </div>
                          )}
                        </div>
                      ) : (
                        notifyResults.map(u => (
                          <div
                            key={u.id}
                            onClick={() => { setNotifySelected(u); setNotifySearch(""); }}
                            style={{
                              background: "var(--ink3)",
                              border: "1px solid var(--ln)",
                              borderRadius: 12,
                              padding: "12px 14px",
                              marginBottom: 8,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              transition: "border-color .15s, background .15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "rgba(240,165,0,.04)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ln)"; e.currentTarget.style.background = "var(--ink3)"; }}
                          >
                            {/* Avatar */}
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,var(--gold),#c07800)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                              {(u.name || "?")[0].toUpperCase()}
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                              <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--m)", fontWeight: 700 }}>{u.uid}</span>
                                {u.phone && <span style={{ fontSize: 10, color: "var(--t3)" }}>{u.phone}</span>}
                                <span className="badge b-au" style={{ fontSize: 9 }}>{u.tier || "No Tier"}</span>
                                <SB s={u.kycStatus || "none"}/>
                              </div>
                            </div>
                            {/* Select caret */}
                            <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, flexShrink: 0 }}>
                              Select →
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Selected user chip */}
              {notifySelected && (
                <div style={{ background: "rgba(240,165,0,.07)", border: "1.5px solid rgba(240,165,0,.3)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: "linear-gradient(135deg,var(--gold),#c07800)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>
                    {(notifySelected.name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{notifySelected.name}</div>
                    <div style={{ fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{notifySelected.email}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--m)", fontWeight: 700 }}>{notifySelected.uid}</span>
                      {notifySelected.phone && <span style={{ fontSize: 10, color: "var(--t3)" }}>{notifySelected.phone}</span>}
                    </div>
                  </div>
                  <button
                    onClick={handleNotifyReset}
                    title="Change user"
                    style={{ background: "none", border: "1px solid var(--ln)", borderRadius: 8, color: "var(--t3)", fontSize: 16, cursor: "pointer", padding: "4px 10px", lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Message form — only shown when a user is selected */}
              {notifySelected && (
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)", letterSpacing: 1, marginBottom: 14 }}>
                    COMPOSE NOTIFICATION
                  </div>

                  <div className="fg">
                    <label className="lbl">Title</label>
                    <input
                      className="inp"
                      placeholder="e.g. Your withdrawal has been approved"
                      value={notifyTitle}
                      onChange={e => setNotifyTitle(e.target.value)}
                      style={{ fontSize: 14 }}
                    />
                  </div>

                  <div className="fg">
                    <label className="lbl">Message</label>
                    <textarea
                      className="inp"
                      rows={5}
                      placeholder="Write your message here..."
                      value={notifyBody}
                      onChange={e => setNotifyBody(e.target.value)}
                      style={{ resize: "vertical", minHeight: 110, fontSize: 13, lineHeight: 1.6 }}
                    />
                  </div>

                  {/* Character hint */}
                  <div style={{ fontSize: 10, color: "var(--t3)", marginTop: -8, marginBottom: 14, textAlign: "right" }}>
                    {notifyBody.length} characters
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-ghost"
                      style={{ flex: 1 }}
                      onClick={handleNotifyReset}
                      disabled={notifySending}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-gold"
                      style={{ flex: 2 }}
                      disabled={notifySending || !notifyTitle.trim() || !notifyBody.trim()}
                      onClick={handleNotifySend}
                    >
                      {notifySending
                        ? <><span className="spin spin-w" style={{ marginRight: 6 }}/>Sending...</>
                        : "📨 Send Notification"
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* Empty state — no search typed yet */}
              {!notifySelected && !notifySearch.trim() && users.length > 0 && (
                <div className="empty" style={{ marginTop: 20 }}>
                  <div className="ei">📨</div>
                  <p style={{ fontSize: 13 }}>Search for a user above to get started</p>
                  <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{users.length} users loaded</p>
                </div>
              )}
            </div>
          )}

          {/* ── SALARY ───────────────────────────────────── */}
          {sec === "salary" && isMain && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>💰 Salary Management</div>
              <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 16 }}>
                Select users and send salary directly to their Funding Account.
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[["send", "💰 Send Salary"], ["history", "📋 History"]].map(([id, label]) => (
                  <button key={id} onClick={() => setSalaryTab(id)}
                    style={{
                      flex: 1, padding: "10px 8px", borderRadius: 10,
                      border: `1.5px solid ${salaryTab === id ? "var(--gold)" : "var(--ln)"}`,
                      background: salaryTab === id ? "rgba(240,165,0,.1)" : "var(--ink3)",
                      color: salaryTab === id ? "var(--gold)" : "var(--t2)",
                      fontWeight: 700, fontSize: 12, cursor: "pointer",
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── SEND TAB ── */}
              {salaryTab === "send" && (
                <div>
                  {/* Amount */}
                  <div className="card" style={{ padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)", letterSpacing: 1, marginBottom: 12 }}>SALARY AMOUNT</div>
                    <div className="fg">
                      <label className="lbl">Amount Per User ($)</label>
                      <input className="inp" type="number" placeholder="e.g. 10"
                        value={salaryAmount} onChange={e => setSalaryAmount(e.target.value)}
                        style={{ fontSize: 16, fontWeight: 700 }}/>
                    </div>
                    <div className="fg">
                      <label className="lbl">Note (optional)</label>
                      <input className="inp" placeholder="e.g. Weekly salary - Week 23"
                        value={salaryNote} onChange={e => setSalaryNote(e.target.value)}/>
                    </div>
                    {salarySelected.length > 0 && parseFloat(salaryAmount) > 0 && (
                      <div style={{ background: "rgba(0,200,150,.08)", border: "1px solid rgba(0,200,150,.2)", borderRadius: 10, padding: "10px 14px", marginTop: 8 }}>
                        <div style={{ fontSize: 12, color: "var(--t2)" }}>
                          <strong style={{ color: "var(--up)" }}>{salarySelected.length}</strong> users selected ·
                          Total: <strong style={{ color: "var(--gold)", fontFamily: "var(--m)" }}>
                            ${(parseFloat(salaryAmount || 0) * salarySelected.length).toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Selection */}
                  <div className="card" style={{ padding: 16, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)", letterSpacing: 1 }}>
                        SELECT USERS ({salarySelected.length} selected)
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setSalarySelected(
                            users
                              .filter(u => !salarySearch.trim() ||
                                u.name?.toLowerCase().includes(salarySearch.toLowerCase()) ||
                                u.email?.toLowerCase().includes(salarySearch.toLowerCase()) ||
                                u.uid?.toLowerCase().includes(salarySearch.toLowerCase())
                              )
                              .slice(0, 50)
                              .map(u => u.id)
                          )}
                          style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--gold)", background: "rgba(240,165,0,.08)", color: "var(--gold)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          Select All
                        </button>
                        {salarySelected.length > 0 && (
                          <button onClick={() => setSalarySelected([])}
                            style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: "var(--t3)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search */}
                    <div className="iw" style={{ marginBottom: 12 }}>
                      <input className="inp" placeholder="Search by name, email or UID..."
                        value={salarySearch} onChange={e => setSalarySearch(e.target.value)}
                        style={{ paddingLeft: 40, fontSize: 13 }}/>
                      <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--t3)", pointerEvents: "none" }}>
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                    </div>

                    {users.length === 0 && (
                      <div style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", padding: 16 }}>
                        ⏳ Loading users...
                      </div>
                    )}

                    {/* User List */}
                    <div style={{ maxHeight: 400, overflowY: "auto" }}>
                      {users
                        .filter(u => !salarySearch.trim() ||
                          u.name?.toLowerCase().includes(salarySearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(salarySearch.toLowerCase()) ||
                          u.uid?.toLowerCase().includes(salarySearch.toLowerCase())
                        )
                        .slice(0, 50)
                        .map(u => {
                          const isSelected = salarySelected.includes(u.id);
                          return (
                            <div key={u.id}
                              onClick={() => setSalarySelected(prev =>
                                prev.includes(u.id)
                                  ? prev.filter(id => id !== u.id)
                                  : [...prev, u.id]
                              )}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 12px", borderRadius: 10, marginBottom: 6,
                                cursor: "pointer",
                                border: `1.5px solid ${isSelected ? "var(--gold)" : "var(--ln)"}`,
                                background: isSelected ? "rgba(240,165,0,.07)" : "var(--ink2)",
                              }}>
                              {/* Checkbox */}
                              <div style={{
                                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                border: `2px solid ${isSelected ? "var(--gold)" : "var(--t3)"}`,
                                background: isSelected ? "var(--gold)" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {isSelected && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
                              </div>
                              {/* Avatar */}
                              <div style={{
                                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                                background: "linear-gradient(135deg,var(--gold),#c07800)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#000", fontWeight: 900, fontSize: 13,
                              }}>
                                {(u.name || "?")[0].toUpperCase()}
                              </div>
                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                                <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)" }}>
                                  {u.uid} · {u.tier || "No Tier"}
                                </div>
                              </div>
                              {/* Balance */}
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 11, color: "var(--up)", fontFamily: "var(--m)", fontWeight: 700 }}>
                                  ${(u.fundBal || 0).toFixed(0)}
                                </div>
                                <div style={{ fontSize: 9, color: "var(--t3)" }}>funding</div>
                              </div>
                            </div>
                          );
                        })}
                      {users.filter(u => !salarySearch.trim() ||
                        u.name?.toLowerCase().includes(salarySearch.toLowerCase()) ||
                        u.email?.toLowerCase().includes(salarySearch.toLowerCase()) ||
                        u.uid?.toLowerCase().includes(salarySearch.toLowerCase())
                      ).length === 0 && salarySearch && (
                        <div style={{ textAlign: "center", padding: 20, color: "var(--t3)", fontSize: 13 }}>
                          No users found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    className="btn btn-gold btn-block"
                    disabled={salarySending || salarySelected.length === 0 || !salaryAmount || parseFloat(salaryAmount) <= 0}
                    onClick={async () => {
                      if (salarySelected.length === 0) { addToast("Select at least one user", "err"); return; }
                      if (!salaryAmount || parseFloat(salaryAmount) <= 0) { addToast("Enter a valid salary amount", "err"); return; }
                      if (!window.confirm(`Send $${salaryAmount} salary to ${salarySelected.length} user(s)?\nTotal: $${(parseFloat(salaryAmount) * salarySelected.length).toFixed(2)}`)) return;
                      setSalarySending(true);
                      const result = await sendSalary(salarySelected, parseFloat(salaryAmount), salaryNote);
                      if (result.success) {
                        setSalarySelected([]);
                        setSalaryAmount("");
                        setSalaryNote("");
                        setSalarySearch("");
                        setSalaryTab("history");
                        loadSalaryHistory(1);
                      }
                      setSalarySending(false);
                    }}
                    style={{ fontSize: 15, fontWeight: 800, padding: "14px 0" }}>
                    {salarySending
                      ? <><span className="spin spin-w" style={{ marginRight: 8 }}/>Sending Salary...</>
                      : `💰 Send $${salaryAmount || "0"} to ${salarySelected.length} User${salarySelected.length !== 1 ? "s" : ""}`
                    }
                  </button>
                </div>
              )}

              {/* ── HISTORY TAB ── */}
              {salaryTab === "history" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: "var(--t3)" }}>{salaryHistTotal} salary batch{salaryHistTotal !== 1 ? "es" : ""}</span>
                    <button onClick={() => loadSalaryHistory(salaryHistPage)}
                      style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: "var(--t3)", fontSize: 11, cursor: "pointer" }}>
                      🔄 Refresh
                    </button>
                  </div>

                  {salaryLoading && (
                    <div style={{ textAlign: "center", padding: 30, color: "var(--t3)" }}>Loading history...</div>
                  )}

                  {!salaryLoading && salaryHistory.length === 0 && (
                    <div className="empty">
                      <div className="ei">💰</div>
                      <p style={{ fontSize: 13 }}>No salary history yet</p>
                    </div>
                  )}

                  {salaryHistory.map(log => (
                    <div key={log._id} className="card" style={{ padding: 14, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--gold)", fontFamily: "var(--m)" }}>
                            ${log.amount} <span style={{ fontSize: 12, color: "var(--t3)", fontWeight: 400 }}>per user</span>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                            {new Date(log.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--up)", fontFamily: "var(--m)" }}>
                            Total: ${log.totalPaid?.toFixed(2)}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>
                            {log.recipients?.length || 0} users paid
                          </div>
                        </div>
                      </div>

                      {log.note && (
                        <div style={{ fontSize: 11, color: "var(--t2)", background: "var(--ink2)", borderRadius: 8, padding: "6px 10px", marginBottom: 10 }}>
                          📝 {log.note}
                        </div>
                      )}

                      {log.sentBy && (
                        <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 10 }}>
                          Sent by: <span style={{ color: "var(--blue)" }}>{log.sentBy.fullName || log.sentBy.email}</span>
                        </div>
                      )}

                      <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--m)", letterSpacing: 1, marginBottom: 6 }}>
                        RECIPIENTS ({log.recipients?.length || 0})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(log.recipients || []).slice(0, 10).map(r => (
                          <span key={String(r.userId)} style={{
                            fontSize: 11, padding: "3px 8px", borderRadius: 6,
                            background: "var(--ink2)", border: "1px solid var(--ln)", color: "var(--t2)",
                          }}>
                            {r.fullName || "Unknown"}
                          </span>
                        ))}
                        {(log.recipients || []).length > 10 && (
                          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "var(--ink2)", border: "1px solid var(--ln)", color: "var(--t3)" }}>
                            +{log.recipients.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {salaryHistTotal > 20 && (
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                      <button onClick={() => loadSalaryHistory(salaryHistPage - 1)} disabled={salaryHistPage === 1}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: salaryHistPage === 1 ? "var(--t3)" : "var(--t2)", fontSize: 12, fontWeight: 700, cursor: salaryHistPage === 1 ? "not-allowed" : "pointer" }}>
                        ‹ Prev
                      </button>
                      <span style={{ fontSize: 12, color: "var(--t3)", alignSelf: "center" }}>
                        Page {salaryHistPage} of {Math.ceil(salaryHistTotal / 20)}
                      </span>
                      <button onClick={() => loadSalaryHistory(salaryHistPage + 1)} disabled={salaryHistPage >= Math.ceil(salaryHistTotal / 20)}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--ln)", background: "var(--ink3)", color: salaryHistPage >= Math.ceil(salaryHistTotal / 20) ? "var(--t3)" : "var(--t2)", fontSize: 12, fontWeight: 700, cursor: salaryHistPage >= Math.ceil(salaryHistTotal / 20) ? "not-allowed" : "pointer" }}>
                        Next ›
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}