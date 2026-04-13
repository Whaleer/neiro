import type { Language } from '../types'

type LanguageToggleProps = {
  language: Language
  onChange: (language: Language) => void
}

const buttonLabels: Record<Language, { fallback: string }> = {
  zh: { fallback: '中文' },
  en: { fallback: 'EN' },
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  const labels: Record<Language, string> = {
    zh: buttonLabels.zh.fallback,
    en: buttonLabels.en.fallback,
  }

  return (
    <div className="language-toggle" aria-label="Language switcher">
      {(['zh', 'en'] as Language[]).map((value) => (
        <button
          key={value}
          type="button"
          className={`lang-button ${language === value ? 'active' : ''}`}
          aria-pressed={language === value}
          onClick={() => onChange(value)}
        >
          {labels[value]}
        </button>
      ))}
    </div>
  )
}
