import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ExternalLink, Book, Lock, Unlock, Network, List, GitBranch, Globe } from 'lucide-react'
import { getCrossReferences } from '../utils/crossReferenceDBShards'
import { isSpanishVersion } from '../utils/versionMap'

const CrossReferenceNetworkGraph = dynamic(() => import('./CrossReferenceNetworkGraph'), {
  ssr: false,
  loading: () => <div className="cross-reference-loading">Loading network...</div>,
})

const CrossReferenceChordDiagram = dynamic(() => import('./CrossReferenceChordDiagram'), {
  ssr: false,
  loading: () => <div className="cross-reference-loading">Loading chord diagram...</div>,
})

type BibleData = Record<string, Record<string, Record<string, string>>>

type CrossReference = {
  ref: string
  weight: number
  votes: number
  reason: string
}

type ReferenceWithText = CrossReference & {
  book: string
  chapter: number
  verse: number
  text: string
}

type CrossReferencePanelProps = {
  currentBook: string | null
  currentChapter: number | null
  currentVerse: number | null
  bibleData: BibleData | null
  selectedBible: string | null
  onNavigateToVerse: (_book: string, _chapter: number, _verse: number | null) => void
  fontSize?: number
  verseSelectionLocked?: boolean
  onToggleLock?: () => void
}

type NavigationEntry = {
  book: string
  chapter: number
  verse: number
}

type ParsedReference = {
  book: string
  chapter: number
  verse: number
}

