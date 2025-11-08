import { parseStrongsSegments } from '../utils/strongs'

type BibleVerseContentProps = {
  verses: Record<string, string> | null
  selectedVerses: number[]
  onVerseSelect: (_verseNumber: number) => void
  fontSize?: number
  crossReferenceMode?: boolean
  currentVisibleVerse?: number | null
  redLetterMode?: boolean
  jesusWordsVerses?: Set<number>
  godWordsVerses?: Set<number>
  showStrongs?: boolean
  strongsVerses?: Record<number, string> | null
}

const BibleVerseContent = ({ 
  verses,
  selectedVerses,
  onVerseSelect,
  fontSize = 16,
  crossReferenceMode = false,
  currentVisibleVerse = null,
  redLetterMode = false,
  jesusWordsVerses = new Set<number>(),
  godWordsVerses = new Set<number>(),
  showStrongs = false,
  strongsVerses = null,
}: BibleVerseContentProps) => {
  if (!verses || Object.keys(verses).length === 0) {
    return (
      <div className="verse-content">
        <div className="no-verses">
          <p>No verses available for this chapter.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="verse-content" style={{ fontSize: `${fontSize}px` }}>
      {Object.entries(verses).map(([verseNumber, verseText]) => {
        const verseNum = parseInt(verseNumber)
        const isSelected = selectedVerses.includes(verseNum)
        const isCurrentVerse = crossReferenceMode && currentVisibleVerse === verseNum
        const isJesusWords = redLetterMode && jesusWordsVerses.has(verseNum)
        const isGodWords = redLetterMode && godWordsVerses.has(verseNum)
        const strongsText = showStrongs ? strongsVerses?.[verseNum] : null
        
        // Determine the appropriate class for the verse text
        let verseTextClass = 'verse-text'
        if (isJesusWords || isGodWords) {
          verseTextClass += ' jesus-words'  // Use same red styling for both
        }
        
        return (
          <div 
            key={verseNumber}
            id={`verse-${verseNumber}`}
            className={`verse ${isSelected ? 'selected' : ''} ${isCurrentVerse ? 'current-verse' : ''}`}
            onClick={() => onVerseSelect(verseNum)}
          >
            <span className="verse-number">{verseNumber}</span>
            <span className={verseTextClass}>{verseText}</span>
            {showStrongs && strongsText && (
              <div className="strongs-interlinear">
                {parseStrongsSegments(strongsText).map((segment, segmentIndex) => {
                  if (segment.codes.length === 0) {
                    return (
                      <span
                        key={`strongs-plain-${verseNumber}-${segmentIndex}`}
                        className="strongs-plain-chunk"
                      >
                        {segment.text}
                      </span>
                    )
                  }

                  const wordText = segment.text.trim() || segment.text
                  return (
                    <span
                      key={`strongs-word-${verseNumber}-${segmentIndex}`}
                      className="strongs-word"
                    >
                      <span className="strongs-word-text">{wordText}</span>
                      <span className="strongs-code-row">
                        {segment.codes.map((code, codeIndex) => (
                          <span
                            key={`strongs-code-${verseNumber}-${segmentIndex}-${codeIndex}`}
                            className={`strongs-code-chip ${code.isMorph ? 'strongs-code-morph' : ''}`.trim()}
                          >
                            {code.value}
                          </span>
                        ))}
                      </span>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default BibleVerseContent
