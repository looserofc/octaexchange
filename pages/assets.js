import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/router";

const App = dynamic(() => import("../src/components/App"), { ssr: false });

export default function AssetsRoute() {
  const router = useRouter();
  useEffect(() => {
    const store = useStore.getState();
    const tab = router.query.tab;
    if (tab && ["deposit","withdraw","transfer"].includes(tab)) {
      store.setAssetsTab(tab);
    }
    store.setPage("assets");
  }, [router.query.tab]);
  return <App />;
}