import { useState } from "react";
import { useStore } from "@/lib/store";
import { TIERS, getInitials } from "@/lib/data";
import Logo from "@/components/ui/Logo";

// ── Admin credentials (change for production) ─────────────
const ADMIN_EMAIL    = "admin@nextrade.com";
const ADMIN_PASSWORD = "admin123";

// ── Taken usernames list ──────────────────────────────────
const TAKEN = new Set(["admin", "nextrade", "alex", "user1", "test"]);

// ── Helper components (MUST be outside main component) ────
function EyeBtn({ show, toggle }) {
  return (
    <button
      type="button"
      onClick={toggle}
      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--c3)", cursor: "pointer", padding: 0, display: "flex" }}
    >
      {show ? (
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}

function FieldErr({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ fontSize: 11, color: "var(--red)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  MAIN AUTH PAGE
// ─────────────────────────────────────────────────────────
export default function AuthPage() {
  const { setUser, setShowAdmin, setAdminAuthed, addToast } = useStore();

  const [tab,     setTab]     = useState("login");
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  // Individual field state (prevents focus-loss bug)
  const [username,    setUsername]    = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [referral,    setReferral]    = useState("");
  const [termsAccept, setTermsAccept] = useState(false);

  const clearErr = (key) => setErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  // ── Validate ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (tab === "signup") {
      if (!username.trim())                          e.username  = "Username is required";
      else if (username.length < 3)                  e.username  = "Minimum 3 characters";
      else if (!/^[a-zA-Z0-9_]+$/.test(username))   e.username  = "Letters, numbers, underscore only";
      else if (TAKEN.has(username.toLowerCase()))    e.username  = "Username already taken";

      if (!email.trim())                             e.email     = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(email))          e.email     = "Enter a valid email";

      if (!password)                                 e.password  = "Password is required";
      else if (password.length < 8)                  e.password  = "Minimum 8 characters";

      if (!confirmPw)                                e.confirmPw = "Please confirm your password";
      else if (confirmPw !== password)               e.confirmPw = "Passwords do not match";

      if (!termsAccept)                              e.terms     = "You must accept the Terms & Conditions";
    } else {
      if (!email.trim())   e.email    = "Email is required";
      if (!password)       e.password = "Password is required";
    }
    return e;
  };

  // ── Submit ───────────────────────────────────────────────
  const submit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);

    setTimeout(() => {
      // ── Check admin credentials first (login tab only) ───
      if (tab === "login" && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setAdminAuthed(true);
        setShowAdmin(true);
        addToast("Welcome, Admin!", "ok");
        setLoading(false);
        return;
      }

      // ── Regular user login / signup ──────────────────────
      const name = tab === "signup" ? username : "Alex Morgan";
      setUser({
        id:             "user_" + Date.now(),
        username:       tab === "signup" ? username : "alexmorgan",
        name,
        email,
        phone:          tab === "signup" ? phone : "",
        avatar:         getInitials(name),
        balance:        1247.85,
        tier:           TIERS[1],
        totalProfit:    84.20,
        totalTrades:    42,
        subscribedTier: null,
        pendingTier:    null,
        kycStatus:      null,
        joinDate:       new Date().toISOString().split("T")[0],
      });
      addToast(tab === "signup" ? "Account created! Welcome 🎉" : "Welcome back!", "ok");
      setLoading(false);
    }, 800);
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  // Password strength
  const pwStrength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : password.length > 0 ? 1 : 0;
  const pwColors   = ["", "var(--red)", "var(--gold)", "var(--gold2)", "var(--green)"];
  const pwLabels   = ["", "Too weak", "Weak", "Good", "Strong"];

  return (
    <div className="auth-shell">
      {/* Logo */}
      <div style={{ padding: "44px 28px 24px", textAlign: "center" }}>
        <Logo size="lg" />
        <p style={{ color: "var(--c2)", fontSize: 13, marginTop: 10 }}>The Smart Crypto Investment Platform</p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: "0 20px 40px", maxWidth: 440, margin: "0 auto", width: "100%" }}>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--b1)", marginBottom: 24 }}>
          {["login", "signup"].map((t) => (
            <button key={t} className={`auth-tab${tab === t ? " active" : ""}`}
              onClick={() => { setTab(t); setErrors({}); }}>
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* ══ SIGNUP ══════════════════════════════════════ */}
        {tab === "signup" && (
          <>
            {/* Username */}
            <div className="inp-group">
              <label className="inp-label">Username <span style={{ color: "var(--red)" }}>*</span></label>
              <div className="inp-wrap">
                <input className="inp" placeholder="e.g. johndoe99" value={username}
                  onChange={(e) => { setUsername(e.target.value); clearErr("username"); }}
                  onKeyDown={handleKey}
                  style={{ borderColor: errors.username ? "var(--red)" : "", paddingRight: username && !errors.username ? 36 : 16 }}
                />
                {username && !errors.username && (
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--green)" }}>✓</span>
                )}
              </div>
              <FieldErr msg={errors.username} />
            </div>

            {/* Email */}
            <div className="inp-group">
              <label className="inp-label">Email Address <span style={{ color: "var(--red)" }}>*</span></label>
              <input className="inp" type="email" placeholder="you@email.com" value={email}
                onChange={(e) => { setEmail(e.target.value); clearErr("email"); }}
                onKeyDown={handleKey}
                style={{ borderColor: errors.email ? "var(--red)" : "" }}
              />
              <FieldErr msg={errors.email} />
            </div>

            {/* Phone */}
            <div className="inp-group">
              <label className="inp-label">Phone Number <span style={{ color: "var(--c3)", fontSize: 10, marginLeft: 4 }}>(optional)</span></label>
              <input className="inp" type="tel" placeholder="+1-555-0000" value={phone}
                onChange={(e) => setPhone(e.target.value)} onKeyDown={handleKey} />
            </div>

            {/* Password */}
            <div className="inp-group">
              <label className="inp-label">Create Password <span style={{ color: "var(--red)" }}>*</span></label>
              <div className="inp-wrap">
                <input className="inp" type={showPw ? "text" : "password"} placeholder="Min. 8 characters" value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErr("password"); }}
                  onKeyDown={handleKey}
                  style={{ borderColor: errors.password ? "var(--red)" : "", paddingRight: 44 }}
                />
                <EyeBtn show={showPw} toggle={() => setShowPw((p) => !p)} />
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                    {[1,2,3,4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength ? pwColors[pwStrength] : "var(--b2)", transition: "all 0.3s" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</div>
                </div>
              )}
              <FieldErr msg={errors.password} />
            </div>

            {/* Confirm password */}
            <div className="inp-group">
              <label className="inp-label">Confirm Password <span style={{ color: "var(--red)" }}>*</span></label>
              <div className="inp-wrap">
                <input className="inp" type={showCpw ? "text" : "password"} placeholder="Repeat your password" value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); clearErr("confirmPw"); }}
                  onKeyDown={handleKey}
                  style={{ borderColor: errors.confirmPw ? "var(--red)" : confirmPw && confirmPw === password ? "var(--green)" : "", paddingRight: 44 }}
                />
                <EyeBtn show={showCpw} toggle={() => setShowCpw((p) => !p)} />
              </div>
              <FieldErr msg={errors.confirmPw} />
            </div>

            {/* Referral */}
            <div className="inp-group">
              <label className="inp-label">Referral Code <span style={{ color: "var(--c3)", fontSize: 10, marginLeft: 4 }}>(optional)</span></label>
              <input className="inp" placeholder="Enter referral code if you have one" value={referral}
                onChange={(e) => setReferral(e.target.value)} onKeyDown={handleKey} />
            </div>

            {/* Terms */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}
                onClick={() => { setTermsAccept((p) => !p); clearErr("terms"); }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2,
                  border: `2px solid ${errors.terms ? "var(--red)" : termsAccept ? "var(--gold)" : "var(--b2)"}`,
                  background: termsAccept ? "var(--gold)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                }}>
                  {termsAccept && (
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 13, color: "var(--c2)", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <span style={{ color: "var(--gold)", fontWeight: 600 }}>Terms & Conditions</span>
                  {" "}and{" "}
                  <span style={{ color: "var(--gold)", fontWeight: 600 }}>Privacy Policy</span>
                </span>
              </div>
              <FieldErr msg={errors.terms} />
            </div>
          </>
        )}

        {/* ══ LOGIN ═══════════════════════════════════════ */}
        {tab === "login" && (
          <>
            <div className="inp-group">
              <label className="inp-label">Email Address <span style={{ color: "var(--red)" }}>*</span></label>
              <input className="inp" type="email" placeholder="you@email.com" value={email}
                onChange={(e) => { setEmail(e.target.value); clearErr("email"); }}
                onKeyDown={handleKey}
                style={{ borderColor: errors.email ? "var(--red)" : "" }}
                autoComplete="email"
              />
              <FieldErr msg={errors.email} />
            </div>

            <div className="inp-group">
              <label className="inp-label">Password <span style={{ color: "var(--red)" }}>*</span></label>
              <div className="inp-wrap">
                <input className="inp" type={showPw ? "text" : "password"} placeholder="Your password" value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErr("password"); }}
                  onKeyDown={handleKey}
                  style={{ borderColor: errors.password ? "var(--red)" : "", paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <EyeBtn show={showPw} toggle={() => setShowPw((p) => !p)} />
              </div>
              <FieldErr msg={errors.password} />
            </div>

            <div style={{ textAlign: "right", marginTop: -8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "var(--gold)", cursor: "pointer" }}>Forgot password?</span>
            </div>

            {/* Demo hint */}
            <div style={{ background: "rgba(0,198,255,0.05)", border: "1px solid rgba(0,198,255,0.12)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "var(--fm)", fontWeight: 700, marginBottom: 4 }}>DEMO CREDENTIALS</div>
              <div style={{ fontSize: 11, color: "var(--c2)", fontFamily: "var(--fm)", lineHeight: 1.7 }}>
                User: any email / any password<br />
                Admin: admin@nextrade.com / admin123
              </div>
            </div>
          </>
        )}

        {/* General error */}
        {errors.general && (
          <div style={{ background: "rgba(255,69,96,0.1)", border: "1px solid rgba(255,69,96,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "var(--red)", fontSize: 13 }}>
            {errors.general}
          </div>
        )}

        {/* Submit */}
        <button className="btn btn-gold btn-block btn-lg" onClick={submit} disabled={loading} style={{ marginBottom: 14 }}>
          {loading ? <span className="spin" /> : tab === "login" ? "Log In" : "Create Account"}
        </button>

        {/* Switch tab */}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--c2)" }}>
          {tab === "login" ? (
            <>Don&apos;t have an account?{" "}
              <span style={{ color: "var(--gold)", cursor: "pointer", fontWeight: 700 }}
                onClick={() => { setTab("signup"); setErrors({}); }}>Sign Up</span>
            </>
          ) : (
            <>Already have an account?{" "}
              <span style={{ color: "var(--gold)", cursor: "pointer", fontWeight: 700 }}
                onClick={() => { setTab("login"); setErrors({}); }}>Log In</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}