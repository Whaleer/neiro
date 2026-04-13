import type { Translations } from '../types'

type SoundToggleProps = {
  enabled: boolean
  onToggle: () => void
  t: Translations
}

export function SoundToggle({ enabled, onToggle, t }: SoundToggleProps) {
  return (
    <button
      type="button"
      className={`sound-toggle ${enabled ? 'enabled' : 'muted'}`}
      aria-label={t.soundToggleLabel}
      aria-pressed={enabled}
      onClick={onToggle}
    >
      <span className="sound-toggle-icon" aria-hidden="true">
        {enabled ? '♪' : '×'}
      </span>
      <span className="sound-toggle-text">{enabled ? t.soundOn : t.soundOff}</span>
    </button>
  )
}
