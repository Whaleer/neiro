import type { PracticeMode, Translations } from '../types'

type ModeToggleProps = {
  mode: PracticeMode
  onChange: (mode: PracticeMode) => void
  t: Translations
}

const MODES: PracticeMode[] = ['identify-note-name', 'find-all-note-positions']

export function ModeToggle({ mode, onChange, t }: ModeToggleProps) {
  const labels: Record<PracticeMode, string> = {
    'identify-note-name': t.modeIdentify,
    'find-all-note-positions': t.modeFindAll,
  }

  return (
    <div className="mode-toggle" aria-label={t.modeSwitcherLabel}>
      {MODES.map((value) => (
        <button
          key={value}
          type="button"
          className={`mode-button ${mode === value ? 'active' : ''}`}
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
        >
          {labels[value]}
        </button>
      ))}
    </div>
  )
}
