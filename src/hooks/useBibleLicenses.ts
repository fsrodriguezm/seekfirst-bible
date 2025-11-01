import { useEffect, useState, useMemo } from 'react'

export type BibleLicense = {
  abbreviation: string
  fullName: string
  copyright: string
  permissionRequired: string
  url?: string
}

const cache: { data: BibleLicense[] | null } = {
  data: null,
}

export const useBibleLicenses = (versionId: string): BibleLicense | null => {
  const [licenses, setLicenses] = useState<BibleLicense[] | null>(cache.data)

  useEffect(() => {
    if (cache.data) {
      return
    }

    let isMounted = true

    const loadLicenses = async () => {
      try {
        const response = await fetch('/api/resources/bible-licensing.json')
        if (!response.ok) {
          throw new Error('Failed to load bible licensing data')
        }
        const data = await response.json() as BibleLicense[]
        cache.data = data
        if (isMounted) {
          setLicenses(data)
        }
      } catch (error) {
        console.error('Error loading bible licensing data:', error)
      }
    }

    void loadLicenses()

    return () => {
      isMounted = false
    }
  }, [])

  const license = useMemo(() => {
    if (!licenses) return null
    return licenses.find((item) => item.abbreviation.toUpperCase() === versionId.toUpperCase()) ?? null
  }, [licenses, versionId])

  return license ?? null
}
