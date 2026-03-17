/**
 * MiniChart — SVG sparkline
 * CRITICAL FIX: each chart needs a unique gradient ID.
 * When multiple charts share the same id (e.g. "sg_u"), the browser
 * uses the LAST defined one for ALL charts → most look blank.
 * Fix: pass `id` prop (coin symbol) to make each gradient unique.
 */

let _counter = 0; // fallback counter for unnamed instances

export default function MiniChart({ data = [], up = true, w = 80, h = 36, id }) {
  // Unique ID for SVG gradient — avoids clashing across multiple chart instances
  const uid = id ? `mc_${id}_${up ? "u" : "d"}` : `mc_${++_counter}`;

  if (!data || data.length < 2) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
        <line x1="4" y1={h / 2} x2={w - 4} y2={h / 2}
          stroke={up ? "#00d68f" : "#ff4560"} strokeWidth="1.5"
          strokeLinecap="round" opacity="0.4" />
      </svg>
    );
  }

  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || Math.abs(data[0]) * 0.02 || 1;
  const pad   = 4;

  const toX = (i) => (i / (data.length - 1)) * w;
  const toY = (v) => h - pad - ((v - min) / range) * (h - pad * 2);

  const pts       = data.map((v, i) => [toX(i), toY(v)]);
  const lineStr   = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const fillStr   = `0,${h} ${lineStr} ${w},${h}`;

  const color     = up ? "#00d68f" : "#ff4560";
  const [lx, ly]  = pts[pts.length - 1];

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <polygon points={fillStr} fill={`url(#${uid})`} />

      {/* Line */}
      <polyline
        points={lineStr}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Last dot */}
      <circle cx={lx.toFixed(1)} cy={ly.toFixed(1)} r="2.5" fill={color} />
    </svg>
  );
}