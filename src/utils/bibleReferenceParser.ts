/**
 * Bible Reference Parser
 * Handles various formats of Bible references including abbreviations
 * Examples: "Mat 2:3", "Matt 2:3", "Matthew 2:3", "Rev 2", "Revelation 2:1-5"
 */

import { ENGLISH_BIBLE_BOOKS, SPANISH_BIBLE_BOOKS } from './bibleBookLists'

type Language = 'english' | 'spanish'

type ReferenceParseResult = {
  book: string
  chapter: number
  verse: number | null
  endVerse: number | null
}

// English book abbreviations mapped to full book names
const ENGLISH_ABBREVIATIONS: Record<string, string> = {
  // Old Testament
  gen: 'Genesis',
  ge: 'Genesis',
  gn: 'Genesis',
  ex: 'Exodus',
  exo: 'Exodus',
  exod: 'Exodus',
  lev: 'Leviticus',
  le: 'Leviticus',
  lv: 'Leviticus',
  num: 'Numbers',
  nu: 'Numbers',
  nm: 'Numbers',
  nb: 'Numbers',
  deut: 'Deuteronomy',
  deu: 'Deuteronomy',
  de: 'Deuteronomy',
  dt: 'Deuteronomy',
  josh: 'Joshua',
  jos: 'Joshua',
  jsh: 'Joshua',
  judg: 'Judges',
  jdg: 'Judges',
  jg: 'Judges',
  jdgs: 'Judges',
  ruth: 'Ruth',
  rth: 'Ruth',
  ru: 'Ruth',
  '1sam': '1 Samuel',
  '1sa': '1 Samuel',
  '1sm': '1 Samuel',
  '1s': '1 Samuel',
  '2sam': '2 Samuel',
  '2sa': '2 Samuel',
  '2sm': '2 Samuel',
  '2s': '2 Samuel',
  '1kings': '1 Kings',
  '1ki': '1 Kings',
  '1k': '1 Kings',
  '1kgs': '1 Kings',
  '2kings': '2 Kings',
  '2ki': '2 Kings',
  '2k': '2 Kings',
  '2kgs': '2 Kings',
  '1chron': '1 Chronicles',
  '1chr': '1 Chronicles',
  '1ch': '1 Chronicles',
  '2chron': '2 Chronicles',
  '2chr': '2 Chronicles',
  '2ch': '2 Chronicles',
  ezra: 'Ezra',
  ezr: 'Ezra',
  neh: 'Nehemiah',
  ne: 'Nehemiah',
  esth: 'Esther',
  est: 'Esther',
  es: 'Esther',
  job: 'Job',
  jb: 'Job',
  ps: 'Psalms',
  psa: 'Psalms',
  pss: 'Psalms',
  psalm: 'Psalms',
  prov: 'Proverbs',
  pro: 'Proverbs',
  pr: 'Proverbs',
  prv: 'Proverbs',
  eccles: 'Ecclesiastes',
  eccl: 'Ecclesiastes',
  ecc: 'Ecclesiastes',
  ec: 'Ecclesiastes',
  song: 'Song of Songs',
  sos: 'Song of Songs',
  so: 'Song of Songs',
  ss: 'Song of Songs',
  isa: 'Isaiah',
  is: 'Isaiah',
  jer: 'Jeremiah',
  je: 'Jeremiah',
  jr: 'Jeremiah',
  lam: 'Lamentations',
  la: 'Lamentations',
  ezek: 'Ezekiel',
  eze: 'Ezekiel',
  ezk: 'Ezekiel',
  dan: 'Daniel',
  da: 'Daniel',
  dn: 'Daniel',
  hos: 'Hosea',
  ho: 'Hosea',
  joel: 'Joel',
  joe: 'Joel',
  jl: 'Joel',
  amos: 'Amos',
  am: 'Amos',
  obad: 'Obadiah',
  ob: 'Obadiah',
  jonah: 'Jonah',
  jon: 'Jonah',
  jnh: 'Jonah',
  mic: 'Micah',
  mi: 'Micah',
  nah: 'Nahum',
  na: 'Nahum',
  hab: 'Habakkuk',
  hb: 'Habakkuk',
  zeph: 'Zephaniah',
  zep: 'Zephaniah',
  zp: 'Zephaniah',
  hag: 'Haggai',
  hg: 'Haggai',
  zech: 'Zechariah',
  zec: 'Zechariah',
  zc: 'Zechariah',
  mal: 'Malachi',
  ml: 'Malachi',

  // New Testament
  matt: 'Matthew',
  mat: 'Matthew',
  mt: 'Matthew',
  mark: 'Mark',
  mar: 'Mark',
  mrk: 'Mark',
  mk: 'Mark',
  mr: 'Mark',
  luke: 'Luke',
  luk: 'Luke',
  lk: 'Luke',
  john: 'John',
  joh: 'John',
  jhn: 'John',
  jn: 'John',
  acts: 'Acts',
  act: 'Acts',
  ac: 'Acts',
  rom: 'Romans',
  ro: 'Romans',
  rm: 'Romans',
  '1cor': '1 Corinthians',
  '1co': '1 Corinthians',
  '1c': '1 Corinthians',
  '2cor': '2 Corinthians',
  '2co': '2 Corinthians',
  '2c': '2 Corinthians',
  gal: 'Galatians',
  ga: 'Galatians',
  eph: 'Ephesians',
  ephes: 'Ephesians',
  phil: 'Philippians',
  php: 'Philippians',
  pp: 'Philippians',
  col: 'Colossians',
  co: 'Colossians',
  '1thess': '1 Thessalonians',
  '1thes': '1 Thessalonians',
  '1th': '1 Thessalonians',
  '2thess': '2 Thessalonians',
  '2thes': '2 Thessalonians',
  '2th': '2 Thessalonians',
  '1tim': '1 Timothy',
  '1ti': '1 Timothy',
  '1t': '1 Timothy',
  '2tim': '2 Timothy',
  '2ti': '2 Timothy',
  '2t': '2 Timothy',
  titus: 'Titus',
  tit: 'Titus',
  ti: 'Titus',
  philem: 'Philemon',
  phm: 'Philemon',
  pm: 'Philemon',
  heb: 'Hebrews',
  he: 'Hebrews',
  james: 'James',
  jas: 'James',
  jm: 'James',
  '1pet': '1 Peter',
  '1pe': '1 Peter',
  '1pt': '1 Peter',
  '1p': '1 Peter',
  '2pet': '2 Peter',
  '2pe': '2 Peter',
  '2pt': '2 Peter',
  '2p': '2 Peter',
  '1john': '1 John',
  '1joh': '1 John',
  '1jn': '1 John',
  '1j': '1 John',
  '2john': '2 John',
  '2joh': '2 John',
  '2jn': '2 John',
  '2j': '2 John',
  '3john': '3 John',
  '3joh': '3 John',
  '3jn': '3 John',
  '3j': '3 John',
  jude: 'Jude',
  jud: 'Jude',
  jd: 'Jude',
  rev: 'Revelation',
  reve: 'Revelation',
  revelation: 'Revelation',
  re: 'Revelation',
  rv: 'Revelation',
}

