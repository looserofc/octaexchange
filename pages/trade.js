import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

const App = dynamic(() => import("../src/components/App"), { ssr: false });

export default function TradeRoute() {
  useEffect(() => {
    useStore.getState().setPage("trade");
  }, []);
  return <App />;
}