/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { getBooksForBook, getTestamentForBook } from '../utils/bibleBookLists'
import { useTheme } from '../contexts/ThemeContext'

type CrossReferenceChordDiagramProps = {
  currentBook: string
  currentChapter: number
  currentVerse: number
  referencesWithText: any[]
  onNavigateToVerse: (_book: string, _chapter: number, _verse: number, _trimToIndex?: number | null) => void
  fontSize?: number
  navigationHistory?: any[]
  onUpdateNavigationHistory?: (_history: any[]) => void
  showAllReferences?: boolean
}

const CrossReferenceChordDiagram = ({ 
  currentBook, 
  currentChapter, 
  currentVerse,
  referencesWithText,
  onNavigateToVerse,
  fontSize = 14,
  navigationHistory = [],
  onUpdateNavigationHistory,
  showAllReferences = false
}: CrossReferenceChordDiagramProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const zoomRef = useRef<{ zoom: any; svg: any } | null>(null)
  const [chordData, setChordData] = useState<any>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 600 })
  const { isDark } = useTheme()

  // Get appropriate book list based on current book language
  const bibleBooks = getBooksForBook(currentBook)

  // Create navigation handler that tracks history
  const handleNavigation = useCallback((book: any, chapter: any, verse: any, trimToIndex: any = null) => {
    if (trimToIndex !== null) {
      // Breadcrumb navigation - navigate and update history
      if (onNavigateToVerse && onUpdateNavigationHistory) {
        onNavigateToVerse(book, chapter, verse)
        const trimmedHistory = navigationHistory.slice(0, trimToIndex)
        onUpdateNavigationHistory(trimmedHistory)
      }
    } else {
      // Regular diagram navigation - let parent handle both navigation and history
      if (onNavigateToVerse) {
        onNavigateToVerse(book, chapter, verse)
      }
    }
  }, [onNavigateToVerse, onUpdateNavigationHistory, navigationHistory])

  // Reset zoom function
  const resetZoom = useCallback(() => {
    if (zoomRef.current) {
      const { zoom, svg } = zoomRef.current
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity)
    }
  }, [])

  // Clear any locked state when the verse changes
  useEffect(() => {
    // Clear locked ribbon state when navigating to a new verse
    d3.select('body').property('lockedRibbon', null)
    // Remove any existing tooltips
    d3.selectAll('.chord-tooltip').remove()
  }, [currentBook, currentChapter, currentVerse])

  // Transform reference data into chord matrix
  useEffect(() => {
    if (!referencesWithText.length) {
      setChordData(null)
      return
    }

    if (showAllReferences) {
      // Show all Bible cross-references mode
      const allBooksWithRefs = new Set()
      const bookConnections = new Map()
      
      // Collect all books and their connections
      referencesWithText.forEach(ref => {
        // Parse both the reference and fromRef if available
        const toBook = ref.book
        const fromRef = ref.fromRef || `${currentBook} ${currentChapter}:${currentVerse}`
        
        // Parse fromRef to get the source book
        const fromMatch = fromRef.match(/^(.+?)\s+\d+:\d+/)
        const fromBook = fromMatch ? fromMatch[1].trim() : currentBook
        
        allBooksWithRefs.add(toBook)
        allBooksWithRefs.add(fromBook)
        
        // Create connection key
        const connectionKey = `${fromBook}->${toBook}`
        if (!bookConnections.has(connectionKey)) {
          bookConnections.set(connectionKey, 0)
        }
        bookConnections.set(connectionKey, bookConnections.get(connectionKey) + ref.weight)
      })
      
      // Use all Bible books instead of filtered list
      const filteredBooks = bibleBooks.filter(book => allBooksWithRefs.has(book))
      
      if (filteredBooks.length === 0) {
        setChordData(null)
        return
      }
      
      // Create matrix for all book connections
      const matrix = Array(filteredBooks.length)
        .fill(0)
        .map(() => Array(filteredBooks.length).fill(0))
      
      // Fill matrix with all cross-reference connections
      bookConnections.forEach((weight, connectionKey) => {
        const [fromBook, toBook] = connectionKey.split('->')
        const fromIndex = filteredBooks.indexOf(fromBook)
        const toIndex = filteredBooks.indexOf(toBook)
        
        if (fromIndex !== -1 && toIndex !== -1) {
          matrix[fromIndex][toIndex] += weight * 5 // Scale for visibility
        }
      })
      
      setChordData({
        matrix,
        books: filteredBooks,
        currentBookIndex: -1 // No specific current book in "show all" mode
      })
    } else {
      // Original single verse mode
      const referencedBooks = new Set([currentBook])
      referencesWithText.forEach(ref => {
        referencedBooks.add(ref.book)
      })
      
      // Create filtered book list maintaining original order
      const filteredBooks = bibleBooks.filter(book => referencedBooks.has(book))
      
      if (filteredBooks.length === 0) {
        setChordData(null)
        return
      }

      // Create matrix for chord diagram using filtered books
      const matrix = Array(filteredBooks.length)
        .fill(0)
        .map(() => Array(filteredBooks.length).fill(0))
      const currentBookIndex = filteredBooks.indexOf(currentBook)

      if (currentBookIndex === -1) {
        setChordData(null)
        return
      }

      // Fill matrix with cross-reference weights
      referencesWithText.forEach(ref => {
        const refBookIndex = filteredBooks.indexOf(ref.book)
        if (refBookIndex !== -1) {
          // Add weight from current book to referenced book
          matrix[currentBookIndex][refBookIndex] += ref.weight * 10 // Scale for visibility
          // Add return connection for symmetry
          matrix[refBookIndex][currentBookIndex] += ref.weight * 5
        }
      })

      setChordData({
        matrix,
        books: filteredBooks,
        currentBookIndex
      })
    }
  }, [referencesWithText, currentBook, bibleBooks, showAllReferences, currentChapter, currentVerse])

  // Create chord diagram with D3
  useEffect(() => {
    if (!chordData || !svgRef.current) return

    // Clear any global state from previous renderings
    d3.select('body').property('lockedRibbon', null)
    const existingTimeout = d3.select('body').property('ribbonTooltipTimeout')
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      d3.select('body').property('ribbonTooltipTimeout', null)
    }
    d3.selectAll('.chord-tooltip').remove()

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous content

    const { width, height } = dimensions
    const radius = Math.min(width, height) / 2 - 40
    const innerRadius = radius - 80

    // Prepare SVG viewport and create zoom layer wrapper
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('overflow', 'visible')

    const zoomLayer = svg
      .append('g')
      .attr('class', 'chord-zoom-layer')

    // Create main group that holds the diagram content
    const g = zoomLayer.append('g')

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        zoomLayer.attr('transform', event.transform)
      })

    svg.call(zoom)
    svg.call(zoom.transform, d3.zoomIdentity)
    
    // Store zoom behavior for reset function
    zoomRef.current = { zoom, svg }
    
    // Removed click-outside handler - now using X button for unlocking

    // Create chord layout
    const chord = d3.chord()
      .padAngle(0.02)
      .sortSubgroups(d3.descending)

    const chords = chord(chordData.matrix)

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius - 58) // Made thinner by reducing outer radius

    // Create ribbon generator
    const ribbon = d3.ribbon()
      .radius(innerRadius)

    // Color scales - Keep vibrant colors for arcs in both themes
    const testamentColors = {
      'OT': '#8b5cf6', // Vibrant purple for Old Testament
      'NT': '#06b6d4', // Vibrant cyan for New Testament
      'current': '#ef4444' // Vibrant red for current book highlight
    }

    // Keep original vibrant color interpolation for arcs
    const getBookColor = (index) => {
      if (chordData.currentBookIndex !== -1 && index === chordData.currentBookIndex) {
        return testamentColors.current
      }
      
      const bookName = chordData.books[index]
      const bibleBookIndex = bibleBooks.indexOf(bookName)
      const testament = getTestamentForBook(bookName, bibleBooks)
      const isOT = testament === 'OT'
      
      // Create gradients within each testament - always vibrant
      if (isOT) {
        // Purple gradient for OT (0-38) - always vibrant
        const otProgress = bibleBookIndex / 38
        return d3.interpolate('#8b5cf6', '#c084fc')(otProgress)
      } else {
        // Cyan gradient for NT (39-65) - always vibrant
        const ntProgress = (bibleBookIndex - 39) / 26
        return d3.interpolate('#06b6d4', '#67e8f9')(ntProgress)
      }
    }

    // Determine testament for each book (works with both English and Spanish)
    // (keeping for backward compatibility but could be replaced)
    // const getTestament = (bibleBookIndex) => bibleBookIndex < 39 ? 'OT' : 'NT'

    // Create groups (book arcs)
    const group = g.append('g')
      .selectAll('g')
      .data(chords.groups)
      .enter().append('g')

    // Draw book arcs
    group.append('path')
      .style('fill', (d, i) => getBookColor(i))
      .style('stroke', '#ffffff')
      .style('stroke-width', 2)
      .attr('d', arc as any)
      .style('opacity', 0.85)
      .style('cursor', (d, i) => {
        // Only show pointer cursor for non-current books in single verse mode
        return (chordData.currentBookIndex !== -1 && i === chordData.currentBookIndex) ? 'default' : 'pointer'
      })
      .style('filter', isDark ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))' : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))')
      .on('mouseover', function(event, d) {
        // Check if any ribbon is locked before applying hover effects
        const lockedRibbon = d3.select('body').property('lockedRibbon')
        
        d3.select(this)
          .style('opacity', 1)
          .style('stroke-width', 3)
          .style('filter', isDark ? 'drop-shadow(3px 3px 6px rgba(0,0,0,0.6))' : 'drop-shadow(3px 3px 6px rgba(0,0,0,0.3))')

        // Use the same clean hover behavior for both modes
        const bookName = chordData.books[d.index]
        
        if (!lockedRibbon) {
          // Normal hover behavior when nothing is locked
          // Dim all arcs and ribbons
          g.selectAll('g path').style('opacity', 0.15)
          g.selectAll('g').selectAll('path').style('opacity', 0.15)
          
          // Highlight the hovered arc
          d3.select(this).style('opacity', 1)
          
          // Highlight ribbons connected to this book
          g.selectAll('.chord-ribbon')
            .style('opacity', function(ribbonD: any) {
              return (ribbonD.source.index === d.index || ribbonD.target.index === d.index) ? 0.9 : 0.05
            })
            .style('stroke-width', function(ribbonD: any) {
              return (ribbonD.source.index === d.index || ribbonD.target.index === d.index) ? 1.5 : 0.5
            })
          
          // Highlight connected book arcs
          chords.forEach(chord => {
            if (chord.source.index === d.index || chord.target.index === d.index) {
              const connectedIndex = chord.source.index === d.index ? chord.target.index : chord.source.index
              g.selectAll('g path').filter((_, i) => i === connectedIndex)
                .style('opacity', 0.8)
            }
          })
        } else {
          // When a ribbon is locked, don't change other visual states
          // Just highlight this arc without affecting the locked state
          d3.select(this).style('opacity', 1)
        }
        
        // Show simple tooltip with book name only (but remove any existing book tooltips first)
        // Don't remove locked ribbon tooltips
        d3.selectAll('.chord-tooltip').each(function() {
          const tooltip = d3.select(this)
          // Check if this tooltip contains the unlock button (indicates it's a locked ribbon tooltip)
          if (tooltip.select('#unlock-btn').empty()) {
            // This is a book tooltip, safe to remove
            tooltip.remove()
          }
        })
        
        const tooltip = d3.select('body').append('div')
          .attr('class', 'chord-tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.95)')
          .style('color', isDark ? '#f1f5f9' : 'white')
          .style('padding', '8px 12px')
          .style('border-radius', '6px')
          .style('font-size', '13px')
          .style('pointer-events', 'none')
          .style('font-weight', 'bold')
          .style('z-index', '999') // Lower z-index than locked tooltips
          .html(bookName)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 10) + 'px')

        tooltip.transition()
          .duration(200)
          .style('opacity', 1)
      })
      .on('mouseout', function() {
        // Check if any ribbon is locked before resetting styles
        const lockedRibbon = d3.select('body').property('lockedRibbon')
        
        if (lockedRibbon) {
          // If a ribbon is locked, only reset this arc's style but don't interfere with locked state
          d3.select(this)
            .style('opacity', 0.85)
            .style('stroke-width', 2)
            .style('filter', isDark ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))' : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))')
          
          // Don't remove locked tooltip or reset other visual states
          // Only remove non-locked tooltips (book tooltips)
          d3.selectAll('.chord-tooltip').each(function() {
            const tooltip = d3.select(this)
            // Check if this tooltip contains the unlock button (indicates it's a locked ribbon tooltip)
            if (tooltip.select('#unlock-btn').empty()) {
              // This is a book tooltip, safe to remove
              tooltip.remove()
            }
          })
        } else {
          // Use the same clean mouseout behavior for both modes when nothing is locked
          d3.select(this)
            .style('opacity', 0.85)
            .style('stroke-width', 2)
            .style('filter', isDark ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))' : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))')
          
          // Reset all arcs and ribbons to normal opacity
          g.selectAll('g path').style('opacity', 0.85)
          g.selectAll('.chord-ribbon')
            .style('opacity', 0.7)
            .style('stroke-width', 0.5)
          
          // Remove all tooltips
          d3.selectAll('.chord-tooltip').remove()
        }
      })
      .on('click', function(event, d) {
        // Add drill-down functionality like the network diagram
        const bookName = chordData.books[d.index]
        
        // Don't allow clicking on the current book (it would navigate to itself)
        if (chordData.currentBookIndex !== -1 && d.index === chordData.currentBookIndex) {
          return
        }
        
        // Find a representative reference for this book to navigate to
        const bookRefs = referencesWithText.filter(ref => ref.book === bookName)
        if (bookRefs.length > 0) {
          // Navigate to the first reference of this book
          const targetRef = bookRefs[0]
          handleNavigation(targetRef.book, targetRef.chapter, targetRef.verse)
        }
        
        event.stopPropagation()
      })

    // Add book labels
    group.append('text')
      .each((d: any) => { d.angle = (d.startAngle + d.endAngle) / 2 })
      .attr('dy', '.35em')
      .attr('transform', (d: any) => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${radius - 50}) 
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .style('text-anchor', (d: any) => d.angle > Math.PI ? 'end' : null)
      .style('font-size', `${Math.max(9, fontSize - 1)}px`)
      .style('font-weight', (_: any, i: number) => (chordData.currentBookIndex !== -1 && i === chordData.currentBookIndex) ? 'bold' : '500')
      .style('fill', (_: any, i: number) => {
        if (chordData.currentBookIndex !== -1 && i === chordData.currentBookIndex) {
          return '#ef4444'
        }
        const bookName = chordData.books[i]
        const testament = getTestamentForBook(bookName, bibleBooks)
        if (isDark) {
          // Use brighter colors for better visibility in dark mode
          return testament === 'OT' ? '#a78bfa' : '#67e8f9'
        } else {
          return testament === 'OT' ? '#6b21a8' : '#0891b2'
        }
      })
      .style('text-shadow', isDark ? '1px 1px 2px rgba(0,0,0,0.7)' : '1px 1px 2px rgba(0,0,0,0.3)')
      .text((_: any, i: number) => {
        const bookName = chordData.books[i]
        // Abbreviate long book names
        if (bookName.length > 12) {
          return bookName.split(' ').map(word => word.charAt(0)).join('')
        }
        return bookName
      })

    // Draw ribbons (connections)
    g.append('g')
      .selectAll('path')
      .data(chords)
      .enter().append('path')
      .attr('class', 'chord-ribbon')
      .attr('d', ribbon as any)
      .style('cursor', 'pointer')
      .style('fill', d => {
        // Use gradient between source and target colors
        const sourceColor = getBookColor(d.source.index)
        const targetColor = getBookColor(d.target.index)
        
        // Create a linear gradient ID
        const gradientId = `gradient-${d.source.index}-${d.target.index}`
        
        // Create gradient definition
        const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')
        
        const gradient = defs.append('linearGradient')
          .attr('id', gradientId)
          .attr('gradientUnits', 'userSpaceOnUse')
        
        gradient.append('stop')
          .attr('offset', '0%')
          .style('stop-color', sourceColor)
          .style('stop-opacity', 0.8)
        
        gradient.append('stop')
          .attr('offset', '100%')
          .style('stop-color', targetColor)
          .style('stop-opacity', 0.8)
        
        return `url(#${gradientId})`
      })
      .style('opacity', 0.7)
      .style('stroke', '#ffffff')
      .style('stroke-width', 0.5)
      .style('filter', isDark ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))')
      .on('mouseover', function(event, d) {
        // Don't override locked state
        if (d3.select('body').property('lockedRibbon')) {
          d3.select(this).style('cursor', 'default')
          return
        }
        
        d3.select(this)
          .style('opacity', 0.95)
          .style('stroke-width', 1.5)
          .style('filter', isDark ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.25))')

        // Clear any existing timeout
        const timeout = d3.select('body').property('ribbonTooltipTimeout')
        if (timeout) {
          clearTimeout(timeout)
          d3.select('body').property('ribbonTooltipTimeout', null)
        }

        // Remove existing tooltips
        d3.selectAll('.chord-tooltip').remove()

        // Highlight connected books with enhanced visual feedback
        g.selectAll('path').style('opacity', 0.15)
        d3.select(this).style('opacity', 0.95)

        // Highlight connected arcs
        g.selectAll('g path').style('opacity', (arcD, i) => {
          return (i === d.source.index || i === d.target.index) ? 1 : 0.2
        })

        // Show enhanced connection details with actual citations
        const sourceBook = chordData.books[d.source.index]
        const targetBook = chordData.books[d.target.index]
        
        // Find actual references between these two books
        let relevantRefs = []
        if (showAllReferences) {
          // In global mode, find all references between source and target books
          relevantRefs = referencesWithText.filter(ref => {
            const toBook = ref.book
            const fromRef = ref.fromRef || `${currentBook} ${currentChapter}:${currentVerse}`
            const fromMatch = fromRef.match(/^(.+?)\s+\d+:\d+/)
            const fromBook = fromMatch ? fromMatch[1].trim() : currentBook
            
            return (fromBook === sourceBook && toBook === targetBook) ||
                   (fromBook === targetBook && toBook === sourceBook)
          })
        } else {
          // In single verse mode, find references between current book and target
          if (sourceBook === currentBook) {
            relevantRefs = referencesWithText.filter(ref => ref.book === targetBook)
          } else if (targetBook === currentBook) {
            relevantRefs = referencesWithText.filter(ref => ref.book === sourceBook)
          }
        }

        const tooltip = d3.select('body').append('div')
          .attr('class', 'chord-tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', isDark ? 
            'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95))' :
            'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))')
          .style('color', isDark ? '#f1f5f9' : 'white')
          .style('padding', '16px 20px')
          .style('border-radius', '12px')
          .style('font-size', '13px')
          .style('pointer-events', 'auto')
          .style('box-shadow', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)')
          .style('border', isDark ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)')
          .style('backdrop-filter', 'blur(8px)')
          .style('max-width', '450px')
          .style('max-height', '400px')
          .style('z-index', '1000')

        tooltip.transition()
          .duration(250)
          .style('opacity', 1)

        let tooltipContent = `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${getBookColor(d.source.index)};"></div>
            <strong style="font-size: 14px;">${sourceBook}</strong>
            <span style="opacity: 0.7;">↔</span>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${getBookColor(d.target.index)};"></div>
            <strong style="font-size: 14px;">${targetBook}</strong>
          </div>
        `

        if (relevantRefs.length > 0) {
          tooltipContent += `
            <div style="font-size: 12px; margin-bottom: 8px; opacity: 0.8;">
              <strong>${relevantRefs.length} Cross-reference${relevantRefs.length > 1 ? 's' : ''}:</strong>
            </div>
            <div style="font-size: 11px; line-height: 1.4; max-height: 250px; overflow-y: auto; padding-right: 8px;">
          `
          
          // Show up to 8 references to prevent tooltip from being too large
          const refsToShow = relevantRefs.slice(0, 8)
          refsToShow.forEach((ref) => {
            const citationText = showAllReferences ? 
              `${ref.fromRef || `${currentBook} ${currentChapter}:${currentVerse}`} → ${ref.book} ${ref.chapter}:${ref.verse}` :
              `${ref.book} ${ref.chapter}:${ref.verse}`
              
            tooltipContent += `
              <div style="margin-bottom: 6px; padding: 6px; background: rgba(255,255,255,0.08); border-radius: 4px; cursor: pointer; border-left: 3px solid ${getBookColor(d.target.index)};" 
                   data-book="${ref.book}" data-chapter="${ref.chapter}" data-verse="${ref.verse}">
                <div style="font-weight: bold; color: #60a5fa; margin-bottom: 2px; font-size: 10px;">
                  ${citationText}
                </div>
                ${ref.text ? `<div style="opacity: 0.85; font-size: 10px; line-height: 1.3;">${ref.text.length > 120 ? ref.text.substring(0, 120) + '...' : ref.text}</div>` : ''}
              </div>
            `
          })
          
          if (relevantRefs.length > 8) {
            tooltipContent += `<div style="opacity: 0.6; font-style: italic; text-align: center; padding: 4px;">...and ${relevantRefs.length - 8} more</div>`
          }
          
          tooltipContent += `</div>`
        } else {
          tooltipContent += `<div style="font-size: 12px; opacity: 0.7; font-style: italic;">No specific cross-references found</div>`
        }

        // Add lock status indicator to tooltip
        const isLocked = d3.select('body').property('lockedRibbon') && 
          d3.select('body').property('lockedRibbon').source.index === d.source.index &&
          d3.select('body').property('lockedRibbon').target.index === d.target.index
        
        if (isLocked) {
          tooltipContent += `
            <div style="margin-top: 12px; padding: 6px 8px; background: ${isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'}; border-radius: 6px; font-size: 11px; border: 1px solid ${isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)'}; display: flex; align-items: center; justify-content: space-between;">
              <span style="color: ${isDark ? '#86efac' : '#15803d'}; display: flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Locked view
              </span>
              <button id="unlock-btn" style="background: ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}; color: ${isDark ? '#86efac' : '#15803d'}; border: 1px solid ${isDark ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.4)'}; border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; font-weight: bold; margin-left: 8px; transition: all 0.2s ease;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="m7 11V7a5 5 0 0 1 8.5-3.5"/>
                </svg>
              </button>
            </div>
          `
        }

        tooltip.html(tooltipContent)
          .style('left', (event.pageX + 20) + 'px')
          .style('top', (event.pageY - 15) + 'px')

        // Add hover behavior to keep tooltip visible and handle clicks
        tooltip
          .on('mouseenter', function() {
            // Clear any pending timeout when mouse enters tooltip
            const timeout = d3.select('body').property('ribbonTooltipTimeout')
            if (timeout) {
              clearTimeout(timeout)
              d3.select('body').property('ribbonTooltipTimeout', null)
            }
            // Keep tooltip visible when mouse enters
            d3.select(this).style('opacity', 1)
          })
          .on('mouseleave', function() {
            // Never hide tooltip if any ribbon is locked
            if (d3.select('body').property('lockedRibbon')) return
            
            // Hide tooltip when mouse leaves (only if unlocked)
            d3.select(this).remove()
            // Reset ribbon and diagram styling
            g.selectAll('.chord-ribbon')
              .style('opacity', 0.7)
              .style('stroke-width', 0.5)
              .style('filter', isDark ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))')
            
            g.selectAll('path').style('opacity', 0.7)
            g.selectAll('g path').style('opacity', 0.85)
          })
        
        // Add unlock button handler if locked
        if (isLocked) {
          tooltip.select('#unlock-btn').on('click', function(event) {
            event.stopPropagation()
            
            // Unlock
            d3.select('body').property('lockedRibbon', null)
            
            // Reset all styles and restore pointer cursor
            g.selectAll('.chord-ribbon')
              .style('opacity', 0.7)
              .style('stroke-width', 0.5)
              .style('cursor', 'pointer')
              .style('filter', isDark ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))')
            
            g.selectAll('path').style('opacity', 0.7)
            g.selectAll('g path').style('opacity', 0.85)
            
            // Remove tooltip
            d3.selectAll('.chord-tooltip').remove()
          })
        }
      })
      .on('mouseout', function() {
        // Completely skip mouseout behavior if any ribbon is locked
        const lockedRibbon = d3.select('body').property('lockedRibbon')
        if (lockedRibbon) {
          return // Don't do anything when locked
        }
        
        // Don't immediately reset styles or hide tooltip, set a timeout instead
        const timeout = setTimeout(() => {
          d3.select(this)
            .style('opacity', 0.7)
            .style('stroke-width', 0.5)
            .style('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))')
          
          g.selectAll('path').style('opacity', 0.7)
          g.selectAll('g path').style('opacity', 0.85)
          
          // Only remove tooltip if mouse is not over it and nothing is locked
          const tooltip = d3.select('.chord-tooltip').node() as HTMLElement | null
          if (tooltip && !tooltip.matches(':hover') && !d3.select('body').property('lockedRibbon')) {
            d3.selectAll('.chord-tooltip').remove()
          }
        }, 500)
        
        d3.select('body').property('ribbonTooltipTimeout', timeout)
      })
      .on('click', function(event, d) {
        // Check if there's a locked ribbon and if this is not it
        const isCurrentlyLocked = d3.select('body').property('lockedRibbon')
        const isSameRibbon = isCurrentlyLocked && 
          isCurrentlyLocked.source.index === d.source.index && 
          isCurrentlyLocked.target.index === d.target.index
        
        // If there's a locked ribbon and this isn't it, do nothing
        if (isCurrentlyLocked && !isSameRibbon) {
          return
        }
        
        if (isSameRibbon) {
          // Unlock - reset to normal state
          d3.select('body').property('lockedRibbon', null)
          
          // Reset all styles and restore pointer cursor
          g.selectAll('.chord-ribbon')
            .style('opacity', 0.7)
            .style('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .style('filter', isDark ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))')
          
          g.selectAll('path').style('opacity', 0.7)
          g.selectAll('g path').style('opacity', 0.85)
          
          // Remove tooltips
          d3.selectAll('.chord-tooltip').remove()
        } else {
          // Lock this ribbon
          d3.select('body').property('lockedRibbon', d)
          
          // Apply locked visual state (same as hover)
          g.selectAll('path').style('opacity', 0.15)
          g.selectAll('g path').style('opacity', (arcD, i) => {
            return (i === d.source.index || i === d.target.index) ? 1 : 0.2
          })
          
          // Reset all ribbons first and disable cursor
          g.selectAll('.chord-ribbon')
            .style('opacity', 0.05)
            .style('stroke-width', 0.5)
            .style('cursor', 'default')
          
          // Highlight this ribbon but keep default cursor to indicate it's locked
          d3.select(this)
            .style('opacity', 0.95)
            .style('stroke-width', 1.5)
            .style('cursor', 'pointer')  // Only this ribbon keeps pointer cursor
            .style('filter', isDark ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.25))')
          
          // Create tooltip with lock indicator immediately
          const sourceBook = chordData.books[d.source.index]
          const targetBook = chordData.books[d.target.index]
          
          // Remove existing tooltips first
          d3.selectAll('.chord-tooltip').remove()
          
          // Find relevant references for the locked connection
          let relevantRefs = []
          if (showAllReferences) {
            relevantRefs = referencesWithText.filter(ref => {
              const toBook = ref.book
              const fromRef = ref.fromRef || `${currentBook} ${currentChapter}:${currentVerse}`
              const fromMatch = fromRef.match(/^(.+?)\s+\d+:\d+/)
              const fromBook = fromMatch ? fromMatch[1].trim() : currentBook
              
              return (fromBook === sourceBook && toBook === targetBook) ||
                     (fromBook === targetBook && toBook === sourceBook)
            })
          } else {
            if (sourceBook === currentBook) {
              relevantRefs = referencesWithText.filter(ref => ref.book === targetBook)
            } else if (targetBook === currentBook) {
              relevantRefs = referencesWithText.filter(ref => ref.book === sourceBook)
            }
          }
          
          // Create locked tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'chord-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', isDark ? 
              'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95))' :
              'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))')
            .style('color', isDark ? '#f1f5f9' : 'white')
            .style('padding', '16px 20px')
            .style('border-radius', '12px')
            .style('font-size', '13px')
            .style('pointer-events', 'auto')
            .style('box-shadow', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)')
            .style('border', isDark ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)')
            .style('backdrop-filter', 'blur(8px)')
            .style('max-width', '450px')
            .style('max-height', '400px')
            .style('z-index', '1000')
          
          let tooltipContent = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; position: relative;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${getBookColor(d.source.index)};"></div>
              <strong style="font-size: 14px;">${sourceBook}</strong>
              <span style="opacity: 0.7;">↔</span>
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${getBookColor(d.target.index)};"></div>
              <strong style="font-size: 14px;">${targetBook}</strong>
              <button id="unlock-btn" style="position: absolute; top: -4px; right: -4px; background: ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}; color: ${isDark ? '#86efac' : '#15803d'}; border: 1px solid ${isDark ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.4)'}; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; padding: 4px; line-height: 1; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="m7 11V7a5 5 0 0 1 8.5-3.5"/>
                </svg>
              </button>
            </div>
          `
          
          if (relevantRefs.length > 0) {
            tooltipContent += `
              <div style="font-size: 12px; margin-bottom: 8px; opacity: 0.8;">
                <strong>${relevantRefs.length} Cross-reference${relevantRefs.length > 1 ? 's' : ''}:</strong>
              </div>
              <div style="font-size: 11px; line-height: 1.4; max-height: 250px; overflow-y: auto; padding-right: 8px;">
            `
            
            const refsToShow = relevantRefs.slice(0, 8)
            refsToShow.forEach((ref) => {
              const citationText = showAllReferences ? 
                `${ref.fromRef || `${currentBook} ${currentChapter}:${currentVerse}`} → ${ref.book} ${ref.chapter}:${ref.verse}` :
                `${ref.book} ${ref.chapter}:${ref.verse}`
                
              tooltipContent += `
                <div style="margin-bottom: 6px; padding: 6px; background: rgba(255,255,255,0.08); border-radius: 4px; cursor: pointer; border-left: 3px solid ${getBookColor(d.target.index)};" 
                     data-book="${ref.book}" data-chapter="${ref.chapter}" data-verse="${ref.verse}">
                  <div style="font-weight: bold; color: #60a5fa; margin-bottom: 2px; font-size: 10px;">
                    ${citationText}
                  </div>
                  ${ref.text ? `<div style="opacity: 0.85; font-size: 10px; line-height: 1.3;">${ref.text.length > 120 ? ref.text.substring(0, 120) + '...' : ref.text}</div>` : ''}
                </div>
              `
            })
            
            if (relevantRefs.length > 8) {
              tooltipContent += `<div style="opacity: 0.6; font-style: italic; text-align: center; padding: 4px;">...and ${relevantRefs.length - 8} more</div>`
            }
            
            tooltipContent += `</div>`
          } else {
            tooltipContent += `<div style="font-size: 12px; opacity: 0.7; font-style: italic;">No specific cross-references found</div>`
          }
          
          // Add subtle locked indicator at the bottom
          tooltipContent += `
            <div style="margin-top: 8px; padding: 4px 8px; background: ${isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)'}; border-radius: 4px; font-size: 10px; text-align: center; opacity: 0.8; border: 1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)'}; color: ${isDark ? '#86efac' : '#15803d'}; display: flex; align-items: center; justify-content: center; gap: 4px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Locked view
            </div>
          `
          
          tooltip.html(tooltipContent)
            .style('left', (event.pageX + 20) + 'px')
            .style('top', (event.pageY - 15) + 'px')
            .transition()
            .duration(250)
            .style('opacity', 1)
          
          // Add persistent tooltip behavior for locked state
          tooltip
            .on('mouseenter', function() {
              // Clear any pending timeout when mouse enters tooltip
              const timeout = d3.select('body').property('ribbonTooltipTimeout')
              if (timeout) {
                clearTimeout(timeout)
                d3.select('body').property('ribbonTooltipTimeout', null)
              }
              d3.select(this).style('opacity', 1)
            })
            .on('mouseleave', function() {
              // Don't hide locked tooltips when mouse leaves
              // They can only be closed via the X button
            })
          
          // Add unlock button handler
          tooltip.select('#unlock-btn').on('click', function(unlockEvent) {
            unlockEvent.stopPropagation()
            
            // Unlock
            d3.select('body').property('lockedRibbon', null)
            
            // Reset all styles and restore pointer cursor
            g.selectAll('.chord-ribbon')
              .style('opacity', 0.7)
              .style('stroke-width', 0.5)
              .style('cursor', 'pointer')
              .style('filter', isDark ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' : 'drop-shadow(1px 1px 2px rgba(0,0,0,0.15))')
            
            g.selectAll('path').style('opacity', 0.7)
            g.selectAll('g path').style('opacity', 0.85)
            
            // Remove tooltip
            d3.selectAll('.chord-tooltip').remove()
          })
        }
        
        event.stopPropagation()
      })

    // Add center label with enhanced styling
    g.append('circle')
      .attr('r', 35)
      .style('fill', isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.95)')
      .style('stroke', '#ef4444')
      .style('stroke-width', 2)
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')

    // Center text - show different content for "show all" vs single verse mode
    if (showAllReferences) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .style('font-size', `${Math.min(fontSize + 2, 14)}px`)
        .style('font-weight', 'bold')
        .style('fill', '#ef4444')
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
        .text('Bible')
      
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1em')
        .style('font-size', `${Math.min(fontSize, 12)}px`)
        .style('font-weight', '500')
        .style('fill', isDark ? '#f1f5f9' : '#ffffff')
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
        .text('Cross References')
    } else {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .style('font-size', `${Math.min(fontSize + 2, 14)}px`)
        .style('font-weight', 'bold')
        .style('fill', '#ef4444')
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
        .text(`${currentBook}`)
      
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1em')
        .style('font-size', `${Math.min(fontSize, 12)}px`)
        .style('font-weight', '500')
        .style('fill', isDark ? '#f1f5f9' : '#ffffff')
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
        .text(`${currentChapter}:${currentVerse}`)
    }

    // Add global click handler for verse citations in tooltips
    d3.select('body').on('click.chord-tooltip', function(event) {
      const target = event.target.closest('[data-book][data-chapter][data-verse]')
      if (target) {
        const book = target.getAttribute('data-book')
        const chapter = parseInt(target.getAttribute('data-chapter'))
        const verse = parseInt(target.getAttribute('data-verse'))
        handleNavigation(book, chapter, verse)
        d3.selectAll('.chord-tooltip').remove()
      }
    })

    // Cleanup function to ensure state is cleared properly
    return () => {
      // Clear any pending timeouts
      const timeout = d3.select('body').property('ribbonTooltipTimeout')
      if (timeout) {
        clearTimeout(timeout)
        d3.select('body').property('ribbonTooltipTimeout', null)
      }
      
      // Clear locked state
      d3.select('body').property('lockedRibbon', null)
      
      // Remove tooltips
      d3.selectAll('.chord-tooltip').remove()
    }

  }, [chordData, dimensions, fontSize, currentBook, currentChapter, currentVerse, handleNavigation, referencesWithText, bibleBooks, isDark, showAllReferences])

  // Update dimensions on resize
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateDimensions = () => {
      const container = svgRef.current?.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        setDimensions({
          width: Math.max(500, rect.width - 40),
          height: Math.max(500, Math.min(rect.width - 40, 600))
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Cleanup global event listener on unmount
  useEffect(() => {
    return () => {
      d3.select('body').on('click.chord-tooltip', null)
    }
  }, [])

  if (!chordData) {
    return (
      <div className={`chord-diagram-container ${isDark ? 'dark' : ''}`}>
        <div className="chord-diagram-header">
          <h4>Bible Cross-Reference Diagram</h4>
        </div>
        <div className="chord-diagram-empty">
          <p>No cross-references to visualize</p>
          <p>Navigate to a verse with cross-references to see the diagram</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`chord-diagram-container ${isDark ? 'dark' : ''}`}>
      <div className="chord-diagram-header">
        <h4>Bible Cross-Reference Diagram</h4>
        <div className="chord-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
            <span>Old Testament</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#06b6d4' }}></div>
            <span>New Testament</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Current Book</span>
          </div>
        </div>
      </div>

      {navigationHistory && navigationHistory.length > 0 && (
        <div className="chord-breadcrumb">
          <div className="breadcrumb-trail">
            {navigationHistory.map((item, index) => (
              <span key={index} className="breadcrumb-item">
                {index > 0 && <span className="breadcrumb-separator">→</span>}
                <button
                  className={`breadcrumb-link ${index === navigationHistory.length - 1 ? 'current' : ''}`}
                  onClick={() => {
                    if (index < navigationHistory.length - 1) {
                      // Navigate back to this point in history
                      handleNavigation(item.book, item.chapter, item.verse, index + 1)
                    }
                  }}
                  disabled={index === navigationHistory.length - 1}
                >
                  {item.book} {item.chapter}:{item.verse}
                </button>
              </span>
            ))}
          </div>
          {navigationHistory.length > 1 && (
            <button
              className="breadcrumb-back-button"
              onClick={() => {
                if (navigationHistory.length > 1) {
                  const previous = navigationHistory[navigationHistory.length - 2]
                  handleNavigation(previous.book, previous.chapter, previous.verse, navigationHistory.length - 1)
                }
              }}
              title="Go back to previous verse"
            >
              ← Back
            </button>
          )}
        </div>
      )}

      <div className="chord-diagram-wrapper">
        <svg ref={svgRef} />
      </div>

      <div className="chord-controls">
        <div className="graph-interactions">
          <p><strong>Hover over books to see details</strong> • Click on book arcs to drill into references • Drag to pan • Scroll to zoom</p>
        </div>
        <div className="chord-control-buttons">
          <button onClick={resetZoom} type="button"
            className="graph-control-btn">
            Reset Zoom
          </button>
        </div>
      </div>
    </div>
  )
}

export default CrossReferenceChordDiagram
