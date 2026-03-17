import { useEffect } from "react";
import { useStore } from "@/lib/store";

import AuthPage    from "./auth/AuthPage";
import BottomNav   from "./layout/BottomNav";
import Toast       from "./ui/Toast";
import AdminPanel  from "./admin/AdminPanel";

import HomePage    from "./pages/HomePage";
import MarketPage  from "./pages/MarketPage";
import TradePage   from "./pages/TradePage";
import AssetsPage  from "./pages/AssetsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const {
    user,
    page,        setPage,
    adminAuthed, setAdminAuthed,
    setShowAdmin,
    toasts,      removeToast,
    tickPrices,  fetchRealPrices,
  } = useStore();

  // ── Real prices on mount + every 60s ─────────────────────
  useEffect(() => {
    fetchRealPrices();
    const t = setInterval(fetchRealPrices, 60_000);
    return () => clearInterval(t);
  }, [fetchRealPrices]);

  // ── Simulated drift every 3s ──────────────────────────────
  useEffect(() => {
    const t = setInterval(tickPrices, 3000);
    return () => clearInterval(t);
  }, [tickPrices]);

  // ── Admin is logged in → show admin panel ────────────────
  if (adminAuthed) {
    return (
      <>
        <Toast toasts={toasts} remove={removeToast} />
        <AdminPanel onExit={() => { setAdminAuthed(false); setShowAdmin(false); }} />
      </>
    );
  }

  // ── No user → show login/signup ───────────────────────────
  if (!user) {
    return (
      <>
        <Toast toasts={toasts} remove={removeToast} />
        <AuthPage />
      </>
    );
  }

  // ── User logged in → show dashboard ──────────────────────
  const PAGES = {
    home:    <HomePage    setPage={setPage} />,
    market:  <MarketPage />,
    trade:   <TradePage />,
    assets:  <AssetsPage />,
    profile: <ProfilePage />,
  };

  return (
    <>
      <Toast toasts={toasts} remove={removeToast} />
      <div className="shell">
        <div className="page">
          {PAGES[page] ?? PAGES.home}
        </div>
        <BottomNav page={page} setPage={setPage} />
      </div>
    </>
  );
}