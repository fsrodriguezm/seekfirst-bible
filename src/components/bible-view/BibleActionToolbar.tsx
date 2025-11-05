import { Copy, Link, BookOpen } from 'lucide-react'
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
}: BibleActionToolbarProps) => {
  const redLetterLabel = isSpanishVersion(selectedBible) ? 'Letras Rojas' : 'Red Letters'

  return (
    <div className="action-buttons">
      {hasSelectedVerses && (
        <button
          ref={getButtonRef(1)}
          className="btn btn-accent btn-morphing"
          onClick={onCopySelectedVerses}
          title="Copy selected verses with citations"
        >
          <Copy size={20} />
          Copy Selected
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
        className={`btn btn-primary btn-morphing`}
        onClick={onToggleExplanation}
        title="Get AI-powered biblical explanations"
      >
        <BookOpen size={20} />
        AI Insights
      </button>

      <button
        ref={getButtonRef(3)}
        className={`btn ${crossReferenceMode ? 'btn-accent' : 'btn-secondary'} btn-morphing`}
        onClick={onToggleCrossReferences}
      >
        <Link size={20} />
        {crossReferenceMode ? 'Hide' : 'Show'} Cross Refs
      </button>

      <button
        ref={getButtonRef(6)}
        className={`btn ${redLetterMode ? 'btn-red-letter-active' : 'btn-secondary'} btn-morphing`}
        onClick={onToggleRedLetterMode}
        title="Toggle red letter mode for God's words"
      >
        <span style={{ color: redLetterMode ? '#dc2626' : 'inherit', fontWeight: 'bold' }}>
          {redLetterLabel}
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
