import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { TIERS, NETWORKS, FUND_WD_FEE, TRADE_OUT_FEE, MIN_WD } from "@/lib/data";

// ── Custom dropdown ────────────────────────────────────
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
  const {
    user, setUser, txHistory, addToast,
    submitDeposit, submitWithdrawal, transferToTrading, transferToFunding,
    assetsTab, setAssetsTab, pendingVolume: _pv, fetchPendingVolume,
  } = useStore();

  const pendingVolume = {
    requirement: 0,
    current: 0,
    remaining: 0,
    completed: false,
    progress: 0,
    message: '',
    ...(_pv || {}),
  };

  const [tab,     setTab]     = useState("overview");
  const [busy,    setBusy]    = useState(false);

  useEffect(() => {
    if (assetsTab && assetsTab !== "overview") {
      setTab(assetsTab);
      setDStep(1);
      setAssetsTab("overview");
    }
    // Fetch pending volume on mount/user change
    if (user) {
      fetchPendingVolume();
    }
  }, [assetsTab, user]);

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

  const kycOk    = user?.kycStatus === "approved";
  const fundBal  = user?.fundingBalance  ?? 0;
  const tradeBal = user?.tradingBalance  ?? 0;
  const freeze   = user?.tradingFreezeUntil ?? 0;
  const frozen   = Date.now() < freeze;
  const fdays    = frozen ? Math.ceil((freeze-Date.now())/86400000) : 0;
  const depNet   = NETWORKS.find(n => n.id === dNet);
  const wdNet    = NETWORKS.find(n => n.id === wNet);

  // ── Total amount user must send = tier price + network fee ──
  const totalDepositAmount = dTier && depNet ? dTier.price + depNet.fee : null;

  // ── Network dropdown options ───────────────────────────
  const netOpts   = NETWORKS.map(n => ({
    id:  n.id,
    name: n.name,
    sub: `Network Fee: ${n.feeLabel} · You send: $${dTier ? dTier.price + n.fee : n.min + n.fee}`,
  }));
  const wdNetOpts = NETWORKS.map(n => ({
    id:  n.id,
    name: n.name,
    sub: `Network Fee: ${n.feeLabel} · Min: $${MIN_WD}`,
  }));

  // ── Withdrawal preview ─────────────────────────────────
  const wdAmt        = parseFloat(wAmt) || 0;
  const wdNetworkFee = wdNet ? wdNet.fee : 0;
  const wdPlatformFee= parseFloat((wdAmt * FUND_WD_FEE).toFixed(2));
  const wdTotalFee   = wdPlatformFee + wdNetworkFee;
  const wdReceive    = parseFloat((wdAmt - wdTotalFee).toFixed(2));

  const copy = addr => {
    navigator.clipboard?.writeText(addr);
    setCopied(true);
    addToast("Address copied!", "ok");
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Deposit submit ─────────────────────────────────────
  const handleDeposit = async () => {
    if (!dHash.trim()) { setHashErr("Transaction hash is required"); return; }
    setBusy(true);
    const result = await submitDeposit({
      amount:  dTier.price,
      network: dNet,
      txId:    dHash.trim(),
      tier:    dTier,
    });
    setBusy(false);
    if (result.success) {
      setUser({ ...user, pendingTier: dTier });
      setDStep(1); setDHash(""); setDTier(null); setDNet("");
    }
  };

  // ── Withdrawal submit ──────────────────────────────────
  const handleWithdraw = async () => {
    const errs = {}, amt = parseFloat(wAmt);
    if (!wNet)                 errs.net  = "Select a network";
    if (!wAmt || amt < MIN_WD) errs.amt  = `Minimum withdrawal is $${MIN_WD}`;
    else if (amt > fundBal)    errs.amt  = "Insufficient funding balance";
    if (!wAddr.trim())         errs.addr = "Wallet address is required";
    if (Object.keys(errs).length) { setWErrs(errs); return; }
    setBusy(true);
    const result = await submitWithdrawal({ amount: amt, network: wNet, walletAddress: wAddr.trim() });
    setBusy(false);
    if (result.success) { setWAmt(""); setWAddr(""); setWErrs({}); }
  };

  // ── Transfer submit ────────────────────────────────────
  const handleTransfer = async () => {
    const amt = parseFloat(trAmt);
    if (!amt || amt <= 0) { addToast("Enter transfer amount", "err"); return; }
    setBusy(true);
    if (trDir === "to_trading") {
      await transferToTrading(amt);
    } else {
      if (frozen) { addToast(`Your balance is frozen. Please wait ${fdays} day${fdays!==1?"s":""}.`, "err"); setBusy(false); return; }
      await transferToFunding(amt);
    }
    setBusy(false);
    setTrAmt("");
  };

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
              <div style={{ fontSize:10, color:active?"var(--gold)":done?"var(--up)":"var(--t3)", fontWeight:active?700:400 }}>{s}</div>
            </div>
            {i<2 && <div style={{ height:1, flex:1, background:done?"var(--up)":"var(--ln2)", margin:"0 6px", marginBottom:20, transition:"background .3s" }}/>}
          </div>
        );
      })}
    </div>
  );

  const tabs = [
    { id:"overview", label:"Overview" },
    { id:"deposit",  label:"Deposit"  },
    { id:"withdraw", label:"Withdraw" },
    { id:"transfer", label:"Transfer" },
  ];

  return (
    <div>
      <div className="hdr"><span style={{ fontSize:18, fontWeight:800, letterSpacing:"-.4px" }}>Assets</span></div>

      {/* Balance summary */}
      <div style={{ padding:"12px 16px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div className="wf" style={{ padding:16 }}>
          <div style={{ fontSize:9, color:"var(--blue2)", fontFamily:"var(--m)", letterSpacing:"1px", marginBottom:5 }}>FUNDING</div>
          <div style={{ fontSize:20, fontWeight:900, fontFamily:"var(--m)", letterSpacing:"-1px" }}>${fundBal.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
          <div style={{ fontSize:10, color:"var(--t3)", marginTop:3 }}>5% withdrawal fee</div>
        </div>
        <div className="wt" style={{ padding:16 }}>
          <div style={{ fontSize:9, color:"var(--up2)", fontFamily:"var(--m)", letterSpacing:"1px", marginBottom:5 }}>TRADING</div>
          <div style={{ fontSize:20, fontWeight:900, fontFamily:"var(--m)", letterSpacing:"-1px" }}>${tradeBal.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
          <div style={{ fontSize:10, color:pendingVolume.completed?"var(--up)":"var(--gold)", marginTop:3 }}>
            {pendingVolume.requirement > 0 ? (pendingVolume.completed ? "✅ 0% exit fee" : "⏳ Pending volume") : "25% exit fee"}
          </div>
        </div>
      </div>

      {/* ── PENDING VOLUME INDICATOR ── */}
      {pendingVolume.requirement > 0 && (
        <div style={{ padding:"10px 16px 0" }}>
          <div style={{ 
            background: pendingVolume.completed 
              ? "rgba(0,200,150,.08)" 
              : "rgba(240,165,0,.08)",
            border: pendingVolume.completed 
              ? "1px solid rgba(0,200,150,.2)" 
              : "1px solid rgba(240,165,0,.2)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 10,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontSize:20 }}>
                {pendingVolume.completed ? "✅" : "⏳"}
              </span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:pendingVolume.completed?"var(--up)":"var(--gold)" }}>
                  {pendingVolume.completed ? "Pending Volume Completed!" : "Pending Volume Required"}
                </div>
                <div style={{ fontSize:11, color:"var(--t2)", marginTop:2 }}>
                  {pendingVolume.completed
                    ? `You can now transfer with 0% fees`
                    : `$${pendingVolume.remaining.toFixed(2)} remaining`}
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            {!pendingVolume.completed && (
              <div style={{ marginBottom:8 }}>
                <div style={{ background:"rgba(255,255,255,.1)", borderRadius:6, height:8, overflow:"hidden" }}>
                  <div style={{
                    background:"linear-gradient(90deg, var(--gold), #c07800)",
                    height:"100%",
                    width:`${pendingVolume.progress}%`,
                    transition:"width .3s"
                  }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--t3)", marginTop:4, fontFamily:"var(--m)" }}>
                  <span>${pendingVolume.current.toFixed(2)}</span>
                  <span>{pendingVolume.progress.toFixed(0)}%</span>
                  <span>${pendingVolume.requirement.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Info text */}
            <div style={{ fontSize:11, color:"var(--t2)", lineHeight:1.6 }}>
              {pendingVolume.completed
                ? "You have reached your profit target! All transfers will have 0% fees."
                : `You need to reach $${pendingVolume.requirement.toFixed(2)} in your trading account before you can transfer without fees. Once you reach this target, you'll be able to transfer with 0% fee.`}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--ln)", margin:"14px 16px 0", gap:0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setDStep(1); }}
            style={{ flex:1, padding:"10px 0", fontSize:12, fontWeight:tab===t.id?700:500, color:tab===t.id?"var(--gold)":"var(--t3)", borderBottom:`2px solid ${tab===t.id?"var(--gold)":"transparent"}`, background:"none", cursor:"pointer", transition:"all .2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:"16px 16px 0" }}>

        {/* ══ OVERVIEW ══ */}
        {tab==="overview" && (
          <div>
            {txHistory.length === 0 ? (
              <div className="empty"><div className="ei">💳</div><p style={{fontSize:13}}>No transactions yet</p></div>
            ) : txHistory.slice(0,30).map((tx,i) => {
              const isIn  = ["deposit","transfer_in","trade_profit","referral_bonus"].includes(tx.type);
              const icon  = tx.type==="deposit"?"⬇️"
                          : tx.type==="withdrawal"?"⬆️"
                          : tx.type==="transfer_in"?"↙️"
                          : tx.type==="transfer_out"?"↗️"
                          : tx.type==="referral_bonus"?"🎁"
                          : "💰";
              const label = tx.type==="deposit"?"Deposit"
                          : tx.type==="withdrawal"?"Withdrawal"
                          : tx.type==="transfer_in"?"Transfer In"
                          : tx.type==="transfer_out"?"Transfer Out"
                          : tx.type==="referral_bonus"?"Referral Bonus"
                          : "Trade Profit";
              return (
                <div key={tx.id||i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid var(--ln)" }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:isIn?"rgba(0,200,150,.1)":"rgba(255,59,92,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{label}</div>
                    <div style={{ fontSize:11, color:"var(--t3)", marginTop:2 }}>{tx.network||tx.note||tx.coin||""} · {tx.date}</div>
                    {tx.hash && <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)" }}>{tx.hash}</div>}
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"var(--m)", fontSize:13, fontWeight:700, color:isIn?"var(--up)":"var(--dn)" }}>{isIn?"+":"-"}${(tx.net||tx.amount||0).toFixed(2)}</div>
                    <span className={`badge ${
                      tx.status==="completed"||tx.status==="approved" ? "b-up" :
                      tx.status==="pending" ? "b-au" : "b-dn"
                    }`} style={{ fontSize:9, marginTop:4 }}>{tx.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ DEPOSIT ══ */}
        {tab==="deposit" && (
          <>
            <Steps/>
            {dStep===1 && (
              <div>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Select your Tier to deposit:</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {TIERS.map(t => (
                    <button key={t.id} onClick={() => setDTier(t)}
                      style={{ padding:"14px 12px", borderRadius:14, border:`2px solid ${dTier?.id===t.id?t.color:"var(--ln)"}`, background:dTier?.id===t.id?t.color+"18":"var(--ink3)", cursor:"pointer", textAlign:"left", transition:"all .2s" }}>
                      <div style={{ fontWeight:800, fontSize:13, color:dTier?.id===t.id?t.color:"var(--t1)" }}>{t.name}</div>
                      <div style={{ fontSize:12, color:"var(--t2)", marginTop:3 }}>${t.price} USDT</div>
                      <div style={{ fontSize:11, color:"var(--up)", marginTop:2 }}>+${t.profit}/trade</div>
                    </button>
                  ))}
                </div>
                <button className="btn btn-gold btn-block" disabled={!dTier} onClick={() => setDStep(2)}>Continue →</button>
              </div>
            )}
            {dStep===2 && (
              <div>
                <Drop label="Select Network" value={dNet} opts={netOpts} onChange={setDNet} placeholder="Choose deposit network..."/>
                <div style={{ display:"flex", gap:10, marginTop:8 }}>
                  <button className="btn btn-ghost" style={{flex:1}} onClick={() => setDStep(1)}>← Back</button>
                  <button className="btn btn-gold" style={{flex:2}} disabled={!dNet} onClick={() => setDStep(3)}>Continue →</button>
                </div>
              </div>
            )}
            {dStep===3 && depNet && dTier && (
              <div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:"var(--t2)", fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:8 }}>
                    Send ${totalDepositAmount} USDT to:
                  </div>
                  <div style={{ background:"rgba(240,165,0,.06)", border:"1px solid rgba(240,165,0,.15)", borderRadius:10, padding:"10px 14px", marginBottom:10, fontSize:12, color:"var(--t2)", lineHeight:1.8 }}>
                    💰 Tier Price: <strong style={{color:"var(--t1)"}}>${dTier.price}</strong>
                    {" + "}
                    Network Fee: <strong style={{color:"var(--t1)"}}>{depNet.feeLabel}</strong>
                    {" = "}
                    <strong style={{color:"var(--gold)"}}>Total: ${totalDepositAmount}</strong>
                  </div>
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
                  <button className="btn btn-gold" style={{ flex:2 }} onClick={handleDeposit} disabled={busy}>{busy?<span className="spin"/>:"Submit Deposit"}</button>
                </div>
                <div style={{ height:16 }}/>
              </div>
            )}
          </>
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
                <strong style={{ color:"var(--dn)" }}>5% platform fee + network fee</strong> · Min: ${MIN_WD} · Within 24h.
              </div>
              <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 14px", marginBottom:16, display:"flex", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:3 }}>FUNDING BALANCE</div>
                  <div style={{ fontFamily:"var(--m)", fontSize:18, fontWeight:900, color:"var(--blue)" }}>${fundBal.toFixed(2)}</div>
                </div>
              </div>
              <Drop label="Select Network" value={wNet} opts={wdNetOpts} onChange={v => { setWNet(v); setWErrs(p=>({...p,net:undefined})); }} placeholder="Choose withdrawal network..." err={wErrs.net}/>
              <div className="fg">
                <label className="lbl">Amount (USDT) <span style={{ color:"var(--dn)" }}>*</span></label>
                <div className="iw">
                  <input className="inp" type="number" placeholder={`Minimum $${MIN_WD}`} value={wAmt} onChange={e => { setWAmt(e.target.value); setWErrs(p=>({...p,amt:undefined})); }} style={{ paddingRight:52, borderColor:wErrs.amt?"var(--dn)":"" }}/>
                  <button className="isuf" onClick={() => setWAmt(fundBal.toFixed(2))}>MAX</button>
                </div>
                {wErrs.amt && <div style={{ fontSize:11, color:"var(--dn)", marginTop:5 }}>{wErrs.amt}</div>}
              </div>
              {wdAmt > 0 && wNet && (
                <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 14px", marginBottom:12, fontSize:12, color:"var(--t2)", lineHeight:1.9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span>Amount</span><span style={{color:"var(--t1)",fontWeight:700}}>${wdAmt.toFixed(2)}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span>Platform Fee (5%)</span><span style={{color:"var(--dn)"}}>-${wdPlatformFee.toFixed(2)}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span>Network Fee ({wdNet?.feeLabel})</span><span style={{color:"var(--dn)"}}>-${wdNetworkFee.toFixed(2)}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid var(--ln)", paddingTop:6, marginTop:4 }}>
                    <span style={{fontWeight:700}}>You Receive</span>
                    <span style={{color:"var(--up)",fontWeight:900,fontFamily:"var(--m)"}}>${Math.max(0, wdReceive).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="fg">
                <label className="lbl">Wallet Address <span style={{ color:"var(--dn)" }}>*</span></label>
                <input className="inp" placeholder={`Enter ${wdNet?.name??"wallet"} address`} value={wAddr} onChange={e => { setWAddr(e.target.value); setWErrs(p=>({...p,addr:undefined})); }} style={{ borderColor:wErrs.addr?"var(--dn)":"" }}/>
                {wErrs.addr && <div style={{ fontSize:11, color:"var(--dn)", marginTop:5 }}>{wErrs.addr}</div>}
              </div>
              <button className="btn btn-red btn-block" onClick={handleWithdraw} disabled={busy}>{busy?<span className="spin"/>:"Submit Withdrawal Request"}</button>
              <div style={{ height:16 }}/>
            </div>
          )
        )}

        {/* ══ TRANSFER ══ */}
        {tab==="transfer" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {[["to_trading","Funding → Trading","var(--blue)"],["to_funding","Trading → Funding","var(--gold)"]].map(([id,label,c]) => (
                <button key={id} onClick={() => setTrDir(id)} style={{ padding:"12px 0", borderRadius:12, border:`2px solid ${trDir===id?c:"var(--ln)"}`, background:trDir===id?c+"18":"var(--ink3)", color:trDir===id?c:"var(--t2)", fontWeight:800, fontSize:12, cursor:"pointer", transition:"all .2s" }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"center", marginBottom:16 }}>
              <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:4 }}>{trDir==="to_trading"?"FROM FUNDING":"FROM TRADING"}</div>
                <div style={{ fontFamily:"var(--m)", fontSize:18, fontWeight:900, color:trDir==="to_trading"?"var(--blue)":"var(--up)" }}>${(trDir==="to_trading"?fundBal:tradeBal).toFixed(2)}</div>
              </div>
              <div style={{ fontSize:20, color:"var(--t3)", textAlign:"center" }}>→</div>
              <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:4 }}>{trDir==="to_trading"?"TO TRADING":"TO FUNDING"}</div>
                <div style={{ fontFamily:"var(--m)", fontSize:16, fontWeight:700, color:"var(--t2)" }}>
                  {trAmt && parseFloat(trAmt)>0
                    ? "$"+(parseFloat(trAmt)*(trDir==="to_funding"&&!pendingVolume.completed?(1-TRADE_OUT_FEE):1)).toFixed(2)
                    : "$0.00"}
                </div>
              </div>
            </div>
            {/* Fee note - UPDATED with pending volume logic */}
            <div style={{ fontSize:11, color:"var(--t3)", textAlign:"center", marginBottom:12 }}>
              {trDir==="to_trading"
                ? "✅ No fee — full amount transferred"
                : pendingVolume.completed
                ? "✅ 0% fee — pending volume completed!"
                : pendingVolume.requirement > 0
                ? <span>⚠️ 25% exit fee applies — pending volume: <span style={{color:"var(--dn)",fontWeight:700}}>${(pendingVolume.remaining ?? 0).toFixed(2)}</span> remaining</span>
                : "⚠️ 25% exit fee applies"}
            </div>
            <div className="fg">
              <label className="lbl">Amount (USDT)</label>
              <div className="iw">
                <input className="inp" type="number" placeholder="Enter amount" value={trAmt} onChange={e => setTrAmt(e.target.value)} style={{ paddingRight:52 }}/>
                <button className="isuf" onClick={() => setTrAmt((trDir==="to_trading"?fundBal:tradeBal).toFixed(2))}>MAX</button>
              </div>
            </div>
            <button className="btn btn-gold btn-block" onClick={handleTransfer} disabled={busy||!trAmt||parseFloat(trAmt)<=0||(trDir==="to_funding"&&frozen)}>
              {busy?<span className="spin"/>:trDir==="to_trading"?"Transfer to Trading":"Transfer to Funding"}
            </button>
            <div style={{ height:16 }}/>
          </div>
        )}
      </div>
    </div>
  );
}