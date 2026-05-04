import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { TIERS, getRefLevel, REF_LEVELS } from "@/lib/data";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function BackHdr({ onBack, title, right }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <button onClick={onBack} style={{ color:"var(--t2)", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Back
      </button>
      <span style={{ fontWeight:800, fontSize:17, letterSpacing:"-.3px" }}>{title}</span>
      {right && <div style={{ marginLeft:"auto" }}>{right}</div>}
    </div>
  );
}

// ── MUST be outside ALL other components ──────────────────
function KycField({ id, label, value, onChange, onClear, placeholder, type="text", err }) {
  return (
    <div className="fg">
      <label className="lbl">{label} <span style={{ color:"var(--dn)" }}>*</span></label>
      <input
        className="inp"
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onChange={e => { onChange(e.target.value); onClear(id); }}
        style={{ borderColor: err ? "var(--dn)" : "" }}
      />
      {err && <div style={{ fontSize:11, color:"var(--dn)", marginTop:5 }}>{err}</div>}
    </div>
  );
}

function KycFilePick({ id, label, value, onChange, onClear, err }) {
  const inputRef = useRef(null);
  return (
    <div className="fg">
      <label className="lbl">{label} <span style={{ color:"var(--dn)" }}>*</span></label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          background:"var(--ink2)",
          border:`1.5px dashed ${err ? "var(--dn)" : value ? "var(--up)" : "var(--ln2)"}`,
          borderRadius:"var(--r2)", padding:"18px 16px", cursor:"pointer",
          color: value ? "var(--up)" : "var(--t3)", fontSize:13, fontWeight:600,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display:"none" }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) { onChange(file); onClear(id); }
          }}
        />
        {value
          ? <><span style={{ fontSize:18 }}>✓</span><span>{value.name || "File selected"}</span></>
          : <><span style={{ fontSize:20 }}>📷</span><span>Tap to upload</span></>
        }
      </div>
      {err && <div style={{ fontSize:11, color:"var(--dn)", marginTop:5 }}>{err}</div>}
    </div>
  );
}

