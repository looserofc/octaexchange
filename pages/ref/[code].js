// pages/ref/[code].js
// When someone clicks a referral link like: https://octatrade.com/ref/BK1F09DQ
// It redirects to signup with the referral code pre-filled

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ReferralRedirect() {
  const router = useRouter();
  const { code } = router.query;

  // useEffect(() => {
  //   if (code) {
  //     // Redirect to home page (App.js) with ref param
  //     // The AuthPage will auto-switch to signup and fill the code
  //     router.replace(`/?ref=${code}`);
  //   }
  // }, [code]);

  useEffect(() => {
  if (!router.isReady) return;
  if (code) {
    router.replace(`/?ref=${code}`);
  }
}, [router.isReady, code]);


  return (
    <div style={{
      minHeight:"100dvh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"var(--ink)",
      color:"var(--t2)",
      fontSize:14,
    }}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>🎁</div>
        <div style={{fontWeight:700,color:"var(--gold)",marginBottom:4}}>OctaExchange Referral</div>
        <div>Redirecting to sign up...</div>
      </div>
    </div>
  );
}