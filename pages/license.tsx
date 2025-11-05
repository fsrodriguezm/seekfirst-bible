import Head from 'next/head'
import Link from 'next/link'
import type { NextPage } from 'next'
import licensingData from '../data/resources/bible-licensing.json'
import styles from '../src/styles/LegalPage.module.css'

const LicensePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>License & Scripture Credits - SeekFirst</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <div className={styles.legalPage}>
        <div className={styles.legalContainer}>
          <Link href="/" className={styles.backLink}>← Back to SeekFirst</Link>
          
          <h1>License & Scripture Credits</h1>
          <p className={styles.lastUpdated}>Scripture translation attributions</p>

          <div className={styles.legalContent}>
            <p className={styles.intro}>
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
              <div className={styles.translationList}>
                {licensingData.map((license) => (
                  <div key={license.abbreviation} className={styles.translationCard}>
                    <h3>{license.abbreviation}</h3>
                    <h4>{license.fullName}</h4>
                    <div className={styles.translationDetails}>
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
    </>
  )
}

export default LicensePage
