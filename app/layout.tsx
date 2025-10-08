import Link from 'next/link';
import Image from 'next/image';
import styles from './layout.module.css';

export const metadata = {
  title: 'International Travel Information - AI-Powered Visa Assistant',
  description: 'Get instant, accurate visa requirements and transit information for international travel. AI-powered travel companion with official links and personalized recommendations.',
  keywords: 'travel, visa, international, transit, layover, AI assistant, travel information',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Travel Info',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ background: '#0f172a' }}>
      <body style={{ margin: 0, padding: 0, background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <Link href="/" className={styles.logo}>
              <Image src="/logo.svg" alt="Travel Info Logo" width={40} height={40} className={styles.logoImage} />
              <span>Travel Info</span>
            </Link>
            <div className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <Link href="/TravelInfo" className={styles.navLink}>Get Information</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
