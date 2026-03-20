import { useEffect, useRef } from "react";

/**
 * TradingViewChart
 * Embeds the real TradingView Advanced Chart widget.
 * Uses the official TradingView embed script — shows LIVE candle data
 * from Binance/crypto exchanges in real time.
 *
 * Props:
 *   sym      string  — e.g. "BTC", "ETH", "SOL"
 *   interval string  — "1", "5", "15", "60", "D" (default "60" = 1H)
 *   height   number  — chart height in px (default 380)
 */
export default function TradingViewChart({ sym = "BTC", interval = "60", height = 380 }) {
  const containerRef = useRef(null);
  const widgetId     = useRef(`tv_${sym}_${Date.now()}`).current;
  const heightVal    = typeof height === "string" ? "100%" : height + "px";

  // Map our coin symbols to TradingView symbols (Binance feed)
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

  const tvSym = TV_SYMBOL_MAP[sym] ?? `BINANCE:${sym}USDT`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = "";

    // Create wrapper div that TradingView targets
    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";
    wrapper.style.height = heightVal;
    wrapper.style.width  = "100%";
    container.appendChild(wrapper);

    // Create & inject the TradingView script
    const script = document.createElement("script");
    script.src   = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type  = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize:          false,
      width:             "100%",
      height:            typeof height === "number" ? height : 480,
      symbol:            tvSym,
      interval:          interval,
      timezone:          "Etc/UTC",
      theme:             "dark",
      style:             "1",           // 1 = Candles
      locale:            "en",
      backgroundColor:   "#060910",
      gridColor:         "rgba(30,42,62,0.5)",
      hide_top_toolbar:  false,
      hide_legend:       false,
      save_image:        false,
      hide_volume:       false,
      support_host:      "https://www.tradingview.com",
      container_id:      widgetId,
      withdateranges:    true,
      allow_symbol_change: false,
      details:           false,
      hotlist:           false,
      calendar:          false,
      studies:           [],
      show_popup_button: false,
      // Color overrides to match our dark theme
      overrides: {
        "mainSeriesProperties.candleStyle.upColor":             "#00d68f",
        "mainSeriesProperties.candleStyle.downColor":           "#ff4560",
        "mainSeriesProperties.candleStyle.wickUpColor":         "#00d68f",
        "mainSeriesProperties.candleStyle.wickDownColor":       "#ff4560",
        "mainSeriesProperties.candleStyle.borderUpColor":       "#00d68f",
        "mainSeriesProperties.candleStyle.borderDownColor":     "#ff4560",
        "paneProperties.background":                            "#060910",
        "paneProperties.backgroundType":                        "solid",
        "paneProperties.vertGridProperties.color":              "rgba(30,42,62,0.4)",
        "paneProperties.horzGridProperties.color":              "rgba(30,42,62,0.4)",
        "scalesProperties.textColor":                           "#7b8fb5",
        "scalesProperties.backgroundColor":                     "#060910",
      },
    });

    wrapper.id = widgetId;
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [sym, interval, height]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{
        width:  "100%",
        height: heightVal,
        background: "#060910",
        overflow: "hidden",
      }}
    />
  );
}