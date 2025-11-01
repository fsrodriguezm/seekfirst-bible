import { useEffect, type MutableRefObject } from 'react'

interface UseVerseScrollTrackerOptions {
  enabled: boolean
  verseContainerRef: MutableRefObject<HTMLDivElement | null>
  verseSelectionLocked: boolean
  currentVisibleVerse: number | null
  setCurrentVisibleVerse: (_verse: number | null) => void
}

const isCloseToTop = (scrollTop: number): boolean => scrollTop <= 10
const isCloseToBottom = (scrollTop: number, viewportHeight: number, containerHeight: number): boolean => (
  scrollTop + viewportHeight >= containerHeight - 10
)

export const useVerseScrollTracker = ({
  enabled,
  verseContainerRef,
  verseSelectionLocked,
  currentVisibleVerse,
  setCurrentVisibleVerse,
}: UseVerseScrollTrackerOptions): void => {
  useEffect(() => {
    const container = verseContainerRef.current

    if (!enabled || !container) {
      setCurrentVisibleVerse(null)
      return
    }

    if (currentVisibleVerse === null) {
      setCurrentVisibleVerse(1)
    }

    const handleScroll = () => {
      if (verseSelectionLocked) {
        return
      }

      const verseElements = container.querySelectorAll<HTMLElement>('.verse')
      const viewportTop = container.scrollTop
      const viewportHeight = container.clientHeight
      const containerHeight = container.scrollHeight

      if (isCloseToTop(viewportTop)) {
        if (currentVisibleVerse !== 1) {
          setCurrentVisibleVerse(1)
        }
        return
      }

      if (isCloseToBottom(viewportTop, viewportHeight, containerHeight)) {
        const lastVerseElement = verseElements[verseElements.length - 1]
        if (lastVerseElement) {
          const verseNumber = parseInt(lastVerseElement.id.replace('verse-', ''), 10)
          if (currentVisibleVerse !== verseNumber) {
            setCurrentVisibleVerse(verseNumber)
          }
        }
        return
      }

      let bestVerse: number | null = null
      let bestVisibleArea = 0

      verseElements.forEach((element) => {
        const elementTop = element.offsetTop
        const elementBottom = elementTop + element.offsetHeight
        const viewportBottom = viewportTop + viewportHeight

        const visibleTop = Math.max(elementTop, viewportTop)
        const visibleBottom = Math.min(elementBottom, viewportBottom)
        const visibleArea = Math.max(0, visibleBottom - visibleTop)

        if (visibleArea > bestVisibleArea) {
          bestVisibleArea = visibleArea
          const verseNumber = parseInt(element.id.replace('verse-', ''), 10)
          bestVerse = verseNumber
        }
      })

      if (bestVerse && bestVerse !== currentVisibleVerse) {
        setCurrentVisibleVerse(bestVerse)
      }
    }

    container.addEventListener('scroll', handleScroll)

    if (currentVisibleVerse !== 1) {
      handleScroll()
    }

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [enabled, verseContainerRef, verseSelectionLocked, currentVisibleVerse, setCurrentVisibleVerse])
}
