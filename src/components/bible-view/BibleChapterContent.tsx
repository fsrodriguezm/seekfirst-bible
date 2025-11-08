import type { MutableRefObject } from 'react'
import BibleVerseContent from '../BibleVerseContent'
import type { VerseMap } from '../../hooks/useBibleData'
import type { StrongsChapterVerses } from '../../utils/strongs'

interface BibleChapterContentProps {
  book: string
  chapter: number
  verses: VerseMap
  selectedVerseNumbers: number[]
  selectedVersesCount: number
  selectedCountRef: MutableRefObject<HTMLParagraphElement | null>
  verseContentRef: MutableRefObject<HTMLDivElement | null>
  onVerseSelect: (_verseNumber: number) => void
  fontSize: number
  isLoading: boolean
  crossReferenceMode: boolean
  currentVisibleVerse: number | null
  redLetterMode: boolean
  jesusWordsVerses: Set<number>
  godWordsVerses: Set<number>
  jesusDescription: string | null
  showStrongs: boolean
  strongsVerses: StrongsChapterVerses | null
  isStrongsLoading: boolean
  strongsError: string | null
}

const BibleChapterContent = ({
  book,
  chapter,
  verses,
  selectedVerseNumbers,
  selectedVersesCount,
  selectedCountRef,
  verseContentRef,
  onVerseSelect,
  fontSize,
  isLoading,
  crossReferenceMode,
  currentVisibleVerse,
  redLetterMode,
  jesusWordsVerses,
  godWordsVerses,
  jesusDescription,
  showStrongs,
  strongsVerses,
  isStrongsLoading,
  strongsError,
}: BibleChapterContentProps) => {
  return (
    <div className="bible-content card">
      <div className="chapter-header">
        <div className="chapter-title-row">
          <h2 className="gradient-text">
            {book} {chapter}
          </h2>
          {jesusDescription && (
            <div className="jesus-description">
              <p className="jesus-revealed-text">{jesusDescription}</p>
            </div>
          )}
        </div>
        {selectedVersesCount > 0 && (
          <p ref={selectedCountRef} className="selected-count">
            {selectedVersesCount} verse(s) selected
          </p>
        )}
        {showStrongs && (
          <div
            className={`strongs-banner ${strongsError ? 'strongs-banner-error' : ''}`.trim()}
          >
            {isStrongsLoading
              ? 'Loading Strong\'s numbers...'
              : strongsError
                ? 'Unable to load Strong\'s numbers. Please try again.'
                : strongsVerses
                  ? 'Showing Strong\'s numbers from the KJV reference text.'
                  : 'Strong\'s numbers are unavailable for this chapter.'}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Scripture...</div>
        </div>
      ) : (
        <div ref={verseContentRef} className="verse-content-container">
          <BibleVerseContent
            verses={verses}
            selectedVerses={selectedVerseNumbers}
            onVerseSelect={onVerseSelect}
            fontSize={fontSize}
            crossReferenceMode={crossReferenceMode}
            currentVisibleVerse={currentVisibleVerse}
            redLetterMode={redLetterMode}
            jesusWordsVerses={jesusWordsVerses}
            godWordsVerses={godWordsVerses}
            showStrongs={showStrongs}
            strongsVerses={strongsVerses}
          />
        </div>
      )}
    </div>
  )
}

export default BibleChapterContent
