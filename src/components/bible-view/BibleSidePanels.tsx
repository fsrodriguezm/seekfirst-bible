import type { ComponentType, MutableRefObject } from 'react'
import ExplanationPanel from '../ExplanationPanel'
import type { VerseMap, BibleData } from '../../hooks/useBibleData'

type CrossReferencePanelProps = {
  currentBook: string | null
  currentChapter: number | null
  currentVerse: number | null
  selectedBible: string | null
  bibleData: BibleData | null
  onNavigateToVerse: (_book: string, _chapter: number, _verse: number | null) => void
  fontSize?: number
  verseSelectionLocked?: boolean
  onToggleLock?: () => void
}

interface BibleSidePanelsProps {
  showExplanationPanel: boolean
  crossReferenceMode: boolean
  explanationPanelRef: MutableRefObject<HTMLDivElement | null>
  selectedVerses: string[]
  currentChapterLabel: string
  verses: VerseMap
  fontSize: number
  explanationLanguage: 'english' | 'spanish'
  selectedBook: string
  selectedChapter: number
  selectedBible: string
  bibleData: BibleData | null
  currentVisibleVerse: number | null
  verseSelectionLocked: boolean
  onToggleLock: () => void
  onNavigateToVerse: (_book: string, _chapter: number, _verse: number | null) => void
  CrossReferencePanelComponent: ComponentType<CrossReferencePanelProps>
}

const BibleSidePanels = ({
  showExplanationPanel,
  crossReferenceMode,
  explanationPanelRef,
  selectedVerses,
  currentChapterLabel,
  verses,
  fontSize,
  explanationLanguage,
  selectedBook,
  selectedChapter,
  selectedBible,
  bibleData,
  currentVisibleVerse,
  verseSelectionLocked,
  onToggleLock,
  onNavigateToVerse,
  CrossReferencePanelComponent,
}: BibleSidePanelsProps) => {
  const shouldRenderExplanation = showExplanationPanel
  const shouldRenderCrossRefs = crossReferenceMode

  if (!shouldRenderExplanation && !shouldRenderCrossRefs) {
    return null
  }

  const crossReferencePanel = (
    <div className="cross-reference-panel-container">
      <CrossReferencePanelComponent
        currentBook={selectedBook}
        currentChapter={selectedChapter}
        currentVerse={currentVisibleVerse}
        selectedBible={selectedBible}
        bibleData={bibleData}
        onNavigateToVerse={onNavigateToVerse}
        fontSize={fontSize}
        verseSelectionLocked={verseSelectionLocked}
        onToggleLock={onToggleLock}
      />
    </div>
  )

  const explanationPanel = (
    <div className="explanation-panel" ref={explanationPanelRef}>
      <ExplanationPanel
        selectedVerses={selectedVerses}
        currentChapter={currentChapterLabel}
        allVerses={verses}
        fontSize={fontSize}
        language={explanationLanguage}
      />
    </div>
  )

  if (shouldRenderExplanation && shouldRenderCrossRefs) {
    return (
      <div className="bible-right-panels">
        {explanationPanel}
        {crossReferencePanel}
      </div>
    )
  }

  return (
    <>
      {shouldRenderExplanation && explanationPanel}
      {shouldRenderCrossRefs && crossReferencePanel}
    </>
  )
}

export default BibleSidePanels
