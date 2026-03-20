import { useState } from "react";
import { useStore } from "@/lib/store";
import { PAIRS, COINS, genCode, MOCK_USERS, DEP_REQS, WD_REQS, KYC_REQS, ADMIN_CODES_INIT, getRefLevel, REF_LEVELS } from "@/lib/data";

const MENU = [
  {id:"dash",  icon:"📊",label:"Dashboard"},
  {id:"users", icon:"👥",label:"Users"},
  {id:"codes", icon:"🔑",label:"Signals"},
  {id:"price", icon:"📈",label:"Price Control"},
  {id:"deps",  icon:"⬇", label:"Deposits"},
  {id:"wds",   icon:"⬆", label:"Withdrawals"},
  {id:"kyc",   icon:"🪪", label:"KYC"},
  {id:"banners",icon:"🖼",label:"Banners"},
  {id:"notifs",icon:"🔔",label:"Notifs"},
];

function SB({ s }) {
  const c = s==="approved"||s==="active"?"b-up":s==="pending"?"b-au":"b-dn";
  return <span className={`badge ${c}`} style={{fontSize:10}}>{s}</span>;
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="iw" style={{marginBottom:14}}>
      <input className="inp" placeholder={placeholder??"Search..."} value={value} onChange={e=>onChange(e.target.value)} style={{paddingLeft:40,fontSize:13}}/>
      <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"var(--t3)",pointerEvents:"none"}}>
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
    </div>
  );
}

