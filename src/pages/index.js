// src/pages/index.js
// This is the "/" route in Pages Router
// It simply renders our main App component

import dynamic from "next/dynamic";

// Use dynamic import with ssr:false because our app uses
// browser-only APIs (canvas, localStorage checks, etc.)
const App = dynamic(() => import("@/components/App"), { ssr: false });

export default function Home() {
  return <App />;
}