import type { NextApiRequest, NextApiResponse } from 'next'

type ExplanationRequest = {
  systemContent?: string
  userPrompt?: string
}

type ExplanationSection = {
  title: string
  content: string
  bulletPoints?: string[]
  scriptureReferences?: string[]
}

type SectionKey =
  | 'context'
  | 'originalLanguage'
  | 'wordStudy'
  | 'explanation'
  | 'crossReferences'
  | 'application'
  | 'reflectionQuestions'

type ExplanationSections = Record<SectionKey, ExplanationSection>

type StructuredExplanation = {
  sections: ExplanationSections
  metadata?: {
    explanationType?: 'chapter' | 'verses'
    language?: 'english' | 'spanish'
    reference?: string
  }
}

type ExplanationResponse = {
  content?: StructuredExplanation
  error?: string
}

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL_NAME = 'meta-llama/llama-4-scout-17b-16e-instruct'

const createSectionSchema = (title: string) => ({
  type: 'object',
  properties: {
    title: {
      type: 'string',
      const: title
    },
    content: {
      type: 'string'
    },
    bulletPoints: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    scriptureReferences: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: ['title', 'content'],
  additionalProperties: false
})

const explanationSchema = {
  name: 'structured_bible_explanation',
  schema: {
    type: 'object',
    properties: {
      metadata: {
        type: 'object',
        properties: {
          explanationType: {
            type: 'string',
            enum: ['chapter', 'verses']
          },
          language: {
            type: 'string',
            enum: ['english', 'spanish']
          },
          reference: {
            type: 'string',
            description: 'The Bible reference covered in the explanation.'
          }
        },
        additionalProperties: false
      },
      sections: {
        type: 'object',
        description: 'Structured explanation sections keyed by canonical section name.',
        properties: {
          context: createSectionSchema('Context'),
          originalLanguage: createSectionSchema('Original Language'),
          wordStudy: createSectionSchema("Word Study"),
          explanation: createSectionSchema('Explanation'),
          crossReferences: createSectionSchema('Cross-References'),
          application: createSectionSchema('Application'),
          reflectionQuestions: createSectionSchema('Reflection / Questions')
        },
        required: [
          'context',
          'originalLanguage',
          'wordStudy',
          'explanation',
          'crossReferences',
          'application',
          'reflectionQuestions'
        ],
        additionalProperties: false
      }
    },
    required: ['sections'],
    additionalProperties: false
  }
}

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
        stream: false,
        response_format: {
          type: 'json_schema',
          json_schema: explanationSchema
        }
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

    let parsedContent: StructuredExplanation

    try {
      parsedContent = JSON.parse(content) as StructuredExplanation
    } catch (error) {
      return res.status(500).json({ error: 'Groq response was not valid JSON for the requested schema.' })
    }

    return res.status(200).json({ content: parsedContent })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: `Failed to fetch explanation: ${message}` })
  }
}
