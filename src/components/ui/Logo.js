export default function Logo({size="md"}){
  const s=size==="lg"?40:32,fs=size==="lg"?21:17;
  return(
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:s,height:s,borderRadius:s*.28,background:"linear-gradient(135deg,#f0a500,#b87800)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(240,165,0,.3)",flexShrink:0}}>
        <svg width={s*.55} height={s*.55} viewBox="0 0 22 22" fill="none">
          <path d="M11 2L3 9v11h5v-6h6v6h5V9L11 2z" fill="#000" opacity=".85"/>
          <path d="M8 14h6" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:fs,letterSpacing:"-.6px"}}>
        Nex<span style={{color:"var(--gold)"}}>Trade</span>
      </span>
    </div>
  );
}