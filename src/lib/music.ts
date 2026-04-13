import type { FretPosition, NoteName, Question, TuningNote } from '../types'

export const NOTE_SEQUENCE: NoteName[] = ['C', 'bD', 'D', 'bE', 'E', 'F', 'bG', 'G', 'bA', 'A', 'bB', 'B']
export const STANDARD_TUNING: TuningNote[] = ['E', 'B', 'G', 'D', 'A', 'E']
export const MAX_FRET = 12

export function getNoteAtPosition(position: FretPosition): NoteName {
  const openStringNote = STANDARD_TUNING[position.stringIndex]
  const openNoteIndex = NOTE_SEQUENCE.indexOf(openStringNote)
  return NOTE_SEQUENCE[(openNoteIndex + position.fretIndex) % NOTE_SEQUENCE.length]
}

export function createQuestion(): Question {
  const position = {
    stringIndex: Math.floor(Math.random() * STANDARD_TUNING.length),
    fretIndex: Math.floor(Math.random() * (MAX_FRET + 1)),
  }

  return {
    id: `${position.stringIndex}-${position.fretIndex}-${crypto.randomUUID()}`,
    position,
    correctNote: getNoteAtPosition(position),
  }
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