// Spanish book abbreviations mapped to full book names
const SPANISH_ABBREVIATIONS: Record<string, string> = {
  'gén': 'Génesis',
  gen: 'Génesis',
  'géne': 'Génesis',
  'éx': 'Éxodo',
  ex: 'Éxodo',
  'éxo': 'Éxodo',
  exo: 'Éxodo',
  lev: 'Levítico',
  'núm': 'Números',
  num: 'Números',
  deut: 'Deuteronomio',
  jos: 'Josué',
  jue: 'Jueces',
  rut: 'Rut',
  '1sam': '1 Samuel',
  '2sam': '2 Samuel',
  '1rey': '1 Reyes',
  '2rey': '2 Reyes',
  '1crón': '1 Crónicas',
  '1cron': '1 Crónicas',
  '2crón': '2 Crónicas',
  '2cron': '2 Crónicas',
  esd: 'Esdras',
  neh: 'Nehemías',
  est: 'Ester',
  sal: 'Salmos',
  prov: 'Proverbios',
  ecl: 'Eclesiastés',
  cant: 'Cantares',
  isa: 'Isaías',
  jer: 'Jeremías',
  lam: 'Lamentaciones',
  eze: 'Ezequiel',
  dan: 'Daniel',
  os: 'Oseas',
  joel: 'Joel',
  'amós': 'Amós',
  amos: 'Amós',
  abd: 'Abdías',
  jon: 'Jonás',
  miq: 'Miqueas',
  nah: 'Nahúm',
  hab: 'Habacuc',
  sof: 'Sofonías',
  hag: 'Hageo',
  zac: 'Zacarías',
  mal: 'Malaquías',
  mat: 'Mateo',
  mar: 'Marcos',
  luc: 'Lucas',
  jn: 'Juan',
  juan: 'Juan',
  hch: 'Hechos',
  rom: 'Romanos',
  '1cor': '1 Corintios',
  '2cor': '2 Corintios',
  'gál': 'Gálatas',
  gal: 'Gálatas',
  ef: 'Efesios',
  fil: 'Filipenses',
  col: 'Colosenses',
  '1tes': '1 Tesalonicenses',
  '2tes': '2 Tesalonicenses',
  '1tim': '1 Timoteo',
  '2tim': '2 Timoteo',
  tit: 'Tito',
  flm: 'Filemón',
  heb: 'Hebreos',
  stg: 'Santiago',
  '1ped': '1 Pedro',
  '2ped': '2 Pedro',
  '1jn': '1 Juan',
  '2jn': '2 Juan',
  '3jn': '3 Juan',
  jud: 'Judas',
  apoc: 'Apocalipsis',
  apo: 'Apocalipsis',
}

