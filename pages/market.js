import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

const App = dynamic(() => import("../src/components/App"), { ssr: false });

export default function MarketRoute() {
  useEffect(() => {
    useStore.getState().setPage("market");
  }, []);
  return <App />;
}