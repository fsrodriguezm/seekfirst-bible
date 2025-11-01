import initSqlJs, { type SqlJsStatic, type Database, type Statement } from 'sql.js'
import {
  translateBookToEnglish,
  translateReferenceToSpanish,
} from './bookNameMappings'
import {
  OLD_TESTAMENT_BOOKS_EN,
  NEW_TESTAMENT_BOOKS_EN,
  getTestamentForBook,
} from './bibleBookLists'

type Testament = 'OT' | 'NT'

type VerseReference = {
  book: string
  chapter: number
  verse: number
}

type CrossReferenceRow = {
  from_verse: string
  to_verse: string
  votes: number | null
}

type CrossReferenceEntry = {
  ref: string
  weight: number
  votes: number
  reason: string
  fromRef?: string
}

type ChapterCrossReferences = Record<number, CrossReferenceEntry[]>

let SQL: SqlJsStatic | null = null
let otDb: Database | null = null
let ntDb: Database | null = null

const getTestament = (bookName: string): Testament | null => {
  const testament = getTestamentForBook(bookName)
  return testament === 'OT' || testament === 'NT' ? testament : null
}

const parseVerseReference = (verseRef: string): VerseReference | null => {
  let reference = verseRef
  if (reference.includes('-')) {
    reference = reference.split('-')[0]
  }

  const pattern = /^(.+?)\s+(\d+):(\d+)$/
  const match = reference.trim().match(pattern)

  if (!match) {
    return null
  }

  return {
    book: match[1].trim(),
    chapter: Number.parseInt(match[2], 10),
    verse: Number.parseInt(match[3], 10),
  }
}

const initDatabase = async (): Promise<{ otDb: Database; ntDb: Database }> => {
  if (SQL && otDb && ntDb) {
    return { otDb, ntDb }
  }

  SQL = await initSqlJs({
    locateFile: (file: string) => `/${file}`,
  })

  const [otResponse, ntResponse] = await Promise.all([
    fetch('/api/resources/cross_refs/crossrefs_ot.db'),
    fetch('/api/resources/cross_refs/crossrefs_nt.db'),
  ])

  if (!otResponse.ok) {
    throw new Error(`Failed to load OT database: ${otResponse.statusText}`)
  }
  if (!ntResponse.ok) {
    throw new Error(`Failed to load NT database: ${ntResponse.statusText}`)
  }

  const [otBuffer, ntBuffer] = await Promise.all([
    otResponse.arrayBuffer(),
    ntResponse.arrayBuffer(),
  ])

  otDb = new SQL.Database(new Uint8Array(otBuffer))
  ntDb = new SQL.Database(new Uint8Array(ntBuffer))

  return { otDb, ntDb }
}

type StatementMapper<T> = (_row: CrossReferenceRow) => T | null

const mapStatementRows = <T>(stmt: Statement, mapper: StatementMapper<T>): T[] => {
  const results: T[] = []
  while (stmt.step()) {
    const mapped = mapper(stmt.getAsObject() as CrossReferenceRow)
    if (mapped) {
      results.push(mapped)
    }
  }
  stmt.free()
  return results
}

const computeWeight = (votes: number | null): number => {
  const value = votes ?? 0
  return Math.min(value / 20, 1)
}

const createEntry = (ref: string, weight: number, votes: number | null, fromRef?: string): CrossReferenceEntry => ({
  ref,
  weight: Math.round(weight * 100) / 100,
  votes: votes ?? 0,
  reason: 'cross-reference',
  ...(fromRef ? { fromRef } : {}),
})

const translateIfNeeded = (reference: string, translateToSpanish: boolean): string => (
  translateToSpanish ? translateReferenceToSpanish(reference) : reference
)

