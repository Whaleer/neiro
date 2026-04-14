import { getInlayType, getNoteAtPosition, getPositionKey, MAX_FRET, STANDARD_TUNING } from '../lib/music'
import type { AnswerResult, ClickableFretState, FretPosition, PracticeMode, Question, Translations } from '../types'

type FretboardProps = {
  mode: PracticeMode
  question: Question | null
  answerResult: AnswerResult | null
  welcomeMode?: boolean
  onCellClick?: (position: FretPosition) => void
  getClickableState?: (position: FretPosition) => ClickableFretState
  t: Translations
}

const STRING_WEIGHTS = [1, 1.25, 1.5, 2, 2.5, 3]

const NOTE_COLOR_MAP: Record<string, string> = {
  C: '#DC9B9B',
  bD: '#C4A7D7',
  D: '#E8B87E',
  bE: '#D4C98A',
  E: '#7DB8A0',
  F: '#7DB8B0',
  bG: '#8BAAC4',
  G: '#B8A0C8',
  bA: '#A0B878',
  A: '#D4A08E',
  bB: '#9BB5D0',
  B: '#A0C4B8',
}

const CENTER_STRING = 2.5
const CENTER_FRET = 6

function getWaveDelay(stringIndex: number, fretIndex: number): string {
  const dx = fretIndex - CENTER_FRET
  const dy = stringIndex - CENTER_STRING
  const distance = Math.sqrt(dx * dx + dy * dy)
  return `${(distance * 0.12).toFixed(2)}s`
}

function getCellClassName(
  mode: PracticeMode,
  stringIndex: number,
  fretIndex: number,
  question: Question | null,
  answerResult: AnswerResult | null,
  clickableState?: ClickableFretState,
) {
  const classNames = ['fret-cell']

  if (stringIndex === 0) {
    classNames.push('first-string')
  }

  if (stringIndex === STANDARD_TUNING.length - 1) {
    classNames.push('last-string')
  }

  if (fretIndex === 0) {
    classNames.push('open-string')
  }

  if (fretIndex === MAX_FRET) {
    classNames.push('last-fret')
  }

  if (mode === 'find-all-note-positions' && fretIndex >= 1) {
    classNames.push('is-clickable')
  }

  if (clickableState?.isFound) {
    classNames.push('is-found')
  }

  if (clickableState?.isMistake) {
    classNames.push('has-mistake')
  }

  const isTarget = mode === 'identify-note-name'
    && question?.position.stringIndex === stringIndex
    && question.position.fretIndex === fretIndex

  if (isTarget) {
    if (!answerResult) {
      classNames.push('is-target')
    } else if (answerResult.isCorrect) {
      classNames.push('is-correct')
    } else {
      classNames.push('is-incorrect')
    }
  }

  return classNames.join(' ')
}

function getInlayForCell(stringIndex: number, fretIndex: number): string {
  const type = getInlayType(fretIndex)
  if (type === 'none') return 'none'
  if (type === 'single' && stringIndex === 2) return 'single'
  if (type === 'double' && (stringIndex === 1 || stringIndex === 3)) return 'single'
  return 'none'
}

export function Fretboard({ mode, question, answerResult, welcomeMode, onCellClick, getClickableState, t }: FretboardProps) {
  const targetStringIndex = question?.position.stringIndex ?? -1

  return (
    <section className={`fretboard-panel${welcomeMode ? ' welcome-active' : ''}`}>
      <div className="fretboard-scroll">
        <div className="fretboard" role="img" aria-label={t.boardTitle}>
          <div className="fret-label-row" aria-hidden="true">
            <div />
            {Array.from({ length: MAX_FRET + 1 }, (_, fretIndex) => (
              <div key={fretIndex} className="fret-label">
                {fretIndex === 0 ? t.openString : fretIndex}
              </div>
            ))}
          </div>

          {STANDARD_TUNING.map((openNote, stringIndex) => (
            <div
              key={`${openNote}-${stringIndex}`}
              className={`string-row${stringIndex === targetStringIndex ? ' has-target' : ''}`}
              style={{ '--string-weight': `${STRING_WEIGHTS[stringIndex]}px` } as React.CSSProperties}
            >
              <div className="string-label">{openNote}</div>
              {Array.from({ length: MAX_FRET + 1 }, (_, fretIndex) => {
                const inlayType = getInlayForCell(stringIndex, fretIndex)
                const position = { stringIndex, fretIndex }
                const clickableState = getClickableState?.(position)
                const canClick = mode === 'find-all-note-positions' && fretIndex >= 1 && clickableState?.isClickable
                const isFound = clickableState?.isFound ?? false
                const showWelcome = welcomeMode && fretIndex >= 1
                const welcomeNote = showWelcome ? getNoteAtPosition(position) : null
                return (
                  <div
                    key={getPositionKey(position)}
                    className={getCellClassName(mode, stringIndex, fretIndex, question, answerResult, clickableState)}
                    aria-label={`${t.string} ${stringIndex + 1}, ${fretIndex === 0 ? t.openString : `${t.fret} ${fretIndex}`}`}
                    role={canClick ? 'button' : undefined}
                    tabIndex={canClick ? 0 : undefined}
                    onClick={canClick ? () => onCellClick?.(position) : undefined}
                    onKeyDown={canClick ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onCellClick?.(position)
                      }
                    } : undefined}
                  >
                    {showWelcome && welcomeNote ? (
                      <div
                        className="welcome-dot"
                        style={{
                          '--dot-color': NOTE_COLOR_MAP[welcomeNote] ?? '#8B9A8E',
                          '--wave-delay': getWaveDelay(stringIndex, fretIndex),
                        } as React.CSSProperties}
                        aria-hidden="true"
                      >
                        <span className="welcome-dot-label">{welcomeNote}</span>
                      </div>
                    ) : (
                      <div className="fret-marker" aria-hidden="true" />
                    )}
                    {mode === 'find-all-note-positions' && isFound && (
                      <div className="fret-found-label" aria-hidden="true">
                        {getNoteAtPosition(position)}
                      </div>
                    )}
                    {inlayType !== 'none' && (
                      <div className={`inlay-marker ${inlayType}`} aria-hidden="true" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
