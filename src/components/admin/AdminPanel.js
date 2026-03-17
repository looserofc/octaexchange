import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  PAIRS, genSignalCode,
  MOCK_USERS_INIT, DEPOSIT_REQUESTS_INIT,
  WITHDRAWAL_REQUESTS_INIT, ADMIN_CODES_INIT,
} from "@/lib/data";

const MENU = [
  { id: "dashboard",     icon: "📊", label: "Dashboard" },
  { id: "users",         icon: "👥", label: "Users" },
  { id: "codes",         icon: "🔑", label: "Signal Codes" },
  { id: "deposits",      icon: "⬇",  label: "Deposits" },
  { id: "withdrawals",   icon: "⬆",  label: "Withdrawals" },
  { id: "kyc",           icon: "🪪",  label: "KYC" },
  { id: "banners",       icon: "🖼",  label: "Banners" },
  { id: "notifications", icon: "🔔", label: "Notifications" },
];

const BANNER_COLORS = ["#f5a623", "#00c6ff", "#00d68f", "#8b5cf6", "#ff4560"];

// ── Search bar ────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="inp-wrap" style={{ marginBottom: 14 }}>
      <input className="inp" placeholder={placeholder ?? "Search..."} value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingLeft: 40, fontSize: 13 }}
      />
      <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--c3)", pointerEvents: "none" }}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────
function SBadge({ s }) {
  const cls = s==="approved"||s==="active" ? "badge-up" : s==="pending" ? "badge-gold" : "badge-dn";
  return <span className={`badge ${cls}`} style={{ fontSize: 10 }}>{s}</span>;
}

