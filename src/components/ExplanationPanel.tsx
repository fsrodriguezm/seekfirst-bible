import { useState, useEffect, useCallback } from 'react'
import { Copy, BookOpen, Loader, RefreshCw } from 'lucide-react'

type ExplanationPanelProps = {
  selectedVerses: string[]
  currentChapter: string | null
  allVerses: Record<string, string> | null
  fontSize?: number
  language?: 'english' | 'spanish'
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

type ExplanationContent = {
  sections: ExplanationSections
  metadata?: {
    explanationType?: 'chapter' | 'verses'
    language?: 'english' | 'spanish'
    reference?: string
  }
}

const SECTION_DISPLAY_ORDER: Array<{ key: SectionKey; label: string }> = [
  { key: 'context', label: 'Context' },
  { key: 'originalLanguage', label: 'Original Language' },
  { key: 'wordStudy', label: 'Word Study' },
  { key: 'explanation', label: 'Explanation' },
  { key: 'crossReferences', label: 'Cross-References' },
  { key: 'application', label: 'Application' },
  { key: 'reflectionQuestions', label: 'Reflection / Questions' }
]

const buildSectionInstruction = (scope: 'chapter' | 'verses') => {
  const scopeLabel = scope === 'chapter' ? 'chapter' : 'verse(s)'

  return `Always respond with JSON that conforms to the provided schema. Populate the "sections" object with the following keys, keeping each title exactly as written. Use approachable, pastoral language while staying faithful to the text. Keep paragraphs concise but personal. Include bullet points only when they sharpen clarity, and always include the Application section even if it is brief.

1. context → title "Context" – Historical and narrative background of the ${scopeLabel}.
2. originalLanguage → title "Original Language" – Provide the original Greek or Hebrew, a literal translation, and key grammatical/lexical insights.
3. wordStudy → title "Word Study" – Define key terms using Strong's Concordance, and show where else those words appear in Scripture.
4. explanation → title "Explanation" – Pull together the above insights to explain the ${scopeLabel} clearly.
5. crossReferences → title "Cross-References" – List related Scriptures that help clarify the meaning.
6. application → title "Application" – State a principle or insight for today's believer that flows directly from the passage.
7. reflectionQuestions → title "Reflection / Questions" – Invite the reader to think prayerfully and critically about the passage.`
}

const ExplanationPanel = ({
  selectedVerses,
  currentChapter,
  allVerses,
  fontSize = 16,
  language = 'english'
}: ExplanationPanelProps) => {
  const [explanation, setExplanation] = useState<ExplanationContent | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [explanationType, setExplanationType] = useState<'chapter' | 'verses'>('chapter')

  const makeAPICall = useCallback(async (
    systemContent: string,
    userPrompt: string,
    options: { explanationType: 'chapter' | 'verses'; reference?: string }
  ) => {
    const response = await fetch('/api/explanation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemContent,
        userPrompt
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data: { content?: ExplanationContent; error?: string } = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    if (data.content) {
      setExplanation({
        ...data.content,
        metadata: {
          explanationType: options.explanationType,
          language,
          reference: options.reference,
          ...data.content.metadata
        }
      })
    } else {
      throw new Error('Unexpected response format from API')
    }
  }, [language])

  const fetchChapterExplanationViaVersesFunction = useCallback(async (chapterReference: string) => {
    setIsLoading(true)
    setError('')
    setExplanation(null)

    try {
  const langInstruction = language === 'spanish' ? 'Responde en español.' : 'Respond in English.'

  const systemContent = `${langInstruction} You are a Bible expositor who explains Scripture using precise grammatical-historical exegesis. 
Your method is rooted in the original Hebrew or Greek, the literary and covenantal context of the passage, 
and cross-referencing other parts of Scripture. You do not include commentary from theologians, denominations, 
or church tradition. You must explain the original intent of the passage as it would have been understood by 
its first recipients.

${buildSectionInstruction('chapter')}`

  const userPrompt = `${langInstruction} Please exegete and explain the following chapter using the 7-section format. Fill the JSON schema fields precisely:\n\n${chapterReference}`

      await makeAPICall(systemContent, userPrompt, {
        explanationType: 'chapter',
        reference: chapterReference
      })
    } catch (err) {
      setError(`Error fetching chapter explanation: ${err.message}`)
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [language, makeAPICall])

  const fetchVersesExplanation = useCallback(async (chapterReference: string | null = null) => {
    // If chapterReference is provided, handle chapter explanation
    if (chapterReference) {
      return await fetchChapterExplanationViaVersesFunction(chapterReference)
    }
    
    // Original verse explanation logic
    if (!selectedVerses || selectedVerses.length === 0) return
    
    setIsLoading(true)
    setError('')
    setExplanation(null)

    try {
      const joinedVerses = selectedVerses.join('\n')
      
  const langInstruction = language === 'spanish' ? 'Responde en español.' : 'Respond in English.'

  const systemContent = `${langInstruction} You are a Bible expositor who explains Scripture using precise grammatical-historical exegesis. 
Your method is rooted in the original Hebrew or Greek, the literary and covenantal context of the passage, 
and cross-referencing other parts of Scripture. You do not include commentary from theologians, denominations, 
or church tradition. You must explain the original intent of the passage as it would have been understood by 
its first recipients.

${buildSectionInstruction('verses')}`

  const userPrompt = `${langInstruction} Please exegete and explain the following verse(s) using the 7-section format. Fill the JSON schema fields precisely:\n\n${joinedVerses}`

      await makeAPICall(systemContent, userPrompt, {
        explanationType: 'verses'
      })
    } catch (err) {
      setError(`Error fetching explanation: ${err.message}`)
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedVerses, language, makeAPICall, fetchChapterExplanationViaVersesFunction])

  // Load chapter explanation by default
  useEffect(() => {
    if (currentChapter && allVerses && Object.keys(allVerses).length > 0) {
      fetchVersesExplanation(currentChapter)
    }
  }, [currentChapter, allVerses, fetchVersesExplanation])

  // Update explanation type based on selected verses
  useEffect(() => {
    if (selectedVerses && selectedVerses.length > 0) {
      setExplanationType('verses')
      fetchVersesExplanation()
    } else {
      setExplanationType('chapter')
      if (currentChapter && allVerses && Object.keys(allVerses).length > 0) {
        fetchVersesExplanation(currentChapter)
      }
    }
  }, [selectedVerses, currentChapter, allVerses, fetchVersesExplanation])

  const copyToClipboard = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard || !explanation) return

    navigator.clipboard.writeText(JSON.stringify(explanation, null, 2)).then(() => {
      if (typeof window !== 'undefined') {
        alert('Explanation copied to clipboard!')
      }
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  return (
    <div className="explanation-panel-container card">
      <div className="panel-header">
        <div className="panel-title">
          <BookOpen size={20} />
          <h3>
            {explanationType === 'chapter' ? `${currentChapter} Overview` : `Verse Explanation`}
          </h3>
        </div>
        <div className="panel-actions">
          {explanation && (
            <button className="btn btn-secondary copy-btn" onClick={copyToClipboard}>
              <Copy size={16} />
            </button>
          )}
          <button 
            className="btn btn-secondary refresh-btn" 
            onClick={() => explanationType === 'chapter' ? fetchVersesExplanation(currentChapter) : fetchVersesExplanation()}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div 
        className="panel-content" 
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: '1.6'
        }}
      >
        <div className="ai-disclaimer">
          <strong>Note:</strong> These AI-generated explanations are for learning and reflection. Always pray and seek the Holy Spirit for discernment when interpreting Scripture - only God gives true wisdom (James 1:5).
        </div>

        {selectedVerses && selectedVerses.length > 0 && (
          <div className="selected-verses-summary">
            <h4>Selected Verses ({selectedVerses.length}):</h4>
            <div className="verses-preview">
              {selectedVerses.slice(0, 3).map((verse, index) => (
                <div key={index} className="verse-preview">
                  {verse.split(' ').slice(0, 8).join(' ')}...
                </div>
              ))}
              {selectedVerses.length > 3 && (
                <div className="more-verses">
                  +{selectedVerses.length - 3} more verses
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-section">
            <Loader className="spinner" size={20} />
            <p>Loading explanation...</p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <p className="error-message">{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => explanationType === 'chapter' ? fetchVersesExplanation(currentChapter) : fetchVersesExplanation()}
            >
              Try Again
            </button>
          </div>
        )}

        {explanation && !isLoading && (
          <div className="explanation-content">
            <div className="explanation-sections">
              {SECTION_DISPLAY_ORDER.map(({ key, label }) => {
                const section = explanation.sections[key]
                if (!section) return null

                const paragraphs = section.content
                  .split('\n')
                  .map(paragraph => paragraph.trim())
                  .filter(Boolean)

                return (
                  <div key={key} className="explanation-section">
                    <h4 className="section-title">{section.title || label}</h4>
                    <div className="section-content">
                      {paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={`${key}-paragraph-${paragraphIndex}`}>{paragraph}</p>
                      ))}
                      {section.bulletPoints && section.bulletPoints.length > 0 && (
                        <ul>
                          {section.bulletPoints.map((point, pointIndex) => (
                            <li key={`${key}-point-${pointIndex}`}>{point}</li>
                          ))}
                        </ul>
                      )}
                      {section.scriptureReferences && section.scriptureReferences.length > 0 && (
                        <div className="section-references">
                          <strong>Scripture References:</strong>
                          <ul>
                            {section.scriptureReferences.map((ref, refIndex) => (
                              <li key={`${key}-ref-${refIndex}`}>{ref}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!explanation && !isLoading && !error && (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>
              {explanationType === 'chapter' 
                ? 'Chapter explanation will appear here' 
                : 'Select verses to see detailed explanations'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExplanationPanel
