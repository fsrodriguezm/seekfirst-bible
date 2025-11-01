// Centralized Bible book lists for different languages
// This file contains ordered lists of Bible books and utilities to work with them

// Complete list of Bible books in canonical order (English)
export const ENGLISH_BIBLE_BOOKS = [
  // Old Testament (39 books)
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // New Testament (27 books)
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
]

// Complete list of Bible books in canonical order (Spanish)
export const SPANISH_BIBLE_BOOKS = [
  // Old Testament (39 books)
  'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut',
  '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías',
  'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías',
  'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas',
  'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías',
  // New Testament (27 books)
  'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios', '2 Corintios',
  'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses',
  '1 Timoteo', '2 Timoteo', 'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro', '2 Pedro',
  '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis'
]

// Old Testament and New Testament boundaries
export const OLD_TESTAMENT_BOOK_COUNT = 39
export const NEW_TESTAMENT_BOOK_COUNT = 27
export const TOTAL_BOOK_COUNT = 66

// Language detection and book list selection
export const SUPPORTED_LANGUAGES = {
  ENGLISH: 'english',
  SPANISH: 'spanish'
}

// Get book list for a specific language
export const getBooksForLanguage = (language) => {
  switch (language) {
    case SUPPORTED_LANGUAGES.ENGLISH:
      return ENGLISH_BIBLE_BOOKS
    case SUPPORTED_LANGUAGES.SPANISH:
      return SPANISH_BIBLE_BOOKS
    default:
      return ENGLISH_BIBLE_BOOKS // Default to English
  }
}

// Detect language from a book name
export const detectLanguageFromBook = (bookName) => {
  if (SPANISH_BIBLE_BOOKS.includes(bookName)) {
    return SUPPORTED_LANGUAGES.SPANISH
  }
  if (ENGLISH_BIBLE_BOOKS.includes(bookName)) {
    return SUPPORTED_LANGUAGES.ENGLISH
  }
  return SUPPORTED_LANGUAGES.ENGLISH // Default to English if not found
}

// Get appropriate book list based on a sample book name
export const getBooksForBook = (bookName) => {
  const language = detectLanguageFromBook(bookName)
  return getBooksForLanguage(language)
}

// Testament utilities
export const getTestament = (bookIndex) => {
  return bookIndex < OLD_TESTAMENT_BOOK_COUNT ? 'OT' : 'NT'
}

// Get book index in its language's book list
export const getBookIndex = (bookName, bookList = null) => {
  if (!bookList) {
    bookList = getBooksForBook(bookName)
  }
  return bookList.indexOf(bookName)
}

// Get testament for a specific book name
export const getTestamentForBook = (bookName, bookList = null) => {
  const index = getBookIndex(bookName, bookList)
  return index !== -1 ? getTestament(index) : null
}

// Sets for faster lookup
export const OLD_TESTAMENT_BOOKS_EN = new Set(ENGLISH_BIBLE_BOOKS.slice(0, OLD_TESTAMENT_BOOK_COUNT))
export const NEW_TESTAMENT_BOOKS_EN = new Set(ENGLISH_BIBLE_BOOKS.slice(OLD_TESTAMENT_BOOK_COUNT))
export const OLD_TESTAMENT_BOOKS_ES = new Set(SPANISH_BIBLE_BOOKS.slice(0, OLD_TESTAMENT_BOOK_COUNT))
export const NEW_TESTAMENT_BOOKS_ES = new Set(SPANISH_BIBLE_BOOKS.slice(OLD_TESTAMENT_BOOK_COUNT))

// Check if book is Old Testament (works with both languages)
export const isOldTestament = (bookName) => {
  return OLD_TESTAMENT_BOOKS_EN.has(bookName) || OLD_TESTAMENT_BOOKS_ES.has(bookName)
}

// Check if book is New Testament (works with both languages)
export const isNewTestament = (bookName) => {
  return NEW_TESTAMENT_BOOKS_EN.has(bookName) || NEW_TESTAMENT_BOOKS_ES.has(bookName)
}

const bibleBookLists = {
  ENGLISH_BIBLE_BOOKS,
  SPANISH_BIBLE_BOOKS,
  SUPPORTED_LANGUAGES,
  getBooksForLanguage,
  getBooksForBook,
  detectLanguageFromBook,
  getTestament,
  getTestamentForBook,
  getBookIndex,
  isOldTestament,
  isNewTestament,
  OLD_TESTAMENT_BOOK_COUNT,
  NEW_TESTAMENT_BOOK_COUNT,
  TOTAL_BOOK_COUNT
}

export default bibleBookLists
