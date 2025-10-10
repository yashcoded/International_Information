import NavbarClient from './NavbarClient';

export const metadata = {
  title: 'International Travel Information - AI-Powered Visa Assistant',
  description: 'Get instant, accurate visa requirements and transit information for international travel. AI-powered travel companion with official links and personalized recommendations.',
  keywords: 'travel, visa, international, transit, layover, AI assistant, travel information',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Travel Info',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ background: '#0f172a' }}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
        <NavbarClient />
        {children}
      </body>
    </html>
  )
}
