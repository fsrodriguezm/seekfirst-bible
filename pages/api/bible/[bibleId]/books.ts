import type { NextApiRequest, NextApiResponse } from 'next'

const BIBLE_API_BASE_URL = 'https://rest.api.bible/v1'

interface BibleBook {
  id: string
  bibleId: string
  abbreviation: string
  name: string
  nameLong: string
}

interface BibleBooksResponse {
  data: BibleBook[]
}

interface ApiErrorResponse {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BibleBooksResponse | ApiErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bibleId } = req.query

  if (!bibleId || typeof bibleId !== 'string') {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const apiKey = process.env.BIBLE_API_KEY

  if (!apiKey) {
    console.error('BIBLE_API_KEY environment variable is not set')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const url = `${BIBLE_API_BASE_URL}/bibles/${bibleId}/books`

    const response = await fetch(url, {
      headers: {
        'api-key': apiKey,
      },
    })

    if (!response.ok) {
      console.error(`Bible API request failed: ${response.status} ${response.statusText}`)
      return res.status(response.status).json({
        error: `Failed to fetch books: ${response.statusText}`
      })
    }

    const data = await response.json() as BibleBooksResponse

    // Set cache headers for better performance (books don't change)
    res.setHeader('Cache-Control', 'public, s-maxage=2592000, stale-while-revalidate=604800') // 30 days

    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching books from Bible API:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
