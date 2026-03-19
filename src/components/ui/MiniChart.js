export default function MiniChart({data=[],up=true,w=80,h=34,id="x"}){
  const uid=`mc_${id}_${up?"u":"d"}`;
  if(!data||data.length<2)return<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}><line x1="4" y1={h/2} x2={w-4} y2={h/2} stroke={up?"#00c896":"#ff3b5c"} strokeWidth="1.5" strokeLinecap="round" opacity=".4"/></svg>;
  const min=Math.min(...data),max=Math.max(...data),range=max-min||Math.abs(data[0])*.02||1,pad=4;
  const pts=data.map((v,i)=>[((i/(data.length-1))*w).toFixed(1),(h-pad-((v-min)/range)*(h-pad*2)).toFixed(1)]);
  const line=pts.map(([x,y])=>`${x},${y}`).join(" "),fill=`0,${h} ${line} ${w},${h}`,clr=up?"#00c896":"#ff3b5c",[lx,ly]=pts[pts.length-1];
  return(
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block",overflow:"visible"}}>
      <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={clr} stopOpacity=".28"/><stop offset="100%" stopColor={clr} stopOpacity="0"/></linearGradient></defs>
      <polygon points={fill} fill={`url(#${uid})`}/>
      <polyline points={line} fill="none" stroke={clr} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lx} cy={ly} r="2.5" fill={clr}/>
    </svg>
  );
}