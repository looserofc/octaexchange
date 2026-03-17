import { useState } from "react";
import { useStore } from "@/lib/store";
import { TIERS } from "@/lib/data";
// ─────────────────────────────────────────────────────────
//  SUB-SCREENS (defined outside to prevent re-mount)
// ─────────────────────────────────────────────────────────

function BackHeader({ onBack, title, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <button onClick={onBack} style={{ color: "var(--c2)", display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>
      <span style={{ fontWeight: 800, fontSize: 16 }}>{title}</span>
      {badge}
    </div>
  );
}

// ── KYC Verification ─────────────────────────────────────
function KYCScreen({ user, setUser, addToast, onBack }) {
  const [fullName,   setFullName]   = useState(user.name || "");
  const [address,    setAddress]    = useState("");
  const [phoneNum,   setPhoneNum]   = useState(user.phone || "");
  const [cnicFront,  setCnicFront]  = useState("");
  const [cnicBack,   setCnicBack]   = useState("");
  const [errors,     setErrors]     = useState({});

  const clearErr = (k) => setErrors((p) => { const n={...p}; delete n[k]; return n; });

  const submit = () => {
    const e = {};
    if (!fullName.trim())  e.fullName  = "Full name is required";
    if (!address.trim())   e.address   = "Home address is required";
    if (!phoneNum.trim())  e.phoneNum  = "Phone number is required";
    if (!cnicFront)        e.cnicFront = "CNIC front photo is required";
    if (!cnicBack)         e.cnicBack  = "CNIC back photo is required";
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setUser({ ...user, kycStatus: "pending", kycData: { fullName, address, phoneNum, cnicFront, cnicBack } });
    addToast("KYC submitted — admin will review within 24h", "info");
    onBack();
  };

  // Already submitted
  if (user.kycStatus === "pending" || user.kycStatus === "approved") {
    return (
      <div>
        <BackHeader onBack={onBack} title="KYC Verification" />
        <div style={{ background: user.kycStatus === "approved" ? "rgba(0,214,143,0.08)" : "rgba(245,166,35,0.08)", border: `1px solid ${user.kycStatus === "approved" ? "rgba(0,214,143,0.2)" : "rgba(245,166,35,0.2)"}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>{user.kycStatus === "approved" ? "✅" : "⏳"}</div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>
            {user.kycStatus === "approved" ? "KYC Approved!" : "KYC Under Review"}
          </div>
          <div style={{ fontSize: 13, color: "var(--c2)", lineHeight: 1.7, marginBottom: 18 }}>
            {user.kycStatus === "approved"
              ? "Your identity has been verified. You can now withdraw funds."
              : "Your documents are being reviewed. You will be notified once approved."}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: user.kycStatus === "approved" ? "rgba(0,214,143,0.1)" : "rgba(245,166,35,0.1)", border: `1px solid ${user.kycStatus === "approved" ? "rgba(0,214,143,0.2)" : "rgba(245,166,35,0.2)"}`, borderRadius: 20, padding: "8px 16px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: user.kycStatus === "approved" ? "var(--green)" : "var(--gold)", display: "inline-block", animation: user.kycStatus === "pending" ? "blink 1.5s infinite" : "none" }} />
            <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "var(--fm)", color: user.kycStatus === "approved" ? "var(--green)" : "var(--gold)" }}>
              {user.kycStatus === "approved" ? "VERIFIED" : "PENDING APPROVAL"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const FInput = ({ id, label, value, onChange, placeholder, type = "text", required, err }) => (
    <div className="inp-group">
      <label className="inp-label">{label}{required && <span style={{ color: "var(--red)", marginLeft: 3 }}>*</span>}</label>
      <input className="inp" type={type} placeholder={placeholder} value={value}
        onChange={(e) => { onChange(e.target.value); clearErr(id); }}
        style={{ borderColor: err ? "var(--red)" : "" }}
      />
      {err && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{err}</div>}
    </div>
  );

  const FileBtn = ({ id, label, value, onChange, err }) => (
    <div className="inp-group">
      <label className="inp-label">{label}<span style={{ color: "var(--red)", marginLeft: 3 }}>*</span></label>
      <label style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        background: "var(--bg2)", border: `1.5px dashed ${err ? "var(--red)" : value ? "var(--green)" : "var(--b2)"}`,
        borderRadius: "var(--r2)", padding: "18px 16px", cursor: "pointer", transition: "border-color 0.2s",
        color: value ? "var(--green)" : "var(--c3)", fontSize: 13, fontWeight: 600,
      }}>
        <input type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => { if (e.target.files?.[0]) { onChange(e.target.files[0].name); clearErr(id); } }}
        />
        {value ? <><span style={{ fontSize: 18 }}>✓</span>{value}</> : <><span style={{ fontSize: 20 }}>📷</span>Tap to upload photo</>}
      </label>
      {err && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5 }}>{err}</div>}
    </div>
  );

  return (
    <div>
      <BackHeader onBack={onBack} title="KYC Verification" />
      <div style={{ background: "rgba(255,69,96,0.06)", border: "1px solid rgba(255,69,96,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "var(--c2)", lineHeight: 1.6 }}>
        🔒 Required for withdrawals. Your data is kept secure and private.
      </div>
      <FInput id="fullName"  label="Full Name"     value={fullName}  onChange={setFullName}  placeholder="As on CNIC"           required err={errors.fullName} />
      <FInput id="address"   label="Home Address"  value={address}   onChange={setAddress}   placeholder="Street, City, Country" required err={errors.address} />
      <FInput id="phoneNum"  label="Phone Number"  value={phoneNum}  onChange={setPhoneNum}  placeholder="+92-300-0000000" type="tel" required err={errors.phoneNum} />
      <FileBtn id="cnicFront" label="CNIC Front Photo" value={cnicFront} onChange={setCnicFront} err={errors.cnicFront} />
      <FileBtn id="cnicBack"  label="CNIC Back Photo"  value={cnicBack}  onChange={setCnicBack}  err={errors.cnicBack} />
      <button className="btn btn-gold btn-block" style={{ marginTop: 4 }} onClick={submit}>
        Submit KYC Documents
      </button>
      <div style={{ height: 8 }} />
    </div>
  );
}

// ── Push Notifications ─────────────────────────────────────
function PushNotifScreen({ onBack }) {
  const [s, setS] = useState({ signalCodes: true, tradeComplete: true, deposits: true, withdrawals: true, system: false });
  const toggle = (k) => setS((p) => ({ ...p, [k]: !p[k] }));
  const items = [
    { id: "signalCodes",    label: "Signal Code Alerts",    sub: "New trade code from admin" },
    { id: "tradeComplete",  label: "Trade Completed",       sub: "When your trade finishes" },
    { id: "deposits",       label: "Deposit Updates",       sub: "Approval / rejection" },
    { id: "withdrawals",    label: "Withdrawal Updates",    sub: "When payment is sent" },
    { id: "system",         label: "System Announcements",  sub: "Maintenance & updates" },
  ];
  return (
    <div>
      <BackHeader onBack={onBack} title="Push Notifications" />
      <div className="card" style={{ padding: "0 16px" }}>
        {items.map(({ id, label, sub }, i) => (
          <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < items.length - 1 ? "1px solid var(--b1)" : "none" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--c3)", marginTop: 2 }}>{sub}</div>
            </div>
            <div onClick={() => toggle(id)} style={{ width: 46, height: 26, borderRadius: 13, cursor: "pointer", background: s[id] ? "var(--gold)" : "var(--b2)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: s[id] ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2FA ───────────────────────────────────────────────────
function TwoFAScreen({ onBack }) {
  const [enabled, setEnabled] = useState(false);
  const [step,    setStep]    = useState(1);
  const [otp,     setOtp]     = useState("");
  const [otpErr,  setOtpErr]  = useState("");

  const verify = () => {
    if (otp !== "123456") { setOtpErr("Invalid code. (Demo: 123456)"); return; }
    setEnabled(true); setStep(3);
  };

  return (
    <div>
      <BackHeader onBack={onBack} title="Two-Factor Auth" badge={<span className={`badge ${enabled ? "badge-up" : "badge-dim"}`} style={{ marginLeft: "auto" }}>{enabled ? "ENABLED" : "DISABLED"}</span>} />
      {!enabled && step === 1 && (
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🔐</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Enable 2FA</div>
          <div style={{ fontSize: 13, color: "var(--c2)", lineHeight: 1.7, marginBottom: 18 }}>Add extra security with Google Authenticator or any TOTP app.</div>
          <button className="btn btn-gold btn-block" onClick={() => setStep(2)}>Set Up 2FA</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Step 1 — Scan QR Code</div>
            <div style={{ width: 160, height: 160, background: "var(--bg2)", border: "1px solid var(--b2)", borderRadius: 12, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--c3)", textAlign: "center" }}>
              📱 QR Code<br />(link to TOTP app)
            </div>
            <div style={{ fontSize: 12, color: "var(--c2)", textAlign: "center" }}>
              Manual key: <code style={{ fontFamily: "var(--fm)", color: "var(--gold)", letterSpacing: 2 }}>JBSWY3DPEHPK3PXP</code>
            </div>
          </div>
          <div className="inp-group">
            <label className="inp-label">Step 2 — Enter 6-Digit Code</label>
            <input className="inp inp-mono" placeholder="000000" maxLength={6} value={otp}
              onChange={(e) => { setOtp(e.target.value); setOtpErr(""); }}
              style={{ textAlign: "center", fontSize: 24, letterSpacing: 8, borderColor: otpErr ? "var(--red)" : "" }}
            />
            {otpErr && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5, textAlign: "center" }}>{otpErr}</div>}
            <div style={{ fontSize: 11, color: "var(--c3)", marginTop: 5, textAlign: "center" }}>Demo code: 123456</div>
          </div>
          <button className="btn btn-gold btn-block" onClick={verify} disabled={otp.length < 6}>Verify & Enable</button>
        </div>
      )}
      {step === 3 && (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>2FA Enabled!</div>
          <div style={{ fontSize: 13, color: "var(--c2)" }}>Your account is now protected with two-factor authentication.</div>
        </div>
      )}
    </div>
  );
}

// ── Live Support ──────────────────────────────────────────
function SupportScreen({ onBack }) {
  const [msgs, setMsgs] = useState([{ from: "support", text: "👋 Hello! How can we help you today?", time: "now" }]);
  const [msg,  setMsg]  = useState("");
  const [busy, setBusy] = useState(false);
  const REPLIES = [
    "Thanks for reaching out! Our team will assist you shortly.",
    "For urgent issues please contact admin via the WhatsApp group.",
    "Your request has been noted. We typically respond within 2 hours.",
    "For deposit/withdrawal status, please check the Assets page.",
  ];
  const send = () => {
    if (!msg.trim()) return;
    setMsgs((p) => [...p, { from: "user", text: msg, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    setMsg(""); setBusy(true);
    setTimeout(() => {
      setMsgs((p) => [...p, { from: "support", text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
      setBusy(false);
    }, 1200);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <BackHeader onBack={onBack} title="Live Support" badge={<span className="badge badge-up" style={{ marginLeft: "auto", fontSize: 10 }}>● Online</span>} />
      <div style={{ background: "var(--bg2)", borderRadius: 14, padding: 14, marginBottom: 12, minHeight: 220, maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 12, fontSize: 13, background: m.from === "user" ? "var(--gold)" : "var(--card2)", color: m.from === "user" ? "#000" : "var(--c)", borderBottomRightRadius: m.from === "user" ? 4 : 12, borderBottomLeftRadius: m.from !== "user" ? 4 : 12 }}>
              {m.text}
              <div style={{ fontSize: 10, color: m.from === "user" ? "rgba(0,0,0,0.4)" : "var(--c3)", marginTop: 4, textAlign: "right" }}>{m.time}</div>
            </div>
          </div>
        ))}
        {busy && <div style={{ display: "flex", justifyContent: "flex-start" }}><div style={{ background: "var(--card2)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "var(--c3)" }}>typing...</div></div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="inp" placeholder="Type your message..." value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{ flex: 1, padding: "11px 14px" }}
        />
        <button className="btn btn-gold" style={{ padding: "11px 18px", flexShrink: 0 }} onClick={send} disabled={!msg.trim()}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── Help Center ───────────────────────────────────────────
function HelpScreen({ onBack }) {
  const [open, setOpen] = useState(null);
  const FAQS = [
    ["How do I start trading?", "Go to Trade page, enter a signal code received from admin via WhatsApp/Telegram, click Submit. Trade runs 5 minutes and profit is credited automatically."],
    ["How are signal codes distributed?", "Codes are generated by admin and shared exclusively through official WhatsApp/Telegram groups. Each code is single-use per account."],
    ["When is my profit added?", "Profit is credited automatically when the 5-minute trade timer completes."],
    ["How do I deposit funds?", "Go to Assets → Deposit, select your tier, choose network, send USDT to the address, paste your transaction hash and submit."],
    ["How long do deposits take?", "Typically 1–2 hours after admin reviews your transaction hash."],
    ["What is KYC and why is it needed?", "KYC (Know Your Customer) is required for withdrawals. Submit your name, address, phone, and CNIC photos. Admin reviews within 24 hours."],
    ["Minimum withdrawal amount?", "Minimum is $11 USDT. KYC must be approved before you can withdraw."],
    ["What is the signal code validity?", "Each code is valid for 1 hour from when admin generates it."],
    ["Can I change my tier?", "Once subscribed, contact support to upgrade. Tier changes require admin approval."],
    ["How do I contact support?", "Use Live Support chat in Profile, or reach admin via the official WhatsApp group."],
  ];
  return (
    <div>
      <BackHeader onBack={onBack} title="Help Center" />
      <div style={{ fontSize: 12, color: "var(--c2)", marginBottom: 14, fontWeight: 700, letterSpacing: "0.5px" }}>FREQUENTLY ASKED QUESTIONS</div>
      {FAQS.map(([q, a], i) => (
        <div key={i} style={{ background: "var(--card)", border: "1px solid var(--b1)", borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--fn)", fontSize: 13, fontWeight: 700, color: open === i ? "var(--gold)" : "var(--c)", textAlign: "left", gap: 8 }}>
            <span>{q}</span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {open === i && <div style={{ padding: "2px 16px 14px", fontSize: 13, color: "var(--c2)", lineHeight: 1.7, borderTop: "1px solid var(--b1)" }}>{a}</div>}
        </div>
      ))}
      <div style={{ height: 8 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  MAIN PROFILE PAGE
// ─────────────────────────────────────────────────────────
export default function ProfilePage({ onSecretTap }) {
  const { user, setUser, logout, notifs, markNotifRead, markAllRead, addToast, setShowAdmin, profileTab, setProfileTab } = useStore();
  const [tab,    setTabLocal]  = useState(profileTab || "account");
  const [screen, setScreen]    = useState(null);
  const unread = notifs.filter((n) => !n.read).length;

  const setTab = (t) => { setTabLocal(t); setProfileTab(t); };

  const SCREENS = { kyc: KYCScreen, push: PushNotifScreen, "2fa": TwoFAScreen, support: SupportScreen, help: HelpScreen };
  if (screen) {
    const Comp = SCREENS[screen];
    return (
      <div style={{ padding: 16 }}>
        <Comp user={user} setUser={setUser} addToast={addToast} onBack={() => setScreen(null)} />
      </div>
    );
  }

  return (
    <div>
      <div className="hdr">
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px" }}>Profile</span>
        {unread > 0 && <span className="badge badge-dn" style={{ marginLeft: "auto" }}>{unread} new</span>}
      </div>

      {/* User strip */}
      <div style={{ padding: "18px 16px", borderBottom: "1px solid var(--b1)", display: "flex", alignItems: "center", gap: 14 }}>
        <div onClick={onSecretTap} style={{ width: 58, height: 58, borderRadius: 18, flexShrink: 0, background: "linear-gradient(135deg,var(--gold),#e0880a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: 20, boxShadow: "0 6px 20px rgba(245,166,35,0.25)", userSelect: "none", cursor: "default" }}>
          {user.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
          <div style={{ fontSize: 12, color: "var(--c2)", marginTop: 2, fontFamily: "var(--fm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <span className="badge badge-gold">{user.tier.name} Member</span>
            {user.kycStatus === "approved" && <span className="badge badge-up" style={{ fontSize: 10 }}>KYC ✓</span>}
            {user.kycStatus === "pending"  && <span className="badge badge-gold" style={{ fontSize: 10 }}>KYC Pending</span>}
          </div>
        </div>
        <button onClick={logout} style={{ color: "var(--c3)", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>Sign Out</button>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div className="seg" style={{ margin: "14px 0" }}>
          {[
            { id: "account", label: "Account" },
            { id: "tiers",   label: "Tiers" },
            { id: "notifs",  label: unread > 0 ? `Notifs (${unread})` : "Notifs" },
          ].map((t) => (
            <button key={t.id} className={`seg-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ══ ACCOUNT ══ */}
        {tab === "account" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "BALANCE",      value: "$" + user.balance.toFixed(2),      color: "var(--gold)" },
                { label: "TOTAL PROFIT", value: "+$" + user.totalProfit.toFixed(2), color: "var(--green)" },
                { label: "TOTAL TRADES", value: String(user.totalTrades),           color: "var(--cyan)" },
                { label: "PROFIT/TRADE", value: "+$" + user.tier.profit,            color: "var(--c)" },
              ].map((item) => (
                <div key={item.label} className="admin-stat">
                  <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", marginBottom: 6, letterSpacing: "0.8px" }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "var(--fm)", color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "0 16px", marginBottom: 14 }}>
              {[
                { icon: "🔔", label: "Push Notifications", sub: "Manage signal alerts",                                                            id: "push" },
                { icon: "🔒", label: "Two-Factor Auth",    sub: "Secure your account",                                                             id: "2fa" },
                { icon: "📋", label: "KYC Verification",   sub: user.kycStatus === "approved" ? "Verified ✓" : user.kycStatus === "pending" ? "Under review..." : "Tap to submit", id: "kyc" },
                { icon: "💬", label: "Live Support",       sub: "Chat with our team",                                                              id: "support" },
                { icon: "❓", label: "Help Center",        sub: "FAQs & guides",                                                                   id: "help" },
                // { icon: "🛡️", label: "Admin Panel",        sub: "Admin access only",                                                               id: "admin" },
              ].map(({ icon, label, sub, id }, i, arr) => (
                <div key={id} onClick={() => id === "admin" ? setShowAdmin(true) : setScreen(id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--b1)" : "none", cursor: "pointer" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                    <div style={{ fontSize: 11, color: "var(--c3)", marginTop: 1 }}>{sub}</div>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--c3)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>

            <button className="btn btn-ghost btn-block" onClick={logout} style={{ color: "var(--red)", border: "1px solid rgba(255,69,96,0.2)", marginBottom: 16 }}>
              Sign Out
            </button>
          </div>
        )}

        {/* ══ TIERS ══ */}
        {tab === "tiers" && (
          <div>
            <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, fontSize: 13, color: "var(--c2)", lineHeight: 1.7 }}>
              💡 Tier Price × 1% = your profit per signal trade.
            </div>
            {TIERS.map((tier) => {
              const active = user.tier.id === tier.id;
              return (
                <div key={tier.id} style={{ background: active ? `linear-gradient(135deg,${tier.color}14,${tier.color}06)` : "var(--card)", border: `1.5px solid ${active ? tier.color : "var(--b1)"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: tier.color, fontFamily: "var(--fm)" }}>{tier.name}</div>
                    <div style={{ fontSize: 12, color: "var(--c2)", marginTop: 2 }}>Investment: ${tier.price} USDT</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "var(--green)", fontFamily: "var(--fm)" }}>${tier.profit}</div>
                      <div style={{ fontSize: 10, color: "var(--c3)" }}>per signal</div>
                    </div>
                    {active && <span className="badge badge-gold" style={{ fontSize: 10 }}>ACTIVE</span>}
                  </div>
                </div>
              );
            })}
            <div style={{ height: 8 }} />
          </div>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        {tab === "notifs" && (
          <div>
            {unread > 0 && <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={markAllRead}>Mark all as read</button>}
            {notifs.length === 0 ? (
              <div className="empty"><div className="empty-icon">🔔</div><p>No notifications</p></div>
            ) : (
              notifs.map((n) => (
                <div key={n.id} onClick={() => markNotifRead(n.id)} style={{ background: n.read ? "var(--card)" : "rgba(245,166,35,0.05)", border: `1px solid ${n.read ? "var(--b1)" : "rgba(245,166,35,0.2)"}`, borderRadius: 14, padding: 14, marginBottom: 8, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                    <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)" }}>{n.time}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--c2)" }}>{n.body}</div>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", marginTop: 8 }} />}
                </div>
              ))
            )}
            <div style={{ height: 8 }} />
          </div>
        )}
      </div>
    </div>
  );
}