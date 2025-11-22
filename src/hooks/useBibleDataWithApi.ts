import { useEffect, useRef, useState } from 'react'
import bibleApiService from '../utils/bibleApiService'
import { ENGLISH_TO_SPANISH_BOOKS, SPANISH_TO_ENGLISH_BOOKS } from '../utils/bookNameMappings'
import {
  getVersionAssetPath,
  getVersionFileName,
  getVersionLanguage,
} from '../utils/versionMap'

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
  useApiIfAvailable?: boolean
}

interface UseBibleDataResult {
  bibleData: BibleData | null
  verses: VerseMap
  isLoading: boolean
  source: 'api' | 'local'
}

export const useBibleData = ({
  bibleId,
  book,
  setBook,
  chapter,
  setChapter,
  crossReferenceMode,
  onCrossReferenceReset,
  useApiIfAvailable = false,
}: UseBibleDataOptions): UseBibleDataResult => {
  const [bibleData, setBibleData] = useState<BibleData | null>(null)
  const [verses, setVerses] = useState<VerseMap>({})
  const [isLoading, setIsLoading] = useState(false)
  const [source, setSource] = useState<'api' | 'local'>('local')
  const previousBibleRef = useRef<string>(bibleId)

  useEffect(() => {
    let isActive = true

    const loadBibleDataFromLocal = async (): Promise<void> => {
      setIsLoading(true)
      try {
        if (!bibleId) {
          if (!isActive) return
          setBibleData(null)
          setVerses({})
          return
        }

        const versionLanguage = getVersionLanguage(bibleId) ?? 'en'
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

        const data = (await response.json()) as BibleData
        if (!isActive) return

        setBibleData(data)
        setSource('local')

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
        console.error('Error loading Bible data from local:', error)
        if (!isActive) return
        setBibleData(null)
        setVerses({})
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    const loadBibleDataFromApi = async (): Promise<void> => {
      setIsLoading(true)
      try {
        if (!bibleId) {
          if (!isActive) return
          setBibleData(null)
          setVerses({})
          return
        }

        // For API, load chapter verses directly
        const bibleChanged = previousBibleRef.current !== bibleId
        previousBibleRef.current = bibleId

        let bookToLoad = book
        let chapterToLoad = chapter

        try {
          // Fetch the verses for the chapter
          const chapterId = `${bookToLoad.toUpperCase().slice(0, 3)}.${chapterToLoad}`
          const chapterVerses = await bibleApiService.getChapterVerses(bibleId, chapterId)

          if (!isActive) return

          setVerses(chapterVerses)
          setSource('api')

          if (Object.keys(chapterVerses).length === 0) {
            console.warn(`No verses found for ${chapterId} in API, falling back to local`)
            await loadBibleDataFromLocal()
          }

          if (crossReferenceMode && onCrossReferenceReset) {
            onCrossReferenceReset()
          }
        } catch (apiError) {
          console.warn('API request failed, falling back to local:', apiError)
          await loadBibleDataFromLocal()
        }
      } catch (error) {
        console.error('Error loading Bible data from API:', error)
        if (!isActive) return
        // Fallback to local
        await loadBibleDataFromLocal()
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    if (useApiIfAvailable) {
      void loadBibleDataFromApi()
    } else {
      void loadBibleDataFromLocal()
    }

    return () => {
      isActive = false
    }
  }, [bibleId, book, chapter, crossReferenceMode, setBook, setChapter, onCrossReferenceReset, useApiIfAvailable])

  useEffect(() => {
    if (source === 'api' || !bibleData) {
      return
    }

    const bookData = bibleData[book]
    const versesForChapter = bookData?.[String(chapter)]
    setVerses(versesForChapter ?? {})
  }, [bibleData, book, chapter, source])

  return {
    bibleData,
    verses,
    isLoading,
    source,
  }
}
