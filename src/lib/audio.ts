import type { FretPosition } from '../types'

type SoundName = 'wrong' | 'celebration'

type SoundConfig = {
  src: string
  volume: number
}

const SOUND_CONFIG: Record<SoundName, SoundConfig> = {
  wrong: {
    src: '/sounds/wrong.mp3',
    volume: 0.35,
  },
  celebration: {
    src: '/sounds/celebration.mp3',
    volume: 0.5,
  },
}

const soundCache = new Map<SoundName, HTMLAudioElement>()
const fretNoteCache = new Map<string, HTMLAudioElement>()
let soundEnabled = true

function getAudio(name: SoundName) {
  const cachedAudio = soundCache.get(name)
  if (cachedAudio) {
    return cachedAudio
  }

  const { src, volume } = SOUND_CONFIG[name]
  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.volume = volume
  soundCache.set(name, audio)
  return audio
}

export function getFretNoteSrc(position: FretPosition) {
  return `/sounds/notes/string-${position.stringIndex + 1}-fret-${position.fretIndex}.mp3`
}

function getFretNoteAudio(position: FretPosition) {
  const src = getFretNoteSrc(position)
  const cachedAudio = fretNoteCache.get(src)
  if (cachedAudio) {
    return cachedAudio
  }

  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.volume = 0.45
  fretNoteCache.set(src, audio)
  return audio
}

function playAudio(audio: HTMLAudioElement) {
  audio.currentTime = 0
  void audio.play().catch(() => {})
}

export function playSound(name: SoundName) {
  if (!soundEnabled) {
    return
  }

  try {
    playAudio(getAudio(name))
  } catch {
    // Ignore playback failures while sound assets are missing or blocked.
  }
}

export function playFretNote(position: FretPosition) {
  if (!soundEnabled || position.fretIndex < 1) {
    return
  }

  try {
    playAudio(getFretNoteAudio(position))
  } catch {
    // Ignore playback failures while note assets are missing or blocked.
  }
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled
}

export type { SoundName }
