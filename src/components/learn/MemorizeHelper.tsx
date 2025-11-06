import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { Search, BookOpen } from 'lucide-react'
import styles from './MemorizeHelper.module.css'
import { useBibleData, type BibleData } from '../../hooks/useBibleData'
import { useBibleSearch } from '../../hooks/useBibleSearch'
import { parseBibleReference, isBibleReference } from '../../utils/bibleReferenceParser'

const STORAGE_KEY = 'memorize-helper.current'

const STOP_WORDS = new Set([
  'the', 'of', 'and', 'to', 'in', 'for', 'that', 'on', 'as', 'with', 'by', 'at', 'from', 'or', 'an', 'a',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'not', 'no', 'so', 'it', 'its', 'he', 'she', 'they',
  'them', 'his', 'her', 'our', 'us', 'we', 'you', 'your', 'i', 'me', 'my', 'shall', 'will'
])

type MemorizeData = {
  ref: string
  text: string
  context: string
  paraphrase: string
}

type Mode = 'read' | 'first' | 'cloze' | 'type' | 'order'

const MODE_CONFIG: Array<{ id: Mode; label: string; summary: string }> = [
  { id: 'read', label: 'Read & Context', summary: 'Revisit the passage with its context and paraphrase.' },
  { id: 'first', label: 'First Letters', summary: 'Reveal only the first letter of each word for recall prompts.' },
  { id: 'cloze', label: 'Cloze', summary: 'Blank out key words while keeping small words for scaffolding.' },
  { id: 'type', label: 'Type to Recall', summary: 'Type the verse from memory and get instant accuracy feedback.' },
  { id: 'order', label: 'Reorder Phrases', summary: 'Drag phrases into the correct order to internalise flow.' },
]

const SAMPLE_VERSE: MemorizeData = {
  ref: 'Psalm 23:1',
  text: 'The LORD is my shepherd; I shall not want.',
  context: 'David uses the imagery of a shepherd to describe the LORD’s faithful, attentive care for His people.',
  paraphrase: 'Because the LORD is my shepherd, I lack nothing that I truly need.',
}

