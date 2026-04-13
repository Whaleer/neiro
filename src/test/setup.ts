import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { setSoundEnabled } from '../lib/audio'

class MockAudio {
  currentTime = 0
  preload = 'auto'
  volume = 1
  src: string

  constructor(src: string) {
    this.src = src
  }

  play() {
    return Promise.resolve()
  }
}

Object.defineProperty(globalThis, 'Audio', {
  writable: true,
  value: MockAudio,
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  setSoundEnabled(true)
  cleanup()
})
