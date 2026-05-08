import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { PAIRS, COINS, getRefLevel, TIERS } from "@/lib/data";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const MENU_MAIN = [
  {id:"dash",   icon:"📊", label:"Dashboard"},
  {id:"users",  icon:"👥", label:"Users"},
  {id:"codes",  icon:"🔑", label:"Signals"},
  {id:"price",  icon:"📈", label:"Price Control"},
  {id:"deps",   icon:"⬇",  label:"Deposits"},
  {id:"wds",    icon:"⬆",  label:"Withdrawals"},
  {id:"kyc",    icon:"🪪",  label:"KYC"},
  {id:"banners",icon:"🖼",  label:"Banners"},
  {id:"notifs", icon:"🔔", label:"Notifs"},
];
const MENU_SUB = [
  {id:"dash",  icon:"📊", label:"Dashboard"},
  {id:"users", icon:"👥", label:"Users"},
  {id:"codes", icon:"🔑", label:"Signals"},
  {id:"deps",  icon:"⬇",  label:"Deposits"},
  {id:"wds",   icon:"⬆",  label:"Withdrawals"},
  {id:"kyc",   icon:"🪪",  label:"KYC"},
];

function SB({s}){
  const c=s==="approved"||s==="active"?"b-up":s==="pending"?"b-au":"b-dn";
  return <span className={`badge ${c}`} style={{fontSize:10}}>{s}</span>;
}

function SearchBar({onSearch, placeholder}){
  return(
    <div className="iw" style={{marginBottom:14}}>
      <input className="inp" placeholder={placeholder??"Search..."} onChange={e=>onSearch(e.target.value)} style={{paddingLeft:40,fontSize:13}}/>
      <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"var(--t3)",pointerEvents:"none"}}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
    </div>
  );
}

// ── MUST be outside AdminPanel and EditModal ──────────────
// Defining inside causes remount on every keystroke (focus loss bug)
function ModalField({ label, value, onChange, type="text" }) {
  return (
    <div className="fg">
      <label className="lbl" style={{ fontSize:10, letterSpacing:"1px", color:"var(--t3)", fontFamily:"var(--m)" }}>
        {label.toUpperCase()}
      </label>
      <input
        className="inp"
        type={type}
        value={value}
        autoComplete="off"
        onChange={e => onChange(e.target.value)}
        style={{ padding:"11px 14px", fontSize:14, background:"var(--ink)" }}
      />
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
    onSave({
      ...user,
      name, email, phone,
      fundBal:   parseFloat(fb)   || 0,
      tradeBal:  parseFloat(tb)   || 0,
      earnings:  parseFloat(earn) || 0,
      withdrawn: parseFloat(wd)   || 0,
      tier, kycStatus: kyc,
    });
    onClose();
  };

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(8px)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={onClose}
    >
      <div
        style={{ background:"var(--ink3)", border:"1px solid var(--ln2)", borderRadius:20, padding:24, width:"100%", maxWidth:440, maxHeight:"92dvh", overflowY:"auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17 }}>Edit User</div>
            <div style={{ fontSize:11, color:"var(--t3)", marginTop:2 }}>
              UID: <span style={{ color:"var(--gold)", fontFamily:"var(--m)" }}>{user.uid || "—"}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ color:"var(--t3)", fontSize:22, background:"none", border:"none", cursor:"pointer", lineHeight:1 }}>✕</button>
        </div>

        <ModalField label="Full Name / Username" value={name}  onChange={setName}/>
        <ModalField label="Email"                value={email} onChange={setEmail} type="email"/>
        <ModalField label="Phone"                value={phone} onChange={setPhone} type="tel"/>
        <ModalField label="Funding Balance ($)"  value={fb}    onChange={setFb}    type="number"/>
        <ModalField label="Trading Balance ($)"  value={tb}    onChange={setTb}    type="number"/>
        <ModalField label="Total Earned ($)"     value={earn}  onChange={setEarn}  type="number"/>
        <ModalField label="Withdrawn ($)"        value={wd}    onChange={setWd}    type="number"/>

        <div className="fg">
          <label className="lbl" style={{ fontSize:10, letterSpacing:"1px", color:"var(--t3)", fontFamily:"var(--m)" }}>
            TIER (SUBSCRIPTION)
          </label>
          <select
            value={tier}
            onChange={e => setTier(e.target.value)}
            className="inp"
            style={{ padding:"11px 14px", fontSize:13, background:"var(--ink)" }}
          >
            <option value="">No Tier</option>
            {TIERS.map(t => (
              <option key={t.id} value={String(t.id)}>
                {t.name} — ${t.price.toLocaleString()} (+${t.profit}/trade)
              </option>
            ))}
          </select>
          <div style={{ fontSize:11, color:"var(--t3)", marginTop:4 }}>
            Setting tier activates it immediately for the user.
          </div>
        </div>

        <div className="fg">
          <label className="lbl" style={{ fontSize:10, letterSpacing:"1px", color:"var(--t3)", fontFamily:"var(--m)" }}>
            KYC STATUS
          </label>
          <select
            value={kyc}
            onChange={e => setKyc(e.target.value)}
            className="inp"
            style={{ padding:"11px 14px", fontSize:13, background:"var(--ink)" }}
          >
            {["none","pending","approved","rejected"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:8 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-gold"  style={{ flex:2 }} onClick={save}>Save Changes</button>
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

    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: h,
      credentials: "include",
    });

    if (res.status === 401 && !opts._retry) {
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
        useStore.getState().setToken(newAccess);
        if (newRefresh && typeof window !== "undefined") {
          localStorage.setItem("refreshToken", newRefresh);
        }
        return af(path, { ...opts, _retry: true });
      } else {
        useStore.getState().setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
    }

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, status: res.status };
  } catch (e) {
    return { ok: false, data: { message: "Network error" }, status: 0 };
  }
}

