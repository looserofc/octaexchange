// src/components/ui/Countdown.js
// Fixed: Uses expiresAt timestamp from backend instead of counting from mount time
// This means page refresh shows correct remaining time

import { useState, useEffect, useRef, useCallback } from "react";

export default function Countdown({ totalSeconds = 300, onDone, expiresAt }) {
  const calcSecs = useCallback(() => {
    // If expiresAt from API is available, use it (survives page refresh)
    if (expiresAt) {
      return Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
    }
    // Fallback to totalSeconds from mount (used if no expiresAt provided)
    return totalSeconds;
  }, [expiresAt, totalSeconds]);

  const [secs, setSecs] = useState(calcSecs);
  const doneRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Reset when expiresAt changes
    doneRef.current = false;
    setSecs(calcSecs());
  }, [expiresAt, calcSecs]);

  useEffect(() => {
    if (secs <= 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecs(prev => {
        const next = expiresAt
          ? Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
          : Math.max(0, prev - 1);

        if (next === 0 && !doneRef.current) {
          doneRef.current = true;
          // Call onDone after render
          setTimeout(() => onDone?.(), 0);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]); // Only depend on expiresAt, not onDone (prevents reset on re-render)

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const pct = expiresAt
    ? Math.min(100, (secs / 300) * 100)
    : (secs / totalSeconds) * 100;
  const color = secs > 60 ? "var(--up)" : secs > 30 ? "var(--gold)" : "var(--dn)";

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
      <svg width={44} height={44} viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="19" fill="none" stroke="var(--ln2)" strokeWidth="3"/>
        <circle
          cx="22" cy="22" r="19" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 19}`}
          strokeDashoffset={`${2 * Math.PI * 19 * (1 - pct / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          style={{ transition:"stroke-dashoffset 1s linear, stroke .5s" }}
        />
        <text x="22" y="22" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize:10, fontFamily:"var(--m)", fontWeight:700, fill:color }}>
          {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
        </text>
      </svg>
      <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--m)" }}>remaining</div>
    </div>
  );
}