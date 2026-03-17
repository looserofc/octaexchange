/**
 * PriceChart — SVG candlestick + line chart for coin detail page.
 * Props:
 *   candles  array of { open, close, high, low }
 *   data     number[]  line chart data (used when chartType==="line")
 *   up       boolean
 *   height   number (default 200)
 *   type     "candle" | "line"  (default "candle")
 */
export default function PriceChart({
  candles = [],
  data    = [],
  up      = true,
  height  = 200,
  type    = "candle",
  sym     = "XX",   // pass coin symbol for unique gradient IDs
}) {
  const W = 460;  // internal SVG viewBox width
  const H = height;
  const pad = { l: 8, r: 48, t: 12, b: 28 };
  const cw  = W - pad.l - pad.r;
  const ch  = H - pad.t - pad.b;

  const lineColor = up ? "#00d68f" : "#ff4560";

  // ── Candlestick chart ──────────────────────────────────
  if (type === "candle" && candles.length > 1) {
    const allValues = candles.flatMap((c) => [c.high, c.low]);
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const padding = (rawMax - rawMin) * 0.1 || rawMax * 0.02;
    const min   = rawMin - padding;
    const max   = rawMax + padding;
    const range = max - min || 1;

    const toY  = (v) => pad.t + ch - ((v - min) / range) * ch;
    const n    = candles.length;
    const barW = Math.max(2, (cw / n) * 0.65);
    const gap  = cw / n;

    // Price labels on right axis
    const priceSteps = 5;
    const priceLabels = Array.from({ length: priceSteps + 1 }, (_, i) => {
      const val = min + (i / priceSteps) * range;
      return { y: toY(val), val };
    });

    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height, display: "block" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`pc_bg_${sym}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f1420" />
            <stop offset="100%" stopColor="#060910" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#pc_bg_${sym})`} />

        {/* Grid lines */}
        {priceLabels.map((p, i) => (
          <g key={i}>
            <line
              x1={pad.l} y1={p.y} x2={W - pad.r} y2={p.y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
            <text
              x={W - pad.r + 4} y={p.y + 4}
              fill="rgba(255,255,255,0.3)"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              {p.val >= 1000
                ? "$" + (p.val / 1000).toFixed(1) + "K"
                : p.val >= 1
                ? "$" + p.val.toFixed(0)
                : "$" + p.val.toFixed(4)}
            </text>
          </g>
        ))}

        {/* Candles */}
        {candles.map((c, i) => {
          const x      = pad.l + i * gap + gap / 2;
          const isUp   = c.close >= c.open;
          const color  = isUp ? "#00d68f" : "#ff4560";
          const bodyTop = toY(Math.max(c.open, c.close));
          const bodyBot = toY(Math.min(c.open, c.close));
          const bodyH   = Math.max(1, bodyBot - bodyTop);

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={x} y1={toY(c.high)}
                x2={x} y2={toY(c.low)}
                stroke={color} strokeWidth="1"
              />
              {/* Body */}
              <rect
                x={x - barW / 2}
                y={bodyTop}
                width={barW}
                height={bodyH}
                fill={isUp ? color : "transparent"}
                stroke={color}
                strokeWidth="1"
                rx="0.5"
              />
            </g>
          );
        })}
      </svg>
    );
  }

  // ── Line chart fallback ────────────────────────────────
  const pts = data.length > 1 ? data : (candles.map((c) => c.close));
  if (pts.length < 2) return null;

  const min   = Math.min(...pts) * 0.998;
  const max   = Math.max(...pts) * 1.002;
  const range = max - min || 1;

  const toY  = (v) => pad.t + ch - ((v - min) / range) * ch;
  const toX  = (i) => pad.l + (i / (pts.length - 1)) * cw;

  const linePts  = pts.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const fillPts  = `${pad.l},${pad.t + ch} ${linePts} ${pad.l + cw},${pad.t + ch}`;

  const priceSteps = 5;
  const priceLabels = Array.from({ length: priceSteps + 1 }, (_, i) => {
    const val = min + (i / priceSteps) * range;
    return { y: toY(val), val };
  });

  const lastX = toX(pts.length - 1);
  const lastY = toY(pts[pts.length - 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height, display: "block" }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`pc_fill_${sym}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lineColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#060910" />

      {/* Grid */}
      {priceLabels.map((p, i) => (
        <g key={i}>
          <line x1={pad.l} y1={p.y} x2={W - pad.r} y2={p.y}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <text x={W - pad.r + 4} y={p.y + 4}
            fill="rgba(255,255,255,0.3)" fontSize="9"
            fontFamily="JetBrains Mono, monospace">
            {p.val >= 1000 ? "$" + (p.val / 1000).toFixed(1) + "K"
              : p.val >= 1 ? "$" + p.val.toFixed(0)
              : "$" + p.val.toFixed(4)}
          </text>
        </g>
      ))}

      {/* Fill */}
      <polygon points={fillPts} fill={`url(#pc_fill_${sym})`} />

      {/* Line */}
      <polyline points={linePts} fill="none"
        stroke={lineColor} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Last price dot */}
      <circle cx={lastX} cy={lastY} r="3" fill={lineColor} />
      <circle cx={lastX} cy={lastY} r="6" fill={lineColor} opacity="0.2" />
    </svg>
  );
}