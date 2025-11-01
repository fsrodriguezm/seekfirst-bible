import { useEffect, useState } from 'react'
import { getJesusWordsVerses } from '../utils/jesusWordsParser'
import { getGodWordsVerses } from '../utils/godWordsParser'

interface UseHighlightedVersesOptions {
  book: string
  chapter: number
  redLetterMode: boolean
}

interface HighlightedVersesResult {
  jesusVerses: Set<number>
  godVerses: Set<number>
}

export const useHighlightedVerses = ({
  book,
  chapter,
  redLetterMode,
}: UseHighlightedVersesOptions): HighlightedVersesResult => {
  const [jesusVerses, setJesusVerses] = useState<Set<number>>(new Set())
  const [godVerses, setGodVerses] = useState<Set<number>>(new Set())

  useEffect(() => {
    let isActive = true

    const loadHighlightedVerses = async (): Promise<void> => {
      if (!redLetterMode || !book || !chapter) {
        if (isActive) {
          setJesusVerses(new Set())
          setGodVerses(new Set())
        }
        return
      }

      try {
        const [jesus, god] = await Promise.all([
          getJesusWordsVerses(book, chapter),
          getGodWordsVerses(book, chapter),
        ])

        if (!isActive) return
        setJesusVerses(jesus)
        setGodVerses(god)
      } catch (error) {
        console.error('Error loading highlighted verses:', error)
        if (isActive) {
          setJesusVerses(new Set())
          setGodVerses(new Set())
        }
      }
    }

    void loadHighlightedVerses()

    return () => {
      isActive = false
    }
  }, [book, chapter, redLetterMode])

  return { jesusVerses, godVerses }
}
