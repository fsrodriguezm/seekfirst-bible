/**
 * Book Slug Normalizer
 * Handles conversion between URL-friendly slugs and canonical book names
 * Supports abbreviations and various formats (English and Spanish)
 */

import { ENGLISH_BIBLE_BOOKS, SPANISH_BIBLE_BOOKS } from './bibleBookLists'
import { SPANISH_TO_ENGLISH_BOOKS } from './bookNameMappings'

// Canonical slug mappings for all Bible books
const BOOK_TO_SLUG: Record<string, string> = {
  'Genesis': 'genesis',
  'Exodus': 'exodus',
  'Leviticus': 'leviticus',
  'Numbers': 'numbers',
  'Deuteronomy': 'deuteronomy',
  'Joshua': 'joshua',
  'Judges': 'judges',
  'Ruth': 'ruth',
  '1 Samuel': '1-samuel',
  '2 Samuel': '2-samuel',
  '1 Kings': '1-kings',
  '2 Kings': '2-kings',
  '1 Chronicles': '1-chronicles',
  '2 Chronicles': '2-chronicles',
  'Ezra': 'ezra',
  'Nehemiah': 'nehemiah',
  'Esther': 'esther',
  'Job': 'job',
  'Psalms': 'psalms',
  'Proverbs': 'proverbs',
  'Ecclesiastes': 'ecclesiastes',
  'Song of Songs': 'song-of-songs',
  'Isaiah': 'isaiah',
  'Jeremiah': 'jeremiah',
  'Lamentations': 'lamentations',
  'Ezekiel': 'ezekiel',
  'Daniel': 'daniel',
  'Hosea': 'hosea',
  'Joel': 'joel',
  'Amos': 'amos',
  'Obadiah': 'obadiah',
  'Jonah': 'jonah',
  'Micah': 'micah',
  'Nahum': 'nahum',
  'Habakkuk': 'habakkuk',
  'Zephaniah': 'zephaniah',
  'Haggai': 'haggai',
  'Zechariah': 'zechariah',
  'Malachi': 'malachi',
  'Matthew': 'matthew',
  'Mark': 'mark',
  'Luke': 'luke',
  'John': 'john',
  'Acts': 'acts',
  'Romans': 'romans',
  '1 Corinthians': '1-corinthians',
  '2 Corinthians': '2-corinthians',
  'Galatians': 'galatians',
  'Ephesians': 'ephesians',
  'Philippians': 'philippians',
  'Colossians': 'colossians',
  '1 Thessalonians': '1-thessalonians',
  '2 Thessalonians': '2-thessalonians',
  '1 Timothy': '1-timothy',
  '2 Timothy': '2-timothy',
  'Titus': 'titus',
  'Philemon': 'philemon',
  'Hebrews': 'hebrews',
  'James': 'james',
  '1 Peter': '1-peter',
  '2 Peter': '2-peter',
  '1 John': '1-john',
  '2 John': '2-john',
  '3 John': '3-john',
  'Jude': 'jude',
  'Revelation': 'revelation',
}

// Reverse mapping
const SLUG_TO_BOOK = Object.fromEntries(
  Object.entries(BOOK_TO_SLUG).map(([book, slug]) => [slug, book])
)

