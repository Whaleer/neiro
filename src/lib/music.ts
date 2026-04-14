import type { CircleOfFifthsNoteRound, FretPosition, NoteName, Question, TuningNote } from '../types'

export const NOTE_SEQUENCE: NoteName[] = ['C', 'bD', 'D', 'bE', 'E', 'F', 'bG', 'G', 'bA', 'A', 'bB', 'B']
export const STANDARD_TUNING: TuningNote[] = ['E', 'B', 'G', 'D', 'A', 'E']
export const CIRCLE_OF_FIFTHS_COUNTERCLOCKWISE: NoteName[] = ['C', 'F', 'bB', 'bE', 'bA', 'bD', 'bG', 'B', 'E', 'A', 'D', 'G']
export const MAX_FRET = 12
export const MIN_PRACTICE_FRET = 1
export const TOTAL_PRACTICE_POSITIONS = STANDARD_TUNING.length * MAX_FRET

export function getNoteAtPosition(position: FretPosition): NoteName {
  const openStringNote = STANDARD_TUNING[position.stringIndex]
  const openNoteIndex = NOTE_SEQUENCE.indexOf(openStringNote)
  return NOTE_SEQUENCE[(openNoteIndex + position.fretIndex) % NOTE_SEQUENCE.length]
}

export function createQuestion(position: FretPosition): Question {
  return {
    id: `${position.stringIndex}-${position.fretIndex}-${crypto.randomUUID()}`,
    position,
    correctNote: getNoteAtPosition(position),
  }
}

export function createPracticeQuestions() {
  const positions: FretPosition[] = []

  for (let stringIndex = 0; stringIndex < STANDARD_TUNING.length; stringIndex += 1) {
    for (let fretIndex = MIN_PRACTICE_FRET; fretIndex <= MAX_FRET; fretIndex += 1) {
      positions.push({ stringIndex, fretIndex })
    }
  }

  for (let index = positions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = positions[index]
    positions[index] = positions[randomIndex]
    positions[randomIndex] = current
  }

  return positions.map((position) => createQuestion(position))
}

export function getPositionKey(position: FretPosition) {
  return `${position.stringIndex}-${position.fretIndex}`
}

export function getPositionsForNote(note: NoteName) {
  const positions: FretPosition[] = []

  for (let stringIndex = 0; stringIndex < STANDARD_TUNING.length; stringIndex += 1) {
    for (let fretIndex = MIN_PRACTICE_FRET; fretIndex <= MAX_FRET; fretIndex += 1) {
      const position = { stringIndex, fretIndex }
      if (getNoteAtPosition(position) === note) {
        positions.push(position)
      }
    }
  }

  return positions
}

export function createCircleOfFifthsRounds(): CircleOfFifthsNoteRound[] {
  return CIRCLE_OF_FIFTHS_COUNTERCLOCKWISE.map((targetNote) => ({
    targetNote,
    targetPositions: getPositionsForNote(targetNote),
  }))
}

export function getAccuracy(stats: { correct: number; total: number }) {
  if (stats.total === 0) {
    return 0
  }

  return Math.round((stats.correct / stats.total) * 100)
}

export function getInlayType(fretIndex: number) {
  if (fretIndex === 12) {
    return 'double'
  }

  if ([3, 5, 7, 9].includes(fretIndex)) {
    return 'single'
  }

  return 'none'
}