function KYCScreen({ user, setUser, addToast, onBack }) {
  const [fullName, setFullName] = useState(user.name || "");
  const [address,  setAddress]  = useState("");
  const [phone,    setPhone]    = useState(user.phone || "");
  const [cnicF,    setCnicF]    = useState(null);
  const [cnicB,    setCnicB]    = useState(null);
  const [errs,     setErrs]     = useState({});
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");

  const ce = k => setErrs(p => { const n = {...p}; delete n[k]; return n; });

  const submit = async () => {
    setError("");
    const e = {};
    if (!fullName.trim()) e.n = "Full name required";
    if (!address.trim())  e.a = "Address required";
    if (!cnicF)           e.f = "CNIC front required";
    if (!cnicB)           e.b = "CNIC back required";
    if (Object.keys(e).length) { setErrs(e); return; }

    setBusy(true);
    try {
      let token = useStore.getState()._token;
      if (!token) {
        const rr = await fetch(`${API}/auth/refresh`, { method:"POST", credentials:"include" });
        if (rr.ok) {
          const rd = await rr.json();
          token = rd.data?.accessToken || rd.accessToken;
          useStore.getState().setToken(token);
        }
      }
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("homeAddress", address.trim());
      if (phone.trim()) formData.append("phone", phone.trim());
      formData.append("cnicFront", cnicF, cnicF.name || "cnic_front.jpg");
      formData.append("cnicBack",  cnicB, cnicB.name || "cnic_back.jpg");

      const res  = await fetch(`${API}/kyc/submit`, {
        method: "POST",
        headers: token ? { Authorization:`Bearer ${token}` } : {},
        credentials: "include",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) { setError(data.message || "Failed to submit KYC. Please try again."); return; }

      setUser({ ...user, kycStatus:"pending" });
      addToast("KYC submitted — admin reviews within 24h", "ok");
      onBack();
    } catch (err) {
      setError("Network error — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (user.kycStatus === "pending" || user.kycStatus === "approved") {
    const ok = user.kycStatus === "approved";
    return (
      <div>
        <BackHdr onBack={onBack} title="KYC Verification"/>
        <div style={{ textAlign:"center", padding:"32px 20px", background:ok?"rgba(0,200,150,.06)":"rgba(240,165,0,.06)", border:`1px solid ${ok?"rgba(0,200,150,.2)":"rgba(240,165,0,.2)"}`, borderRadius:20 }}>
          <div style={{ fontSize:52, marginBottom:14 }}>{ok ? "✅" : "⏳"}</div>
          <div style={{ fontSize:18, fontWeight:800, marginBottom:8 }}>{ok ? "KYC Verified!" : "Under Review"}</div>
          <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>{ok ? "Your identity is verified. Withdrawals are enabled." : "Documents submitted. Admin will verify within 24 hours."}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackHdr onBack={onBack} title="KYC Verification"/>
      <div style={{ background:"rgba(255,59,92,.06)", border:"1px solid rgba(255,59,92,.15)", borderRadius:12, padding:"12px 14px", marginBottom:18, fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>
        🔒 Required for deposits & withdrawals. Documents kept strictly confidential.
      </div>
      {error && (
        <div style={{ background:"rgba(255,59,92,.1)", border:"1px solid rgba(255,59,92,.3)", borderRadius:10, padding:"12px 14px", marginBottom:16, color:"var(--dn)", fontSize:13 }}>
          ⚠️ {error}
        </div>
      )}
      <KycField id="n" label="Full Name"    value={fullName} onChange={setFullName} onClear={ce} placeholder="As on CNIC"            err={errs.n}/>
      <KycField id="a" label="Home Address" value={address}  onChange={setAddress}  onClear={ce} placeholder="Street, City, Country" err={errs.a}/>
      <KycField id="p" label="Phone Number" value={phone}    onChange={setPhone}    onClear={ce} placeholder="+92-300-0000000" type="tel" err={errs.p}/>
      <KycFilePick id="f" label="CNIC Front Photo" value={cnicF} onChange={setCnicF} onClear={ce} err={errs.f}/>
      <KycFilePick id="b" label="CNIC Back Photo"  value={cnicB} onChange={setCnicB} onClear={ce} err={errs.b}/>
      <button className="btn btn-gold btn-block" onClick={submit} disabled={busy}>
        {busy ? "Uploading..." : "Submit KYC Documents"}
      </button>
    </div>
  );
}

function PushScreen({ onBack }) {
  const [s, setS] = useState({ signals:true, trades:true, deposits:true, withdrawals:true, system:false });
  return (
    <div>
      <BackHdr onBack={onBack} title="Push Notifications"/>
      <div className="card" style={{ padding:"0 16px" }}>
        {[["signals","Signal Codes","New trade signal from admin"],["trades","Trade Completed","When your trade finishes"],["deposits","Deposit Updates","Approval / rejection"],["withdrawals","Withdrawal Updates","When payment is sent"],["system","System Alerts","Maintenance & updates"]].map(([id,label,sub],i,arr) => (
          <div key={id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:i<arr.length-1?"1px solid var(--ln)":"none" }}>
            <div><div style={{ fontWeight:700, fontSize:14 }}>{label}</div><div style={{ fontSize:11, color:"var(--t3)", marginTop:2 }}>{sub}</div></div>
            <div onClick={() => setS(p=>({...p,[id]:!p[id]}))} style={{ width:46, height:26, borderRadius:13, cursor:"pointer", background:s[id]?"var(--gold)":"var(--ln2)", position:"relative", transition:"background .2s", flexShrink:0 }}>
              <div style={{ position:"absolute", top:3, left:s[id]?23:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.3)" }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TwoFAScreen({ onBack }) {
  const [step, setStep] = useState(1), [otp, setOtp] = useState(""), [done, setDone] = useState(false), [err, setErr] = useState("");
  const verify = () => { if(otp!=="123456"){setErr("Invalid. Demo code: 123456");return;} setDone(true); setStep(3); };
  return (
    <div>
      <BackHdr onBack={onBack} title="Two-Factor Auth" right={<span className={`badge ${done?"b-up":"b-dim"}`}>{done?"ENABLED":"DISABLED"}</span>}/>
      {step===1&&<div className="card" style={{padding:20,textAlign:"center"}}><div style={{fontSize:48,marginBottom:14}}>🔐</div><div style={{fontWeight:800,fontSize:16,marginBottom:8}}>Enable 2FA</div><div style={{fontSize:13,color:"var(--t2)",lineHeight:1.7,marginBottom:18}}>Secure your account with Google Authenticator.</div><button className="btn btn-gold btn-block" onClick={()=>setStep(2)}>Set Up 2FA</button></div>}
      {step===2&&<div><div className="card" style={{padding:18,marginBottom:14,textAlign:"center"}}><div style={{width:140,height:140,background:"var(--ink2)",border:"1px solid var(--ln2)",borderRadius:12,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"var(--t3)"}}>📱 QR Code</div><div style={{fontSize:12,color:"var(--t2)"}}>Key: <code style={{fontFamily:"var(--m)",color:"var(--gold)",letterSpacing:2}}>JBSWY3DPEHPK3PXP</code></div></div><div className="fg"><label className="lbl">Enter 6-Digit Code</label><input className="inp" placeholder="000000" maxLength={6} value={otp} onChange={e=>{setOtp(e.target.value);setErr("");}} style={{textAlign:"center",fontSize:24,letterSpacing:8,fontFamily:"var(--m)",borderColor:err?"var(--dn)":""}}/>{err&&<div style={{fontSize:11,color:"var(--dn)",marginTop:5,textAlign:"center"}}>{err}</div>}<div style={{fontSize:11,color:"var(--t3)",marginTop:5,textAlign:"center"}}>Demo: 123456</div></div><button className="btn btn-gold btn-block" onClick={verify} disabled={otp.length<6}>Verify & Enable</button></div>}
      {step===3&&<div className="card" style={{padding:24,textAlign:"center"}}><div style={{fontSize:48,marginBottom:14}}>✅</div><div style={{fontWeight:800,fontSize:16,marginBottom:8}}>2FA Enabled!</div><div style={{fontSize:13,color:"var(--t2)"}}>Your account is now secured.</div></div>}
    </div>
  );
}

function SupportScreen({ onBack }) {
  const TELEGRAM_LINK = "https://t.me/OctaTrade_Support";
  return (
    <div>
      <BackHdr onBack={onBack} title="Customer Service"/>
      <div style={{ padding:"24px 16px" }}>
        <div style={{ background:"linear-gradient(135deg,rgba(0,136,204,.12),rgba(0,136,204,.04))", border:"1px solid rgba(0,136,204,.25)", borderRadius:20, padding:24, marginBottom:16, textAlign:"center" }}>
          <div style={{ width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#0088cc,#0055aa)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:"0 8px 24px rgba(0,136,204,.3)" }}>
            <svg width={38} height={38} viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 14.25l-2.95-.924c-.64-.204-.654-.64.136-.954l11.5-4.433c.535-.194 1.003.131.716.309z"/>
            </svg>
          </div>
          <div style={{ fontWeight:900, fontSize:20, marginBottom:8 }}>Contact Support</div>
          <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7, marginBottom:20 }}>Our support team is available 24/7 on Telegram.<br/>Click below to start a conversation.</div>
          <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer"
            style={{ display:"block", padding:"15px 0", borderRadius:14, background:"linear-gradient(135deg,#0088cc,#0055aa)", color:"#fff", fontWeight:800, fontSize:16, textDecoration:"none", textAlign:"center", boxShadow:"0 6px 20px rgba(0,136,204,.35)" }}>
            Open Telegram →
          </a>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[{icon:"⏰",label:"Response Time",value:"< 5 minutes"},{icon:"🌍",label:"Availability",value:"24 / 7"},{icon:"🌐",label:"Languages",value:"EN / UR"},{icon:"🔒",label:"Secure Chat",value:"Encrypted"}].map(card => (
            <div key={card.label} style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:"14px 12px", textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{card.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:2 }}>{card.value}</div>
              <div style={{ fontSize:10, color:"var(--t3)" }}>{card.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(240,165,0,.06)", border:"1px solid rgba(240,165,0,.15)", borderRadius:14, padding:"14px 16px" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>💡 Before contacting us</div>
          <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.8 }}>
            • Check your KYC status in Identity Verification<br/>
            • Deposit issues: provide your TxID / hash<br/>
            • Withdrawal issues: verify your wallet address<br/>
            • Include your UID when messaging support
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpScreen({ onBack }) {
  const [open, setOpen] = useState(null);
  const Q = [
    ["How do I start trading?","Go to Trade → enter a signal code from the WhatsApp group → Submit. Trade runs 5 minutes and profit is credited to your Trading Account automatically."],
    ["How do signal codes work?","Codes are generated by admin and shared via WhatsApp/Telegram. Each code is valid for 1 hour and can only be used once."],
    ["How do I deposit?","Assets → Deposit → pick tier → pick network → send USDT → paste transaction hash. Admin reviews and credits your Funding Account."],
    ["How long do deposits take?","1–2 hours after admin verifies your transaction hash."],
    ["What is the 20-day freeze?","When you transfer from Funding to Trading Account, the funds are locked for 20 days. You can still trade, but cannot transfer out during this period."],
    ["What are the fees?","Funding withdrawal: 5%. Trading→Funding transfer: 25%. Network fees vary."],
    ["What is KYC?","Required for deposits and withdrawals. Submit full name, address, phone, and CNIC photos. Admin reviews within 24 hours."],
    ["What is the referral program?","Share your code. When someone signs up and deposits, you earn a $5 bonus credited to your Funding Account."],
    ["How do Futures work?","Select a pair, set leverage (1x–100x), enter margin, set TP/SL, and place LONG or SHORT. Positions auto-close at TP/SL/Liquidation price."],
  ];
  return (
    <div>
      <BackHdr onBack={onBack} title="Help Center"/>
      {Q.map(([q,a],i) => (
        <div key={i} style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, marginBottom:8, overflow:"hidden" }}>
          <button onClick={() => setOpen(open===i?null:i)} style={{ width:"100%", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"var(--f)", fontSize:13, fontWeight:700, color:open===i?"var(--gold)":"var(--t1)", textAlign:"left", gap:8 }}>
            <span>{q}</span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform:open===i?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {open===i && <div style={{ padding:"2px 16px 14px", fontSize:13, color:"var(--t2)", lineHeight:1.7, borderTop:"1px solid var(--ln)" }}>{a}</div>}
        </div>
      ))}
      <div style={{ height:8 }}/>
    </div>
  );
}

function TeamScreen({ user, onBack }) {
  const { fetchTeam } = useStore();
  useEffect(() => { fetchTeam(); }, []);
  const refs = (user.referrals ?? []).filter(r => r && r.name);
  return (
    <div>
      <BackHdr onBack={onBack} title="My Team"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
        {[{label:"Members",value:refs.length,c:"var(--blue)"},{label:"Ref Earned",value:"$"+(refs.filter(r=>r.deposited).length*5),c:"var(--up)"},{label:"Active",value:refs.filter(r=>r.status==="active").length,c:"var(--gold)"}].map(s=>(
          <div key={s.label} className="card2" style={{ padding:"14px 10px", textAlign:"center" }}>
            <div style={{ fontFamily:"var(--m)", fontSize:22, fontWeight:900, color:s.c }}>{s.value}</div>
            <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginTop:4, letterSpacing:".5px" }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"linear-gradient(135deg,rgba(240,165,0,.08),rgba(240,165,0,.03))", border:"1px solid rgba(240,165,0,.2)", borderRadius:14, padding:"14px 16px", marginBottom:18 }}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>Your Referral Code</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ flex:1, background:"var(--ink2)", border:"1px solid var(--ln2)", borderRadius:10, padding:"10px 14px", fontFamily:"var(--m)", fontSize:14, fontWeight:700, color:"var(--gold)", letterSpacing:2 }}>
            {user.referralCode ?? "NXT00000"}
          </div>
          <button className="btn btn-gold btn-sm" onClick={() => { navigator.clipboard?.writeText(user.referralCode??"NXT00000"); useStore.getState().addToast("Copied!","ok"); }}>Share</button>
        </div>
        <div style={{ fontSize:12, color:"var(--t2)", marginTop:8 }}>Earn <strong style={{ color:"var(--up)" }}>$5 bonus</strong> for every friend who deposits</div>
      </div>
      <div style={{ fontWeight:800, fontSize:15, marginBottom:12 }}>Team Members</div>
      <div className="card" style={{ padding:"0 16px" }}>
        {refs.length===0
          ? <div className="empty"><div className="ei">👥</div><p>No referrals yet. Share your code!</p></div>
          : refs.map((r,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:i<refs.length-1?"1px solid var(--ln)":"none" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,var(--gold),#c07800)", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize:13, flexShrink:0 }}>
                {(r.name||"?").split(" ").map(w=>w[0]).join("")}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{r.name}</div>
                <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:1 }}>{r.email} · {r.joined}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <span className={`badge ${r.status==="active"?"b-up":"b-au"}`} style={{ fontSize:10, marginBottom:4, display:"block" }}>{r.status}</span>
                <div style={{ fontSize:11, color:"var(--up)", fontFamily:"var(--m)", fontWeight:700 }}>{r.deposited ? "+$5" : "$0"}</div>
              </div>
            </div>
          ))
        }
      </div>
      <div style={{ height:8 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  MAIN ProfilePage
// ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, setUser, logout, notifs, markRead, markAllRead, addToast, setShowAdmin, profileTab, setProfileTab, profileScreen, setProfileScreen } = useStore();
  const [tab,    setTabL]   = useState(profileTab || "account");
  const [screen, setScreen] = useState(null);
  const unread   = notifs.filter(n=>!n.read).length;
  const refCount = user.referralCount ?? (user.referrals?.length ?? 0);
  const lvInfo   = getRefLevel(refCount);
  const kycOk    = user.kycStatus === "approved";
  const kycPend  = user.kycStatus === "pending";
  const setTab   = t => { setTabL(t); setProfileTab(t); };

  useEffect(() => {
    if (profileScreen) { setScreen(profileScreen); setProfileScreen(null); }
  }, [profileScreen]);

  // ── Render screen — using if/else NOT dynamic component lookup ──
  // This is the KEY fix: never use { kyc: KYCScreen }[screen] pattern
  // because it creates a new component reference every render
  if (screen === "kyc") {
    return (
      <div>
        <div className="hdr"><span style={{ fontSize:18, fontWeight:800 }}>&nbsp;</span></div>
        <div style={{ padding:16 }}>
          <KYCScreen user={user} setUser={setUser} addToast={addToast} onBack={() => setScreen(null)}/>
        </div>
      </div>
    );
  }
  if (screen === "push") {
    return (
      <div>
        <div className="hdr"><span style={{ fontSize:18, fontWeight:800 }}>&nbsp;</span></div>
        <div style={{ padding:16 }}>
          <PushScreen onBack={() => setScreen(null)}/>
        </div>
      </div>
    );
  }
  if (screen === "2fa") {
    return (
      <div>
        <div className="hdr"><span style={{ fontSize:18, fontWeight:800 }}>&nbsp;</span></div>
        <div style={{ padding:16 }}>
          <TwoFAScreen onBack={() => setScreen(null)}/>
        </div>
      </div>
    );
  }
  if (screen === "support") {
    return (
      <div>
        <div className="hdr"><span style={{ fontSize:18, fontWeight:800 }}>&nbsp;</span></div>
        <div style={{ padding:16 }}>
          <SupportScreen onBack={() => setScreen(null)}/>
        </div>
      </div>
    );
  }
  if (screen === "help") {
    return (
      <div>
        <div className="hdr"><span style={{ fontSize:18, fontWeight:800 }}>&nbsp;</span></div>
        <div style={{ padding:16 }}>
          <HelpScreen onBack={() => setScreen(null)}/>
        </div>
      </div>
    );
  }
  if (screen === "team") {
    return (
      <div>
        <div className="hdr"><span style={{ fontSize:18, fontWeight:800 }}>&nbsp;</span></div>
        <div style={{ padding:16 }}>
          <TeamScreen user={user} onBack={() => setScreen(null)}/>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hdr">
        <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-.4px" }}>Profile</span>
        {unread>0 && <span className="badge b-dn" style={{ marginLeft:"auto" }}>{unread} new</span>}
      </div>

      <div style={{ padding:"18px 16px", borderBottom:"1px solid var(--ln)", display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ width:58, height:58, borderRadius:17, background:"linear-gradient(135deg,var(--gold),#c07800)", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize:20, boxShadow:"0 6px 20px rgba(240,165,0,.25)", border:lvInfo.level>0?`2.5px solid ${lvInfo.color}`:"none" }}>
            {user.avatar}
          </div>
          <div style={{ position:"absolute", bottom:-8, left:"50%", transform:"translateX(-50%)", background:lvInfo.level>0?lvInfo.color:"var(--ln2)", color:lvInfo.level>0?"#000":"var(--t3)", fontSize:8, fontWeight:900, fontFamily:"var(--m)", padding:"2px 7px", borderRadius:6, whiteSpace:"nowrap", boxShadow:"0 2px 6px rgba(0,0,0,.4)" }}>
            {lvInfo.label}
          </div>
        </div>
        <div style={{ flex:1, minWidth:0, paddingLeft:4 }}>
          <div style={{ fontSize:17, fontWeight:800, letterSpacing:"-.3px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
          <div style={{ fontSize:11, color:"var(--t3)", marginTop:2, fontFamily:"var(--m)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            @{user.username||user.email.split("@")[0]}{user.uid&&<span style={{ color:"var(--gold)", marginLeft:6 }}>· {user.uid}</span>}
          </div>
          <div style={{ display:"flex", gap:5, marginTop:7, flexWrap:"wrap" }}>
            {user.tier&&<span className="badge b-au">{user.tier.name}</span>}
            {kycOk  &&<span className="badge b-up"  style={{ fontSize:10 }}>✅ Verified</span>}
            {kycPend&&<span className="badge b-au" style={{ fontSize:10 }}>⏳ KYC Pending</span>}
            {!kycOk&&!kycPend&&<span className="badge b-dn" style={{ fontSize:10 }}>Unverified</span>}
            <span style={{ display:"inline-flex", alignItems:"center", gap:3, background:lvInfo.level>0?lvInfo.color+"18":"rgba(255,255,255,.04)", border:`1px solid ${lvInfo.level>0?lvInfo.color+"40":"var(--ln)"}`, borderRadius:20, padding:"3px 9px", fontSize:10, fontWeight:900, fontFamily:"var(--m)", color:lvInfo.level>0?lvInfo.color:"var(--t3)" }}>
              ★ {lvInfo.label}
            </span>
          </div>
        </div>
        <button onClick={logout} style={{ color:"var(--t3)", fontSize:12, fontWeight:600, flexShrink:0 }}>Sign Out</button>
      </div>

      <div style={{ padding:"0 16px" }}>
        <div className="seg" style={{ margin:"14px 0" }}>
          {[{id:"account",label:"Account"},{id:"tiers",label:"Tiers"},{id:"notifs",label:unread>0?`Notifs (${unread})`:"Notifs"}].map(t=>(
            <button key={t.id} className={`seg-btn${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {tab==="account" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[{l:"FUNDING",v:"$"+(user.fundingBalance??0).toFixed(2),c:"var(--blue)"},{l:"TRADING",v:"$"+(user.tradingBalance??0).toFixed(2),c:"var(--up)"},{l:"TOTAL PROFIT",v:"+$"+(user.totalProfit??0).toFixed(2),c:"var(--up)"},{l:"TRADES",v:String(user.totalTrades??0),c:"var(--t1)"}].map(item=>(
                <div key={item.l} className="astat">
                  <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:6, letterSpacing:".8px" }}>{item.l}</div>
                  <div style={{ fontSize:20, fontWeight:900, fontFamily:"var(--m)", color:item.c }}>{item.v}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding:"0 16px", marginBottom:14 }}>
              {[
                {icon:"👥",label:"My Team",          sub:"Referrals & members",                                                                                id:"team"},
                {icon:"🔔",label:"Push Notifications",sub:"Manage signal alerts",                                                                              id:"push"},
                {icon:"🔒",label:"Two-Factor Auth",   sub:"Secure your account",                                                                               id:"2fa"},
                {icon:"📋",label:"KYC Verification",  sub:user.kycStatus==="approved"?"Verified ✓":user.kycStatus==="pending"?"Under review...":"Submit docs",  id:"kyc"},
                {icon:"💬",label:"Live Support",       sub:"Chat with our team",                                                                                id:"support"},
                {icon:"❓",label:"Help Center",        sub:"FAQs & guides",                                                                                     id:"help"},
              ].map(({icon,label,sub,id},i,arr)=>(
                <div key={id} onClick={()=>setScreen(id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 0", borderBottom:i<arr.length-1?"1px solid var(--ln)":"none", cursor:"pointer" }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:"var(--ink2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{label}</div>
                    <div style={{ fontSize:11, color:"var(--t3)", marginTop:1 }}>{sub}</div>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5" style={{ flexShrink:0 }}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-block" onClick={logout} style={{ color:"var(--dn)", border:"1px solid rgba(255,59,92,.2)", marginBottom:16 }}>Sign Out</button>
          </div>
        )}

        {tab==="tiers" && (
          <div>
            <div style={{ background:lvInfo.level>0?lvInfo.color+"12":"rgba(255,255,255,.03)", border:`1px solid ${lvInfo.level>0?lvInfo.color+"30":"var(--ln)"}`, borderRadius:14, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44,height:44,borderRadius:13,background:lvInfo.level>0?lvInfo.color+"25":"var(--ln2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--m)",fontSize:11,fontWeight:900,color:lvInfo.level>0?lvInfo.color:"var(--t3)",flexShrink:0 }}>{lvInfo.label}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:lvInfo.level>0?lvInfo.color:"var(--t2)" }}>{lvInfo.level===0?"No Referral Level Yet":lvInfo.label+" Achieved"}</div>
                <div style={{ fontSize:11, color:"var(--t3)", marginTop:2 }}>{refCount} referral{refCount!==1?"s":""} · Refer friends to level up</div>
              </div>
            </div>
            <div style={{ background:"rgba(240,165,0,.06)", border:"1px solid rgba(240,165,0,.15)", borderRadius:12, padding:"12px 14px", marginBottom:14, fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>
              💡 Tier Price × 1% = profit per copy trade signal. Deposit to subscribe.
            </div>
            {TIERS.map(tier => {
              const active = user.tier?.id === tier.id;
              return (
                <div key={tier.id} style={{ background:active?`linear-gradient(135deg,${tier.color}14,${tier.color}06)`:"var(--ink3)", border:`1.5px solid ${active?tier.color:"var(--ln)"}`, borderRadius:14, padding:"14px 16px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14, color:tier.color, fontFamily:"var(--m)" }}>{tier.name}</div>
                    <div style={{ fontSize:12, color:"var(--t2)", marginTop:2 }}>${tier.price} USDT</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:18, fontWeight:900, color:"var(--up)", fontFamily:"var(--m)" }}>${tier.profit}</div>
                      <div style={{ fontSize:10, color:"var(--t3)" }}>per signal</div>
                    </div>
                    {active && <span className="badge b-au" style={{ fontSize:10 }}>ACTIVE</span>}
                  </div>
                </div>
              );
            })}
            <div style={{ height:8 }}/>
          </div>
        )}

        {tab==="notifs" && (
          <div>
            {unread>0 && <button className="btn btn-ghost btn-sm" style={{ marginBottom:12 }} onClick={markAllRead}>Mark all as read</button>}
            {notifs.length===0
              ? <div className="empty"><div className="ei">🔔</div><p>No notifications</p></div>
              : notifs.map(n=>(
                <div key={n.id} onClick={()=>markRead(n.id)} style={{ background:n.read?"var(--ink3)":"rgba(240,165,0,.05)", border:`1px solid ${n.read?"var(--ln)":"rgba(240,165,0,.2)"}`, borderRadius:14, padding:14, marginBottom:8, cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <div style={{ fontWeight:700, fontSize:13, flex:1 }}>{n.title}</div>
                    <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", flexShrink:0, marginLeft:8 }}>{n.time}</div>
                  </div>
                  <div style={{ fontSize:12, color:"var(--t2)" }}>{n.body}</div>
                  {!n.read && <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold)", marginTop:8 }}/>}
                </div>
              ))
            }
            <div style={{ height:8 }}/>
          </div>
        )}
      </div>
    </div>
  );
}