import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { TIERS, NETWORKS, FUND_WD_FEE, TRADE_OUT_FEE, FREEZE_DAYS, MIN_WD } from "@/lib/data";

// ── Custom dropdown (no focus issues) ─────────────────
function Drop({ label, value, opts, onChange, placeholder, err }) {
  const [open, setOpen] = useState(false);
  const sel = opts.find(o => o.id === value);
  return (
    <div className="fg" style={{ position:"relative" }}>
      {label && <label className="lbl">{label}</label>}
      <button type="button" onClick={() => setOpen(p => !p)}
        style={{ width:"100%", background:"var(--ink2)", border:`1.5px solid ${err?"var(--dn)":open?"var(--gold)":"var(--ln)"}`, borderRadius:"var(--r2)", padding:"13px 16px", color:sel?"var(--t1)":"var(--t4)", display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"var(--f)", fontSize:15, cursor:"pointer", transition:"border-color .2s", boxShadow:open?"0 0 0 3px rgba(240,165,0,.1)":"none" }}>
        <div style={{ textAlign:"left" }}>
          {sel ? <>
            <div style={{ fontWeight:700 }}>{sel.name}</div>
            {sel.sub && <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:2 }}>{sel.sub}</div>}
          </> : <span style={{ color:"var(--t4)" }}>{placeholder}</span>}
        </div>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform:open?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0, marginLeft:8 }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"var(--ink4)", border:"1px solid var(--ln2)", borderRadius:"var(--r2)", zIndex:300, boxShadow:"0 8px 32px rgba(0,0,0,.6)", overflow:"hidden" }}>
          {opts.map(opt => (
            <button key={opt.id} type="button" onClick={() => { onChange(opt.id); setOpen(false); }}
              style={{ width:"100%", padding:"12px 16px", background:value===opt.id?"rgba(240,165,0,.08)":"transparent", borderBottom:"1px solid var(--ln)", color:value===opt.id?"var(--gold)":"var(--t1)", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"var(--f)", fontSize:14, transition:"background .15s" }}>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontWeight:700 }}>{opt.name}</div>
                {opt.sub && <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:2 }}>{opt.sub}</div>}
              </div>
              {value===opt.id && <span style={{ color:"var(--gold)" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
      {err && <div style={{ fontSize:11, color:"var(--dn)", marginTop:5 }}>{err}</div>}
    </div>
  );
}

export default function AssetsPage() {
  const { user, setUser, txHistory, addTx, addToast, transferToTrading, transferToFunding, assetsTab, setAssetsTab } = useStore();

  const [tab,     setTab]     = useState("overview");

  // Open correct tab when navigated from HomePage buttons
  useEffect(() => {
    if (assetsTab && assetsTab !== "overview") {
      setTab(assetsTab);
      setDStep(1);
      setAssetsTab("overview"); // reset after reading
    }
  }, [assetsTab]);
  const [dStep,   setDStep]   = useState(1);
  const [dTier,   setDTier]   = useState(null);
  const [dNet,    setDNet]    = useState("");
  const [dHash,   setDHash]   = useState("");
  const [hashErr, setHashErr] = useState("");
  const [copied,  setCopied]  = useState(false);
  const [wNet,    setWNet]    = useState("");
  const [wAmt,    setWAmt]    = useState("");
  const [wAddr,   setWAddr]   = useState("");
  const [wErrs,   setWErrs]   = useState({});
  const [trAmt,   setTrAmt]   = useState("");
  const [trDir,   setTrDir]   = useState("to_trading");

  const kycOk    = user.kycStatus === "approved";
  const fundBal  = user.fundingBalance  ?? 0;
  const tradeBal = user.tradingBalance  ?? 0;
  const freeze   = user.tradingFreezeUntil ?? 0;
  const frozen   = Date.now() < freeze;
  const fdays    = frozen ? Math.ceil((freeze-Date.now())/86400000) : 0;
  const depNet   = NETWORKS.find(n => n.id === dNet);
  const wdNet    = NETWORKS.find(n => n.id === wNet);

  const netOpts  = NETWORKS.map(n => ({ id:n.id, name:n.name, sub:`Fee: ${n.fee} · Deposit: $${dTier?.price??n.min}` }));
  const wdNetOpts= NETWORKS.map(n => ({ id:n.id, name:n.name, sub:`Fee: ${n.fee} · Min: $${MIN_WD}` }));

  const copy = addr => { navigator.clipboard?.writeText(addr); setCopied(true); addToast("Address copied!","ok"); setTimeout(()=>setCopied(false),2000); };

  const submitDeposit = () => {
    if (!dHash.trim()) { setHashErr("Transaction hash is required"); return; }
    addTx({ id:"tx"+Date.now(), type:"deposit", wallet:"funding", amount:dTier.price, fee:0, net:dTier.price, network:depNet.name, status:"pending", date:new Date().toLocaleDateString(), hash:dHash.trim(), tier:dTier.name });
    setUser({ ...user, pendingTier:dTier });
    addToast("Deposit submitted — admin will credit your Funding Account","info");
    setDStep(1); setDHash(""); setDTier(null); setDNet("");
  };

  const submitWithdraw = () => {
    const errs = {}, amt = parseFloat(wAmt), fee = amt * FUND_WD_FEE;
    if (!wNet)              errs.net  = "Select a network";
    if (!wAmt || amt < MIN_WD) errs.amt = `Minimum withdrawal is $${MIN_WD}`;
    else if (amt > fundBal) errs.amt  = "Insufficient funding balance";
    if (!wAddr.trim())      errs.addr = "Wallet address is required";
    if (Object.keys(errs).length) { setWErrs(errs); return; }
    const net = amt - fee;
    setUser({ ...user, fundingBalance: fundBal - amt });
    addTx({ id:"tx"+Date.now(), type:"withdrawal", wallet:"funding", amount:amt, fee, net, network:wdNet.name, status:"pending", date:new Date().toLocaleDateString(), address:wAddr.trim() });
    addToast(`Withdrawal submitted — fee: $${fee.toFixed(2)} (5%)`, "info");
    setWAmt(""); setWAddr(""); setWErrs({});
  };

  const submitTransfer = () => {
    const amt = parseFloat(trAmt);
    if (!amt || amt <= 0) { addToast("Enter transfer amount","err"); return; }
    if (trDir === "to_trading") {
      transferToTrading(amt);
      addToast("Transfer successful! Balance will be available after review.","ok");
    } else {
      if (frozen) { addToast(`Your balance is frozen. Please wait ${fdays} day${fdays!==1?"s":""} to transfer.`,"err"); return; }
      transferToFunding(amt);
      addToast("Transfer complete. Amount has been credited to your Funding Account.","ok");
    }
    setTrAmt("");
  };

  // Deposit step indicator
  const Steps = () => (
    <div style={{ display:"flex", alignItems:"center", marginBottom:20 }}>
      {["Select Tier","Network","Send USDT"].map((s,i) => {
        const n=i+1, active=dStep===n, done=dStep>n;
        return (
          <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:done?"var(--up)":active?"var(--gold)":"var(--ln2)", color:done||active?"#000":"var(--t3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, transition:"all .3s" }}>
                {done?"✓":n}
              </div>
              <span style={{ fontSize:10, fontWeight:700, color:active?"var(--gold)":done?"var(--up)":"var(--t3)", textAlign:"center" }}>{s}</span>
            </div>
            {i<2 && <div style={{ height:2, flex:1, background:done?"var(--up)":"var(--ln2)", marginBottom:22, transition:"background .3s" }}/>}
          </div>
        );
      })}
    </div>
  );

  // ── TX type display ──────────────────────────────────
  const txLabel = { deposit:"Deposit", withdrawal:"Withdraw", trade_profit:"Trade PnL", transfer_in:"Transfer In", transfer_out:"Transfer Out" };
  const txIn    = ["deposit","trade_profit","transfer_in"];

  return (
    <div>
      <div className="hdr">
        <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-.4px" }}>Assets</span>
        <div style={{ marginLeft:"auto" }}>
          {kycOk
            ? <span className="badge b-up" style={{ fontSize:10 }}>KYC ✓</span>
            : <span className="badge b-dn" style={{ fontSize:10 }}>KYC Required</span>}
        </div>
      </div>

      <div style={{ padding:"14px 16px 0" }}>
        {/* Dual wallet */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div className="wf" style={{ padding:16 }}>
            <div style={{ fontSize:9, color:"var(--blue2)", fontFamily:"var(--m)", letterSpacing:"1px", marginBottom:5 }}>FUNDING</div>
            <div style={{ fontSize:20, fontWeight:900, fontFamily:"var(--m)", letterSpacing:"-1px" }}>${fundBal.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            
          </div>
          <div className="wt" style={{ padding:16 }}>
            <div style={{ fontSize:9, color:"var(--up2)", fontFamily:"var(--m)", letterSpacing:"1px", marginBottom:5 }}>TRADING</div>
            <div style={{ fontSize:20, fontWeight:900, fontFamily:"var(--m)", letterSpacing:"-1px" }}>${tradeBal.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            
          </div>
        </div>

        {/* KYC notice */}
        {!kycOk && (
          <div style={{ background:"rgba(255,59,92,.08)", border:"1px solid rgba(255,59,92,.2)", borderRadius:12, padding:"12px 14px", marginBottom:14, fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>
            🔐 <strong style={{ color:"var(--t1)" }}>KYC required</strong> before depositing or withdrawing.<br/>Go to <strong>Profile → KYC Verification</strong>.
          </div>
        )}

        {/* Tabs */}
        <div className="seg" style={{ marginBottom:16 }}>
          {["overview","deposit","withdraw","transfer"].map(t => (
            <button key={t} className={`seg-btn${tab===t?" on":""}`} onClick={() => { setTab(t); setDStep(1); setWErrs({}); }} style={{ textTransform:"capitalize", fontSize:11 }}>{t}</button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab==="overview" && (
          <div>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:14 }}>Transaction History</div>
            <div className="card" style={{ overflow:"hidden" }}>
              {/* Header */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr .7fr .7fr .8fr", gap:4, padding:"9px 14px", background:"var(--ink4)", borderBottom:"1px solid var(--ln)" }}>
                {["Type","Wallet","Amount","Status"].map((h,i) => (
                  <div key={h} style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", textAlign:i>1?"right":"left" }}>{h}</div>
                ))}
              </div>
              {txHistory.length===0 ? (
                <div className="empty"><div className="ei">📄</div><p>No transactions yet</p></div>
              ) : txHistory.map((tx,i) => {
                const isIn = txIn.includes(tx.type);
                return (
                  <div key={tx.id} style={{ display:"grid", gridTemplateColumns:"1fr .7fr .7fr .8fr", gap:4, padding:"11px 14px", borderBottom:i<txHistory.length-1?"1px solid var(--ln)":"none", alignItems:"center" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:12 }}>{txLabel[tx.type]??tx.type}</div>
                      <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginTop:1 }}>{tx.date}{tx.coin?" · "+tx.coin:""}{tx.tier?" · "+tx.tier:""}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <span className={`badge ${tx.wallet==="funding"?"b-bl":"b-up"}`} style={{ fontSize:9 }}>{tx.wallet==="funding"?"Fund":"Trade"}</span>
                    </div>
                    <div style={{ textAlign:"right", fontFamily:"var(--m)", fontSize:12, fontWeight:700, color:isIn?"var(--up)":"var(--dn)" }}>
                      {isIn?"+":"-"}${tx.net?.toFixed(2)??tx.amount?.toFixed(2)??"?"}
                      {tx.fee>0 && <div style={{ fontSize:9, color:"var(--dn)", opacity:.7 }}>fee -${tx.fee.toFixed(2)}</div>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <span className={`badge ${tx.status==="completed"?"b-up":tx.status==="pending"?"b-au":"b-dn"}`} style={{ fontSize:9 }}>{tx.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height:16 }}/>
          </div>
        )}

        {/* ══ DEPOSIT ══ */}
        {tab==="deposit" && (
          !kycOk ? (
            <div style={{ textAlign:"center", padding:"32px 16px" }}>
              <div style={{ fontSize:52, marginBottom:14 }}>🔐</div>
              <div style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>KYC Required</div>
              <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>Submit your KYC documents in Profile before depositing.</div>
            </div>
          ) : user.pendingTier ? (
            <div style={{ background:"rgba(240,165,0,.08)", border:"1px solid rgba(240,165,0,.2)", borderRadius:16, padding:20, textAlign:"center", marginBottom:14 }}>
              <div style={{ fontSize:36, marginBottom:10 }}>⏳</div>
              <div style={{ fontSize:16, fontWeight:800, marginBottom:8 }}>Deposit Under Review</div>
              <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.6, marginBottom:16 }}>
                Your deposit for <strong style={{ color:user.pendingTier.color }}>{user.pendingTier.name}</strong> (${user.pendingTier.price}) is being reviewed.<br/>
                Funds will be credited to your <strong>Funding Account</strong>.
              </div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(240,165,0,.1)", border:"1px solid rgba(240,165,0,.2)", borderRadius:20, padding:"8px 16px" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"var(--gold)", display:"inline-block", animation:"blink 1.5s infinite" }}/>
                <span style={{ color:"var(--gold)", fontWeight:700, fontSize:13, fontFamily:"var(--m)" }}>PENDING</span>
              </div>
            </div>
          ) : (
            <>
              <Steps/>
              {/* Step 1: pick tier */}
              {dStep===1 && (
                <div>
                  <div style={{ background:"rgba(45,156,255,.06)", border:"1px solid rgba(45,156,255,.12)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>
                    💡 Select a tier and deposit the exact USDT amount. After admin approval your tier activates and funds are credited to your <strong style={{ color:"var(--blue)" }}>Funding Account</strong>.
                  </div>
                  {TIERS.map(tier => (
                    <div key={tier.id} onClick={() => { setDTier(tier); setDNet(""); setDStep(2); }}
                      style={{ background:"var(--ink3)", border:"1.5px solid var(--ln)", borderRadius:14, padding:"13px 16px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", transition:"all .18s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=tier.color; e.currentTarget.style.background=tier.color+"10"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor="var(--ln)"; e.currentTarget.style.background="var(--ink3)"; }}>
                      <div>
                        <div style={{ fontWeight:800, fontSize:15, color:tier.color, fontFamily:"var(--m)" }}>{tier.name}</div>
                        <div style={{ fontSize:12, color:"var(--t2)", marginTop:2 }}>${tier.price} USDT</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:18, fontWeight:900, color:"var(--up)", fontFamily:"var(--m)" }}>+${tier.profit}</div>
                          <div style={{ fontSize:10, color:"var(--t3)" }}>per signal</div>
                        </div>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2: pick network */}
              {dStep===2 && dTier && (
                <div>
                  <div style={{ background:`${dTier.color}12`, border:`1px solid ${dTier.color}30`, borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:11, color:"var(--t2)", fontFamily:"var(--m)", marginBottom:3 }}>SELECTED TIER</div>
                      <div style={{ fontSize:18, fontWeight:800, color:dTier.color, fontFamily:"var(--m)" }}>{dTier.name}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:22, fontWeight:900, fontFamily:"var(--m)" }}>${dTier.price}</div>
                      <div style={{ fontSize:11, color:"var(--up)" }}>+${dTier.profit}/trade</div>
                    </div>
                  </div>
                  <Drop label="Select Network" value={dNet} opts={netOpts} onChange={setDNet} placeholder="Choose deposit network..."/>
                  <div style={{ display:"flex", gap:10, marginTop:8 }}>
                    <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setDStep(1)}>← Back</button>
                    <button className="btn btn-gold" style={{ flex:2 }} disabled={!dNet} onClick={() => setDStep(3)}>Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 3: send + hash */}
              {dStep===3 && depNet && dTier && (
                <div>
                  <div style={{ background:"var(--ink4)", border:"1px solid var(--ln2)", borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {[["Tier",dTier.name,dTier.color],["Amount","$"+dTier.price+" USDT","var(--t1)"],["Network",depNet.name,"var(--blue)"],["Network Fee",depNet.fee,"var(--dn)"]].map(([l,v,c]) => (
                        <div key={l}>
                          <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:3 }}>{l}</div>
                          <div style={{ fontFamily:"var(--m)", fontSize:13, fontWeight:700, color:c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:"var(--t2)", fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:8 }}>Send ${dTier.price} USDT to:</div>
                    <div style={{ background:"var(--ink2)", border:"1px solid var(--ln2)", borderRadius:12, padding:"14px 16px", marginBottom:8 }}>
                      <div style={{ fontFamily:"var(--m)", fontSize:12, wordBreak:"break-all", color:"var(--t1)", lineHeight:1.7 }}>{depNet.address}</div>
                    </div>
                    <button className="btn btn-outline btn-block btn-sm" onClick={() => copy(depNet.address)}>{copied?"✓ Copied!":"📋 Copy Address"}</button>
                  </div>
                  <div className="fg">
                    <label className="lbl">Transaction Hash <span style={{ color:"var(--dn)" }}>*</span></label>
                    <input className="inp" placeholder="Paste TxID after sending" value={dHash} onChange={e => { setDHash(e.target.value); setHashErr(""); }} style={{ borderColor:hashErr?"var(--dn)":"" }}/>
                    {hashErr && <div style={{ fontSize:11, color:"var(--dn)", marginTop:5 }}>{hashErr}</div>}
                  </div>
                  <div style={{ background:"rgba(240,165,0,.06)", border:"1px solid rgba(240,165,0,.15)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"var(--t2)", lineHeight:1.6 }}>
                    ⏱ After admin approves, funds are credited to your <strong>Funding Account</strong>.
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setDStep(2)}>← Back</button>
                    <button className="btn btn-gold" style={{ flex:2 }} onClick={submitDeposit}>Submit Deposit</button>
                  </div>
                  <div style={{ height:16 }}/>
                </div>
              )}
            </>
          )
        )}

        {/* ══ WITHDRAW ══ */}
        {tab==="withdraw" && (
          !kycOk ? (
            <div style={{ textAlign:"center", padding:"32px 16px" }}>
              <div style={{ fontSize:52, marginBottom:14 }}>🔐</div>
              <div style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>KYC Required</div>
              <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>Submit your KYC documents in Profile before withdrawing.</div>
            </div>
          ) : (
            <div>
              <div style={{ background:"rgba(240,165,0,.06)", border:"1px solid rgba(240,165,0,.15)", borderRadius:12, padding:"12px 14px", marginBottom:16, fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>
                ⚠️ Withdrawals from <strong style={{ color:"var(--blue)" }}>Funding Account</strong> only.<br/>
                <strong style={{ color:"var(--dn)" }}>5% fee</strong> · Minimum: ${MIN_WD} · Processed within 24h.
              </div>

              <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 14px", marginBottom:16, display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:3 }}>FUNDING BALANCE</div>
                  <div style={{ fontFamily:"var(--m)", fontSize:18, fontWeight:900, color:"var(--blue)" }}>${fundBal.toFixed(2)}</div>
                </div>

              </div>

              <Drop label="Select Network" value={wNet} opts={wdNetOpts} onChange={v => { setWNet(v); setWErrs(p => ({...p,net:undefined})); }} placeholder="Choose withdrawal network..." err={wErrs.net}/>

              <div className="fg">
                <label className="lbl">Amount (USDT) <span style={{ color:"var(--dn)" }}>*</span></label>
                <div className="iw">
                  <input className="inp" type="number" placeholder={`Minimum $${MIN_WD}`} value={wAmt} onChange={e => { setWAmt(e.target.value); setWErrs(p=>({...p,amt:undefined})); }} style={{ paddingRight:52, borderColor:wErrs.amt?"var(--dn)":"" }}/>
                  <button className="isuf" onClick={() => setWAmt(fundBal.toFixed(2))}>MAX</button>
                </div>
                {wErrs.amt && <div style={{ fontSize:11, color:"var(--dn)", marginTop:5 }}>{wErrs.amt}</div>}
                
              </div>

              <div className="fg">
                <label className="lbl">Wallet Address <span style={{ color:"var(--dn)" }}>*</span></label>
                <input className="inp" placeholder={`Enter ${wdNet?.name??"wallet"} address`} value={wAddr} onChange={e => { setWAddr(e.target.value); setWErrs(p=>({...p,addr:undefined})); }} style={{ borderColor:wErrs.addr?"var(--dn)":"" }}/>
                {wErrs.addr && <div style={{ fontSize:11, color:"var(--dn)", marginTop:5 }}>{wErrs.addr}</div>}
              </div>

              <button className="btn btn-red btn-block" onClick={submitWithdraw}>Submit Withdrawal Request</button>
              <div style={{ height:16 }}/>
            </div>
          )
        )}

        {/* ══ TRANSFER ══ */}
        {tab==="transfer" && (
          <div>


            {/* Direction */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {[["to_trading","Funding → Trading","var(--blue)"],["to_funding","Trading → Funding","var(--gold)"]].map(([id,label,c]) => (
                <button key={id} onClick={() => setTrDir(id)} style={{ padding:"12px 0", borderRadius:12, border:`2px solid ${trDir===id?c:"var(--ln)"}`, background:trDir===id?c+"18":"var(--ink3)", color:trDir===id?c:"var(--t2)", fontWeight:800, fontSize:12, cursor:"pointer", transition:"all .2s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* From/To display */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"center", marginBottom:16 }}>
              <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:4 }}>{trDir==="to_trading"?"FROM FUNDING":"FROM TRADING"}</div>
                <div style={{ fontFamily:"var(--m)", fontSize:18, fontWeight:900, color:trDir==="to_trading"?"var(--blue)":"var(--up)" }}>${(trDir==="to_trading"?fundBal:tradeBal).toFixed(2)}</div>
              </div>
              <div style={{ fontSize:20, color:"var(--t3)", textAlign:"center" }}>→</div>
              <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:4 }}>{trDir==="to_trading"?"TO TRADING":"TO FUNDING"}</div>
                <div style={{ fontFamily:"var(--m)", fontSize:16, fontWeight:700, color:"var(--t2)" }}>
                  {trAmt && parseFloat(trAmt)>0 ? "$"+(parseFloat(trAmt)*(trDir==="to_funding"?(1-TRADE_OUT_FEE):1)).toFixed(2) : "$0.00"}
                </div>
                
              </div>
            </div>

            <div className="fg">
              <label className="lbl">Amount (USDT)</label>
              <div className="iw">
                <input className="inp" type="number" placeholder="Enter amount" value={trAmt} onChange={e => setTrAmt(e.target.value)} style={{ paddingRight:52 }}/>
                <button className="isuf" onClick={() => setTrAmt((trDir==="to_trading"?fundBal:tradeBal).toFixed(2))}>MAX</button>
              </div>
            </div>

            <button className="btn btn-gold btn-block" onClick={submitTransfer} disabled={!trAmt||parseFloat(trAmt)<=0||(trDir==="to_funding"&&frozen)}>
              {trDir==="to_trading" ? "Transfer to Trading" : "Transfer to Funding"}
            </button>
            <div style={{ height:16 }}/>
          </div>
        )}
      </div>
    </div>
  );
}