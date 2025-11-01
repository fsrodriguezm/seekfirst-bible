import Head from 'next/head'
import Link from 'next/link'
import type { NextPage } from 'next'

const PrivacyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - SeekFirst</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <div className="legal-page">
        <div className="legal-container">
          <Link href="/" className="back-link">← Back to SeekFirst</Link>
          
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: October 2025</p>

          <div className="legal-content">
            <p className="intro">
              At SeekFirst, your privacy matters. We believe you should be able to study God's Word without being tracked or profiled.
            </p>

            <section>
              <h2>What we collect</h2>
              <p>
                <strong>Local preferences:</strong> Your theme, font size, and last-read passage are stored only on your device using localStorage.
              </p>
              <p>
                <strong>Anonymous usage data (optional):</strong> We may use basic analytics tools (for example, Cloudflare or Vercel logs) to understand page performance and fix errors. This information never includes your name, email, or personal identifiers.
              </p>
              <p>
                <strong>AI requests:</strong> When you use AI-powered explanations, the text of the selected verses is securely sent to our processing API to generate context-based insights. These requests are not tied to any account or identity.
              </p>
            </section>

            <section>
              <h2>What we don't collect</h2>
              <ul>
                <li>No account registration is required.</li>
                <li>No email, GPS, or personal contact data is stored.</li>
                <li>No ads, cookies for marketing, or third-party trackers are used.</li>
              </ul>
            </section>

            <section>
              <h2>How your information is used</h2>
              <p>
                We use limited technical data only to keep the site fast, secure, and reliable. We never sell, rent, or share data.
              </p>
            </section>

            <section>
              <h2>Data storage</h2>
              <p>
                Information is stored on secure servers hosted by trusted providers such as Vercel, Netlify, or Cloudflare. Any local data is kept solely in your browser.
              </p>
            </section>

            <section>
              <h2>Children's privacy</h2>
              <p>
                SeekFirst is designed for all audiences, but we encourage parents to guide younger readers. We do not knowingly collect data from children under 13.
              </p>
            </section>

            <section>
              <h2>Changes</h2>
              <p>
                If this policy changes, the "last updated" date above will be revised. Major updates will be announced within the app.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions or concerns? Email us at <a href="mailto:privacy@seekfirst.com">privacy@seekfirst.com</a>
              </p>
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

export default PrivacyPage
