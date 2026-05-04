// pages/_app.js

import "../src/styles/globals.css";
import Head from "next/head";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function MyApp({ Component, pageProps }) {
  const { setUser, setAdminAuthed, setAdminRole, setShowAdmin, fetchNotifs, fetchUserHistory, loadActiveTrades } = useStore();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const restoreSession = async () => {
      try {
        // If user manually logged out, skip restore entirely
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

        // Clear logout flag only after confirmed valid session
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

        fetchNotifs();
        fetchUserHistory();
        loadActiveTrades();

      } catch (_) {}
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
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      </Head>
      <Component {...pageProps}/>
    </>
  );
}