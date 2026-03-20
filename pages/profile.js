import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/router";

const App = dynamic(() => import("../src/components/App"), { ssr: false });

export default function ProfileRoute() {
  const router = useRouter();
  useEffect(() => {
    const store = useStore.getState();
    const screen = router.query.screen;
    if (screen) store.setProfileScreen(screen);
    store.setPage("profile");
  }, [router.query.screen]);
  return <App />;
}