import Head from 'next/head'
import type { NextPage } from 'next'
import App from '../src/App'

const HomePage: NextPage = () => {
  const title = 'SeekFirst Bible - Read and Study Scripture'
  const description = 'Study God\'s Word with powerful tools including cross-references, AI-powered biblical insights, and multiple translations. Grow closer to Jesus through deep Scripture exploration guided by the Holy Spirit.'
  const url = 'https://seekfirstbible.com/'
  const ogImage = 'https://seekfirstbible.com/seekfirst_logo_dark.png'
  const keywords = 'Bible, Scripture, online Bible, Bible study, cross references, Bible translations, KJV, NIV, ESV, read Bible online, biblical context, Jesus, Holy Spirit, God\'s Word'
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SeekFirst Bible',
    description: description,
    url: url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://seekfirstbible.com/en/kjv/{book}/{chapter}',
      },
      'query-input': 'required name=book required name=chapter',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SeekFirst Bible',
      url: url,
    },
  }

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
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
        <meta property="og:image:alt" content="SeekFirst Bible - Online Bible Study Platform" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content="SeekFirst Bible - Online Bible Study Platform" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <App />
    </>
  )
}

export default HomePage
