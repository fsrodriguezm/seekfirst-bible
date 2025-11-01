type LanguageCode = 'en' | 'es'

type VersionInfo = {
  id: string
  slug: string
  file: string
  language: LanguageCode
  path?: string
}

const VERSION_INFO_LIST: VersionInfo[] = [
  { id: 'AKJV', slug: 'akjv', file: 'AKJV', language: 'en' },
  { id: 'ASV', slug: 'asv', file: 'ASV', language: 'en' },
  { id: 'BRG', slug: 'brg', file: 'BRG', language: 'en' },
  { id: 'EHV', slug: 'ehv', file: 'EHV', language: 'en' },
  { id: 'ESV', slug: 'esv', file: 'ESV', language: 'en' },
  { id: 'ESVUK', slug: 'esvuk', file: 'ESVUK', language: 'en' },
  { id: 'GNV', slug: 'gnv', file: 'GNV', language: 'en' },
  { id: 'GW', slug: 'gw', file: 'GW', language: 'en' },
  { id: 'ISV', slug: 'isv', file: 'ISV', language: 'en' },
  { id: 'JUB', slug: 'jub', file: 'JUB', language: 'en' },
  { id: 'KJ21', slug: 'kj21', file: 'KJ21', language: 'en' },
  { id: 'KJV', slug: 'kjv', file: 'KJV', language: 'en' },
  { id: 'LEB', slug: 'leb', file: 'LEB', language: 'en' },
  { id: 'MEV', slug: 'mev', file: 'MEV', language: 'en' },
  { id: 'NASB', slug: 'nasb', file: 'NASB', language: 'en' },
  { id: 'NASB1995', slug: 'nasb1995', file: 'NASB1995', language: 'en' },
  { id: 'NET', slug: 'net', file: 'NET', language: 'en' },
  { id: 'NIV', slug: 'niv', file: 'NIV', language: 'en' },
  { id: 'NIVUK', slug: 'nivuk', file: 'NIVUK', language: 'en' },
  { id: 'NKJV', slug: 'nkjv', file: 'NKJV', language: 'en' },
  { id: 'NLT', slug: 'nlt', file: 'NLT', language: 'en' },
  { id: 'NLV', slug: 'nlv', file: 'NLV', language: 'en' },
  { id: 'NOG', slug: 'nog', file: 'NOG', language: 'en' },
  { id: 'NRSV', slug: 'nrsv', file: 'NRSV', language: 'en' },
  { id: 'NRSVUE', slug: 'nrsvue', file: 'NRSVUE', language: 'en' },
  { id: 'NTV', slug: 'ntv', file: 'NTV', language: 'es' },
  { id: 'RVA1602', slug: 'rva1602', file: 'RVA1602', language: 'es' },
  { id: 'RVR1960', slug: 'rvr1960', file: 'RVR1960', language: 'es' },
  { id: 'WEB', slug: 'web', file: 'WEB', language: 'en' },
  { id: 'YLT', slug: 'ylt', file: 'YLT', language: 'en' },
  { id: 'KJV_STRONGS', slug: 'kjv-strongs', file: 'kjv_strongs', language: 'en', path: 'kjv_strongs' },
  { id: 'TYND', slug: 'tyndale', file: 'tyndale', language: 'en', path: 'tyndale' },
]

const INFO_BY_SLUG = new Map<string, VersionInfo>()
const INFO_BY_ID = new Map<string, VersionInfo>()

VERSION_INFO_LIST.forEach((info) => {
  INFO_BY_SLUG.set(info.slug, info)
  INFO_BY_ID.set(info.id.toUpperCase(), info)
})

export const resolveVersionBySlug = (slug: string): VersionInfo | null =>
  INFO_BY_SLUG.get(slug.toLowerCase()) ?? null

export const resolveVersionById = (id: string): VersionInfo | null =>
  INFO_BY_ID.get(id.toUpperCase()) ?? null

export const getVersionFileName = (id: string): string => {
  const info = resolveVersionById(id)
  if (!info) return id
  return info.file
}

export const getVersionLanguage = (id: string): LanguageCode | null => {
  const info = resolveVersionById(id)
  return info?.language ?? null
}

const getAssetSubpath = (info: VersionInfo): string => {
  if (info.path) {
    return info.path
  }
  return `${info.language}/${info.file}`
}

export const getVersionAssetPath = (id: string): string => {
  const info = resolveVersionById(id)
  if (!info) {
    return `/api/bibles/${id}`
  }
  return `/api/bibles/${getAssetSubpath(info)}`
}

export const isSpanishVersion = (id: string): boolean =>
  getVersionLanguage(id) === 'es'

export const getVersionSlug = (id: string): string => {
  const info = resolveVersionById(id)
  if (!info) return id.toLowerCase()
  return info.slug
}

export const VERSION_INFOS = VERSION_INFO_LIST
