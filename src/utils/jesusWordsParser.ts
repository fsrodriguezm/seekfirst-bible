/**
 * Utility for parsing and working with Jesus' words references
 */
import { SPANISH_TO_ENGLISH_BOOKS } from './bookNameMappings'

type ChapterReferences = Record<string, string[]>
type JesusWordsReferences = Record<string, ChapterReferences>

type JesusWordsData = {
  references: JesusWordsReferences
}

let jesusWordsData: JesusWordsData | null = null

/**
 * Load the Jesus words reference data
 */
export const loadJesusWordsData = async (): Promise<JesusWordsData | null> => {
  if (jesusWordsData) return jesusWordsData

  try {
    const response = await fetch('/api/resources/jesus_words/jesus_words_references.json')
    const data = await response.json() as JesusWordsData
    jesusWordsData = data
    return jesusWordsData
  } catch (error) {
    console.error('Error loading Jesus words data:', error)
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
 * Get all verse numbers containing Jesus' words for a specific book and chapter
 */
export const getJesusWordsVerses = async (bookName: string, chapterNumber: number): Promise<Set<number>> => {
  if (!jesusWordsData) {
    await loadJesusWordsData()
  }

  if (!jesusWordsData) {
    return new Set()
  }

  const englishBookName = SPANISH_TO_ENGLISH_BOOKS[bookName] || bookName
  const bookData = jesusWordsData.references[englishBookName]
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
 * Check if a specific verse contains Jesus' words
 */
export const isJesusWordsVerse = async (bookName: string, chapterNumber: number, verseNumber: number): Promise<boolean> => {
  const jesusVerses = await getJesusWordsVerses(bookName, chapterNumber)
  return jesusVerses.has(verseNumber)
}

/**
 * Check if a book contains any Jesus' words
 */
export const hasJesusWords = (bookName: string): boolean => {
  if (!jesusWordsData?.references) {
    return false
  }
  const englishBookName = SPANISH_TO_ENGLISH_BOOKS[bookName] || bookName
  return englishBookName in jesusWordsData.references
}