// ── Edit user modal ───────────────────────────────────────
function EditUserModal({ user, onSave, onClose }) {
  const [name,      setName]      = useState(user.name);
  const [email,     setEmail]     = useState(user.email);
  const [phone,     setPhone]     = useState(user.phone);
  const [balance,   setBalance]   = useState(String(user.balance));
  const [earnings,  setEarnings]  = useState(String(user.earnings));
  const [withdrawn, setWithdrawn] = useState(String(user.withdrawn));
  const [tier,      setTier]      = useState(String(user.tier));

  const save = () => {
    onSave({
      ...user,
      name,
      email,
      phone,
      balance:   parseFloat(balance)   || 0,
      earnings:  parseFloat(earnings)  || 0,
      withdrawn: parseFloat(withdrawn) || 0,
      tier:      parseInt(tier)        || user.tier,
    });
    onClose();
  };

  const F = ({ label, value, onChange, type = "text" }) => (
    <div className="inp-group">
      <label className="inp-label">{label}</label>
      <input className="inp" type={type} value={value} onChange={(e) => onChange(e.target.value)}
        style={{ padding: "10px 14px", fontSize: 13 }} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--b2)", borderRadius: 18, padding: 24, width: "100%", maxWidth: 440, maxHeight: "90dvh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Edit User</div>
          <button onClick={onClose} style={{ color: "var(--c3)", fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>

        <F label="Full Name"        value={name}      onChange={setName} />
        <F label="Email"            value={email}     onChange={setEmail}     type="email" />
        <F label="Phone"            value={phone}     onChange={setPhone}     type="tel" />
        <F label="Balance ($)"      value={balance}   onChange={setBalance}   type="number" />
        <F label="Total Earned ($)" value={earnings}  onChange={setEarnings}  type="number" />
        <F label="Withdrawn ($)"    value={withdrawn} onChange={setWithdrawn} type="number" />
        <div className="inp-group">
          <label className="inp-label">Tier (1–10)</label>
          <select className="inp" value={tier} onChange={(e) => setTier(e.target.value)}
            style={{ padding: "10px 14px", fontSize: 13 }}>
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <option key={n} value={n}>Tier {n}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-gold"  style={{ flex: 2 }} onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  MAIN ADMIN PANEL
// ─────────────────────────────────────────────────────────
export default function AdminPanel({ onExit }) {
  const { addToast, addSignal, banners, addBanner, toggleBanner, deleteBanner, addNotif } = useStore();

  const [sec, setSec] = useState("dashboard");

  // Data state
  const [users,     setUsers]     = useState(MOCK_USERS_INIT);
  const [deposits,  setDeposits]  = useState(DEPOSIT_REQUESTS_INIT);
  const [withdraws, setWithdraws] = useState(WITHDRAWAL_REQUESTS_INIT);
  const [codes,     setCodes]     = useState(ADMIN_CODES_INIT);
  const [kycList,   setKycList]   = useState([
    { id:"k1", user:"Alice Chen",   email:"alice@gmail.com",  phone:"+1-555-0101", status:"pending",  submitted:"2025-01-14", fullName:"Alice Chen",   address:"123 Main St, NYC", cnicFront:"cnic_front_alice.jpg",  cnicBack:"cnic_back_alice.jpg" },
    { id:"k2", user:"Bob Williams", email:"bob@gmail.com",    phone:"+1-555-0102", status:"approved", submitted:"2025-01-10", fullName:"Bob Williams", address:"456 Oak Ave, LA",  cnicFront:"cnic_front_bob.jpg",    cnicBack:"cnic_back_bob.jpg" },
    { id:"k3", user:"Carlos Ruiz",  email:"carlos@gmail.com", phone:"+1-555-0103", status:"pending",  submitted:"2025-01-15", fullName:"Carlos Ruiz",  address:"789 Pine Rd, TX",  cnicFront:"cnic_front_carlos.jpg", cnicBack:"cnic_back_carlos.jpg" },
  ]);

  // Edit modal
  const [editingUser, setEditingUser] = useState(null);

  // Search
  const [userSearch, setUserSearch] = useState("");
  const [depSearch,  setDepSearch]  = useState("");
  const [wdSearch,   setWdSearch]   = useState("");
  const [kycSearch,  setKycSearch]  = useState("");

  // Code generator
  const [selPair, setSelPair] = useState(PAIRS[0]);
  const [genCode, setGenCode] = useState("");
  const [genLoad, setGenLoad] = useState(false);

  // Forms
  const [newBanner,  setNewBanner]  = useState({ title: "", text: "", color: "#f5a623" });
  const [notifForm,  setNotifForm]  = useState({ title: "", body: "" });

  // ── Filtered lists ────────────────────────────────────
  const q = (s) => s.toLowerCase();
  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const s = q(userSearch);
    return q(u.name).includes(s) || q(u.email).includes(s) || q(u.phone).includes(s);
  });
  const filteredDeps = deposits.filter((d) => {
    if (!depSearch) return true;
    const s = q(depSearch);
    return q(d.user).includes(s) || q(d.hash ?? "").includes(s) || q(d.network).includes(s);
  });
  const filteredWds = withdraws.filter((w) => {
    if (!wdSearch) return true;
    const s = q(wdSearch);
    return q(w.user).includes(s) || q(w.address ?? "").includes(s);
  });
  const filteredKyc = kycList.filter((k) => {
    if (!kycSearch) return true;
    const s = q(kycSearch);
    return q(k.user).includes(s) || q(k.email).includes(s) || q(k.phone).includes(s);
  });

  // ── Actions ───────────────────────────────────────────
  const deleteUser      = (id)  => { setUsers((p) => p.filter((u) => u.id !== id)); addToast("User deleted", "info"); };
  const saveUser        = (u)   => { setUsers((p) => p.map((x) => x.id === u.id ? u : x)); addToast("User updated", "ok"); };

  const approveDeposit  = (id)  => { setDeposits((p)  => p.map((d) => d.id===id ? {...d,status:"approved"} : d)); addToast("Deposit approved","ok"); };
  const rejectDeposit   = (id)  => { setDeposits((p)  => p.map((d) => d.id===id ? {...d,status:"rejected"} : d)); addToast("Deposit rejected","err"); };
  const approveWithdraw = (id)  => { setWithdraws((p) => p.map((w) => w.id===id ? {...w,status:"approved"} : w)); addToast("Withdrawal approved","ok"); };
  const rejectWithdraw  = (id)  => { setWithdraws((p) => p.map((w) => w.id===id ? {...w,status:"rejected"} : w)); addToast("Withdrawal rejected","err"); };
  const approveKyc      = (id)  => { setKycList((p)   => p.map((k) => k.id===id ? {...k,status:"approved"} : k)); addToast("KYC approved","ok"); };
  const rejectKyc       = (id)  => { setKycList((p)   => p.map((k) => k.id===id ? {...k,status:"rejected"} : k)); addToast("KYC rejected","err"); };

  const generateCode = () => {
    setGenLoad(true);
    setTimeout(() => {
      const code = genSignalCode(selPair);
      const coin = selPair.split("/")[0];
      const now  = new Date();
      const exp  = new Date(now.getTime() + 3_600_000);
      const fmt  = (d) => `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      setCodes((p) => [{ code, pair:selPair, created:fmt(now), expires:fmt(exp), used:0, status:"active" }, ...p]);
      addSignal(code, { coin, pair:selPair, created:Date.now(), ttl:3_600_000 });
      setGenCode(code);
      setGenLoad(false);
      addToast(`Code ${code} generated!`, "ok");
    }, 500);
  };

  const sendNotif = () => {
    if (!notifForm.title) { addToast("Title required","err"); return; }
    addNotif({ id:"n"+Date.now(), title:notifForm.title, body:notifForm.body, time:"just now", read:false });
    setNotifForm({ title:"", body:"" });
    addToast("Notification sent to all users","ok");
  };

  const STATS = [
    { icon:"👥", label:"Total Users",  value: users.length },
    { icon:"✅", label:"Active Today", value:"387" },
    { icon:"🔑", label:"Active Codes", value: codes.filter((c)=>c.status==="active").length },
    { icon:"⚡", label:"Today Trades", value:"94" },
    { icon:"💰", label:"Profit Paid",  value:"$188" },
    { icon:"⬇", label:"Pending Deps", value: deposits.filter((d)=>d.status==="pending").length },
  ];

  return (
    <>
      {/* Edit user modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={saveUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      <div style={{ width:"100%", maxWidth:"var(--max)", margin:"0 auto", height:"100dvh", display:"flex", flexDirection:"column", background:"var(--bg)", overflow:"hidden" }}>

        {/* Top bar */}
        <div style={{ height:52, flexShrink:0, background:"var(--bg2)", borderBottom:"1px solid var(--b1)", display:"flex", alignItems:"center", padding:"0 16px", gap:12 }}>
          <button onClick={onExit} style={{ display:"flex", alignItems:"center", gap:4, fontSize:13, color:"var(--c2)" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Exit
          </button>
          <span style={{ fontSize:16, fontWeight:800 }}>Admin Panel</span>
          <span className="badge badge-purple" style={{ marginLeft:"auto" }}>ADMIN</span>
          <button onClick={onExit} style={{ fontSize:11, color:"var(--red)", fontWeight:600 }}>Log Out</button>
        </div>

        {/* Tab bar */}
        <div style={{ flexShrink:0, background:"var(--bg2)", borderBottom:"1px solid var(--b1)", overflowX:"auto", display:"flex" }}>
          {MENU.map((m) => (
            <button key={m.id} onClick={() => setSec(m.id)} style={{ padding:"11px 13px", background:"none", border:"none", borderBottom: sec===m.id ? "2.5px solid var(--gold)" : "2.5px solid transparent", color: sec===m.id ? "var(--gold)" : "var(--c3)", fontFamily:"var(--fn)", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s" }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* ══ DASHBOARD ══ */}
          {sec==="dashboard" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
                {STATS.map((s) => (
                  <div key={s.label} className="admin-stat">
                    <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                    <div style={{ fontSize:20, fontWeight:900, fontFamily:"var(--fm)", color:"var(--gold)" }}>{s.value}</div>
                    <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", marginTop:3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>Recent Activity</div>
              <div className="card" style={{ padding:"0 16px" }}>
                {[["🔑","BTC9421 code generated","2m ago"],["💰","+$2 profit paid to Alice","5m ago"],["⬇","Deposit $200 approved","12m ago"],["👤","New user Carlos joined","1h ago"]].map(([ic,tx,t],i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 0", borderBottom:i<3?"1px solid var(--b1)":"none" }}>
                    <span style={{ fontSize:16 }}>{ic}</span>
                    <span style={{ flex:1, fontSize:13 }}>{tx}</span>
                    <span style={{ fontSize:11, color:"var(--c3)", fontFamily:"var(--fm)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {sec==="users" && (
            <div>
              <SearchBar value={userSearch} onChange={setUserSearch} placeholder="Search by name, email, phone..." />
              <div style={{ fontSize:12, color:"var(--c3)", marginBottom:10 }}>{filteredUsers.length} user{filteredUsers.length!==1?"s":""} found</div>

              {filteredUsers.map((u) => (
                <div key={u.id} className="card" style={{ padding:14, marginBottom:10 }}>
                  {/* Header row */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,var(--gold),#e0880a)", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize:13, flexShrink:0 }}>
                      {u.name.split(" ").map((w)=>w[0]).join("")}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{u.name}</div>
                      <div style={{ fontSize:11, color:"var(--c2)", fontFamily:"var(--fm)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</div>
                      <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)" }}>{u.phone} · Joined {u.joined}</div>
                    </div>
                    <span className="badge badge-gold" style={{ flexShrink:0 }}>T{u.tier}</span>
                  </div>

                  {/* Stats */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                    {[["Balance","$"+u.balance.toFixed(0),"var(--gold)"],["Earned","$"+u.earnings.toFixed(0),"var(--green)"],["Withdrawn","$"+u.withdrawn.toFixed(0),"var(--red)"]].map(([l,v,c]) => (
                      <div key={l} style={{ background:"var(--bg2)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", marginBottom:3 }}>{l}</div>
                        <div style={{ fontSize:13, fontWeight:700, fontFamily:"var(--fm)", color:c }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display:"flex", gap:8 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ flex:1 }}
                      onClick={() => setEditingUser(u)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-red btn-sm"
                      style={{ flex:1 }}
                      onClick={() => {
                        if (window.confirm(`Delete user ${u.name}?`)) deleteUser(u.id);
                      }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ SIGNAL CODES ══ */}
          {sec==="codes" && (
            <div>
              <div className="card" style={{ padding:18, marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>🔑 Generate Signal Code</div>
                <div style={{ marginBottom:14 }}>
                  <div className="inp-label">Trading Pair</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {PAIRS.map((p) => (
                      <button key={p} onClick={() => setSelPair(p)} style={{ padding:"7px 12px", borderRadius:8, border: selPair===p ? "1.5px solid var(--gold)" : "1px solid var(--b1)", background: selPair===p ? "rgba(245,166,35,0.1)" : "var(--bg2)", color: selPair===p ? "var(--gold)" : "var(--c2)", fontFamily:"var(--fm)", fontSize:12, fontWeight:700, cursor:"pointer" }}>{p}</button>
                    ))}
                  </div>
                </div>
                {genCode && (
                  <div style={{ background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:12, padding:"14px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", marginBottom:4 }}>GENERATED</div>
                      <div style={{ fontSize:24, fontWeight:900, fontFamily:"var(--fm)", color:"var(--gold)", letterSpacing:2 }}>{genCode}</div>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard?.writeText(genCode); addToast("Copied!","ok"); }}>📋 Copy</button>
                  </div>
                )}
                <button className="btn btn-purple btn-block" onClick={generateCode} disabled={genLoad}>
                  {genLoad ? <><span className="spin spin-w" /> Generating...</> : "⚡ Generate Code"}
                </button>
              </div>

              <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>Active Codes</div>
              {codes.map((item,i) => (
                <div key={i} style={{ background:"var(--card)", border:"1px solid var(--b1)", borderRadius:12, padding:"13px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{ fontFamily:"var(--fm)", fontSize:15, fontWeight:900, color:item.status==="active"?"var(--gold)":"var(--c3)", letterSpacing:1 }}>{item.code}</span>
                      <SBadge s={item.status} />
                    </div>
                    <div style={{ fontSize:11, color:"var(--c3)", fontFamily:"var(--fm)" }}>{item.pair} · Exp {item.expires}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"var(--fm)", fontSize:18, fontWeight:900, color:"var(--cyan)" }}>{item.used}</div>
                    <div style={{ fontSize:10, color:"var(--c3)" }}>users</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ DEPOSITS ══ */}
          {sec==="deposits" && (
            <div>
              <SearchBar value={depSearch} onChange={setDepSearch} placeholder="Search by user, hash, network..." />
              <div style={{ fontSize:12, color:"var(--c3)", marginBottom:10 }}>{filteredDeps.length} request{filteredDeps.length!==1?"s":""}</div>
              {filteredDeps.map((d) => (
                <div key={d.id} className="card" style={{ padding:14, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{d.user}</div>
                      <div style={{ fontSize:12, color:"var(--c2)", fontFamily:"var(--fm)", marginTop:2 }}>{d.tier} · {d.network}</div>
                    </div>
                    <SBadge s={d.status} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:d.status==="pending"?12:0 }}>
                    <div>
                      <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", marginBottom:3 }}>HASH</div>
                      <div style={{ fontSize:12, fontFamily:"var(--fm)", color:"var(--cyan)" }}>{d.hash}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", marginBottom:3 }}>AMOUNT</div>
                      <div style={{ fontSize:20, fontWeight:900, fontFamily:"var(--fm)", color:"var(--green)" }}>${d.amount}</div>
                    </div>
                  </div>
                  {d.status==="pending" && (
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn btn-green btn-sm" style={{ flex:1 }} onClick={() => approveDeposit(d.id)}>✓ Approve</button>
                      <button className="btn btn-red btn-sm"   style={{ flex:1 }} onClick={() => rejectDeposit(d.id)}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══ WITHDRAWALS ══ */}
          {sec==="withdrawals" && (
            <div>
              <SearchBar value={wdSearch} onChange={setWdSearch} placeholder="Search by user, address..." />
              <div style={{ fontSize:12, color:"var(--c3)", marginBottom:10 }}>{filteredWds.length} request{filteredWds.length!==1?"s":""}</div>
              {filteredWds.map((w) => (
                <div key={w.id} className="card" style={{ padding:14, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{w.user}</div>
                      <div style={{ fontSize:12, color:"var(--c2)", fontFamily:"var(--fm)", marginTop:2 }}>{w.network}</div>
                    </div>
                    <SBadge s={w.status} />
                  </div>
                  <div style={{ marginBottom:w.status==="pending"?12:0 }}>
                    <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", marginBottom:3 }}>ADDRESS</div>
                    <div style={{ fontSize:12, fontFamily:"var(--fm)", color:"var(--cyan)", marginBottom:6 }}>{w.address}</div>
                    <div style={{ fontSize:22, fontWeight:900, fontFamily:"var(--fm)", color:"var(--red)" }}>-${w.amount}</div>
                  </div>
                  {w.status==="pending" && (
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn btn-green btn-sm" style={{ flex:1 }} onClick={() => approveWithdraw(w.id)}>✓ Approve</button>
                      <button className="btn btn-red btn-sm"   style={{ flex:1 }} onClick={() => rejectWithdraw(w.id)}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══ KYC ══ */}
          {sec==="kyc" && (
            <div>
              <SearchBar value={kycSearch} onChange={setKycSearch} placeholder="Search by name, email, phone..." />
              <div style={{ fontSize:12, color:"var(--c3)", marginBottom:10 }}>{filteredKyc.length} submission{filteredKyc.length!==1?"s":""}</div>
              {filteredKyc.map((k) => (
                <div key={k.id} className="card" style={{ padding:14, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{k.user}</div>
                      <div style={{ fontSize:11, color:"var(--c2)", fontFamily:"var(--fm)", marginTop:2 }}>{k.email} · {k.phone}</div>
                      <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", marginTop:2 }}>Submitted: {k.submitted}</div>
                    </div>
                    <SBadge s={k.status} />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                    {[["Full Name",k.fullName],["Address",k.address]].map(([l,v]) => (
                      <div key={l} style={{ background:"var(--bg2)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:12, fontWeight:600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:k.status==="pending"?12:0 }}>
                    {[["CNIC Front",k.cnicFront],["CNIC Back",k.cnicBack]].map(([l,v]) => (
                      <div key={l} style={{ background:"var(--bg2)", border:"1px solid var(--b2)", borderRadius:10, overflow:"hidden" }}>
                        <div style={{ height:80, background:"linear-gradient(135deg,var(--bg3),var(--card))", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                          <span style={{ fontSize:24 }}>🪪</span>
                          <span style={{ fontSize:9, color:"var(--c3)", fontFamily:"var(--fm)", textAlign:"center", padding:"0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100%" }}>{v}</span>
                        </div>
                        <div style={{ padding:"6px 8px", fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)", fontWeight:700 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {k.status==="pending" && (
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn btn-green btn-sm" style={{ flex:1 }} onClick={() => approveKyc(k.id)}>✓ Approve KYC</button>
                      <button className="btn btn-red btn-sm"   style={{ flex:1 }} onClick={() => rejectKyc(k.id)}>✕ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══ BANNERS ══ */}
          {sec==="banners" && (
            <div>
              <div className="card" style={{ padding:16, marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:15, marginBottom:12 }}>Add New Banner</div>
                <div className="inp-group"><label className="inp-label">Title</label><input className="inp" placeholder="e.g. 🎉 Welcome Bonus" value={newBanner.title} onChange={(e) => setNewBanner((p) => ({...p,title:e.target.value}))} /></div>
                <div className="inp-group"><label className="inp-label">Message</label><input className="inp" placeholder="Banner description..." value={newBanner.text} onChange={(e) => setNewBanner((p) => ({...p,text:e.target.value}))} /></div>
                <div className="inp-group">
                  <label className="inp-label">Color</label>
                  <div style={{ display:"flex", gap:8 }}>
                    {BANNER_COLORS.map((c) => <button key={c} onClick={() => setNewBanner((p) => ({...p,color:c}))} style={{ width:28, height:28, borderRadius:"50%", background:c, border:newBanner.color===c?"3px solid #fff":"2px solid transparent", cursor:"pointer", flexShrink:0 }} />)}
                  </div>
                </div>
                <button className="btn btn-gold btn-sm" onClick={() => {
                  if (!newBanner.title) return;
                  addBanner({ id:"b"+Date.now(), ...newBanner, active:true });
                  setNewBanner({ title:"", text:"", color:"#f5a623" });
                  addToast("Banner added","ok");
                }}>Add Banner</button>
              </div>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>Active Banners</div>
              {banners.map((b) => (
                <div key={b.id} style={{ background:`linear-gradient(135deg,${b.color}18,${b.color}08)`, border:`1px solid ${b.color}30`, borderRadius:12, padding:14, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{b.title}</div>
                    <div style={{ fontSize:11, color:"var(--c2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.text}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleBanner(b.id)}>{b.active?"Hide":"Show"}</button>
                    <button className="btn btn-red btn-sm" onClick={() => { deleteBanner(b.id); addToast("Removed","info"); }}>Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ NOTIFICATIONS ══ */}
          {sec==="notifications" && (
            <div>
              <div className="card" style={{ padding:16, marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:15, marginBottom:12 }}>Send Notification</div>
                <div className="inp-group"><label className="inp-label">Title</label><input className="inp" placeholder="Notification title" value={notifForm.title} onChange={(e) => setNotifForm((p) => ({...p,title:e.target.value}))} /></div>
                <div className="inp-group"><label className="inp-label">Message</label><textarea className="inp" rows={3} placeholder="Message body..." value={notifForm.body} onChange={(e) => setNotifForm((p) => ({...p,body:e.target.value}))} style={{ resize:"none" }} /></div>
                <button className="btn btn-gold btn-sm" onClick={sendNotif}>Send to All Users</button>
              </div>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>Recent Sent</div>
              <div className="card" style={{ padding:"0 16px" }}>
                {[
                  { title:"Trade Completed!",  body:"BTC/USDT trade — +$2",            time:"2m ago" },
                  { title:"New Signal Code",   body:"BTC9421 available — check group", time:"15m ago" },
                  { title:"System Update",     body:"Maintenance Sunday 2AM UTC",      time:"2h ago" },
                ].map((n,i,arr) => (
                  <div key={i} style={{ padding:"12px 0", borderBottom:i<arr.length-1?"1px solid var(--b1)":"none" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{n.title}</div>
                      <div style={{ fontSize:10, color:"var(--c3)", fontFamily:"var(--fm)" }}>{n.time}</div>
                    </div>
                    <div style={{ fontSize:12, color:"var(--c2)" }}>{n.body}</div>
                  </div>
                ))}
              </div>
              <div style={{ height:16 }} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}