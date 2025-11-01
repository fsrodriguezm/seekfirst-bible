import { ENGLISH_BIBLE_BOOKS } from './bibleBookLists'
import { BOOK_ABBREVIATIONS } from './bibleReferenceParser'

const canonicalEnglishBooks = ENGLISH_BIBLE_BOOKS

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\s+/g, '-')

const normalizeIdentifier = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '')

const slugToBookMap = new Map<string, string>()
const normalizedBookMap = new Map<string, string>()

canonicalEnglishBooks.forEach((book) => {
  const slug = slugify(book)
  slugToBookMap.set(slug, book)
  normalizedBookMap.set(normalizeIdentifier(book), book)
})

const normalizedAbbrevMap = new Map<string, string>()
Object.entries(BOOK_ABBREVIATIONS).forEach(([abbr, book]) => {
  normalizedAbbrevMap.set(normalizeIdentifier(abbr), book)
})

export const slugifyBookName = (bookName: string): string => slugify(bookName)

export const bookNameFromSlug = (slug: string): string | null => {
  const directMatch = slugToBookMap.get(slug.toLowerCase())
  if (directMatch) return directMatch
  const normalized = normalizeIdentifier(slug)
  return normalizedBookMap.get(normalized) ?? null
}

export const resolveBookIdentifier = (identifier: string): string | null => {
  const lower = identifier.toLowerCase()

  const slugMatch = slugToBookMap.get(lower)
  if (slugMatch) return slugMatch

  const normalized = normalizeIdentifier(identifier)
  if (!normalized) return null

  const normalizedBookMatch = normalizedBookMap.get(normalized)
  if (normalizedBookMatch) return normalizedBookMatch

  const abbrevMatch = normalizedAbbrevMap.get(normalized)
  if (abbrevMatch) return abbrevMatch

  return null
}
