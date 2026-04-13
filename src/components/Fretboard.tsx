import { getInlayType, MAX_FRET, STANDARD_TUNING } from '../lib/music'
import type { AnswerResult, Question, Translations } from '../types'

type FretboardProps = {
  question: Question | null
  answerResult: AnswerResult | null
  t: Translations
}

const STRING_WEIGHTS = [1, 1.25, 1.5, 2, 2.5, 3]

function getCellClassName(
  stringIndex: number,
  fretIndex: number,
  question: Question | null,
  answerResult: AnswerResult | null,
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

  const isTarget =
    question?.position.stringIndex === stringIndex && question.position.fretIndex === fretIndex

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

export function Fretboard({ question, answerResult, t }: FretboardProps) {
  const targetStringIndex = question?.position.stringIndex ?? -1

  return (
    <section className="fretboard-panel">
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
                return (
                  <div
                    key={`${stringIndex}-${fretIndex}`}
                    className={getCellClassName(stringIndex, fretIndex, question, answerResult)}
                    aria-label={`${t.string} ${stringIndex + 1}, ${fretIndex === 0 ? t.openString : `${t.fret} ${fretIndex}`}`}
                  >
                    <div className="fret-marker" aria-hidden="true" />
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
