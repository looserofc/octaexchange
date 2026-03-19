import { useState } from "react";
import { useStore } from "@/lib/store";
import { NETWORKS, FUND_WD_FEE, TRADE_OUT_FEE, MIN_WD, MIN_DEP } from "@/lib/data";

const WD_FEE_PCT = 10;
const TR_FEE_PCT = 25;

const CHANNELS = [
  { id:"trc20",   name:"USDT-TRC20", network:"TRC20", icon:"₮", color:"#26a17b", address:"TRc9WmJ4xV8nKpL3qRsD7fYbE2gHu6tNv" },
  { id:"bep20",   name:"USDT-BEP20", network:"BEP20", icon:"₮", color:"#26a17b", address:"0xBEP20abc123def456ghi789jkl012mno345" },
  { id:"erc20",   name:"USDT-ERC20", network:"ERC20", icon:"₮", color:"#26a17b", address:"0x742d35Cc6634C0532925a3b8D4C9e7E4a5Bf8" },
  { id:"bnb",     name:"BNB",        network:"BEP20", icon:"B", color:"#F3BA2F", address:"0xBNBabc123def456ghi789jkl012mno345pqr" },
  { id:"usdcerc", name:"USDC-ERC20", network:"ERC20", icon:"$", color:"#2775ca", address:"0xUSDCabc123def456ghi789jkl012mno345pqr" },
  { id:"btc",     name:"BTC",        network:"BTC",   icon:"₿", color:"#F7931A", address:"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" },
  { id:"eth",     name:"ETH",        network:"ERC20", icon:"Ξ", color:"#627EEA", address:"0xETHabc123def456ghi789jkl012mno345pqr" },
  { id:"trx",     name:"TRX",        network:"TRC20", icon:"T", color:"#EF0027", address:"TRXWmJ4xV8nKpL3qRsD7fYbE2gHu6tNvXxx" },
];

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

