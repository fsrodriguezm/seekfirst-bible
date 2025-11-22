import type { NextApiRequest, NextApiResponse } from 'next'

const BIBLE_API_BASE_URL = 'https://rest.api.bible/v1'

interface BibleApiChapter {
  id: string
  bibleId: string
  number: string
  bookId: string
  reference: string
  content: string
  copyright?: string
  verseCount: number
}

interface BibleApiResponse {
  data: BibleApiChapter
  meta: {
    fumsToken?: string
  }
}

interface ApiErrorResponse {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BibleApiResponse | ApiErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bibleId, chapterId } = req.query

  if (!bibleId || !chapterId || typeof bibleId !== 'string' || typeof chapterId !== 'string') {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const apiKey = process.env.BIBLE_API_KEY

  if (!apiKey) {
    console.error('BIBLE_API_KEY environment variable is not set')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const url = `${BIBLE_API_BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`

    const response = await fetch(url, {
      headers: {
        'api-key': apiKey,
      },
    })

    if (!response.ok) {
      console.error(`Bible API request failed: ${response.status} ${response.statusText}`)
      return res.status(response.status).json({
        error: `Failed to fetch chapter: ${response.statusText}`
      })
    }

    const data = await response.json() as BibleApiResponse

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')

    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching chapter from Bible API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
