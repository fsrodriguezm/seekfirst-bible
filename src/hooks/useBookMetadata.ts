import { useEffect, useState } from 'react'

export type BookMetadataEntry = {
  date: string
  category: string
  author?: string
  [key: string]: unknown
}

export type BookMetadata = Record<string, BookMetadataEntry>

const metadataCache: { value: BookMetadata | null } = {
  value: null,
}

export const useBookMetadata = (): BookMetadata | null => {
  const [metadata, setMetadata] = useState<BookMetadata | null>(metadataCache.value)

  useEffect(() => {
    if (metadataCache.value) {
      return
    }

    let isActive = true

    const loadMetadata = async (): Promise<void> => {
      try {
        const response = await fetch('/api/resources/book-metadata.json')
        if (!response.ok) {
          throw new Error('Failed to load book metadata')
        }
        const payload = (await response.json()) as BookMetadata
        metadataCache.value = payload
        if (isActive) {
          setMetadata(payload)
        }
      } catch (error) {
        console.error('Error loading book metadata:', error)
      }
    }

    void loadMetadata()

    return () => {
      isActive = false
    }
  }, [])

  return metadata
}
