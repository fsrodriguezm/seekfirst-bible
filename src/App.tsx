import { useRef, useEffect } from 'react'
import BibleView from './components/bible-view/BibleView'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'
import ThemePalettePicker from './components/ThemePalettePicker'

interface AppContentProps {
  initialBook?: string
  initialChapter?: number
  initialVersion?: string
  initialVerses?: string
}

function AppContent({ initialBook, initialChapter, initialVersion, initialVerses }: AppContentProps) {
  const videoARef = useRef<HTMLVideoElement | null>(null)
  const videoBRef = useRef<HTMLVideoElement | null>(null)
  const fadingRef = useRef<boolean>(false)
  const activeRef = useRef<number>(0) // 0 => A active, 1 => B active
  const fadeSeconds = 3.0 // seconds to crossfade

  // Refs and configuration for crossfade between two identical video elements
  useEffect(() => {
    const a = videoARef.current
    const b = videoBRef.current
    if (!a || !b) return

    a.loop = false
    b.loop = false
    a.style.transition = b.style.transition = `opacity ${fadeSeconds}s linear`
    a.style.opacity = '1'
    b.style.opacity = '0'

    const onTimeUpdate = () => {
      const active = activeRef.current === 0 ? a : b
      const next = active === a ? b : a
      if (fadingRef.current) return
      const { currentTime, duration } = active
      if (!duration || isNaN(duration)) return
      if (currentTime >= duration - fadeSeconds - 0.05) {
        fadingRef.current = true
        // prepare next video
        try {
          next.currentTime = 0
          next.style.opacity = '0'
          const p = next.play()
          if (p && typeof p.then === 'function') p.catch(() => {
            // Ignore play promise rejection
          })
        } catch (error) {
          // Ignore video play errors
          console.warn('Video play error:', error)
        }

        // crossfade: active -> 0, next -> 1
        requestAnimationFrame(() => {
          active.style.opacity = '0'
          next.style.opacity = '1'
        })

        window.setTimeout(() => {
          try { 
            active.pause()
            active.currentTime = 0 
          } catch (error) {
            // Ignore video control errors
            console.warn('Video control error:', error)
          }
          activeRef.current = active === a ? 1 : 0
          fadingRef.current = false
        }, fadeSeconds * 1000)
      }
    }

    a.addEventListener('timeupdate', onTimeUpdate)
    b.addEventListener('timeupdate', onTimeUpdate)

    return () => {
      a.removeEventListener('timeupdate', onTimeUpdate)
      b.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-text">
            <h1 onClick={() => window.location.reload()} style={{ cursor: "pointer" }}>
              SEEKFIRST
            </h1>
            <p>the kingdom of God and his righteousness, and all these things will be added to you -Matthew 6:33</p>
          </div>
          <div className="header-actions">
            <ThemePalettePicker />
            <ThemeToggle className="app-header-toggle" />
          </div>
        </div>
      </header>
      <main>
        <BibleView 
          initialBook={initialBook}
          initialChapter={initialChapter}
          initialVersion={initialVersion}
          initialVerses={initialVerses}
        />
      </main>
      <Footer />
    </div>
  )
}

interface AppProps {
  initialBook?: string
  initialChapter?: number
  initialVersion?: string
  initialVerses?: string
}

function App({ initialBook, initialChapter, initialVersion, initialVerses }: AppProps = {}) {
  return (
    <AppContent 
      initialBook={initialBook}
      initialChapter={initialChapter}
      initialVersion={initialVersion}
      initialVerses={initialVerses}
    />
  )
}

export default App
