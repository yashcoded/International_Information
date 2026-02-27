'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';
import ThemeToggleSimple from './ThemeToggleSimple';
import './theme.css';

export default function NavbarClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="Travel Info Logo" width={40} height={40} className={styles.logoImage} />
          <span className={styles.logoText}>
            <span className={styles.logoPrimary}>Travel</span>
            <span className={styles.logoSecondary}>Info</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${isActive('/') && pathname === '/' ? styles.navLinkActive : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/TravelInfo" 
            className={`${styles.navLink} ${isActive('/TravelInfo') ? styles.navLinkActive : ''}`}
          >
            Get Information
          </Link>
          <Link 
            href="/TripPlanner" 
            className={`${styles.navLink} ${isActive('/TripPlanner') ? styles.navLinkActive : ''}`}
          >
            Trip Planner
          </Link>
          <Link 
            href="/About" 
            className={`${styles.navLink} ${isActive('/About') ? styles.navLinkActive : ''}`}
          >
            About
          </Link>
          <div className={styles.themeToggleWrapper}>
            <ThemeToggleSimple />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerActive : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuContent}>
          <Link 
            href="/" 
            className={`${styles.mobileNavLink} ${isActive('/') && pathname === '/' ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.mobileNavIcon}>🏠</span>
            Home
          </Link>
          <Link 
            href="/TravelInfo" 
            className={`${styles.mobileNavLink} ${isActive('/TravelInfo') ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.mobileNavIcon}>✈️</span>
            Get Information
          </Link>
          <Link 
            href="/TripPlanner" 
            className={`${styles.mobileNavLink} ${isActive('/TripPlanner') ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.mobileNavIcon}>🧭</span>
            Trip Planner
          </Link>
          <Link 
            href="/About" 
            className={`${styles.mobileNavLink} ${isActive('/About') ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className={styles.mobileNavIcon}>ℹ️</span>
            About
          </Link>
          <div className={styles.mobileThemeToggle}>
            <span className={styles.mobileNavIcon}>🎨</span>
            Theme
            <ThemeToggleSimple />
          </div>
        </div>
      </div>
    </nav>
  );
}

