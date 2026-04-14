import { getAccuracy } from '../lib/music'
import type { GameStatus, PracticeMode, PracticeStats, Question, Translations } from '../types'

type PracticePanelProps = {
  gameStatus: GameStatus
  mode: PracticeMode
  stats: PracticeStats
  question: Question | null
  targetLabel: string | null
  onStart: () => void
  onNext: () => void
  t: Translations
}

export function PracticePanel({
  gameStatus,
  mode,
  stats,
  question,
  targetLabel,
  onStart,
  onNext,
  t,
}: PracticePanelProps) {
  const accuracy = getAccuracy(stats)

  const defaultTargetLabel = question
    ? `${t.string} ${question.position.stringIndex + 1} · ${question.position.fretIndex === 0 ? t.openString : `${t.fret} ${question.position.fretIndex}`}`
    : '—'
  const displayTargetLabel = targetLabel ?? defaultTargetLabel
  const showActionButton = mode === 'identify-note-name' || gameStatus === 'idle' || gameStatus === 'completed'
  const actionDisabled = mode === 'identify-note-name' && gameStatus === 'active'

  return (
    <section className="control-bar">
      {showActionButton && (
        gameStatus === 'idle' || gameStatus === 'completed' ? (
          <button className="primary-button" type="button" onClick={onStart}>
            {gameStatus === 'completed' ? t.restartButton : t.startButton}
          </button>
        ) : (
          <button className="primary-button" type="button" onClick={onNext} disabled={actionDisabled}>
            {t.nextButton}
          </button>
        )
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
        {displayTargetLabel && (
          <div className="stat-chip target-chip">
            <span className="stat-value">{displayTargetLabel}</span>
            <span className="stat-label">{t.targetLabel}</span>
          </div>
        )}
      </div>
    </section>
  )
}
