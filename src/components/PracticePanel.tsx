import { getAccuracy } from '../lib/music'
import type { PracticeStats, Question, Translations } from '../types'

type GameStatus = 'idle' | 'active' | 'answered'

type PracticePanelProps = {
  gameStatus: GameStatus
  stats: PracticeStats
  question: Question | null
  onStart: () => void
  onNext: () => void
  t: Translations
}

export function PracticePanel({
  gameStatus,
  stats,
  question,
  onStart,
  onNext,
  t,
}: PracticePanelProps) {
  const accuracy = getAccuracy(stats)

  const targetLabel = question
    ? `${t.string} ${question.position.stringIndex + 1} · ${question.position.fretIndex === 0 ? t.openString : `${t.fret} ${question.position.fretIndex}`}`
    : '—'

  return (
    <section className="control-bar">
      {gameStatus === 'idle' ? (
        <button className="primary-button" type="button" onClick={onStart}>
          {t.startButton}
        </button>
      ) : (
        <button className="primary-button" type="button" onClick={onNext} disabled={gameStatus === 'active'}>
          {t.nextButton}
        </button>
      )}

      <div className="stats-row">
        <div className="stat-chip">
          <span className="stat-value">{stats.correct} / {stats.total}</span>
          <span className="stat-label">{t.scoreLabel}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">{t.accuracyLabel}</span>
        </div>
        {question && (
          <div className="stat-chip target-chip">
            <span className="stat-value">{targetLabel}</span>
            <span className="stat-label">{t.targetLabel}</span>
          </div>
        )}
      </div>
    </section>
  )
}
