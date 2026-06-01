export default function Logo({size="md"}){
  const s=size==="lg"?40:38,fs=size==="lg"?21:17;
  return(
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <img
        src="/icon-51222.png"
        alt="OctaExchange"
        style={{width:s,height:s,borderRadius:s*.28,flexShrink:0}}
      />
      <span style={{fontFamily:"var(--f)",fontWeight:800,fontSize:fs,letterSpacing:"-.6px"}}>
        Octa<span style={{color:"var(--gold)"}}>Exchange</span>
      </span>
    </div>
  );
}