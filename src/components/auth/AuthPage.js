import { useState } from "react";
import { useStore } from "@/lib/store";
import { TIERS, initials } from "@/lib/data";
import { useRouter } from "next/router";
import Logo from "@/components/ui/Logo";

const ADMIN_EMAIL  = "admin@octatrade.com",  ADMIN_PASS  = "admin123";
const ADMIN2_EMAIL = "admin2@octatrade.com", ADMIN2_PASS = "admin2123";
const TAKEN=new Set(["admin","octatrade","user1","test"]);

function Eye({show,toggle}){return<button type="button" onClick={toggle} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--t3)",cursor:"pointer",padding:0,display:"flex"}}>{show?<svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>:<svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}</button>;}
function Er({msg}){if(!msg)return null;return<div style={{fontSize:11,color:"var(--dn)",marginTop:5,display:"flex",alignItems:"center",gap:4}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{msg}</div>;}

export default function AuthPage(){
  const{setUser,setAdminAuthed,setAdminRole,setShowAdmin,addToast}=useStore();
  const router = useRouter();
  const[tab,setTab]=useState("login"),[busy,setBusy]=useState(false),[errs,setErrs]=useState({});
  const[sp,setSp]=useState(false),[scp,setScp]=useState(false);
  const[uname,setUname]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState("");
  const[pw,setPw]=useState(""),[cpw,setCpw]=useState(""),[ref,setRef]=useState(""),[terms,setTerms]=useState(false);
  const ce=k=>setErrs(p=>{const n={...p};delete n[k];return n;});

  const validate=()=>{
    const e={};
    if(tab==="signup"){
      if(!uname.trim())e.uname="Username required";
      else if(uname.length<3)e.uname="Min 3 characters";
      else if(!/^[a-zA-Z0-9_]+$/.test(uname))e.uname="Letters, numbers, underscore only";
      else if(TAKEN.has(uname.toLowerCase()))e.uname="Already taken";
      if(!email.trim())e.email="Email required";
      else if(!/\S+@\S+\.\S+/.test(email))e.email="Invalid email";
      if(!pw)e.pw="Password required";
      else if(pw.length<8)e.pw="Min 8 characters";
      if(!cpw)e.cpw="Confirm your password";
      else if(cpw!==pw)e.cpw="Passwords don't match";
      if(!terms)e.terms="Accept Terms & Conditions";
    }else{
      if(!email.trim())e.email="Email required";
      if(!pw)e.pw="Password required";
    }
    return e;
  };

  const submit=()=>{
    const e=validate();if(Object.keys(e).length){setErrs(e);return;}
    setBusy(true);
    setTimeout(()=>{
      if(tab==="login"&&email===ADMIN_EMAIL&&pw===ADMIN_PASS){setAdminAuthed(true);setAdminRole("main");setShowAdmin(true);addToast("Welcome, Main Admin!","ok");setBusy(false);return;}
      if(tab==="login"&&email===ADMIN2_EMAIL&&pw===ADMIN2_PASS){setAdminAuthed(true);setAdminRole("second");setShowAdmin(true);addToast("Welcome, Admin!","ok");setBusy(false);return;}
      const name     = tab==="signup"?uname:"Alex Morgan";
      const username = tab==="signup"?uname:"alexmorgan";
      const uid      = "OCT"+String(Math.floor(100000+Math.random()*900000));
      setUser({id:"u_"+Date.now(),uid,username,name,email,phone:tab==="signup"?phone:"",avatar:initials(name),fundingBalance:0,tradingBalance:0,tradingFreezeUntil:0,tier:null,subscribedTier:null,pendingTier:null,totalProfit:0,totalTrades:0,kycStatus:null,referralCode:"OCT"+(Date.now()+"").slice(-5),referralCount:0,referrals:[],referredBy:ref||null,joinDate:new Date().toISOString().split("T")[0]});
      addToast(tab==="signup"?"Welcome to OctaTrade! 🎉":"Welcome back!","ok");
      setBusy(false);
    },900);
  };
  const K=e=>{if(e.key==="Enter")submit();};
  const pws=pw.length>=12?4:pw.length>=10?3:pw.length>=8?2:pw.length>0?1:0;
  const pwc=["","var(--dn)","var(--gold)","var(--gold2)","var(--up)"],pwl=["","Too weak","Weak","Good","Strong"];

  return(
    <div className="auth-shell">
      <div style={{padding:"44px 28px 24px",textAlign:"center"}}><Logo size="lg"/><p style={{color:"var(--t2)",fontSize:13,marginTop:10}}>The Smart Crypto Investment Platform</p></div>
      <div style={{flex:1,padding:"0 20px 40px",maxWidth:440,margin:"0 auto",width:"100%"}}>
        <div style={{display:"flex",borderBottom:"1px solid var(--ln)",marginBottom:24}}>
          {["login","signup"].map(t=><button key={t} className={`auth-tab${tab===t?" on":""}`} onClick={()=>{setTab(t);setErrs({});}}>{t==="login"?"Log In":"Sign Up"}</button>)}
        </div>

        {tab==="signup"&&<>
          <div className="fg"><label className="lbl">Username <span style={{color:"var(--dn)"}}>*</span></label><div className="iw"><input className="inp" placeholder="e.g. johndoe99" value={uname} onChange={e=>{setUname(e.target.value);ce("uname");}} onKeyDown={K} style={{borderColor:errs.uname?"var(--dn)":""}}/>{uname&&!errs.uname&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"var(--up)"}}>✓</span>}</div><Er msg={errs.uname}/></div>
          <div className="fg"><label className="lbl">Email <span style={{color:"var(--dn)"}}>*</span></label><input className="inp" type="email" placeholder="you@email.com" value={email} onChange={e=>{setEmail(e.target.value);ce("email");}} onKeyDown={K} style={{borderColor:errs.email?"var(--dn)":""}}/><Er msg={errs.email}/></div>
          <div className="fg"><label className="lbl">Phone <span style={{color:"var(--t3)",fontSize:10,marginLeft:4}}>(optional)</span></label><input className="inp" type="tel" placeholder="+1-555-0000" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={K}/></div>
          <div className="fg"><label className="lbl">Create Password <span style={{color:"var(--dn)"}}>*</span></label><div className="iw"><input className="inp" type={sp?"text":"password"} placeholder="Min. 8 characters" value={pw} onChange={e=>{setPw(e.target.value);ce("pw");}} onKeyDown={K} style={{paddingRight:44,borderColor:errs.pw?"var(--dn)":""}}/><Eye show={sp} toggle={()=>setSp(p=>!p)}/></div>{pw.length>0&&<div style={{marginTop:7}}><div style={{display:"flex",gap:3,marginBottom:3}}>{[1,2,3,4].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=pws?pwc[pws]:"var(--ln2)",transition:"all .3s"}}/>)}</div><div style={{fontSize:10,color:pwc[pws]}}>{pwl[pws]}</div></div>}<Er msg={errs.pw}/></div>
          <div className="fg"><label className="lbl">Confirm Password <span style={{color:"var(--dn)"}}>*</span></label><div className="iw"><input className="inp" type={scp?"text":"password"} placeholder="Repeat password" value={cpw} onChange={e=>{setCpw(e.target.value);ce("cpw");}} onKeyDown={K} style={{paddingRight:44,borderColor:errs.cpw?"var(--dn)":cpw&&cpw===pw?"var(--up)":""}}/><Eye show={scp} toggle={()=>setScp(p=>!p)}/></div><Er msg={errs.cpw}/></div>
          <div className="fg"><label className="lbl">Referral Code <span style={{color:"var(--t3)",fontSize:10,marginLeft:4}}>(optional)</span></label><input className="inp" placeholder="Enter code if you have one" value={ref} onChange={e=>setRef(e.target.value)} onKeyDown={K}/></div>
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
          {/* <div style={{background:"rgba(45,156,255,.06)",border:"1px solid rgba(45,156,255,.12)",borderRadius:10,padding:"10px 14px",marginBottom:16}}>
            <div style={{fontSize:11,color:"var(--blue)",fontFamily:"var(--m)",fontWeight:700,marginBottom:4,letterSpacing:".5px"}}>DEMO CREDENTIALS</div>
            <div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--m)",lineHeight:1.8}}>User:&nbsp;&nbsp; any email / any password<br/>Admin 1: admin@octatrade.com / admin123<br/>Admin 2: admin2@octatrade.com / admin2123</div>
          </div> */}
        </>}

        <button className="btn btn-gold btn-block btn-lg" onClick={submit} disabled={busy} style={{marginBottom:14}}>{busy?<span className="spin"/>:tab==="login"?"Log In":"Create Account"}</button>
        <p style={{textAlign:"center",fontSize:13,color:"var(--t2)"}}>
          {tab==="login"?<>{'Don\'t have an account? '} <span style={{color:"var(--gold)",cursor:"pointer",fontWeight:700}} onClick={()=>{setTab("signup");setErrs({});}}>Sign Up</span></>:<>{'Already have an account? '} <span style={{color:"var(--gold)",cursor:"pointer",fontWeight:700}} onClick={()=>{setTab("login");setErrs({});}}>Log In</span></>}
        </p>
      </div>
    </div>
  );
}