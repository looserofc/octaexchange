import { useStore } from "@/lib/store";
import { COINS, fmtP } from "@/lib/data";

export default function TickerTape() {
  const prices = useStore(s=>s.prices);
  const coins  = Object.values(COINS);
  const all    = [...coins,...coins];
  return (
    <div className="ticker">
      <div className="tt">
        {all.map((c,i)=>{
          const p=prices[c.sym]??c.price, up=c.change>=0;
          return(
            <div key={i} className="ti">
              <span style={{color:c.color,fontWeight:700}}>{c.sym}</span>
              <span style={{color:"var(--t1)"}}>&nbsp;${fmtP(c.sym,p)}</span>
              <span style={{color:up?"var(--up)":"var(--dn)"}}>&nbsp;{up?"+":""}{c.change.toFixed(2)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}