// Spanish book slug mappings (map to English canonical names for internal use)
const SPANISH_BOOK_SLUGS: Record<string, string> = {
  'genesis': 'Genesis',
  'exodo': 'Exodus',
  'levitico': 'Leviticus',
  'numeros': 'Numbers',
  'deuteronomio': 'Deuteronomy',
  'josue': 'Joshua',
  'jueces': 'Judges',
  'rut': 'Ruth',
  '1-samuel': '1 Samuel',
  '2-samuel': '2 Samuel',
  '1-reyes': '1 Kings',
  '2-reyes': '2 Kings',
  '1-cronicas': '1 Chronicles',
  '2-cronicas': '2 Chronicles',
  'esdras': 'Ezra',
  'nehemias': 'Nehemiah',
  'ester': 'Esther',
  'job': 'Job',
  'salmos': 'Psalms',
  'proverbios': 'Proverbs',
  'eclesiastes': 'Ecclesiastes',
  'cantares': 'Song of Songs',
  'isaias': 'Isaiah',
  'jeremias': 'Jeremiah',
  'lamentaciones': 'Lamentations',
  'ezequiel': 'Ezekiel',
  'daniel': 'Daniel',
  'oseas': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'abdias': 'Obadiah',
  'jonas': 'Jonah',
  'miqueas': 'Micah',
  'nahum': 'Nahum',
  'habacuc': 'Habakkuk',
  'sofonias': 'Zephaniah',
  'hageo': 'Haggai',
  'zacarias': 'Zechariah',
  'malaquias': 'Malachi',
  'mateo': 'Matthew',
  'marcos': 'Mark',
  'lucas': 'Luke',
  'juan': 'John',
  'hechos': 'Acts',
  'romanos': 'Romans',
  '1-corintios': '1 Corinthians',
  '2-corintios': '2 Corinthians',
  'galatas': 'Galatians',
  'efesios': 'Ephesians',
  'filipenses': 'Philippians',
  'colosenses': 'Colossians',
  '1-tesalonicenses': '1 Thessalonians',
  '2-tesalonicenses': '2 Thessalonians',
  '1-timoteo': '1 Timothy',
  '2-timoteo': '2 Timothy',
  'tito': 'Titus',
  'filemon': 'Philemon',
  'hebreos': 'Hebrews',
  'santiago': 'James',
  '1-pedro': '1 Peter',
  '2-pedro': '2 Peter',
  '1-juan': '1 John',
  '2-juan': '2 John',
  '3-juan': '3 John',
  'judas': 'Jude',
  'apocalipsis': 'Revelation',
}

// Spanish abbreviations (also map to English canonical names)
const SPANISH_ABBREVIATIONS: Record<string, string> = {
  'gen': 'Genesis',
  'gn': 'Genesis',
  'ex': 'Exodus',
  'exo': 'Exodus',
  'lev': 'Leviticus',
  'lv': 'Leviticus',
  'num': 'Numbers',
  'nm': 'Numbers',
  'deut': 'Deuteronomy',
  'dt': 'Deuteronomy',
  'jos': 'Joshua',
  'jue': 'Judges',
  'rut': 'Ruth',
  '1sam': '1 Samuel',
  '1s': '1 Samuel',
  '2sam': '2 Samuel',
  '2s': '2 Samuel',
  '1rey': '1 Kings',
  '1r': '1 Kings',
  '2rey': '2 Kings',
  '2r': '2 Kings',
  '1cro': '1 Chronicles',
  '1cr': '1 Chronicles',
  '2cro': '2 Chronicles',
  '2cr': '2 Chronicles',
  'esd': 'Ezra',
  'neh': 'Nehemiah',
  'est': 'Esther',
  'sal': 'Psalms',
  'prov': 'Proverbs',
  'pr': 'Proverbs',
  'ecl': 'Ecclesiastes',
  'ec': 'Ecclesiastes',
  'cant': 'Song of Songs',
  'cnt': 'Song of Songs',
  'isa': 'Isaiah',
  'is': 'Isaiah',
  'jer': 'Jeremiah',
  'lam': 'Lamentations',
  'eze': 'Ezekiel',
  'ez': 'Ezekiel',
  'dan': 'Daniel',
  'dn': 'Daniel',
  'os': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'am': 'Amos',
  'abd': 'Obadiah',
  'jon': 'Jonah',
  'miq': 'Micah',
  'nah': 'Nahum',
  'hab': 'Habakkuk',
  'sof': 'Zephaniah',
  'hag': 'Haggai',
  'zac': 'Zechariah',
  'mal': 'Malachi',
  'mat': 'Matthew',
  'mt': 'Matthew',
  'mar': 'Mark',
  'mr': 'Mark',
  'luc': 'Luke',
  'lc': 'Luke',
  'jn': 'John',
  'hch': 'Acts',
  'rom': 'Romans',
  'ro': 'Romans',
  '1cor': '1 Corinthians',
  '1co': '1 Corinthians',
  '2cor': '2 Corinthians',
  '2co': '2 Corinthians',
  'gal': 'Galatians',
  'ga': 'Galatians',
  'ef': 'Ephesians',
  'fil': 'Philippians',
  'flp': 'Philippians',
  'col': 'Colossians',
  '1tes': '1 Thessalonians',
  '1ts': '1 Thessalonians',
  '2tes': '2 Thessalonians',
  '2ts': '2 Thessalonians',
  '1tim': '1 Timothy',
  '1ti': '1 Timothy',
  '2tim': '2 Timothy',
  '2ti': '2 Timothy',
  'tit': 'Titus',
  'flm': 'Philemon',
  'heb': 'Hebrews',
  'stg': 'James',
  'sant': 'James',
  '1ped': '1 Peter',
  '1pe': '1 Peter',
  '2ped': '2 Peter',
  '2pe': '2 Peter',
  '1jn': '1 John',
  '2jn': '2 John',
  '3jn': '3 John',
  'jud': 'Jude',
  'apo': 'Revelation',
  'apoc': 'Revelation',
  'ap': 'Revelation',
}


