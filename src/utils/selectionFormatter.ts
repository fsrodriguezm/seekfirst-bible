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

const formatSingleSelection = (selection: SelectionParseResult): string => {
  return `${selection.book} ${selection.chapter}:${selection.verse}\n${selection.verse} ${selection.text}`
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

const formatConsecutiveSelections = (selections: SelectionParseResult[]): string => {
  const first = selections[0]
  const last = selections[selections.length - 1]
  const reference = `${first.book} ${first.chapter}:${first.verse}-${last.verse}`
  const combinedText = selections
    .map((selection) => `${selection.verse} ${selection.text}`)
    .join(' ')
  return `${reference}\n${combinedText}`
}

export const formatSelectedVersesForCopy = (entries: string[]): string => {
  const parsed = entries
    .map(parseSelectionEntry)
    .filter((value): value is SelectionParseResult => value !== null)

  if (!parsed.length) return ''

  if (parsed.length === 1) {
    return formatSingleSelection(parsed[0])
  }

  const sorted = [...parsed].sort(
    (a, b) => Number(a.verse) - Number(b.verse),
  )

  if (areConsecutive(sorted)) {
    return formatConsecutiveSelections(sorted)
  }

  return formatSelectionsIndividually(sorted)
}

export const extractVerseNumber = (entry: string): number | null => {
  const match = entry.match(verseNumberPattern)
  return match ? Number.parseInt(match[1], 10) : null
}
