import { useState } from "react";
import { useStore } from "@/lib/store";
import { TIERS, getRefLevel } from "@/lib/data";
import CoinIcon from "@/components/ui/CoinIcon";
import { fmtP } from "@/lib/data";

// ── YOUR TELEGRAM LINK — change this to your actual Telegram username ──
const TELEGRAM_LINK = "https://t.me/YourTelegramUsername";

function BackHdr({ onBack, title }) {
  return (
    <div className="hdr">
      <button onClick={onBack} style={{ color:"var(--t2)", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Back
      </button>
      <span style={{ fontWeight:800, fontSize:17 }}>{title}</span>
    </div>
  );
}

function Eye({ show, toggle }) {
  return (
    <button type="button" onClick={toggle} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--t3)", cursor:"pointer", padding:0, display:"flex" }}>
      {show
        ? <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );
}

// ── Identity Verification ──────────────────────────────
function KYCScreen({ user, setUser, addToast, onBack }) {
  const [docType, setDocType] = useState("Passport");
  const [name,    setName]    = useState(user.name||"");
  const [phone,   setPhone]   = useState(user.phone||"");
  const [idNum,   setIdNum]   = useState("");
  const [front,   setFront]   = useState("");
  const [back,    setBack]    = useState("");
  const [selfie,  setSelfie]  = useState("");
  const [errs,    setErrs]    = useState({});

  if (user.kycStatus==="pending"||user.kycStatus==="approved") {
    const ok = user.kycStatus==="approved";
    return (
      <div>
        <BackHdr onBack={onBack} title="Identity Verification"/>
        <div style={{ padding:"40px 20px", textAlign:"center" }}>
          <div style={{ fontSize:60, marginBottom:16 }}>{ok?"✅":"⏳"}</div>
          <div style={{ fontSize:20, fontWeight:800, marginBottom:10 }}>{ok?"KYC Verified!":"Under Review"}</div>
          <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.8 }}>
            {ok ? "Your identity is verified. Withdrawals are enabled." : "Documents submitted. Admin will verify within 24 hours."}
          </div>
        </div>
      </div>
    );
  }

  const FilePick = ({ label, value, onChange }) => (
    <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, background:"var(--ink3)", border:`1.5px dashed ${value?"var(--up)":"var(--ln2)"}`, borderRadius:14, padding:"24px 16px", cursor:"pointer", color:value?"var(--up)":"var(--t3)", fontSize:12, fontWeight:600, flex:1 }}>
      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{if(e.target.files?.[0])onChange(e.target.files[0].name);}}/>
      {value ? <><span style={{fontSize:24}}>✓</span><span style={{fontSize:11,textAlign:"center",wordBreak:"break-all"}}>{value}</span></> : <><span style={{fontSize:28}}>+</span><span>{label}</span></>}
    </label>
  );

  const submit = () => {
    const e = {};
    if (!name.trim())  e.name  = "Required";
    if (!phone.trim()) e.phone = "Required";
    if (!idNum.trim()) e.idNum = "Required";
    if (!front)        e.front = "Required";
    if (!back)         e.back  = "Required";
    if (Object.keys(e).length) { setErrs(e); return; }
    setUser({ ...user, kycStatus:"pending", kycData:{docType,name,phone,idNum,front,back,selfie} });
    addToast("KYC submitted — admin reviews within 24h","info");
    onBack();
  };

  return (
    <div>
      <BackHdr onBack={onBack} title="Identity Verification"/>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, padding:16, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Select your ID information</div>
          <div className="fg">
            <label className="lbl">Document Type</label>
            <select className="inp" value={docType} onChange={e=>setDocType(e.target.value)} style={{padding:"13px 16px",fontSize:14}}>
              {["Passport","National ID","Driver's License"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Real Name</label>
            <input className="inp" placeholder="Please enter your real name" value={name} onChange={e=>{setName(e.target.value);setErrs(p=>({...p,name:""}))}} style={{borderColor:errs.name?"var(--dn)":""}}/>
            {errs.name&&<div style={{fontSize:11,color:"var(--dn)",marginTop:4}}>{errs.name}</div>}
          </div>
          <div className="fg">
            <label className="lbl">Phone Number</label>
            <input className="inp" type="tel" placeholder="Please enter phone number" value={phone} onChange={e=>{setPhone(e.target.value);setErrs(p=>({...p,phone:""}))}} style={{borderColor:errs.phone?"var(--dn)":""}}/>
            {errs.phone&&<div style={{fontSize:11,color:"var(--dn)",marginTop:4}}>{errs.phone}</div>}
          </div>
          <div className="fg" style={{marginBottom:0}}>
            <label className="lbl">ID Number</label>
            <input className="inp" placeholder="Please enter ID number" value={idNum} onChange={e=>{setIdNum(e.target.value);setErrs(p=>({...p,idNum:""}))}} style={{borderColor:errs.idNum?"var(--dn)":""}}/>
            {errs.idNum&&<div style={{fontSize:11,color:"var(--dn)",marginTop:4}}>{errs.idNum}</div>}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <FilePick label="Front of ID" value={front} onChange={setFront}/>
          <FilePick label="Back of ID"  value={back}  onChange={setBack}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <FilePick label="Handheld ID Photo" value={selfie} onChange={setSelfie}/>
        </div>
        <button className="btn btn-gold btn-block" onClick={submit}>Submit Verification</button>
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Modify Login Password ──────────────────────────────
function ModifyLoginPwScreen({ onBack, addToast }) {
  const [old,  setOld]  = useState("");
  const [nw,   setNw]   = useState("");
  const [conf, setConf] = useState("");
  const [so,   setSo]   = useState(false);
  const [sn,   setSn]   = useState(false);
  const [sc,   setSc]   = useState(false);
  const [errs, setErrs] = useState({});

  const pws = nw.length>=12?4:nw.length>=10?3:nw.length>=8?2:nw.length>0?1:0;
  const pwc = ["","var(--dn)","var(--gold)","var(--gold2)","var(--up)"];

  const submit = () => {
    const e = {};
    if (!old)             e.old  = "Enter old password";
    if (!nw)              e.nw   = "Enter new password";
    else if (nw.length<8) e.nw   = "Min 8 characters";
    if (!conf)            e.conf = "Confirm your password";
    else if (conf !== nw) e.conf = "Passwords don't match";
    if (Object.keys(e).length) { setErrs(e); return; }
    addToast("Password changed successfully", "ok");
    onBack();
  };

  return (
    <div>
      <BackHdr onBack={onBack} title="Modify Login Password"/>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, padding:16, marginBottom:16 }}>
          {[
            { label:"Old Password",         val:old,  set:setOld,  id:"old",  show:so, setShow:setSo },
            { label:"New Password",          val:nw,   set:setNw,   id:"nw",   show:sn, setShow:setSn },
            { label:"Confirm New Password",  val:conf, set:setConf, id:"conf", show:sc, setShow:setSc },
          ].map(({ label, val, set, id, show, setShow }) => (
            <div key={id} className="fg" style={{ borderBottom:id!=="conf"?"1px solid var(--ln)":"none", paddingBottom:id!=="conf"?14:0, marginBottom:id!=="conf"?14:0 }}>
              <label className="lbl">{label}</label>
              <div className="iw">
                <input className="inp" type={show?"text":"password"} placeholder={`Please enter ${label.toLowerCase()}`}
                  value={val} onChange={e=>{set(e.target.value);setErrs(p=>({...p,[id]:""}))}}/> 
                <Eye show={show} toggle={()=>setShow(p=>!p)}/>
              </div>
              {errs[id]&&<div style={{fontSize:11,color:"var(--dn)",marginTop:4}}>{errs[id]}</div>}
            </div>
          ))}
          {nw.length>0 && (
            <div style={{marginTop:12}}>
              <div style={{display:"flex",gap:3,marginBottom:4}}>{[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=pws?pwc[pws]:"var(--ln2)",transition:"all .3s"}}/>)}</div>
            </div>
          )}
        </div>
        <button className="btn btn-gold btn-block" onClick={submit}>Submit</button>
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Modify Transaction Password ────────────────────────
function ModifyTxPwScreen({ onBack, addToast }) {
  const [old,  setOld]  = useState("");
  const [nw,   setNw]   = useState("");
  const [conf, setConf] = useState("");
  const [so,   setSo]   = useState(false);
  const [sn,   setSn]   = useState(false);
  const [sc,   setSc]   = useState(false);
  const [errs, setErrs] = useState({});

  const submit = () => {
    const e = {};
    if (!old)             e.old  = "Enter old password";
    if (!nw)              e.nw   = "Enter new password";
    if (!conf)            e.conf = "Confirm password";
    else if (conf !== nw) e.conf = "Passwords don't match";
    if (Object.keys(e).length) { setErrs(e); return; }
    addToast("Transaction password changed", "ok");
    onBack();
  };

  return (
    <div>
      <BackHdr onBack={onBack} title="Modify Transaction Password"/>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, padding:16, marginBottom:16 }}>
          {[
            { label:"Old Password",         val:old,  set:setOld,  id:"old",  show:so, setShow:setSo },
            { label:"New Password",          val:nw,   set:setNw,   id:"nw",   show:sn, setShow:setSn },
            { label:"Confirm New Password",  val:conf, set:setConf, id:"conf", show:sc, setShow:setSc },
          ].map(({ label, val, set, id, show, setShow }) => (
            <div key={id} className="fg" style={{ borderBottom:id!=="conf"?"1px solid var(--ln)":"none", paddingBottom:id!=="conf"?14:0, marginBottom:id!=="conf"?14:0 }}>
              <label className="lbl">{label}</label>
              <div className="iw">
                <input className="inp" type={show?"text":"password"} placeholder={`Please enter ${label.toLowerCase()}`}
                  value={val} onChange={e=>{set(e.target.value);setErrs(p=>({...p,[id]:""}))}}/> 
                <Eye show={show} toggle={()=>setShow(p=>!p)}/>
              </div>
              {errs[id]&&<div style={{fontSize:11,color:"var(--dn)",marginTop:4}}>{errs[id]}</div>}
            </div>
          ))}
        </div>
        <button className="btn btn-gold btn-block" onClick={submit}>Submit</button>
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Trade Details Screen ───────────────────────────────
function TradeDetailsScreen({ onBack }) {
  const { orderHistory } = useStore();
  const [tab, setTab] = useState("contract");

  const contractOrders = orderHistory.filter(o => o.type === "Futures");
  const copyOrders     = orderHistory.filter(o => o.type === "Copy Trade");
  const list           = tab === "contract" ? contractOrders : copyOrders;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <BackHdr onBack={onBack} title="Trade Details"/>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--ln)", flexShrink:0 }}>
        {[{id:"contract",label:"Contract Trade"},{id:"copy",label:"Copy Trading"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:"13px 0", background:"none", border:"none",
              borderBottom:`2.5px solid ${tab===t.id?"var(--pu)":"transparent"}`,
              color:tab===t.id?"var(--pu)":"var(--t3)",
              fontFamily:"var(--f)", fontSize:14, fontWeight:700,
              cursor:"pointer", transition:"all .2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 16px" }}>
        {list.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60%", gap:12 }}>
            <div style={{ fontSize:56 }}>📭</div>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--t2)" }}>No Data</div>
          </div>
        ) : (
          list.map((o) => {
            const pp = (o.pnl ?? 0) >= 0;
            return (
              <div key={o.id} style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:14, marginBottom:10, marginTop:10 }}>
                {/* Top row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <CoinIcon sym={o.coin} size={36}/>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15 }}>{o.pair}</div>
                      <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:2 }}>
                        {o.openTime}{o.closeTime ? " → " + o.closeTime : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"var(--m)", fontSize:17, fontWeight:900, color:pp?"var(--up)":"var(--dn)" }}>
                      {pp?"+":""}{(o.pnl??0).toFixed(2)} USDT
                    </div>
                    <span className={`badge ${o.status==="CLOSED"?"b-dim":o.status==="LIQUIDATED"?"b-dn":"b-au"}`}
                      style={{ fontSize:9, marginTop:4, display:"inline-block" }}>
                      {o.status}
                    </span>
                  </div>
                </div>

                {/* Detail grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {[
                    ["Side",   o.side,                          o.side==="BUY"||o.side==="LONG"?"var(--up)":"var(--dn)"],
                    ["Entry",  "$"+fmtP(o.coin, o.entryPrice), "var(--t2)"],
                    ["Exit",   "$"+fmtP(o.coin, o.exitPrice),  "var(--t1)"],
                    ["Type",   o.type,                          "var(--blue)"],
                    ["Margin", "$"+(o.margin??0).toFixed(2),   "var(--t2)"],
                    ["PnL %",  (o.pnlPct??0).toFixed(2)+"%",  pp?"var(--up)":"var(--dn)"],
                  ].map(([l,v,c]) => (
                    <div key={l} style={{ background:"var(--ink2)", borderRadius:10, padding:"8px 10px" }}>
                      <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:3 }}>{l}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Asset Records Screen ───────────────────────────────
function AssetRecordsScreen({ onBack }) {
  const { txHistory } = useStore();
  const [tab, setTab] = useState("all");

  const txLabel = {
    deposit:"Deposit", withdrawal:"Withdraw",
    trade_profit:"Trade Profit", transfer_in:"Transfer In", transfer_out:"Transfer Out"
  };
  const txIn = ["deposit","trade_profit","transfer_in"];

  const typeIcon = {
    deposit:"⬇️", withdrawal:"⬆️", trade_profit:"⚡", transfer_in:"↔️", transfer_out:"↔️"
  };

  const filtered = txHistory.filter(tx => {
    if (tab==="all")      return true;
    if (tab==="deposit")  return tx.type==="deposit";
    if (tab==="withdraw") return tx.type==="withdrawal";
    if (tab==="transfer") return tx.type==="transfer_in"||tx.type==="transfer_out";
    return true;
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <BackHdr onBack={onBack} title="Asset Records"/>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--ln)", flexShrink:0 }}>
        {[
          { id:"all",      label:"All"      },
          { id:"deposit",  label:"Deposit"  },
          { id:"withdraw", label:"Withdraw" },
          { id:"transfer", label:"Transfer" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:"13px 0", background:"none", border:"none",
              borderBottom:`2.5px solid ${tab===t.id?"var(--pu)":"transparent"}`,
              color:tab===t.id?"var(--pu)":"var(--t3)",
              fontFamily:"var(--f)", fontSize:13, fontWeight:700,
              cursor:"pointer", transition:"all .2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 16px" }}>
        {filtered.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60%", gap:12 }}>
            <div style={{ fontSize:56 }}>📭</div>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--t2)" }}>No Data</div>
          </div>
        ) : (
          filtered.map((tx, i) => {
            const isIn = txIn.includes(tx.type);
            return (
              <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:"1px solid var(--ln)" }}>
                {/* Icon */}
                <div style={{ width:44, height:44, borderRadius:13, background:isIn?"rgba(0,200,150,.1)":"rgba(255,59,92,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                  {typeIcon[tx.type] ?? "📄"}
                </div>
                {/* Info */}
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{txLabel[tx.type] ?? tx.type}</div>
                  <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:3 }}>
                    {tx.date}
                    {tx.network ? " · " + tx.network : ""}
                    {tx.coin    ? " · " + tx.coin    : ""}
                  </div>
                </div>
                {/* Amount + status */}
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"var(--m)", fontSize:15, fontWeight:700, color:isIn?"var(--up)":"var(--dn)" }}>
                    {isIn?"+":"-"}${(tx.net ?? tx.amount ?? 0).toFixed(2)}
                  </div>
                  {tx.fee > 0 && (
                    <div style={{ fontSize:10, color:"var(--t3)", marginTop:2 }}>fee -${tx.fee.toFixed(2)}</div>
                  )}
                  <span className={`badge ${tx.status==="completed"?"b-up":tx.status==="pending"?"b-au":"b-dn"}`}
                    style={{ fontSize:9, marginTop:4, display:"inline-block" }}>
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Customer Service Screen ────────────────────────────
function CustomerServiceScreen({ onBack }) {
  return (
    <div>
      <BackHdr onBack={onBack} title="Customer Service"/>
      <div style={{ padding:"24px 16px" }}>

        {/* Main Telegram card */}
        <div style={{ background:"linear-gradient(135deg,rgba(0,136,204,.12),rgba(0,136,204,.04))", border:"1px solid rgba(0,136,204,.25)", borderRadius:20, padding:24, marginBottom:16, textAlign:"center" }}>
          {/* Telegram logo */}
          <div style={{ width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#0088cc,#0055aa)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:"0 8px 24px rgba(0,136,204,.3)" }}>
            <svg width={38} height={38} viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 14.25l-2.95-.924c-.64-.204-.654-.64.136-.954l11.5-4.433c.535-.194 1.003.131.716.309z"/>
            </svg>
          </div>
          <div style={{ fontWeight:900, fontSize:20, marginBottom:8 }}>Contact Support</div>
          <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7, marginBottom:20 }}>
            Our support team is available 24/7 on Telegram.<br/>
            Click below to start a conversation.
          </div>
          <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer"
            style={{ display:"block", padding:"15px 0", borderRadius:14, background:"linear-gradient(135deg,#0088cc,#0055aa)", color:"#fff", fontWeight:800, fontSize:16, textDecoration:"none", textAlign:"center", boxShadow:"0 6px 20px rgba(0,136,204,.35)" }}>
            Open Telegram →
          </a>
        </div>

        {/* Info cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { icon:"⏰", label:"Response Time", value:"< 5 minutes" },
            { icon:"🌍", label:"Availability",  value:"24 / 7"      },
            { icon:"🌐", label:"Languages",     value:"EN / UR"     },
            { icon:"🔒", label:"Secure Chat",   value:"Encrypted"   },
          ].map(card => (
            <div key={card.label} style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:"14px 12px", textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{card.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:2 }}>{card.value}</div>
              <div style={{ fontSize:10, color:"var(--t3)" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* FAQ hint */}
        <div style={{ background:"rgba(240,165,0,.06)", border:"1px solid rgba(240,165,0,.15)", borderRadius:14, padding:"14px 16px" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>💡 Before contacting us</div>
          <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.8 }}>
            • Check your KYC status in Identity Verification<br/>
            • Deposit issues: provide your TxID / hash<br/>
            • Withdrawal issues: verify your wallet address<br/>
            • Include your UID when messaging support
          </div>
        </div>

        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Share / Referral Screen ────────────────────────────
function ShareScreen({ user, onBack }) {
  const refCount = user.referralCount ?? 0;
  const code     = user.referralCode ?? "NXT00000";
  const link     = `https://nextrade.app/register?ref=${code}`;
  const [copied, setCopied] = useState("");

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
    useStore.getState().addToast("Copied!", "ok");
  };

  const days = Array.from({length:7}, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return { date:d.toISOString().split("T")[0], count:0 };
  }).reverse();

  return (
    <div>
      <BackHdr onBack={onBack} title="Share with Friends"/>
      <div style={{ padding:"14px 16px" }}>
        {/* QR Code card */}
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, padding:20, marginBottom:16, textAlign:"center" }}>
          <div style={{ display:"inline-block", background:"#fff", borderRadius:12, padding:12, marginBottom:16 }}>
            <svg viewBox="0 0 100 100" width={160} height={160}>
              {Array.from({length:7}, (_, r) => Array.from({length:7}, (_, c) => (
                <rect key={`${r}-${c}`} x={c*14+1} y={r*14+1} width={12} height={12}
                  fill={(r<3&&c<3)||(r<3&&c>3&&c<7)||(r>3&&r<7&&c<3)||((r===3||c===3)&&(r+c)%2===0)?"#000":"#fff"}/>
              )))}
            </svg>
          </div>
          <button style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#a855f7,#7c3aed)", border:"none", borderRadius:20, padding:"10px 24px", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
            ⬇ Click to save QR Code
          </button>
        </div>

        {/* Referral stats */}
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, padding:16, marginBottom:16 }}>
          <div style={{ textAlign:"center", borderBottom:"1px solid var(--ln)", paddingBottom:14, marginBottom:14 }}>
            <div style={{ fontSize:12, color:"var(--t3)", marginBottom:6 }}>Referral Count</div>
            <div style={{ fontSize:32, fontWeight:900, fontFamily:"var(--m)" }}>{refCount}</div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"var(--t3)", marginBottom:6 }}>Invitation Code</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <span style={{ fontFamily:"var(--m)", fontSize:18, fontWeight:700, color:"var(--t1)", letterSpacing:2 }}>{code}</span>
              <button onClick={() => copy(code,"code")} style={{ background:"var(--ink4)", border:"1px solid var(--ln2)", borderRadius:8, padding:"6px 10px", color:"var(--t2)", cursor:"pointer", fontSize:16 }}>
                {copied==="code" ? "✓" : "📋"}
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontSize:11, color:"var(--t3)", marginBottom:6 }}>Invitation Link</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <span style={{ fontFamily:"var(--m)", fontSize:11, color:"var(--gold)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{link}</span>
              <button onClick={() => copy(link,"link")} style={{ background:"var(--ink4)", border:"1px solid var(--ln2)", borderRadius:8, padding:"6px 10px", color:"var(--t2)", cursor:"pointer", fontSize:16, flexShrink:0 }}>
                {copied==="link" ? "✓" : "📋"}
              </button>
            </div>
          </div>
        </div>

        {/* 7-day activity */}
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, padding:16 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>7-Day Team Activity</div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:12, color:"var(--t3)" }}>Date</span>
            <span style={{ fontSize:12, color:"var(--t3)" }}>Direct/Sub New</span>
          </div>
          {days.map(d => (
            <div key={d.date} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderTop:"1px solid var(--ln)" }}>
              <span style={{ fontSize:13, fontFamily:"var(--m)" }}>{d.date}</span>
              <span style={{ fontSize:13, fontFamily:"var(--m)", color:"var(--t3)" }}>{d.count}</span>
            </div>
          ))}
        </div>
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Notifications Screen ───────────────────────────────
function NotificationsScreen({ onBack }) {
  const { notifs, markRead, markAllRead } = useStore();
  const unread = notifs.filter(n => !n.read).length;
  return (
    <div>
      <BackHdr onBack={onBack} title="Notifications"/>
      <div style={{ padding:"14px 16px" }}>
        {unread > 0 && (
          <button className="btn btn-ghost btn-sm" style={{ marginBottom:12 }} onClick={markAllRead}>
            Mark all as read
          </button>
        )}
        {notifs.length === 0
          ? <div className="empty" style={{ paddingTop:60 }}><div className="ei">🔔</div><p>No notifications</p></div>
          : notifs.map(n => (
            <div key={n.id} onClick={() => markRead(n.id)}
              style={{ background:n.read?"var(--ink3)":"rgba(240,165,0,.05)", border:`1px solid ${n.read?"var(--ln)":"rgba(240,165,0,.2)"}`, borderRadius:14, padding:14, marginBottom:8, cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{n.title}</div>
                <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)" }}>{n.time}</div>
              </div>
              <div style={{ fontSize:12, color:"var(--t2)" }}>{n.body}</div>
              {!n.read && <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold)", marginTop:8 }}/>}
            </div>
          ))
        }
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Main ProfilePage ───────────────────────────────────
// screen + setScreen come from App.js — state lives there, not here
export default function ProfilePage({ screen, setScreen }) {
  const { user, setUser, logout, notifs, addToast } = useStore();

  const unread   = notifs.filter(n => !n.read).length;
  const refCount = user.referralCount ?? 0;
  const lvInfo   = getRefLevel(refCount);
  const kycOk    = user.kycStatus === "approved";

  // Screen registry
  const SCREENS = {
    kyc:      <KYCScreen              user={user} setUser={setUser} addToast={addToast} onBack={() => setScreen(null)}/>,
    loginpw:  <ModifyLoginPwScreen    addToast={addToast} onBack={() => setScreen(null)}/>,
    txpw:     <ModifyTxPwScreen       addToast={addToast} onBack={() => setScreen(null)}/>,
    trades:   <TradeDetailsScreen     onBack={() => setScreen(null)}/>,
    records:  <AssetRecordsScreen     onBack={() => setScreen(null)}/>,
    support:  <CustomerServiceScreen  onBack={() => setScreen(null)}/>,
    share:    <ShareScreen            user={user} onBack={() => setScreen(null)}/>,
    notifs:   <NotificationsScreen    onBack={() => setScreen(null)}/>,
  };

  if (screen && SCREENS[screen]) return SCREENS[screen];

  // ── Security items ─────────────────────────────────
  const SECURITY_ITEMS = [
    {
      icon:"🔐", label:"Identity\nVerification", id:"kyc",
      badge: kycOk ? "var(--up)" : user.kycStatus==="pending" ? "var(--gold)" : "var(--dn)",
      badgeText: kycOk ? "✓" : user.kycStatus==="pending" ? "…" : "!",
    },
    { icon:"🔑", label:"Modify Login\nPassword",       id:"loginpw" },
    { icon:"💳", label:"Modify Tx\nPassword",          id:"txpw"    },
  ];

  // ── General items (Settings + Admin removed) ────────
  const GENERAL_ITEMS = [
    { icon:"📋", label:"Trade\nDetails",  id:"trades"  },
    { icon:"📊", label:"Asset\nRecords",  id:"records" },
    { icon:"💬", label:"Customer\nService", id:"support" },
    { icon:"🔗", label:"Share",           id:"share"   },
    { icon:"🔔", label:"Notifications",   id:"notifs"  },
  ];

  return (
    <div>
      <div className="hdr">
        <span style={{ fontSize:18, fontWeight:800 }}>Mine</span>
        {unread > 0 && <span className="badge b-dn" style={{ marginLeft:"auto" }}>{unread}</span>}
      </div>

      {/* User card */}
      <div style={{ padding:"20px 16px 18px", background:"linear-gradient(145deg,#0d1b2e,#081424)", borderBottom:"1px solid var(--ln)", display:"flex", alignItems:"center", gap:14 }}>
        {/* Avatar with LV badge */}
        <div style={{ position:"relative", flexShrink:0, marginBottom:8 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:"linear-gradient(135deg,var(--gold),#c07800)", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize:22, border:`2.5px solid ${lvInfo.level>0?lvInfo.color:"var(--gold)"}` }}>
            {user.avatar}
          </div>
          <div style={{ position:"absolute", bottom:-9, left:"50%", transform:"translateX(-50%)", background:lvInfo.level>0?lvInfo.color:"var(--gold)", color:"#000", fontSize:9, fontWeight:900, fontFamily:"var(--m)", padding:"2px 7px", borderRadius:6, whiteSpace:"nowrap" }}>
            {lvInfo.level>0 ? lvInfo.label : "LV.0"}
          </div>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:6 }}>
            {user.email || user.name}
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
            {kycOk
              ? <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(0,200,150,.1)", border:"1px solid rgba(0,200,150,.25)", borderRadius:20, padding:"3px 8px", fontSize:10, fontWeight:700, color:"var(--up)" }}>
                  <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>Verified
                </span>
              : <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(255,165,0,.1)", border:"1px solid rgba(255,165,0,.25)", borderRadius:20, padding:"3px 8px", fontSize:10, fontWeight:700, color:"var(--gold)" }}>
                  ⚠ Unverified
                </span>
            }
            {lvInfo.level > 0 && (
              <span style={{ display:"inline-flex", alignItems:"center", background:`${lvInfo.color}18`, border:`1px solid ${lvInfo.color}40`, borderRadius:20, padding:"3px 8px", fontSize:10, fontWeight:700, fontFamily:"var(--m)", color:lvInfo.color }}>
                ★ {lvInfo.label}
              </span>
            )}
          </div>
          <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:5 }}>
            UID: {user.id?.slice(-7) ?? "0000000"}
          </div>
        </div>
      </div>

      <div style={{ padding:"18px 16px" }}>

        {/* Security section */}
        <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, letterSpacing:"1.5px", marginBottom:12 }}>SECURITY</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:22 }}>
          {SECURITY_ITEMS.map(({ icon, label, id, badge, badgeText }) => (
            <button key={id} onClick={() => setScreen(id)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, padding:"16px 8px", cursor:"pointer", position:"relative", transition:"all .2s" }}>
              {badgeText && (
                <span style={{ position:"absolute", top:7, right:7, width:17, height:17, borderRadius:"50%", background:badge, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"#000" }}>
                  {badgeText}
                </span>
              )}
              <div style={{ width:44, height:44, borderRadius:13, background:"var(--ink2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{icon}</div>
              <span style={{ fontSize:10, fontWeight:600, color:"var(--t2)", textAlign:"center", lineHeight:1.4, whiteSpace:"pre-line" }}>{label}</span>
            </button>
          ))}
        </div>

        {/* General section */}
        <div style={{ fontSize:11, color:"var(--t3)", fontWeight:700, letterSpacing:"1.5px", marginBottom:12 }}>GENERAL</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:22 }}>
          {GENERAL_ITEMS.map(({ icon, label, id }) => (
            <button key={id} onClick={() => setScreen(id)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, padding:"14px 6px", cursor:"pointer", position:"relative" }}>
              {id==="notifs" && unread > 0 && (
                <span style={{ position:"absolute", top:6, right:6, width:16, height:16, borderRadius:"50%", background:"var(--dn)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"#fff" }}>
                  {unread}
                </span>
              )}
              <div style={{ width:40, height:40, borderRadius:12, background:"var(--ink2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
              <span style={{ fontSize:9, fontWeight:600, color:"var(--t2)", textAlign:"center", lineHeight:1.4, whiteSpace:"pre-line" }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button className="btn btn-block" onClick={logout}
          style={{ background:"transparent", border:"1px solid rgba(255,59,92,.4)", color:"var(--dn)", fontWeight:700, fontSize:15, borderRadius:14, padding:"14px 0" }}>
          Logout
        </button>
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}