import type { NextApiRequest, NextApiResponse } from 'next'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const BIBLE_DATA_PREFIX = 'data/bibles'
const CACHE_CONTROL_HEADER = 'public, max-age=3600'

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

const resolveCloudflareEnv = async (): Promise<CloudflareEnv | undefined> => {
  try {
    return getCloudflareContext().env
  } catch {
    try {
      const context = await getCloudflareContext({ async: true })
      return context.env
    } catch {
      return undefined
    }
  }
}

const loadFromR2 = async (importPath: string): Promise<unknown | null> => {
  try {
    const env = await resolveCloudflareEnv()
    const bucket = env?.BIBLE_DATA_BUCKET
    if (!bucket) {
      return null
    }

    const objectKey = `${BIBLE_DATA_PREFIX}/${importPath}.json`
    const object = await bucket.get(objectKey)
    if (!object) {
      return null
    }

    const contents = await object.text()
    return JSON.parse(contents)
  } catch (error) {
    console.error(`Error fetching bible data from R2 for path: ${importPath}`, error)
    return null
  }
}

const loadFromFilesystem = async (importPath: string): Promise<unknown | null> => {
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  try {
    const { readFile } = await import('node:fs/promises')
    const pathModule = await import('node:path')
    const filePath = pathModule.join(process.cwd(), 'data', 'bibles', `${importPath}.json`)
    const fileContents = await readFile(filePath, 'utf-8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error(`Error reading local bible file for path: ${importPath}`, error)
    return null
  }
}

const loadBibleData = async (importPath: string): Promise<unknown | null> => {
  if (process.env.NODE_ENV !== 'production') {
    const fromFilesystem = await loadFromFilesystem(importPath)
    if (fromFilesystem) {
      return fromFilesystem
    }
  }

  return loadFromR2(importPath)
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
    const bibleData = await loadBibleData(importPath)
    if (!bibleData) {
      res.status(404).json({ error: 'Bible not found' })
      return
    }

    res.setHeader('Cache-Control', CACHE_CONTROL_HEADER)
    res.status(200).json(bibleData)
  } catch (error) {
    console.error(`Error loading bible data for path: ${importPath}`, error)
    res.status(500).json({ error: 'Failed to load bible' })
  }
}
