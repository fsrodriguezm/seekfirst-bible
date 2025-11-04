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
              At SeekFirst, your privacy matters. We believe you should be able to study God&apos;s Word without being tracked or profiled.
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
              <h2>What we don&apos;t collect</h2>
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
              <h2>Children&apos;s privacy</h2>
              <p>
                SeekFirst is designed for all audiences, but we encourage parents to guide younger readers. We do not knowingly collect data from children under 13.
              </p>
            </section>

            <section>
              <h2>Changes</h2>
              <p>
                If this policy changes, the &quot;last updated&quot; date above will be revised. Major updates will be announced within the app.
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

    </>
  )
}

export default PrivacyPage