export const getCrossReferences = async (
  book: string | null,
  chapter: number | null,
  verse: number | null,
  translateToSpanish = false,
): Promise<CrossReferenceEntry[]> => {
  try {
    if (book === null || chapter === null || verse === null) {
      return getAllCrossReferences(translateToSpanish)
    }

    const englishBook = translateBookToEnglish(book)
    const { otDb: otDatabase, ntDb: ntDatabase } = await initDatabase()
    const testament = getTestament(englishBook)

    const database = testament === 'OT' ? otDatabase : testament === 'NT' ? ntDatabase : null
    if (!database) {
      console.error(`Unknown book: ${englishBook}`)
      return []
    }

    const stmt = database.prepare(
      `
      SELECT from_verse, to_verse, votes
      FROM cross_references
      WHERE from_verse LIKE ?
      ORDER BY votes DESC
    `,
    )

    stmt.bind([`${englishBook} ${chapter}:${verse}`])

    const results = mapStatementRows(stmt, (row) => {
      const toVerseParsed = parseVerseReference(row.to_verse)
      if (!toVerseParsed) return null

      const weight = computeWeight(row.votes)
      const displayReference = translateIfNeeded(row.to_verse, translateToSpanish)

      return createEntry(displayReference, weight, row.votes)
    })

    return results
  } catch (error) {
    console.error('Error fetching cross references:', error)
    return []
  }
}

const getAllCrossReferences = async (translateToSpanish = false): Promise<CrossReferenceEntry[]> => {
  try {
    const { otDb: otDatabase, ntDb: ntDatabase } = await initDatabase()

    const query = `
      SELECT from_verse, to_verse, votes
      FROM cross_references
      ORDER BY votes DESC
      LIMIT 2000
    `

    const allConnections = new Map<string, CrossReferenceEntry>()

    const processDatabase = (db: Database) => {
      const stmt = db.prepare(query)
    mapStatementRows(stmt, (row) => {
      const fromParsed = parseVerseReference(row.from_verse)
      const toParsed = parseVerseReference(row.to_verse)
      if (!fromParsed || !toParsed) return null

        const weight = computeWeight(row.votes)
        const fromRef = translateIfNeeded(row.from_verse, translateToSpanish)
        const toRef = translateIfNeeded(row.to_verse, translateToSpanish)

        const entryForward = createEntry(toRef, weight, row.votes, fromRef)
        const entryBackward = createEntry(fromRef, weight, row.votes, toRef)

        allConnections.set(`${fromRef}→${toRef}`, entryForward)
        allConnections.set(`${toRef}→${fromRef}`, entryBackward)

        return null
      })
    }

    processDatabase(otDatabase)
    processDatabase(ntDatabase)

    const results = Array.from(allConnections.values())
    results.sort((a, b) => b.votes - a.votes)
    return results.slice(0, 2000)
  } catch (error) {
    console.error('Error fetching all cross references:', error)
    return []
  }
}

export const getCrossReferencesForChapter = async (
  book: string,
  chapter: number,
  translateToSpanish = false,
): Promise<ChapterCrossReferences> => {
  try {
    const englishBook = translateBookToEnglish(book)
    const { otDb: otDatabase, ntDb: ntDatabase } = await initDatabase()

    const testament = getTestament(englishBook)
    const database = testament === 'OT' ? otDatabase : testament === 'NT' ? ntDatabase : null
    if (!database) {
      console.error(`Unknown book: ${englishBook}`)
      return {}
    }

    const stmt = database.prepare(
      `
      SELECT from_verse, to_verse, votes
      FROM cross_references
      WHERE from_verse LIKE ?
      ORDER BY from_verse, votes DESC
    `,
    )

    stmt.bind([`${englishBook} ${chapter}:%`])

    const verseMap: ChapterCrossReferences = {}

    mapStatementRows(stmt, (row) => {
      const fromParsed = parseVerseReference(row.from_verse)
      const toParsed = parseVerseReference(row.to_verse)
      if (!fromParsed || !toParsed) return null

      const verseNumber = fromParsed.verse
      const weight = computeWeight(row.votes)
      const displayReference = translateIfNeeded(row.to_verse, translateToSpanish)

      const entry = createEntry(displayReference, weight, row.votes)
      if (!verseMap[verseNumber]) {
        verseMap[verseNumber] = []
      }
      verseMap[verseNumber].push(entry)
      return null
    })

    return verseMap
  } catch (error) {
    console.error('Error fetching chapter cross references:', error)
    return {}
  }
}

const crossReferenceDB = {
  getCrossReferences,
  getCrossReferencesForChapter,
  initDatabase,
  getTestament,
}

export default crossReferenceDB
