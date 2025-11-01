/// <reference types="vitest" />

import {
  normalizeBookSlug,
  getCanonicalSlug,
  getSlugForLanguage,
  parseVerseRange,
  buildCanonicalPath,
} from '../bookSlugNormalizer'

describe('bookSlugNormalizer utilities', () => {
  it('normalizes common English abbreviations', () => {
    expect(normalizeBookSlug('matt')).toBe('Matthew')
    expect(normalizeBookSlug('rev')).toBe('Revelation')
  })

  it('normalizes Spanish slugs to English book names', () => {
    expect(normalizeBookSlug('juan')).toBe('John')
    expect(normalizeBookSlug('1corintios')).toBe('1 Corinthians')
  })

  it('produces canonical slugs across languages', () => {
    expect(getCanonicalSlug('1 Samuel')).toBe('1-samuel')
    expect(getSlugForLanguage('Matthew', 'es')).toBe('mateo')
    expect(getSlugForLanguage('Matthew', 'en')).toBe('matthew')
  })

  it('parses valid verse ranges and rejects invalid input', () => {
    expect(parseVerseRange('7')).toEqual({ start: 7 })
    expect(parseVerseRange('4-9')).toEqual({ start: 4, end: 9 })
    expect(parseVerseRange('10-3')).toBeNull()
    expect(parseVerseRange('abc')).toBeNull()
  })

  it('builds canonical paths with optional verse segments', () => {
    expect(buildCanonicalPath('en', 'KJV', 'Matthew', 24)).toBe('/en/kjv/matthew/24')
    expect(buildCanonicalPath('en', 'KJV', 'Matthew', 24, '3-5')).toBe('/en/kjv/matthew/24/3-5')
  })
})
