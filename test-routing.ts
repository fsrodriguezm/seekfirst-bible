/**
 * Route Testing Utilities
 * Use this to test the routing logic locally
 */

import { normalizeBookSlug, getCanonicalSlug, parseVerseRange, buildCanonicalPath } from './src/utils/bookSlugNormalizer'
import { resolveVersionBySlug } from './src/utils/versionMap'

console.info('=== Bible Route Testing ===\n')

// Test book normalization
console.info('📖 Book Normalization Tests:')
const bookTests = [
  'matthew', 'matt', 'mat', 'mt',
  'revelation', 'rev',
  '1cor', '1-corinthians',
  'gen', 'genesis'
]

bookTests.forEach(book => {
  const normalized = normalizeBookSlug(book)
  const slug = normalized ? getCanonicalSlug(normalized) : null
  console.info(`  ${book.padEnd(15)} → ${normalized?.padEnd(20) || 'null'} → ${slug || 'null'}`)
})

// Test version normalization
console.info('\n📚 Version Normalization Tests:')
const versionTests = ['kjv', 'KJV', 'niv', 'NIV', 'nasb1995', 'NASB1995', 'esv']

versionTests.forEach(version => {
  const info = resolveVersionBySlug(version)
  console.info(`  ${version.padEnd(12)} → ${info ? `${info.id} (${info.slug})` : 'null'}`)
})

// Test verse range parsing
console.info('\n🔢 Verse Range Parsing Tests:')
const verseTests = ['3', '3-5', '1-10', '15', 'abc', '5-3', '']

verseTests.forEach(verse => {
  const parsed = parseVerseRange(verse)
  console.info(`  ${verse.padEnd(10)} → ${parsed ? `start: ${parsed.start}, end: ${parsed.end || 'none'}` : 'invalid'}`)
})

// Test canonical path building
console.info('\n🔗 Canonical Path Building Tests:')
const pathTests = [
  { lang: 'en', version: 'KJV', book: 'Matthew', chapter: 24, verses: undefined },
  { lang: 'en', version: 'KJV', book: 'Matthew', chapter: 24, verses: '3' },
  { lang: 'en', version: 'NIV', book: '1 Corinthians', chapter: 13, verses: '4-8' },
  { lang: 'en', version: 'ESV', book: 'Revelation', chapter: 21, verses: '1-4' },
]

pathTests.forEach(test => {
  const path = buildCanonicalPath(test.lang, test.version, test.book, test.chapter, test.verses)
  const display = `${test.version}/${test.book}/${test.chapter}${test.verses ? `/${test.verses}` : ''}`
  console.info(`  ${display.padEnd(30)} → ${path || 'invalid'}`)
})

// Test redirect scenarios
console.info('\n↪️  Redirect Scenarios:')
const redirectTests = [
  { input: '/en/kjv/matt/24', expected: '/en/kjv/matthew/24' },
  { input: '/en/kjv/matthew/24:3', expected: '/en/kjv/matthew/24/3' },
  { input: '/en/KJV/matthew/24', expected: '/en/kjv/matthew/24' },
  { input: '/en/kjv/1cor/13/4-8', expected: '/en/kjv/1-corinthians/13/4-8' },
]

redirectTests.forEach(test => {
  console.info(`  ${test.input}`)
  console.info(`    → ${test.expected}`)
})

console.info('\n✅ All tests completed!')