// ── Step indicator ─────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Amount", "Network", "Transfer"];
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"16px 20px 4px" }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done   = step > n;
        const active = step === n;
        return (
          <div key={label} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1 }}>
              <div style={{
                width:30, height:30, borderRadius:"50%",
                background: done ? "var(--up)" : active ? "var(--gold)" : "var(--ln2)",
                color: (done || active) ? "#000" : "var(--t3)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:900, transition:"all .3s",
                boxShadow: active ? "0 0 0 4px rgba(240,165,0,.18)" : "none",
              }}>
                {done
                  ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : n
                }
              </div>
              <span style={{ fontSize:10, fontWeight:700, color: active ? "var(--gold)" : done ? "var(--up)" : "var(--t3)", whiteSpace:"nowrap" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ height:2, flex:1, background: done ? "var(--up)" : "var(--ln2)", marginBottom:22, transition:"background .3s", flexShrink:0 }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── QR Code SVG ────────────────────────────────────────
function QRCode() {
  return (
    <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
      <div style={{ width:190, height:190, background:"#fff", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", padding:10, boxShadow:"0 8px 32px rgba(0,0,0,.4)" }}>
        <svg viewBox="0 0 98 98" width={170} height={170}>
          <rect x="1"  y="1"  width="26" height="26" fill="#000" rx="2"/>
          <rect x="5"  y="5"  width="18" height="18" fill="#fff" rx="1"/>
          <rect x="9"  y="9"  width="10" height="10" fill="#000" rx="1"/>
          <rect x="71" y="1"  width="26" height="26" fill="#000" rx="2"/>
          <rect x="75" y="5"  width="18" height="18" fill="#fff" rx="1"/>
          <rect x="79" y="9"  width="10" height="10" fill="#000" rx="1"/>
          <rect x="1"  y="71" width="26" height="26" fill="#000" rx="2"/>
          <rect x="5"  y="75" width="18" height="18" fill="#fff" rx="1"/>
          <rect x="9"  y="79" width="10" height="10" fill="#000" rx="1"/>
          {[
            [32,1],[36,1],[44,1],[48,1],[52,1],[32,5],[48,5],[36,9],[44,9],[52,9],[32,13],[36,13],[40,13],[44,13],
            [1,32],[5,32],[9,32],[17,32],[25,32],[32,32],[40,32],[48,32],[56,32],[64,32],[72,32],[80,32],[88,32],
            [36,36],[44,36],[60,36],[68,36],[84,36],[32,40],[40,40],[48,40],[64,40],[72,40],
            [36,44],[52,44],[60,44],[76,44],[84,44],[32,48],[48,48],[56,48],[80,48],[88,48],
            [32,52],[36,52],[52,52],[68,52],[76,52],[1,36],[9,36],[25,36],[1,44],[13,44],[21,44],
            [1,52],[9,52],[17,52],[1,60],[5,60],[13,60],[21,60],
            [32,60],[40,60],[56,60],[64,60],[72,60],[88,60],[36,64],[44,64],[52,64],[76,64],[84,64],
            [32,68],[40,68],[56,68],[64,68],[72,68],[80,68],[32,76],[44,76],[52,76],[60,76],[84,76],
            [32,80],[40,80],[56,80],[72,80],[80,80],[88,80],[32,84],[36,84],[52,84],[60,84],[76,84],
            [32,88],[40,88],[48,88],[56,88],[64,88],[72,88],[80,88],[88,88],
          ].map(([x,y],i) => <rect key={i} x={x} y={y} width={4} height={4} fill="#000"/>)}
        </svg>
      </div>
    </div>
  );
}

// ── Deposit Screen — 3-step flow ───────────────────────
function DepositScreen({ onBack }) {
  const { addTx, user, setUser, addToast } = useStore();

  const [step,    setStep]    = useState(1);          // 1 | 2 | 3
  const [amount,  setAmount]  = useState("");          // step 1
  const [amtErr,  setAmtErr]  = useState("");          // step 1 error
  const [channel, setChannel] = useState(null);        // step 2
  const [hash,    setHash]    = useState("");          // step 3
  const [hashErr, setHashErr] = useState("");          // step 3 error
  const [copied,  setCopied]  = useState(false);

  const amt = parseFloat(amount) || 0;

  // ── Step 1: validate and proceed ──────────────────────
  const goStep2 = () => {
    if (!amount || amt < MIN_DEP) {
      setAmtErr(`Minimum deposit is $${MIN_DEP} USDT`);
      return;
    }
    if (amt > 1_000_000) {
      setAmtErr("Amount seems too large. Please check.");
      return;
    }
    setAmtErr("");
    setStep(2);
  };

  // ── Step 2: channel selected ───────────────────────────
  const selectChannel = (ch) => {
    setChannel(ch);
    setStep(3);
  };

  // ── Step 3: copy address ───────────────────────────────
  const copyAddr = () => {
    if (!channel) return;
    navigator.clipboard?.writeText(channel.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    addToast("Address copied!", "ok");
  };

  // ── Step 3: submit ─────────────────────────────────────
  const submit = () => {
    if (!hash.trim()) {
      setHashErr("Transaction hash is required");
      return;
    }
    if (hash.trim().length < 10) {
      setHashErr("Please enter a valid transaction hash");
      return;
    }
    setHashErr("");

    addTx({
      id:"tx"+Date.now(), type:"deposit", wallet:"funding",
      amount:amt, fee:0, net:amt,
      network:channel.network,
      status:"pending",
      date:new Date().toLocaleDateString(),
      hash:hash.trim(),
    });
    setUser({ ...user, pendingDeposit:{ amount:amt, network:channel.network, hash:hash.trim() } });
    addToast("Deposit submitted — awaiting admin approval", "info");
    onBack();
  };

  // ── STEP 1: Enter Amount ───────────────────────────────
  if (step === 1) return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <BackHdr onBack={onBack} title="Deposit"/>
      <StepBar step={1}/>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px" }}>

        {/* Warning banner */}
        <div style={{ background:"rgba(240,165,0,.08)", border:"1px solid rgba(240,165,0,.2)", borderRadius:12, padding:"12px 14px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
          <span style={{ color:"var(--gold)", flexShrink:0, marginTop:1 }}>⚠</span>
          <span style={{ fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>
            Please fill in the <strong style={{ color:"var(--gold)" }}>actual transfer amount</strong> accurately, otherwise the system audit may fail.
          </span>
        </div>

        {/* Amount input */}
        <div style={{ marginBottom:20 }}>
          <label className="lbl">Deposit Amount (USDT)</label>
          <div style={{ position:"relative" }}>
            <input
              className="inp"
              type="number"
              placeholder={`Min. $${MIN_DEP}.00`}
              value={amount}
              onChange={e => { setAmount(e.target.value); setAmtErr(""); }}
              onKeyDown={e => e.key === "Enter" && goStep2()}
              style={{
                fontSize:22, fontWeight:700, fontFamily:"var(--m)",
                paddingRight:72, letterSpacing:"-0.5px",
                borderColor: amtErr ? "var(--dn)" : amount && amt >= MIN_DEP ? "var(--up)" : "",
              }}
            />
            <span style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", fontSize:13, fontWeight:700, color:"var(--t3)", pointerEvents:"none" }}>
              USDT
            </span>
          </div>
          {amtErr && (
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, color:"var(--dn)", fontSize:12 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {amtErr}
            </div>
          )}
          {amount && amt >= MIN_DEP && !amtErr && (
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, color:"var(--up)", fontSize:12 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Amount looks good
            </div>
          )}
        </div>

        {/* Quick amount buttons */}
        <div style={{ marginBottom:20 }}>
          <label className="lbl" style={{ marginBottom:10 }}>Quick Select</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[100, 200, 500, 1000].map(v => (
              <button key={v} onClick={() => { setAmount(String(v)); setAmtErr(""); }}
                style={{ padding:"10px 0", borderRadius:10,
                  border:`1.5px solid ${parseFloat(amount)===v?"var(--gold)":"var(--ln)"}`,
                  background:parseFloat(amount)===v?"rgba(240,165,0,.1)":"var(--ink3)",
                  color:parseFloat(amount)===v?"var(--gold)":"var(--t2)",
                  fontFamily:"var(--m)", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                ${v}
              </button>
            ))}
          </div>
        </div>

        {/* Info box */}
        <div style={{ background:"rgba(45,156,255,.06)", border:"1px solid rgba(45,156,255,.12)", borderRadius:12, padding:"12px 14px", marginBottom:24 }}>
          <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.9 }}>
            <div>💡 Minimum deposit: <strong style={{ color:"var(--gold)" }}>${MIN_DEP} USDT</strong></div>
            <div>💡 Funds credited to your <strong style={{ color:"var(--blue)" }}>Funding Account</strong></div>
            <div>💡 Admin approval required — usually within 30 minutes</div>
          </div>
        </div>

        <button className="btn btn-gold btn-block btn-lg" onClick={goStep2}>
          Continue — Select Network →
        </button>
        <div style={{ height:16 }}/>
      </div>
    </div>
  );

  // ── STEP 2: Select Network ─────────────────────────────
  if (step === 2) return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <BackHdr onBack={() => setStep(1)} title="Deposit"/>
      <StepBar step={2}/>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px" }}>

        {/* Selected amount summary */}
        <div style={{ background:"rgba(0,200,150,.08)", border:"1px solid rgba(0,200,150,.2)", borderRadius:12, padding:"12px 16px", marginBottom:18, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:3, letterSpacing:".8px" }}>DEPOSIT AMOUNT</div>
            <div style={{ fontSize:22, fontWeight:900, fontFamily:"var(--m)", color:"var(--up)" }}>${parseFloat(amount).toFixed(2)} USDT</div>
          </div>
          <button onClick={() => setStep(1)} style={{ fontSize:11, color:"var(--gold)", fontWeight:600, background:"rgba(240,165,0,.1)", border:"1px solid rgba(240,165,0,.2)", borderRadius:8, padding:"5px 10px", cursor:"pointer" }}>
            Change
          </button>
        </div>

        <div style={{ fontWeight:800, fontSize:16, marginBottom:14 }}>Select Channel</div>
        {CHANNELS.map(ch => (
          <div key={ch.id} onClick={() => selectChannel(ch)}
            style={{ display:"flex", alignItems:"center", gap:14, background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer", transition:"all .18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=ch.color; e.currentTarget.style.background=ch.color+"10"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--ln)"; e.currentTarget.style.background="var(--ink3)"; }}>
            <div style={{ width:44, height:44, borderRadius:12, background:ch.color+"22", border:`1.5px solid ${ch.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:18, color:ch.color, flexShrink:0 }}>
              {ch.icon}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{ch.name}</div>
              <div style={{ fontSize:11, color:"var(--t3)", marginTop:2, fontFamily:"var(--m)" }}>{ch.network}</div>
            </div>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}
        <div style={{ height:16 }}/>
      </div>
    </div>
  );

  // ── STEP 3: QR Code + Address + Hash ──────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <BackHdr onBack={() => setStep(2)} title={`Deposit (${channel?.name})`}/>
      <StepBar step={3}/>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>

        {/* Node syncing status */}
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"10px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--up)", flexShrink:0, animation:"blink 1.5s infinite" }}/>
          <span style={{ fontSize:13, color:"var(--t2)" }}>Node Syncing: {channel?.network} Mainnet</span>
        </div>

        {/* Summary row */}
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:12, padding:"12px 16px", marginBottom:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, textAlign:"center" }}>
          {[
            ["Amount",  `$${parseFloat(amount).toFixed(2)}`,  "var(--up)"   ],
            ["Network", channel?.network ?? "—",               "var(--blue)" ],
            ["Channel", channel?.name    ?? "—",               "var(--gold)" ],
          ].map(([l,v,c]) => (
            <div key={l}>
              <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:4, letterSpacing:".8px" }}>{l}</div>
              <div style={{ fontSize:12, fontWeight:700, color:c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Network badge */}
        <div style={{ textAlign:"center", marginBottom:14 }}>
          <span style={{ background:"var(--ink4)", border:"1px solid var(--ln2)", borderRadius:20, padding:"6px 18px", fontSize:13, fontWeight:700, color:"var(--t2)", fontFamily:"var(--m)" }}>
            {channel?.name} ({channel?.network})
          </span>
        </div>

        {/* QR Code */}
        <QRCode/>

        {/* Address box */}
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:14, marginBottom:10 }}>
          <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:6, letterSpacing:".8px" }}>
            SEND <strong style={{ color:"var(--gold)" }}>${parseFloat(amount).toFixed(2)} USDT</strong> TO THIS ADDRESS
          </div>
          <div style={{ fontFamily:"var(--m)", fontSize:12, wordBreak:"break-all", color:"var(--t1)", lineHeight:1.9, marginBottom:10 }}>
            {channel?.address}
          </div>
          <button onClick={copyAddr}
            style={{ width:"100%", padding:"10px 0", borderRadius:10, border:"1px solid var(--ln2)", background: copied ? "rgba(0,200,150,.1)" : "var(--ink4)", color: copied ? "var(--up)" : "var(--t1)", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"var(--f)", transition:"all .2s" }}>
            {copied ? "✓ Address Copied!" : "📋 Copy Address"}
          </button>
        </div>

        {/* Hash input — REQUIRED */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--t3)", marginBottom:7, letterSpacing:".8px", textTransform:"uppercase" }}>
            Transaction Hash (TxID) <span style={{ color:"var(--dn)" }}>*</span>
          </label>
          <input
            className="inp"
            placeholder="Paste your transaction hash after sending"
            value={hash}
            onChange={e => { setHash(e.target.value); setHashErr(""); }}
            style={{ borderColor: hashErr ? "var(--dn)" : hash.trim().length >= 10 ? "var(--up)" : "" }}
          />
          {hashErr && (
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, color:"var(--dn)", fontSize:12 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {hashErr}
            </div>
          )}
          {!hashErr && hash.trim().length >= 10 && (
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, color:"var(--up)", fontSize:12 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Hash entered
            </div>
          )}
          <div style={{ fontSize:11, color:"var(--t3)", marginTop:6, lineHeight:1.6 }}>
            After sending, copy the transaction hash from your wallet or exchange and paste it above.
          </div>
        </div>

        {/* Info notes */}
        <div style={{ background:"rgba(45,156,255,.06)", border:"1px solid rgba(45,156,255,.12)", borderRadius:12, padding:"12px 14px", marginBottom:18 }}>
          <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.9 }}>
            <div>ⓘ Min deposit is <strong style={{ color:"var(--gold)" }}>${MIN_DEP} USDT</strong></div>
            <div>ⓘ Please ensure you are depositing USDT, otherwise assets will not be recoverable.</div>
            <div>ⓘ After admin approves, funds are credited to your <strong style={{ color:"var(--blue)" }}>Funding Account</strong>.</div>
          </div>
        </div>

        {/* Submit button — always visible, grayed out until hash entered */}
        <button
          onClick={hash.trim().length >= 10 ? submit : undefined}
          style={{
            width:"100%",
            padding:"15px 0",
            borderRadius:14,
            border:"none",
            background: hash.trim().length >= 10
              ? "linear-gradient(135deg,#a855f7,#7c3aed)"
              : "rgba(168,85,247,0.25)",
            color: "#fff",
            fontWeight:800,
            fontSize:15,
            fontFamily:"var(--f)",
            transition:"all .3s",
            opacity: hash.trim().length >= 10 ? 1 : 0.45,
            cursor: hash.trim().length >= 10 ? "pointer" : "not-allowed",
            pointerEvents: hash.trim().length >= 10 ? "auto" : "none",
            userSelect:"none",
            display:"block",
          }}>
          I have completed the transfer
        </button>
        <div style={{ height:20 }}/>
      </div>
    </div>
  );
}

// ── Withdraw Screen ────────────────────────────────────
function WithdrawScreen({ onBack }) {
  const { user, setUser, addTx, addToast } = useStore();
  const [net,  setNet]  = useState("");
  const [amt,  setAmt]  = useState("");
  const [addr, setAddr] = useState("");
  const [errs, setErrs] = useState({});

  const fundBal = user.fundingBalance ?? 0;
  const kycOk   = user.kycStatus === "approved";
  const a       = parseFloat(amt) || 0;
  const fee     = a * FUND_WD_FEE;
  const receive = a - fee;

  const submit = () => {
    const e = {};
    if (!net)               e.net  = "Select a network";
    if (!amt || a < MIN_WD) e.amt  = `Minimum withdrawal is $${MIN_WD}`;
    else if (a > fundBal)   e.amt  = "Insufficient funding balance";
    if (!addr.trim())       e.addr = "Enter your wallet address";
    if (Object.keys(e).length) { setErrs(e); return; }

    setUser({ ...user, fundingBalance: fundBal - a });
    addTx({
      id:"tx"+Date.now(), type:"withdrawal", wallet:"funding",
      amount:a, fee, net:receive,
      network:net, status:"pending",
      date:new Date().toLocaleDateString(),
      address:addr.trim(),
    });
    addToast(`Withdrawal submitted — you'll receive $${receive.toFixed(2)} after ${WD_FEE_PCT}% fee`, "info");
    setAmt(""); setAddr(""); setErrs({});
    onBack();
  };

  return (
    <div>
      <BackHdr onBack={onBack} title="Withdraw"/>
      <div style={{ padding:"14px 16px" }}>
        {!kycOk && (
          <div style={{ background:"rgba(255,59,92,.08)", border:"1px solid rgba(255,59,92,.2)", borderRadius:14, padding:"20px 16px", textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:40, marginBottom:10 }}>🔐</div>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:6 }}>KYC Required</div>
            <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>Complete identity verification in your profile before you can withdraw funds.</div>
          </div>
        )}
        <div style={{ background:"rgba(255,59,92,.06)", border:"1px solid rgba(255,59,92,.18)", borderRadius:12, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>📌 Withdrawal Rules</div>
          <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.8 }}>
            • Withdrawals only from <strong style={{ color:"var(--blue)" }}>Funding Account</strong><br/>
            • Fee: <strong style={{ color:"var(--dn)" }}>{WD_FEE_PCT}%</strong> of withdrawal amount<br/>
            • Minimum withdrawal: <strong style={{ color:"var(--gold)" }}>${MIN_WD} USDT</strong><br/>
            • To withdraw trading profits → Transfer to Funding first
          </div>
        </div>
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:4, letterSpacing:".8px" }}>FUNDING ACCOUNT BALANCE</div>
          <div style={{ fontSize:26, fontWeight:900, fontFamily:"var(--m)", color:"var(--blue)" }}>${fundBal.toLocaleString("en-US",{minimumFractionDigits:2})} USDT</div>
        </div>
        <div className="fg">
          <label className="lbl">Network</label>
          <select className="inp" value={net} onChange={e=>{setNet(e.target.value);setErrs(p=>({...p,net:""}))}} style={{padding:"13px 16px",fontSize:14,borderColor:errs.net?"var(--dn)":""}}>
            <option value="">Select network...</option>
            {["TRC20 (USDT)","ERC20 (USDT)","BEP20 (USDT)"].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
          {errs.net&&<div style={{fontSize:11,color:"var(--dn)",marginTop:4}}>{errs.net}</div>}
        </div>
        <div className="fg">
          <label className="lbl">Amount (USDT)</label>
          <div className="iw">
            <input className="inp" type="number" placeholder={`Min. $${MIN_WD}`} value={amt} onChange={e=>{setAmt(e.target.value);setErrs(p=>({...p,amt:""}))}} style={{paddingRight:70,borderColor:errs.amt?"var(--dn)":""}}/>
            <button className="isuf" onClick={()=>setAmt(fundBal.toFixed(2))}>MAX</button>
          </div>
          {errs.amt&&<div style={{fontSize:11,color:"var(--dn)",marginTop:4}}>{errs.amt}</div>}
          {a>=MIN_WD&&(
            <div style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:10,padding:"12px 14px",marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:"var(--t3)"}}>Amount entered</span>
                <span style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)"}}>${a.toFixed(2)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:"var(--dn)"}}>Fee ({WD_FEE_PCT}%)</span>
                <span style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)",color:"var(--dn)"}}>-${fee.toFixed(2)}</span>
              </div>
              <div style={{height:1,background:"var(--ln)",margin:"8px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:13,fontWeight:700,color:"var(--up)"}}>You will receive</span>
                <span style={{fontSize:15,fontWeight:900,fontFamily:"var(--m)",color:"var(--up)"}}>${receive.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="fg">
          <label className="lbl">Wallet Address</label>
          <input className="inp" placeholder="Your USDT wallet address" value={addr} onChange={e=>{setAddr(e.target.value);setErrs(p=>({...p,addr:""}))}} style={{borderColor:errs.addr?"var(--dn)":""}}/>
          {errs.addr&&<div style={{fontSize:11,color:"var(--dn)",marginTop:4}}>{errs.addr}</div>}
        </div>
        <button className="btn btn-gold btn-block" onClick={submit} disabled={!kycOk} style={{opacity:!kycOk?0.5:1}}>Submit Withdrawal</button>
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

// ── Address Management Screen ──────────────────────────
function AddressScreen({ onBack }) {
  const [addresses, setAddresses] = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [newNet,    setNewNet]    = useState("TRC20");
  const [newAddr,   setNewAddr]   = useState("");

  const add = () => {
    if (!newAddr.trim()) return;
    setAddresses(p => [...p, { id:Date.now(), network:"USDT-"+newNet+"-"+newNet, address:newAddr.trim(), date:new Date().toISOString().replace("T"," ").slice(0,19) }]);
    setNewAddr(""); setShowForm(false);
  };

  return (
    <div>
      <BackHdr onBack={onBack} title="Address Management"/>
      <div style={{ padding:"14px 16px" }}>
        {addresses.map(a => (
          <div key={a.id} style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:16, marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>{a.network}</div>
                <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--m)", marginTop:2 }}>{a.date}</div>
              </div>
              <span style={{ fontSize:11, color:"var(--t3)" }}>Address:</span>
            </div>
            <div style={{ background:"var(--ink2)", border:"1px solid var(--ln)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <span style={{ fontFamily:"var(--m)", fontSize:12, color:"var(--t2)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.address}</span>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <button onClick={() => navigator.clipboard?.writeText(a.address)} style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:16 }}>📋</button>
                <button onClick={() => setAddresses(p => p.filter(x => x.id !== a.id))} style={{ background:"none", border:"none", color:"var(--dn)", cursor:"pointer", fontSize:16 }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
        {showForm && (
          <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:14, padding:16, marginBottom:12 }}>
            <div className="fg">
              <label className="lbl">Network</label>
              <select className="inp" value={newNet} onChange={e=>setNewNet(e.target.value)} style={{padding:"12px 14px",fontSize:14}}>
                {["TRC20","ERC20","BEP20"].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Wallet Address</label>
              <input className="inp" placeholder="Enter wallet address" value={newAddr} onChange={e=>setNewAddr(e.target.value)}/>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-gold"  style={{ flex:2 }} onClick={add}>Save Address</button>
            </div>
          </div>
        )}
        <button onClick={() => setShowForm(true)}
          style={{ width:"100%", padding:"14px 0", borderRadius:14, border:"none", background:"linear-gradient(135deg,var(--up),#00a07a)", color:"#000", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"var(--f)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          + Add Address
        </button>
        <div style={{ height:16 }}/>
      </div>
    </div>
  );
}

// ── Transfer Screen ────────────────────────────────────
function TransferScreen({ onBack }) {
  const { user, transferToTrading, transferToFunding } = useStore();
  const [dir, setDir] = useState("to_trading");
  const [amt, setAmt] = useState("");

  const fundBal  = user.fundingBalance  ?? 0;
  const tradeBal = user.tradingBalance  ?? 0;
  const a        = parseFloat(amt) || 0;
  const trFee    = a * TRADE_OUT_FEE;
  const trNet    = a - trFee;

  const submit = () => {
    if (!a || a <= 0) { useStore.getState().addToast("Enter an amount","err"); return; }
    if (dir === "to_trading") {
      if (a > fundBal) { useStore.getState().addToast("Insufficient funding balance","err"); return; }
      transferToTrading(a);
    } else {
      if (a > tradeBal) { useStore.getState().addToast("Insufficient trading balance","err"); return; }
      transferToFunding(a);
    }
    setAmt(""); onBack();
  };

  return (
    <div>
      <BackHdr onBack={onBack} title="Transfer"/>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          {[
            { val:"to_trading", label:"Funding → Trading", sub:"No fee",  color:"var(--blue)" },
            { val:"to_funding", label:"Trading → Funding", sub:"25% fee", color:"var(--up)"   },
          ].map(opt => (
            <button key={opt.val} onClick={() => { setDir(opt.val); setAmt(""); }}
              style={{ padding:"14px 10px", borderRadius:14, border:`2px solid ${dir===opt.val?opt.color:"var(--ln)"}`, background:dir===opt.val?opt.color+"15":"var(--ink3)", color:dir===opt.val?opt.color:"var(--t3)", fontWeight:700, fontSize:12, cursor:"pointer", textAlign:"center", transition:"all .2s" }}>
              <div>{opt.label}</div>
              <div style={{ fontSize:10, marginTop:3, opacity:.7 }}>{opt.sub}</div>
            </button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { label:"Funding Account", value:fundBal,  color:"var(--blue)", active:dir==="to_trading" },
            { label:"Trading Account", value:tradeBal, color:"var(--up)",   active:dir==="to_funding" },
          ].map(card => (
            <div key={card.label} style={{ background:card.active?"rgba(255,255,255,.04)":"var(--ink3)", border:`1px solid ${card.active?"var(--gold)":"var(--ln)"}`, borderRadius:12, padding:14, transition:"all .2s" }}>
              <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--m)", marginBottom:5, letterSpacing:".5px" }}>{card.label.toUpperCase()}</div>
              <div style={{ fontFamily:"var(--m)", fontSize:18, fontWeight:700, color:card.color }}>${card.value.toFixed(2)}</div>
            </div>
          ))}
        </div>
        {dir==="to_trading"&&<div style={{background:"rgba(45,156,255,.06)",border:"1px solid rgba(45,156,255,.15)",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:12,color:"var(--t2)",lineHeight:1.8}}>• No transfer fee<br/>• 20-day freeze applies before you can transfer back</div>}
        {dir==="to_funding"&&<div style={{background:"rgba(255,59,92,.06)",border:"1px solid rgba(255,59,92,.18)",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:12,color:"var(--t2)",lineHeight:1.8}}>• <strong style={{color:"var(--dn)"}}>25% fee</strong> on the amount transferred<br/>• Example: Transfer $100 → receive $75 in Funding</div>}
        <div className="fg">
          <label className="lbl">Amount (USDT)</label>
          <div className="iw">
            <input className="inp" type="number" placeholder="Enter amount" value={amt} onChange={e=>setAmt(e.target.value)} style={{paddingRight:70}}/>
            <button className="isuf" onClick={()=>setAmt(dir==="to_trading"?fundBal.toFixed(2):tradeBal.toFixed(2))}>MAX</button>
          </div>
          {dir==="to_funding"&&a>0&&(
            <div style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:10,padding:"12px 14px",marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"var(--t3)"}}>From Trading</span><span style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)"}}>${a.toFixed(2)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"var(--dn)"}}>Fee (25%)</span><span style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)",color:"var(--dn)"}}>-${trFee.toFixed(2)}</span></div>
              <div style={{height:1,background:"var(--ln)",margin:"8px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700,color:"var(--up)"}}>Added to Funding</span><span style={{fontSize:15,fontWeight:900,fontFamily:"var(--m)",color:"var(--up)"}}>${trNet.toFixed(2)}</span></div>
            </div>
          )}
          {dir==="to_trading"&&a>0&&(
            <div style={{background:"var(--ink3)",border:"1px solid var(--ln)",borderRadius:10,padding:"12px 14px",marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"var(--t3)"}}>Fee</span><span style={{fontSize:12,fontWeight:700,fontFamily:"var(--m)",color:"var(--up)"}}>Free</span></div>
              <div style={{height:1,background:"var(--ln)",margin:"8px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700,color:"var(--up)"}}>Added to Trading</span><span style={{fontSize:15,fontWeight:900,fontFamily:"var(--m)",color:"var(--up)"}}>${a.toFixed(2)}</span></div>
            </div>
          )}
        </div>
        <button className="btn btn-gold btn-block" onClick={submit}>Confirm Transfer</button>
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

// ── Asset Records Screen ───────────────────────────────
function AssetRecordsScreen({ onBack }) {
  const { txHistory } = useStore();
  const [tab, setTab] = useState("all");

  const txLabel = { deposit:"Deposit", withdrawal:"Withdraw", trade_profit:"Trade Profit", transfer_in:"Transfer In", transfer_out:"Transfer Out" };
  const txIcon  = { deposit:"⬇️", withdrawal:"⬆️", trade_profit:"⚡", transfer_in:"↔️", transfer_out:"↔️" };
  const txIn    = ["deposit","trade_profit","transfer_in"];

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
      <div style={{ display:"flex", borderBottom:"1px solid var(--ln)", flexShrink:0 }}>
        {[{id:"all",label:"All"},{id:"deposit",label:"Deposit"},{id:"withdraw",label:"Withdraw"},{id:"transfer",label:"Transfer"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"13px 0", background:"none", border:"none", borderBottom:`2.5px solid ${tab===t.id?"var(--pu)":"transparent"}`, color:tab===t.id?"var(--pu)":"var(--t3)", fontFamily:"var(--f)", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"0 16px" }}>
        {filtered.length===0
          ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60%",gap:12}}><div style={{fontSize:52}}>📭</div><div style={{fontSize:15,fontWeight:700,color:"var(--t2)"}}>No Data</div></div>
          : filtered.map(tx=>{
            const isIn=txIn.includes(tx.type);
            return(
              <div key={tx.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:"1px solid var(--ln)"}}>
                <div style={{width:44,height:44,borderRadius:13,background:isIn?"rgba(0,200,150,.1)":"rgba(255,59,92,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{txIcon[tx.type]??"📄"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{txLabel[tx.type]??tx.type}</div>
                  <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--m)",marginTop:3}}>{tx.date}{tx.network?" · "+tx.network:""}</div>
                  {tx.hash&&tx.hash!=="pending_review"&&<div style={{fontSize:10,color:"var(--t4)",fontFamily:"var(--m)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>{tx.hash}</div>}
                  {tx.fee>0&&<div style={{fontSize:10,color:"var(--dn)",marginTop:2}}>Fee: ${tx.fee.toFixed(2)}</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"var(--m)",fontSize:15,fontWeight:700,color:isIn?"var(--up)":"var(--dn)"}}>{isIn?"+":"-"}${(tx.net??tx.amount??0).toFixed(2)}</div>
                  <span className={`badge ${tx.status==="completed"?"b-up":tx.status==="pending"?"b-au":"b-dn"}`} style={{fontSize:9,marginTop:4,display:"inline-block"}}>{tx.status}</span>
                </div>
              </div>
            );
          })
        }
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

// ── Main AssetsPage ────────────────────────────────────
// screen + setScreen come from App.js — state lives there, not here
export default function AssetsPage({ screen, setScreen }) {
  const { user, txHistory } = useStore();

  const fundBal  = user.fundingBalance  ?? 0;
  const tradeBal = user.tradingBalance  ?? 0;
  const total    = fundBal + tradeBal;
  const kycOk    = user.kycStatus === "approved";
  const txLabel  = { deposit:"Deposit", withdrawal:"Withdraw", trade_profit:"Trade Profit", transfer_in:"Transfer In", transfer_out:"Transfer Out" };
  const txIn     = ["deposit","trade_profit","transfer_in"];
  const recent   = txHistory.slice(0, 5);

  if (screen==="deposit")  return <DepositScreen      onBack={()=>setScreen(null)}/>;
  if (screen==="withdraw") return <WithdrawScreen     onBack={()=>setScreen(null)}/>;
  if (screen==="address")  return <AddressScreen      onBack={()=>setScreen(null)}/>;
  if (screen==="transfer") return <TransferScreen     onBack={()=>setScreen(null)}/>;
  if (screen==="records")  return <AssetRecordsScreen onBack={()=>setScreen(null)}/>;

  return (
    <div>
      <div className="hdr">
        <span style={{ fontSize:18, fontWeight:800 }}>Assets</span>
        <div style={{ marginLeft:"auto" }}>
          {kycOk ? <span className="badge b-up" style={{fontSize:10}}>KYC ✓</span> : <span className="badge b-dn" style={{fontSize:10}}>Unverified</span>}
        </div>
      </div>
      <div style={{ padding:"0 16px" }}>
        {/* Total assets card */}
        <div style={{ background:"linear-gradient(145deg,#0a1929,#071020)", border:"1px solid rgba(255,255,255,.06)", borderRadius:20, padding:20, marginTop:14, marginBottom:18, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,200,150,.06),transparent 70%)" }}/>
          <div style={{ fontSize:11, color:"var(--t3)", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"var(--m)", marginBottom:6 }}>Total Assets Est.</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:13, color:"var(--up)", fontFamily:"var(--m)", fontWeight:700 }}>USDT</span>
            <span style={{ fontSize:32, fontWeight:900, fontFamily:"var(--m)", letterSpacing:"-1px" }}>{total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:18 }}>
            {[{icon:"⬇️",label:"Deposit",action:"deposit"},{icon:"⬆️",label:"Withdraw",action:"withdraw"},{icon:"📋",label:"Address",action:"address"},{icon:"↔️",label:"Transfer",action:"transfer"}].map(({icon,label,action})=>(
              <button key={label} onClick={()=>setScreen(action)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:"12px 6px",cursor:"pointer"}}>
                <span style={{fontSize:22}}>{icon}</span>
                <span style={{fontSize:11,fontWeight:600,color:"var(--t2)"}}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Account balances */}
        <div style={{ background:"var(--ink3)", border:"1px solid var(--ln)", borderRadius:16, overflow:"hidden", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px", borderBottom:"1px solid var(--ln)" }}>
            <div><div style={{fontSize:15,fontWeight:600,color:"var(--t2)"}}>Funding Account</div><div style={{fontSize:11,color:"var(--t3)",marginTop:3}}>Withdraw · 10% fee</div></div>
            <span style={{fontFamily:"var(--m)",fontSize:16,fontWeight:700,color:"var(--blue)"}}>${fundBal.toLocaleString("en-US",{minimumFractionDigits:2})} USDT</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px" }}>
            <div><div style={{fontSize:15,fontWeight:600,color:"var(--t2)"}}>Trading Account</div><div style={{fontSize:11,color:"var(--t3)",marginTop:3}}>Transfer to Funding · 25% fee</div></div>
            <span style={{fontFamily:"var(--m)",fontSize:16,fontWeight:700,color:"var(--up)"}}>${tradeBal.toLocaleString("en-US",{minimumFractionDigits:2})} USDT</span>
          </div>
        </div>
        {/* Recent records */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <span style={{fontSize:16,fontWeight:800}}>Recent Records</span>
          {txHistory.length>5&&<span style={{fontSize:12,color:"var(--gold)",cursor:"pointer",fontWeight:600}} onClick={()=>setScreen("records")}>All →</span>}
        </div>
        {recent.length===0
          ? <div className="empty"><div className="ei">📭</div><p>No Data</p></div>
          : recent.map(tx=>{
              const isIn=txIn.includes(tx.type);
              return(
                <div key={tx.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--ln)"}}>
                  <div style={{width:42,height:42,borderRadius:12,background:isIn?"rgba(0,200,150,.1)":"rgba(255,59,92,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{isIn?"⬇️":"⬆️"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{txLabel[tx.type]??tx.type}</div>
                    <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--m)",marginTop:2}}>{tx.date}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"var(--m)",fontSize:14,fontWeight:700,color:isIn?"var(--up)":"var(--dn)"}}>{isIn?"+":"-"}${(tx.net??tx.amount??0).toFixed(2)}</div>
                    <span className={`badge ${tx.status==="completed"?"b-up":tx.status==="pending"?"b-au":"b-dn"}`} style={{fontSize:9,marginTop:4,display:"inline-block"}}>{tx.status}</span>
                  </div>
                </div>
              );
            })
        }
        <div style={{height:16}}/>
      </div>
    </div>
  );
}