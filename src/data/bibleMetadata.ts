/**
 * Bible metadata for API-based Bibles
 * Provides book names and chapter counts when full Bible data isn't available
 */

export interface BibleMetadata {
  books: {
    [bookName: string]: number // book name -> chapter count
  }
}

// Spanish book names and chapter counts
export const RVR1909_METADATA: BibleMetadata = {
  books: {
    'Génesis': 50,
    'Éxodo': 40,
    'Levítico': 27,
    'Números': 36,
    'Deuteronomio': 34,
    'Josué': 24,
    'Jueces': 21,
    'Rut': 4,
    '1 Samuel': 31,
    '2 Samuel': 24,
    '1 Reyes': 22,
    '2 Reyes': 25,
    '1 Crónicas': 29,
    '2 Crónicas': 36,
    'Esdras': 10,
    'Nehemías': 13,
    'Ester': 10,
    'Job': 42,
    'Salmos': 150,
    'Proverbios': 31,
    'Eclesiastés': 12,
    'Cantares': 8,
    'Isaías': 66,
    'Jeremías': 52,
    'Lamentaciones': 5,
    'Ezequiel': 48,
    'Daniel': 12,
    'Oseas': 14,
    'Joel': 3,
    'Amós': 9,
    'Abdías': 1,
    'Jonás': 4,
    'Miqueas': 7,
    'Nahúm': 3,
    'Habacuc': 3,
    'Sofonías': 3,
    'Hageo': 2,
    'Zacarías': 14,
    'Malaquías': 4,
    'Mateo': 28,
    'Marcos': 16,
    'Lucas': 24,
    'Juan': 21,
    'Hechos': 28,
    'Romanos': 16,
    '1 Corintios': 16,
    '2 Corintios': 13,
    'Gálatas': 6,
    'Efesios': 6,
    'Filipenses': 4,
    'Colosenses': 4,
    '1 Tesalonicenses': 5,
    '2 Tesalonicenses': 3,
    '1 Timoteo': 6,
    '2 Timoteo': 4,
    'Tito': 3,
    'Filemón': 1,
    'Hebreos': 13,
    'Santiago': 5,
    '1 Pedro': 5,
    '2 Pedro': 3,
    '1 Juan': 5,
    '2 Juan': 1,
    '3 Juan': 1,
    'Judas': 1,
    'Apocalipsis': 22,
  },
}

// Map Bible IDs to their metadata
export const BIBLE_METADATA_MAP: Record<string, BibleMetadata> = {
  RVR1909: RVR1909_METADATA,
}

/**
 * Get metadata for a Bible version
 */
export const getBibleMetadata = (bibleId: string): BibleMetadata | null => {
  return BIBLE_METADATA_MAP[bibleId] || null
}

/**
 * Get book names for a Bible version
 */
export const getBookNamesForBible = (bibleId: string): string[] => {
  const metadata = getBibleMetadata(bibleId)
  return metadata ? Object.keys(metadata.books) : []
}

/**
 * Get chapter count for a specific book in a Bible version
 */
export const getChapterCountForBook = (bibleId: string, bookName: string): number => {
  const metadata = getBibleMetadata(bibleId)
  return metadata?.books[bookName] || 0
}
