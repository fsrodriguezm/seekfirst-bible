/**
 * Bible API Service
 * Handles requests to the REST Bible API
 * Documentation: https://docs.api.bible
 */

const API_BASE_URL = 'https://rest.api.bible/v1'
const API_KEY = process.env.NEXT_PUBLIC_BIBLE_API_KEY || ''

interface BibleVersion {
  abbreviation: string
  name: string
  language: string
  id: string
}

interface Verse {
  id: string
  orgId: string
  bookId: string
  bookName: string
  chapterId: string
  chapterNumber: number
  verseNumber: number
  reference: string
  text: string
}

interface ChapterContent {
  id: string
  bookId: string
  number: number
  bookName: string
  reference: string
  content: string
  copyright?: string
}

interface ApiErrorResponse {
  error: {
    type: string
    message: string
  }
}

class BibleApiService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEY
  }

  /**
   * Get all available Bible versions
   */
  async getBibles(): Promise<BibleVersion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bibles`, {
        headers: {
          'api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch bibles: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching bibles:', error)
      throw error
    }
  }

  /**
   * Get a specific Bible version
   */
  async getBible(bibleId: string): Promise<BibleVersion | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}`, {
        headers: {
          'api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch bible: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data || null
    } catch (error) {
      console.error('Error fetching bible:', error)
      throw error
    }
  }

  /**
   * Get chapter content (recommended approach)
   * Returns formatted chapter with all verses
   */
  async getChapter(bibleId: string, chapterId: string): Promise<ChapterContent | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`,
        {
          headers: {
            'api-key': this.apiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch chapter: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data || null
    } catch (error) {
      console.error('Error fetching chapter:', error)
      throw error
    }
  }

  /**
   * Get specific verses
   */
  async getVerses(bibleId: string, verseIds: string[]): Promise<Verse[]> {
    try {
      const verseId = verseIds.join(',')
      const response = await fetch(
        `${API_BASE_URL}/bibles/${bibleId}/verses?ids=${encodeURIComponent(verseId)}`,
        {
          headers: {
            'api-key': this.apiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch verses: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching verses:', error)
      throw error
    }
  }

  /**
   * Get books in a Bible
   */
  async getBooks(bibleId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bibles/${bibleId}/books`, {
        headers: {
          'api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching books:', error)
      throw error
    }
  }

  /**
   * Parse chapter content into verse map format
   * Converts HTML content to verse number -> text mapping
   */
  parseChapterContent(content: string): Record<string, string> {
    const verses: Record<string, string> = {}

    // Match verse patterns like <span class="v" id="v1">1 </span> text
    const verseRegex = /<span[^>]*class="[^"]*v[^"]*"[^>]*id="v(\d+)"[^>]*>(\d+)\s*<\/span>\s*([^<]*(?:<(?!\/div)[^>]*>[^<]*)*)/gi

    let match
    while ((match = verseRegex.exec(content)) !== null) {
      const verseNumber = match[1]
      const verseText = match[3].replace(/<[^>]*>/g, '').trim()

      if (verseText) {
        verses[verseNumber] = verseText
      }
    }

    // If regex didn't work, try simple text extraction
    if (Object.keys(verses).length === 0) {
      // Split by verse numbers (1 2 3 etc at the start of a line)
      const lines = content.split(/\n/)
      let currentVerse = ''

      lines.forEach((line) => {
        const verseMatch = line.match(/^\s*(\d+)\s+(.*)/)
        if (verseMatch) {
          if (currentVerse) {
            const lastVerseNum = Object.keys(verses).length + 1
            verses[String(lastVerseNum)] = currentVerse
          }
          currentVerse = verseMatch[2]
        } else if (currentVerse) {
          currentVerse += ' ' + line
        }
      })

      if (currentVerse) {
        const lastVerseNum = Object.keys(verses).length + 1
        verses[String(lastVerseNum)] = currentVerse
      }
    }

    return verses
  }

  /**
   * Fetch and parse a chapter
   */
  async getChapterVerses(bibleId: string, chapterId: string): Promise<Record<string, string>> {
    try {
      const chapter = await this.getChapter(bibleId, chapterId)
      if (!chapter) return {}

      return this.parseChapterContent(chapter.content)
    } catch (error) {
      console.error('Error getting chapter verses:', error)
      return {}
    }
  }
}

export default new BibleApiService()
export type { BibleVersion, Verse, ChapterContent }
