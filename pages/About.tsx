import React from 'react';
import Link from 'next/link';
import styles from './About.module.css';
import NavbarPages from './_NavbarPages';

const About: React.FC = () => {
  return (
    <>
      <NavbarPages />

      <div className={styles.container}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>About This Project</h1>
          <p className={styles.subtitle}>
            Born from confusion, built to help travelers navigate visa requirements
          </p>
        </div>

        <div className={styles.content}>
          {/* The Origin Story */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🎬 The Origin Story</h2>
            <div className={styles.card}>
              <p className={styles.text}>
                Picture this: It&apos;s 2024. I&apos;m an international student in the United States, 
                excited to fly back home to India for the holidays. Simple, right? 
                <strong> Wrong.</strong>
              </p>
              <p className={styles.text}>
                My flight had a <em>20-hour layover in Germany</em>. Twenty. Hours. 
                That&apos;s basically a full day in a country I wasn&apos;t even trying to visit! 
                Naturally, I wondered: <strong>&quot;Do I need a visa for this?&quot;</strong>
              </p>
              <p className={styles.textHighlight}>
                🤔 <em>Spoiler alert: The answer should&apos;ve been simple. It was not.</em>
              </p>
            </div>
          </section>

          {/* The Struggle */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>😵 The Documentation Nightmare</h2>
            <div className={styles.card}>
              <p className={styles.text}>
                I did what any responsible traveler would do: I Googled it. 
                Then I Googled it again. And again. And <em>again</em>.
              </p>
              <div className={styles.bulletList}>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletIcon}>🌐</span>
                  <span>Random travel blogs saying conflicting things</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletIcon}>📱</span>
                  <span>Reddit threads from 2017 (very helpful, Reddit)</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletIcon}>📧</span>
                  <span>Official government websites that looked like they were designed in MS Paint</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletIcon}>🤷</span>
                  <span>One site said &quot;Yes visa needed!&quot; Another said &quot;No visa if transit area!&quot;</span>
                </div>
              </div>
              <p className={styles.text}>
                So I did what any panicked international student would do: 
                <strong> I emailed EVERYONE.</strong>
              </p>
              <p className={styles.text}>
                The German embassy. My university&apos;s international office. My airline. 
                Random travel agencies. That one friend who &quot;totally went through Germany once.&quot;
              </p>
              <p className={styles.textHighlight}>
                💡 <strong>The answer?</strong> &quot;No visa needed if you stay in the transit area.&quot;
              </p>
              <p className={styles.text}>
                That&apos;s it. Four hours of research, twelve emails, and three minor panic attacks 
                later, I had my answer. And I thought: <em>&quot;There has to be a better way.&quot;</em>
              </p>
            </div>
          </section>

          {/* The Solution */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>💡 The Solution</h2>
            <div className={styles.card}>
              <p className={styles.text}>
                So I built this. An AI-powered travel assistant that gives you 
                <strong> accurate, verified, and actually helpful</strong> transit visa information 
                without the existential dread.
              </p>
              <p className={styles.text}>
                No more scrolling through 47 tabs of outdated forum posts. 
                No more wondering if that blog from 2018 is still relevant. 
                Just straight answers, with official links to back them up.
              </p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>✅</span>
                  <span className={styles.featureText}>AI-powered, up-to-date information</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🔗</span>
                  <span className={styles.featureText}>Official government links</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>⚡</span>
                  <span className={styles.featureText}>Answers in seconds, not hours</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🧘</span>
                  <span className={styles.featureText}>Zero panic attacks (hopefully)</span>
                </div>
              </div>
            </div>
          </section>

          {/* About Me */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>👨‍💻 About Me</h2>
            <div className={styles.card}>
              <p className={styles.text}>
                Hi! I&apos;m <strong>Yash Bhatia</strong>, a software developer, international student, 
                and occasional victim of confusing travel regulations.
              </p>
              <p className={styles.text}>
                When I&apos;m not building tools to solve my own problems, I&apos;m probably:
              </p>
              <div className={styles.bulletList}>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletIcon}>💻</span>
                  <span>Writing code that <em>mostly</em> works</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletIcon}>☕</span>
                  <span>Drinking way too much coffee</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletIcon}>🎮</span>
                  <span>Pretending I&apos;ll finish that side project (spoiler: I won&apos;t)</span>
                </div>
                <div className={styles.bulletItem}>
                  <span className={styles.bulletIcon}>✈️</span>
                  <span>Planning my next trip and triple-checking visa requirements</span>
                </div>
              </div>
              <p className={styles.text}>
                Want to see more of my work (and questionable life choices)? 
                Check out my website: <a href="https://yashcoded.com" target="_blank" rel="noopener noreferrer" className={styles.link}>yashcoded.com</a>
              </p>
            </div>
          </section>

          {/* The Mission */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🚀 The Mission</h2>
            <div className={styles.cardGradient}>
              <p className={styles.missionText}>
                My goal is simple: <strong>Make international travel less stressful</strong>, 
                one confused traveler at a time.
              </p>
              <p className={styles.missionText}>
                Because nobody should have to send 12 emails just to figure out 
                if they need a piece of paper to sit in an airport for a few hours.
              </p>
              <p className={styles.missionTextBold}>
                Safe travels, friend. May your layovers be smooth and your visas be unnecessary. ✈️
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className={styles.ctaSection}>
            <h3 className={styles.ctaTitle}>Ready to Plan Your Trip?</h3>
            <p className={styles.ctaText}>
              Get instant, accurate visa information for your next journey
            </p>
            <Link href="/TravelInfo" className={styles.ctaButton}>
              Get Travel Information →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>✈️ Travel Info</h3>
            <p className={styles.footerText}>
              AI-powered travel assistant providing accurate visa and transit information for international travelers.
            </p>
            <p className={styles.footerText}>
              Born from a confused student&apos;s layover nightmare, built to help you travel stress-free.
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>🔗 Quick Links</h3>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>
                <span>→</span> Home
              </Link>
              <Link href="/TravelInfo" className={styles.footerLink}>
                <span>→</span> Get Information
              </Link>
              <Link href="/About" className={styles.footerLink}>
                <span>→</span> About
              </Link>
            </div>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>👨‍💻 Connect</h3>
            <p className={styles.footerText}>
              Built by Yash Bhatia, an international student and developer.
            </p>
            <div className={styles.footerSocial}>
              <a href="https://yashcoded.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Portfolio">
                🌐
              </a>
              <a href="https://github.com/yashcoded" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="GitHub">
                💻
              </a>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>
            © {new Date().getFullYear()} Travel Info. Built with ❤️ by <a href="https://yashcoded.com" target="_blank" rel="noopener noreferrer">Yash Bhatia</a>. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default About;

