// src/components/pages/KycPage.js
import { useState, useRef } from "react";
import { useStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Photo upload box with drag-drop and preview ───────────
function PhotoUploader({ label, onChange }) {
  const inputRef   = useRef();
  const [preview,  setPreview]  = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp","image/jpg"].includes(file.type)) {
      alert("Only JPEG or PNG images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    setFileName(file.name);
    onChange(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null); setFileName(""); onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="fg">
      <label className="lbl">{label} <span style={{color:"var(--dn)"}}>*</span></label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
        style={{
          border: `2px dashed ${dragOver ? "var(--gold)" : preview ? "var(--up)" : "var(--ln2)"}`,
          borderRadius: 14, padding: 16, cursor: "pointer", textAlign: "center",
          background: dragOver ? "rgba(240,165,0,.06)" : preview ? "rgba(0,200,150,.04)" : "var(--ink3)",
          transition: "all .2s", minHeight: 100,
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFile(e.target.files?.[0])}
          style={{ display: "none" }}
        />
        {preview ? (
          <div style={{ width: "100%", position: "relative" }}>
            <img src={preview} alt={label} style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, display: "block" }}/>
            <button onClick={clear} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,.7)", color: "#fff", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--up)", fontWeight: 600 }}>✓ {fileName} — ready to upload</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600, marginBottom: 4 }}>Tap to upload {label}</div>
            <div style={{ fontSize: 11, color: "var(--t3)" }}>JPEG or PNG · Max 5MB</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KycPage({ onBack }) {
  const { user, setUser, addToast } = useStore();

  // ── FIX: uncontrolled refs — no re-render on keystroke ───
  // Root cause of "type 1 letter at a time" bug:
  //   value={state} + onChange={setState} → setState → parent re-renders
  //   → input unmounts/remounts → focus lost after every keypress.
  // Fix: useRef + defaultValue. React never touches the DOM value.
  // Values are collected only once, at submit time.
  const nameRef    = useRef();
  const addressRef = useRef();
  const phoneRef   = useRef();

  const [front, setFront] = useState(null);
  const [back,  setBack]  = useState(null);
  const [busy,  setBusy]  = useState(false);
  const [errMsg,setErrMsg]= useState("");

  const uid = user?.uid || ("OCT" + (user?.id || "").slice(-6).toUpperCase());
  const kycStatus = user?.kycStatus;

  const submit = async () => {
    setErrMsg("");

    // Read uncontrolled inputs only at submit time
    const fullName = nameRef.current?.value?.trim()    || "";
    const address  = addressRef.current?.value?.trim() || "";
    const phone    = phoneRef.current?.value?.trim()   || "";

    if (!fullName) { setErrMsg("Full name is required"); return; }
    if (!address)  { setErrMsg("Home address is required"); return; }
    if (!front)    { setErrMsg("CNIC front photo is required"); return; }
    if (!back)     { setErrMsg("CNIC back photo is required"); return; }

    setBusy(true);
    try {
      let token = useStore.getState()._token;
      if (!token) {
        const rr = await fetch(`${API}/auth/refresh`, { method: "POST", credentials: "include" });
        if (rr.ok) {
          const rd = await rr.json();
          token = rd.data?.accessToken || rd.accessToken;
          useStore.getState().setToken(token);
        }
      }

      const fd = new FormData();
      fd.append("fullName",    fullName);
      fd.append("homeAddress", address);
      fd.append("phone",       phone);
      // Field names match multer fields in kyc_otp.routes.js
      fd.append("cnicFront",   front, front.name || "cnic_front.jpg");
      fd.append("cnicBack",    back,  back.name  || "cnic_back.jpg");

      const res = await fetch(`${API}/kyc/submit`, {
        method: "POST",
        // Do NOT set Content-Type — browser sets multipart boundary automatically
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setUser({ ...user, kycStatus: "pending" });
        addToast("KYC submitted! Under review within 24 hours ✅", "ok");
      } else {
        setErrMsg(data.message || "Failed to submit KYC. Please try again.");
      }
    } catch (_) {
      setErrMsg("Network error — check your connection and try again.");
    }
    setBusy(false);
  };

  // ── Already submitted / approved ─────────────────────────
  if (kycStatus === "approved" || kycStatus === "pending") {
    return (
      <div style={{ padding: "0 16px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", padding: 0 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontWeight: 800, fontSize: 17 }}>KYC Verification</span>
        </div>
        <div style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {kycStatus === "approved" ? "✅" : "⏳"}
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
            {kycStatus === "approved" ? "KYC Approved!" : "Under Review"}
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 8 }}>
            {kycStatus === "approved"
              ? "Your identity is verified. You can now deposit and withdraw freely."
              : "Your documents are under review. Usually takes less than 24 hours."}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--m)" }}>UID: {uid}</div>
        </div>
      </div>
    );
  }

  // ── Rejected — allow resubmission ────────────────────────
  if (kycStatus === "rejected") {
    return (
      <div style={{ padding: "0 16px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", padding: 0 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontWeight: 800, fontSize: 17 }}>KYC Verification</span>
        </div>
        <div style={{ background: "rgba(255,59,92,.08)", border: "1px solid rgba(255,59,92,.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "var(--dn)", lineHeight: 1.6 }}>
          ❌ Your previous KYC submission was rejected. Please re-submit with clear, valid documents.
        </div>
        <button className="btn btn-gold btn-block" onClick={() => setUser({ ...user, kycStatus: null })}>
          Re-submit KYC Documents
        </button>
      </div>
    );
  }

  // ── Submission form ───────────────────────────────────────
  return (
    <div style={{ padding: "0 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", padding: 0 }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ fontWeight: 800, fontSize: 17 }}>KYC Verification</span>
      </div>

      {/* UID */}
      <div style={{ background: "rgba(240,165,0,.08)", border: "1px solid rgba(240,165,0,.2)", borderRadius: 12, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: "var(--t3)", fontFamily: "var(--m)", marginBottom: 2, letterSpacing: 1.5 }}>YOUR UNIQUE ID</div>
          <div style={{ fontFamily: "var(--m)", fontSize: 16, fontWeight: 900, color: "var(--gold)", letterSpacing: 3 }}>{uid}</div>
        </div>
        <button onClick={() => { navigator.clipboard?.writeText(uid); addToast("UID copied!", "ok"); }}
          style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(240,165,0,.3)", background: "rgba(240,165,0,.08)", color: "var(--gold)", cursor: "pointer", fontWeight: 600 }}>
          Copy
        </button>
      </div>

      <div style={{ background: "rgba(255,59,92,.06)", border: "1px solid rgba(255,59,92,.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 20, fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
        🔒 Required for deposits &amp; withdrawals. Documents kept strictly confidential.
      </div>

      {errMsg && (
        <div style={{ background: "rgba(255,59,92,.1)", border: "1px solid rgba(255,59,92,.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, color: "var(--dn)", fontSize: 13 }}>
          ⚠️ {errMsg}
        </div>
      )}

      {/* Full Name — uncontrolled, defaultValue pre-fills from store */}
      <div className="fg">
        <label className="lbl">Full Name <span style={{ color: "var(--dn)" }}>*</span></label>
        <input
          ref={nameRef}
          className="inp"
          placeholder="As on your CNIC / ID"
          defaultValue={user?.name || ""}
        />
      </div>

      {/* Home Address — uncontrolled */}
      <div className="fg">
        <label className="lbl">Home Address <span style={{ color: "var(--dn)" }}>*</span></label>
        <input
          ref={addressRef}
          className="inp"
          placeholder="Street, City, Country"
          defaultValue=""
        />
      </div>

      {/* Phone — uncontrolled */}
      <div className="fg">
        <label className="lbl">Phone Number <span style={{ color: "var(--t3)", fontSize: 10 }}>(optional)</span></label>
        <input
          ref={phoneRef}
          className="inp"
          type="tel"
          placeholder="+92-300-0000000"
          defaultValue={user?.phone || ""}
        />
      </div>

      <PhotoUploader label="CNIC Front Photo" onChange={setFront} />
      <PhotoUploader label="CNIC Back Photo"  onChange={setBack} />

      <button className="btn btn-gold btn-block" onClick={submit} disabled={busy} style={{ marginTop: 8, fontSize: 15 }}>
        {busy ? <><span className="spin" /> Uploading...</> : "Submit KYC Documents"}
      </button>
    </div>
  );
}