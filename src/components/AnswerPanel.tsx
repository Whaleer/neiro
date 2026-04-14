import { NOTE_SEQUENCE } from '../lib/music'
import type { AnswerResult, NoteName, Translations } from '../types'

type AnswerPanelProps = {
  disabled: boolean
  onSelect: (note: NoteName) => void
  answerResult: AnswerResult | null
  t: Translations
}

function getButtonClass(note: NoteName, answerResult: AnswerResult | null) {
  const base = 'note-button'
  if (!answerResult) return base
  if (note === answerResult.selectedNote && answerResult.isCorrect) return `${base} is-correct`
  if (note === answerResult.selectedNote && !answerResult.isCorrect) return `${base} is-incorrect`
  if (note === answerResult.correctNote && !answerResult.isCorrect) return `${base} is-reveal`
  return base
}

export function AnswerPanel({ disabled, onSelect, answerResult, t }: AnswerPanelProps) {
  return (
    <section className="answer-panel">
      <p className="answer-label">{t.answerTitle}</p>
      <div className="answer-grid">
        {NOTE_SEQUENCE.map((note) => (
          <button
            key={note}
            className={getButtonClass(note, answerResult)}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(note)}
          >
            <span className="note-button-label">{note}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
