import { useState, useMemo } from 'react'
import { getMiddleYear, formatYear } from '../utils/dateParser'
import { translateBookToEnglish, translateBookToSpanish } from '../utils/bookNameMappings'

type BookTimelineProps = {
  selectedBook: string
  onBookSelect?: (_book: string) => void
  bookMetadata: Record<string, { date: string; category: string; author?: string }>
  isSpanish?: boolean
}

type TimelineBook = {
  name: string
  year: number
  dateString: string
  category: string
  author?: string
}

const BookTimeline = ({ selectedBook, onBookSelect, bookMetadata, isSpanish = false }: BookTimelineProps) => {
  const [hoveredBook, setHoveredBook] = useState<string | null>(null)
  const [showCrossTooltip, setShowCrossTooltip] = useState(false)
  
  // Parse and sort all books by their writing date
  const timelineData = useMemo<TimelineBook[]>(() => {
    if (!bookMetadata) return []
    
    const books = Object.entries(bookMetadata).map(([name, data]) => ({
      name,
      year: getMiddleYear(data.date),
      dateString: data.date,
      category: data.category,
      author: data.author
    }))
    
    // Filter out any books without valid dates and sort by year
    return books
      .filter((book) => book.year !== null)
      .map((book) => ({
        ...book,
        year: book.year ?? 0,
      }))
      .sort((a, b) => a.year - b.year)
  }, [bookMetadata])
  
  // Calculate timeline range - fixed from 2000 BC to 2000 AD
  const minYear = -2000
  const maxYear = 2000
  const yearRange = maxYear - minYear
  
  // Position a book on the timeline (0-100%)
  const getPosition = (year: number) => {
    return ((year - minYear) / yearRange) * 100
  }
  
  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Law': '#FF6B6B',
      'Wisdom': '#FFE66D',
      'Major Prophets': '#A8E6CF',
      'Minor Prophets': '#95E1D3',
      'Gospel': '#F38181',
      'History': '#4ECDC4',
      'Epistle': '#AA96DA',
      'Apocalyptic': '#FF8B94'
    }
    return colors[category] || '#999'
  }
  
  return (
    <div className="book-timeline-container">
      <div className="timeline-header">
        <h3 className="timeline-title">
          {isSpanish ? 'Cronología Bíblica' : 'Biblical Timeline'}
        </h3>
        <p className="timeline-subtitle">
          {isSpanish ? 'Cuando se escribió cada libro' : 'When each book was written'}
        </p>
      </div>
      <div className="timeline-wrapper">
        {/* Main timeline axis */}
        <div className="timeline-axis">
          {/* Book markers */}
          <div className="book-markers">
            {timelineData.map((book, idx) => {
              const position = getPosition(book.year)
              // Compare using English book names for metadata lookup
              const englishSelectedBook = translateBookToEnglish(selectedBook)
              const isSelected = book.name === englishSelectedBook
              const isHovered = book.name === hoveredBook
              
              // Get the display name (Spanish if needed, otherwise English)
              const displayName = isSpanish ? translateBookToSpanish(book.name) : book.name
              
              return (
                <div
                  key={`${book.name}-${idx}`}
                  className={`book-marker ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                  style={{ 
                    left: `${position}%`,
                    backgroundColor: getCategoryColor(book.category)
                  }}
                  onClick={() => onBookSelect && onBookSelect(displayName)}
                  onMouseEnter={() => setHoveredBook(book.name)}
                  onMouseLeave={() => setHoveredBook(null)}
                  title={`${displayName} (${book.dateString})`}
                >
                  {(isSelected || (isHovered && !isSelected)) && (
                    <div className="book-tooltip">
                      <div className="book-name">{displayName}</div>
                      <div className="book-meta">{book.dateString}</div>
                      <div className="book-category" style={{ color: getCategoryColor(book.category) }}>
                        {book.category}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Year markers */}
          <div className="year-markers">
            {[-2000, -1000, 0, 1000, 2000].map(year => {
              const position = getPosition(year)
              return (
                <div
                  key={year}
                  className="year-marker"
                  style={{ left: `${position}%` }}
                >
                  <div className="tick-mark"></div>
                  <span className="marker-label">{formatYear(year)}</span>
                </div>
              )
            })}
          </div>

          {/* BC/AD divider */}
          <div 
            className="bc-ad-divider"
            style={{ left: `${getPosition(0)}%` }}
            onMouseEnter={() => setShowCrossTooltip(true)}
            onMouseLeave={() => setShowCrossTooltip(false)}
          >
            <div className="divider-line"></div>
            <div className="divider-cross">✝</div>
            {showCrossTooltip && (
              <div className="cross-tooltip">
                <div className="cross-tooltip-title">
                  {isSpanish ? 'Nacimiento de Cristo' : 'Birth of Christ'}
                </div>
                <div className="cross-tooltip-subtitle">
                  {isSpanish ? 'AC / DC' : 'BC / AD'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookTimeline
