import type { NextApiRequest, NextApiResponse } from 'next'

const ALLOWED_EXTENSIONS = new Set([
  '.json',
  '.db',
  '.txt',
  '.md',
  '.ont',
])

const MIME_MAP: Record<string, string> = {
  '.json': 'application/json',
  '.db': 'application/octet-stream',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.ont': 'text/plain; charset=utf-8',
}

const isValidSegment = (segment: string): boolean =>
  segment.length > 0 && !segment.includes('..') && !segment.startsWith('.')

const getFileExtension = (filename: string): string => {
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex >= 0 ? filename.substring(dotIndex) : ''
}

const buildImportPath = (segments: string[]): { path: string; extension: string } => {
  const filename = segments[segments.length - 1]
  const extension = getFileExtension(filename)
  
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error('Unsupported file type')
  }

  // For JSON files, remove the extension for the import
  if (extension === '.json') {
    const segmentsCopy = [...segments]
    segmentsCopy[segmentsCopy.length - 1] = filename.slice(0, -5)
    return { path: segmentsCopy.join('/'), extension }
  }

  return { path: segments.join('/'), extension }
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

  let resolved: { path: string; extension: string }
  try {
    resolved = buildImportPath(pathSegments)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
    return
  }

  const mimeType = MIME_MAP[resolved.extension] ?? 'application/octet-stream'

  try {
    // For JSON files, use dynamic import
    if (resolved.extension === '.json') {
      const resourceData = await import(`../../../data/resources/${resolved.path}.json`)
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.status(200).json(resourceData.default || resourceData)
      return
    }

    // For other file types (.db, .txt, .md, .ont), they need different handling
    // For now, return an error as these can't be dynamically imported
    res.status(501).json({ error: 'File type not yet supported in edge runtime' })
  } catch (error) {
    console.error(`Error loading resource for path: ${resolved.path}`, error)
    res.status(404).json({ error: 'Resource not found' })
  }
}
