import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/router";
import Logo from "@/components/ui/Logo";

const MAIN_EMAIL = process.env.NEXT_PUBLIC_MAIN_ADMIN_EMAIL || "admin@octaexchange.com";
const MAIN_PASS  = process.env.NEXT_PUBLIC_MAIN_ADMIN_PASS  || "Admin1234";
const SUB_EMAIL  = process.env.NEXT_PUBLIC_SUB_ADMIN_EMAIL  || "admin2@octaexchange.com";
const SUB_PASS   = process.env.NEXT_PUBLIC_SUB_ADMIN_PASS   || "Admin2234";
const API        = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const TAKEN      = new Set(["admin","octaexchange","user1","test","support","help","root"]);

function Eye({show,toggle}){return<button type="button" onClick={toggle} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--t3)",cursor:"pointer",padding:0,display:"flex"}}>{show?<svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>:<svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}</button>;}
function Er({msg}){if(!msg)return null;return<div style={{fontSize:11,color:"var(--dn)",marginTop:5,display:"flex",alignItems:"center",gap:4}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{msg}</div>;}

// ── OTP Step ──────────────────────────────────────────────
function OTPStep({email, onVerified, onBack}){
  const { login, addToast } = useStore();
  const [otp,   setOtp]   = useState(["","","","","",""]);
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState("");
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);

  useEffect(()=>{
    inputs.current[0]?.focus();
    const t = setInterval(()=>setTimer(p=>p>0?p-1:0),1000);
    return()=>clearInterval(t);
  },[]);

  const handleInput=(val,i)=>{
    const next=[...otp]; next[i]=val.replace(/\D/g,"").slice(-1); setOtp(next);
    if(val&&i<5) inputs.current[i+1]?.focus();
    if(!val&&i>0) inputs.current[i-1]?.focus();
  };

  const handlePaste=(e)=>{
    const text=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if(text.length===6){ setOtp(text.split("")); inputs.current[5]?.focus(); }
  };

  const verify=async()=>{
    const code=otp.join("");
    if(code.length!==6){setErr("Enter the 6-digit code");return;}
    setBusy(true); setErr("");
    try{
      // Step 1: verify OTP
      const r1=await fetch(`${API}/auth/verify-email`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({email,otp:code})});
      const d1=await r1.json();
      if(!r1.ok){setErr(d1.message||"Invalid or expired OTP");setBusy(false);return;}
      // OTP verified — user is now created. Tell parent to proceed.
      addToast("Email verified! ✅","ok");
      onVerified();
    }catch(_){setErr("Network error — check connection");}
    setBusy(false);
  };

  const resend=async()=>{
    if(timer>0)return;
    setBusy(true);
    try{
      await fetch(`${API}/auth/request-otp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
      setTimer(60); addToast("OTP resent!","ok");
    }catch(_){addToast("Failed to resend","err");}
    setBusy(false);
  };

  return(
    <div style={{flex:1,padding:"0 20px 40px",maxWidth:440,margin:"0 auto",width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:64,height:64,borderRadius:20,background:"linear-gradient(135deg,rgba(240,165,0,.2),rgba(240,165,0,.05))",border:"1px solid rgba(240,165,0,.3)",margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>📧</div>
        <div style={{fontWeight:800,fontSize:20,marginBottom:6}}>Verify Your Email</div>
        <div style={{fontSize:13,color:"var(--t2)",lineHeight:1.6}}>We sent a 6-digit code to<br/><strong style={{color:"var(--gold)"}}>{email}</strong></div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}} onPaste={handlePaste}>
        {otp.map((digit,i)=>(
          <input key={i} ref={el=>inputs.current[i]=el} className="inp" maxLength={1} value={digit}
            onChange={e=>handleInput(e.target.value,i)}
            onKeyDown={e=>{if(e.key==="Backspace"&&!otp[i]&&i>0)inputs.current[i-1]?.focus();if(e.key==="Enter")verify();}}
            style={{width:46,height:54,textAlign:"center",fontSize:22,fontWeight:700,fontFamily:"var(--m)",padding:0,borderColor:digit?"var(--gold)":"var(--ln)",background:"var(--ink3)"}}/>
        ))}
      </div>
      {err&&<div style={{background:"rgba(255,59,92,.08)",border:"1px solid rgba(255,59,92,.2)",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"var(--dn)",fontSize:13,textAlign:"center"}}>{err}</div>}
      <button className="btn btn-gold btn-block btn-lg" onClick={verify} disabled={busy||otp.join("").length!==6} style={{marginBottom:14}}>
        {busy?<span className="spin"/>:"Verify & Continue"}
      </button>
      <div style={{textAlign:"center",fontSize:13,color:"var(--t2)",marginBottom:10}}>
        Didn&apos;t receive it?{" "}
        <span onClick={resend} style={{color:timer>0?"var(--t3)":"var(--gold)",cursor:timer>0?"default":"pointer",fontWeight:600}}>
          {timer>0?`Resend in ${timer}s`:"Resend OTP"}
        </span>
      </div>
      <div style={{textAlign:"center"}}><span style={{fontSize:12,color:"var(--t3)",cursor:"pointer"}} onClick={onBack}>← Back to Sign Up</span></div>
    </div>
  );
}

export default function AuthPage(){
  const { login, register, setAdminAuthed, setAdminRole, setShowAdmin, addToast } = useStore();
  const router = useRouter();
  const [step,   setStep]   = useState("form"); // "form" | "otp"
  const [tab,    setTab]    = useState("login");
  const [busy,   setBusy]   = useState(false);
  const [errs,   setErrs]   = useState({});
  const [sp,     setSp]     = useState(false), [scp,setScp]=useState(false);
  const [uname,  setUname]  = useState("");
  const [email,  setEmail]  = useState("");
  const [phone,  setPhone]  = useState("");
  const [pw,     setPw]     = useState("");
  const [cpw,    setCpw]    = useState("");
  const [ref,    setRef]    = useState("");
  const [terms,  setTerms]  = useState(false);
  const [otpEmail,setOtpEmail]=useState("");

  useEffect(()=>{ if(router.query.ref){setRef(String(router.query.ref));setTab("signup");} },[router.query.ref]);

  const ce=k=>setErrs(p=>{const n={...p};delete n[k];return n;});

  const validate=()=>{
    const e={};
    if(tab==="signup"){
      if(!uname.trim())                        e.uname="Username required";
      else if(uname.length<3)                  e.uname="Min 3 characters";
      else if(!/^[a-zA-Z0-9_]+$/.test(uname)) e.uname="Letters, numbers, underscore only — no spaces";
      else if(TAKEN.has(uname.toLowerCase()))  e.uname="Username already taken";
      if(!email.trim())                        e.email="Email required";
      else if(!/\S+@\S+\.\S+/.test(email))     e.email="Invalid email";
      if(!pw)                                  e.pw="Password required";
      else if(pw.length<8)                     e.pw="Min 8 characters";
      else if(!/[A-Z]/.test(pw))               e.pw="Include at least one uppercase letter";
      else if(!/[0-9]/.test(pw))               e.pw="Include at least one number";
      if(!cpw)                                 e.cpw="Confirm your password";
      else if(cpw!==pw)                        e.cpw="Passwords don't match";
      if(!terms)                               e.terms="Accept Terms & Conditions";
    }else{
      if(!email.trim()) e.email="Email required";
      if(!pw)           e.pw="Password required";
    }
    return e;
  };

  const submit=async()=>{
    const e=validate();
    if(Object.keys(e).length){setErrs(e);return;}
    setBusy(true);

    if(tab==="login"){
      // Always do real API login — this sets the Bearer token
      const result=await login(email,pw);
      setBusy(false);
      if(!result.success) setErrs({pw:result.message});
      return;
    }

    // SIGNUP: Step 1 — request OTP
    try{
      const res=await fetch(`${API}/auth/request-otp`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:email.trim()}),
      });
      const data=await res.json();
      if(res.ok){
        setOtpEmail(email.trim());
        setStep("otp");
        addToast(`OTP sent to ${email}!`,"info");
      }else{
        setErrs({email:data.message||"Failed to send OTP"});
      }
    }catch(_){
      // Backend offline: fall back to direct register (no OTP)
      const result=await register(uname.trim(),email,pw,ref||undefined);
      if(!result.success) setErrs({email:result.message});
    }
    setBusy(false);
  };

  // Called after OTP verified — now do the actual register
  const afterOtp=async()=>{
    setBusy(true);
    const result=await register(uname.trim(),email,pw,ref||undefined);
    setBusy(false);
    if(!result.success){
      setStep("form");
      setErrs({email:result.message});
    }
  };

  const K=e=>{if(e.key==="Enter")submit();};
  const pws=pw.length>=12?4:pw.length>=10?3:pw.length>=8?2:pw.length>0?1:0;
  const pwc=["","var(--dn)","var(--gold)","var(--gold2)","var(--up)"],pwl=["","Too weak","Weak","Good","Strong"];

  if(step==="otp") return(
    <div className="auth-shell">
      <div style={{padding:"44px 28px 24px",textAlign:"center"}}><Logo size="lg"/></div>
      <OTPStep email={otpEmail} onVerified={afterOtp} onBack={()=>setStep("form")}/>
    </div>
  );

  return(
    <div className="auth-shell">
      <div style={{padding:"44px 28px 24px",textAlign:"center"}}>
        <Logo size="lg"/>
        <p style={{color:"var(--t2)",fontSize:13,marginTop:10}}>The Smart Crypto Investment Platform</p>
      </div>
      <div style={{flex:1,padding:"0 20px 40px",maxWidth:440,margin:"0 auto",width:"100%"}}>
        <div style={{display:"flex",borderBottom:"1px solid var(--ln)",marginBottom:24}}>
          {["login","signup"].map(t=><button key={t} className={`auth-tab${tab===t?" on":""}`} onClick={()=>{setTab(t);setErrs({});}}>{t==="login"?"Log In":"Sign Up"}</button>)}
        </div>

        {tab==="signup"&&<>
          <div className="fg"><label className="lbl">Username <span style={{color:"var(--dn)"}}>*</span></label><div className="iw"><input className="inp" placeholder="e.g. johndoe99 (no spaces)" value={uname} onChange={e=>{setUname(e.target.value.replace(/\s/g,""));ce("uname");}} onKeyDown={K} style={{borderColor:errs.uname?"var(--dn)":""}} autoComplete="username"/>{uname&&!errs.uname&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"var(--up)"}}>✓</span>}</div><Er msg={errs.uname}/></div>
          <div className="fg"><label className="lbl">Email <span style={{color:"var(--dn)"}}>*</span></label><input className="inp" type="email" placeholder="you@email.com" value={email} onChange={e=>{setEmail(e.target.value);ce("email");}} onKeyDown={K} style={{borderColor:errs.email?"var(--dn)":""}} autoComplete="email"/><Er msg={errs.email}/></div>
          <div className="fg"><label className="lbl">Phone <span style={{color:"var(--t3)",fontSize:10,marginLeft:4}}>(optional)</span></label><input className="inp" type="tel" placeholder="+92-300-0000000" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={K} autoComplete="tel"/></div>
          <div className="fg"><label className="lbl">Create Password <span style={{color:"var(--dn)"}}>*</span></label><div className="iw"><input className="inp" type={sp?"text":"password"} placeholder="Min. 8 characters" value={pw} onChange={e=>{setPw(e.target.value);ce("pw");}} onKeyDown={K} style={{paddingRight:44,borderColor:errs.pw?"var(--dn)":""}} autoComplete="new-password"/><Eye show={sp} toggle={()=>setSp(p=>!p)}/></div>{pw.length>0&&<div style={{marginTop:7}}><div style={{display:"flex",gap:3,marginBottom:3}}>{[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=pws?pwc[pws]:"var(--ln2)",transition:"all .3s"}}/>)}</div><div style={{fontSize:10,color:pwc[pws]}}>{pwl[pws]}</div></div>}<Er msg={errs.pw}/></div>
          <div className="fg"><label className="lbl">Confirm Password <span style={{color:"var(--dn)"}}>*</span></label><div className="iw"><input className="inp" type={scp?"text":"password"} placeholder="Repeat password" value={cpw} onChange={e=>{setCpw(e.target.value);ce("cpw");}} onKeyDown={K} style={{paddingRight:44,borderColor:errs.cpw?"var(--dn)":cpw&&cpw===pw?"var(--up)":""}} autoComplete="new-password"/><Eye show={scp} toggle={()=>setScp(p=>!p)}/></div><Er msg={errs.cpw}/></div>
          <div className="fg"><label className="lbl">Referral Code <span style={{color:"var(--t3)",fontSize:10,marginLeft:4}}>(optional)</span></label><input className="inp" placeholder="Enter code if you have one" value={ref} onChange={e=>setRef(e.target.value)} onKeyDown={K} style={{borderColor:ref?"var(--gold)":""}}/>{ref&&<div style={{fontSize:11,color:"var(--gold)",marginTop:4}}>✓ Referral code applied</div>}</div>
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}} onClick={()=>{setTerms(p=>!p);ce("terms");}}>
              <div style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:2,border:`2px solid ${errs.terms?"var(--dn)":terms?"var(--gold)":"var(--ln2)"}`,background:terms?"var(--gold)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                {terms&&<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{fontSize:13,color:"var(--t2)",lineHeight:1.5}}>I agree to the <span style={{color:"var(--gold)",fontWeight:600}}>Terms & Conditions</span> and <span style={{color:"var(--gold)",fontWeight:600}}>Privacy Policy</span></span>
            </div>
            <Er msg={errs.terms}/>
          </div>
        </>}

        {tab==="login"&&<>
          <div className="fg"><label className="lbl">Email <span style={{color:"var(--dn)"}}>*</span></label><input className="inp" type="email" placeholder="you@email.com" value={email} onChange={e=>{setEmail(e.target.value);ce("email");}} onKeyDown={K} style={{borderColor:errs.email?"var(--dn)":""}} autoComplete="email"/><Er msg={errs.email}/></div>
          <div className="fg"><label className="lbl">Password <span style={{color:"var(--dn)"}}>*</span></label><div className="iw"><input className="inp" type={sp?"text":"password"} placeholder="Your password" value={pw} onChange={e=>{setPw(e.target.value);ce("pw");}} onKeyDown={K} style={{paddingRight:44,borderColor:errs.pw?"var(--dn)":""}} autoComplete="current-password"/><Eye show={sp} toggle={()=>setSp(p=>!p)}/></div><Er msg={errs.pw}/></div>
          <div style={{textAlign:"right",marginTop:-8,marginBottom:16}}><span style={{fontSize:12,color:"var(--gold)",cursor:"pointer"}} onClick={()=>router.push("/forgot-password")}>Forgot password?</span></div>
        </>}

        <button className="btn btn-gold btn-block btn-lg" onClick={submit} disabled={busy} style={{marginBottom:14}}>
          {busy ? <span className="spin"/> : (tab === "login" ? "Log In" : "Create Account — Email OTP Required")}
        </button>
        <p style={{textAlign:"center",fontSize:13,color:"var(--t2)"}}>
          {tab === "login" ? (
            <>
              <span>Don&apos;t have an account? </span>
              <span style={{color:"var(--gold)",cursor:"pointer",fontWeight:700}} onClick={()=>{setTab("signup");setErrs({});}}>Sign Up</span>
            </>
          ) : (
            <>
              <span>Already have an account? </span>
              <span style={{color:"var(--gold)",cursor:"pointer",fontWeight:700}} onClick={()=>{setTab("login");setErrs({});}}>Log In</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}