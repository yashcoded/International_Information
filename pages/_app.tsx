import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="application-name" content="Travel Info" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Travel Info" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.svg" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <style jsx global>{`
          html {
            background: #0f172a;
            margin: 0;
            padding: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #0f172a;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
        <Component {...pageProps} />
      </div>
    </>
  );
}

