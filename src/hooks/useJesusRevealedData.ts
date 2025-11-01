import { useEffect, useState } from 'react'
import { getVersionLanguage } from '../utils/versionMap'

export type JesusRevealedData = Record<string, string>

export const useJesusRevealedData = (bibleId: string): JesusRevealedData | null => {
  const [data, setData] = useState<JesusRevealedData | null>(null)

  useEffect(() => {
    let isActive = true

    const loadJesusRevealedData = async (): Promise<void> => {
      if (!bibleId) {
        setData(null)
        return
      }

      try {
        const language = getVersionLanguage(bibleId) ?? 'en'
        const fileName = language === 'es' ? 'Jesus-revelado.json' : 'Jesus-revealed.json'
        const response = await fetch(`/api/resources/${fileName}`)
        if (!response.ok) {
          throw new Error(`Failed to load Jesus data from ${fileName}`)
        }
        const payload = (await response.json()) as JesusRevealedData
        if (!isActive) return
        setData(payload)
      } catch (error) {
        console.error('Error loading Jesus revealed data:', error)
        if (isActive) {
          setData(null)
        }
      }
    }

    void loadJesusRevealedData()

    return () => {
      isActive = false
    }
  }, [bibleId])

  return data
}
