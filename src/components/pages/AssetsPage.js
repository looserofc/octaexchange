import { useState } from "react";
import { useStore } from "@/lib/store";
import { TIERS, NETWORKS } from "@/lib/data";
import CoinIcon from "@/components/ui/CoinIcon";

// ── Reusable Dropdown ─────────────────────────────────────
function Dropdown({ label, value, options, onChange, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  return (
    <div style={{ position: "relative" }}>
      {label && <div className="inp-label">{label}</div>}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%", background: "var(--bg2)",
          border: `1.5px solid ${error ? "var(--red)" : open ? "var(--gold)" : "var(--b1)"}`,
          borderRadius: "var(--r2)", padding: "13px 16px",
          color: selected ? "var(--c)" : "var(--c3)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "var(--fn)", fontSize: 15, cursor: "pointer",
          transition: "border-color 0.2s",
          boxShadow: open ? "0 0 0 3px rgba(245,166,35,0.1)" : "none",
        }}
      >
        <div style={{ textAlign: "left" }}>
          {selected ? (
            <>
              <div style={{ fontWeight: 700 }}>{selected.name}</div>
              {selected.sub && <div style={{ fontSize: 11, color: "var(--c3)", fontFamily: "var(--fm)", marginTop: 2 }}>{selected.sub}</div>}
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0, marginLeft: 8 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--card2)", border: "1px solid var(--b2)",
          borderRadius: "var(--r2)", zIndex: 300,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)", overflow: "hidden",
        }}>
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false); }}
              style={{
                width: "100%", padding: "12px 16px",
                background: value === opt.id ? "rgba(245,166,35,0.08)" : "transparent",
                borderBottom: "1px solid var(--b1)",
                color: value === opt.id ? "var(--gold)" : "var(--c)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", fontFamily: "var(--fn)", fontSize: 14, transition: "background 0.15s",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700 }}>{opt.name}</div>
                {opt.sub && <div style={{ fontSize: 11, color: "var(--c3)", fontFamily: "var(--fm)", marginTop: 2 }}>{opt.sub}</div>}
              </div>
              {value === opt.id && <span style={{ color: "var(--gold)", fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
      {error && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{error}</div>}
    </div>
  );
}

// ── KYC Upload Form ───────────────────────────────────────
function KYCForm({ user, setUser, addToast }) {
  const [form, setForm] = useState({
    fullName:    user.name || "",
    address:     "",
    phone:       user.phone || "",
    cnicFront:   null,
    cnicBack:    null,
  });
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => { const n = {...p}; delete n[k]; return n; });
  };
  const setFile = (k) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((p) => ({ ...p, [k]: file.name }));
      setErrors((p) => { const n = {...p}; delete n[k]; return n; });
    }
  };

  const submit = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName  = "Full name is required";
    if (!form.address.trim())  e.address   = "Address is required";
    if (!form.phone.trim())    e.phone     = "Phone number is required";
    if (!form.cnicFront)       e.cnicFront = "CNIC front photo is required";
    if (!form.cnicBack)        e.cnicBack  = "CNIC back photo is required";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setUser({ ...user, kycStatus: "pending", kycData: form });
    addToast("KYC submitted — admin will review within 24h", "info");
    setSubmitted(true);
  };

  if (submitted || user.kycStatus === "pending") {
    return (
      <div>
        <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>KYC Under Review</div>
          <div style={{ fontSize: 13, color: "var(--c2)", lineHeight: 1.7 }}>
            Your KYC documents are being reviewed by admin.<br />
            You will be notified once approved.
          </div>
          <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 20, padding: "8px 16px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", display: "inline-block", animation: "blink 1.5s infinite" }} />
            <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 13, fontFamily: "var(--fm)" }}>PENDING APPROVAL</span>
          </div>
        </div>
      </div>
    );
  }

  const FInput = ({ id, label, placeholder, required, type = "text" }) => (
    <div className="inp-group">
      <label className="inp-label">{label}{required && <span style={{ color: "var(--red)", marginLeft: 3 }}>*</span>}</label>
      <input
        className="inp"
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={setField(id)}
        style={{ borderColor: errors[id] ? "var(--red)" : "" }}
      />
      {errors[id] && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{errors[id]}</div>}
    </div>
  );

  const FileInput = ({ id, label }) => (
    <div className="inp-group">
      <label className="inp-label">{label}<span style={{ color: "var(--red)", marginLeft: 3 }}>*</span></label>
      <label style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        background: "var(--bg2)", border: `1.5px dashed ${errors[id] ? "var(--red)" : form[id] ? "var(--green)" : "var(--b2)"}`,
        borderRadius: "var(--r2)", padding: "18px 16px",
        cursor: "pointer", transition: "border-color 0.2s",
        color: form[id] ? "var(--green)" : "var(--c3)", fontSize: 13, fontWeight: 600,
      }}>
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={setFile(id)} />
        {form[id] ? (
          <><span style={{ fontSize: 18 }}>✓</span>{form[id]}</>
        ) : (
          <><span style={{ fontSize: 20 }}>📷</span>Tap to upload photo</>
        )}
      </label>
      {errors[id] && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{errors[id]}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ background: "rgba(255,69,96,0.06)", border: "1px solid rgba(255,69,96,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "var(--c2)", lineHeight: 1.6 }}>
        🔒 <strong style={{ color: "var(--c)" }}>KYC Verification Required</strong><br />
        You must complete identity verification before withdrawing funds.
      </div>

      <FInput id="fullName" label="Full Name"      placeholder="As on CNIC"      required />
      <FInput id="address"  label="Home Address"   placeholder="Street, City, Country" required />
      <FInput id="phone"    label="Phone Number"   placeholder="+92-300-0000000" required type="tel" />
      <FileInput id="cnicFront" label="CNIC Front Photo" />
      <FileInput id="cnicBack"  label="CNIC Back Photo" />

      <button className="btn btn-gold btn-block" style={{ marginTop: 8 }} onClick={submit}>
        Submit KYC Documents
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN ASSETS PAGE
// ══════════════════════════════════════════════════════════
export default function AssetsPage() {
  const { user, setUser, txHistory, addTx, addToast } = useStore();

  const [tab,      setTab]      = useState("overview");
  const [depStep,  setDepStep]  = useState(1);
  const [depTier,  setDepTier]  = useState(null);
  const [depNetId, setDepNetId] = useState("");
  const [depHash,  setDepHash]  = useState("");
  const [hashErr,  setHashErr]  = useState("");
  const [copied,   setCopied]   = useState(false);
  const [wdNetId,  setWdNetId]  = useState("");
  const [wdAmt,    setWdAmt]    = useState("");
  const [wdAddr,   setWdAddr]   = useState("");
  const [wdErrors, setWdErrors] = useState({});
  const [showKyc,  setShowKyc]  = useState(false);

  const hasPending   = !!user.pendingTier && !user.subscribedTier;
  const isSubscribed = !!user.subscribedTier;
  const depNet       = NETWORKS.find((n) => n.id === depNetId);
  const wdNet        = NETWORKS.find((n) => n.id === wdNetId);

  const kycApproved = user.kycStatus === "approved";
  const kycPending  = user.kycStatus === "pending";
  const kycNone     = !user.kycStatus;

  // netOptions with tier price in sub (your requested format)
  const tierPrice  = depTier?.price ?? 0;
  const netOptions = NETWORKS.map((n) => ({
    id:   n.id,
    name: n.name,
    sub:  tierPrice > 0 ? `Fee: ${n.fee} · Deposit: $${tierPrice}` : `Fee: ${n.fee} · Min: $${n.min}`,
  }));

  const wdNetOptions = NETWORKS.map((n) => ({
    id:   n.id,
    name: n.name,
    sub:  `Fee: ${n.fee} · Min: $11`,
  }));

  const copyAddr = (addr) => {
    navigator.clipboard?.writeText(addr);
    setCopied(true);
    addToast("Address copied!", "ok");
    setTimeout(() => setCopied(false), 2000);
  };

  const submitDeposit = () => {
    if (!depHash.trim()) { setHashErr("Transaction Hash is required"); return; }
    addTx({
      id: "tx" + Date.now(), type: "deposit",
      amount: depTier.price, network: depNet.name,
      status: "pending", date: new Date().toLocaleDateString(),
      hash: depHash.trim(), tier: depTier.name,
    });
    setUser({ ...user, pendingTier: depTier, subscribedTier: null });
    addToast("Deposit submitted — awaiting admin approval", "info");
    setDepStep(1); setDepHash(""); setDepTier(null); setDepNetId("");
  };

  const submitWithdraw = () => {
    const errs = {};
    const amt  = parseFloat(wdAmt);
    if (!kycApproved)       errs.kyc  = "KYC verification required";
    if (!wdNetId)            errs.net  = "Please select a network";
    if (!wdAmt || amt < 11)  errs.amt  = "Minimum withdrawal is $11";
    else if (amt > user.balance) errs.amt = "Insufficient balance";
    if (!wdAddr.trim())      errs.addr = "Wallet address is required";
    if (Object.keys(errs).length > 0) { setWdErrors(errs); return; }
    addTx({ id: "tx" + Date.now(), type: "withdrawal", amount: amt, network: wdNet.name, status: "pending", date: new Date().toLocaleDateString(), address: wdAddr.trim() });
    addToast("Withdrawal request submitted", "info");
    setWdAmt(""); setWdAddr(""); setWdErrors({});
  };

  const tc = (t) => t?.color ?? "var(--gold)";

  const Steps = () => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
      {["Select Tier", "Network", "Send"].map((s, i) => {
        const n = i + 1, active = depStep === n, done = depStep > n;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: done ? "var(--green)" : active ? "var(--gold)" : "var(--b2)", color: done || active ? "#000" : "var(--c3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, transition: "all 0.3s" }}>
                {done ? "✓" : n}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: active ? "var(--gold)" : done ? "var(--green)" : "var(--c3)", textAlign: "center" }}>{s}</span>
            </div>
            {i < 2 && <div style={{ height: 2, flex: 1, background: done ? "var(--green)" : "var(--b2)", marginBottom: 22, transition: "background 0.3s" }} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <div className="hdr">
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px" }}>Assets</span>
        {kycApproved && <span className="badge badge-up" style={{ marginLeft: "auto", fontSize: 10 }}>KYC ✓</span>}
        {kycPending  && <span className="badge badge-gold" style={{ marginLeft: "auto", fontSize: 10 }}>KYC Pending</span>}
        {kycNone     && <span className="badge badge-dn"   style={{ marginLeft: "auto", fontSize: 10, cursor: "pointer" }} onClick={() => { setTab("withdraw"); setShowKyc(true); }}>KYC Required</span>}
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Balance */}
        <div className="glow-card" style={{ padding: 22, marginBottom: 16 }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--c2)", fontFamily: "var(--fm)", letterSpacing: "1px", marginBottom: 6 }}>AVAILABLE BALANCE</div>
            <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--fm)", letterSpacing: "-1px", marginBottom: 4 }}>
              ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--fm)" }}>+${user.totalProfit.toFixed(2)} total profit</div>
            {(user.subscribedTier || user.pendingTier) && (
              <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: `${tc(user.subscribedTier || user.pendingTier)}18`, border: `1px solid ${tc(user.subscribedTier || user.pendingTier)}33`, borderRadius: 20, padding: "5px 12px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: tc(user.subscribedTier || user.pendingTier), animation: hasPending ? "blink 1.5s infinite" : "none" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: tc(user.subscribedTier || user.pendingTier), fontFamily: "var(--fm)" }}>
                  {user.subscribedTier ? `${user.subscribedTier.name} — $${user.subscribedTier.price}` : `${user.pendingTier.name} — Pending`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="seg" style={{ marginBottom: 16 }}>
          {["overview", "deposit", "withdraw"].map((t) => (
            <button key={t} className={`seg-btn${tab === t ? " active" : ""}`}
              onClick={() => { setTab(t); setDepStep(1); setWdErrors({}); setShowKyc(false); }}
              style={{ textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>Transaction History</div>
            <div className="card" style={{ padding: "0 16px" }}>
              {txHistory.length === 0 ? (
                <div className="empty"><div className="empty-icon">📄</div><p>No transactions yet</p></div>
              ) : txHistory.map((tx, i) => {
                const isIn = tx.type === "deposit" || tx.type === "trade_profit";
                const emoji = { deposit: "⬇", withdrawal: "⬆", trade_profit: "💰" }[tx.type] ?? "📋";
                const label = { deposit: "Deposit", withdrawal: "Withdrawal", trade_profit: "Trade Profit" }[tx.type] ?? tx.type;
                return (
                  <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < txHistory.length - 1 ? "1px solid var(--b1)" : "none" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, fontSize: 16, background: isIn ? "rgba(0,214,143,0.1)" : "rgba(255,69,96,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{label}{tx.tier ? ` · ${tx.tier}` : ""}</div>
                      <div style={{ fontSize: 11, color: "var(--c3)", fontFamily: "var(--fm)", marginTop: 2 }}>{tx.date}{tx.network ? " · " + tx.network : ""}{tx.coin ? " · " + tx.coin : ""}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--fm)", fontSize: 13, fontWeight: 700, color: isIn ? "var(--green)" : "var(--red)" }}>{isIn ? "+" : "-"}${tx.amount ?? "?"}</div>
                      <span className={`badge ${tx.status === "completed" ? "badge-up" : tx.status === "pending" ? "badge-gold" : "badge-dn"}`} style={{ marginTop: 4, fontSize: 10 }}>{tx.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 16 }} />
          </div>
        )}

        {/* ══ DEPOSIT ══ */}
        {tab === "deposit" && (
          <div>
            {hasPending ? (
              /* Pending state */
              <div>
                <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Deposit Under Review</div>
                  <div style={{ fontSize: 13, color: "var(--c2)", lineHeight: 1.6, marginBottom: 16 }}>
                    Your deposit for <strong style={{ color: user.pendingTier.color }}>{user.pendingTier.name}</strong> (${user.pendingTier.price}) is being reviewed.
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 20, padding: "8px 16px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", display: "inline-block", animation: "blink 1.5s infinite" }} />
                    <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 13, fontFamily: "var(--fm)" }}>STATUS: PENDING</span>
                  </div>
                </div>
              </div>
            ) : isSubscribed ? (
              /* Subscribed state */
              <div style={{ background: "rgba(0,214,143,0.08)", border: "1px solid rgba(0,214,143,0.2)", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 12, color: "var(--c2)", marginBottom: 12 }}>✅ Active Subscription</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: tc(user.subscribedTier), fontFamily: "var(--fm)" }}>{user.subscribedTier.name}</div>
                    <div style={{ fontSize: 13, color: "var(--c2)", marginTop: 3 }}>${user.subscribedTier.price} USDT</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "var(--green)", fontFamily: "var(--fm)" }}>+${user.subscribedTier.profit}</div>
                    <div style={{ fontSize: 11, color: "var(--c3)" }}>per signal</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Deposit wizard */
              <>
                <Steps />

                {/* Step 1 — Pick Tier */}
                {depStep === 1 && (
                  <div>
                    <p style={{ fontSize: 13, color: "var(--c2)", marginBottom: 14, lineHeight: 1.6 }}>
                      Choose your investment tier. Profit per signal = tier price × 1%.
                    </p>
                    {TIERS.map((tier) => (
                      <div
                        key={tier.id}
                        onClick={() => { setDepTier(tier); setDepNetId(""); setDepStep(2); }}
                        style={{
                          background: "var(--card)", border: `1.5px solid var(--b1)`,
                          borderRadius: 14, padding: "13px 16px", marginBottom: 8,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          cursor: "pointer", transition: "all 0.18s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = tier.color; e.currentTarget.style.background = `${tier.color}10`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--b1)"; e.currentTarget.style.background = "var(--card)"; }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: tier.color, fontFamily: "var(--fm)" }}>{tier.name}</div>
                          <div style={{ fontSize: 12, color: "var(--c2)", marginTop: 2 }}>Investment: ${tier.price} USDT</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "right" }}>
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--green)", fontFamily: "var(--fm)" }}>+${tier.profit}</div>
                            <div style={{ fontSize: 10, color: "var(--c3)" }}>per signal</div>
                          </div>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--c3)" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                    <div style={{ height: 8 }} />
                  </div>
                )}

                {/* Step 2 — Network */}
                {depStep === 2 && depTier && (
                  <div>
                    {/* Tier summary */}
                    <div style={{ background: `${tc(depTier)}12`, border: `1px solid ${tc(depTier)}30`, borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--c2)", fontFamily: "var(--fm)", marginBottom: 3 }}>SELECTED TIER</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: tc(depTier), fontFamily: "var(--fm)" }}>{depTier.name}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--fm)" }}>${depTier.price}</div>
                        <div style={{ fontSize: 11, color: "var(--green)" }}>+${depTier.profit}/trade</div>
                      </div>
                    </div>

                    <div className="inp-group">
                      <Dropdown
                        label="Select Network"
                        value={depNetId}
                        options={netOptions}
                        onChange={setDepNetId}
                        placeholder="Choose deposit network..."
                      />
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDepStep(1)}>← Back</button>
                      <button className="btn btn-gold" style={{ flex: 2 }} disabled={!depNetId} onClick={() => setDepStep(3)}>Continue →</button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Address + Hash */}
                {depStep === 3 && depNet && depTier && (
                  <div>
                    {/* Summary */}
                    <div style={{ background: "var(--card2)", border: "1px solid var(--b2)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          ["Tier",    depTier.name,    tc(depTier)],
                          ["Amount",  `$${depTier.price} USDT`, "var(--c)"],
                          ["Network", depNet.name,     "var(--cyan)"],
                          ["Fee",     depNet.fee,      "var(--red)"],
                        ].map(([l, v, c]) => (
                          <div key={l}>
                            <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", marginBottom: 3 }}>{l}</div>
                            <div style={{ fontFamily: "var(--fm)", fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: "var(--c2)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                        Send ${depTier.price} USDT to
                      </div>
                      <div style={{ background: "var(--bg2)", border: "1px solid var(--b2)", borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                        <div style={{ fontFamily: "var(--fm)", fontSize: 12, wordBreak: "break-all", color: "var(--c)", lineHeight: 1.7 }}>{depNet.address}</div>
                      </div>
                      <button className="btn btn-outline btn-block btn-sm" onClick={() => copyAddr(depNet.address)}>
                        {copied ? "✓ Copied!" : "📋 Copy Address"}
                      </button>
                    </div>

                    {/* Hash */}
                    <div className="inp-group">
                      <label className="inp-label">Transaction Hash <span style={{ color: "var(--red)" }}>*</span></label>
                      <input className="inp" placeholder="Paste TxID / Hash after sending" value={depHash} onChange={(e) => { setDepHash(e.target.value); setHashErr(""); }} style={{ borderColor: hashErr ? "var(--red)" : "" }} />
                      {hashErr && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{hashErr}</div>}
                    </div>

                    <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "var(--c2)", lineHeight: 1.6 }}>
                      ⏱ Admin will verify your deposit within 1–2 hours.
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDepStep(2)}>← Back</button>
                      <button className="btn btn-gold" style={{ flex: 2 }} onClick={submitDeposit}>Submit Deposit</button>
                    </div>
                    <div style={{ height: 16 }} />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ WITHDRAW ══ */}
        {tab === "withdraw" && (
          <div>
            {/* KYC gate */}
            {(kycNone || kycPending || showKyc) && !kycApproved ? (
              <KYCForm user={user} setUser={setUser} addToast={addToast} />
            ) : (
              <div>
                <div style={{ background: "rgba(255,69,96,0.06)", border: "1px solid rgba(255,69,96,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "var(--c2)", lineHeight: 1.6 }}>
                  ⚠️ Withdrawals processed within 24h. Minimum: <strong style={{ color: "var(--c)" }}>$11</strong>
                </div>

                {wdErrors.kyc && (
                  <div style={{ background: "rgba(255,69,96,0.1)", border: "1px solid rgba(255,69,96,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "var(--red)", fontSize: 13 }}>
                    {wdErrors.kyc}
                  </div>
                )}

                <div className="inp-group">
                  <Dropdown
                    label="Select Network"
                    value={wdNetId}
                    options={wdNetOptions}
                    onChange={(v) => { setWdNetId(v); setWdErrors((p) => ({ ...p, net: undefined })); }}
                    placeholder="Choose withdrawal network..."
                    error={wdErrors.net}
                  />
                </div>

                <div className="inp-group" style={{ marginTop: 14 }}>
                  <label className="inp-label">Amount (USDT) <span style={{ color: "var(--red)" }}>*</span></label>
                  <div className="inp-wrap">
                    <input className="inp" type="number" placeholder="Minimum $11" value={wdAmt} onChange={(e) => { setWdAmt(e.target.value); setWdErrors((p) => ({ ...p, amt: undefined })); }} style={{ paddingRight: 52, borderColor: wdErrors.amt ? "var(--red)" : "" }} />
                    <button className="inp-suffix" onClick={() => setWdAmt(user.balance.toFixed(2))}>MAX</button>
                  </div>
                  {wdErrors.amt && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{wdErrors.amt}</div>}
                </div>

                <div className="inp-group">
                  <label className="inp-label">Wallet Address <span style={{ color: "var(--red)" }}>*</span></label>
                  <input className="inp" placeholder={`Enter ${wdNet ? wdNet.name : "wallet"} address`} value={wdAddr} onChange={(e) => { setWdAddr(e.target.value); setWdErrors((p) => ({ ...p, addr: undefined })); }} style={{ borderColor: wdErrors.addr ? "var(--red)" : "" }} />
                  {wdErrors.addr && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{wdErrors.addr}</div>}
                </div>

                {wdNet && (
                  <div style={{ background: "var(--bg2)", border: "1px solid var(--b1)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                    {[
                      ["Available", "$" + user.balance.toFixed(2), "var(--c)"],
                      ["Network Fee", wdNet.fee, "var(--red)"],
                      ["Minimum", "$11", "var(--c2)"],
                    ].map(([l, v, c]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: "var(--c2)" }}>{l}</span>
                        <span style={{ fontFamily: "var(--fm)", fontWeight: 600, color: c }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button className="btn btn-red btn-block" onClick={submitWithdraw}>
                  Submit Withdrawal Request
                </button>
                <div style={{ height: 16 }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}