'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './_NavbarPages.module.css';
import ThemeToggle from './_ThemeToggle';

export default function NavbarPages() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Close menu when route changes
  useEffect(() => {
    const handleRouteChange = () => setIsMenuOpen(false);
    router.events?.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

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
    if (path === '/') return router.pathname === '/';
    return router.pathname === path;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.svg" alt="Travel Info Logo" width={40} height={40} className={styles.logoImage} />
          <span className={styles.logoText}>
            <span className={styles.logoPrimary}>Travel</span>
            <span className={styles.logoSecondary}>Info</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
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
            <ThemeToggle />
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
            className={`${styles.mobileNavLink} ${isActive('/') ? styles.mobileNavLinkActive : ''}`}
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
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

