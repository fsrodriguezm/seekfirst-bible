import type { NextApiRequest, NextApiResponse } from 'next'

const isValidSegment = (segment: string): boolean =>
  segment.length > 0 && !segment.includes('..') && !segment.startsWith('.')

const buildImportPath = (segments: string[]): string => {
  const normalizedSegments = [...segments]
  const lastIndex = normalizedSegments.length - 1
  const lastSegment = normalizedSegments[lastIndex]
  
  // Remove .json extension if present for the import path
  normalizedSegments[lastIndex] = lastSegment.endsWith('.json') 
    ? lastSegment.slice(0, -5) 
    : lastSegment

  return normalizedSegments.join('/')
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).end('Method Not Allowed')
    return
  }

  const rawPath = req.query.path
  const pathSegments = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : []

  if (!pathSegments.length || pathSegments.some((segment) => !isValidSegment(segment))) {
    res.status(400).json({ error: 'Invalid path' })
    return
  }

  const importPath = buildImportPath(pathSegments)

  try {
    // Dynamically import the JSON file from the data/bibles directory
    const bibleData = await import(`../../../data/bibles/${importPath}.json`)
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).json(bibleData.default || bibleData)
  } catch (error) {
    console.error(`Error loading bible file for path: ${importPath}`, error)
    res.status(404).json({ error: 'Bible not found' })
  }
}
