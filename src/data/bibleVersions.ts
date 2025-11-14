export type BibleVersionLanguage = 'english' | 'spanish'

export type BibleVersionOption = {
  value: string
  label: string
}

const englishVersions: BibleVersionOption[] = [
  { value: 'AKJV', label: 'American King James Version (AKJV)' },
  { value: 'ASV', label: 'American Standard Version (ASV)' },
  { value: 'GNV', label: 'Geneva Bible (GNV)' },
  { value: 'JUB', label: 'Jubilee Bible (JUB)' },
  { value: 'KJV', label: 'King James Version (KJV)' },
  { value: 'WEB', label: 'World English Bible (WEB)' },
  { value: 'YLT', label: "Young's Literal Translation (YLT)" },
]

const spanishVersions: BibleVersionOption[] = [
  { value: 'RVA1602', label: 'Reina-Valera Antigua 1602 (RVA1602)' },
]

export const BIBLE_VERSION_GROUPS: Record<BibleVersionLanguage, BibleVersionOption[]> = {
  english: englishVersions,
  spanish: spanishVersions,
}

export const getDefaultVersionForLanguage = (language: BibleVersionLanguage): string =>
  BIBLE_VERSION_GROUPS[language][0]?.value ?? 'KJV'