const tokenize = (text: string): string[] => text.match(/[\w’']+|[^\s\w]/g) ?? []

const buildFirstLetters = (text: string): string =>
  tokenize(text)
    .map((token) => (/^[\w’']+$/.test(token) ? token[0] : token))
    .join('')

const buildCloze = (text: string): string =>
  tokenize(text)
    .map((token) => {
      if (!/^[\w’']+$/.test(token)) return token
      if (STOP_WORDS.has(token.toLowerCase()) || token.length <= 3) return token
      return '____'
    })
    .join('')

const splitPhrases = (text: string): string[] => {
  if (!text.trim()) return []
  const parts = text.split(/(?<=[,;:\u2014\-\.])\s+/).map((part) => part.trim()).filter(Boolean)
  return parts.length > 1 ? parts : [text.trim()]
}

const shuffle = (values: string[]): string[] => {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const compareAccuracy = (target: string, attempt: string): number => {
  const targetTokens = tokenize(target.toLowerCase())
  const attemptTokens = tokenize(attempt.toLowerCase())
  let hits = 0
  const total = Math.max(targetTokens.length, 1)

  for (let i = 0; i < total; i += 1) {
    if (attemptTokens[i] && targetTokens[i] && attemptTokens[i] === targetTokens[i]) {
      hits += 1
    }
  }

  return Math.round((hits / total) * 100)
}

const loadFromStorage = (): MemorizeData | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<MemorizeData>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      ref: parsed.ref ?? '',
      text: parsed.text ?? '',
      context: parsed.context ?? '',
      paraphrase: parsed.paraphrase ?? '',
    }
  } catch (error) {
    console.warn('Unable to load memorize helper data:', error)
    return null
  }
}

const saveToStorage = (data: MemorizeData) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Unable to persist memorize helper data:', error)
  }
}

const MemorizeHelper = () => {
  const [data, setData] = useState<MemorizeData>({ ref: '', text: '', context: '', paraphrase: '' })
  const [mode, setMode] = useState<Mode>('read')
  const [attempt, setAttempt] = useState('')
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [phrases, setPhrases] = useState<string[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackTone, setFeedbackTone] = useState<'neutral' | 'success' | 'error'>('neutral')
  const [savedNotice, setSavedNotice] = useState<string | null>(null)
  
  // Verse search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBible, setSelectedBible] = useState('KJV')
  const [selectedBook, setSelectedBook] = useState('Genesis')
  const [selectedChapter, setSelectedChapter] = useState(1)
  
  // Load Bible data for verse search
  const { bibleData } = useBibleData({
    bibleId: selectedBible,
    book: selectedBook,
    setBook: setSelectedBook,
    chapter: selectedChapter,
    setChapter: setSelectedChapter,
    crossReferenceMode: false,
  })
  
  const { results: searchResults, search: searchBible, clear: clearSearch } = useBibleSearch(bibleData)

  useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      setData(stored)
    }
  }, [])

  useEffect(() => {
    setPhrases(splitPhrases(data.text))
  }, [data.text])

  const handleChange = (field: keyof MemorizeData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    saveToStorage(data)
    setSavedNotice('Verse stored locally.')
    window.setTimeout(() => setSavedNotice(null), 1800)
  }

  const handleLoadSample = () => {
    setData(SAMPLE_VERSE)
    setMode('first')
    setAttempt('')
    setAccuracy(null)
    setFeedback(null)
    setFeedbackTone('neutral')
  }

  const handleClear = () => {
    const cleared: MemorizeData = { ref: '', text: '', context: '', paraphrase: '' }
    setData(cleared)
    setAttempt('')
    setAccuracy(null)
    setFeedback(null)
    setFeedbackTone('neutral')
    saveToStorage(cleared)
  }

  const handleCheckAttempt = () => {
    if (!data.text.trim()) return
    const score = compareAccuracy(data.text, attempt)
    setAccuracy(score)
    if (score === 100) {
      setFeedback('Excellent recall!')
      setFeedbackTone('success')
    } else if (score >= 70) {
      setFeedback('Strong recall. A little more practice will perfect it!')
      setFeedbackTone('success')
    } else {
      setFeedback('Keep practicing. Focus on the sections you missed.')
      setFeedbackTone('neutral')
    }
  }

  const handleShufflePhrases = () => {
    setPhrases((prev) => shuffle(prev.length ? prev : splitPhrases(data.text)))
    setFeedback(null)
    setFeedbackTone('neutral')
  }

  const handleResetPhrases = () => {
    setPhrases(splitPhrases(data.text))
    setFeedback('Phrases reset to the original order.')
    setFeedbackTone('neutral')
  }

  const handleCheckOrder = () => {
    const original = splitPhrases(data.text)
    if (!original.length || original.length !== phrases.length) {
      setFeedback('Add a verse with at least one punctuation break to use this mode.')
      setFeedbackTone('error')
      return
    }
    const matches = phrases.every((phrase, index) => phrase === original[index])
    setFeedback(matches ? 'Great job! The phrases are in the right order.' : 'Not quite yet—keep arranging and try again.')
    setFeedbackTone(matches ? 'success' : 'error')
  }

  const handleDrag = (from: number, to: number) => {
    setPhrases((prev) => {
      const copy = [...prev]
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved)
      return copy
    })
  }
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isBibleReference(searchQuery)) {
      // Try to parse as Bible reference
      const parsed = parseBibleReference(searchQuery, bibleData ? Object.keys(bibleData) : [])
      if (parsed && bibleData) {
        setSelectedBook(parsed.book)
        setSelectedChapter(parsed.chapter)
        
        const verses = bibleData[parsed.book]?.[parsed.chapter]
        if (verses && parsed.verse) {
          // Handle verse ranges (e.g., 3:5-6)
          if (parsed.endVerse) {
            // Combine multiple verses WITHOUT verse numbers
            const verseNumbers: number[] = []
            const verseTexts: string[] = []
            
            for (let v = parsed.verse; v <= parsed.endVerse; v++) {
              if (verses[v]) {
                verseNumbers.push(v)
                verseTexts.push(verses[v]) // Just the text, no verse numbers
              }
            }
            
            if (verseTexts.length > 0) {
              const combinedText = verseTexts.join(' ')
              const startVerse = verseNumbers[0]
              const endVerse = verseNumbers[verseNumbers.length - 1]
              const ref = endVerse > startVerse 
                ? `${parsed.book} ${parsed.chapter}:${startVerse}-${endVerse}`
                : `${parsed.book} ${parsed.chapter}:${startVerse}`
              
              setData({
                ref: ref,
                text: combinedText,
                context: '',
                paraphrase: '',
              })
              clearSearch()
              setSavedNotice('Verses loaded. Add context and paraphrase, then save.')
              window.setTimeout(() => setSavedNotice(null), 3000)
            }
          } else {
            // Single verse
            if (verses[parsed.verse]) {
              handleSelectVerse(parsed.book, parsed.chapter, parsed.verse, verses[parsed.verse])
            }
          }
        }
        return
      }
    }
    
    // Otherwise perform keyword search
    searchBible(searchQuery)
  }
  
  const handleSelectVerse = (book: string, chapter: number, verse: number, text: string) => {
    setData({
      ref: `${book} ${chapter}:${verse}`,
      text: text,
      context: '',
      paraphrase: '',
    })
    clearSearch()
    setSavedNotice('Verse loaded. Add context and paraphrase, then save.')
    window.setTimeout(() => setSavedNotice(null), 3000)
  }

  const firstLettersView = useMemo(() => buildFirstLetters(data.text), [data.text])
  const clozeView = useMemo(() => buildCloze(data.text), [data.text])

  const modeSummary = MODE_CONFIG.find((config) => config.id === mode)?.summary ?? ''

  const renderOutput = () => {
    switch (mode) {
      case 'read':
        return (
          <div className={styles.outputPanel}>
            <strong className={styles.smallLabel}>Verse</strong>
            {data.text || 'Add your verse text to begin.'}
            <div className={styles.metaSection}>
              {data.context && (
                <div className={styles.metaItem}>
                  <strong>Context</strong>
                  {data.context}
                </div>
              )}
              {data.paraphrase && (
                <div className={styles.metaItem}>
                  <strong>Paraphrase</strong>
                  {data.paraphrase}
                </div>
              )}
            </div>
          </div>
        )
      case 'first':
        return (
          <div className={styles.outputPanel}>
            {data.text ? firstLettersView : 'Enter a verse to generate first letters.'}
          </div>
        )
      case 'cloze':
        return (
          <div className={styles.outputPanel}>
            {data.text ? clozeView : 'Enter a verse to create a cloze exercise.'}
          </div>
        )
      case 'type':
        return (
          <div>
            <label className={`${styles.smallLabel} ${styles.fieldLabel}`} htmlFor="typeAttempt">Type from memory</label>
            <textarea
              id="typeAttempt"
              className={`${styles.fieldTextarea} ${styles.outputPanel} ${styles.resultTextArea}`}
              value={attempt}
              onChange={(event) => {
                setAttempt(event.target.value)
                setAccuracy(null)
                setFeedback(null)
                setFeedbackTone('neutral')
              }}
              placeholder="Type the verse from memory, then check accuracy."
            />
            <div className={styles.buttonRow}>
              <button type="button" className={`${styles.primaryButton}`} onClick={handleCheckAttempt}>
                Check Accuracy
              </button>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => {
                  setAttempt('')
                  setAccuracy(null)
                  setFeedback(null)
                  setFeedbackTone('neutral')
                }}
              >
                Clear Attempt
              </button>
            </div>
            {accuracy !== null && (
              <div className={styles.accuracyRow}>
                <span>Accuracy:</span>
                <span className={styles.accuracyScore}>{accuracy}%</span>
              </div>
            )}
            {feedback && (
              <div
                className={`${styles.feedbackMessage} ${
                  feedbackTone === 'success'
                    ? styles.feedbackMessageSuccess
                    : feedbackTone === 'error'
                      ? styles.feedbackMessageError
                      : ''
                }`}
              >
                {feedback}
              </div>
            )}
          </div>
        )
      case 'order': {
        const originalPhrases = splitPhrases(data.text)
        return (
          <div>
            {!originalPhrases.length && (
              <div className={styles.sampleNotice}>
                Add a verse with commas, semicolons, or dashes to generate phrase blocks.
              </div>
            )}
            <div className={styles.phrasePool}>
              {phrases.map((phrase, index) => (
                <DraggableChip
                  key={`${phrase}-${index}`}
                  index={index}
                  phrase={phrase}
                  onMove={handleDrag}
                />
              ))}
            </div>
            {originalPhrases.length > 1 && (
              <div className={styles.orderActions}>
                <button type="button" className={styles.secondaryButton} onClick={handleCheckOrder}>
                  Check Order
                </button>
                <button type="button" className={styles.ghostButton} onClick={handleShufflePhrases}>
                  Shuffle
                </button>
                <button type="button" className={styles.ghostButton} onClick={handleResetPhrases}>
                  Reset
                </button>
              </div>
            )}
            {feedback && (
              <div
                className={`${styles.feedbackMessage} ${
                  feedbackTone === 'success'
                    ? styles.feedbackMessageSuccess
                    : feedbackTone === 'error'
                      ? styles.feedbackMessageError
                      : ''
                }`}
              >
                {feedback}
              </div>
            )}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <section>
      <div className={`card ${styles.introCard}`}>
        <h2 className={styles.introCardTitle}>Memorize Helper</h2>
        <p className={styles.introCardSubtitle}>
          Capture the verse, rehearse it across different modes, and build lasting recall.
        </p>
      </div>
      <div className={styles.helperContainer}>
        <section className={`${styles.inputCard} card`}>
          <h3 className={styles.sectionTitle}>Verse Details</h3>
          <p className={styles.subtext}>Save the passage along with context and your own paraphrase.</p>

          <div>
            <label className={styles.fieldLabel} htmlFor="bibleVersion">Bible Version</label>
            <select
              id="bibleVersion"
              value={selectedBible}
              onChange={(e) => setSelectedBible(e.target.value)}
              className={styles.fieldSelect}
            >
              <option value="KJV">King James Version (KJV)</option>
              <option value="NKJV">New King James Version (NKJV)</option>
              <option value="ESV">English Standard Version (ESV)</option>
              <option value="NIV">New International Version (NIV)</option>
              <option value="NASB">New American Standard Bible (NASB)</option>
              <option value="NLT">New Living Translation (NLT)</option>
            </select>
          </div>

          <div>
            <form onSubmit={handleSearchSubmit}>
              <label className={styles.fieldLabel} htmlFor="verseSearch">
                Search by reference or keyword
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="verseSearch"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.fieldInput}
                  placeholder="e.g. John 3:16 or 'love'"
                  style={{ flex: 1 }}
                />
                <button type="submit" className={styles.primaryButton} style={{ padding: '10px 14px' }}>
                  {isBibleReference(searchQuery) ? <BookOpen size={18} /> : <Search size={18} />}
                </button>
              </div>
            </form>
            
            {searchResults.length > 0 && (
              <div className={styles.searchResultsList} style={{ marginTop: '12px' }}>
                <div className={styles.searchResultsHeader}>
                  Search Results ({searchResults.length})
                </div>
                {searchResults.slice(0, 20).map((result, index) => (
                  <div
                    key={`${result.reference}-${index}`}
                    className={styles.searchResultItem}
                    onClick={() => handleSelectVerse(result.book, result.chapter, result.verse, result.text)}
                  >
                    <div className={styles.resultReference}>{result.reference}</div>
                    <div className={styles.resultText}>{result.text}</div>
                  </div>
                ))}
                {searchResults.length > 20 && (
                  <div className={styles.resultsTruncated}>
                    ... and {searchResults.length - 20} more results. Try a more specific search.
                  </div>
                )}
              </div>
            )}
          </div>

          {data.ref && (
            <div style={{ padding: '12px', background: 'var(--sf-accent-soft)', borderRadius: '10px', fontSize: '0.9rem' }}>
              <strong>Selected:</strong> {data.ref}
            </div>
          )}

          <div>
            <label className={styles.fieldLabel} htmlFor="verseText">Verse Text</label>
            <textarea
              id="verseText"
              value={data.text}
              onChange={handleChange('text')}
              className={styles.fieldTextarea}
              placeholder="Type or paste the verse here"
            />
          </div>

          <div>
            <label className={styles.fieldLabel} htmlFor="verseContext">Context</label>
            <textarea
              id="verseContext"
              value={data.context}
              onChange={handleChange('context')}
              className={styles.fieldTextarea}
              placeholder="Add historical, literary, or devotional context"
            />
          </div>

          <div>
            <label className={styles.fieldLabel} htmlFor="verseParaphrase">Your Paraphrase</label>
            <textarea
              id="verseParaphrase"
              value={data.paraphrase}
              onChange={handleChange('paraphrase')}
              className={styles.fieldTextarea}
              placeholder="Write the verse in your own words"
            />
          </div>

          <div className={styles.buttonRow}>
            <button type="button" className={styles.secondaryButton} onClick={handleLoadSample}>
              Load Sample
            </button>
            <button type="button" className={styles.ghostButton} onClick={handleClear}>
              Clear All
            </button>
          </div>
          {savedNotice && <div className={styles.sampleNotice}>{savedNotice}</div>}
        </section>

        <section className={`${styles.outputCard} card`}>
          <h3 className={styles.sectionTitle}>Practice Modes</h3>
          <p className={styles.subtext}>Rotate through different prompts to move from recognition to recall.</p>
          <div className={styles.tabList}>
            {MODE_CONFIG.map((config) => (
              <button
                key={config.id}
                type="button"
                className={`${styles.tabButton} ${mode === config.id ? styles.tabButtonActive : ''}`}
                onClick={() => {
                  setMode(config.id)
                  setFeedback(null)
                  setFeedbackTone('neutral')
                  if (config.id === 'order') {
                    setPhrases(splitPhrases(data.text))
                  }
                }}
              >
                {config.label}
              </button>
            ))}
          </div>
          {modeSummary && <p className={styles.modeSummary}>{modeSummary}</p>}
          {renderOutput()}
        </section>
      </div>
    </section>
  )
}

type DraggableChipProps = {
  index: number
  phrase: string
  onMove: (from: number, to: number) => void
}

const DraggableChip = ({ index, phrase, onMove }: DraggableChipProps) => {
  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', String(index))
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const fromIndex = Number(event.dataTransfer.getData('text/plain'))
    if (!Number.isNaN(fromIndex) && fromIndex !== index) {
      onMove(fromIndex, index)
    }
  }

  return (
    <div
      className={styles.phraseChip}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {phrase}
    </div>
  )
}

export default MemorizeHelper
