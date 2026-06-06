// pages/_app.js

import "../src/styles/globals.css";
import Head from "next/head";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function MyApp({ Component, pageProps }) {
  const { setUser, setAdminAuthed, setAdminRole, setShowAdmin, fetchNotifs, fetchUserHistory, loadActiveTrades, startTradePolling, fetchPendingVolume } = useStore();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const restoreSession = async () => {
      try {
        const hasLoggedOut = sessionStorage.getItem("manualLogout");
        if (hasLoggedOut === "true") return;

        const rr = await fetch(`${API}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!rr.ok) return;

        const rd    = await rr.json();
        const token = rd.data?.accessToken || rd.accessToken;
        if (!token) return;

        useStore.getState().setToken(token);

        let user = rd.data?.user;
        if (!user) {
          const pr = await fetch(`${API}/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (!pr.ok) return;
          const pd = await pr.json();
          user = pd.data?.user || pd.data;
        }
        if (!user) return;

        sessionStorage.removeItem("manualLogout");

        if (user.role === "main_admin") {
          setAdminAuthed(true); setAdminRole("main"); setShowAdmin(true);
          useStore.setState({ user, page: "home" });
          return;
        }
        if (user.role === "sub_admin") {
          setAdminAuthed(true); setAdminRole("second"); setShowAdmin(true);
          useStore.setState({ user, page: "home" });
          return;
        }

        const uid = "OCT" + (user._id || user.id || "").slice(-6).toUpperCase();
        setUser({
          id:             user._id || user.id, uid,
          username:       user.username || user.fullName || user.email?.split("@")[0],
          name:           user.fullName || user.username,
          email:          user.email, phone: user.phone || "",
          avatar:         (user.fullName || user.username || "?")[0].toUpperCase(),
          fundingBalance: user.fundingBalance  || 0,
          tradingBalance: user.tradingBalance  || 0,
          tradingFreezeUntil: 0, tier: user.tier || null,
          totalProfit:    user.totalProfit     || 0,
          totalTrades:    user.totalTrades     || 0,
          kycStatus:      user.kycStatus       || null,
          referralCode:   user.referralCode    || "",
          referralCount:  user.teamCount       || 0,
          referrals: [], referredBy: user.referredBy || null,
          joinDate:       user.createdAt?.split("T")[0] || "",
          role:           user.role || "user",
        });

        useStore.setState({ page: "home" });

        // ── Deferred loading — critical UI first, rest after ──
fetchNotifs();
fetchPendingVolume();

// Load active trades THEN start polling immediately after
loadActiveTrades().then(() => {
  startTradePolling();
});

// Defer heavy history load
setTimeout(() => {
  fetchUserHistory();
}, 2000);

      } catch (err) {
        console.error("Session restore error:", err);
      }
    };

    restoreSession();
  }, []);

  return (
    <>
      <Head>
        <title>OctaExchange — Smart Crypto Investment</title>
        <meta name="description" content="Signal-based crypto copy trading platform"/>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/>
        <meta name="theme-color" content="#07090f"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        </Head>
      <Component {...pageProps}/>
    </>
  );
}