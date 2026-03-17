
import { useState, useEffect } from "react";

/**
 * Circular countdown timer.
 * Props:
 *   totalSeconds - how many seconds to count down (default 300 = 5 min)
 *   onDone       - callback when timer reaches 0
 */
export default function Countdown({ totalSeconds = 300, onDone }) {
  const [seconds, setSeconds] = useState(totalSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onDone?.();
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onDone]);

  const m    = Math.floor(seconds / 60);
  const s    = seconds % 60;
  const pct  = (seconds / totalSeconds) * 100;
  const r    = 26;
  const circ = 2 * Math.PI * r;

  const color =
    seconds < 60  ? "var(--red)"  :
    seconds < 120 ? "var(--gold)" :
    "var(--cyan)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: 60, height: 60 }}>
        {/* SVG ring */}
        <svg
          width={60} height={60}
          viewBox="0 0 60 60"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background track */}
          <circle cx={30} cy={30} r={r} fill="none" stroke="var(--border2)" strokeWidth={3.5} />
          {/* Progress arc */}
          <circle
            cx={30} cy={30} r={r}
            fill="none"
            stroke={color}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
          />
        </svg>

        {/* Time label */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11, fontWeight: 700,
          color,
          animation: "countFlash 2s infinite",
        }}>
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </div>
      </div>

      <span style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--font-mono)" }}>
        left
      </span>
    </div>
  );
}
