import { useEffect, useRef, useState } from "react";

const TV_SYMBOL_MAP = {
  BTC:   "BINANCE:BTCUSDT",
  ETH:   "BINANCE:ETHUSDT",
  BNB:   "BINANCE:BNBUSDT",
  SOL:   "BINANCE:SOLUSDT",
  XRP:   "BINANCE:XRPUSDT",
  ADA:   "BINANCE:ADAUSDT",
  DOGE:  "BINANCE:DOGEUSDT",
  AVAX:  "BINANCE:AVAXUSDT",
  DOT:   "BINANCE:DOTUSDT",
  MATIC: "BINANCE:MATICUSDT",
};

const INTERVAL_MAP = {
  "1":   "1",
  "5":   "5",
  "15":  "15",
  "60":  "60",
  "240": "240",
  "D":   "1D",
  "1D":  "1D",
  "1W":  "1W",
  "1H":  "60",
  "4H":  "240",
};

function initWidget(uid, tvSym, tvInt, setLoading) {
  try {
    new window.TradingView.widget({
      autosize:            true,
      symbol:              tvSym,
      interval:            tvInt,
      timezone:            "Etc/UTC",
      theme:               "dark",
      style:               "1",
      locale:              "en",
      backgroundColor:     "#07090f",
      gridColor:           "rgba(28,36,54,0.5)",
      hide_top_toolbar:    false,
      hide_legend:         false,
      hide_side_toolbar:   true,
      allow_symbol_change: false,
      save_image:          false,
      hide_volume:         false,
      withdateranges:      true,
      details:             false,
      hotlist:             false,
      calendar:            false,
      show_popup_button:   false,
      container_id:        uid,
      studies:             [],
      overrides: {
        "mainSeriesProperties.candleStyle.upColor":           "#00c896",
        "mainSeriesProperties.candleStyle.downColor":         "#ff3b5c",
        "mainSeriesProperties.candleStyle.wickUpColor":       "#00c896",
        "mainSeriesProperties.candleStyle.wickDownColor":     "#ff3b5c",
        "mainSeriesProperties.candleStyle.borderUpColor":     "#00c896",
        "mainSeriesProperties.candleStyle.borderDownColor":   "#ff3b5c",
        "paneProperties.background":                          "#07090f",
        "paneProperties.backgroundType":                      "solid",
        "paneProperties.vertGridProperties.color":            "rgba(28,36,54,0.4)",
        "paneProperties.horzGridProperties.color":            "rgba(28,36,54,0.4)",
        "scalesProperties.textColor":                         "#4a5568",
        "scalesProperties.backgroundColor":                   "#07090f",
      },
    });
    setTimeout(() => setLoading(false), 800);
  } catch (e) {
    console.warn("TV widget error:", e);
    setLoading(false);
  }
}

export default function TradingViewChart({ sym = "BTC", interval = "60", height = 300 }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const tvSym = TV_SYMBOL_MAP[sym] ?? `BINANCE:${sym}USDT`;
  const tvInt = INTERVAL_MAP[String(interval)] ?? "60";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setLoading(true);
    el.innerHTML = "";

    // Each instance needs a unique DOM id
    const uid = `tv_${sym}_${tvInt}_${Math.random().toString(36).slice(2, 7)}`;

    const widgetDiv = document.createElement("div");
    widgetDiv.id           = uid;
    widgetDiv.style.width  = "100%";
    widgetDiv.style.height = height + "px";
    el.appendChild(widgetDiv);

    const fallback = setTimeout(() => setLoading(false), 6000);

    if (typeof window.TradingView !== "undefined") {
      // tv.js already cached — init directly
      initWidget(uid, tvSym, tvInt, setLoading);
    } else {
      // Load tv.js once, then init
      const existing = document.getElementById("tv-script");
      if (existing) {
        // Script tag exists but TradingView not ready yet — wait
        existing.addEventListener("load", () => initWidget(uid, tvSym, tvInt, setLoading), { once: true });
      } else {
        const script    = document.createElement("script");
        script.id       = "tv-script";
        script.src      = "https://s3.tradingview.com/tv.js";
        script.async    = true;
        script.onload   = () => initWidget(uid, tvSym, tvInt, setLoading);
        script.onerror  = () => setLoading(false);
        document.head.appendChild(script);
      }
    }

    return () => {
      clearTimeout(fallback);
      el.innerHTML = "";
    };
  }, [sym, tvInt]);

  return (
    <div style={{ position:"relative", width:"100%", height, background:"#07090f", overflow:"hidden" }}>

      {/* Skeleton loader */}
      {loading && (
        <div style={{
          position:"absolute", inset:0, zIndex:2,
          background:"#07090f",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:14,
        }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:80 }}>
            {[30,50,25,65,42,80,35,58,48,72,32,60,50,75,44].map((h, i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <div style={{ width:1.5, height:6, background:i%2===0?"rgba(0,200,150,.2)":"rgba(255,59,92,.2)", borderRadius:1 }}/>
                <div style={{
                  width:9, height: h * 0.65,
                  borderRadius:2,
                  background: i%2===0 ? `rgba(0,200,150,${0.2+(i%4)*0.06})` : `rgba(255,59,92,${0.2+(i%4)*0.06})`,
                  animation: `tvPulse 1.4s ${i*0.07}s ease-in-out infinite`,
                }}/>
                <div style={{ width:1.5, height:5, background:i%2===0?"rgba(0,200,150,.2)":"rgba(255,59,92,.2)", borderRadius:1 }}/>
              </div>
            ))}
          </div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.18)", fontFamily:"var(--m)", letterSpacing:"1px" }}>Loading...</span>
        </div>
      )}

      <style>{`@keyframes tvPulse{0%,100%{opacity:.35}50%{opacity:1}}`}</style>

      {/* Widget mounts here */}
      <div
        ref={containerRef}
        style={{ width:"100%", height:"100%", opacity:loading?0:1, transition:"opacity .5s" }}
      />
    </div>
  );
}