// All possible abbreviation and alternative forms to canonical book name
const ABBREVIATION_TO_BOOK: Record<string, string> = {
  // Genesis
  'gen': 'Genesis',
  'ge': 'Genesis',
  'gn': 'Genesis',
  
  // Exodus
  'ex': 'Exodus',
  'exo': 'Exodus',
  'exod': 'Exodus',
  
  // Leviticus
  'lev': 'Leviticus',
  'le': 'Leviticus',
  'lv': 'Leviticus',
  
  // Numbers
  'num': 'Numbers',
  'nu': 'Numbers',
  'nm': 'Numbers',
  'nb': 'Numbers',
  
  // Deuteronomy
  'deut': 'Deuteronomy',
  'deu': 'Deuteronomy',
  'de': 'Deuteronomy',
  'dt': 'Deuteronomy',
  
  // Joshua
  'josh': 'Joshua',
  'jos': 'Joshua',
  'jsh': 'Joshua',
  
  // Judges
  'judg': 'Judges',
  'jdg': 'Judges',
  'jg': 'Judges',
  'jdgs': 'Judges',
  
  // Ruth
  'ruth': 'Ruth',
  'rth': 'Ruth',
  'ru': 'Ruth',
  
  // 1 Samuel
  '1sam': '1 Samuel',
  '1sa': '1 Samuel',
  '1sm': '1 Samuel',
  '1s': '1 Samuel',
  '1samuel': '1 Samuel',
  
  // 2 Samuel
  '2sam': '2 Samuel',
  '2sa': '2 Samuel',
  '2sm': '2 Samuel',
  '2s': '2 Samuel',
  '2samuel': '2 Samuel',
  
  // 1 Kings
  '1kings': '1 Kings',
  '1ki': '1 Kings',
  '1k': '1 Kings',
  '1kgs': '1 Kings',
  
  // 2 Kings
  '2kings': '2 Kings',
  '2ki': '2 Kings',
  '2k': '2 Kings',
  '2kgs': '2 Kings',
  
  // 1 Chronicles
  '1chron': '1 Chronicles',
  '1chr': '1 Chronicles',
  '1ch': '1 Chronicles',
  '1chronicles': '1 Chronicles',
  
  // 2 Chronicles
  '2chron': '2 Chronicles',
  '2chr': '2 Chronicles',
  '2ch': '2 Chronicles',
  '2chronicles': '2 Chronicles',
  
  // Ezra
  'ezra': 'Ezra',
  'ezr': 'Ezra',
  
  // Nehemiah
  'neh': 'Nehemiah',
  'ne': 'Nehemiah',
  
  // Esther
  'esth': 'Esther',
  'est': 'Esther',
  'es': 'Esther',
  
  // Job
  'job': 'Job',
  'jb': 'Job',
  
  // Psalms
  'ps': 'Psalms',
  'psa': 'Psalms',
  'pss': 'Psalms',
  'psalm': 'Psalms',
  
  // Proverbs
  'prov': 'Proverbs',
  'pro': 'Proverbs',
  'pr': 'Proverbs',
  'prv': 'Proverbs',
  
  // Ecclesiastes
  'eccles': 'Ecclesiastes',
  'eccl': 'Ecclesiastes',
  'ecc': 'Ecclesiastes',
  'ec': 'Ecclesiastes',
  
  // Song of Songs
  'song': 'Song of Songs',
  'sos': 'Song of Songs',
  'so': 'Song of Songs',
  'ss': 'Song of Songs',
  'songofsolomon': 'Song of Songs',
  'songofsongs': 'Song of Songs',
  
  // Isaiah
  'isa': 'Isaiah',
  'is': 'Isaiah',
  
  // Jeremiah
  'jer': 'Jeremiah',
  'je': 'Jeremiah',
  'jr': 'Jeremiah',
  
  // Lamentations
  'lam': 'Lamentations',
  'la': 'Lamentations',
  
  // Ezekiel
  'ezek': 'Ezekiel',
  'eze': 'Ezekiel',
  'ezk': 'Ezekiel',
  
  // Daniel
  'dan': 'Daniel',
  'da': 'Daniel',
  'dn': 'Daniel',
  
  // Hosea
  'hos': 'Hosea',
  'ho': 'Hosea',
  
  // Joel
  'joel': 'Joel',
  'joe': 'Joel',
  'jl': 'Joel',
  
  // Amos
  'amos': 'Amos',
  'am': 'Amos',
  
  // Obadiah
  'obad': 'Obadiah',
  'ob': 'Obadiah',
  
  // Jonah
  'jonah': 'Jonah',
  'jon': 'Jonah',
  'jnh': 'Jonah',
  
  // Micah
  'mic': 'Micah',
  'mi': 'Micah',
  
  // Nahum
  'nah': 'Nahum',
  'na': 'Nahum',
  
  // Habakkuk
  'hab': 'Habakkuk',
  'hb': 'Habakkuk',
  
  // Zephaniah
  'zeph': 'Zephaniah',
  'zep': 'Zephaniah',
  'zp': 'Zephaniah',
  
  // Haggai
  'hag': 'Haggai',
  'hg': 'Haggai',
  
  // Zechariah
  'zech': 'Zechariah',
  'zec': 'Zechariah',
  'zc': 'Zechariah',
  
  // Malachi
  'mal': 'Malachi',
  'ml': 'Malachi',
  
  // Matthew
  'matt': 'Matthew',
  'mat': 'Matthew',
  'mt': 'Matthew',
  
  // Mark
  'mark': 'Mark',
  'mar': 'Mark',
  'mrk': 'Mark',
  'mk': 'Mark',
  'mr': 'Mark',
  
  // Luke
  'luke': 'Luke',
  'luk': 'Luke',
  'lk': 'Luke',
  
  // John
  'john': 'John',
  'joh': 'John',
  'jhn': 'John',
  'jn': 'John',
  
  // Acts
  'acts': 'Acts',
  'act': 'Acts',
  'ac': 'Acts',
  
  // Romans
  'rom': 'Romans',
  'ro': 'Romans',
  'rm': 'Romans',
  
  // 1 Corinthians
  '1cor': '1 Corinthians',
  '1co': '1 Corinthians',
  '1c': '1 Corinthians',
  '1corinthians': '1 Corinthians',
  
  // 2 Corinthians
  '2cor': '2 Corinthians',
  '2co': '2 Corinthians',
  '2c': '2 Corinthians',
  '2corinthians': '2 Corinthians',
  
  // Galatians
  'gal': 'Galatians',
  'ga': 'Galatians',
  
  // Ephesians
  'eph': 'Ephesians',
  'ephes': 'Ephesians',
  
  // Philippians
  'phil': 'Philippians',
  'php': 'Philippians',
  'pp': 'Philippians',
  
  // Colossians
  'col': 'Colossians',
  'co': 'Colossians',
  
  // 1 Thessalonians
  '1thess': '1 Thessalonians',
  '1thes': '1 Thessalonians',
  '1th': '1 Thessalonians',
  '1thessalonians': '1 Thessalonians',
  
  // 2 Thessalonians
  '2thess': '2 Thessalonians',
  '2thes': '2 Thessalonians',
  '2th': '2 Thessalonians',
  '2thessalonians': '2 Thessalonians',
  
  // 1 Timothy
  '1tim': '1 Timothy',
  '1ti': '1 Timothy',
  '1t': '1 Timothy',
  '1timothy': '1 Timothy',
  
  // 2 Timothy
  '2tim': '2 Timothy',
  '2ti': '2 Timothy',
  '2t': '2 Timothy',
  '2timothy': '2 Timothy',
  
  // Titus
  'titus': 'Titus',
  'tit': 'Titus',
  'ti': 'Titus',
  
  // Philemon
  'philem': 'Philemon',
  'phm': 'Philemon',
  'pm': 'Philemon',
  
  // Hebrews
  'heb': 'Hebrews',
  'he': 'Hebrews',
  
  // James
  'james': 'James',
  'jas': 'James',
  'jm': 'James',
  
  // 1 Peter
  '1pet': '1 Peter',
  '1pe': '1 Peter',
  '1pt': '1 Peter',
  '1p': '1 Peter',
  '1peter': '1 Peter',
  
  // 2 Peter
  '2pet': '2 Peter',
  '2pe': '2 Peter',
  '2pt': '2 Peter',
  '2p': '2 Peter',
  '2peter': '2 Peter',
  
  // 1 John
  '1john': '1 John',
  '1joh': '1 John',
  '1jn': '1 John',
  '1j': '1 John',
  
  // 2 John
  '2john': '2 John',
  '2joh': '2 John',
  '2jn': '2 John',
  '2j': '2 John',
  
  // 3 John
  '3john': '3 John',
  '3joh': '3 John',
  '3jn': '3 John',
  '3j': '3 John',
  
  // Jude
  'jude': 'Jude',
  'jud': 'Jude',
  'jd': 'Jude',
  
  // Revelation
  'rev': 'Revelation',
  'reve': 'Revelation',
  'revelation': 'Revelation',
  're': 'Revelation',
  'rv': 'Revelation',
}

