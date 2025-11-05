import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { Moon, Sun } from 'lucide-react'
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

const PracticePageContent = ({ practice }: PracticePageProps) => {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const activeTool: ToolLabel = 'Learn'
  const currentPracticeId = practice.id

  useEffect(() => {
    setMounted(true)
  }, [])

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
                        <nav className={styles.learnSubNavGroup} aria-label="Renew the Mind practices">
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
              <span className={styles.learnHeaderSubtitle}>Renew the Mind</span>
              <h1>{practice.title}</h1>
              <p>{practice.summary}</p>
            </header>
            <div className={styles.renewLayout}>
              <div className={styles.renewSectionContent}>
                <article className={styles.renewSubsection}>
                  <h3>Practice Ideas</h3>
                  <p>
                    These rhythms help you embody the practice of {practice.title.toLowerCase()} with simplicity and
                    faithfulness.
                  </p>
                  <ul className={styles.renewSubsectionList}>
                    {practice.practices.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                {practice.id === 'memorization' && (
                  <div className={styles.memorizeHelperWrapper}>
                    <MemorizeHelper />
                  </div>
                )}

                <section className={styles.learnPracticeGrid}>
                  {otherPractices.map((other) => (
                    <Link key={other.id} href={other.path} className={styles.learnPracticeCard}>
                      <h3>{other.title}</h3>
                      <p>{other.summary}</p>
                      <span className={styles.learnPracticeCta}>Explore →</span>
                    </Link>
                  ))}
                </section>
              </div>
            </div>
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
    </div>
  )
}

const PracticePage: NextPage<PracticePageProps> = (props) => {
  return (
    <>
      <Head>
        <title>{`${props.practice.title} · Renew the Mind`}</title>
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
