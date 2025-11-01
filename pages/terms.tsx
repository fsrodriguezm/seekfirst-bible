import Head from 'next/head'
import Link from 'next/link'
import type { NextPage } from 'next'

const TermsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Terms of Use - SeekFirst</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <div className="legal-page">
        <div className="legal-container">
          <Link href="/" className="back-link">← Back to SeekFirst</Link>
          
          <h1>Terms of Use</h1>
          <p className="last-updated">Last updated: October 2025</p>

          <div className="legal-content">
            <p className="intro">
              Welcome to SeekFirst. By using this site, you agree to these simple terms.
            </p>

            <section>
              <h2>Purpose</h2>
              <p>
                SeekFirst exists to help people study the Bible freely. All features are provided "as-is" for educational and spiritual use.
              </p>
            </section>

            <section>
              <h2>Use of content</h2>
              <p>
                You may read, share, and quote Bible verses for personal study.
              </p>
              <p>
                Some translations are in the public domain; others require attribution, which we display on their respective pages.
              </p>
              <p>
                Do not sell or republish content from this site without permission from the respective copyright holders.
              </p>
            </section>

            <section>
              <h2>AI explanations</h2>
              <p>
                AI-generated explanations are tools for study, not substitutes for prayer or the Holy Spirit's guidance. We strive for accuracy, but SeekFirst makes no guarantees about theological interpretation or completeness.
              </p>
            </section>

            <section>
              <h2>Your responsibilities</h2>
              <p>
                Please use the app respectfully and lawfully. Do not attempt to disrupt or misuse the service.
              </p>
            </section>

            <section>
              <h2>Liability disclaimer</h2>
              <p>
                SeekFirst is provided without warranties of any kind. We are not liable for losses, errors, or interruptions that may occur while using the site.
              </p>
            </section>

            <section>
              <h2>Governing law</h2>
              <p>
                These terms are governed by the laws of the Commonwealth of Virginia, USA.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                For feedback or questions, reach us at <a href="mailto:support@seekfirst.com">support@seekfirst.com</a>.
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

export default TermsPage
