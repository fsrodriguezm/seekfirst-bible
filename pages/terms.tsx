import Head from 'next/head'
import Link from 'next/link'
import type { NextPage } from 'next'
import styles from '../src/styles/LegalPage.module.css'

const TermsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Terms of Use - SeekFirst</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <div className={styles.legalPage}>
        <div className={styles.legalContainer}>
          <Link href="/" className={styles.backLink}>← Back to SeekFirst</Link>
          
          <h1>Terms of Use</h1>
          <p className={styles.lastUpdated}>Last updated: October 2025</p>

          <div className={styles.legalContent}>
            <p className={styles.intro}>
              Welcome to SeekFirst. By using this site, you agree to these simple terms.
            </p>

            <section>
              <h2>Purpose</h2>
              <p>
                SeekFirst exists to help people study the Bible freely. All features are provided &quot;as-is&quot; for educational and spiritual use.
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
                AI-generated explanations are tools for study, not substitutes for prayer or the Holy Spirit&apos;s guidance. We strive for accuracy, but SeekFirst makes no guarantees about theological interpretation or completeness.
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
    </>
  )
}

export default TermsPage
