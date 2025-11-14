import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Footer from '../../../src/components/Footer'
import { ThemeProvider, useTheme } from '../../../src/contexts/ThemeContext'
import {
  learnNavItems,
  renewPractices,
  type RenewPractice,
  type LearnNavEntry,
} from '../../../src/data/learnPractices'
import styles from '../../../src/styles/learn.module.css'
import MemorizeHelper from '../../../src/components/learn/MemorizeHelper'
import ThemeSelector from '../../../src/components/ThemeSelector'
import ThemeToggle from '../../../src/components/ThemeToggle'

const toolbarActions = [
  { label: 'Read' },
  { label: 'Learn', badge: 'beta' },
] as const

type ToolbarAction = (typeof toolbarActions)[number]
type ToolLabel = ToolbarAction['label']

type PracticePageProps = {
  practice: RenewPractice
}

const navItems: LearnNavEntry[] = learnNavItems

const foundationalPassages = [
  {
    title: 'Identity & Salvation',
    description: 'These verses define the foundation of the Christian faith.',
    verses: [
      'John 3:16 — The core summary of the gospel',
      'Romans 10:9-10 — Confession and belief for salvation',
      'Ephesians 2:8-9 — Salvation by grace through faith',
      '2 Corinthians 5:17 — New creation in Christ',
      'John 1:12 — Adoption as children of God',
      '1 John 5:11-12 — Assurance of eternal life',
    ],
  },
  {
    title: 'Obedience & Discipleship',
    description: 'Verses that shape how believers follow Christ daily.',
    verses: [
      'John 14:21 — Loving Jesus means obeying His commands',
      'Matthew 16:24 — Deny yourself, take up your cross, follow',
      'Matthew 7:24-25 — Obedience builds the house on the rock',
      'Romans 12:1-2 — Renewing the mind and presenting the body',
      'Colossians 3:16 — Let the Word dwell richly',
      'Psalm 119:11 — Storing the Word to fight sin',
    ],
  },
  {
    title: 'The Great Commandments & Mission',
    description: 'Core mandates from Jesus Himself.',
    verses: [
      'Matthew 22:37-40 — The Great Commandments',
      'Matthew 28:19-20 — The Great Commission',
      'Micah 6:8 — What God requires',
      '1 Peter 3:15 — Being ready to give a reason for the hope',
    ],
  },
  {
    title: 'Spiritual Warfare & Temptation',
    description: 'Verses Jesus used, and verses that establish warfare principles.',
    verses: [
      'Matthew 4:1-11 — (Key lines Jesus quotes: Deut 8:3; 6:16; 6:13)',
      'Ephesians 6:10-17 — The armor of God',
      '1 Corinthians 10:13 — Way of escape in temptation',
      'James 4:7 — Resist the devil',
      '2 Corinthians 10:4-5 — Taking thoughts captive',
      '1 Peter 5:8-9 — Standing firm against the adversary',
    ],
  },
  {
    title: "God's Character",
    description: 'Verses that anchor doctrine and prevent distorted views of God.',
    verses: [
      "Exodus 34:6-7 — God's self-revelation",
      "Isaiah 40:28-31 — God's power and endurance",
      "Lamentations 3:22-23 — God's covenant faithfulness",
      "James 1:17 — God's unchanging nature",
      'Psalm 103:8-12 — Compassion and forgiveness',
      '1 John 1:5 — God is light, no darkness in Him',
    ],
  },
  {
    title: 'Wisdom, Decision-Making, and Thought Life',
    description: 'Verses that shape logical, disciplined spiritual reasoning.',
    verses: [
      'Proverbs 3:5-6 — Trusting God over our own understanding',
      'James 1:5 — Asking God for wisdom',
      'Philippians 4:8 — The Christian thought-filter',
      'Psalm 1:1-3 — The blessed man grounded in Scripture',
      'Hebrews 4:12 — The Word discerning thoughts and intentions',
    ],
  },
  {
    title: 'Repentance, Confession, and Sanctification',
    description: 'Verses that anchor transformation.',
    verses: [
      '1 John 1:9 — Confession',
      'Psalm 51:10-12 — A model of repentance',
      'Romans 6:12-14 — Sin no longer ruling in your body',
      'Galatians 5:16 — Walk by the Spirit',
      'Galatians 2:20 — Crucified with Christ',
      'Hebrews 12:1-2 — Running with endurance',
    ],
  },
  {
    title: 'Faith, Fear, and Trust in God',
    description: 'Grounding for confidence in the Lord.',
    verses: [
      'Isaiah 41:10 — God with His people',
      'Psalm 23:1-4 — God as shepherd',
      'Philippians 4:6-7 — Prayer replacing anxiety',
      'Hebrews 11:1 — Definition of faith',
      'Romans 8:28 — God working all things together',
      'Psalm 46:1-2 — God as refuge and strength',
    ],
  },
] as const

