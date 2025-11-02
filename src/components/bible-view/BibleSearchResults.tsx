import type { BibleSearchResult } from '../../types/search'

interface BibleSearchResultsProps {
  results: BibleSearchResult[]
  onNavigate: (_book: string, _chapter: number, _verse: number | null) => void
  maxResults?: number
}

const DEFAULT_MAX_RESULTS = 50

const BibleSearchResults = ({
  results,
  onNavigate,
  maxResults = DEFAULT_MAX_RESULTS,
}: BibleSearchResultsProps) => {
  if (!results.length) {
    return null
  }

  const visibleResults = results.slice(0, maxResults)
  const remainingCount = Math.max(results.length - maxResults, 0)

  return (
    <div className="search-results-panel card">
      <div className="search-results-header">
        <h3>Search Results ({results.length})</h3>
      </div>
      <div className="search-results-list">
        {visibleResults.map((result, index) => (
          <div
            key={`${result.reference}-${index}`}
            className="search-result-item"
            onClick={() => onNavigate(result.book, result.chapter, result.verse)}
          >
            <div className="result-reference">{result.reference}</div>
            <div className="result-text">{result.text}</div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="results-truncated">
            ... and {remainingCount} more results. Try a more specific search.
          </div>
        )}
      </div>
    </div>
  )
}

export default BibleSearchResults
