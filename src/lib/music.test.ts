import { describe, expect, it, vi } from 'vitest'
import { createQuestion, getAccuracy, getNoteAtPosition, MAX_FRET } from './music'

describe('music helpers', () => {
  it('calculates note names across the fretboard', () => {
    expect(getNoteAtPosition({ stringIndex: 0, fretIndex: 0 })).toBe('E')
    expect(getNoteAtPosition({ stringIndex: 0, fretIndex: 1 })).toBe('F')
    expect(getNoteAtPosition({ stringIndex: 1, fretIndex: 2 })).toBe('bD')
    expect(getNoteAtPosition({ stringIndex: 4, fretIndex: 3 })).toBe('C')
    expect(getNoteAtPosition({ stringIndex: 5, fretIndex: 12 })).toBe('E')
  })

  it('creates questions inside the supported range', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockReturnValueOnce(0.51).mockReturnValueOnce(0.99)

    const question = createQuestion()

    expect(question.position.stringIndex).toBeGreaterThanOrEqual(0)
    expect(question.position.stringIndex).toBeLessThanOrEqual(5)
    expect(question.position.fretIndex).toBeGreaterThanOrEqual(0)
    expect(question.position.fretIndex).toBeLessThanOrEqual(MAX_FRET)
    expect(question.correctNote).toBe(getNoteAtPosition(question.position))

    randomSpy.mockRestore()
  })

  it('returns rounded accuracy', () => {
    expect(getAccuracy({ correct: 0, total: 0 })).toBe(0)
    expect(getAccuracy({ correct: 3, total: 4 })).toBe(75)
  })
})
