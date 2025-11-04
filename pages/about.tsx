import Head from 'next/head'
import Link from 'next/link'
import type { NextPage } from 'next'

const AboutPage: NextPage = () => {
  const title = 'About - SeekFirst Bible'
  const description = 'Learn about SeekFirst Bible, a free AI-powered application designed for rich, contextual Bible study and Scripture exploration.'
  const url = 'https://seekfirstbible.com/about'
  const ogImage = 'https://seekfirstbible.com/og-bible-image.png'

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="canonical" href={url} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="SeekFirst Bible" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content="About SeekFirst Bible" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      <div className="legal-page">
        <div className="legal-container">
          <Link href="/" className="back-link">← Back to SeekFirst</Link>
          
          <h1>About SeekFirst</h1>
          <p className="last-updated">AI-powered Bible study app</p>

          <div className="legal-content">
            <p className="intro">
              SeekFirst is a free, AI-powered application designed for rich, contextual Bible study. 
              We emphasize seeking &quot;first the kingdom of God and his righteousness&quot; (Matthew 6:33) 
              by providing believers with intuitive tools to explore Scripture.
            </p>

            <section>
              <h2>Our Mission</h2>
              <p>
                To help believers worldwide study God&apos;s Word more deeply and freely, without distractions 
                or paywalls. SeekFirst exists to make quality Bible study accessible to everyone.
              </p>
            </section>

            <section>
              <h2>Key Features</h2>
              <ul>
                <li><strong>30+ Bible Translations:</strong> Access multiple English and Spanish versions including KJV, NKJV, ESV, NASB, NIV, and more</li>
                <li><strong>Advanced Search:</strong> Full-text search with smart Bible reference parsing</li>
                <li><strong>Cross-References:</strong> Interactive panel showing related passages throughout Scripture</li>
                <li><strong>Red Letter Edition:</strong> Highlighting of Jesus&apos; words and God&apos;s words in the Old Testament</li>
                <li><strong>AI-Powered Explanations:</strong> Contextual insights using grammatical-historical hermeneutics</li>
                <li><strong>Dark/Light Theme:</strong> Comfortable reading experience in any lighting</li>
                <li><strong>Verse Selection:</strong> Select, copy, and study multiple verses at once</li>
                <li><strong>Book Timeline:</strong> Visual representation of each book&apos;s structure</li>
                <li><strong>Multilingual:</strong> Full support for English and Spanish interfaces</li>
                <li><strong>Responsive Design:</strong> Optimized for desktop, tablet, and mobile devices</li>
              </ul>
            </section>

            <section>
              <h2>Our Approach</h2>
              <p>
                SeekFirst is built on several core principles:
              </p>
              <ul>
                <li><strong>No Ads:</strong> Your study time is sacred. We don&apos;t interrupt with advertisements.</li>
                <li><strong>No Donations:</strong> This is our act of worship. We don&apos;t ask for money.</li>
                <li><strong>Privacy First:</strong> We use Google Analytics only to understand page performance and fix errors. No personal information is collected, and we never use marketing cookies or tracking for ads.</li>
                <li><strong>Scripture First:</strong> Tools enhance, but never replace, the Word of God.</li>
                <li><strong>Transparency:</strong> All Scripture versions properly credited, with licenses displayed.</li>
                <li><strong>Excellence:</strong> We strive for the highest quality in design and functionality.</li>
              </ul>
            </section>

            <section>
              <h2>Technology</h2>
              <p>
                SeekFirst is built with modern web technologies to provide a fast, reliable experience:
              </p>
              <ul>
                <li>Next.js for server-side rendering and optimal performance</li>
                <li>React for responsive, interactive interfaces</li>
                <li>TypeScript for code quality and maintainability</li>
                <li>SQLite for efficient cross-reference lookups</li>
                <li>AI integration for contextual biblical explanations</li>
              </ul>
            </section>

            <section>
              <h2>Scripture Translations</h2>
              <p>
                We are grateful for the publishers who make their translations available. Each translation 
                page includes proper attribution and licensing information. Some translations are in the 
                public domain, while others are used by permission.
              </p>
              <p>
                Scripture quotations are © their respective publishers. Please see our{' '}
                <Link href="/license">License & Scripture Credits</Link> page for complete details.
              </p>
            </section>

            <section>
              <h2>AI Explanations</h2>
              <p>
                Our AI-powered explanations are tools to assist your Bible study, not substitutes for 
                prayer, the Holy Spirit&apos;s guidance, or sound biblical teaching. We use grammatical-historical 
                hermeneutics principles to provide context-based insights including:
              </p>
              <ul>
                <li>Historical and cultural context</li>
                <li>Original language insights (Hebrew, Greek, Aramaic)</li>
                <li>Word studies with lexical data</li>
                <li>Cross-references and thematic connections</li>
                <li>Modern applications and implications</li>
              </ul>
              <p>
                While we strive for accuracy, we encourage you to test everything against Scripture itself 
                and seek guidance from mature believers and pastors.
              </p>
            </section>

            <section>
              <h2>Feedback & Contact</h2>
              <p>
                We&apos;d love to hear from you! Your feedback helps us improve SeekFirst for everyone. 
                Please share your thoughts, suggestions, or report any issues through our{' '}
                <a 
                  href="https://forms.gle/wgBK4LYaV2ioGs9m8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  feedback form
                </a>.
              </p>
            </section>

            <section>
              <h2>For God&apos;s Glory</h2>
              <p>
                SeekFirst is shared freely for God&apos;s glory. Our prayer is that this tool would help 
                you know Christ more deeply, understand His Word more fully, and walk more faithfully in 
                His kingdom.
              </p>
              <blockquote>
                &quot;But seek first the kingdom of God and his righteousness, and all these things will 
                be added to you.&quot; — Matthew 6:33 (ESV)
              </blockquote>
            </section>

            <section>
              <h2>Legal</h2>
              <p>
                For information about how we handle your data and the terms of use, please see:
              </p>
              <ul>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Use</Link></li>
                <li><Link href="/license">License & Scripture Credits</Link></li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        .legal-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
        }

        .legal-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 3rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          margin-bottom: 1.5rem;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #764ba2;
        }

        h1 {
          font-size: 2.5rem;
          color: #213547;
          margin-bottom: 0.5rem;
        }

        .last-updated {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .legal-content {
          line-height: 1.7;
          color: #334155;
        }

        .intro {
          font-size: 1.1rem;
          color: #475569;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f1f5f9;
          border-left: 4px solid #667eea;
          border-radius: 4px;
        }

        section {
          margin-bottom: 2rem;
        }

        h2 {
          font-size: 1.5rem;
          color: #334155;
          margin-bottom: 1rem;
          margin-top: 2rem;
        }

        p {
          margin-bottom: 1rem;
        }

        strong {
          color: #1e293b;
          font-weight: 600;
        }

        ul {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        li {
          margin-bottom: 0.5rem;
        }

        blockquote {
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          background: #f8fafc;
          border-left: 4px solid #667eea;
          font-style: italic;
          color: #475569;
        }

        a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.2s;
        }

        a:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .legal-container {
            padding: 2rem 1.5rem;
          }

          h1 {
            font-size: 2rem;
          }

          h2 {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </>
  )
}

export default AboutPage