const PracticePageContent = ({ practice }: PracticePageProps) => {
  const router = useRouter()
  const { isDark } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const activeTool: ToolLabel = 'Learn'
  const currentPracticeId = practice.id
  const renderSummaryParagraphs = (summary: string | string[], keyPrefix: string) => {
    const paragraphs = Array.isArray(summary)
      ? summary
      : summary
          .split('\n')
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)

    return paragraphs.map((text, index) => (
      <p key={`${keyPrefix}-${index}`}>{text}</p>
    ))
  }

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

  const otherPractices = renewPractices.filter((item) => item.id !== practice.id)

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
          <div className="navbar-controls">
            <ThemeSelector />
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
                  const isActive = !item.comingSoon && item.path && router.asPath === item.path

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
                          {renewPractices.map((practiceEntry) => (
                            <Link
                              key={practiceEntry.id}
                              href={practiceEntry.path}
                              className={`${styles.learnSubNavLink}${
                                currentPracticeId === practiceEntry.id ? ` ${styles.learnSubNavLinkActive}` : ''
                              }`}
                            >
                              {practiceEntry.title}
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
              <span className={styles.learnHeaderSubtitle}>Study Tools</span>
              <h1>{practice.title}</h1>
              <div className={styles.learnHeaderSummary}>
                {renderSummaryParagraphs(practice.summary, `${practice.id}-header`)}
              </div>
            </header>
            
            {practice.id === 'memorization' && (
              <div className={styles.memorizeHelperGrid}>
                <MemorizeHelper />
              </div>
            )}

            <article className={styles.renewSubsection}>
              <h3>Passages for Every Believer</h3>
              <p>
                These sections highlight key Scriptures that ground believers in the teachings of Jesus, the gospel,
                and the life of discipleship. They serve as core passages to memorize, recall, and apply as you follow
                Christ.
              </p>
              <ul className={styles.renewSubsectionList}>
                {practice.practices.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <p>
                These sections highlight key Scriptures that ground believers in the teachings of Jesus, the gospel,
                and the life of discipleship. They serve as core passages to memorize, recall, and apply as you follow
                Christ.
              </p>
              <div className={styles.renewFoundationalPassages}>
                {foundationalPassages.map((section) => (
                  <section key={section.title} className={styles.renewPassageGroup}>
                    <h4>{section.title}</h4>
                    <p>{section.description}</p>
                    <ul className={styles.renewSubsectionList}>
                      {section.verses.map((verse) => (
                        <li key={verse}>{verse}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </article>

            <section className={styles.learnPracticeGrid}>
              {otherPractices.map((other) => (
                <Link key={other.id} href={other.path} className={styles.learnPracticeCard}>
                  <h3>{other.title}</h3>
                  <div className={styles.learnPracticeSummary}>
                    {renderSummaryParagraphs(other.summary, `${other.id}-summary`)}
                  </div>
                  <span className={styles.learnPracticeCta}>Explore →</span>
                </Link>
              ))}
            </section>
          </div>

          <aside className={styles.learnRightRail}>
            <div className={styles.rightSection}>
              <h4>Scripture to Anchor In</h4>
              <ul className={styles.rightList}>
                <li>Romans 12:1-2</li>
                <li>Psalm 1:1-3</li>
                <li>Philippians 4:8-9</li>
              </ul>
            </div>
            <div className={styles.rightSection}>
              <h4>Live This Out</h4>
              <ul className={styles.rightList}>
                {practice.practices.slice(0, 3).map((item) => (
                  <li key={`practice-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <ThemeToggle variant="floating" />
    </div>
  )
}

const PracticePage: NextPage<PracticePageProps> = (props) => {
  return (
    <>
      <Head>
        <title>{`${props.practice.title} · Study Tools`}</title>
        <meta
          name="description"
          content={`Practice ${props.practice.title.toLowerCase()} with SeekFirst Bible. Guided steps and Scripture to help you renew your mind.`}
        />
      </Head>
      <ThemeProvider>
        <PracticePageContent {...props} />
      </ThemeProvider>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: renewPractices.map((practice) => ({
      params: { practice: practice.id },
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<PracticePageProps> = async ({ params }) => {
  const practiceId = params?.practice as string
  const practice = renewPractices.find((entry) => entry.id === practiceId)

  if (!practice) {
    return { notFound: true }
  }

  return {
    props: { practice },
  }
}

export default PracticePage
