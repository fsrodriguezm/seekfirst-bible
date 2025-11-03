import Head from 'next/head'
import Link from 'next/link'
import type { NextPage } from 'next'
import licensingData from '../data/resources/bible-licensing.json'

const LicensePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>License & Scripture Credits - SeekFirst</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <div className="legal-page">
        <div className="legal-container">
          <Link href="/" className="back-link">← Back to SeekFirst</Link>
          
          <h1>License & Scripture Credits</h1>
          <p className="last-updated">Scripture translation attributions</p>

          <div className="legal-content">
            <p className="intro">
              We are deeply grateful to the publishers and copyright holders who make Bible translations 
              available for study and spiritual growth. Below is a complete list of all translations used 
              on SeekFirst, along with their licensing information.
            </p>

            <section>
              <h2>Our Commitment</h2>
              <p>
                SeekFirst is committed to honoring the intellectual property rights of Bible translation 
                publishers. We display proper attribution for each translation and comply with all usage 
                requirements. If you are a copyright holder and have concerns about how your translation 
                is being used, please contact us immediately.
              </p>
            </section>

            <section>
              <h2>Bible Translation Licenses</h2>
              <div className="translation-list">
                {licensingData.map((license) => (
                  <div key={license.abbreviation} className="translation-card">
                    <h3>{license.abbreviation}</h3>
                    <h4>{license.fullName}</h4>
                    <div className="translation-details">
                      <p>
                        <strong>Copyright:</strong> {license.copyright}
                      </p>
                      <p>
                        <strong>Permission Required:</strong> {license.permissionRequired}
                      </p>
                      {license.publisher && (
                        <p>
                          <strong>Publisher:</strong> {license.publisher}
                        </p>
                      )}
                      {license.url && (
                        <p>
                          <strong>More Info:</strong>{' '}
                          <a 
                            href={license.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {license.url}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2>Public Domain Translations</h2>
              <p>
                Several translations on SeekFirst are in the public domain, meaning they are free to use 
                without restrictions. These include:
              </p>
              <ul>
                <li><strong>KJV</strong> - King James Version (public domain outside the UK)</li>
                <li><strong>AKJV</strong> - American King James Version</li>
                <li><strong>ASV</strong> - American Standard Version (1901)</li>
                <li><strong>YLT</strong> - Young&apos;s Literal Translation (1898)</li>
                <li><strong>GNV</strong> - Geneva Bible</li>
                <li><strong>WEB</strong> - World English Bible</li>
                <li><strong>RVA1602</strong> - Reina-Valera Antigua 1602</li>
              </ul>
            </section>

            <section>
              <h2>Translations Used by Permission</h2>
              <p>
                Some translations are copyrighted and used with permission for non-commercial Bible study:
              </p>
              <ul>
                <li><strong>JUB</strong> - Jubilee Bible 2000 © Ransom Press International</li>
                <li><strong>KJ21</strong> - 21st Century King James Version © Deuel Enterprises, Inc.</li>
              </ul>
              <p>
                We are grateful to these publishers for allowing us to make their translations available 
                for free Bible study.
              </p>
            </section>

            <section>
              <h2>Usage Guidelines</h2>
              <p>
                If you wish to quote or use Scripture from SeekFirst in your own work:
              </p>
              <ul>
                <li>Always provide proper attribution to the translation and copyright holder</li>
                <li>Respect the usage guidelines of copyrighted translations</li>
                <li>For extensive quotations, contact the copyright holder directly</li>
                <li>Public domain translations may be used freely</li>
              </ul>
            </section>

            <section>
              <h2>Website Content</h2>
              <p>
                The SeekFirst website, including its design, code, and original content, is © SeekFirst. 
                However, we freely share our work for God&apos;s glory. You may:
              </p>
              <ul>
                <li>Share links to SeekFirst with others</li>
                <li>Quote Scripture passages found on the site (with proper attribution)</li>
                <li>Use the site for personal or church Bible study</li>
              </ul>
              <p>
                Please do not republish or redistribute our complete Bible translation datasets without 
                ensuring you have permission from the respective copyright holders.
              </p>
            </section>

            <section>
              <h2>AI-Generated Content</h2>
              <p>
                AI-powered explanations generated by SeekFirst are provided as study aids. These 
                explanations are not Scripture and should be tested against God&apos;s Word. You may 
                use these explanations for personal study, but we make no warranties about their 
                theological accuracy or completeness.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                For questions about licensing, permissions, or copyright concerns, please contact us at{' '}
                <a href="mailto:licensing@seekfirst.com">licensing@seekfirst.com</a>
              </p>
            </section>

            <section>
              <h2>Acknowledgments</h2>
              <p>
                We extend our heartfelt thanks to:
              </p>
              <ul>
                <li>All Bible translation publishers who make Scripture accessible</li>
                <li>eBible.org for providing public domain translations</li>
                <li>Crosswire Bible Society and the SWORD Project</li>
                <li>The open-source community for tools that make projects like this possible</li>
                <li>Most importantly, to God, for His living and enduring Word</li>
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
          max-width: 900px;
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

        h3 {
          font-size: 1.3rem;
          color: #667eea;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        h4 {
          font-size: 1rem;
          color: #475569;
          margin-bottom: 0.75rem;
          font-weight: 500;
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
          word-break: break-word;
        }

        a:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .translation-list {
          display: grid;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .translation-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          transition: box-shadow 0.2s;
        }

        .translation-card:hover {
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .translation-details {
          margin-top: 0.75rem;
        }

        .translation-details p {
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
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

          .translation-card {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  )
}

export default LicensePage