function EditModal({ user, onSave, onClose }) {
  const [name,  setName]  = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [fb,    setFb]    = useState(String(user.fundBal??0));
  const [tb,    setTb]    = useState(String(user.tradeBal??0));
  const [earn,  setEarn]  = useState(String(user.earnings??0));
  const [wd,    setWd]    = useState(String(user.withdrawn??0));
  const [tier,  setTier]  = useState(String(user.tier));
  const [kyc,   setKyc]   = useState(user.kycStatus??"none");
  const save = () => { onSave({...user,name,email,phone,fundBal:parseFloat(fb)||0,tradeBal:parseFloat(tb)||0,earnings:parseFloat(earn)||0,withdrawn:parseFloat(wd)||0,tier:parseInt(tier)||user.tier,kycStatus:kyc}); onClose(); };
  const F = ({label,value,onChange,type="text"}) => <div className="fg"><label className="lbl">{label}</label><input className="inp" type={type} value={value} onChange={e=>onChange(e.target.value)} style={{padding:"10px 14px",fontSize:13}}/></div>;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"var(--ink3)",border:"1px solid var(--ln2)",borderRadius:18,padding:24,width:"100%",maxWidth:440,maxHeight:"90dvh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontWeight:800,fontSize:16}}>Edit User</span>
          <button onClick={onClose} style={{color:"var(--t3)",fontSize:20}}>✕</button>
        </div>
        <F label="Full Name"          value={name}  onChange={setName}/>
        <F label="Email"              value={email} onChange={setEmail} type="email"/>
        <F label="Phone"              value={phone} onChange={setPhone} type="tel"/>
        <F label="Funding Balance ($)"value={fb}    onChange={setFb}    type="number"/>
        <F label="Trading Balance ($)"value={tb}    onChange={setTb}    type="number"/>
        <F label="Total Earned ($)"   value={earn}  onChange={setEarn}  type="number"/>
        <F label="Withdrawn ($)"      value={wd}    onChange={setWd}    type="number"/>
        <div className="fg"><label className="lbl">Tier (Subscription)</label><select className="inp" value={tier} onChange={e=>setTier(e.target.value)} style={{padding:"10px 14px",fontSize:13}}><option value="">No Tier</option>{[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>Tier {n}</option>)}</select><div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>Upgrading tier here will immediately activate it for the user.</div></div>
        <div className="fg"><label className="lbl">KYC Status</label><select className="inp" value={kyc} onChange={e=>setKyc(e.target.value)} style={{padding:"10px 14px",fontSize:13}}>{["none","pending","approved","rejected"].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" style={{flex:2}} onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel({ onExit, role }) {
  const isMain   = role === 'main';
  const isSecond = role === 'second';
  const { addToast, addSignal, banners, addBanner, toggleBanner, deleteBanner, addNotif, prices, setWick } = useStore();

  const [sec,    setSec]    = useState("dash");
  const [users,  setUsers]  = useState(MOCK_USERS);
  const [deps,   setDeps]   = useState(DEP_REQS);
  const [wds,    setWds]    = useState(WD_REQS);
  const [kycList,setKycList]= useState(KYC_REQS);
  const [codes,  setCodes]  = useState(ADMIN_CODES_INIT);
  const [editU,  setEditU]  = useState(null);

  // Search
  const [uQ,setUQ]=useState(""),[dQ,setDQ]=useState(""),[wQ,setWQ]=useState(""),[kQ,setKQ]=useState("");

  // Signal gen
  const [selPair,setSelPair]=useState(PAIRS[0]),[selSide,setSelSide]=useState("BUY");
  const [gCode,  setGCode]  =useState(""),[gBusy,setGBusy]=useState(false);

  // Price wick form
  const [wSym,  setWSym]  = useState("BTC");
  const [wTarget,setWTarget]=useState("");
  const [wDur,  setWDur]  = useState("60");

  // Banner / notif forms
  const [nb, setNb] = useState({title:"",text:"",color:"#f0a500"});
  const [nf, setNf] = useState({title:"",body:""});

  const q = s=>s.toLowerCase();
  const visibleUsers = isMain ? users : users.filter(u => !u.hiddenFromSub);
  const fu = visibleUsers.filter(u=>!uQ||(q(u.name).includes(q(uQ))||q(u.email).includes(q(uQ))||q(u.phone).includes(q(uQ))));
  const fd = deps.filter(d=>(isMain||d.status==="pending")&&(!dQ||(q(d.user).includes(q(dQ))||q(d.username??"").includes(q(dQ))||q(d.uid??"").includes(q(dQ))||q(d.hash??"").includes(q(dQ)))));
  const fw = wds.filter(w=>(isMain||w.status==="pending")&&(!wQ||(q(w.user).includes(q(wQ))||q(w.username??"").includes(q(wQ))||q(w.uid??"").includes(q(wQ))||q(w.address??"").includes(q(wQ)))));
  const fk = kycList.filter(k=>(isMain||k.status==="pending")&&(!kQ||(q(k.user).includes(q(kQ))||q(k.email).includes(q(kQ))||q(k.phone).includes(q(kQ)))));

  const delU      = id => { setUsers(p=>p.filter(u=>u.id!==id)); addToast("User deleted","info"); };
  const toggleHide = id => {
    setUsers(p => p.map(u => u.id===id ? {...u, hiddenFromSub:!u.hiddenFromSub} : u));
    const u = users.find(x=>x.id===id);
    addToast(u?.hiddenFromSub ? "User visible to Sub Admin" : "User hidden from Sub Admin", "info");
  };
  const saveU = u=>{setUsers(p=>p.map(x=>x.id===u.id?u:x));addToast("User updated","ok");};
  const logSub = (type, detail, status) => {
    if (isSecond) {
      setSubLog(p=>[{id:Date.now(),by:"2nd Admin",type,detail,status,time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),date:new Date().toLocaleDateString()},...p]);
    }
  };
  const appD  = id=>{const d=deps.find(x=>x.id===id);setDeps(p=>p.map(d=>d.id===id?{...d,status:"approved"}:d));addToast("Deposit approved","ok");logSub("Deposit","$"+(d?.amount??0)+" · "+(d?.user??""),"Approved");};
  const rejD  = id=>{const d=deps.find(x=>x.id===id);setDeps(p=>p.map(d=>d.id===id?{...d,status:"rejected"}:d));addToast("Deposit rejected","err");logSub("Deposit","$"+(d?.amount??0)+" · "+(d?.user??""),"Rejected");};
  const appW  = id=>{const w=wds.find(x=>x.id===id);setWds(p=>p.map(w=>w.id===id?{...w,status:"approved"}:w));addToast("Withdrawal approved","ok");logSub("Withdrawal","$"+(w?.amount??0)+" · "+(w?.user??""),"Approved");};
  const rejW  = id=>{const w=wds.find(x=>x.id===id);setWds(p=>p.map(w=>w.id===id?{...w,status:"rejected"}:w));addToast("Withdrawal rejected","err");logSub("Withdrawal","$"+(w?.amount??0)+" · "+(w?.user??""),"Rejected");};
  const appK  = id=>{const k=kycList.find(x=>x.id===id);setKycList(p=>p.map(k=>k.id===id?{...k,status:"approved"}:k));addToast("KYC approved","ok");logSub("KYC",(k?.user??""),"Approved");};
  const rejK  = id=>{const k=kycList.find(x=>x.id===id);setKycList(p=>p.map(k=>k.id===id?{...k,status:"rejected"}:k));addToast("KYC rejected","err");logSub("KYC",(k?.user??""),"Rejected");};

  const genSig = () => {
    setGBusy(true);
    setTimeout(()=>{
      const code=genCode(selPair), coin=selPair.split("/")[0];
      const now=new Date(), exp=new Date(now.getTime()+900_000); // 15 minutes
      const fmt=d=>`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      setCodes(p=>[{code,pair:selPair,side:selSide,created:fmt(now),expires:fmt(exp),used:0,status:"active"},...p]);
      addSignal(code,{coin,pair:selPair,side:selSide,created:Date.now(),ttl:900_000});
      setGCode(code);setGBusy(false);
      addToast(`${selSide} code ${code} generated!`,"ok");
    },500);
  };

  const launchWick = () => {
    const target=parseFloat(wTarget), dur=parseInt(wDur)*1000;
    if(!target||target<=0){addToast("Enter target price","err");return;}
    if(!dur||dur<=0){addToast("Enter duration","err");return;}
    const startPrice=prices[wSym]??COINS[wSym]?.price??0;
    setWick({sym:wSym,targetPrice:target,durationMs:dur,startPrice,startAt:Date.now()});
    addToast(`Wick: ${wSym} → $${target} over ${wDur}s`,"ok");
  };

  const STATS_MAIN   = [{icon:"👥",label:"Users",value:users.length},{icon:"✅",label:"Active",value:"387"},{icon:"🔑",label:"Codes",value:codes.filter(c=>c.status==="active").length},{icon:"⚡",label:"Trades",value:"94"},{icon:"💰",label:"Paid",value:"$188"},{icon:"⬇",label:"Pending",value:deps.filter(d=>d.status==="pending").length}];
  const STATS_SECOND = [
    {icon:"👥",label:"Users",    value:users.length},
    {icon:"✅",label:"Active",   value:users.filter(u=>u.kycStatus==="approved").length},
    {icon:"🔑",label:"Codes",    value:codes.filter(c=>c.status==="active").length},
    {icon:"⬇",label:"Dep. Pending", value:deps.filter(d=>d.status==="pending").length},
    {icon:"⬆",label:"WD Pending",   value:wds.filter(w=>w.status==="pending").length},
    {icon:"🪪",label:"KYC Pending",  value:kycList.filter(k=>k.status==="pending").length},
  ];
  const STATS = isMain ? STATS_MAIN : STATS_SECOND;

  return (
    <>
      {editU && <EditModal user={editU} onSave={saveU} onClose={()=>setEditU(null)}/>}
      <div style={{width:"100%",maxWidth:"var(--max)",margin:"0 auto",height:"100dvh",display:"flex",flexDirection:"column",background:"var(--ink)",overflow:"hidden"}}>

        {/* Top bar */}
        <div style={{height:52,flexShrink:0,background:"var(--ink2)",borderBottom:"1px solid var(--ln)",display:"flex",alignItems:"center",padding:"0 16px",gap:12}}>
          <button onClick={onExit} style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:"var(--t2)"}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Exit
          </button>
          <span style={{fontSize:16,fontWeight:800}}>Admin Panel</span>
          <span className="badge b-pu" style={{marginLeft:"auto"}}>ADMIN</span>
          <button onClick={onExit} style={{fontSize:11,color:"var(--dn)",fontWeight:600}}>Log Out</button>
        </div>

        {/* Menu tabs */}
        <div style={{flexShrink:0,background:"var(--ink2)",borderBottom:"1px solid var(--ln)",overflowX:"auto",display:"flex"}}>
          {MENU.filter(m=>isMain || ["dash","users","codes","deps","wds","kyc"].includes(m.id)).map(m=>(
            <button key={m.id} onClick={()=>setSec(m.id)} style={{padding:"11px 12px",background:"none",border:"none",borderBottom:sec===m.id?"2.5px solid var(--gold)":"2.5px solid transparent",color:sec===m.id?"var(--gold)":"var(--t3)",fontFamily:"var(--f)",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s"}}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:16}}>

          {/* DASHBOARD */}
          {sec==="dash"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                {STATS.map(s=><div key={s.label} className="astat"><div style={{fontSize:22,marginBottom:6}}>{s.icon}</div><div style={{fontSize:20,fontWeight:900,fontFamily:"var(--m)",color:"var(--gold)"}}>{s.value}</div><div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginTop:3}}>{s.label.toUpperCase()}</div></div>)}
              </div>
              <div style={{fontWeight:800,fontSize:15,marginBottom:10}}>Recent Activity</div>
              <div className="card" style={{padding:"0 16px"}}>
                {[["🔑","BTC9421 BUY code generated","2m ago"],["💰","+$2 profit paid to Alice","5m ago"],["⬇","Deposit $200 approved","12m ago"],["👤","New user Carlos joined","1h ago"]].map(([ic,tx,t],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:i<3?"1px solid var(--ln)":"none"}}>
                    <span style={{fontSize:16}}>{ic}</span><span style={{flex:1,fontSize:13}}>{tx}</span><span style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--m)"}}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS */}
          {sec==="users"&&(
            <div>
              <SearchBar value={uQ} onChange={setUQ} placeholder="Search by name, email, phone..."/>
              <div style={{fontSize:12,color:"var(--t3)",marginBottom:10}}>{fu.length} user{fu.length!==1?"s":""} found{isMain && users.filter(u=>u.hiddenFromSub).length > 0 &&  <span style={{marginLeft:8,fontSize:10,color:"var(--dn)",fontWeight:700}}>  ({users.filter(u=>u.hiddenFromSub).length} hidden from Sub Admin) </span>}</div>
              {fu.map(u=>(
                <div key={u.id} className="card" style={{padding:14,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,var(--gold),#c07800)",display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontWeight:900,fontSize:13,flexShrink:0}}>
                      {u.name.split(" ").map(w=>w[0]).join("")}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontWeight:700,fontSize:13}}>{u.name}</span>
                        {isMain && u.hiddenFromSub && (
                          <span style={{fontSize:9,fontWeight:700,background:"rgba(255,59,92,.15)",color:"var(--dn)",border:"1px solid rgba(255,59,92,.3)",borderRadius:4,padding:"2px 5px"}}>HIDDEN</span>
                        )}
                      </div>
                      <div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--m)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
                      <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)"}}>{u.phone} · {u.joined}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <span className="badge b-au">{u.tier?"T"+u.tier:"No Tier"}</span>
                      {(()=>{const lv=getRefLevel(u.referralCount??0);return lv.level>0?<span style={{display:"inline-flex",background:lv.color+"18",border:"1px solid "+lv.color+"40",borderRadius:20,padding:"2px 7px",fontSize:9,fontWeight:900,fontFamily:"var(--m)",color:lv.color}}>{"★ "+lv.label}</span>:null;})()}
                      <SB s={u.kycStatus??"none"}/>
                    </div>
                  </div>
                  {isMain&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    {[["Funding","$"+(u.fundBal??0).toFixed(0),"var(--blue)"],["Trading","$"+(u.tradeBal??0).toFixed(0),"var(--up)"],["Earned","$"+(u.earnings??0).toFixed(0),"var(--gold)"],["Withdrawn","$"+(u.withdrawn??0).toFixed(0),"var(--dn)"]].map(([l,v,c])=>(
                      <div key={l} style={{background:"var(--ink2)",borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:2}}>{l}</div>
                        <div style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)",color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>}
                  {/* Referral info row */}
                  <div style={{background:"var(--ink2)",borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",gap:12,flexWrap:"wrap"}}>
                    <div style={{fontSize:11,color:"var(--t3)"}}>
                      <span style={{fontWeight:700,color:"var(--t2)"}}>UID: </span>
                      <span style={{fontFamily:"var(--m)",color:"var(--gold)"}}>{u.uid||"—"}</span>
                    </div>
                    <div style={{fontSize:11,color:"var(--t3)"}}>
                      <span style={{fontWeight:700,color:"var(--t2)"}}>Referred By: </span>
                      <span style={{color:"var(--blue)"}}>{u.referredBy||"—"}</span>
                    </div>
                    <div style={{fontSize:11,color:"var(--t3)"}}>
                      <span style={{fontWeight:700,color:"var(--t2)"}}>Referrals: </span>
                      <span style={{color:getRefLevel(u.referralCount??0).color,fontWeight:700}}>{u.referralCount??0}</span>
                    </div>
                  </div>
                  {isMain&&<div style={{display:"flex",gap:8}}>
                    <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={()=>setEditU(u)}>✏️ Edit</button>
                    <button className="btn btn-red btn-sm" style={{flex:1}} onClick={()=>{if(window.confirm(`Delete ${u.name}?`))delU(u.id);}}>🗑 Delete</button>
                    {isMain && (
                      <button
                        onClick={() => toggleHide(u.id)}
                        style={{
                          padding:"7px 10px", borderRadius:8, border:`1.5px solid ${u.hiddenFromSub?"rgba(255,59,92,.4)":"rgba(255,165,0,.3)"}`,
                          background:u.hiddenFromSub?"rgba(255,59,92,.1)":"rgba(255,165,0,.08)",
                          color:u.hiddenFromSub?"var(--dn)":"var(--gold)",
                          fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0
                        }}
                      >
                        {u.hiddenFromSub ? "👁 Show Sub" : "🚫 Hide Sub"}
                      </button>
                    )}
                  </div>}
                  {isSecond&&<div style={{fontSize:11,color:"var(--t3)",textAlign:"center",padding:"4px 0"}}>View only</div>}
                </div>
              ))}
            </div>
          )}

          {/* SIGNALS */}
          {sec==="codes"&&(
            <div>
              <div className="card" style={{padding:18,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>🔑 Generate Signal Code</div>
                <div style={{marginBottom:12}}>
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
                  <div style={{background:"rgba(240,165,0,.08)",border:"1px solid rgba(240,165,0,.2)",borderRadius:12,padding:"14px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:4}}>GENERATED CODE</div>
                      <div style={{fontSize:22,fontWeight:900,fontFamily:"var(--m)",color:"var(--gold)",letterSpacing:2}}>{gCode}</div>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={()=>{navigator.clipboard?.writeText(gCode);addToast("Copied!","ok");}}>📋 Copy</button>
                  </div>
                )}
                <button className="btn btn-purple btn-block" onClick={genSig} disabled={gBusy}>{gBusy?<><span className="spin spin-w"/>Generating...</>:"⚡ Generate Code"}</button>
              </div>
              {codes.map((item,i)=>(
                <div key={i} style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:12,padding:"13px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontFamily:"var(--m)",fontSize:15,fontWeight:900,color:item.status==="active"?"var(--gold)":"var(--t3)",letterSpacing:1}}>{item.code}</span>
                      <span className={`badge ${item.side==="BUY"?"b-up":"b-dn"}`} style={{fontSize:9}}>{item.side??""}</span>
                      <SB s={item.status}/>
                    </div>
                    <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--m)"}}>{item.pair} · Exp {item.expires}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"var(--m)",fontSize:18,fontWeight:900,color:"var(--blue)"}}>{item.used}</div>
                    <div style={{fontSize:10,color:"var(--t3)"}}>users</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ PRICE CONTROL ══ */}
          {sec==="price"&&(
            <div>
              <div style={{background:"rgba(255,59,92,.08)",border:"1px solid rgba(255,59,92,.2)",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:13,color:"var(--t2)",lineHeight:1.6}}>
                ⚠️ <strong style={{color:"var(--dn)"}}>Demo Only</strong> — Price manipulation for academic demonstration. 🔒 <strong style={{color:"var(--pu)"}}>Main Admin Only</strong> — Hidden from 2nd Admin.
              </div>

              <div className="card" style={{padding:18,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:14}}>📈 Launch Price Wick</div>

                {/* Coin selector */}
                <div style={{marginBottom:14}}>
                  <div className="lbl" style={{marginBottom:8}}>Select Coin</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {Object.keys(COINS).map(s=>(
                      <button key={s} onClick={()=>setWSym(s)} style={{padding:"6px 12px",borderRadius:8,border:wSym===s?"1.5px solid var(--gold)":"1px solid var(--ln)",background:wSym===s?"rgba(240,165,0,.1)":"var(--ink2)",color:wSym===s?"var(--gold)":"var(--t2)",fontFamily:"var(--m)",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current price */}
                <div style={{background:"var(--ink2)",border:"1px solid var(--ln)",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--t2)",fontSize:13}}>Current {wSym} Price</span>
                  <span style={{fontFamily:"var(--m)",fontSize:14,fontWeight:700,color:"var(--gold)"}}>
                    ${(prices[wSym]??COINS[wSym]?.price??0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                  </span>
                </div>

                {/* Target price */}
                <div className="fg">
                  <label className="lbl">Target Price ($) — Wick Destination</label>
                  <input className="inp" type="number" placeholder={`e.g. ${((prices[wSym]??COINS[wSym]?.price??0)*1.05).toFixed(2)}`} value={wTarget} onChange={e=>setWTarget(e.target.value)}/>
                  {wTarget&&parseFloat(wTarget)>0&&(
                    <div style={{fontSize:11,color:parseFloat(wTarget)>(prices[wSym]??0)?"var(--up)":"var(--dn)",marginTop:4}}>
                      {parseFloat(wTarget)>(prices[wSym]??0)?"▲ Upward (pump)":"▼ Downward (dump)"} — {Math.abs(((parseFloat(wTarget)-(prices[wSym]??0))/(prices[wSym]??1))*100).toFixed(2)}% move
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="fg">
                  <label className="lbl">Duration (seconds)</label>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                    {["10","30","60","120","300"].map(d=>(
                      <button key={d} onClick={()=>setWDur(d)} style={{padding:"6px 12px",borderRadius:8,border:wDur===d?"1.5px solid var(--blue)":"1px solid var(--ln)",background:wDur===d?"rgba(45,156,255,.1)":"var(--ink2)",color:wDur===d?"var(--blue)":"var(--t2)",fontFamily:"var(--m)",fontSize:12,fontWeight:700,cursor:"pointer"}}>{d}s</button>
                    ))}
                  </div>
                  <input className="inp" type="number" placeholder="Custom seconds" value={wDur} onChange={e=>setWDur(e.target.value)} style={{fontSize:13}}/>
                </div>

                {/* Preview */}
                <div style={{background:"var(--ink2)",border:"1px solid var(--ln)",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                  <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:6,letterSpacing:".5px"}}>WICK PREVIEW</div>
                  <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.9}}>
                    Price moves <strong style={{color:"var(--t1)"}}>${(prices[wSym]??COINS[wSym]?.price??0).toFixed(2)}</strong>
                    {" "}→ <strong style={{color:parseFloat(wTarget)>(prices[wSym]??0)?"var(--up)":"var(--dn)"}}>${parseFloat(wTarget)||"?"}</strong>
                    {" "}→ <strong style={{color:"var(--t1)"}}>${(prices[wSym]??COINS[wSym]?.price??0).toFixed(2)}</strong>
                    {" "}over <strong style={{color:"var(--blue)"}}>{wDur}s</strong>.
                    <br/>The wick candle will appear on the <strong>Market chart</strong> and <strong>Futures chart</strong> in real time.
                  </div>
                </div>

                <button className="btn btn-gold btn-block" style={{fontSize:15}} onClick={launchWick}>🚀 Launch Wick</button>
              </div>

              {/* Quick presets */}
              <div style={{fontWeight:800,fontSize:14,marginBottom:10}}>Quick Presets</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {[
                  {label:"BTC +5% Pump",  sym:"BTC",mult:1.05,dur:60, c:"var(--up)"},
                  {label:"BTC -5% Dump",  sym:"BTC",mult:0.95,dur:60, c:"var(--dn)"},
                  {label:"ETH +10% Pump", sym:"ETH",mult:1.10,dur:120,c:"var(--up)"},
                  {label:"ETH -10% Dump", sym:"ETH",mult:0.90,dur:120,c:"var(--dn)"},
                  {label:"SOL +8% Pump",  sym:"SOL",mult:1.08,dur:60, c:"var(--up)"},
                  {label:"BNB -7% Dump",  sym:"BNB",mult:0.93,dur:90, c:"var(--dn)"},
                ].map(p=>(
                  <button key={p.label} onClick={()=>{
                    const sp=prices[p.sym]??COINS[p.sym]?.price??0;
                    setWick({sym:p.sym,targetPrice:sp*p.mult,durationMs:p.dur*1000,startPrice:sp,startAt:Date.now()});
                    addToast(`${p.label} launched`,"ok");
                  }} style={{padding:"12px 10px",borderRadius:12,border:`1px solid ${p.c}30`,background:`${p.c}10`,color:p.c,fontWeight:700,fontSize:12,cursor:"pointer",textAlign:"center"}}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DEPOSITS */}
          {sec==="deps"&&(
            <div>
              <SearchBar value={dQ} onChange={setDQ} placeholder="Search user, hash..."/>
              {fd.map(d=>(
                <div key={d.id} className="card" style={{padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div><div style={{fontWeight:700,fontSize:14}}>{d.user}</div><div style={{fontSize:12,color:"var(--t2)",fontFamily:"var(--m)",marginTop:2}}>{d.tier} · {d.network}</div></div>
                    <SB s={d.status}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:d.status==="pending"?12:0}}>
                    <div><div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:3}}>HASH</div><div style={{fontSize:12,fontFamily:"var(--m)",color:"var(--blue)"}}>{d.hash}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:3}}>AMOUNT</div><div style={{fontSize:20,fontWeight:900,fontFamily:"var(--m)",color:"var(--up)"}}>${d.amount}</div></div>
                  </div>
                  {d.status==="pending"&&<div style={{display:"flex",gap:8}}><button className="btn btn-green btn-sm" style={{flex:1}} onClick={()=>appD(d.id)}>✓ Approve</button><button className="btn btn-red btn-sm" style={{flex:1}} onClick={()=>rejD(d.id)}>✕ Reject</button></div>}
                </div>
              ))}
            </div>
          )}

          {/* WITHDRAWALS */}
          {sec==="wds"&&(
            <div>
              <SearchBar value={wQ} onChange={setWQ} placeholder="Search user, address..."/>
              {fw.map(w=>(
                <div key={w.id} className="card" style={{padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div><div style={{fontWeight:700,fontSize:14}}>{w.user}</div><div style={{fontSize:12,color:"var(--t2)",fontFamily:"var(--m)",marginTop:2}}>{w.network}</div></div>
                    <SB s={w.status}/>
                  </div>
                  <div style={{marginBottom:w.status==="pending"?12:0}}>
                    <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:3}}>ADDRESS</div>
                    <div style={{fontSize:12,fontFamily:"var(--m)",color:"var(--blue)",marginBottom:6}}>{w.address}</div>
                    <div style={{fontSize:22,fontWeight:900,fontFamily:"var(--m)",color:"var(--dn)"}}>-${w.amount}</div>
                  </div>
                  {w.status==="pending"&&<div style={{display:"flex",gap:8}}><button className="btn btn-green btn-sm" style={{flex:1}} onClick={()=>appW(w.id)}>✓ Approve</button><button className="btn btn-red btn-sm" style={{flex:1}} onClick={()=>rejW(w.id)}>✕ Reject</button></div>}
                </div>
              ))}
            </div>
          )}

          {/* KYC */}
          {sec==="kyc"&&(
            <div>
              <SearchBar value={kQ} onChange={setKQ} placeholder="Search name, email, phone..."/>
              {fk.map(k=>(
                <div key={k.id} className="card" style={{padding:14,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div><div style={{fontWeight:700,fontSize:14}}>{k.user}</div><div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--m)",marginTop:2}}>{k.email} · {k.phone}</div><div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginTop:2}}>Submitted: {k.submitted}</div></div>
                    <SB s={k.status}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                    {[["Full Name",k.fullName],["Address",k.address]].map(([l,v])=><div key={l} style={{background:"var(--ink2)",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginBottom:2}}>{l}</div><div style={{fontSize:12,fontWeight:600}}>{v}</div></div>)}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:k.status==="pending"?12:0}}>
                    {[["CNIC Front",k.cnicF],["CNIC Back",k.cnicB]].map(([l,v])=>(
                      <div key={l} style={{background:"var(--ink2)",border:"1px solid var(--ln2)",borderRadius:10,overflow:"hidden"}}>
                        <div style={{height:70,background:"linear-gradient(135deg,var(--ink3),var(--ink4))",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}><span style={{fontSize:20}}>🪪</span><span style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--m)",textAlign:"center",padding:"0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"100%"}}>{v}</span></div>
                        <div style={{padding:"5px 8px",fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",fontWeight:700}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {k.status==="pending"&&<div style={{display:"flex",gap:8}}><button className="btn btn-green btn-sm" style={{flex:1}} onClick={()=>appK(k.id)}>✓ Approve KYC</button><button className="btn btn-red btn-sm" style={{flex:1}} onClick={()=>rejK(k.id)}>✕ Reject</button></div>}
                </div>
              ))}
            </div>
          )}

          {/* BANNERS */}
          {sec==="banners"&&(
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
          {sec==="notifs"&&(
            <div>
              <div className="card" style={{padding:16,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>Send Notification</div>
                <div className="fg"><label className="lbl">Title</label><input className="inp" placeholder="Notification title" value={nf.title} onChange={e=>setNf(p=>({...p,title:e.target.value}))}/></div>
                <div className="fg"><label className="lbl">Message</label><textarea className="inp" rows={3} placeholder="Message body..." value={nf.body} onChange={e=>setNf(p=>({...p,body:e.target.value}))} style={{resize:"none"}}/></div>
                <button className="btn btn-gold btn-sm" onClick={()=>{if(!nf.title){addToast("Title required","err");return;}addNotif({id:"n"+Date.now(),title:nf.title,body:nf.body,time:"just now",read:false});setNf({title:"",body:""});addToast("Notification sent","ok");}}>Send to All Users</button>
              </div>
              <div style={{height:16}}/>
            </div>
          )}

          {/* ══ SUB ADMIN ACTIVITY LOG — MAIN ADMIN ONLY ══ */}
          {sec==="activity"&&isMain&&(
            <div>
              <div style={{background:"rgba(168,85,247,.06)",border:"1px solid rgba(168,85,247,.2)",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:13,color:"var(--t2)",lineHeight:1.6}}>
                🕵️ <strong style={{color:"#a855f7"}}>Sub Admin Activity</strong> — All actions taken by the 2nd Admin are recorded here.
              </div>
              {subLog.length===0?(
                <div className="empty"><div className="ei">📋</div><p style={{fontSize:13,color:"var(--t3)"}}>No activity recorded yet</p></div>
              ):(
                <div>
                  <div style={{fontSize:12,color:"var(--t3)",marginBottom:10}}>{subLog.length} action{subLog.length!==1?"s":""} recorded</div>
                  {subLog.map(log=>(
                    <div key={log.id} className="card" style={{padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:11,background:log.status==="Approved"?"rgba(0,200,150,.12)":"rgba(255,59,92,.12)",border:`1px solid ${log.status==="Approved"?"rgba(0,200,150,.3)":"rgba(255,59,92,.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                        {log.type==="Deposit"?"⬇":log.type==="Withdrawal"?"⬆":"🪪"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13}}>{log.type} <span style={{color:log.status==="Approved"?"var(--up)":"var(--dn)",fontSize:11}}>— {log.status}</span></div>
                        <div style={{fontSize:11,color:"var(--t2)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.detail}</div>
                        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--m)",marginTop:2}}>By: {log.by} · {log.date} {log.time}</div>
                      </div>
                      <span className={`badge ${log.status==="Approved"?"b-up":"b-dn"}`} style={{fontSize:9,flexShrink:0}}>{log.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}