function FilterRow({value, onChange, opts, onRefresh}){
  return(
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      {opts.map(([v,label])=>(
        <button key={v} onClick={()=>onChange(v)}
          style={{padding:"7px 14px",borderRadius:10,border:`1.5px solid ${value===v?"var(--gold)":"var(--ln)"}`,background:value===v?"rgba(240,165,0,.1)":"var(--ink3)",color:value===v?"var(--gold)":"var(--t2)",fontWeight:700,fontSize:12,cursor:"pointer"}}>
          {label}
        </button>
      ))}
      <button onClick={onRefresh} style={{marginLeft:"auto",padding:"7px 12px",borderRadius:10,border:"1px solid var(--ln)",background:"var(--ink3)",color:"var(--t3)",fontWeight:700,fontSize:11,cursor:"pointer"}}>🔄 Refresh</button>
    </div>
  );
}

export default function AdminPanel({onExit, role}){
  const isMain = role==="main";
  const MENU   = isMain ? MENU_MAIN : MENU_SUB;

  const {addToast,addSignal,banners,addBanner,toggleBanner,deleteBanner,
         addNotif,prices,setWick,
         generateSignal,fetchSignals,approveDeposit,rejectDeposit,
         approveWithdrawal,rejectWithdrawal,
         fetchAdminDeposits,fetchAdminWithdrawals,fetchAdminUsers,fetchAdminDashboard,
         updateAdminUser,broadcastNotif,setPriceWick} = useStore();

  const [sec,     setSec]    = useState("dash");
  const [users,   setUsers]  = useState([]);
  const [deps,    setDeps]   = useState([]);
  const [wds,     setWds]    = useState([]);
  const [kycs,    setKycs]   = useState([]);
  const [dashboard,setDashboard] = useState(null);
  const HISTORY_STORAGE_KEY = "octatrade_admin_signal_history";
  const [codes,   setCodes]  = useState([]);
  const [signalHistory, setSignalHistory] = useState([]);
  const signalHistoryRef = useRef([]);
  const [editU,   setEditU]  = useState(null);
  const [loading, setLoading]= useState(false);
  const [depF,    setDepF]   = useState("pending");
  const [wdF,     setWdF]    = useState("pending");
  const [kycF,    setKycF]   = useState("pending");
  const [previewImage, setPreviewImage] = useState(null);
  const [uQ,setUQ]=useState(""); const [dQ,setDQ]=useState("");
  const [wQ,setWQ]=useState(""); const [kQ,setKQ]=useState("");
  const [selPair,setSelPair]=useState(PAIRS[0]), [selSide,setSelSide]=useState("BUY");
  const [gCode,setGCode]=useState(""), [gBusy,setGBusy]=useState(false);
  const [wSym,setWSym]=useState("BTC"), [wTarget,setWTarget]=useState(""), [wDur,setWDur]=useState("60");
  const [nb,setNb]=useState({title:"",text:"",color:"#f0a500"});
  const [nf,setNf]=useState({title:"",body:""});

  const timerRef = useRef(null);

  const persistHistory = (history) => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {}
  };

  useEffect(() => {
    if (!isMain) return;
    try {
      const saved = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          signalHistoryRef.current = parsed;
          setSignalHistory(parsed);
        }
      }
    } catch (e) {}
  }, [isMain]);
  const userPollRef = useRef(null);
  const codesPollRef = useRef(null);

  useEffect(()=>{
    load(sec);
    // General timer for dashboard, deposits, withdrawals, kyc
    timerRef.current = setInterval(()=>load(sec), 30_000);
    return()=>clearInterval(timerRef.current);
  // eslint-disable-next-line
  },[sec,depF,wdF,kycF]);

  // Separate polling for users section - more frequent for real-time updates
  useEffect(()=>{
    if(sec === "users"){
      // Initial load
      loadUsers();
      // Poll every 3 seconds for real-time user updates
      userPollRef.current = setInterval(loadUsers, 3_000);
    } else {
      if(userPollRef.current) clearInterval(userPollRef.current);
    }
    return()=> { if(userPollRef.current) clearInterval(userPollRef.current); };
  // eslint-disable-next-line
  },[sec]);

  // Separate polling for codes section - refresh every 10 seconds to track expiration
  useEffect(()=>{
    if(sec === "codes"){
      load("codes");
      codesPollRef.current = setInterval(()=>load("codes"), 10_000);
    } else {
      if(codesPollRef.current) clearInterval(codesPollRef.current);
    }
    return()=> { if(codesPollRef.current) clearInterval(codesPollRef.current); };
  // eslint-disable-next-line
  },[sec]);

  const loadUsers = async()=>{
    const d = await fetchAdminUsers();
    if(Array.isArray(d)) setUsers(d);
  };

  const load=async(s)=>{
    setLoading(true);
    if(s==="dash"){
      const stats = await fetchAdminDashboard();
      if(stats) setDashboard(stats);
    }
    // Users are handled separately with more frequent polling
    // if(s==="users"){ const d=await fetchAdminUsers(); if(Array.isArray(d))setUsers(d); }
    if(s==="deps"){
      const status=!isMain?"pending":depF==="all"?"":"pending";
      const d=await fetchAdminDeposits(status); if(Array.isArray(d))setDeps(d);
    }
    if(s==="wds"){
      const status=!isMain?"pending":wdF==="all"?"":"pending";
      const d=await fetchAdminWithdrawals(status); if(Array.isArray(d))setWds(d);
    }
    if(s==="kyc"){
      const status=kycF==="all"?"all":kycF;
      const r=await af(`/admin/kyc${status?`?status=${status}`:""}`);
      if(r.ok){
        // FIX: map kycDocFront/kycDocBack (schema field names) → kycFront/kycBack (UI names)
        // Also map kycFullName → kycName for display, kycAddress for address display
        const raw = r.data.data?.users || r.data.users || [];
        setKycs(raw.map(u=>({
          id:        u._id,
          user:      u.kycName || u.kycFullName || u.fullName,
          email:     u.email,
          phone:     u.kycPhone || u.phone || "",
          uid:       "OCT"+(u._id||"").slice(-6).toUpperCase(),
          address:   u.kycAddress || "",
          submitted: u.kycSubmittedAt
            ? new Date(u.kycSubmittedAt).toLocaleDateString()
            : u.createdAt?.split("T")[0] || "",
          status:    u.kycStatus,
          // Map schema field names to the UI names used in the template below
          kycFront:  u.kycFront || u.kycDocFront || null,
          kycBack:   u.kycBack  || u.kycDocBack  || null,
        })));
      }
    }
    if(s==="codes"){
      const signals = await fetchSignals();
      if(Array.isArray(signals)) {
        const now = Date.now();
        const activeSignals = signals.filter(sig => {
          const expiresMs = new Date(sig.expiresAt).getTime();
          return !isNaN(expiresMs) && expiresMs > now;
        });

        if(isMain) {
          const mergedById = {};
          signals.forEach(sig => {
            const expiresMs = new Date(sig.expiresAt).getTime();
            mergedById[sig._id] = {
              ...sig,
              isExpired: isNaN(expiresMs) ? false : expiresMs <= now,
            };
          });
          signalHistoryRef.current.forEach(sig => {
            if (!mergedById[sig._id]) {
              mergedById[sig._id] = {
                ...sig,
                isExpired: !sig.expiresAt ? true : new Date(sig.expiresAt).getTime() <= now,
              };
            }
          });
          const mergedHistory = Object.values(mergedById).sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt));
          const expiredHistory = mergedHistory.filter(sig => sig.isExpired);
          signalHistoryRef.current = expiredHistory;
          setSignalHistory(expiredHistory);
          persistHistory(expiredHistory);
        } else {
          signalHistoryRef.current = [];
          setSignalHistory([]); // Sub admin sees no history
          persistHistory([]);
        }

        setCodes(activeSignals.map(sig => ({
          code: sig.code,
          pair: sig.coin.replace('USDT', ''),
          side: sig.direction === 'LONG' ? 'BUY' : 'SELL',
          created: new Date(sig.createdAt).toLocaleString(),
          expires: new Date(sig.expiresAt).toLocaleString(),
          used: sig.usageCount || 0,
          status: 'active'
        })));
      }
    }
    setLoading(false);
  };

  const refresh=()=>{load(sec);addToast("Refreshed","info");};

  const q=s=>s.toLowerCase();
  const visU = isMain?users:users.filter(u=>!u.isHidden);
  const fu = visU.filter(u=>!uQ||(q(u.name||"").includes(q(uQ))||q(u.email||"").includes(q(uQ))||q(u.phone||"").includes(q(uQ))));
  const fd = deps.filter(d=>!dQ||(q(d.user||"").includes(q(dQ))||q(d.hash||"").includes(q(dQ))));
  const fw = wds.filter(w=>!wQ||(q(w.user||"").includes(q(wQ))||q(w.address||"").includes(q(wQ))));
  const fk = kycs.filter(k=>!kQ||(q(k.user||"").includes(q(kQ))||q(k.email||"").includes(q(kQ))));

  const saveU = async (u) => {
  await updateAdminUser(u.id, {
    name:      u.name,
    email:     u.email,
    phone:     u.phone,
    fundBal:   u.fundBal,
    tradeBal:  u.tradeBal,
    earnings:  u.earnings,
    withdrawn: u.withdrawn,
    kycStatus: u.kycStatus,
    tier:      u.tier,
  });
  setUsers(p => p.map(x => x.id === u.id ? {...x, ...u} : x));
};

  const delU=async(id,name)=>{
    if(!window.confirm(`Delete ${name}? This cannot be undone.`))return;
    const r=await af(`/admin/users/${id}`,{method:"DELETE"});
    if(r.ok){setUsers(p=>p.filter(x=>x.id!==id));addToast("User deleted","info");}
    else addToast("Delete failed","err");
  };

  const toggleHide=async(id)=>{
    const r=await af(`/admin/users/${id}/hide`,{method:"PUT"});
    if(r.ok){
      const u=users.find(x=>x.id===id);
      setUsers(p=>p.map(x=>x.id===id?{...x,isHidden:!x.isHidden}:x));
      addToast(u?.isHidden?"User now visible to Admin":"User hidden from Admin","info");
    } else {
      addToast(r.data?.message||"Failed to update visibility","err");
    }
  };

  const appD=async id=>{const ok=await approveDeposit(id);if(ok)setDeps(p=>p.map(d=>d.id===id?{...d,status:"approved"}:d));};
  const rejD=async id=>{const ok=await rejectDeposit(id); if(ok)setDeps(p=>p.map(d=>d.id===id?{...d,status:"rejected"}:d));};
  const appW=async id=>{const ok=await approveWithdrawal(id);if(ok)setWds(p=>p.map(w=>w.id===id?{...w,status:"approved"}:w));};
  const rejW=async id=>{const ok=await rejectWithdrawal(id); if(ok)setWds(p=>p.map(w=>w.id===id?{...w,status:"rejected"}:w));};

  const appK=async id=>{
    const r=await af(`/admin/kyc/${id}/approve`,{method:"PUT"});
    if(r.ok){setKycs(p=>p.map(k=>k.id===id?{...k,status:"approved"}:k));addToast("KYC approved ✅","ok");}
    else addToast(r.data?.message||"Failed","err");
  };
  const rejK=async id=>{
    const reason = window.prompt("Rejection reason (optional):") || "Documents unclear";
    const r=await af(`/admin/kyc/${id}/reject`,{method:"PUT",body:JSON.stringify({reason})});
    if(r.ok){setKycs(p=>p.map(k=>k.id===id?{...k,status:"rejected"}:k));addToast("KYC rejected","info");}
    else addToast(r.data?.message||"Failed","err");
  };

  const genSig=async()=>{
    setGBusy(true);
    const coin=selPair.split("/")[0];
    const sig=await generateSignal({coin:coin+"USDT",direction:selSide==="BUY"?"LONG":"SHORT",tier:"All",expiryMinutes:15});
    if(sig){
      setGCode(sig.code);
      const now=new Date(),exp=new Date(now.getTime()+900_000);
      const fmt=d=>`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      setCodes(p=>[{code:sig.code,pair:selPair,side:selSide,created:fmt(now),expires:fmt(exp),used:0,status:"active"},...p]);
    }
    setGBusy(false);
  };

  const STATS_MAIN=[
    {icon:"👥",label:"Total Users",  value:users.length||"—"},
    {icon:"✅",label:"KYC Verified", value:users.filter(u=>u.kycStatus==="approved").length||0},
    {icon:"🔑",label:"Active Codes", value:codes.filter(c=>c.status==="active").length},
    {icon:"💰",label:"WD Approved",  value:wds.filter(w=>w.status==="approved").length||0},
    {icon:"⬇", label:"Dep Pending",  value:deps.filter(d=>d.status==="pending").length},
    {icon:"🪪", label:"KYC Pending",  value:dashboard?.pendingKyc ?? kycs.filter(k=>k.status==="pending").length},
  ];
  const STATS_SUB=[
    {icon:"👥",label:"Users",        value:visU.length||"—"},
    {icon:"🔑",label:"Active Codes", value:codes.filter(c=>c.status==="active").length},
    {icon:"⬇", label:"Dep Pending",  value:deps.filter(d=>d.status==="pending").length},
    {icon:"⬆", label:"WD Pending",   value:wds.filter(w=>w.status==="pending").length},
    {icon:"🪪", label:"KYC Pending",  value:dashboard?.pendingKyc ?? kycs.filter(k=>k.status==="pending").length},
  ];
  const STATS = isMain ? STATS_MAIN : STATS_SUB;

  // Build full image URL — handles data URIs and relative paths from backend
  const imgUrl = (p) => {
    if (!p) return null;
    if (/^(https?:|data:)/.test(p)) return p;
    const base = API.replace("/api", "");
    return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
  };

  return(
    <>
      {previewImage && (
        <div onClick={()=>setPreviewImage(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"zoom-out"}}>
          <img src={previewImage} alt="KYC preview" style={{maxWidth:"100%",maxHeight:"100%",borderRadius:18,boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}/>
        </div>
      )}
      {editU&&<EditModal user={editU} onSave={saveU} onClose={()=>setEditU(null)}/>}
      <div style={{width:"100%",maxWidth:"var(--max)",margin:"0 auto",height:"100dvh",display:"flex",flexDirection:"column",background:"var(--ink)",overflow:"hidden"}}>

        <div style={{height:52,flexShrink:0,background:"var(--ink2)",borderBottom:"1px solid var(--ln)",display:"flex",alignItems:"center",padding:"0 16px",gap:12}}>
          <button onClick={onExit} style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:"var(--t2)",background:"none",border:"none",cursor:"pointer"}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Exit
          </button>
          <span style={{fontSize:16,fontWeight:800}}>Admin Panel</span>
          <span className={`badge ${isMain?"b-pu":"b-au"}`} style={{marginLeft:"auto",fontSize:10}}>{isMain?"MAIN ADMIN":"ADMIN"}</span>
          <button onClick={onExit} style={{fontSize:11,color:"var(--dn)",fontWeight:700,background:"none",border:"none",cursor:"pointer"}}>Log Out</button>
        </div>

        <div style={{flexShrink:0,background:"var(--ink2)",borderBottom:"1px solid var(--ln)",overflowX:"auto",display:"flex"}}>
          {MENU.map(m=>(
            <button key={m.id} onClick={()=>setSec(m.id)}
              style={{padding:"11px 12px",background:"none",border:"none",borderBottom:sec===m.id?"2.5px solid var(--gold)":"2.5px solid transparent",color:sec===m.id?"var(--gold)":"var(--t3)",fontFamily:"var(--f)",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <div style={{flex:1,overflowY:"auto",padding:16}}>

          {/* DASHBOARD */}
          {sec==="dash"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontWeight:800,fontSize:15}}>Overview</span>
                <button onClick={refresh} style={{padding:"6px 12px",borderRadius:8,border:"1px solid var(--ln)",background:"var(--ink3)",color:"var(--t3)",fontSize:11,cursor:"pointer"}}>🔄 Refresh</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
                {STATS.map(s=>(
                  <div key={s.label} className="astat">
                    <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                    <div style={{fontSize:20,fontWeight:900,fontFamily:"var(--m)",color:"var(--gold)"}}>{s.value}</div>
                    <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginTop:3,lineHeight:1.2}}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:12,padding:"12px 16px",fontSize:12,color:"var(--t3)",lineHeight:1.8}}>
                🔄 Auto-refreshes every 30 seconds · Approve/reject updates instantly
              </div>
            </div>
          )}

          {/* USERS */}
          {sec==="users"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:12,color:"var(--t3)"}}>
                  {fu.length} user{fu.length!==1?"s":""}
                  {isMain&&users.filter(u=>u.isHidden).length>0&&(
                    <span style={{marginLeft:8,fontSize:10,color:"var(--dn)",fontWeight:700}}>({users.filter(u=>u.isHidden).length} hidden from Admin)</span>
                  )}
                </span>
                <button onClick={refresh} style={{padding:"5px 10px",borderRadius:8,border:"1px solid var(--ln)",background:"var(--ink3)",color:"var(--t3)",fontSize:11,cursor:"pointer"}}>🔄</button>
              </div>
              <SearchBar onSearch={setUQ} placeholder="Search name, email, phone..."/>
              {loading&&<div style={{textAlign:"center",padding:20,color:"var(--t3)"}}>Loading users...</div>}
              {!loading&&fu.length===0&&<div className="empty"><div className="ei">👥</div><p style={{fontSize:13}}>No users found</p></div>}

              {fu.map(u=>(
                <div key={u.id} className="card" style={{padding:14,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,var(--gold),#c07800)",display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontWeight:900,fontSize:13,flexShrink:0}}>
                      {(u.name||"?")[0].toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontWeight:700,fontSize:13}}>{u.name}</span>
                        {isMain&&u.isHidden&&<span style={{fontSize:9,fontWeight:700,background:"rgba(255,59,92,.15)",color:"var(--dn)",border:"1px solid rgba(255,59,92,.3)",borderRadius:4,padding:"2px 5px"}}>HIDDEN</span>}
                      </div>
                      <div style={{fontSize:11,color:"var(--t2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
                      <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)"}}>{u.phone||""}{u.phone?" · ":""}{u.joined}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <span className="badge b-au" style={{fontSize:9}}>{u.tier||"No Tier"}</span>
                      {(()=>{const lv=getRefLevel(u.referralCount??0);return lv.level>0?<span style={{display:"inline-flex",background:lv.color+"18",border:"1px solid "+lv.color+"40",borderRadius:20,padding:"2px 7px",fontSize:9,fontWeight:900,fontFamily:"var(--m)",color:lv.color}}>★ {lv.label}</span>:null;})()}
                      <SB s={u.kycStatus??"none"}/>
                    </div>
                  </div>

                  {isMain&&(
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8}}>
                      {[["Funding","$"+(u.fundBal??0).toFixed(0),"var(--blue)"],["Trading","$"+(u.tradeBal??0).toFixed(0),"var(--up)"],["Earned","$"+(u.earnings??0).toFixed(0),"var(--gold)"],["Withdrawn","$"+(u.withdrawn??0).toFixed(0),"var(--dn)"]].map(([l,v,c])=>(
                        <div key={l} style={{background:"var(--ink2)",borderRadius:8,padding:"8px 10px"}}>
                          <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:2}}>{l}</div>
                          <div style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)",color:c}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{background:"var(--ink2)",borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",gap:16,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:"var(--t3)"}}>UID: <strong style={{fontFamily:"var(--m)",color:"var(--gold)",letterSpacing:1}}>{u.uid||"—"}</strong></span>
                    <span style={{fontSize:11,color:"var(--t3)"}}>Ref by: <span style={{color:"var(--blue)"}}>{u.referredBy||"—"}</span></span>
                    <span style={{fontSize:11,color:"var(--t3)"}}>Referrals: <strong style={{color:getRefLevel(u.referralCount||0).color}}>{u.referralCount||0}</strong></span>
                  </div>

                  {isMain?(
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <button className="btn btn-outline btn-sm" style={{flex:"1 1 70px"}} onClick={()=>setEditU(u)}>✏️ Edit</button>
                      <button className="btn btn-red btn-sm"     style={{flex:"1 1 70px"}} onClick={()=>delU(u.id,u.name)}>🗑 Delete</button>
                      <button
                        onClick={()=>toggleHide(u.id)}
                        style={{flex:"1 1 70px",padding:"7px 10px",borderRadius:8,
                          border:`1.5px solid ${u.isHidden?"rgba(255,59,92,.4)":"rgba(255,165,0,.3)"}`,
                          background:u.isHidden?"rgba(255,59,92,.08)":"rgba(255,165,0,.08)",
                          color:u.isHidden?"var(--dn)":"var(--gold)",
                          fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                        {u.isHidden?"👁 Show":"🚫 Hide"}
                      </button>
                    </div>
                  ):(
                    null
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SIGNALS */}
          {sec==="codes"&&(
            <div>
              <div className="card" style={{padding:18,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>🔑 Generate Signal Code</div>
                <div style={{marginBottom:14}}>
                  <div className="lbl" style={{marginBottom:8}}>Trading Pair</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                    {PAIRS.map(p=><button key={p} onClick={()=>setSelPair(p)} style={{padding:"6px 11px",borderRadius:8,border:selPair===p?"1.5px solid var(--gold)":"1px solid var(--ln)",background:selPair===p?"rgba(240,165,0,.1)":"var(--ink2)",color:selPair===p?"var(--gold)":"var(--t2)",fontFamily:"var(--m)",fontSize:11,fontWeight:700,cursor:"pointer"}}>{p}</button>)}
                  </div>
                  <div className="lbl" style={{marginBottom:8}}>Direction</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {["BUY","SELL"].map(s=><button key={s} onClick={()=>setSelSide(s)} style={{padding:"10px 0",borderRadius:10,border:`2px solid ${selSide===s?(s==="BUY"?"var(--up)":"var(--dn)"):"var(--ln)"}`,background:selSide===s?(s==="BUY"?"rgba(0,200,150,.12)":"rgba(255,59,92,.12)"):"var(--ink2)",color:selSide===s?(s==="BUY"?"var(--up)":"var(--dn)"):"var(--t2)",fontWeight:800,fontSize:14,cursor:"pointer"}}>{s==="BUY"?"▲ BUY":"▼ SELL"}</button>)}
                  </div>
                </div>
                {gCode&&(
                  <div style={{background:"rgba(240,165,0,.08)",border:"1px solid rgba(240,165,0,.25)",borderRadius:12,padding:"14px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:4}}>GENERATED CODE — valid 15 min</div>
                      <div style={{fontSize:24,fontWeight:900,fontFamily:"var(--m)",color:"var(--gold)",letterSpacing:4}}>{gCode}</div>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={()=>{navigator.clipboard?.writeText(gCode);addToast("Copied!","ok");}}>📋 Copy</button>
                  </div>
                )}
                <button className="btn btn-purple btn-block" onClick={genSig} disabled={gBusy}>{gBusy?<><span className="spin spin-w"/>Generating...</>:"⚡ Generate Code"}</button>
              </div>
              {/* ACTIVE CODES */}
              <div className="card" style={{padding:18,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>🔑 Active Signal Codes</div>
                {codes.length===0&&<div className="empty"><div className="ei">🔑</div><p style={{fontSize:13}}>No active codes</p></div>}
                {codes.map((item,i)=>(
                  <div key={i} style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:12,padding:"13px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <span style={{fontFamily:"var(--m)",fontSize:15,fontWeight:900,color:item.status==="active"?"var(--gold)":"var(--t3)",letterSpacing:1}}>{item.code}</span>
                        <span className={`badge ${item.side==="BUY"?"b-up":"b-dn"}`} style={{fontSize:9}}>{item.side}</span>
                        <SB s={item.status}/>
                      </div>
                      <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--m)"}}>{item.pair} · Created {item.created} · Exp {item.expires}</div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontFamily:"var(--m)",fontSize:18,fontWeight:900,color:"var(--blue)"}}>{item.used}</div><div style={{fontSize:10,color:"var(--t3)"}}>users</div></div>
                  </div>
                ))}
              </div>

              {/* SIGNAL HISTORY - MAIN ADMIN ONLY */}
              {isMain && (
                <div className="card" style={{padding:18,marginTop:20}}>
                  <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>📚 Signal History</div>
                  {signalHistory.length===0&&<div className="empty"><div className="ei">📚</div><p style={{fontSize:13}}>No signal history available</p></div>}
                  {signalHistory.map((signal,i)=>(
                    <div key={signal._id} style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:12,padding:"13px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontFamily:"var(--m)",fontSize:15,fontWeight:900,color:signal.isExpired?"var(--t3)":"var(--gold)",letterSpacing:1}}>{signal.code}</span>
                          <span className={`badge ${signal.direction==="LONG"?"b-up":"b-dn"}`} style={{fontSize:9}}>{signal.direction==="LONG"?"BUY":"SELL"}</span>
                          <SB s={signal.isExpired?"expired":"active"}/>
                        </div>
                        <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--m)"}}>
                          {signal.coin} · {signal.tier} · Created {new Date(signal.createdAt).toLocaleDateString()} · Exp {new Date(signal.expiresAt).toLocaleDateString()}
                          {signal.createdBy&&<span> · By {signal.createdBy.fullName||signal.createdBy.email}</span>}
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}><div style={{fontFamily:"var(--m)",fontSize:18,fontWeight:900,color:"var(--blue)"}}>{signal.usageCount||0}</div><div style={{fontSize:10,color:"var(--t3)"}}>users</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRICE CONTROL */}
          {sec==="price"&&isMain&&(
            <div>
              <div style={{background:"rgba(255,59,92,.08)",border:"1px solid rgba(255,59,92,.2)",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:13,color:"var(--t2)",lineHeight:1.6}}>
                ⚠️ <strong style={{color:"var(--dn)"}}>Demo Only</strong> — Price manipulation for demonstration purposes. 🔒 Main Admin Only.
              </div>
              <div className="card" style={{padding:18,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>📈 Launch Price Wick</div>
                <div style={{marginBottom:14}}>
                  <div className="lbl" style={{marginBottom:8}}>Select Coin</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {Object.keys(COINS).map(s=><button key={s} onClick={()=>setWSym(s)} style={{padding:"6px 12px",borderRadius:8,border:wSym===s?"1.5px solid var(--gold)":"1px solid var(--ln)",background:wSym===s?"rgba(240,165,0,.1)":"var(--ink2)",color:wSym===s?"var(--gold)":"var(--t2)",fontFamily:"var(--m)",fontSize:12,fontWeight:700,cursor:"pointer"}}>{s}</button>)}
                  </div>
                </div>
                <div style={{background:"var(--ink2)",border:"1px solid var(--ln)",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--t2)",fontSize:13}}>Current {wSym}</span>
                  <span style={{fontFamily:"var(--m)",fontSize:14,fontWeight:700,color:"var(--gold)"}}>${(prices[wSym]??COINS[wSym]?.price??0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                </div>
                <div className="fg">
                  <label className="lbl">Target Price ($)</label>
                  <input className="inp" type="number" value={wTarget} onChange={e=>setWTarget(e.target.value)} placeholder={`e.g. ${((prices[wSym]??COINS[wSym]?.price??0)*1.05).toFixed(2)}`}/>
                  {wTarget&&parseFloat(wTarget)>0&&<div style={{fontSize:11,color:parseFloat(wTarget)>(prices[wSym]??0)?"var(--up)":"var(--dn)",marginTop:4}}>{parseFloat(wTarget)>(prices[wSym]??0)?"▲ Pump":"▼ Dump"} — {Math.abs(((parseFloat(wTarget)-(prices[wSym]??0))/(prices[wSym]||1))*100).toFixed(2)}%</div>}
                </div>
                <div className="fg">
                  <label className="lbl">Duration (seconds)</label>
                  <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                    {["10","30","60","120","300"].map(d=><button key={d} onClick={()=>setWDur(d)} style={{padding:"6px 12px",borderRadius:8,border:wDur===d?"1.5px solid var(--blue)":"1px solid var(--ln)",background:wDur===d?"rgba(45,156,255,.1)":"var(--ink2)",color:wDur===d?"var(--blue)":"var(--t2)",fontFamily:"var(--m)",fontSize:12,fontWeight:700,cursor:"pointer"}}>{d}s</button>)}
                  </div>
                  <input className="inp" type="number" value={wDur} onChange={e=>setWDur(e.target.value)}/>
                </div>
                <button className="btn btn-gold btn-block" onClick={async()=>{const t=parseFloat(wTarget),d=parseInt(wDur);if(!t||t<=0){addToast("Enter target price","err");return;}if(!d||d<=0){addToast("Enter duration","err");return;}await setPriceWick(wSym,t,d);}}>🚀 Launch Wick</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[{label:"BTC +5%",sym:"BTC",mult:1.05,dur:60,c:"var(--up)"},{label:"BTC -5%",sym:"BTC",mult:0.95,dur:60,c:"var(--dn)"},{label:"ETH +10%",sym:"ETH",mult:1.10,dur:120,c:"var(--up)"},{label:"ETH -10%",sym:"ETH",mult:0.90,dur:120,c:"var(--dn)"},{label:"SOL +8%",sym:"SOL",mult:1.08,dur:60,c:"var(--up)"},{label:"BNB -7%",sym:"BNB",mult:0.93,dur:90,c:"var(--dn)"}].map(p=>(
                  <button key={p.label} onClick={()=>{const sp=prices[p.sym]??COINS[p.sym]?.price??0;setWick({sym:p.sym,targetPrice:sp*p.mult,durationMs:p.dur*1000,startPrice:sp,startAt:Date.now()});addToast(`${p.label} launched`,"ok");}} style={{padding:"12px 10px",borderRadius:12,border:`1px solid ${p.c}30`,background:`${p.c}10`,color:p.c,fontWeight:700,fontSize:12,cursor:"pointer",textAlign:"center"}}>{p.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* DEPOSITS */}
          {sec==="deps"&&(
            <div>
              {isMain&&<FilterRow value={depF} onChange={setDepF} onRefresh={refresh} opts={[["pending","⏳ Pending"],["all","📋 All History"]]}/>}
              {!isMain&&<div style={{marginBottom:14,display:"flex",justifyContent:"flex-end"}}><button onClick={refresh} style={{padding:"6px 12px",borderRadius:8,border:"1px solid var(--ln)",background:"var(--ink3)",color:"var(--t3)",fontSize:11,cursor:"pointer"}}>🔄 Refresh</button></div>}
              <SearchBar onSearch={setDQ} placeholder="Search user, TX hash..."/>
              {loading&&<div style={{textAlign:"center",padding:20,color:"var(--t3)"}}>Loading deposits...</div>}
              {!loading&&fd.length===0&&<div className="empty"><div className="ei">⬇️</div><p style={{fontSize:13}}>No deposits found</p></div>}
              {fd.map(d=>(
                <div key={d.id} className="card" style={{padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div><div style={{fontWeight:700,fontSize:14}}>{d.user}</div><div style={{fontSize:12,color:"var(--t2)",marginTop:2}}>{d.tier||"—"} · {d.network}</div>{d.date&&<div style={{fontSize:10,color:"var(--t3)",marginTop:2}}>{d.date}</div>}</div>
                    <SB s={d.status}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:8,marginBottom:d.status==="pending"?12:0}}>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:2}}>TX HASH</div><div style={{fontSize:11,fontFamily:"var(--m)",color:"var(--blue)",wordBreak:"break-all"}}>{d.hash}</div></div>
                    <div style={{textAlign:"right",flexShrink:0}}><div style={{fontFamily:"var(--m)",fontSize:18,fontWeight:900,color:"var(--up)"}}>+${d.amount}</div></div>
                  </div>
                  {d.status==="pending"&&<div style={{display:"flex",gap:8}}><button className="btn btn-green btn-sm" style={{flex:1}} onClick={()=>appD(d.id)}>✓ Approve</button><button className="btn btn-red btn-sm" style={{flex:1}} onClick={()=>rejD(d.id)}>✕ Reject</button></div>}
                </div>
              ))}
            </div>
          )}

          {/* WITHDRAWALS */}
          {sec==="wds"&&(
            <div>
              {isMain&&<FilterRow value={wdF} onChange={setWdF} onRefresh={refresh} opts={[["pending","⏳ Pending"],["all","📋 All History"]]}/>}
              {!isMain&&<div style={{marginBottom:14,display:"flex",justifyContent:"flex-end"}}><button onClick={refresh} style={{padding:"6px 12px",borderRadius:8,border:"1px solid var(--ln)",background:"var(--ink3)",color:"var(--t3)",fontSize:11,cursor:"pointer"}}>🔄 Refresh</button></div>}
              <SearchBar onSearch={setWQ} placeholder="Search user, wallet address..."/>
              {loading&&<div style={{textAlign:"center",padding:20,color:"var(--t3)"}}>Loading withdrawals...</div>}
              {!loading&&fw.length===0&&<div className="empty"><div className="ei">⬆️</div><p style={{fontSize:13}}>No withdrawals found</p></div>}
              {fw.map(w=>(
                <div key={w.id} className="card" style={{padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div><div style={{fontWeight:700,fontSize:14}}>{w.user}</div><div style={{fontSize:12,color:"var(--t2)",marginTop:2}}>{w.network}</div>{w.date&&<div style={{fontSize:10,color:"var(--t3)",marginTop:2}}>{w.date}</div>}</div>
                    <SB s={w.status}/>
                  </div>
                  <div style={{background:"var(--ink2)",borderRadius:8,padding:"8px 10px",marginBottom:10}}>
                    <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:2}}>WALLET ADDRESS</div>
                    <div style={{fontSize:11,fontFamily:"var(--m)",color:"var(--blue)",wordBreak:"break-all"}}>{w.address}</div>
                  </div>
                  <div style={{marginBottom:w.status==="pending"?12:0}}>
  <div style={{fontFamily:"var(--m)",fontSize:18,fontWeight:900,color:"var(--dn)"}}>-${w.amount}</div>
  <div style={{fontSize:11,color:"var(--t3)",marginTop:3,lineHeight:1.7}}>
    Platform fee (5%): -${(w.amount*0.05).toFixed(2)}
  </div>
  <div style={{fontSize:12,fontWeight:700,color:"var(--up)",marginTop:2}}>
    User receives: ${(w.amount - w.amount*0.05).toFixed(2)}
  </div>
</div>
                  {w.status==="pending"&&<div style={{display:"flex",gap:8}}><button className="btn btn-green btn-sm" style={{flex:1}} onClick={()=>appW(w.id)}>✓ Approve</button><button className="btn btn-red btn-sm" style={{flex:1}} onClick={()=>rejW(w.id)}>✕ Reject</button></div>}
                </div>
              ))}
            </div>
          )}

          {/* KYC */}
          {sec==="kyc"&&(
            <div>
              <FilterRow value={kycF} onChange={setKycF} onRefresh={refresh} opts={isMain ? [["pending","⏳ Pending"],["approved","✅ Approved"],["rejected","❌ Rejected"],["all","📋 All"]] : [["pending","⏳ Pending"]]}/>
              <SearchBar onSearch={setKQ} placeholder="Search name, email..."/>
              {loading&&<div style={{textAlign:"center",padding:20,color:"var(--t3)"}}>Loading KYC...</div>}
              {!loading&&fk.length===0&&<div className="empty"><div className="ei">🪪</div><p style={{fontSize:13}}>No KYC requests found</p></div>}
              {fk.map(k=>(
                <div key={k.id} className="card" style={{padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14}}>{k.user}</div>
                      <div style={{fontSize:11,color:"var(--t2)",marginTop:2}}>{k.email}{k.phone?` · ${k.phone}`:""}</div>
                      {/* Show submitted address */}
                      {k.address&&<div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>📍 {k.address}</div>}
                      <div style={{fontSize:10,color:"var(--gold)",fontFamily:"var(--m)",fontWeight:700,marginTop:3,letterSpacing:1}}>UID: {k.uid}</div>
                      <div style={{fontSize:10,color:"var(--t3)",marginTop:2}}>Submitted: {k.submitted}</div>
                    </div>
                    <SB s={k.status}/>
                  </div>
                  {/* CNIC images — kycFront/kycBack mapped from kycDocFront/kycDocBack */}
                  {(k.kycFront||k.kycBack)&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                      {[["CNIC Front",k.kycFront],["CNIC Back",k.kycBack]].map(([label,url])=>{
                        const full = imgUrl(url);
                        return(
                          <div key={label} style={{background:"var(--ink2)",border:"1px solid var(--ln2)",borderRadius:10,overflow:"hidden"}}>
                            {full
                              ? <button onClick={()=>setPreviewImage(full)} style={{all:"unset",cursor:"pointer",display:"block",width:"100%"}}>
                                  <img src={full} alt={label} style={{width:"100%",height:100,objectFit:"cover",display:"block"}}/>
                                </button>
                              : <div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:24}}>🪪</span></div>
                            }
                            <div style={{padding:"5px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",fontWeight:700}}>{label}</span>
                              {full&&<button onClick={()=>setPreviewImage(full)} style={{all:"unset",cursor:"pointer",fontSize:10,color:"var(--blue)",textDecoration:"underline",fontWeight:700}}>View</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {k.status==="pending"&&<div style={{display:"flex",gap:8}}><button className="btn btn-green btn-sm" style={{flex:1}} onClick={()=>appK(k.id)}>✓ Approve KYC</button><button className="btn btn-red btn-sm" style={{flex:1}} onClick={()=>rejK(k.id)}>✕ Reject</button></div>}
                </div>
              ))}
            </div>
          )}

          {/* BANNERS */}
          {sec==="banners"&&isMain&&(
            <div>
              <div className="card" style={{padding:16,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>Add Banner</div>
                <div className="fg"><label className="lbl">Title</label><input className="inp" placeholder="e.g. 🎉 Welcome Bonus" value={nb.title} onChange={e=>setNb(p=>({...p,title:e.target.value}))}/></div>
                <div className="fg"><label className="lbl">Message</label><input className="inp" placeholder="Banner text..." value={nb.text} onChange={e=>setNb(p=>({...p,text:e.target.value}))}/></div>
                <div className="fg"><label className="lbl">Color</label><div style={{display:"flex",gap:8}}>{["#f0a500","#00c896","#2d9cff","#a855f7","#ff3b5c"].map(c=><button key={c} onClick={()=>setNb(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,border:nb.color===c?"3px solid #fff":"2px solid transparent",cursor:"pointer"}}/>)}</div></div>
                <button className="btn btn-gold btn-sm" onClick={()=>{if(!nb.title)return;addBanner({id:"b"+Date.now(),...nb,active:true});setNb({title:"",text:"",color:"#f0a500"});addToast("Banner added","ok");}}>Add Banner</button>
              </div>
              {banners.map(b=>(
                <div key={b.id} style={{background:`linear-gradient(135deg,${b.color}18,${b.color}08)`,border:`1px solid ${b.color}30`,borderRadius:12,padding:14,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                  <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{b.title}</div><div style={{fontSize:11,color:"var(--t2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.text}</div></div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>toggleBanner(b.id)}>{b.active?"Hide":"Show"}</button>
                    <button className="btn btn-red btn-sm" onClick={()=>{deleteBanner(b.id);addToast("Removed","info");}}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFS */}
          {sec==="notifs"&&isMain&&(
            <div>
              <div className="card" style={{padding:16,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>Send Notification to All Users</div>
                <div className="fg"><label className="lbl">Title</label><input className="inp" placeholder="Notification title" value={nf.title} onChange={e=>setNf(p=>({...p,title:e.target.value}))}/></div>
                <div className="fg"><label className="lbl">Message</label><textarea className="inp" rows={3} placeholder="Message body..." value={nf.body} onChange={e=>setNf(p=>({...p,body:e.target.value}))} style={{resize:"none"}}/></div>
                <button className="btn btn-gold btn-sm" onClick={async()=>{if(!nf.title){addToast("Title required","err");return;}await broadcastNotif(nf.title,nf.body);addNotif({id:"n"+Date.now(),title:nf.title,body:nf.body,time:"just now",read:false});setNf({title:"",body:""});}}>Send to All Users</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}