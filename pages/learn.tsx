import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import { Moon, Sun } from 'lucide-react'
import styles from '../src/styles/learn.module.css'
import Footer from '../src/components/Footer'
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext'

type LearnNavItem = {
  id: string
  label: string
  description: string
  isBeta?: boolean
}

const toolbarActions = [
  { label: 'Read' },
  { label: 'Learn', badge: 'beta' },
] as const

type ToolbarAction = (typeof toolbarActions)[number]
type ToolLabel = ToolbarAction['label']

const navItems: LearnNavItem[] = [
  {
    id: 'renew',
    label: 'Renew the Mind',
    description:
      'Scripture-first journeys that help you meditate on truth, build rhythms of reflection, and let the Word reshape your thinking each day.',
  },
  {
    id: 'walk',
    label: 'Walk With the Lord',
    isBeta: true,
    description:
      'Guided practices for cultivating intimacy with Jesus through prayer, listening, and Spirit-led obedience in everyday life.',
  },
  {
    id: 'character',
    label: 'Grow in Character',
    isBeta: true,
    description:
      'Short formation tracks focused on the fruit of the Spirit, pairing biblical insight with prompts for real-life application.',
  },
  {
    id: 'serve',
    label: 'Serve Others',
    isBeta: true,
    description:
      'Frameworks for turning learning into action—blessing your church, community, and neighbors with the love of Christ.',
  },
]

const LearnPageContent = () => {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState<string>(navItems[0].id)
  const activeTool: ToolLabel = 'Learn'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const { hash } = window.location
    const initialId = hash.replace('#', '')
    if (initialId && navItems.some((item) => item.id === initialId)) {
      setActiveSection(initialId)
    }
  }, [])

  const handleNavClick =
    (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      setActiveSection(id)

      const section = document.getElementById(id)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState(null, '', `#${id}`)
      }
    }

  const handleToolbarClick = (action: ToolbarAction) => {
    if (action.label === 'Learn') return
    router.push('/')
  }

  const handleBrandClick = () => {
    router.push('/')
  }

  return (
    <div className={`App ${isDark ? 'dark' : 'light'}`}>
      <header className="App-header">
        <nav className="app-navbar" aria-label="Primary navigation">
          <div className="navbar-brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
            <Image src="/seekfirst_logo.png" alt="SeekFirst" className="brand-logo" width={48} height={48} priority />
            <span className="brand-text">SeekFirst</span>
          </div>
          <div className="navbar-left">
            {toolbarActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`nav-item ${activeTool === action.label ? 'active' : ''} ${action.label === 'Learn' ? 'nav-item-learn' : ''}`}
                onClick={() => handleToolbarClick(action)}
                aria-current={activeTool === action.label ? 'page' : undefined}
              >
                <span className="nav-label">{action.label}</span>
                {'badge' in action && action.badge && <span className="nav-badge">{action.badge}</span>}
              </button>
            ))}
          </div>
        </nav>
        <div className="header-content">
          <div className="header-text">
            <h1 onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
              SEEKFIRST
            </h1>
            <p>
              <span className="hero-verse-text">
                Do not be conformed to this world, but be transformed by the renewal of your mind,
                that by testing you may discern what is the will of God, what is good and acceptable
                and perfect.
              </span>
              <span className="hero-verse-citation">— Romans 12:2</span>
            </p>
          </div>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {mounted ? (isDark ? <Sun size={24} /> : <Moon size={24} />) : null}
          </button>
        </div>
      </header>
      <main className={styles.learnMain}>
        <div className={styles.learnPage}>
          <aside className={styles.learnSidebar}>
            <Link href="/" className={styles.learnBrand}>
              SeekFirst
            </Link>
            <nav className={styles.learnNav} aria-label="Learn navigation">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`${styles.learnNavItem}${
                    activeSection === item.id ? ` ${styles.learnNavItemActive}` : ''
                  }`}
                  onClick={handleNavClick(item.id)}
                >
                  <span>{item.label}</span>
                  {item.isBeta && <span className={styles.learnNavBadge}>beta</span>}
                </a>
              ))}
            </nav>
          </aside>
          <div className={styles.learnContent}>
            <header className={styles.learnHeader}>
              <span className={styles.learnHeaderSubtitle}>Formation Studio</span>
              <h1>Learning Paths to Seek First His Kingdom</h1>
              <p>
                Thoughtfully crafted resources that invite you to slow down, listen to Scripture,
                and respond to Jesus. These experiences are designed for individuals, small groups,
                and churches hungry to grow together.
              </p>
            </header>
            {navItems.map((item) => (
              <section key={item.id} id={item.id} className={styles.learnSection}>
                <div className={styles.learnSectionMeta}>
                  {item.isBeta ? 'Beta Preview' : 'Featured Path'}
                </div>
                <h2>{item.label}</h2>
                <p>{item.description}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

const LearnPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Learn with SeekFirst Bible</title>
        <meta
          name="description"
          content="Explore curated learning paths, spiritual practices, and formation journeys with SeekFirst Bible."
        />
      </Head>
      <ThemeProvider>
        <LearnPageContent />
      </ThemeProvider>
    </>
  )
}

export default LearnPage