/**
 * Normalize a book slug/abbreviation to canonical book name
 * Handles various formats: matthew, matt, mat, mt, Matthew, MATTHEW
 * Also supports Spanish: mateo, marcos, etc.
 */
export function normalizeBookSlug(slug: string): string | null {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Try direct English slug lookup first
  if (SLUG_TO_BOOK[normalized]) {
    return SLUG_TO_BOOK[normalized]
  }
  
  // Try Spanish slug lookup
  if (SPANISH_BOOK_SLUGS[normalized]) {
    return SPANISH_BOOK_SLUGS[normalized]
  }
  
  // Try English abbreviation lookup
  if (ABBREVIATION_TO_BOOK[normalized]) {
    return ABBREVIATION_TO_BOOK[normalized]
  }
  
  // Try Spanish abbreviation lookup
  if (SPANISH_ABBREVIATIONS[normalized]) {
    return SPANISH_ABBREVIATIONS[normalized]
  }
  
  // Try finding by full name (case insensitive) in English
  const matchingEnglishBook = ENGLISH_BIBLE_BOOKS.find(
    book => book.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
  )
  
  if (matchingEnglishBook) {
    return matchingEnglishBook
  }
  
  // Try finding by full name (case insensitive) in Spanish, return English equivalent
  const matchingSpanishBook = SPANISH_BIBLE_BOOKS.find(
    book => book.toLowerCase().replace(/[^a-z0-9áéíóúñü]/g, '') === normalized
  )
  
  if (matchingSpanishBook) {
    return SPANISH_TO_ENGLISH_BOOKS[matchingSpanishBook] || null
  }
  
  return null
}

