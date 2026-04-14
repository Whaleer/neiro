import { CIRCLE_OF_FIFTHS_COUNTERCLOCKWISE } from '../lib/music'
import type { CircleOfFifthsNoteRound, GameStatus, NoteName, Translations } from '../types'

type CircleOfFifthsProps = {
  rounds: CircleOfFifthsNoteRound[]
  currentRoundIndex: number
  gameStatus: GameStatus
  onSegmentClick: (note: NoteName) => void
  t: Translations
}

const OUTER_RADIUS = 155
const INNER_RADIUS = 88
const SEGMENT_COUNT = 12
const SEGMENT_ANGLE = (2 * Math.PI) / SEGMENT_COUNT
const GAP = 0.02
const TOP = -Math.PI / 2

function polarToCartesian(angle: number, radius: number): [number, number] {
  return [radius * Math.cos(angle), radius * Math.sin(angle)]
}

function buildArcPath(index: number) {
  const center = TOP - index * SEGMENT_ANGLE
  const startAngle = center + SEGMENT_ANGLE / 2 - GAP
  const endAngle = center - SEGMENT_ANGLE / 2 + GAP

  const [ox1, oy1] = polarToCartesian(startAngle, OUTER_RADIUS)
  const [ox2, oy2] = polarToCartesian(endAngle, OUTER_RADIUS)
  const [ix1, iy1] = polarToCartesian(endAngle, INNER_RADIUS)
  const [ix2, iy2] = polarToCartesian(startAngle, INNER_RADIUS)

  const largeArc = SEGMENT_ANGLE - 2 * GAP > Math.PI ? 1 : 0

  return [
    `M ${ox1} ${oy1}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArc} 0 ${ox2} ${oy2}`,
    `L ${ix1} ${iy1}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 1 ${ix2} ${iy2}`,
    'Z',
  ].join(' ')
}

function getLabelPosition(index: number): [number, number] {
  const midAngle = TOP - index * SEGMENT_ANGLE
  const labelRadius = (OUTER_RADIUS + INNER_RADIUS) / 2
  return polarToCartesian(midAngle, labelRadius)
}

export function CircleOfFifths({ rounds, currentRoundIndex, gameStatus, onSegmentClick, t }: CircleOfFifthsProps) {
  const currentNote = rounds[currentRoundIndex]?.targetNote ?? null
  const clickable = gameStatus === 'active'
  const completedNotes = new Set<NoteName>()
  for (let i = 0; i < currentRoundIndex; i += 1) {
    completedNotes.add(rounds[i]?.targetNote)
  }

  return (
    <section className="circle-of-fifths-panel" aria-label={t.circleOfFifthsLabel}>
      <svg
        className="circle-of-fifths-svg"
        viewBox="-200 -200 400 400"
        role="group"
        aria-label={t.circleOfFifthsLabel}
      >
        {CIRCLE_OF_FIFTHS_COUNTERCLOCKWISE.map((note, index) => {
          const isCurrent = note === currentNote
          const isCompleted = completedNotes.has(note)
          const path = buildArcPath(index)
          const [lx, ly] = getLabelPosition(index)

          let className = 'cof-segment'
          if (isCurrent) className += ' cof-current'
          else if (isCompleted) className += ' cof-completed'
          else className += ' cof-idle'

          return (
            <g key={note}>
              <path
                d={path}
                className={className}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={note}
                onClick={clickable ? () => onSegmentClick(note) : undefined}
                onKeyDown={clickable ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSegmentClick(note)
                  }
                } : undefined}
              />
              <text
                className={`cof-label ${isCurrent ? 'cof-label-current' : ''}`}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                aria-hidden="true"
                pointerEvents="none"
              >
                {note}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}
