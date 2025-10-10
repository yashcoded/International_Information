'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './layout.module.css';
import ThemeToggleSimple from './ThemeToggleSimple';

export default function NavbarClient() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="Travel Info Logo" width={40} height={40} className={styles.logoImage} />
          <span>Travel Info</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/TravelInfo" className={styles.navLink}>Get Information</Link>
          <Link href="/About" className={styles.navLink}>About</Link>
          <ThemeToggleSimple />
        </div>
      </div>
    </nav>
  );
}

