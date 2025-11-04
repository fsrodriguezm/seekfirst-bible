import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
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
import '../src/components/ThemeToggle.css'
import '../src/components/ThemePalettePicker.css'
import '../src/styles/legal-pages.css'
import '../src/styles/palettes.css'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import ThemeToggle from '../src/components/ThemeToggle'
import type { AppProps } from 'next/app'

type AppPropsWithOptions = AppProps & {
  Component: AppProps['Component'] & {
    showFloatingThemeToggle?: boolean
  }
}

const GA_ID = 'G-ZTGQNRES3N'
const isAnalyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'

export default function App({ Component, pageProps }: AppPropsWithOptions) {
  const router = useRouter()
  const showFloatingToggle = Component.showFloatingThemeToggle !== false

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
    <ThemeProvider>
      {/* Google Analytics - Only load if enabled */}
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
      {showFloatingToggle && <ThemeToggle variant="floating" />}
    </ThemeProvider>
  )
}
