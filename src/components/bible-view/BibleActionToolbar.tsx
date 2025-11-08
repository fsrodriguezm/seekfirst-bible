import { useState } from 'react'
import { Copy, Link, BookOpen, Feather, Hash } from 'lucide-react'
import { isSpanishVersion } from '../../utils/versionMap'

interface BibleActionToolbarProps {
  hasSelectedVerses: boolean
  onCopySelectedVerses: () => void
  onToggleExplanation: () => void
  crossReferenceMode: boolean
  onToggleCrossReferences: () => void
  redLetterMode: boolean
  onToggleRedLetterMode: () => void
  onDecreaseFontSize: () => void
  onIncreaseFontSize: () => void
  getButtonRef: (_index: number) => (_element: HTMLButtonElement | null) => void
  selectedBible: string
  showStrongs: boolean
  onToggleStrongs: () => void
}

// Helper function to track events with Google Analytics
const trackEvent = (eventName: string, eventParams?: Record<string, string | number | boolean>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams)
  }
}

const BibleActionToolbar = ({
  hasSelectedVerses,
  onCopySelectedVerses,
  onToggleExplanation,
  crossReferenceMode,
  onToggleCrossReferences,
  redLetterMode,
  onToggleRedLetterMode,
  onDecreaseFontSize,
  onIncreaseFontSize,
  getButtonRef,
  selectedBible,
  showStrongs,
  onToggleStrongs,
}: BibleActionToolbarProps) => {
  const redLetterLabel = isSpanishVersion(selectedBible) ? 'Letras Rojas' : 'Red Letters'
  const strongsLabel = isSpanishVersion(selectedBible) ? 'Números Strong' : 'Strong\'s #'
  const [showExplanation, setShowExplanation] = useState(false)

  const handleAIInsightsClick = () => {
    trackEvent('ai_insights_toggle', {
      action: 'click',
      mode: showExplanation ? 'hide' : 'show'
    })
    setShowExplanation(!showExplanation)
    onToggleExplanation()
  }

  const handleCrossReferencesClick = () => {
    trackEvent('cross_references_toggle', {
      action: 'click',
      mode: crossReferenceMode ? 'hide' : 'show',
    })
    onToggleCrossReferences()
  }

  const handleStrongsToggle = () => {
    trackEvent('strongs_toggle', {
      action: 'click',
      mode: showStrongs ? 'hide' : 'show',
    })
    onToggleStrongs()
  }

  return (
    <div className="action-buttons">
      {hasSelectedVerses && (
        <button
          ref={getButtonRef(1)}
          className="btn btn-accent btn-morphing"
          onClick={onCopySelectedVerses}
          title="Copy selected verses with citations"
          aria-label="Copy selected verses"
        >
          <Copy size={20} />
          <span className="btn-label">Copy Selected</span>
        </button>
      )}

      {/* <button
        ref={getButtonRef(2)}
        className={`btn btn-secondary btn-morphing`}
        onClick={onToggleExplanation}
        disabled
        title="AI Insights feature coming soon"
      >
        <BookOpen size={20} />
        AI Insights (Coming Soon)
      </button> */}

      <button
        ref={getButtonRef(2)}
        className={`btn ${showExplanation ? 'btn-success' : 'btn-primary'} btn-morphing`}
        onClick={handleAIInsightsClick}
        title="Get AI-powered biblical explanations"
        aria-label={showExplanation ? 'Hide explanation' : 'Show AI explanation'}
      >
        <BookOpen size={20} />
        <span className="btn-label">
          {showExplanation ? 'Hide Explanation' : 'AI Explanation'}
        </span>
      </button>

      <button
        ref={getButtonRef(3)}
        className={`btn ${crossReferenceMode ? 'btn-accent' : 'btn-secondary'} btn-morphing`}
        onClick={handleCrossReferencesClick}
        aria-label={crossReferenceMode ? 'Hide cross references' : 'Show cross references'}
      >
        <Link size={20} />
        <span className="btn-label">
          {crossReferenceMode ? 'Hide' : 'Show'} Cross Refs
        </span>
      </button>

      <button
        ref={getButtonRef(6)}
        className={`btn ${redLetterMode ? 'btn-red-letter-active' : 'btn-secondary'} btn-morphing`}
        onClick={onToggleRedLetterMode}
        title="Toggle red letter mode for God's words"
        aria-label={redLetterLabel}
      >
        <Feather
          size={20}
          style={{ color: redLetterMode ? '#dc2626' : 'inherit' }}
        />
        <span
          className="btn-label"
          style={{ color: redLetterMode ? '#dc2626' : 'inherit', fontWeight: 'bold' }}
        >
          {redLetterLabel}
        </span>
      </button>

      <button
        ref={getButtonRef(7)}
        className={`btn ${showStrongs ? 'btn-accent' : 'btn-secondary'} btn-morphing`}
        onClick={handleStrongsToggle}
        title="Toggle Strong's number overlay"
        aria-label={showStrongs ? 'Hide Strong\'s numbers' : 'Show Strong\'s numbers'}
      >
        <Hash size={20} />
        <span className="btn-label">
          {showStrongs ? 'Hide Strong\'s #' : strongsLabel}
        </span>
      </button>

      <button
        ref={getButtonRef(4)}
        className="btn btn-secondary btn-morphing"
        onClick={onDecreaseFontSize}
      >
        A-
      </button>

      <button
        ref={getButtonRef(5)}
        className="btn btn-secondary btn-morphing"
        onClick={onIncreaseFontSize}
      >
        A+
      </button>
    </div>
  )
}

export default BibleActionToolbar
