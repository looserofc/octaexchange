import "../src/styles/globals.css";
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>NexTrade — Smart Crypto Investment</title>
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