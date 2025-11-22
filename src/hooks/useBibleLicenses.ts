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

export const useBibleLicenses = (
  versionId: string,
  apiCopyright?: string | null
): BibleLicense | null => {
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

    const foundLicense = licenses.find((item) => item.abbreviation.toUpperCase() === versionId.toUpperCase())

    // If we have API copyright and found a license, use API copyright
    // Or if we have API copyright but no license in JSON, create one from API
    if (apiCopyright) {
      return {
        abbreviation: versionId,
        fullName: foundLicense?.fullName || versionId,
        copyright: apiCopyright,
        permissionRequired: foundLicense?.permissionRequired || 'See copyright',
        url: foundLicense?.url,
      }
    }

    return foundLicense ?? null
  }, [licenses, versionId, apiCopyright])

  return license ?? null
}
