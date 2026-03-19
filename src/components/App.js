import { useEffect, useRef, useState } from "react";
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

const PAGE_TO_PATH = {
  home:    "/",
  market:  "/market",
  trade:   "/trade",
  futures: "/futures",
  assets:  "/assets",
  profile: "/profile",
};

const PATH_TO_PAGE = {
  "/":         "home",
  "/market":   "market",
  "/trade":    "trade",
  "/futures":  "futures",
  "/assets":   "assets",
  "/profile":  "profile",
  "/deposit":  "assets",
  "/withdraw": "assets",
  "/transfer": "assets",
  "/support":  "profile",
};

export default function App({ initialRoute = null }) {
  const router = useRouter();
  const {
    user, page, setPage,
    adminAuthed, setAdminAuthed, setShowAdmin,
    toasts, removeToast,
    tickPrices, fetchRealPrices,
  } = useStore();

  // Single source of truth: one object for current nav state
  const [nav, setNav] = useState(() => {
    // Determine from initialRoute prop (from /deposit, /withdraw etc page files)
    if (initialRoute) {
      if (["deposit","withdraw","transfer"].includes(initialRoute))
        return { page:"assets",  assetsScreen:initialRoute, profileScreen:null };
      if (initialRoute === "support")
        return { page:"profile", assetsScreen:null, profileScreen:"support" };
    }
    return { page:"home", assetsScreen:null, profileScreen:null };
  });

  // Sync Zustand page with nav.page
  useEffect(() => {
    setPage(nav.page);
  }, [nav.page]);

  // Price feeds
  useEffect(() => {
    fetchRealPrices();
    const t = setInterval(fetchRealPrices, 60_000);
    return () => clearInterval(t);
  }, [fetchRealPrices]);

  useEffect(() => {
    const t = setInterval(tickPrices, 2000);
    return () => clearInterval(t);
  }, [tickPrices]);

  // Navigate to a main page tab (BottomNav, etc)
  const navigate = (p) => {
    setNav({ page: p, assetsScreen: null, profileScreen: null });
    router.push(PAGE_TO_PATH[p] ?? "/", undefined, { shallow: true });
  };

  // Navigate directly to Assets sub-screen
  const goAssets = (scr) => {
    setNav({ page:"assets", assetsScreen:scr, profileScreen:null });
    router.push("/" + scr, undefined, { shallow: true });
  };

  // Navigate directly to Profile sub-screen
  const goProfile = (scr) => {
    setNav({ page:"profile", assetsScreen:null, profileScreen:scr });
    router.push("/" + scr, undefined, { shallow: true });
  };

  // Handle browser back/forward button
  useEffect(() => {
    const path = router.pathname;
    if (path === "/deposit")  { setNav({ page:"assets",  assetsScreen:"deposit",  profileScreen:null }); return; }
    if (path === "/withdraw") { setNav({ page:"assets",  assetsScreen:"withdraw", profileScreen:null }); return; }
    if (path === "/transfer") { setNav({ page:"assets",  assetsScreen:"transfer", profileScreen:null }); return; }
    if (path === "/support")  { setNav({ page:"profile", assetsScreen:null, profileScreen:"support" }); return; }
    const p = PATH_TO_PAGE[path];
    if (p) setNav({ page:p, assetsScreen:null, profileScreen:null });
  }, [router.pathname]);

  if (adminAuthed) return (
    <>
      <Toast toasts={toasts} remove={removeToast}/>
      <AdminPanel onExit={() => { setAdminAuthed(false); setShowAdmin(false); }}/>
    </>
  );

  if (!user) return (
    <>
      <Toast toasts={toasts} remove={removeToast}/>
      <AuthPage/>
    </>
  );

  const { page: currentPage, assetsScreen, profileScreen } = nav;

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setPage={navigate} goAssets={goAssets} goProfile={goProfile}/>;
      case "market":
        return <MarketPage setPage={navigate}/>;
      case "trade":
        return <TradePage/>;
      case "futures":
        return <FuturesPage/>;
      case "assets":
        return <AssetsPage
          key={"assets|" + (assetsScreen || "main")}
          screen={assetsScreen}
          setScreen={(s) => {
            // Internal sub-screens (address, records) don't change URL
            // Only the deep-link screens (deposit, withdraw, transfer) have URLs
            setNav(prev => ({ ...prev, assetsScreen: s }));
          }}
        />;
      case "profile":
        return <ProfilePage
          key={"profile|" + (profileScreen || "main")}
          screen={profileScreen}
          setScreen={(s) => {
            // Internal sub-screens never change the URL — just update state
            setNav(prev => ({ ...prev, profileScreen: s }));
          }}
        />;
      default:
        return <HomePage setPage={navigate} goAssets={goAssets} goProfile={goProfile}/>;
    }
  };

  return (
    <>
      <Toast toasts={toasts} remove={removeToast}/>
      <div className="shell">
        <div className="page">{renderPage()}</div>
        <BottomNav page={currentPage} setPage={navigate}/>
      </div>
    </>
  );
}