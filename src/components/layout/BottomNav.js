export default function BottomNav({ page, setPage }) {
  const tabs = [
    {
      id:"home", label:"Home",
      icon: (on) => <svg width={22} height={22} viewBox="0 0 24 24" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      id:"market", label:"Market",
      icon: (on) => <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></svg>,
    },
    {
      id:"trade", label:"Trade", center:true,
      icon: (on) => <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
    },
    {
      id:"assets", label:"Assets",
      icon: (on) => <svg width={22} height={22} viewBox="0 0 24 24" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    },
    {
      id:"profile", label:"Mine",
      icon: (on) => <svg width={22} height={22} viewBox="0 0 24 24" fill={on?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  ];

  return (
    <nav style={{
      position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:"var(--max)",
      height:"var(--nav)",
      background:"rgba(7,9,15,.97)",
      backdropFilter:"blur(32px)",
      WebkitBackdropFilter:"blur(32px)",
      borderTop:"1px solid var(--ln)",
      display:"flex", alignItems:"stretch",
      zIndex:100, padding:"0 4px",
    }}>
      {tabs.map(t => {
        const on = page === t.id;
        if (t.center) return (
          <button key={t.id} onClick={() => setPage(t.id)}
            style={{ flex:1.3, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, background:"none", border:"none", cursor:"pointer" }}>
            <div style={{
              width:46, height:46, borderRadius:14,
              background: on
                ? "linear-gradient(135deg,#a855f7,#7c3aed)"
                : "linear-gradient(135deg,#2a2a3e,#1a1a2e)",
              border:`1.5px solid ${on?"#a855f7":"var(--ln)"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color: on ? "#fff" : "var(--t3)",
              boxShadow: on ? "0 4px 16px rgba(168,85,247,.4)" : "none",
              transition:"all .2s"
            }}>
              {t.icon(on)}
            </div>
            <span style={{ fontSize:9, fontWeight:700, color:on?"var(--pu)":"var(--t3)", letterSpacing:".3px" }}>{t.label}</span>
          </button>
        );

        return (
          <button key={t.id} onClick={() => setPage(t.id)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, background:"none", border:"none", cursor:"pointer", position:"relative", margin:"6px 2px", borderRadius:12, transition:"all .2s" }}>
            {on && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:20, height:2, borderRadius:"0 0 2px 2px", background:"var(--pu)", boxShadow:"0 0 8px var(--pu)" }}/>}
            <div style={{ color:on?"var(--pu)":"var(--t3)", transition:"color .2s" }}>
              {t.icon(on)}
            </div>
            <span style={{ fontSize:9, fontWeight:700, color:on?"var(--pu)":"var(--t3)", letterSpacing:".3px" }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}