// Combine both for backward compatibility
const BOOK_ABBREVIATIONS: Record<string, string> = { ...ENGLISH_ABBREVIATIONS, ...SPANISH_ABBREVIATIONS }

const referencePattern = /^([1-3]?\s*[a-záéíóúñü]+\.?)\s*(\d+)?(?::(\d+))?(?:-(\d+))?$/i

const toNumber = (value: string | undefined, fallback: number | null): number | null => {
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return fallback
  }
  return parsed
}

/**
 * Parse a Bible reference string
 * @param {string} input - The input string (e.g., "Mat 2:3", "Matt 2", "Revelation 2:1-5")
 * @param {Array<string>} availableBooks - List of available book names from the current Bible
 * @returns {Object|null} - Parsed reference with book, chapter, verse, endVerse or null if invalid
 */
export function parseBibleReference(input: string, availableBooks: string[] = []): ReferenceParseResult | null {
  if (!input) {
    return null
  }

  const trimmed = input.trim()

  const match = trimmed.match(referencePattern)

  if (!match) {
    return null
  }

  const [, bookPartRaw, chapterPart, versePart, endVersePart] = match
  const bookPart = bookPartRaw ?? ''

  const normalizedBook = bookPart.toLowerCase().trim().replace(/\./g, '').replace(/\s+/g, '')

  const language = detectLanguage(availableBooks)
  const abbreviationMap = language === 'spanish' ? SPANISH_ABBREVIATIONS : ENGLISH_ABBREVIATIONS

  let bookName = abbreviationMap[normalizedBook]

  if (!bookName && availableBooks.length > 0) {
    const lowerBookPart = bookPart.toLowerCase().trim()

    bookName = availableBooks.find((b) => b.toLowerCase() === lowerBookPart)

    if (!bookName) {
      bookName = availableBooks.find((b) =>
        b.toLowerCase().startsWith(lowerBookPart) ||
        b.toLowerCase().replace(/\s+/g, '').startsWith(normalizedBook)
      )
    }
  }

  if (!bookName) {
    return null
  }

  const chapter = toNumber(chapterPart, 1) ?? 1
  const verse = toNumber(versePart, null)
  const endVerse = toNumber(endVersePart, null)

  return {
    book: bookName,
    chapter,
    verse,
    endVerse,
  }
}

/**
 * Check if a string looks like a Bible reference
 * @param {string} input - The input string
 * @returns {boolean} - True if it looks like a Bible reference
 */
export function isBibleReference(input: string): boolean {
  if (!input) {
    return false
  }

  const trimmed = input.trim()

  const patterns: RegExp[] = [
    /^([1-3]?\s*[a-záéíóúñü]+\.?)\s+\d+/i,
    /^([1-3]?\s*[a-z]+)\s+\d+:\d+/i,
  ]

  return patterns.some((pattern) => pattern.test(trimmed))
}

/**
 * Detect if the available books are in Spanish or English
 * @param {Array<string>} availableBooks - List of available book names
 * @returns {string} - 'spanish' or 'english'
 */
function detectLanguage(availableBooks: string[]): Language {
  if (!availableBooks.length) return 'english'

  const spanishSample = new Set(SPANISH_BIBLE_BOOKS)
  const englishSample = new Set(ENGLISH_BIBLE_BOOKS)

  const hasSpanish = availableBooks.some((book) => spanishSample.has(book))
  const hasEnglish = availableBooks.some((book) => englishSample.has(book))

  if (hasSpanish && !hasEnglish) return 'spanish'
  if (hasEnglish && !hasSpanish) return 'english'

  const fallbackSpanishBooks = ['Génesis', 'Éxodo', 'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Apocalipsis']
  const hasFallbackSpanish = availableBooks.some((book) => fallbackSpanishBooks.includes(book))

  return hasFallbackSpanish ? 'spanish' : 'english'
}

/**
 * Get a list of suggestions for partial book name input
 * @param input - Partial book name
 * @param availableBooks - List of available book names
 * @returns List of matching book names
 */
export function getSuggestions(input: string, availableBooks: string[] = []): string[] {
  if (!input || !availableBooks.length) {
    return []
  }

  const normalized = input.toLowerCase().trim().replace(/\s+/g, '')

  const language = detectLanguage(availableBooks)
  const abbreviationMap = language === 'spanish' ? SPANISH_ABBREVIATIONS : ENGLISH_ABBREVIATIONS

  const abbrevMatches = Object.entries(abbreviationMap)
    .filter(([abbrev]) => abbrev.startsWith(normalized))
    .map(([, fullName]) => fullName)
    .filter((name) => availableBooks.includes(name))

  const lowerInput = input.toLowerCase().trim()
  const fullNameMatches = availableBooks.filter((book) =>
    book.toLowerCase().startsWith(lowerInput) ||
    book.toLowerCase().replace(/\s+/g, '').startsWith(normalized)
  )

  const combined = [...new Set([...abbrevMatches, ...fullNameMatches])]
  return combined.slice(0, 10)
}

export { BOOK_ABBREVIATIONS }
