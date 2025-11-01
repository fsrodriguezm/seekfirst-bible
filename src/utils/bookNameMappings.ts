// Book name mappings between Spanish and English
// Used for cross references and Bible navigation
import {
  ENGLISH_BIBLE_BOOKS,
  SPANISH_BIBLE_BOOKS,
} from './bibleBookLists'

type BookMap = Record<string, string>

// Create mapping from Spanish to English books
export const SPANISH_TO_ENGLISH_BOOKS: BookMap = {
  'Génesis': 'Genesis',
  'Éxodo': 'Exodus',
  'Levítico': 'Leviticus',
  'Números': 'Numbers',
  'Deuteronomio': 'Deuteronomy',
  'Josué': 'Joshua',
  'Jueces': 'Judges',
  'Rut': 'Ruth',
  '1 Samuel': '1 Samuel',
  '2 Samuel': '2 Samuel',
  '1 Reyes': '1 Kings',
  '2 Reyes': '2 Kings',
  '1 Crónicas': '1 Chronicles',
  '2 Crónicas': '2 Chronicles',
  'Esdras': 'Ezra',
  'Nehemías': 'Nehemiah',
  'Ester': 'Esther',
  'Job': 'Job',
  'Salmos': 'Psalms',
  'Proverbios': 'Proverbs',
  'Eclesiastés': 'Ecclesiastes',
  'Cantares': 'Song of Songs',
  'Isaías': 'Isaiah',
  'Jeremías': 'Jeremiah',
  'Lamentaciones': 'Lamentations',
  'Ezequiel': 'Ezekiel',
  'Daniel': 'Daniel',
  'Oseas': 'Hosea',
  'Joel': 'Joel',
  'Amós': 'Amos',
  'Abdías': 'Obadiah',
  'Jonás': 'Jonah',
  'Miqueas': 'Micah',
  'Nahúm': 'Nahum',
  'Habacuc': 'Habakkuk',
  'Sofonías': 'Zephaniah',
  'Hageo': 'Haggai',
  'Zacarías': 'Zechariah',
  'Malaquías': 'Malachi',
  'Mateo': 'Matthew',
  'Marcos': 'Mark',
  'Lucas': 'Luke',
  'Juan': 'John',
  'Hechos': 'Acts',
  'Romanos': 'Romans',
  '1 Corintios': '1 Corinthians',
  '2 Corintios': '2 Corinthians',
  'Gálatas': 'Galatians',
  'Efesios': 'Ephesians',
  'Filipenses': 'Philippians',
  'Colosenses': 'Colossians',
  '1 Tesalonicenses': '1 Thessalonians',
  '2 Tesalonicenses': '2 Thessalonians',
  '1 Timoteo': '1 Timothy',
  '2 Timoteo': '2 Timothy',
  'Tito': 'Titus',
  'Filemón': 'Philemon',
  'Hebreos': 'Hebrews',
  'Santiago': 'James',
  '1 Pedro': '1 Peter',
  '2 Pedro': '2 Peter',
  '1 Juan': '1 John',
  '2 Juan': '2 John',
  '3 Juan': '3 John',
  'Judas': 'Jude',
  'Apocalipsis': 'Revelation'
}

// Reverse mapping (English to Spanish)
export const ENGLISH_TO_SPANISH_BOOKS = Object.fromEntries(
  Object.entries(SPANISH_TO_ENGLISH_BOOKS).map(([spanish, english]) => [english, spanish])
)

// Helper functions for book name translation
export const translateBookToEnglish = (bookName: string): string => {
  return SPANISH_TO_ENGLISH_BOOKS[bookName] || bookName
}

export const translateBookToSpanish = (bookName: string): string => {
  return ENGLISH_TO_SPANISH_BOOKS[bookName] || bookName
}

const referencePattern = /^(.+?)\s+(\d+:\d+.*)$/

export const translateReferenceToSpanish = (reference: string): string => {
  // Parse reference like "Matthew 24:15" and translate book name to Spanish
  const match = reference.match(referencePattern)
  if (match) {
    const [, bookName, rest] = match
    const spanishBook = translateBookToSpanish(bookName)
    return `${spanishBook} ${rest}`
  }
  return reference
}

export const translateReferenceToEnglish = (reference: string): string => {
  // Parse reference like "Mateo 24:15" and translate book name to English
  const match = reference.match(referencePattern)
  if (match) {
    const [, bookName, rest] = match
    const englishBook = translateBookToEnglish(bookName)
    return `${englishBook} ${rest}`
  }
  return reference
}

// Utility to detect if a book name is Spanish
export const isSpanishBookName = (bookName: string): boolean => {
  return SPANISH_BIBLE_BOOKS.includes(bookName)
}

// Utility to detect if a book name is English
export const isEnglishBookName = (bookName: string): boolean => {
  return ENGLISH_BIBLE_BOOKS.includes(bookName)
}
