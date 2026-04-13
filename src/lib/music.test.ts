import { describe, expect, it } from 'vitest'
import {
  MAX_FRET,
  MIN_PRACTICE_FRET,
  TOTAL_PRACTICE_POSITIONS,
  createPracticeQuestions,
  createQuestion,
  getAccuracy,
  getNoteAtPosition,
} from './music'

describe('music helpers', () => {
  it('calculates note names across the fretboard', () => {
    expect(getNoteAtPosition({ stringIndex: 0, fretIndex: 0 })).toBe('E')
    expect(getNoteAtPosition({ stringIndex: 0, fretIndex: 1 })).toBe('F')
    expect(getNoteAtPosition({ stringIndex: 1, fretIndex: 2 })).toBe('bD')
    expect(getNoteAtPosition({ stringIndex: 4, fretIndex: 3 })).toBe('C')
    expect(getNoteAtPosition({ stringIndex: 5, fretIndex: 12 })).toBe('E')
  })

  it('creates a question from a specific position', () => {
    const question = createQuestion({ stringIndex: 3, fretIndex: 7 })

    expect(question.position.stringIndex).toBe(3)
    expect(question.position.fretIndex).toBe(7)
    expect(question.correctNote).toBe(getNoteAtPosition(question.position))
  })

  it('creates 72 unique practice questions from fret 1 to fret 12', () => {
    const questions = createPracticeQuestions()

    expect(questions).toHaveLength(TOTAL_PRACTICE_POSITIONS)
    expect(new Set(questions.map((question) => `${question.position.stringIndex}-${question.position.fretIndex}`)).size)
      .toBe(TOTAL_PRACTICE_POSITIONS)

    for (const question of questions) {
      expect(question.position.stringIndex).toBeGreaterThanOrEqual(0)
      expect(question.position.stringIndex).toBeLessThanOrEqual(5)
      expect(question.position.fretIndex).toBeGreaterThanOrEqual(MIN_PRACTICE_FRET)
      expect(question.position.fretIndex).toBeLessThanOrEqual(MAX_FRET)
    }
  })

  it('returns rounded accuracy', () => {
    expect(getAccuracy({ correct: 0, total: 0 })).toBe(0)
    expect(getAccuracy({ correct: 3, total: 4 })).toBe(75)
  })
})
