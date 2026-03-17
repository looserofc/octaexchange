import { useStore } from "@/lib/store";
import { COINS } from "@/lib/data";

function fmt(sym, price) {
  if (!price) return "0.00";
  if (price < 0.01) return price.toFixed(6);
  if (price < 1)    return price.toFixed(4);
  if (price >= 1000) return (price / 1000).toFixed(2) + "K";
  return price.toFixed(2);
}

export default function TickerTape() {
  const prices = useStore((s) => s.prices);
  const coins  = Object.values(COINS);
  const all    = [...coins, ...coins]; // doubled for seamless loop

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {all.map((c, i) => {
          const p  = prices[c.sym] ?? c.price;
          const up = c.change >= 0;
          return (
            <div key={i} className="ticker-item">
              <span style={{ color: c.color, fontWeight: 700 }}>{c.sym}</span>
              <span style={{ color: "var(--c)" }}>&nbsp;${fmt(c.sym, p)}</span>
              <span style={{ color: up ? "var(--green)" : "var(--red)" }}>
                &nbsp;{up ? "+" : ""}{c.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}