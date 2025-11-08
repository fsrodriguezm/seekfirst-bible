import { useCallback, useEffect, useState } from 'react'
import { getVersionAssetPath } from '../utils/versionMap'
import {
  STRONGS_BIBLE_ID,
  normalizeStrongsBookName,
  type StrongsBookIndex,
  type StrongsChapterVerses,
} from '../utils/strongs'

type RawStrongsEntry = {
  book_name: string
  chapter: number
  verse: number
  text: string
}

type RawStrongsResponse = {
  verses?: RawStrongsEntry[]
}

const buildStrongsIndex = (entries: RawStrongsEntry[]): StrongsBookIndex => {
  return entries.reduce<StrongsBookIndex>((acc, entry) => {
    const bookName = entry.book_name
    if (!acc[bookName]) {
      acc[bookName] = {}
    }
    if (!acc[bookName][entry.chapter]) {
      acc[bookName][entry.chapter] = {}
    }
    acc[bookName][entry.chapter][entry.verse] = entry.text
    return acc
  }, {})
}

interface UseStrongsDataResult {
  isLoading: boolean
  error: string | null
  hasData: boolean
  getChapterStrongs: (bookName: string, chapter: number) => StrongsChapterVerses | null
}

export const useStrongsData = (enabled: boolean): UseStrongsDataResult => {
  const [strongsIndex, setStrongsIndex] = useState<StrongsBookIndex | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || strongsIndex) return

    let isMounted = true

    const loadStrongs = async (): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(getVersionAssetPath(STRONGS_BIBLE_ID))
        if (!response.ok) {
          throw new Error('Unable to load Strong\'s data')
        }

        const payload = (await response.json()) as RawStrongsResponse
        if (!payload?.verses?.length) {
          throw new Error('Strong\'s data is missing verse content')
        }

        if (!isMounted) return
        setStrongsIndex(buildStrongsIndex(payload.verses))
      } catch (err) {
        console.error('Failed to load Strong\'s numbers', err)
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unknown error loading Strong\'s data'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadStrongs()

    return () => {
      isMounted = false
    }
  }, [enabled, strongsIndex])

  const getChapterStrongs = useCallback(
    (bookName: string, chapter: number): StrongsChapterVerses | null => {
      if (!strongsIndex) return null
      const normalizedBook = normalizeStrongsBookName(bookName)
      return strongsIndex[normalizedBook]?.[chapter] ?? null
    },
    [strongsIndex],
  )

  return {
    isLoading,
    error,
    hasData: !!strongsIndex,
    getChapterStrongs,
  }
}