const CrossReferencePanel = ({
  currentBook,
  currentChapter,
  currentVerse,
  bibleData,
  selectedBible,
  onNavigateToVerse,
  fontSize = 16,
  verseSelectionLocked = false,
  onToggleLock,
}: CrossReferencePanelProps) => {
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([])
  const [referencesWithText, setReferencesWithText] = useState<ReferenceWithText[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'chord'>('list')
  const [showAllReferences, setShowAllReferences] = useState(false)
  const [navigationHistory, setNavigationHistory] = useState<NavigationEntry[]>([])

  useEffect(() => {
    if (!currentBook || currentChapter === null || currentVerse === null) {
      return
    }

    const currentLocation: NavigationEntry = {
      book: currentBook,
      chapter: currentChapter,
      verse: currentVerse,
    }

    setNavigationHistory((prev) => {
      if (prev.length === 0) {
        return [currentLocation]
      }
      const lastEntry = prev[prev.length - 1]
      if (
        lastEntry.book !== currentBook ||
        lastEntry.chapter !== currentChapter ||
        lastEntry.verse !== currentVerse
      ) {
        const newHistory = [...prev]
        newHistory[newHistory.length - 1] = currentLocation
        return newHistory
      }
      return prev
    })
  }, [currentBook, currentChapter, currentVerse])

  const handleDiagramNavigation = (book: string, chapter: number, verse: number): void => {
    onNavigateToVerse(book, chapter, verse)
    const newEntry: NavigationEntry = { book, chapter, verse }
    setNavigationHistory((prev) => [...prev, newEntry])
  }

  const handleUpdateNavigationHistory = (newHistory: NavigationEntry[]): void => {
    setNavigationHistory(newHistory)
  }

  useEffect(() => {
    const loadCrossReferences = async () => {
      if (
        !showAllReferences &&
        (!currentBook || currentChapter === null || currentVerse === null)
      ) {
        setCrossReferences([])
        return
      }

      setIsLoading(true)
      try {
        const isSpanishBible = Boolean(selectedBible && isSpanishVersion(selectedBible))
        let crossRefs: CrossReference[]
        if (showAllReferences) {
          crossRefs = await getCrossReferences(null, null, null, isSpanishBible)
        } else if (currentBook && currentChapter !== null && currentVerse !== null) {
          crossRefs = await getCrossReferences(currentBook, currentChapter, currentVerse, isSpanishBible)
        } else {
          crossRefs = []
        }
        setCrossReferences(crossRefs)
      } catch (error) {
        console.error('Error loading cross references:', error)
        setCrossReferences([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadCrossReferences()
  }, [currentBook, currentChapter, currentVerse, selectedBible, showAllReferences])

  useEffect(() => {
    const loadReferenceTexts = () => {
      if (!crossReferences.length || !bibleData) {
        setReferencesWithText([])
        return
      }

      const refsWithText: ReferenceWithText[] = []

      crossReferences.forEach((ref) => {
        try {
          const parsed = parseReference(ref.ref)
          const chapterKey = String(parsed.chapter)
          const verseKey = String(parsed.verse)
          const text = bibleData[parsed.book]?.[chapterKey]?.[verseKey]
          if (text) {
            refsWithText.push({
              ...ref,
              ...parsed,
              text,
            })
          }
        } catch (error) {
          console.error('Error parsing reference:', ref.ref, error)
        }
      })

      setReferencesWithText(refsWithText)
    }

    loadReferenceTexts()
  }, [crossReferences, bibleData])

  const parseReference = (ref: string): ParsedReference => {
    const match = ref.match(/^([\d ]?[^\d]+?)\s+(\d+):(\d+)(?:-\d+)?$/)
    if (!match) {
      throw new Error(`Invalid reference format: ${ref}`)
    }

    const [, bookName, chapterStr, verseStr] = match

    return {
      book: bookName.trim(),
      chapter: parseInt(chapterStr, 10),
      verse: parseInt(verseStr, 10),
    }
  }

  const handleReferenceClick = (ref: ReferenceWithText): void => {
    onNavigateToVerse(ref.book, ref.chapter, ref.verse)
  }

  const getVoteColor = (votes: number): string => {
    if (votes >= 10) return '#10b981'
    if (votes >= 5) return 'var(--sf-accent)'
    return '#6b7280'
  }

  const handleToggleShowAll = (): void => {
    setShowAllReferences((prev) => !prev)
  }

  const handleViewModeChange = useCallback(
    (newViewMode: 'list' | 'graph' | 'chord') => {
      if (newViewMode === 'graph' && showAllReferences) {
        return
      }
      setViewMode(newViewMode)
    },
    [showAllReferences],
  )

  if (!currentVerse && !showAllReferences) {
    return (
      <div className="cross-reference-panel">
        <div className="cross-ref-header">
          <Book size={20} />
          <h3>Cross References</h3>
        </div>
        <div className="cross-ref-empty">
          <p>Scroll through verses to see cross references</p>
        </div>
      </div>
    )
  }

  const verseLabel = currentBook && currentChapter !== null && currentVerse !== null
    ? `${currentBook} ${currentChapter}:${currentVerse}`
    : 'All References'

  const viewOptionsDisabled = showAllReferences
    ? { graph: true, chord: false, list: false }
    : { graph: false, chord: false, list: false }

  return (
    <div className="cross-reference-panel" style={{ fontSize: `${fontSize}px` }}>
      <div className="cross-ref-header">
        <div className="header-left">
          <Book size={20} />
          <h3>Cross References</h3>
        </div>
        {currentVerse && !showAllReferences && (
          <div className="current-verse-indicator">
            <span className="verse-label">Viewing:</span>
            <span className="verse-ref">{verseLabel}</span>
            {onToggleLock && (
              <button
                type="button"
                className={`lock-button ${verseSelectionLocked ? 'locked' : 'unlocked'}`}
                onClick={onToggleLock}
                title={
                  verseSelectionLocked
                    ? 'Unlock verse selection (scroll will change verse)'
                    : 'Lock verse selection (scroll won\'t change verse)'
                }
              >
                {verseSelectionLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
            )}
          </div>
        )}
        {showAllReferences && (
          <div className="current-verse-indicator">
            <span className="verse-label">Viewing:</span>
            <span className="verse-ref">All Bible Cross References</span>
          </div>
        )}
        <div className="view-mode-controls">
          {viewMode === 'chord' && (
            <button
              type="button"
              className={`show-all-button ${showAllReferences ? 'active' : ''}`}
              onClick={handleToggleShowAll}
              title={showAllReferences ? 'Show current verse references only' : 'Show all Bible cross references'}
            >
              <Globe size={16} />
            </button>
          )}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'graph' ? 'active' : ''} ${showAllReferences ? 'disabled' : ''}`}
              onClick={() => handleViewModeChange('graph')}
              title={showAllReferences ? 'Network view not available in global mode - turn off global view first' : 'Network Graph View'}
              disabled={viewOptionsDisabled.graph}
            >
              <Network size={16} />
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'chord' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('chord')}
              title="Chord Diagram View"
            >
              <GitBranch size={16} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="cross-ref-loading">
          <div className="loading-spinner" />
          <p>Loading cross references...</p>
        </div>
      ) : referencesWithText.length ? (
        viewMode === 'list' ? (
          <div className="cross-ref-list">
            {referencesWithText.map((ref) => (
              <div
                key={`${ref.book}-${ref.chapter}-${ref.verse}-${ref.text}`}
                className="cross-ref-item"
                onClick={() => handleReferenceClick(ref)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleReferenceClick(ref)
                  }
                }}
              >
                <div className="cross-ref-header-row">
                  <div className="cross-ref-reference">
                    <ExternalLink size={14} />
                    <span>{ref.ref}</span>
                  </div>
                  <div className="cross-ref-meta">
                    <span
                      className="cross-ref-votes"
                      style={{ color: getVoteColor(ref.votes) }}
                    >
                      relevance weight: {ref.votes}
                    </span>
                  </div>
                </div>
                <div className="cross-ref-text">
                  {ref.text}
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'graph' ? (
          <CrossReferenceNetworkGraph
            currentBook={currentBook ?? ''}
            currentChapter={currentChapter ?? 0}
            currentVerse={currentVerse ?? 0}
            referencesWithText={referencesWithText}
            onNavigateToVerse={handleDiagramNavigation}
            fontSize={fontSize}
            navigationHistory={navigationHistory}
            onUpdateNavigationHistory={handleUpdateNavigationHistory}
          />
        ) : (
          <CrossReferenceChordDiagram
            currentBook={currentBook ?? ''}
            currentChapter={currentChapter ?? 0}
            currentVerse={currentVerse ?? 0}
            referencesWithText={referencesWithText}
            onNavigateToVerse={handleDiagramNavigation}
            fontSize={fontSize}
            navigationHistory={navigationHistory}
            onUpdateNavigationHistory={handleUpdateNavigationHistory}
            showAllReferences={showAllReferences}
          />
        )
      ) : (
        <div className="cross-ref-empty">
          <p>No cross references available {showAllReferences ? 'for the Bible' : 'for this verse'}</p>
        </div>
      )}

      <div className="cross-ref-attribution">
        <p>
          Cross references from{' '}
          <a href="https://www.openbible.info" target="_blank" rel="noopener noreferrer">
            www.openbible.info
          </a>{' '}
          CC-BY 2025-09-15
        </p>
      </div>
    </div>
  )
}

export default CrossReferencePanel
