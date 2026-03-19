import { useState } from "react";
import { useRouter } from "next/router";
import Logo from "@/components/ui/Logo";

function Eye({ show, toggle }) {
  return (
    <button type="button" onClick={toggle}
      style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--t3)",cursor:"pointer",padding:0,display:"flex"}}>
      {show
        ? <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );
}

function Er({ msg }) {
  if (!msg) return null;
  return (
    <div style={{fontSize:11,color:"var(--dn)",marginTop:5,display:"flex",alignItems:"center",gap:4}}>
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {msg}
    </div>
  );
}

function StepBar({ step }) {
  const steps = ["Email", "Verify OTP", "New Password"];
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32}}>
      {steps.map((label, i) => {
        const n = i + 1, done = step > n, active = step === n;
        return (
          <div key={label} style={{display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{
                width:32,height:32,borderRadius:"50%",
                background: done?"var(--up)":active?"var(--gold)":"var(--ln2)",
                color:(done||active)?"#000":"var(--t3)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:900,transition:"all .3s",
                boxShadow:active?"0 0 0 4px rgba(240,165,0,.2)":"none"
              }}>
                {done
                  ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : n
                }
              </div>
              <span style={{fontSize:10,fontWeight:700,color:active?"var(--gold)":done?"var(--up)":"var(--t3)",whiteSpace:"nowrap"}}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{width:44,height:2,background:step>n?"var(--up)":"var(--ln2)",marginBottom:22,transition:"background .3s",flexShrink:0}}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step,     setStep]     = useState(1);
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState(["","","","","",""]);
  const [pw,       setPw]       = useState("");
  const [cpw,      setCpw]      = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCp,   setShowCp]   = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [errs,     setErrs]     = useState({});
  const [resendCd, setResendCd] = useState(0);

  const startCountdown = () => {
    setResendCd(60);
    const t = setInterval(() => {
      setResendCd(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  // Step 1 — send email
  const sendEmail = () => {
    if (!email.trim())               { setErrs({email:"Email address is required"}); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrs({email:"Enter a valid email"}); return; }
    setBusy(true);
    setTimeout(() => { setBusy(false); setErrs({}); setStep(2); startCountdown(); }, 1000);
  };

  // Step 2 — verify OTP
  const verifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6)     { setErrs({otp:"Enter the 6-digit code"}); return; }
    if (code !== "123456")   { setErrs({otp:"Invalid code. Demo OTP: 123456"}); return; }
    setBusy(true);
    setTimeout(() => { setBusy(false); setErrs({}); setStep(3); }, 700);
  };

  const resendOtp = () => {
    if (resendCd > 0) return;
    setOtp(["","","","","",""]);
    setErrs({});
    startCountdown();
  };

  const handleOtpInput = (val, idx) => {
    const v = val.replace(/\D/g,"").slice(-1);
    const next = [...otp]; next[idx] = v; setOtp(next); setErrs({});
    if (v && idx < 5) document.getElementById(`otp_${idx+1}`)?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      document.getElementById(`otp_${idx-1}`)?.focus();
    if (e.key === "Enter") verifyOtp();
  };

  // Step 3 — new password
  const pws = pw.length>=12?4:pw.length>=10?3:pw.length>=8?2:pw.length>0?1:0;
  const pwc = ["","var(--dn)","var(--gold)","var(--gold2)","var(--up)"];
  const pwl = ["","Too weak","Weak","Good","Strong"];

  const resetPassword = () => {
    const e = {};
    if (!pw)           e.pw  = "Password required";
    else if(pw.length<8) e.pw = "Min 8 characters";
    if (!cpw)          e.cpw = "Please confirm your password";
    else if(cpw!==pw)  e.cpw = "Passwords don't match";
    if (Object.keys(e).length) { setErrs(e); return; }
    setBusy(true);
    setTimeout(() => { setBusy(false); setErrs({}); setStep(4); }, 1000);
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_,a,b,c) => a+"*".repeat(Math.min(b.length,5))+c)
    : "";

  return (
    <div className="auth-shell">
      {/* Header */}
      <div style={{padding:"44px 28px 28px",textAlign:"center"}}>
        <Logo size="lg"/>
        <p style={{color:"var(--t2)",fontSize:13,marginTop:10}}>
          {step===1 && "Reset your account password"}
          {step===2 && "Check your email for the code"}
          {step===3 && "Create a strong new password"}
          {step===4 && "Password reset complete!"}
        </p>
      </div>

      <div style={{flex:1,padding:"0 20px 40px",maxWidth:440,margin:"0 auto",width:"100%"}}>

        {/* Back button */}
        {step < 4 && (
          <button onClick={() => step===1 ? router.push("/") : setStep(s=>s-1)}
            style={{display:"flex",alignItems:"center",gap:6,color:"var(--t2)",fontSize:13,fontWeight:600,marginBottom:24}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            {step===1 ? "Back to Login" : "Back"}
          </button>
        )}

        {step < 4 && <StepBar step={step}/>}

        {/* ── STEP 1: Email ── */}
        {step===1 && (
          <div className="au">
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:64,height:64,borderRadius:20,background:"rgba(240,165,0,.1)",border:"1px solid rgba(240,165,0,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px"}}>
                📧
              </div>
              <div style={{fontWeight:800,fontSize:20,marginBottom:6}}>Forgot Password?</div>
              <div style={{fontSize:13,color:"var(--t2)",lineHeight:1.6}}>
                Enter your registered email address.<br/>{"We'll send you a 6-digit verification code."}
              </div>
            </div>

            <div className="fg">
              <label className="lbl">Email Address <span style={{color:"var(--dn)"}}>*</span></label>
              <input className="inp" type="email" placeholder="you@email.com" value={email}
                onChange={e=>{setEmail(e.target.value);setErrs({});}}
                onKeyDown={e=>e.key==="Enter"&&sendEmail()}
                autoComplete="email"
                style={{borderColor:errs.email?"var(--dn)":""}}/>
              <Er msg={errs.email}/>
            </div>

            <button className="btn btn-gold btn-block btn-lg" onClick={sendEmail} disabled={busy} style={{marginBottom:16}}>
              {busy ? <span className="spin"/> : "Send Reset Code →"}
            </button>

            <p style={{textAlign:"center",fontSize:13,color:"var(--t2)"}}>
              {"Remember your password?"}
              <span style={{color:"var(--gold)",cursor:"pointer",fontWeight:700}} onClick={()=>router.push("/")}>Log In</span>
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP ── */}
        {step===2 && (
          <div className="au">
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:64,height:64,borderRadius:20,background:"rgba(45,156,255,.08)",border:"1px solid rgba(45,156,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px"}}>
                🔐
              </div>
              <div style={{fontWeight:800,fontSize:20,marginBottom:6}}>Enter OTP Code</div>
              <div style={{fontSize:13,color:"var(--t2)",lineHeight:1.6}}>
                We sent a 6-digit code to<br/>
                <strong style={{color:"var(--t1)"}}>{maskedEmail}</strong>
              </div>
            </div>

            {/* OTP boxes */}
            <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:8}}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp_${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e=>handleOtpInput(e.target.value,idx)}
                  onKeyDown={e=>handleOtpKey(e,idx)}
                  style={{
                    width:46,height:54,borderRadius:12,textAlign:"center",
                    fontSize:22,fontWeight:900,fontFamily:"var(--m)",
                    background:"var(--ink2)",
                    border:`2px solid ${errs.otp?"var(--dn)":digit?"var(--gold)":"var(--ln)"}`,
                    color:"var(--t1)",outline:"none",transition:"border-color .2s,box-shadow .2s",
                    boxShadow:digit?"0 0 0 3px rgba(240,165,0,.1)":"none"
                  }}
                />
              ))}
            </div>
            {errs.otp && <div style={{textAlign:"center",marginBottom:12}}><Er msg={errs.otp}/></div>}

            {/* Demo hint */}
            <div style={{background:"rgba(45,156,255,.06)",border:"1px solid rgba(45,156,255,.12)",borderRadius:10,padding:"9px 14px",marginBottom:18,textAlign:"center"}}>
              <span style={{fontSize:11,color:"var(--blue)",fontFamily:"var(--m)",fontWeight:700}}>DEMO OTP: </span>
              <span style={{fontSize:14,color:"var(--t1)",fontFamily:"var(--m)",fontWeight:700,letterSpacing:3}}>123456</span>
            </div>

            <button className="btn btn-gold btn-block btn-lg"
              onClick={verifyOtp}
              disabled={busy||otp.join("").length<6}
              style={{marginBottom:14}}>
              {busy ? <span className="spin"/> : "Verify Code →"}
            </button>

            <p style={{textAlign:"center",fontSize:13,color:"var(--t2)"}}>
              {"Didn't get the code? "}
              {resendCd > 0
                ? <span style={{color:"var(--t3)",fontFamily:"var(--m)"}}>Resend in {resendCd}s</span>
                : <span style={{color:"var(--gold)",cursor:"pointer",fontWeight:700}} onClick={resendOtp}>Resend Code</span>
              }
            </p>
          </div>
        )}

        {/* ── STEP 3: New Password ── */}
        {step===3 && (
          <div className="au">
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:64,height:64,borderRadius:20,background:"rgba(0,200,150,.08)",border:"1px solid rgba(0,200,150,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px"}}>
                🔑
              </div>
              <div style={{fontWeight:800,fontSize:20,marginBottom:6}}>Set New Password</div>
              <div style={{fontSize:13,color:"var(--t2)",lineHeight:1.6}}>
                Choose a strong password for your account.
              </div>
            </div>

            <div className="fg">
              <label className="lbl">New Password <span style={{color:"var(--dn)"}}>*</span></label>
              <div className="iw">
                <input className="inp" type={showPw?"text":"password"} placeholder="Min. 8 characters" value={pw}
                  onChange={e=>{setPw(e.target.value);setErrs(p=>({...p,pw:""}));}}
                  onKeyDown={e=>e.key==="Enter"&&resetPassword()}
                  style={{paddingRight:44,borderColor:errs.pw?"var(--dn)":""}}/>
                <Eye show={showPw} toggle={()=>setShowPw(p=>!p)}/>
              </div>
              {pw.length>0&&<div style={{marginTop:7}}>
                <div style={{display:"flex",gap:3,marginBottom:3}}>
                  {[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=pws?pwc[pws]:"var(--ln2)",transition:"all .3s"}}/>)}
                </div>
                <div style={{fontSize:10,color:pwc[pws]}}>{pwl[pws]}</div>
              </div>}
              <Er msg={errs.pw}/>
            </div>

            <div className="fg">
              <label className="lbl">Confirm New Password <span style={{color:"var(--dn)"}}>*</span></label>
              <div className="iw">
                <input className="inp" type={showCp?"text":"password"} placeholder="Repeat your new password" value={cpw}
                  onChange={e=>{setCpw(e.target.value);setErrs(p=>({...p,cpw:""}));}}
                  onKeyDown={e=>e.key==="Enter"&&resetPassword()}
                  style={{paddingRight:44,borderColor:errs.cpw?"var(--dn)":cpw&&cpw===pw?"var(--up)":""}}/>
                <Eye show={showCp} toggle={()=>setShowCp(p=>!p)}/>
              </div>
              {cpw&&cpw===pw&&!errs.cpw&&(
                <div style={{fontSize:11,color:"var(--up)",marginTop:5,display:"flex",alignItems:"center",gap:4}}>
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Passwords match
                </div>
              )}
              <Er msg={errs.cpw}/>
            </div>

            {/* Requirements checklist */}
            <div style={{background:"rgba(255,255,255,.03)",border:"1px solid var(--ln)",borderRadius:12,padding:"12px 14px",marginBottom:18}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:700,marginBottom:8,letterSpacing:".5px"}}>PASSWORD REQUIREMENTS</div>
              {[
                ["At least 8 characters",         pw.length>=8],
                ["At least one uppercase letter",  /[A-Z]/.test(pw)],
                ["At least one number",            /\d/.test(pw)],
                ["At least one special character", /[!@#$%^&*]/.test(pw)],
              ].map(([text,met])=>(
                <div key={text} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{width:16,height:16,borderRadius:"50%",
                    background:met?"rgba(0,200,150,.15)":"var(--ln2)",
                    border:`1.5px solid ${met?"var(--up)":"var(--ln2)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                    {met&&<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="var(--up)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{fontSize:11,color:met?"var(--up)":"var(--t3)",transition:"color .2s"}}>{text}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-gold btn-block btn-lg" onClick={resetPassword} disabled={busy} style={{marginBottom:16}}>
              {busy ? <span className="spin"/> : "Reset Password"}
            </button>
          </div>
        )}

        {/* ── STEP 4: Success ── */}
        {step===4 && (
          <div className="au" style={{textAlign:"center"}}>
            <div style={{marginBottom:24}}>
              <div style={{
                width:80,height:80,borderRadius:24,
                background:"rgba(0,200,150,.1)",border:"2px solid rgba(0,200,150,.3)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:36,margin:"0 auto 18px",animation:"pulse 2s ease infinite"
              }}>✅</div>
              <div style={{fontWeight:900,fontSize:22,marginBottom:8}}>Password Reset!</div>
              <div style={{fontSize:14,color:"var(--t2)",lineHeight:1.7}}>
                Your password has been successfully reset.<br/>
                You can now log in with your new password.
              </div>
            </div>

            <div style={{background:"rgba(0,200,150,.06)",border:"1px solid rgba(0,200,150,.2)",borderRadius:14,padding:"14px 16px",marginBottom:24}}>
              <div style={{fontSize:13,color:"var(--up)",fontWeight:700}}>✓ Account secured</div>
              <div style={{fontSize:12,color:"var(--t2)",marginTop:4}}>
                For security, you have been signed out of all devices.
              </div>
            </div>

            <button className="btn btn-gold btn-block btn-lg" onClick={()=>router.push("/")}>
              Go to Login →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}