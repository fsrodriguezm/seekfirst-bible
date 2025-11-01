import Link from 'next/link'
import styles from './Footer.module.css'

interface FooterProps {
  currentYear?: number
}

export default function Footer({ currentYear = new Date().getFullYear() }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">SEEKFIRST</span>
          <p>Encouraging believers to seek first the kingdom of God through rich, contextual Bible study.</p>
        </div>
        <div className="footer-columns">
          <div className="footer-column">
            <h3>Start Here</h3>
            <ul>
              <li><Link href="/en/KJV/John/3">John 3 - Being born again</Link></li>
              <li><Link href="/en/KJV/Romans/3">Romans 3 - All have sinned</Link></li>
              <li><Link href="/en/KJV/Romans/5">Romans 5 - Christ died for us</Link></li>
              <li><Link href="/en/KJV/Romans/8">Romans 8 - Life in the Spirit</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Learn More</h3>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/license">License & Scripture Credits</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-cta">
          <h2>We'd love your feedback</h2>
          <p>Please share your honest thoughts — this helps improve the site for everyone.</p>
          <a
            className="feedback-link"
            href="https://forms.gle/wgBK4LYaV2ioGs9m8"
            target="_blank"
            rel="noopener noreferrer"
          >
            Share Feedback
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-text">
          <span>© {currentYear} SEEKFIRST — shared freely for God&apos;s glory.</span>
          {' | '}
          <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
          {' | '}
          <Link href="/terms" className={styles.legalLink}>Terms of Use</Link>
        </div>
        <small>
          Scripture quotations © their respective publishers. Used by permission. No ads. No donations.
        </small>
      </div>
    </footer>
  )
}