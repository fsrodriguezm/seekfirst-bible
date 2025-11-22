/**
 * Bible API Service
 * Handles communication with api.bible API
 */

// Use our own API route instead of calling api.bible directly
// This keeps the API key server-side only

// Map of Bible version IDs to their api.bible IDs
const BIBLE_VERSION_TO_API_ID: Record<string, string> = {
  RVR1909: '592420522e16049f-01', // Reina Valera 1909
  // Add more mappings as needed
}

export interface BibleApiVerse {
  number: number
  text: string
}

export interface BibleApiChapter {
  id: string
  bibleId: string
  number: string
  bookId: string
  reference: string
  content: string
  copyright?: string
  verseCount: number
  next?: {
    id: string
    number: string
    bookId: string
  }
  previous?: {
    id: string
    number: string
    bookId: string
  }
}

export interface BibleApiResponse {
  data: BibleApiChapter
  meta: {
    fumsToken?: string
  }
}

export interface FetchChapterResult {
  verses: Record<string, string>
  copyright?: string
}

/**
 * Parse HTML content from API response into verse map
 */
export const parseHtmlContent = (html: string): Record<string, string> => {
  const verses: Record<string, string> = {}

  // Create a temporary DOM parser (works in browser)
  if (typeof window === 'undefined') {
    return verses
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Find all verse elements (spans with data-number attribute)
  const verseElements = doc.querySelectorAll('span[data-number]')

  verseElements.forEach((verseElement) => {
    const verseNumber = verseElement.getAttribute('data-number')
    if (!verseNumber) return

    // Get the verse text by collecting all text content after this verse marker
    // until the next verse marker
    let verseText = ''
    let currentElement: Element | null = verseElement

    // Walk through siblings to collect verse text
    while (currentElement) {
      const parent = currentElement.parentElement
      if (!parent) break

      let sibling = currentElement.nextSibling
      while (sibling) {
        // If we hit another verse marker, stop
        if (sibling.nodeType === Node.ELEMENT_NODE) {
          const element = sibling as Element
          if (element.hasAttribute('data-number')) {
            break
          }
        }

        // Collect text content
        if (sibling.textContent) {
          verseText += sibling.textContent
        }

        sibling = sibling.nextSibling
      }

      // Move up to parent's next sibling if we're at the end
      if (parent.tagName === 'P' && parent.hasAttribute('data-vid')) {
        currentElement = parent
      } else {
        break
      }
    }

    // Clean up the verse text
    verseText = verseText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    if (verseText) {
      verses[verseNumber] = verseText
    }
  })

  return verses
}

/**
 * Simpler parsing approach - extract verse numbers and text directly
 */
export const parseHtmlContentSimple = (html: string): Record<string, string> => {
  const verses: Record<string, string> = {}

  // Match pattern: <span data-number="X" ...>X</span>...verse text...
  const versePattern = /<span[^>]*data-number="(\d+)"[^>]*>\d+<\/span>([^<]*(?:<[^>]+>[^<]*)*?)(?=<span[^>]*data-number="|$)/g

  let match
  while ((match = versePattern.exec(html)) !== null) {
    const verseNumber = match[1]
    let verseText = match[2]

    // Clean HTML tags from verse text
    verseText = verseText
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    if (verseText) {
      verses[verseNumber] = verseText
    }
  }

  return verses
}

/**
 * Map book names to api.bible book IDs
 * You'll need to expand this based on your book name mappings
 */
const BOOK_NAME_TO_API_ID: Record<string, string> = {
  // Old Testament
  Genesis: 'GEN',
  Exodus: 'EXO',
  Leviticus: 'LEV',
  Numbers: 'NUM',
  Deuteronomy: 'DEU',
  Joshua: 'JOS',
  Judges: 'JDG',
  Ruth: 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  Ezra: 'EZR',
  Nehemiah: 'NEH',
  Esther: 'EST',
  Job: 'JOB',
  Psalms: 'PSA',
  Proverbs: 'PRO',
  Ecclesiastes: 'ECC',
  'Song of Solomon': 'SNG',
  Isaiah: 'ISA',
  Jeremiah: 'JER',
  Lamentations: 'LAM',
  Ezekiel: 'EZK',
  Daniel: 'DAN',
  Hosea: 'HOS',
  Joel: 'JOL',
  Amos: 'AMO',
  Obadiah: 'OBA',
  Jonah: 'JON',
  Micah: 'MIC',
  Nahum: 'NAM',
  Habakkuk: 'HAB',
  Zephaniah: 'ZEP',
  Haggai: 'HAG',
  Zechariah: 'ZEC',
  Malachi: 'MAL',

  // New Testament
  Matthew: 'MAT',
  Mark: 'MRK',
  Luke: 'LUK',
  John: 'JHN',
  Acts: 'ACT',
  Romans: 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  Galatians: 'GAL',
  Ephesians: 'EPH',
  Philippians: 'PHP',
  Colossians: 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  Titus: 'TIT',
  Philemon: 'PHM',
  Hebrews: 'HEB',
  James: 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  Jude: 'JUD',
  Revelation: 'REV',

  // Spanish book names
  'Génesis': 'GEN',
  'Éxodo': 'EXO',
  'Levítico': 'LEV',
  'Números': 'NUM',
  'Deuteronomio': 'DEU',
  'Josué': 'JOS',
  'Jueces': 'JDG',
  'Rut': 'RUT',
  // '1 Samuel' and '2 Samuel' use English names (same in Spanish)
  '1 Reyes': '1KI',
  '2 Reyes': '2KI',
  '1 Crónicas': '1CH',
  '2 Crónicas': '2CH',
  'Esdras': 'EZR',
  'Nehemías': 'NEH',
  'Ester': 'EST',
  // 'Job' uses English name (same in Spanish)
  'Salmos': 'PSA',
  'Proverbios': 'PRO',
  'Eclesiastés': 'ECC',
  'Cantares': 'SNG',
  'Isaías': 'ISA',
  'Jeremías': 'JER',
  'Lamentaciones': 'LAM',
  'Ezequiel': 'EZK',
  // 'Daniel' uses English name (same in Spanish)
  'Oseas': 'HOS',
  // 'Joel': 'JOL', uses English name (same in Spanish)
  'Amós': 'AMO',
  'Abdías': 'OBA',
  'Jonás': 'JON',
  'Miqueas': 'MIC',
  'Nahúm': 'NAM',
  'Habacuc': 'HAB',
  'Sofonías': 'ZEP',
  'Hageo': 'HAG',
  'Zacarías': 'ZEC',
  'Malaquías': 'MAL',
  'Mateo': 'MAT',
  'Marcos': 'MRK',
  'Lucas': 'LUK',
  'Juan': 'JHN',
  'Hechos': 'ACT',
  'Romanos': 'ROM',
  '1 Corintios': '1CO',
  '2 Corintios': '2CO',
  'Gálatas': 'GAL',
  'Efesios': 'EPH',
  'Filipenses': 'PHP',
  'Colosenses': 'COL',
  '1 Tesalonicenses': '1TH',
  '2 Tesalonicenses': '2TH',
  '1 Timoteo': '1TI',
  '2 Timoteo': '2TI',
  'Tito': 'TIT',
  'Filemón': 'PHM',
  'Hebreos': 'HEB',
  'Santiago': 'JAS',
  '1 Pedro': '1PE',
  '2 Pedro': '2PE',
  '1 Juan': '1JN',
  '2 Juan': '2JN',
  '3 Juan': '3JN',
  'Judas': 'JUD',
  'Apocalipsis': 'REV',
}

/**
 * Get the api.bible book ID from a book name
 */
export const getApiBookId = (bookName: string): string | null => {
  return BOOK_NAME_TO_API_ID[bookName] || null
}

/**
 * Check if a Bible version should use the API
 */
export const shouldUseApi = (bibleId: string): boolean => {
  return bibleId in BIBLE_VERSION_TO_API_ID
}

/**
 * Get the api.bible ID for a Bible version
 */
export const getApiBibleId = (bibleId: string): string | null => {
  return BIBLE_VERSION_TO_API_ID[bibleId] || null
}

/**
 * Fetch a chapter from the Bible API via our Next.js API route
 * This keeps the API key server-side only
 */
export const fetchChapter = async (
  bibleId: string,
  book: string,
  chapter: number,
): Promise<FetchChapterResult | null> => {
  const apiBibleId = getApiBibleId(bibleId)
  const apiBookId = getApiBookId(book)

  if (!apiBibleId || !apiBookId) {
    console.error('Missing API configuration:', { apiBibleId, apiBookId })
    return null
  }

  const chapterId = `${apiBookId}.${chapter}`
  // Use our Next.js API route instead of calling api.bible directly
  const url = `/api/bible/${apiBibleId}/chapters/${chapterId}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`)
      return null
    }

    const data = (await response.json()) as BibleApiResponse

    // Parse the HTML content to extract verses
    const verses = parseHtmlContentSimple(data.data.content)

    return {
      verses,
      copyright: data.data.copyright,
    }
  } catch (error) {
    console.error('Error fetching chapter from Bible API:', error)
    return null
  }
}
