import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="HdvFV_ncNuBK0B_tyAeAUYuec2nHOWqI3ybP3k7ST_k" />

        {/* Basic SEO */}
        <meta charSet="UTF-8" />
        <meta name="description" content="OctaExchange is a signal-based crypto copy trading platform. Follow expert traders, automate your investments, and grow your crypto portfolio with ease." />
        <meta name="keywords" content="crypto copy trading, signal trading, crypto investment, bitcoin trading, automated crypto, OctaExchange" />
        <meta name="author" content="OctaExchange" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph (Google, WhatsApp, Facebook, Telegram previews) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="OctaExchange" />
        <meta property="og:title" content="OctaExchange — Smart Crypto Copy Trading Platform" />
        <meta property="og:description" content="Follow expert traders and automate your crypto investments with OctaExchange. Signal-based copy trading made simple." />
        <meta property="og:url" content="https://www.octaexchange.online" />
        <meta property="og:image" content="https://www.octaexchange.online/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="OctaExchange — Smart Crypto Copy Trading" />
        <meta name="twitter:description" content="Follow expert traders and automate your crypto investments with OctaExchange." />
        <meta name="twitter:image" content="https://www.octaexchange.online/og-image.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="canonical" href="https://www.octaexchange.online" />

        {/* Theme */}
        <meta name="theme-color" content="#07090f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "name": "OctaExchange",
              "url": "https://www.octaexchange.online",
              "description": "Signal-based crypto copy trading platform",
              "serviceType": "Cryptocurrency Trading",
              "areaServed": "Worldwide",
              "logo": "https://www.octaexchange.online/favicon.ico",
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}