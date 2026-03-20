export default function Logo({size="md"}){
  const s=size==="lg"?40:32,fs=size==="lg"?21:17;
  return(
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:s,height:s,borderRadius:s*.28,background:"linear-gradient(135deg,#f0a500,#b87800)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(240,165,0,.3)",flexShrink:0}}>
        <svg width={s*.6} height={s*.6} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#000" opacity=".9"/>
          <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" fill="#f0a500"/>
          <path d="M12 8v8M8 12h8" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:fs,letterSpacing:"-.6px"}}>
        Octa<span style={{color:"var(--gold)"}}>Trade</span>
      </span>
    </div>
  );
}