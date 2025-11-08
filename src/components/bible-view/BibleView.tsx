import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import BibleSelectionControls from '../BibleSelectionControls'
import BookTimeline from '../BookTimeline'
import BibleActionToolbar from './BibleActionToolbar'
import BibleSearchResults from './BibleSearchResults'
import BibleChapterContent from './BibleChapterContent'
import BibleSidePanels from './BibleSidePanels'
import { SPANISH_TO_ENGLISH_BOOKS } from '../../utils/bookNameMappings'
import { buildCanonicalPath, normalizeBookSlug } from '../../utils/bookSlugNormalizer'
import {
  getVersionSlug,
  getVersionLanguage,
} from '../../utils/versionMap'
import { useBibleData } from '../../hooks/useBibleData'
import { useJesusRevealedData } from '../../hooks/useJesusRevealedData'
import { useBookMetadata } from '../../hooks/useBookMetadata'
import { useHighlightedVerses } from '../../hooks/useHighlightedVerses'
import { useBibleSearch } from '../../hooks/useBibleSearch'
import { useLocalStorageSync } from '../../hooks/useLocalStorageSync'
import { useVerseScrollTracker } from '../../hooks/useVerseScrollTracker'
import { useButtonRipples } from '../../hooks/useButtonRipples'
import { copyToClipboard } from '../../hooks/useClipboard'
import { useBibleLicenses } from '../../hooks/useBibleLicenses'
import { useStrongsData } from '../../hooks/useStrongsData'
import { extractVerseNumber, formatSelectedVersesForCopy } from '../../utils/selectionFormatter'

const CrossReferencePanel = dynamic(() => import('../CrossReferencePanel'), {
  ssr: false,
  loading: () => <div className="cross-reference-loading">Loading cross references...</div>,
})

interface BibleViewProps {
  initialBook?: string
  initialChapter?: number
  initialVersion?: string
  initialVerses?: string
}