/**
 * Get canonical slug for a book name
 */
export function getCanonicalSlug(bookName: string): string | null {
  return BOOK_TO_SLUG[bookName] || null
}

/**
 * Get Spanish slug for a book name (given English canonical name)
 */
export function getSpanishSlug(englishBookName: string): string | null {
  // Create reverse mapping from English book names to Spanish slugs
  const spanishBookName = Object.keys(SPANISH_TO_ENGLISH_BOOKS).find(
    (spanish) => SPANISH_TO_ENGLISH_BOOKS[spanish] === englishBookName
  )
  
  if (!spanishBookName) return null
  
  // Convert Spanish book name to slug format
  return spanishBookName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-')
}

/**
 * Get slug for a book name based on language
 */
export function getSlugForLanguage(bookName: string, lang: string): string | null {
  if (lang === 'es') {
    return getSpanishSlug(bookName)
  }
  return getCanonicalSlug(bookName)
}


/**
 * Check if a string is a valid book identifier
 */
export function isValidBook(slug: string): boolean {
  return normalizeBookSlug(slug) !== null
}

/**
 * Parse verse range string
 * Supports: "3", "3-5", "3-5,7-9" (for future expansion)
 */
export function parseVerseRange(verseStr: string): { start: number; end?: number } | null {
  const match = verseStr.match(/^(\d+)(?:-(\d+))?$/)
  if (!match) return null
  
  const start = parseInt(match[1], 10)
  const end = match[2] ? parseInt(match[2], 10) : undefined
  
  if (isNaN(start) || (end !== undefined && isNaN(end))) return null
  if (end !== undefined && end < start) return null
  
  return { start, end }
}

/**
 * Build canonical URL path
 */
export function buildCanonicalPath(
  lang: string,
  version: string,
  book: string,
  chapter: number,
  verses?: string,
  versionLang?: string // Optional: use version language instead of URL language for book slug
): string {
  const slugLang = versionLang || lang
  const slug = getSlugForLanguage(book, slugLang)
  if (!slug) return ''
  
  let path = `/${lang}/${version.toLowerCase()}/${slug}/${chapter}`
  if (verses) {
    path += `/${verses}`
  }
  
  return path
}
