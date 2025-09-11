export const metadata = {
  title: 'International Travel Information - AI-Powered Visa Assistant',
  description: 'Get instant, accurate visa requirements and transit information for international travel. AI-powered travel companion with official links and personalized recommendations.',
  keywords: 'travel, visa, international, transit, layover, AI assistant, travel information',
}

import Link from 'next/link';
import styles from './layout.module.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <Link href="/" className={styles.logo}>
              ✈️ Travel Info
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
