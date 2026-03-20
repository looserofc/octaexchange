import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useStore } from "@/lib/store";
import AuthPage    from "./auth/AuthPage";
import AdminPanel  from "./admin/AdminPanel";
import BottomNav   from "./layout/BottomNav";
import { Toast }   from "./ui/Toast";
import HomePage    from "./pages/HomePage";
import MarketPage  from "./pages/MarketPage";
import TradePage   from "./pages/TradePage";
import FuturesPage from "./pages/FuturesPage";
import AssetsPage  from "./pages/AssetsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const {
    user, page, setPage,
    adminAuthed, setAdminAuthed, adminRole, setAdminRole, setShowAdmin,
    toasts, removeToast, tickPrices, fetchRealPrices,
    setAssetsTab, setProfileScreen,
  } = useStore();

  const router = useRouter();

  // navigate(page, opts) — updates both store state and browser URL
  const navigate = useCallback((p, opts = {}) => {
    const { tab, screen } = opts || {};

    // Set sub-state
    if (tab)    setAssetsTab(tab);
    if (screen) setProfileScreen(screen);

    // Build URL
    let url = "/";
    if (p === "home")    url = "/";
    else if (p === "market")  url = "/market";
    else if (p === "trade")   url = "/trade";
    else if (p === "futures") url = "/futures";
    else if (p === "assets")  url = tab ? `/assets?tab=${tab}` : "/assets";
    else if (p === "profile") url = screen ? `/profile?screen=${screen}` : "/profile";

    setPage(p);
    if (router.asPath !== url) {
      router.push(url, undefined, { shallow: true });
    }
  }, [router, setPage, setAssetsTab, setProfileScreen]);

  // Expose navigate so any component can call it
  useEffect(() => {
    useStore.getState()._navigate = navigate;
  }, [navigate]);

  useEffect(() => {
    fetchRealPrices();
    const t = setInterval(fetchRealPrices, 60_000);
    return () => clearInterval(t);
  }, [fetchRealPrices]);

  useEffect(() => {
    const t = setInterval(tickPrices, 2000);
    return () => clearInterval(t);
  }, [tickPrices]);

  if (adminAuthed) return (
    <><Toast toasts={toasts} remove={removeToast}/>
    <AdminPanel role={adminRole} onExit={() => {
      setAdminAuthed(false); setAdminRole(null); setShowAdmin(false);
    }}/></>
  );

  if (!user) return (
    <><Toast toasts={toasts} remove={removeToast}/><AuthPage/></>
  );

  const PAGES = {
    home:    <HomePage    setPage={navigate}/>,
    market:  <MarketPage  setPage={navigate}/>,
    trade:   <TradePage   setPage={navigate}/>,
    futures: <FuturesPage setPage={navigate}/>,
    assets:  <AssetsPage  setPage={navigate}/>,
    profile: <ProfilePage setPage={navigate}/>,
  };

  return (
    <><Toast toasts={toasts} remove={removeToast}/>
    <div className="shell">
      <div className="page">{PAGES[page] ?? PAGES.home}</div>
      <BottomNav page={page} setPage={(p) => navigate(p)}/>
    </div></>
  );
}