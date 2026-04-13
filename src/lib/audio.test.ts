import { describe, expect, it, vi } from 'vitest'
import { getFretNoteSrc, playFretNote, playSound, setSoundEnabled } from './audio'

describe('audio helpers', () => {
  it('builds the correct fret-note asset path', () => {
    expect(getFretNoteSrc({ stringIndex: 0, fretIndex: 1 })).toBe('/sounds/notes/string-1-fret-1.mp3')
    expect(getFretNoteSrc({ stringIndex: 2, fretIndex: 7 })).toBe('/sounds/notes/string-3-fret-7.mp3')
    expect(getFretNoteSrc({ stringIndex: 5, fretIndex: 12 })).toBe('/sounds/notes/string-6-fret-12.mp3')
  })

  it('does not throw when sound playback fails or assets are missing', () => {
    const playSpy = vi.spyOn(globalThis.Audio.prototype, 'play').mockRejectedValue(new Error('missing'))

    expect(() => playSound('wrong')).not.toThrow()
    expect(() => playFretNote({ stringIndex: 1, fretIndex: 4 })).not.toThrow()
    expect(playSpy).toHaveBeenCalledTimes(2)
  })

  it('respects the global sound enabled flag', () => {
    const playSpy = vi.spyOn(globalThis.Audio.prototype, 'play')

    setSoundEnabled(false)
    playSound('celebration')
    playFretNote({ stringIndex: 4, fretIndex: 9 })

    expect(playSpy).not.toHaveBeenCalled()

    setSoundEnabled(true)
    playSound('wrong')

    expect(playSpy).toHaveBeenCalledTimes(1)
  })

  it('skips unsupported open-string fret note playback', () => {
    const playSpy = vi.spyOn(globalThis.Audio.prototype, 'play')

    playFretNote({ stringIndex: 0, fretIndex: 0 })

    expect(playSpy).not.toHaveBeenCalled()
  })
})
