import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/router";
import Logo from "@/components/ui/Logo";

function Er({ msg }) {
  if (!msg) return null;
  return <div style={{fontSize:11,color:"var(--dn)",marginTop:5,display:"flex",alignItems:"center",gap:4}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{msg}</div>;
}

export default function ForgotPasswordPage() {
  const { forgotPassword, verifyResetOtp, resetPassword, addToast } = useStore();
  const router = useRouter();

  const [step, setStep]     = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail]   = useState("");
  const [otp, setOtp]       = useState("");
  const [newPw, setNewPw]   = useState("");
  const [confPw, setConfPw] = useState("");
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState("");
  const [showPw, setShowPw] = useState(false);

  // Step 1 — Send OTP
  const sendOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setErr("Valid email required"); return; }
    setBusy(true); setErr("");
    const result = await forgotPassword(email.trim());
    setBusy(false);
    if (result.success) {
      addToast("OTP sent to your email", "ok");
      setStep(2);
    } else {
      setErr(result.message || "Failed to send OTP");
    }
  };

  // Step 2 — Verify OTP
  const verify = async () => {
    if (!otp.trim() || otp.length !== 6) { setErr("Enter the 6-digit OTP"); return; }
    setBusy(true); setErr("");
    const result = await verifyResetOtp(email.trim(), otp.trim());
    setBusy(false);
    if (result.success) {
      setStep(3);
    } else {
      setErr(result.message || "Invalid or expired OTP");
    }
  };

  // Step 3 — Reset password
  const reset = async () => {
    if (!newPw || newPw.length < 8) { setErr("Password must be at least 8 characters"); return; }
    if (!/[A-Z]/.test(newPw))       { setErr("Must contain at least one uppercase letter"); return; }
    if (!/[0-9]/.test(newPw))       { setErr("Must contain at least one number"); return; }
    if (newPw !== confPw)           { setErr("Passwords don't match"); return; }
    setBusy(true); setErr("");
    const result = await resetPassword(email.trim(), otp.trim(), newPw);
    setBusy(false);
    if (result.success) {
      router.push("/");
    } else {
      setErr(result.message || "Failed to reset password");
    }
  };

  const K = (e, fn) => { if (e.key === "Enter") fn(); };

  return (
    <div className="auth-shell">
      <div style={{padding:"44px 28px 24px",textAlign:"center"}}>
        <Logo size="lg"/>
        <p style={{color:"var(--t2)",fontSize:13,marginTop:10}}>Reset your password</p>
      </div>

      <div style={{flex:1,padding:"0 20px 40px",maxWidth:440,margin:"0 auto",width:"100%"}}>
        {/* Step indicator */}
        <div style={{display:"flex",alignItems:"center",marginBottom:28}}>
          {["Email","Verify OTP","New Password"].map((s,i)=>{
            const n=i+1, active=step===n, done=step>n;
            return (
              <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flex:1}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:done?"var(--up)":active?"var(--gold)":"var(--ln2)",color:done||active?"#000":"var(--t3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,transition:"all .3s"}}>
                    {done?"✓":n}
                  </div>
                  <div style={{fontSize:10,color:active?"var(--gold)":done?"var(--up)":"var(--t3)",fontWeight:active?700:400,whiteSpace:"nowrap"}}>{s}</div>
                </div>
                {i<2&&<div style={{height:1,flex:1,background:done?"var(--up)":"var(--ln2)",margin:"0 6px",marginBottom:20,transition:"background .3s"}}/>}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Email */}
        {step===1&&(
          <>
            <div style={{marginBottom:8,fontSize:14,color:"var(--t2)",lineHeight:1.6}}>Enter your registered email. We&apos;ll send you a 6-digit verification code.</div>
            <div className="fg">
              <label className="lbl">Email Address <span style={{color:"var(--dn)"}}>*</span></label>
              <input className="inp" type="email" placeholder="you@email.com" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>K(e,sendOtp)} autoFocus/>
            </div>
            {err && <Er msg={err}/>}
            <button className="btn btn-gold btn-block btn-lg" onClick={sendOtp} disabled={busy} style={{marginTop:8}}>
              {busy?<span className="spin"/>:"Send OTP →"}
            </button>
          </>
        )}

        {/* Step 2 — OTP */}
        {step===2&&(
          <>
            <div style={{marginBottom:16,fontSize:14,color:"var(--t2)",lineHeight:1.6}}>
              Enter the 6-digit code sent to <strong style={{color:"var(--t1)"}}>{email}</strong>
            </div>
            <div className="fg">
              <label className="lbl">Verification Code <span style={{color:"var(--dn)"}}>*</span></label>
              <input className="inp" placeholder="000000" value={otp} onChange={e=>{setOtp(e.target.value.replace(/\D/g,"").slice(0,6));setErr("");}} onKeyDown={e=>K(e,verify)} style={{fontFamily:"var(--m)",letterSpacing:8,fontSize:24,textAlign:"center",fontWeight:700}} maxLength={6} autoFocus/>
            </div>
            {err && <Er msg={err}/>}
            <button className="btn btn-gold btn-block btn-lg" onClick={verify} disabled={busy||otp.length!==6} style={{marginTop:8}}>
              {busy?<span className="spin"/>:"Verify Code →"}
            </button>
            <div style={{textAlign:"center",marginTop:14}}>
              <span style={{fontSize:12,color:"var(--t3)"}}>Didn&apos;t receive it? </span>
              <span style={{fontSize:12,color:"var(--gold)",cursor:"pointer",fontWeight:600}} onClick={()=>{setStep(1);setOtp("");}}>Resend</span>
            </div>
          </>
        )}

        {/* Step 3 — New Password */}
        {step===3&&(
          <>
            <div style={{marginBottom:16,fontSize:14,color:"var(--t2)",lineHeight:1.6}}>Choose a strong new password for your account.</div>
            <div className="fg">
              <label className="lbl">New Password <span style={{color:"var(--dn)"}}>*</span></label>
              <div className="iw">
                <input className="inp" type={showPw?"text":"password"} placeholder="Min. 8 characters" value={newPw} onChange={e=>{setNewPw(e.target.value);setErr("");}} onKeyDown={e=>K(e,reset)} style={{paddingRight:44}} autoFocus/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--t3)",cursor:"pointer"}}>
                  {showPw?<svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>:<svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>
            <div className="fg">
              <label className="lbl">Confirm Password <span style={{color:"var(--dn)"}}>*</span></label>
              <input className="inp" type="password" placeholder="Repeat new password" value={confPw} onChange={e=>{setConfPw(e.target.value);setErr("");}} onKeyDown={e=>K(e,reset)} style={{borderColor:confPw&&confPw===newPw?"var(--up)":""}}/>
            </div>
            {err && <Er msg={err}/>}
            <button className="btn btn-gold btn-block btn-lg" onClick={reset} disabled={busy} style={{marginTop:8}}>
              {busy?<span className="spin"/>:"Reset Password ✓"}
            </button>
          </>
        )}

        <div style={{textAlign:"center",marginTop:20}}>
          <span style={{fontSize:12,color:"var(--gold)",cursor:"pointer",fontWeight:600}} onClick={()=>router.push("/")}>← Back to Login</span>
        </div>
      </div>
    </div>
  );
}