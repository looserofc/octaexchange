import { useState, useRef, useCallback } from "react";
import { useStore } from "@/lib/store";
import { COINS } from "@/lib/data";
import CoinIcon  from "@/components/ui/CoinIcon";
import Countdown from "@/components/ui/Countdown";

function fmt(sym, price) {
  if (!price) return "0.00";
  if (price < 1) return price.toFixed(4);
  if (price >= 1000) return (price / 1000).toFixed(2) + "K";
  return price.toFixed(2);
}

export default function TradePage() {
  const {
    user, signals, prices,
    activeTrades, addTrade, removeTrade,
    orderHistory, addOrder,
    addToast, addTx,
  } = useStore();

  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [ok,      setOk]      = useState("");
  const usedRef = useRef(new Set());

  // ── Validate & submit signal code ──────────────────────
  const submit = () => {
    const c = code.trim().toUpperCase();
    setErr(""); setOk("");

    if (!c)                         { setErr("Please enter a signal code."); return; }
    if (usedRef.current.has(c))     { setErr("You have already used this code."); return; }

    const sig = signals[c];
    if (!sig)                       { setErr("Invalid signal code. Please check and try again."); return; }
    if (Date.now() - sig.created > sig.ttl) { setErr("This signal code has expired."); return; }

    setLoading(true);
    setTimeout(() => {
      const profit = user.tier.price * 0.01;
      const trade = {
        id:     "t" + Date.now(),
        pair:   sig.pair,
        coin:   sig.coin,
        code:   c,
        profit,
        entry:  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      usedRef.current.add(c);
      addTrade(trade);
      setCode("");
      setOk(`✓ Trade opened! You will earn +$${profit.toFixed(2)} in 5 minutes.`);
      addToast(`Trade started: ${sig.pair}`, "ok");
      setLoading(false);
    }, 600);
  };

  // ── Trade completes after countdown ────────────────────
  const completeTrade = useCallback((tradeId) => {
    const trade = activeTrades.find((t) => t.id === tradeId);
    if (!trade) return;
    const order = {
      id:        trade.id,
      pair:      trade.pair,
      coin:      trade.coin,
      code:      trade.code,
      profit:    trade.profit,
      tierPrice: user.tier.price,
      startTime: trade.entry,
      endTime:   new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      date:      new Date().toLocaleDateString(),
    };
    addOrder(order);
    removeTrade(tradeId);
    addTx({ id: "tx" + Date.now(), type: "trade_profit", amount: trade.profit, coin: trade.pair, status: "completed", date: new Date().toLocaleDateString() });
    addToast(`+$${trade.profit.toFixed(2)} earned — ${trade.pair} ✓`, "ok");
  }, [activeTrades, user.tier.price, addOrder, removeTrade, addTx, addToast]);

  return (
    <div>
      {/* Header */}
      <div className="hdr">
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px" }}>Copy Trade</span>
        {activeTrades.length > 0 && (
          <span className="badge badge-cyan" style={{ marginLeft: "auto" }}>
            {activeTrades.length} live
          </span>
        )}
      </div>

      <div style={{ padding: "16px" }}>

        {/* ── Signal code input card ──────────────────────── */}
        <div className="card" style={{ padding: 18, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Enter Signal Code</div>
              <div style={{ fontSize: 12, color: "var(--c2)", marginTop: 1 }}>From WhatsApp / Telegram group</div>
            </div>
          </div>

          {/* Input */}
          <input
            className="inp inp-mono"
            placeholder="e.g. BTC9421"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(""); setOk(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ marginBottom: 12, borderColor: err ? "var(--red)" : "" }}
          />

          {/* Error */}
          {err && (
            <div style={{
              background: "rgba(255,69,96,0.08)", border: "1px solid rgba(255,69,96,0.2)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 12,
              color: "var(--red)", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {err}
            </div>
          )}

          {/* Success */}
          {ok && (
            <div style={{
              background: "rgba(0,214,143,0.08)", border: "1px solid rgba(0,214,143,0.2)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 12,
              color: "var(--green)", fontSize: 13,
            }}>
              {ok}
            </div>
          )}

          {/* Submit button */}
          <button
            className="btn btn-gold btn-block"
            onClick={submit}
            disabled={loading || !code.trim()}
            style={{ fontSize: 15 }}
          >
            {loading
              ? <><span className="spin" /> Validating...</>
              : "Submit Signal Code"
            }
          </button>

          {/* Demo hint */}
          <div style={{
            marginTop: 12, padding: "10px 14px",
            background: "rgba(0,198,255,0.05)", border: "1px solid rgba(0,198,255,0.12)",
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "var(--fm)", fontWeight: 700, marginBottom: 3, letterSpacing: "0.5px" }}>
              DEMO CODES
            </div>
            <div style={{ fontSize: 12, color: "var(--c2)", fontFamily: "var(--fm)" }}>
              BTC9421 · ETH7364 · SOL1982 · BNB4471
            </div>
          </div>
        </div>

        {/* ── Active trades ───────────────────────────────── */}
        {activeTrades.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.3px" }}>Active Trades</span>
              <span className="badge badge-cyan">{activeTrades.length}</span>
            </div>

            {activeTrades.map((trade) => {
              const coin  = COINS[trade.coin];
              const price = prices[trade.coin] ?? coin?.price ?? 0;
              return (
                <div key={trade.id} className="card2" style={{
                  padding: 16, marginBottom: 10,
                  border: "1px solid rgba(0,198,255,0.2)",
                  background: "linear-gradient(135deg,rgba(0,198,255,0.04),rgba(0,100,200,0.02))",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    {/* Left */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Pair + code + LIVE badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        <CoinIcon sym={trade.coin} size={32} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15 }}>{trade.pair}</div>
                          <div style={{ fontSize: 11, color: "var(--c2)", fontFamily: "var(--fm)" }}>{trade.code}</div>
                        </div>
                        <span className="badge badge-cyan" style={{ marginLeft: "auto" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", display: "inline-block", animation: "blink 1s infinite" }} />
                          {" "}LIVE
                        </span>
                      </div>

                      {/* Stats */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ background: "var(--bg2)", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", marginBottom: 3, letterSpacing: "0.5px" }}>ENTRY PRICE</div>
                          <div style={{ fontFamily: "var(--fm)", fontSize: 13, fontWeight: 700 }}>${fmt(trade.coin, price)}</div>
                        </div>
                        <div style={{ background: "rgba(0,214,143,0.06)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(0,214,143,0.1)" }}>
                          <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", marginBottom: 3, letterSpacing: "0.5px" }}>PROFIT</div>
                          <div style={{ fontFamily: "var(--fm)", fontSize: 14, fontWeight: 800, color: "var(--green)" }}>+${trade.profit.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Countdown */}
                    <div style={{ marginLeft: 14, flexShrink: 0 }}>
                      <Countdown totalSeconds={300} onDone={() => completeTrade(trade.id)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Order history ───────────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.3px" }}>Order History</span>
            <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>{orderHistory.length} completed</span>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 68px 80px",
              gap: 8, padding: "11px 16px 9px",
              borderBottom: "1px solid var(--b1)",
            }}>
              {["PAIR", "STATUS", "PROFIT"].map((h) => (
                <div key={h} style={{
                  fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)",
                  letterSpacing: "0.8px",
                  textAlign: h === "PROFIT" ? "right" : h === "STATUS" ? "center" : "left",
                }}>
                  {h}
                </div>
              ))}
            </div>

            {orderHistory.length === 0 ? (
              <div className="empty" style={{ padding: "32px 20px" }}>
                <div className="empty-icon">📋</div>
                <p>No completed trades yet.<br />Enter a signal code to start.</p>
              </div>
            ) : (
              <div style={{ padding: "0 16px" }}>
                {orderHistory.slice(0, 20).map((order, i) => (
                  <div
                    key={order.id}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 68px 80px",
                      gap: 8, alignItems: "center",
                      padding: "12px 0",
                      borderBottom: i < Math.min(19, orderHistory.length - 1) ? "1px solid var(--b1)" : "none",
                    }}
                  >
                    {/* Pair */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <CoinIcon sym={order.coin} size={30} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{order.pair}</div>
                        <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", marginTop: 1 }}>
                          {order.startTime ?? order.date}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{ textAlign: "center" }}>
                      <span className="badge badge-up" style={{ fontSize: 10, padding: "3px 7px" }}>Done</span>
                    </div>

                    {/* Profit */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "var(--green)", fontFamily: "var(--fm)", fontSize: 14, fontWeight: 800 }}>
                        +${order.profit.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--c3)", fontFamily: "var(--fm)", marginTop: 1 }}>
                        {order.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}