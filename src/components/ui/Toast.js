// Toast
export function Toast({ toasts, remove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap">
      {toasts.map(t=>(
        <div key={t.id} className={`toast ${t.type}`} onClick={()=>remove(t.id)}>
          <span style={{fontSize:15,flexShrink:0}}>{t.type==="ok"?"✓":t.type==="err"?"✕":"ℹ"}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}