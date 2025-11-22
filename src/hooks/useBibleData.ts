import { useEffect, useRef, useState } from 'react'
import { ENGLISH_TO_SPANISH_BOOKS, SPANISH_TO_ENGLISH_BOOKS } from '../utils/bookNameMappings'
import {
  getVersionAssetPath,
  getVersionFileName,
  getVersionLanguage,
} from '../utils/versionMap'
import { shouldUseApi, fetchChapter } from '../services/bibleApi'

export type VerseMap = Record<string, string>
export type BibleChapterMap = Record<string, VerseMap>
export type BibleData = Record<string, BibleChapterMap>

interface UseBibleDataOptions {
  bibleId: string
  book: string
  setBook: (_book: string) => void
  chapter: number
  setChapter: (_chapter: number) => void
  crossReferenceMode: boolean
  onCrossReferenceReset?: () => void
}

interface UseBibleDataResult {
  bibleData: BibleData | null
  verses: VerseMap
  isLoading: boolean
  apiCopyright?: string | null
}

export const useBibleData = ({
  bibleId,
  book,
  setBook,
  chapter,
  setChapter,
  crossReferenceMode,
  onCrossReferenceReset,
}: UseBibleDataOptions): UseBibleDataResult => {
  const [bibleData, setBibleData] = useState<BibleData | null>(null)
  const [verses, setVerses] = useState<VerseMap>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiCopyright, setApiCopyright] = useState<string | null>(null)
  const previousBibleRef = useRef<string>(bibleId)

  useEffect(() => {
    let isActive = true

    const loadBibleData = async (): Promise<void> => {
      setIsLoading(true)
      try {
        if (!bibleId) {
          if (!isActive) return
          setBibleData(null)
          setVerses({})
          return
        }

        const versionLanguage = getVersionLanguage(bibleId) ?? 'en'

        // Check if this version should use the API
        const useApi = shouldUseApi(bibleId)

        let data: BibleData | null = null

        if (useApi) {
          // For API-based Bibles, we fetch chapter by chapter
          // We'll create a minimal structure to make the rest of the code work
          const chapterResult = await fetchChapter(bibleId, book, chapter)
          if (!isActive) return

          if (chapterResult) {
            // Store the copyright from the API response
            setApiCopyright(chapterResult.copyright || null)

            // Create a minimal BibleData structure with just the current chapter
            data = {
              [book]: {
                [String(chapter)]: chapterResult.verses,
              },
            }
          }
        } else {
          // Use the existing JSON file approach
          const assetPath = getVersionAssetPath(bibleId)
          let response = await fetch(assetPath)

          if (!response.ok) {
            const fallbackPath = `/api/bibles/${getVersionFileName(bibleId)}`
            if (fallbackPath !== assetPath) {
              const fallbackResponse = await fetch(fallbackPath)
              if (fallbackResponse.ok) {
                response = fallbackResponse
              } else {
                throw new Error(
                  `Failed to load Bible data for ${bibleId} from ${assetPath} or ${fallbackPath}`,
                )
              }
            } else {
              throw new Error(`Failed to load Bible data for ${bibleId} from ${assetPath}`)
            }
          }

          data = (await response.json()) as BibleData
        }

        if (!isActive) return
        if (!data) {
          throw new Error('Failed to load Bible data')
        }

        setBibleData(data)

        const bibleChanged = previousBibleRef.current !== bibleId
        previousBibleRef.current = bibleId

        let bookToLoad = book
        let chapterToLoad = chapter

        if (bibleChanged) {
          const isSpanishBible = versionLanguage === 'es'
          const availableBooks = Object.keys(data)

          if (isSpanishBible && ENGLISH_TO_SPANISH_BOOKS[book]) {
            bookToLoad = ENGLISH_TO_SPANISH_BOOKS[book]
          } else if (!isSpanishBible && SPANISH_TO_ENGLISH_BOOKS[book]) {
            bookToLoad = SPANISH_TO_ENGLISH_BOOKS[book]
          } else if (!availableBooks.includes(book)) {
            bookToLoad = availableBooks[0]
          }

          if (bookToLoad !== book) {
            setBook(bookToLoad)
          }
        }

        const chapterMap = data[bookToLoad]
        if (chapterMap) {
          if (!chapterMap[String(chapterToLoad)]) {
            chapterToLoad = 1
            setChapter(1)
          }
          const versesForChapter = chapterMap[String(chapterToLoad)]
          setVerses(versesForChapter ?? {})
        } else {
          setVerses({})
        }

        if (crossReferenceMode && onCrossReferenceReset) {
          onCrossReferenceReset()
        }
      } catch (error) {
        console.error('Error loading Bible data:', error)
        if (!isActive) return
        setBibleData(null)
        setVerses({})
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadBibleData()

    return () => {
      isActive = false
    }
  }, [bibleId, book, chapter, crossReferenceMode, setBook, setChapter, onCrossReferenceReset])

  useEffect(() => {
    if (!bibleData) {
      setVerses({})
      return
    }

    const bookData = bibleData[book]
    const versesForChapter = bookData?.[String(chapter)]
    setVerses(versesForChapter ?? {})
  }, [bibleData, book, chapter])

  return {
    bibleData,
    verses,
    isLoading,
    apiCopyright,
  }
}
