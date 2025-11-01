import type { NextApiRequest, NextApiResponse } from 'next'

type ExplanationRequest = {
  systemContent?: string
  userPrompt?: string
}

type ExplanationResponse = {
  content?: string
  error?: string
}

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL_NAME = 'meta-llama/llama-4-scout-17b-16e-instruct'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExplanationResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ API key is not configured on the server.' })
  }

  const { systemContent, userPrompt } = req.body as ExplanationRequest

  if (!systemContent || !userPrompt) {
    return res.status(400).json({ error: 'systemContent and userPrompt are required.' })
  }

  try {
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userPrompt }
        ],
        model: MODEL_NAME,
        temperature: 0.7,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false
      })
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      return res.status(groqResponse.status).json({ error: errorText || 'Unexpected error from Groq API.' })
    }

    const data = await groqResponse.json()
    const content: string | undefined = data?.choices?.[0]?.message?.content

    if (!content) {
      return res.status(500).json({ error: 'Unexpected response format from Groq API.' })
    }

    return res.status(200).json({ content })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: `Failed to fetch explanation: ${message}` })
  }
}
