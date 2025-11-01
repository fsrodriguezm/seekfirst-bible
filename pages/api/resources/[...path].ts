import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const RESOURCES_ROOT = path.join(process.cwd(), 'data', 'resources')

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

const resolveResourcePath = (segments: string[]): { filePath: string; mimeType: string } => {
  const resolvedPath = path.join(RESOURCES_ROOT, ...segments)
  const normalizedPath = path.normalize(resolvedPath)

  if (!normalizedPath.startsWith(RESOURCES_ROOT)) {
    throw new Error('Invalid path')
  }

  const extension = path.extname(normalizedPath)
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error('Unsupported file type')
  }

  const mimeType = MIME_MAP[extension] ?? 'application/octet-stream'

  return { filePath: normalizedPath, mimeType }
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

  let resolved: { filePath: string; mimeType: string }
  try {
    resolved = resolveResourcePath(pathSegments)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
    return
  }

  try {
    const fileBuffer = await fs.readFile(resolved.filePath)
    res.setHeader('Content-Type', resolved.mimeType)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(fileBuffer)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      res.status(404).json({ error: 'Resource not found' })
      return
    }

    console.error(`Error loading resource at ${resolved.filePath}`, error)
    res.status(500).json({ error: 'Failed to load resource' })
  }
}
