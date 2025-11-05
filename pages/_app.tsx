import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import '../src/styles/palettes.css'
import '../src/index.css'
import '../src/App.css'
import '../src/styles/responsive.css'
import '../src/components/BibleSelectionControls.css'
import '../src/components/BibleVerseContent.css'
import '../src/components/BibleView.css'
import '../src/components/BookTimeline.css'
import '../src/components/CrossReferenceChordDiagram.css'
import '../src/components/CrossReferenceNetworkGraph.css'
import '../src/components/CrossReferencePanel.css'
import '../src/components/ExplanationPanel.css'
import type { AppProps } from 'next/app'

const GA_ID = 'G-ZTGQNRES3N'
// Enable analytics by default, disable only if explicitly set to 'false'
const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    // Skip analytics if disabled
    if (!isAnalyticsEnabled) return

    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_ID, {
          page_path: url,
        })
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      {/* Google Analytics - Enabled by default unless NEXT_PUBLIC_ENABLE_ANALYTICS=false */}
      {isAnalyticsEnabled && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `,
            }}
          />
        </>
      )}
      
      <Component {...pageProps} />
    </>
  )
}
