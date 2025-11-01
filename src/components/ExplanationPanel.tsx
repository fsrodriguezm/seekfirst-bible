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
}

const ExplanationPanel = ({
  selectedVerses,
  currentChapter,
  allVerses,
  fontSize = 16,
  language = 'english'
}: ExplanationPanelProps): JSX.Element => {
  const [explanation, setExplanation] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [explanationType, setExplanationType] = useState<'chapter' | 'verses'>('chapter')

  const makeAPICall = useCallback(async (systemContent: string, userPrompt: string) => {
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

    const data: { content?: string; error?: string } = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    if (data.content) {
      setExplanation(data.content)
    } else {
      throw new Error('Unexpected response format from API')
    }
  }, [])

  const fetchChapterExplanationViaVersesFunction = useCallback(async (chapterReference: string) => {
    setIsLoading(true)
    setError('')

    try {
  const langInstruction = language === 'spanish' ? 'Responde en español.' : 'Respond in English.'

  const systemContent = `${langInstruction} You are a Bible expositor who explains Scripture using precise grammatical-historical exegesis. 
Your method is rooted in the original Hebrew or Greek, the literary and covenantal context of the passage, 
and cross-referencing other parts of Scripture. You do not include commentary from theologians, denominations, 
or church tradition. You must explain the original intent of the passage as it would have been understood by 
its first recipients.

Always structure your response using the following sections:
1. Context – Historical and narrative background of the chapter.
2. Original Language – Provide key original Greek or Hebrew insights and important terms from the chapter.
3. Word Study – Define key terms using Strong's Concordance, and show where else those words appear in Scripture.
4. Explanation – Pull together the above insights to explain the chapter clearly.
5. Cross-References – List related Scriptures that help clarify the meaning.
6. Application – (Optional) State a principle or insight for today's believer, only if it directly follows from the meaning.
7. Reflection / Questions – Invite the reader to think critically about the passage.`

  const userPrompt = `${langInstruction} Please exegete and explain the following chapter using the 7-section format:\n\n${chapterReference}`

      await makeAPICall(systemContent, userPrompt)
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

    try {
      const joinedVerses = selectedVerses.join('\n')
      
  const langInstruction = language === 'spanish' ? 'Responde en español.' : 'Respond in English.'

  const systemContent = `${langInstruction} You are a Bible expositor who explains Scripture using precise grammatical-historical exegesis. 
Your method is rooted in the original Hebrew or Greek, the literary and covenantal context of the passage, 
and cross-referencing other parts of Scripture. You do not include commentary from theologians, denominations, 
or church tradition. You must explain the original intent of the passage as it would have been understood by 
its first recipients.

Always structure your response using the following sections:
1. Context – Historical and narrative background of the verse.
2. Original Language – Provide the original Greek or Hebrew, a literal translation, and key grammatical/lexical insights.
3. Word Study – Define key terms using Strong's Concordance, and show where else those words appear in Scripture.
4. Explanation – Pull together the above insights to explain the verse clearly.
5. Cross-References – List related Scriptures that help clarify the meaning.
6. Application – (Optional) State a principle or insight for today's believer, only if it directly follows from the meaning.
7. Reflection / Questions – Invite the reader to think critically about the passage.`

  const userPrompt = `${langInstruction} Please exegete and explain the following verse(s) using the 7-section format:\n\n${joinedVerses}`

      await makeAPICall(systemContent, userPrompt)
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
    if (typeof navigator === 'undefined' || !navigator.clipboard) return

    navigator.clipboard.writeText(explanation).then(() => {
      if (typeof window !== 'undefined') {
        alert('Explanation copied to clipboard!')
      }
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  const replaceAsterisksWithBullets = (text: string) => {
    return text.replace(/^\*\s/gm, '• ')
  }

  const parseExplanationSections = (text: string): ExplanationSection[] => {
    const sections: ExplanationSection[] = []
    const lines = replaceAsterisksWithBullets(text).split('\n')
    let currentTitle = ''
    let currentContent = ''

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detect section titles based on the **<section>** pattern
      const sectionMatch = trimmedLine.match(/^\*\*\d+\.\s(.+?)\*\*$/);
      if (sectionMatch) {
        if (currentTitle && currentContent) {
          sections.push({
            title: currentTitle,
            content: currentContent.trim(),
          })
        }
        currentTitle = sectionMatch[1] // Extract the section title
        currentContent = ''
      } else if (trimmedLine && currentTitle) {
        if (currentContent) currentContent += '\n'
        currentContent += trimmedLine
      }
    }

    if (currentTitle && currentContent) {
      sections.push({
        title: currentTitle,
        content: currentContent.trim(),
      })
    }

    if (sections.length === 0 && text) {
      sections.push({
        title: explanationType === 'chapter' ? 'Chapter Overview' : 'Explanation',
        content: text.trim(),
      })
    }

    return sections
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
              {parseExplanationSections(explanation).map((section, index) => (
                <div key={index} className="explanation-section">
                  <h4 className="section-title">{section.title}</h4>
                  <div className="section-content">{section.content}</div>
                </div>
              ))}
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
