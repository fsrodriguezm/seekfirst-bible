import { useState, useCallback } from 'react'
import type { BibleData } from './useBibleData'
import type { BibleSearchResult } from '../types/search'

interface UseBibleSearchResult {
  results: BibleSearchResult[]
  search: (_query: string) => void
  clear: () => void
}

export const useBibleSearch = (bibleData: BibleData | null): UseBibleSearchResult => {
  const [results, setResults] = useState<BibleSearchResult[]>([])

  const clear = useCallback(() => {
    setResults([])
  }, [])

  const search = useCallback((query: string) => {
    if (!bibleData || !query.trim()) {
      setResults([])
      return
    }

    const lowered = query.toLowerCase()
    const nextResults: BibleSearchResult[] = []

    Object.entries(bibleData).forEach(([bookName, chapters]) => {
      Object.entries(chapters).forEach(([chapterKey, verses]) => {
        Object.entries(verses).forEach(([verseKey, verseText]) => {
          if (verseText.toLowerCase().includes(lowered)) {
            nextResults.push({
              book: bookName,
              chapter: Number(chapterKey),
              verse: Number(verseKey),
              text: verseText,
              reference: `${bookName} ${chapterKey}:${verseKey}`,
            })
          }
        })
      })
    })

    setResults(nextResults)
  }, [bibleData])

  return { results, search, clear }
}
