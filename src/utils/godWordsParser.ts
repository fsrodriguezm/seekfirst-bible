/**
 * Utility for parsing and working with God's words references in the Old Testament
 */
import { SPANISH_TO_ENGLISH_BOOKS } from './bookNameMappings'

type ChapterReferences = Record<string, string[]>
type GodWordsReferences = Record<string, ChapterReferences>

type GodWordsData = {
  references: GodWordsReferences
}

let godWordsData: GodWordsData | null = null

/**
 * Load the God words reference data
 */
export const loadGodWordsData = async (): Promise<GodWordsData | null> => {
  if (godWordsData) return godWordsData

  try {
    const response = await fetch('/api/resources/gods_words/god_words_references.json')
    const data = await response.json() as GodWordsData
    godWordsData = data
    return godWordsData
  } catch (error) {
    console.error('Error loading God words data:', error)
    return null
  }
}

/**
 * Parse a verse range string into an array of verse numbers
 * Examples: "5" -> [5], "5-16" -> [5,6,7,...,16], "3" -> [3]
 */
const parseVerseRange = (rangeString: string): number[] => {
  const range = rangeString.trim()

  if (range.includes('-')) {
    const [startValue, endValue] = range.split('-').map((num) => parseInt(num.trim(), 10))
    if (Number.isNaN(startValue) || Number.isNaN(endValue)) return []
    const start = Math.min(startValue, endValue)
    const end = Math.max(startValue, endValue)
    const verses: number[] = []
    for (let i = start; i <= end; i += 1) {
      verses.push(i)
    }
    return verses
  }

  const single = parseInt(range, 10)
  return Number.isNaN(single) ? [] : [single]
}

/**
 * Get all verse numbers containing God's words for a specific book and chapter
 */
export const getGodWordsVerses = async (bookName: string, chapterNumber: number): Promise<Set<number>> => {
  if (!godWordsData) {
    await loadGodWordsData()
  }

  if (!godWordsData) {
    return new Set()
  }

  const englishBookName = SPANISH_TO_ENGLISH_BOOKS[bookName] || bookName
  const bookData = godWordsData.references[englishBookName]
  const chapterDataRaw = bookData?.[chapterNumber.toString()]

  if (!Array.isArray(chapterDataRaw)) {
    return new Set()
  }

  const chapterData = chapterDataRaw as string[]
  const verses = new Set<number>()

  chapterData.forEach((rangeString) => {
    const parsedVerses = parseVerseRange(rangeString)
    parsedVerses.forEach((verse) => verses.add(verse))
  })

  return verses
}

/**
 * Check if a specific verse contains God's words
 */
export const isGodWordsVerse = async (bookName: string, chapterNumber: number, verseNumber: number): Promise<boolean> => {
  const godVerses = await getGodWordsVerses(bookName, chapterNumber)
  return godVerses.has(verseNumber)
}

/**
 * Check if a book contains any God's words
 */
export const hasGodWords = (bookName: string): boolean => {
  if (!godWordsData?.references) {
    return false
  }
  const englishBookName = SPANISH_TO_ENGLISH_BOOKS[bookName] || bookName
  return englishBookName in godWordsData.references
}

/**
 * Check if a verse contains either Jesus' words or God's words
 */
export const getWordType = async (bookName: string, chapterNumber: number, verseNumber: number): Promise<'jesus' | 'god' | null> => {
  const { isJesusWordsVerse } = await import('./jesusWordsParser') as typeof import('./jesusWordsParser')
  const isJesus = await isJesusWordsVerse(bookName, chapterNumber, verseNumber)
  if (isJesus) return 'jesus'

  const isGod = await isGodWordsVerse(bookName, chapterNumber, verseNumber)
  if (isGod) return 'god'

  return null
}