const BibleView = ({ initialBook, initialChapter, initialVersion, initialVerses }: BibleViewProps = {}) => {
  const router = useRouter()
  const [selectedBible, setSelectedBible] = useState<string>(initialVersion || 'KJV')
  const [selectedBook, setSelectedBook] = useState<string>(initialBook || 'Genesis')
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter || 1)
  const [selectedVerses, setSelectedVerses] = useState<string[]>([])
  const [showExplanationPanel, setShowExplanationPanel] = useState<boolean>(false)
  const [crossReferenceMode, setCrossReferenceMode] = useState<boolean>(false)
  const [currentVisibleVerse, setCurrentVisibleVerse] = useState<number | null>(null)
  const [verseSelectionLocked, setVerseSelectionLocked] = useState<boolean>(false)
  const [fontSize, setFontSize] = useState<number>(16)
  const [redLetterMode, setRedLetterMode] = useState<boolean>(false)
  const [showStrongs, setShowStrongs] = useState<boolean>(false)
  const [initialVersesLoaded, setInitialVersesLoaded] = useState<boolean>(false)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selectedCountRef = useRef<HTMLParagraphElement | null>(null)
  const explanationPanelRef = useRef<HTMLDivElement | null>(null)
  const verseContentRef = useRef<HTMLDivElement | null>(null)
  type ExplanationLanguage = 'english' | 'spanish'
  const selectedBibleLanguage = getVersionLanguage(selectedBible) ?? 'en'
  const selectedBibleIsSpanish = selectedBibleLanguage === 'es'
  const explanationLanguage: ExplanationLanguage = selectedBibleIsSpanish ? 'spanish' : 'english'

  const setButtonRef = useCallback(
    (index: number) => (element: HTMLButtonElement | null) => {
      buttonRefs.current[index] = element
    },
    [],
  )

  useButtonRipples(buttonRefs)

  const handleCrossReferenceReset = useCallback(() => {
    setCurrentVisibleVerse(1)
    setVerseSelectionLocked(false)
  }, [])

  const handleToggleStrongs = useCallback(() => {
    setShowStrongs((prev) => !prev)
  }, [])

  const { bibleData, verses, isLoading } = useBibleData({
    bibleId: selectedBible,
    book: selectedBook,
    setBook: setSelectedBook,
    chapter: selectedChapter,
    setChapter: setSelectedChapter,
    crossReferenceMode,
    onCrossReferenceReset: handleCrossReferenceReset,
  })

  const jesusRevealedData = useJesusRevealedData(selectedBible)
  const bookMetadata = useBookMetadata()
  const { jesusVerses: jesusWordsVerses, godVerses: godWordsVerses } = useHighlightedVerses({
    book: selectedBook,
    chapter: selectedChapter,
    redLetterMode,
  })
  const { results: searchResults, search: searchBible } = useBibleSearch(bibleData)
  const bibleLicense = useBibleLicenses(selectedBible)
  const {
    isLoading: isStrongsLoading,
    error: strongsError,
    getChapterStrongs,
  } = useStrongsData(showStrongs)

  // Restore persisted selections on mount (client only)
  // BUT: Don't override initial props from URL
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedBible = window.localStorage.getItem('selectedBible')
    const savedBook = window.localStorage.getItem('selectedBook')
    const savedChapter = window.localStorage.getItem('selectedChapter')
    const savedRedLetter = window.localStorage.getItem('redLetterMode')

    // Only restore from localStorage if no initial values were provided
    if (savedBible && !initialVersion) setSelectedBible(savedBible)
    if (savedBook && !initialBook) setSelectedBook(savedBook)
    if (savedChapter && !initialChapter) setSelectedChapter(parseInt(savedChapter, 10) || 1)
    if (savedRedLetter) setRedLetterMode(savedRedLetter === 'true')
  }, [initialVersion, initialBook, initialChapter])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedShowStrongs = window.localStorage.getItem('showStrongs')
    if (savedShowStrongs !== null) {
      setShowStrongs(savedShowStrongs === 'true')
    }
  }, [])

  // Update state when initial props change (URL navigation)
  useEffect(() => {
    if (initialVersion) setSelectedBible(initialVersion)
    if (initialBook) setSelectedBook(initialBook)
    if (initialChapter) setSelectedChapter(initialChapter)
  }, [initialVersion, initialBook, initialChapter])

  // Update URL when selections change (from dropdown interaction)
  useEffect(() => {
    // Don't update URL on initial mount or if we're already on a Bible route
    if (typeof window === 'undefined') return
    
    // Convert book name to English canonical form if it's in Spanish
    const bookInEnglish = SPANISH_TO_ENGLISH_BOOKS[selectedBook] || selectedBook
    
    // Normalize to ensure we have the canonical English name
    const normalizedBookName = normalizeBookSlug(bookInEnglish) || bookInEnglish
    
    // Determine language based on Bible version - Spanish versions use 'es', English versions use 'en'
    const versionLanguage = getVersionLanguage(selectedBible) ?? 'en'
    const urlLang = versionLanguage
    const versionLang = versionLanguage
    
    // Build the new path using version language for book slugs
    const versionSlug = getVersionSlug(selectedBible)
    
    // Extract verse numbers from selectedVerses if they exist and verses are loaded
    let versesParam: string | undefined
    if (selectedVerses.length > 0 && initialVersesLoaded) {
      const verseNumbers = selectedVerses
        .map(v => {
          const match = v.match(/:(\d+)\s/)
          return match ? parseInt(match[1], 10) : null
        })
        .filter((n): n is number => n !== null)
        .sort((a, b) => a - b)

      if (verseNumbers.length > 0) {
        // Check if consecutive
        const isConsecutive = verseNumbers.every((num, idx) => 
          idx === 0 || num === verseNumbers[idx - 1] + 1
        )

        if (isConsecutive && verseNumbers.length > 1) {
          versesParam = `${verseNumbers[0]}-${verseNumbers[verseNumbers.length - 1]}`
        } else if (verseNumbers.length === 1) {
          versesParam = String(verseNumbers[0])
        } else {
          // For non-consecutive, just use first and last with dash
          versesParam = `${verseNumbers[0]}-${verseNumbers[verseNumbers.length - 1]}`
        }
      }
    }
    
    const newPath = buildCanonicalPath(
      urlLang, // Use version-appropriate language in URL
      versionSlug,
      normalizedBookName,
      selectedChapter,
      versesParam,
      versionLang // Pass version language for slug generation
    )
    
    // Only update if the path is different from current
    if (newPath && router.asPath !== newPath) {
      router.push(newPath, undefined, { shallow: true })
    }
  }, [selectedBible, selectedBook, selectedChapter, selectedVerses, router, initialVersesLoaded])

  // Load Bible data
  useLocalStorageSync('selectedBible', selectedBible)
  useLocalStorageSync('selectedBook', selectedBook)
  useLocalStorageSync('selectedChapter', selectedChapter)
  useLocalStorageSync('redLetterMode', redLetterMode)
  useLocalStorageSync('showStrongs', showStrongs)

  // Load initial verses from URL when data is ready
  useEffect(() => {
    if (!initialVerses || initialVersesLoaded || !verses || Object.keys(verses).length === 0) return

    const parseVerseRange = (verseStr: string): number[] => {
      if (verseStr.includes('-')) {
        const [start, end] = verseStr.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        }
      } else {
        const num = Number(verseStr)
        if (!isNaN(num)) {
          return [num]
        }
      }
      return []
    }

    const verseNumbers = parseVerseRange(initialVerses)
    const selectedVersesArray: string[] = []

    verseNumbers.forEach(verseNumber => {
      const verseKey = `${selectedBook} ${selectedChapter}:${verseNumber}`
      const verseText = verses[String(verseNumber)]
      if (verseText) {
        selectedVersesArray.push(`${verseKey} ${verseText}`)
      }
    })

    if (selectedVersesArray.length > 0) {
      setSelectedVerses(selectedVersesArray)
    }
    setInitialVersesLoaded(true)
  }, [initialVerses, verses, selectedBook, selectedChapter, initialVersesLoaded])

  // Mark as loaded once verses data is available (for manual selection)
  useEffect(() => {
    if (!initialVersesLoaded && verses && Object.keys(verses).length > 0) {
      setInitialVersesLoaded(true)
    }
  }, [verses, initialVersesLoaded])

  // Clear selected verses when navigating to a new location
  useEffect(() => {
    setSelectedVerses([])
    setInitialVersesLoaded(false)
  }, [selectedBible, selectedBook, selectedChapter])

  // Update selected verse count without animation
  useEffect(() => {
    if (selectedCountRef.current) {
      selectedCountRef.current.textContent = `${selectedVerses.length} verse(s) selected`
    }
  }, [selectedVerses.length])

  useVerseScrollTracker({
    enabled: crossReferenceMode,
    verseContainerRef: verseContentRef,
    verseSelectionLocked,
    currentVisibleVerse,
    setCurrentVisibleVerse,
  })

  const handleVerseSelection = (verseNumber: number) => {
    const verseKey = `${selectedBook} ${selectedChapter}:${verseNumber}`
    const verseText = verses[String(verseNumber)]
    
    if (!verseText) return

    const fullVerse = `${verseKey} ${verseText}`
    
    setSelectedVerses(prev => {
      const exists = prev.some(v => v.startsWith(verseKey))
      if (exists) {
        return prev.filter(v => !v.startsWith(verseKey))
      } else {
        return [...prev, fullVerse]
      }
    })
  }

  const handleSearch = useCallback((query: string) => {
    searchBible(query)
  }, [searchBible])

  const navigateToVerse = (book: string, chapter: number, verse: number | null = null) => {
    setSelectedBook(book)
    setSelectedChapter(chapter)
    // Don't close search when navigating via reference
    // setShowSearch(false)
    // Highlight the specific verse after navigation
    if (verse) {
      window.setTimeout(() => {
        const verseElement = document.getElementById(`verse-${verse}`)
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          verseElement.classList.add('highlighted')
          window.setTimeout(() => verseElement.classList.remove('highlighted'), 3000)
        }
      }, 100)
    }
  }

  const getBookNames = (): string[] => {
    return bibleData ? Object.keys(bibleData) : []
  }

  const getChapterCount = (): number => {
    return bibleData && bibleData[selectedBook] ? Object.keys(bibleData[selectedBook]).length : 0
  }

  const getJesusDescription = (): string | null => {
    if (!jesusRevealedData || !selectedBook) return null
    return jesusRevealedData[selectedBook] || null
  }

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 52))
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 10))

  const toggleVerseSelectionLock = () => {
    setVerseSelectionLocked(prev => !prev)
  }

  const handleCrossReferenceToggle = useCallback(() => {
    setCrossReferenceMode((prev) => {
      const next = !prev
      if (!next) {
        setVerseSelectionLocked(false)
      }
      return next
    })
  }, [])

  const toggleRedLetterMode = () => {
    setRedLetterMode(prev => !prev)
  }

  const handleExplanationToggle = () => {
    const newShowState = !showExplanationPanel
    setShowExplanationPanel(newShowState)
    
    // If showing explanation on mobile/tablet, scroll to it after a brief delay to ensure rendering
    if (newShowState && typeof window !== 'undefined' && window.innerWidth <= 768) {
      setTimeout(() => {
        if (explanationPanelRef.current) {
          explanationPanelRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          })
        }
      }, 150)
    }
  }

  const handleCopySelectedVerses = async () => {
    if (selectedVerses.length === 0) return

    const formattedText = formatSelectedVersesForCopy(selectedVerses, selectedBible, selectedBibleLanguage)
    if (!formattedText) {
      console.error('Unable to format selected verses for copy')
      return
    }

    const copied = await copyToClipboard(formattedText)
    if (!copied) {
      return
    }

    if (selectedCountRef.current) {
      const originalText = selectedCountRef.current.textContent ?? ''
      selectedCountRef.current.textContent = 'Copied to clipboard!'
      selectedCountRef.current.style.color = '#10b981'
      setTimeout(() => {
        if (selectedCountRef.current) {
          selectedCountRef.current.textContent = originalText
          selectedCountRef.current.style.color = ''
        }
      }, 2000)
    }
  }

  const strongsVerses = useMemo(
    () => (showStrongs ? getChapterStrongs(selectedBook, selectedChapter) : null),
    [showStrongs, selectedBook, selectedChapter, getChapterStrongs],
  )

  const selectedVerseNumbers = useMemo(
    () =>
      selectedVerses
        .map(extractVerseNumber)
        .filter((value): value is number => value !== null),
    [selectedVerses],
  )

  const jesusDescription = getJesusDescription()
  const currentChapterLabel = useMemo(
    () => `${selectedBook} ${selectedChapter}`,
    [selectedBook, selectedChapter],
  )

  return (
    <div className={`bible-view ${
      showExplanationPanel || crossReferenceMode ? '' : 'full-width'
    } ${
      showExplanationPanel && crossReferenceMode ? 'three-panel' : ''
    }`}>
      <div className="bible-controls">
        <BibleSelectionControls
          selectedBible={selectedBible}
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          onBibleChange={setSelectedBible}
          onBookChange={setSelectedBook}
          onChapterChange={setSelectedChapter}
          bookNames={getBookNames()}
          chapterCount={getChapterCount()}
          onSearch={handleSearch}
          onReferenceNavigate={navigateToVerse}
        />
        <BibleActionToolbar
          hasSelectedVerses={selectedVerses.length > 0}
          onCopySelectedVerses={handleCopySelectedVerses}
          onToggleExplanation={handleExplanationToggle}
          crossReferenceMode={crossReferenceMode}
          onToggleCrossReferences={handleCrossReferenceToggle}
          redLetterMode={redLetterMode}
          onToggleRedLetterMode={toggleRedLetterMode}
          onDecreaseFontSize={decreaseFontSize}
          onIncreaseFontSize={increaseFontSize}
          getButtonRef={setButtonRef}
          selectedBible={selectedBible}
          showStrongs={showStrongs}
          onToggleStrongs={handleToggleStrongs}
        />
      </div>

      {/* Timeline visualization */}
      {bookMetadata && (
        <BookTimeline
          selectedBook={selectedBook}
          onBookSelect={setSelectedBook}
          bookMetadata={bookMetadata}
          isSpanish={selectedBibleIsSpanish}
        />
      )}

      <div className="bible-main-content">
        <div className="bible-left-panel">
          <BibleSearchResults
            results={searchResults}
            onNavigate={navigateToVerse}
          />

          <BibleChapterContent
            book={selectedBook}
            chapter={selectedChapter}
            verses={verses}
            selectedVerseNumbers={selectedVerseNumbers}
            selectedVersesCount={selectedVerses.length}
            selectedCountRef={selectedCountRef}
            verseContentRef={verseContentRef}
            onVerseSelect={handleVerseSelection}
            fontSize={fontSize}
            isLoading={isLoading}
            crossReferenceMode={crossReferenceMode}
            currentVisibleVerse={currentVisibleVerse}
            redLetterMode={redLetterMode}
            jesusWordsVerses={jesusWordsVerses}
            godWordsVerses={godWordsVerses}
            jesusDescription={jesusDescription}
            showStrongs={showStrongs}
            strongsVerses={strongsVerses}
            isStrongsLoading={isStrongsLoading}
            strongsError={strongsError}
          />

          {bibleLicense && (
            <div className="bible-license-card">
              <span className="bible-license-name">
                {bibleLicense.url ? (
                  <a href={bibleLicense.url} target="_blank" rel="noopener noreferrer">
                    {bibleLicense.fullName}
                  </a>
                ) : (
                  bibleLicense.fullName
                )}
              </span>
              {bibleLicense.copyright && (
                <span className="bible-license-meta"><br />{bibleLicense.copyright}</span>
              )}
            </div>
          )}
        </div>

        {/* Show panels based on current state */}
        <BibleSidePanels
          showExplanationPanel={showExplanationPanel}
          crossReferenceMode={crossReferenceMode}
          explanationPanelRef={explanationPanelRef}
          selectedVerses={selectedVerses}
          currentChapterLabel={currentChapterLabel}
          verses={verses}
          fontSize={fontSize}
          explanationLanguage={explanationLanguage}
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          selectedBible={selectedBible}
          bibleData={bibleData}
          currentVisibleVerse={currentVisibleVerse}
          verseSelectionLocked={verseSelectionLocked}
          onToggleLock={toggleVerseSelectionLock}
          onNavigateToVerse={navigateToVerse}
          CrossReferencePanelComponent={CrossReferencePanel}
        />
      </div>
    </div>
  )
}

export default BibleView
