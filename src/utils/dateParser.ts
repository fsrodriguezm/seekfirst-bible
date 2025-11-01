/**
 * Parse date strings from book-metadata.json into numeric years for timeline visualization
 * Handles formats like:
 * - "c. 1446–1400 BC"
 * - "AD 62–64"
 * - "AD 95"
 * - "1050–1000 BC"
 */
export const parseDateToYear = (dateString: string | null | undefined): number | null => {
  if (!dateString) return null
  
  // Remove "c." (circa) prefix
  let cleaned = dateString.replace(/^c\.\s*/, '')
  
  // Check if it's BC or AD
  const isBC = cleaned.includes('BC')
  
  // Remove BC/AD markers
  cleaned = cleaned.replace(/\s*(BC|AD)/g, '')
  
  // Extract the first year from ranges (e.g., "1446–1400" -> "1446")
  // Handle both regular dash and en-dash
  const yearMatch = cleaned.match(/(\d+)/)
  
  if (!yearMatch) return null
  
  let year = parseInt(yearMatch[1])
  
  // Convert BC years to negative numbers
  if (isBC) {
    year = -year
  }
  
  return year
}

/**
 * Get a representative year for a date range (middle point)
 */
export const getMiddleYear = (dateString: string | null | undefined): number | null => {
  if (!dateString) return null
  
  // Remove "c." prefix
  let cleaned = dateString.replace(/^c\.\s*/, '')
  
  const isBC = cleaned.includes('BC')
  cleaned = cleaned.replace(/\s*(BC|AD)/g, '')
  
  // Extract both years from a range
  const rangeMatch = cleaned.match(/(\d+)[–-](\d+)/)
  
  if (rangeMatch) {
    const year1 = parseInt(rangeMatch[1])
    const year2 = parseInt(rangeMatch[2])
    const middle = Math.round((year1 + year2) / 2)
    return isBC ? -middle : middle
  }
  
  // Single year
  const yearMatch = cleaned.match(/(\d+)/)
  if (!yearMatch) return null
  
  const year = parseInt(yearMatch[1])
  return isBC ? -year : year
}

/**
 * Format a year for display
 */
export const formatYear = (year: number): string => {
  if (year < 0) {
    return `${Math.abs(year)} BC`
  } else if (year > 0) {
    return `AD ${year}`
  }
  return String(year)
}
