import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const BIBLES_ROOT = path.join(process.cwd(), 'data', 'bibles')

const isValidSegment = (segment: string): boolean =>
  segment.length > 0 && !segment.includes('..') && !segment.startsWith('.')

const buildFilePath = (segments: string[]): string => {
  const normalizedSegments = [...segments]
  const lastIndex = normalizedSegments.length - 1
  const lastSegment = normalizedSegments[lastIndex]
  normalizedSegments[lastIndex] = lastSegment.endsWith('.json') ? lastSegment : `${lastSegment}.json`

  const resolvedPath = path.join(BIBLES_ROOT, ...normalizedSegments)
  const normalizedPath = path.normalize(resolvedPath)

  if (!normalizedPath.startsWith(BIBLES_ROOT)) {
    throw new Error('Invalid path')
  }

  return normalizedPath
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

  let filePath: string
  try {
    filePath = buildFilePath(pathSegments)
  } catch {
    res.status(400).json({ error: 'Invalid path' })
    return
  }

  try {
    const fileContents = await fs.readFile(filePath, 'utf8')
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(fileContents)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      res.status(404).json({ error: 'Bible not found' })
      return
    }

    console.error(`Error loading bible file at ${filePath}`, error)
    res.status(500).json({ error: 'Failed to load bible data' })
  }
}
