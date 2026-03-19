import { useState, useEffect } from "react";
export default function Countdown({ totalSeconds=300, onDone }) {
  const [secs,setSecs]=useState(totalSeconds);
  useEffect(()=>{
    if(secs<=0){onDone?.();return;}
    const t=setTimeout(()=>setSecs(s=>s-1),1000);
    return()=>clearTimeout(t);
  },[secs,onDone]);
  const m=Math.floor(secs/60),s=secs%60,pct=(secs/totalSeconds)*100;
  const r=26,circ=2*Math.PI*r;
  const clr=secs<60?"var(--dn)":secs<120?"var(--gold)":"var(--blue)";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <div style={{position:"relative",width:58,height:58}}>
        <svg width={58} height={58} viewBox="0 0 58 58" style={{transform:"rotate(-90deg)"}}>
          <circle cx={29} cy={29} r={r} fill="none" stroke="var(--ln2)" strokeWidth="3.5"/>
          <circle cx={29} cy={29} r={r} fill="none" stroke={clr} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} style={{transition:"stroke-dashoffset 1s linear,stroke .5s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--m)",fontSize:11,fontWeight:700,color:clr}}>
          {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
        </div>
      </div>
      <span style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--m)"}}>left</span>
    </div>
  );
}