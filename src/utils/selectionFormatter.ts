type SelectionParseResult = {
  book: string
  chapter: string
  verse: string
  text: string
}

const selectionPattern = /^(.+?) (\d+):(\d+) (.+)$/
const verseNumberPattern = /:(\d+)/

const parseSelectionEntry = (entry: string): SelectionParseResult | null => {
  const match = entry.match(selectionPattern)
  if (!match) return null
  const [, book, chapter, verse, text] = match
  return { book, chapter, verse, text }
}

const formatSingleSelection = (selection: SelectionParseResult, includeReference: boolean = true): string => {
  if (includeReference) {
    return `${selection.book} ${selection.chapter}:${selection.verse}\n${selection.verse} ${selection.text}`
  }
  return `${selection.verse} ${selection.text}`
}

const formatSelectionsIndividually = (selections: SelectionParseResult[]): string => {
  return selections
    .map((selection) => formatSingleSelection(selection))
    .join('\n\n')
}

const areConsecutive = (selections: SelectionParseResult[]): boolean => {
  if (selections.length < 2) return false
  for (let i = 1; i < selections.length; i += 1) {
    const prev = selections[i - 1]
    const current = selections[i]
    if (current.book !== prev.book || current.chapter !== prev.chapter) {
      return false
    }
    if (Number(current.verse) !== Number(prev.verse) + 1) {
      return false
    }
  }
  return true
}

const buildSeekFirstUrl = (version: string, book: string, chapter: string, language: string, verses?: string): string => {
  const baseUrl = 'https://www.seekfirstbible.com'
  const bookSlug = book.replace(/\s+/g, '-')
  let url = `${baseUrl}/${language}/${version}/${bookSlug}/${chapter}`
  if (verses) {
    url += `/${verses}`
  }
  return url
}

export const formatSelectedVersesForCopy = (entries: string[], version?: string, language: string = 'en'): string => {
  const parsed = entries
    .map(parseSelectionEntry)
    .filter((value): value is SelectionParseResult => value !== null)

  if (!parsed.length) return ''

  let formattedText = ''

  if (parsed.length === 1) {
    const sel = parsed[0]
    formattedText = `${sel.verse} ${sel.text}\n\n${sel.book} ${sel.chapter}:${sel.verse}`
    if (version) {
      const url = buildSeekFirstUrl(version, sel.book, sel.chapter, language, sel.verse)
      formattedText += `\n${url}`
    }
    return formattedText
  }

  const sorted = [...parsed].sort(
    (a, b) => Number(a.verse) - Number(b.verse),
  )

  if (areConsecutive(sorted)) {
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const combinedText = sorted
      .map((selection) => `${selection.verse} ${selection.text}`)
      .join(' ')
    const reference = `${first.book} ${first.chapter}:${first.verse}-${last.verse}`
    formattedText = `${combinedText}\n\n${reference}`
    if (version) {
      const verseRange = `${first.verse}-${last.verse}`
      const url = buildSeekFirstUrl(version, first.book, first.chapter, language, verseRange)
      formattedText += `\n${url}`
    }
    return formattedText
  }

  formattedText = formatSelectionsIndividually(sorted)
  if (version && sorted.length > 0) {
    const first = sorted[0]
    const url = buildSeekFirstUrl(version, first.book, first.chapter, language)
    formattedText += `\n\n${url}`
  }
  return formattedText
}

export const extractVerseNumber = (entry: string): number | null => {
  const match = entry.match(verseNumberPattern)
  return match ? Number.parseInt(match[1], 10) : null
}
