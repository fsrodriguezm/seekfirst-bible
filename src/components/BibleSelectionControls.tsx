import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Search, BookOpen, X } from 'lucide-react'
import { parseBibleReference, isBibleReference, getSuggestions } from '../utils/bibleReferenceParser'
import { BIBLE_VERSION_GROUPS, type BibleVersionLanguage, getDefaultVersionForLanguage } from '../data/bibleVersions'

type BibleSelectionControlsProps = {
  selectedBible: string
  selectedBook: string
  selectedChapter: number
  onBibleChange: (_version: string) => void
  onBookChange: (_book: string) => void
  onChapterChange: (_chapter: number) => void
  bookNames: string[]
  chapterCount: number
  onSearch?: (_query: string) => void
  onReferenceNavigate?: (_book: string, _chapter: number, _verse?: number | null) => void
}

const BibleSelectionControls = ({
  selectedBible,
  selectedBook,
  selectedChapter,
  onBibleChange,
  onBookChange,
  onChapterChange,
  bookNames,
  chapterCount,
  onSearch,
  onReferenceNavigate
}: BibleSelectionControlsProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const currentLanguage: BibleVersionLanguage =
    BIBLE_VERSION_GROUPS.spanish.some((version) => version.value === selectedBible) ? 'spanish' : 'english'
  const currentVersions = BIBLE_VERSION_GROUPS[currentLanguage]

  const handleLanguageChange = (language: BibleVersionLanguage) => {
    const defaultVersion = getDefaultVersionForLanguage(language)
    onBibleChange(defaultVersion)
  }

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      onChapterChange(selectedChapter - 1)
    } else {
      // Go to previous book's last chapter
      const currentBookIndex = bookNames.indexOf(selectedBook)
      if (currentBookIndex > 0) {
        const previousBook = bookNames[currentBookIndex - 1]
        onBookChange(previousBook)
        // Note: We'd need to know the chapter count for the previous book
        // For now, just go to chapter 1
        onChapterChange(1)
      }
    }
  }

  const handleNextChapter = () => {
    if (selectedChapter < chapterCount) {
      onChapterChange(selectedChapter + 1)
    } else {
      // Go to next book's first chapter
      const currentBookIndex = bookNames.indexOf(selectedBook)
      if (currentBookIndex < bookNames.length - 1) {
        const nextBook = bookNames[currentBookIndex + 1]
        onBookChange(nextBook)
        onChapterChange(1)
      }
    }
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Check if it's a Bible reference
    if (isBibleReference(searchQuery)) {
      const parsed = parseBibleReference(searchQuery, bookNames)
      if (parsed && onReferenceNavigate) {
        onReferenceNavigate(parsed.book, parsed.chapter, parsed.verse)
        setSearchQuery('')
        setShowSuggestions(false)
        return
      }
    }
    
    // Otherwise, perform keyword search
    if (onSearch) {
      onSearch(searchQuery)
    }
    setShowSuggestions(false)
  }

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Show suggestions if it looks like a reference
    if (value.trim() && isBibleReference(value)) {
      const bookSuggestions = getSuggestions(value, bookNames)
      setSuggestions(bookSuggestions)
      setShowSuggestions(bookSuggestions.length > 0)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (bookName: string) => {
    setSearchQuery(bookName + ' ')
    setShowSuggestions(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowSuggestions(false)
    setSuggestions([])
    if (onSearch) {
      onSearch('') // Clear search results
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="bible-selection-controls card">
      <div className="controls-header">
        <h3>Bible Selection</h3>
        <div className="header-controls">
          <div className="language-toggle">
            <button 
              className={`btn ${currentLanguage === 'english' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleLanguageChange('english')}
            >
              EN
            </button>
            <button 
              className={`btn ${currentLanguage === 'spanish' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleLanguageChange('spanish')}
            >
              ES
            </button>
          </div>
        </div>
      </div>
      
      <div className="controls-content">
        {/* Search Control */}
        <div className="control-group search-control-group">
          <label className="form-label">Search</label>
          <form onSubmit={handleSearch} className="compact-search-form">
            <div className="compact-search-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="form-input compact-search-input"
                placeholder="Mat 2:3 or 'love'"
                value={searchQuery}
                onChange={handleSearchInputChange}
                autoComplete="off"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="btn btn-secondary compact-clear-btn"
                  onClick={handleClearSearch}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button type="submit" className="btn btn-primary compact-search-btn" title="Search">
                {isBibleReference(searchQuery) ? <BookOpen size={16} /> : <Search size={16} />}
              </button>
              {showSuggestions && suggestions.length > 0 && (
                <div className="compact-suggestions-dropdown">
                  {suggestions.slice(0, 5).map((bookName, index) => (
                    <div
                      key={index}
                      className="compact-suggestion-item"
                      onClick={() => handleSuggestionClick(bookName)}
                    >
                      <BookOpen size={14} />
                      <span>{bookName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Bible Version Control */}
        <div className="control-group">
          <label className="form-label">Bible Version</label>
          <select 
            className="form-select"
            value={selectedBible}
            onChange={(e) => onBibleChange(e.target.value)}
          >
            {currentVersions.map(version => (
              <option key={version.value} value={version.value}>
                {version.label}
              </option>
            ))}
          </select>
        </div>

        {/* Book Control */}
        <div className="control-group">
          <label className="form-label">Book</label>
          <select 
            className="form-select"
            value={selectedBook}
            onChange={(e) => onBookChange(e.target.value)}
          >
            {bookNames.map(book => (
              <option key={book} value={book}>
                {book}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Control */}
        <div className="control-group">
          <label className="form-label">Chapter</label>
          <div className="chapter-controls">
            <button 
              className="btn btn-secondary chapter-nav-btn"
              onClick={handlePreviousChapter}
              disabled={selectedChapter === 1 && bookNames.indexOf(selectedBook) === 0}
            >
              <ChevronLeft size={16} />
            </button>
            
            <select 
              className="form-select chapter-select"
              value={selectedChapter}
            onChange={(e) => onChapterChange(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: chapterCount }, (_, i) => i + 1).map(chapter => (
                <option key={chapter} value={chapter}>
                  {['RVA1602', 'RVR1960', 'NTV'].includes(selectedBible) ? 'Capítulo' : 'Chapter'} {chapter}
                </option>
              ))}
            </select>
            
            <button 
              className="btn btn-secondary chapter-nav-btn"
              onClick={handleNextChapter}
              disabled={selectedChapter === chapterCount && bookNames.indexOf(selectedBook) === bookNames.length - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BibleSelectionControls
