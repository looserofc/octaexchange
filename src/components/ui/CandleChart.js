import { useStore } from "@/lib/store";
import { fmtP } from "@/lib/data";

export default function CandleChart({ sym, height = 280 }) {
  const candles = useStore(s => s.candles[sym] ?? []);
  const price   = useStore(s => s.prices[sym]);

  if (candles.length < 2) return (
    <div style={{ height, background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--t3)", fontSize:12 }}>
      Loading chart...
    </div>
  );

  const W=460, H=height;
  const pad = { l:6, r:52, t:10, b:22 };
  const cw=W-pad.l-pad.r, ch=H-pad.t-pad.b;

  const vals = candles.flatMap(c=>[c.h,c.l]);
  const rawMin=Math.min(...vals), rawMax=Math.max(...vals);
  const pm=(rawMax-rawMin)*.08||rawMax*.01;
  const min=rawMin-pm, max=rawMax+pm, range=max-min||1;

  const toY = v => pad.t + ch - ((v-min)/range)*ch;
  const n=candles.length, gap=cw/n, barW=Math.max(1.5, gap*.65);

  const labels = Array.from({length:5},(_,i)=>{
    const v=min+(i/4)*range;
    return { y:toY(v), v };
  });

  const fmt = v => v>=10000?`$${(v/1000).toFixed(1)}K`:v>=100?`$${v.toFixed(0)}`:v>=1?`$${v.toFixed(2)}`:`$${v.toFixed(4)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height,display:"block"}} preserveAspectRatio="none">
      <rect width={W} height={H} fill="#060910"/>
      {/* Grid lines */}
      {labels.map((p,i)=>(
        <g key={i}>
          <line x1={pad.l} y1={p.y} x2={W-pad.r} y2={p.y} stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
          <text x={W-pad.r+4} y={p.y+4} fill="rgba(255,255,255,.3)" fontSize="9" fontFamily="Space Mono,monospace">{fmt(p.v)}</text>
        </g>
      ))}
      {/* Candles */}
      {candles.map((c,i)=>{
        const x=pad.l+i*gap+gap/2, isUp=c.c>=c.o, clr=isUp?"#00c896":"#ff3b5c";
        const bodyT=toY(Math.max(c.o,c.c)), bodyB=toY(Math.min(c.o,c.c)), bodyH=Math.max(1,bodyB-bodyT);
        return(
          <g key={i}>
            <line x1={x} y1={toY(c.h)} x2={x} y2={toY(c.l)} stroke={clr} strokeWidth="1"/>
            <rect x={x-barW/2} y={bodyT} width={barW} height={bodyH} fill={isUp?clr:"transparent"} stroke={clr} strokeWidth="1" rx=".5"/>
          </g>
        );
      })}
      {/* Current price dashed line + label */}
      {price && (()=>{
        const py = toY(price);
        return(
          <g>
            <line x1={pad.l} y1={py} x2={W-pad.r} y2={py} stroke="var(--gold)" strokeWidth="1" strokeDasharray="4 3" opacity=".7"/>
            <rect x={W-pad.r+2} y={py-8} width={48} height={16} fill="var(--gold)" rx="3"/>
            <text x={W-pad.r+26} y={py+4.5} fill="#000" fontSize="9" fontWeight="700" fontFamily="Space Mono,monospace" textAnchor="middle">{fmt(price)}</text>
          </g>
        );
      })()}
    </svg>
  );
}