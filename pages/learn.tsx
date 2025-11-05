import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import { Moon, Sun, Menu, X } from 'lucide-react'
import styles from '../src/styles/learn.module.css'
import Footer from '../src/components/Footer'
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext'
import { learnNavItems, renewPractices } from '../src/data/learnPractices'

type LearnNavItem = typeof learnNavItems[number]

const toolbarActions = [
  { label: 'Read' },
  { label: 'Learn', badge: 'beta' },
] as const

type ToolbarAction = (typeof toolbarActions)[number]
type ToolLabel = ToolbarAction['label']

const navItems: LearnNavItem[] = learnNavItems

const LearnPageContent = () => {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const activeTool: ToolLabel = 'Learn'
  const currentPracticeId = router.pathname.startsWith('/learn/renew/')
    ? router.pathname.split('/')[3]
    : null

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Close sidebar when route changes on mobile
    setIsSidebarOpen(false)
  }, [router.pathname])

  useEffect(() => {
    // Prevent body scroll when sidebar is open
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  const handleToolbarClick = (action: ToolbarAction) => {
    if (action.label === 'Learn') return
    router.push('/')
  }

  const handleBrandClick = () => {
    router.push('/')
  }

  const renewPracticeHighlights = [
    {
      label: 'What You’ll Practice',
      items: [
        'Anchor each reading session in prayer, context, and responsive obedience.',
        'Let memorized verses renew your thinking throughout the day.',
        'Trace cross references to see how Scripture interprets Scripture.',
        'Journal applications that move you toward faithful action.',
      ],
    },
    {
      label: 'Scripture to Anchor In',
      items: [
        'Romans 12 – Living sacrifices, renewed minds.',
        'Psalm 1 – Meditate day and night on the law of the Lord.',
        'Philippians 4 – Think on whatever is true, honorable, just, pure.',
      ],
    },
    {
      label: 'Live This Out',
      items: [
        'Sketch a weekly reading rhythm with cross references and journaling.',
        'Memorize Romans 12:2 using spaced repetition prompts.',
        'Summarize each passage in your own words before checking commentary.',
        'Invite a friend to read alongside you and compare insights weekly.',
      ],
    },
  ]

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
        {/* Mobile Menu Bar */}
        <div className={styles.mobileMenuBar}>
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={isSidebarOpen}
          >
            <Menu size={24} />
          </button>
        </div>

        <div className={styles.learnPage}>
          {/* Mobile Overlay */}
          <div 
            className={`${styles.mobileOverlay} ${isSidebarOpen ? styles.visible : ''}`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          <aside className={`${styles.learnSidebar} ${isSidebarOpen ? styles.learnSidebarOpen : ''}`}>
            {/* Close button inside sidebar */}
            <button
              className={styles.mobileMenuClose}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
            
            <div className={styles.learnSidebarTop}>
              <Link href="/learn" className={styles.learnBrand}>
                LEARN
              </Link>
              <nav className={styles.learnNav} aria-label="Learn navigation">
                {navItems.map((item, index) => {
                  const isActive = !item.comingSoon && (
                    (item.path ? router.asPath === item.path : false)
                  )

                  return (
                    <div
                      key={item.id}
                      className={`${styles.learnNavGroup} ${index > 0 ? styles.learnNavGroupSeparated : ''}`}
                    >
                      {item.comingSoon ? (
                        <span className={`${styles.learnNavItem} ${styles.learnNavItemDisabled}`} aria-disabled>
                          <span>{item.label}</span>
                          <span className={styles.learnNavComingSoon}>Coming soon</span>
                        </span>
                      ) : (
                        <Link
                          href={item.path ?? '/learn'}
                          className={`${styles.learnNavItem}${isActive ? ` ${styles.learnNavItemActive}` : ''}`}
                        >
                          <span>{item.label}</span>
                        </Link>
                      )}
                      {item.id === 'renew' && (
                        <nav className={styles.learnSubNavGroup} aria-label="Study Tools practices">
                          {renewPractices.map((practice) => (
                            <Link
                              key={practice.id}
                              href={practice.path}
                              className={`${styles.learnSubNavLink}${
                                currentPracticeId === practice.id ? ` ${styles.learnSubNavLinkActive}` : ''
                              }`}
                            >
                              {practice.title}
                            </Link>
                          ))}
                        </nav>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>
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
            <section id="renew" className={styles.learnSection}>
              <h2>Study Tools</h2>
              <p>
                Scripture-first tools that help you engage passages deeply, stay rooted in the Word,
                and build rhythms of reflection that shape everyday obedience.
              </p>
              <div className={styles.learnPracticeGrid}>
                {renewPractices.map((practice) => (
                  <Link key={practice.id} href={practice.path} className={styles.learnPracticeCard}>
                    <h3>{practice.title}</h3>
                    <p>{practice.summary}</p>
                    <span className={styles.learnPracticeCta}>Open journey →</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
          <aside className={styles.learnRightRail}>
            {renewPracticeHighlights.map((section) => (
              <div key={section.label} className={styles.rightSection}>
                <h4>{section.label}</h4>
                <ul className={styles.rightList}>
                  {section.items.map((item) => (
                    <li key={`${section.label}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}

const LearnPage: NextPage = () => {
  const title = 'Learn with SeekFirst Bible'
  const description = 'Discover Holy Spirit-led learning paths that draw you closer to Jesus and shape your life through God\'s Word.'
  const url = 'https://seekfirstbible.com/learn'
  const ogImage = 'https://seekfirstbible.com/seekfirst_logo_dark.png'

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
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
        <meta property="og:image:alt" content="Learn with SeekFirst Bible" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      <ThemeProvider>
        <LearnPageContent />
      </ThemeProvider>
    </>
  )
}

export default LearnPage
