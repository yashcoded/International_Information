import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>International Travel Information</h1>
        <p className={styles.subtitle}>
          Your AI-powered travel companion for visa requirements and transit information
        </p>
        <Link href="/TravelInfo" className={styles.ctaButton}>
          Get Travel Information
        </Link>
      </div>

      <div className={styles.features}>
        <h2 className={styles.sectionTitle}>What We Do</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✈️</div>
            <h3>Visa Requirements</h3>
            <p>Get instant, accurate information about visa requirements for your specific travel route and passport.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛂</div>
            <h3>Transit Information</h3>
            <p>Find out if you need a transit visa for layovers, including airport departure requirements.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>AI Assistant</h3>
            <p>Chat with our intelligent AI agent for personalized travel advice and follow-up questions.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔗</div>
            <h3>Official Links</h3>
            <p>Access direct links to official visa applications, embassy websites, and travel resources.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📋</div>
            <h3>Documentation</h3>
            <p>Get comprehensive lists of required documents and step-by-step application guidance.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <h3>Conversation History</h3>
            <p>Keep track of your travel queries with our conversation history feature.</p>
          </div>
        </div>
      </div>

      <div className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Select Your Route</h3>
            <p>Choose your passport country, departure, destination, and transit countries.</p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Specify Layover Details</h3>
            <p>Enter layover duration and whether you plan to leave the airport during transit.</p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Get AI-Powered Results</h3>
            <p>Receive comprehensive visa information, official links, and personalized recommendations.</p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3>Ask Follow-up Questions</h3>
            <p>Chat with our AI assistant for additional information and clarification.</p>
          </div>
        </div>
      </div>

      <div className={styles.ctaSection}>
        <h2>Ready to Plan Your Journey?</h2>
        <p>Get started with our intelligent travel information system</p>
        <Link href="/TravelInfo" className={styles.ctaButton}>
          Start Planning
        </Link>
      </div>
    </div>
  );
}
