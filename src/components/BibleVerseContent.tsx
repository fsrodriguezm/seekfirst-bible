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
  godWordsVerses = new Set<number>()
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
            <span className={verseTextClass} style={{ fontSize }}>
              {verseText}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default BibleVerseContent
