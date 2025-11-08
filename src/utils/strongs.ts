import { translateBookToEnglish } from './bookNameMappings'

export const STRONGS_BIBLE_ID = 'KJV_STRONGS'

const STRONGS_BOOK_ALIASES: Record<string, string> = {
  'Song of Songs': 'Song of Solomon',
}

export const normalizeStrongsBookName = (bookName: string): string => {
  const englishName = translateBookToEnglish(bookName)
  return STRONGS_BOOK_ALIASES[englishName] || englishName
}

export type StrongsChapterVerses = Record<number, string>
export type StrongsBookIndex = Record<string, Record<number, StrongsChapterVerses>>

export type StrongsCodeToken = {
  value: string
  isMorph?: boolean
}

export type StrongsSegment = {
  text: string
  codes: StrongsCodeToken[]
}

const STRONGS_SEGMENT_REGEX = /([^{}]+)((?:\{[^}]+\})+)/g
const STRONGS_CODE_REGEX = /\{([^}]+)\}/g

const extractCodes = (codeGroup: string): StrongsCodeToken[] => {
  const codes: StrongsCodeToken[] = []
  STRONGS_CODE_REGEX.lastIndex = 0
  let codeMatch: RegExpExecArray | null
  while ((codeMatch = STRONGS_CODE_REGEX.exec(codeGroup)) !== null) {
    const rawCode = codeMatch[1]
    codes.push({
      value: rawCode.replace(/[()]/g, ''),
      isMorph: rawCode.includes('('),
    })
  }
  return codes
}

export const parseStrongsSegments = (text: string): StrongsSegment[] => {
  const segments: StrongsSegment[] = []
  STRONGS_SEGMENT_REGEX.lastIndex = 0
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = STRONGS_SEGMENT_REGEX.exec(text)) !== null) {
    const [fullMatch, words, codeGroup] = match
    const matchIndex = match.index ?? 0

    if (matchIndex > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, matchIndex),
        codes: [],
      })
    }

    segments.push({
      text: words,
      codes: extractCodes(codeGroup),
    })

    lastIndex = matchIndex + fullMatch.length
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      codes: [],
    })
  }

  return segments
}
