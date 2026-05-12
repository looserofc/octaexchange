import Head from "next/head";
import dynamic from "next/dynamic";

const App = dynamic(() => import("../src/components/App"), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>OctaExchange — Smart Crypto Copy Trading Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <App />
    </>
  );
}